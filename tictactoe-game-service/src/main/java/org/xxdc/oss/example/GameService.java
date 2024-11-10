package org.xxdc.oss.example;

import io.micrometer.core.instrument.MeterRegistry;
import io.quarkus.grpc.GrpcService;
// https://quarkus.io/guides/logging
import io.quarkus.logging.Log;
import io.smallrye.mutiny.Multi;
import io.smallrye.mutiny.Uni;
import io.smallrye.mutiny.operators.multi.processors.BroadcastProcessor;
import io.smallrye.mutiny.operators.multi.processors.UnicastProcessor;
import jakarta.inject.Inject;
import java.time.Duration;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.atomic.AtomicInteger;
import org.xxdc.oss.example.bot.BotStrategy;
import org.xxdc.oss.example.service.Board;
import org.xxdc.oss.example.service.GameMoveRequest;
import org.xxdc.oss.example.service.GameMoveResponse;
import org.xxdc.oss.example.service.GameUpdate;
import org.xxdc.oss.example.service.JoinRequest;
import org.xxdc.oss.example.service.JoinResponse;
import org.xxdc.oss.example.service.Player;
import org.xxdc.oss.example.service.State;
import org.xxdc.oss.example.service.State.Builder;
import org.xxdc.oss.example.service.SubscriptionRequest;
import org.xxdc.oss.example.service.TicTacToeGame;

@GrpcService
public class GameService implements TicTacToeGame {

  @Inject private MeterRegistry registry;

  private final GameManager gameManager = new GameManager();

  // TODO: split the game-manager-service and the game-service
  static class GameManager {

    static {
      // Disable native game board
      GameBoard.useNative.set(false);
    }

    /** Incoming queue of game requests */
    private final ConcurrentLinkedQueue<JoinRequest> requestQueue = new ConcurrentLinkedQueue<>();

    /** Map of unfulfilled game requests x notifier (unicaster) */
    private final ConcurrentHashMap<JoinRequest, UnicastProcessor<JoinResponse>>
        unicasterByRequest = new ConcurrentHashMap<>();

    /** Map of active games by game id */
    private final ConcurrentHashMap<String, Game> activeGamesById = new ConcurrentHashMap<>();

    /** Map of games x notifier (broadcaster) */
    private final ConcurrentHashMap<String, BroadcastProcessor<GameUpdate>> gameBroadcasterById =
        new ConcurrentHashMap<>();

    private final ConcurrentHashMap<String, Multi<GameUpdate>> gameUpdatesById =
        new ConcurrentHashMap<>();

    /** Game id number generator */
    private final AtomicInteger gameIdCounter = new AtomicInteger();

    public Uni<JoinResponse> makeMatchFor(JoinRequest request) {
      Log.infov("Received a join request {0}", request);
      return Uni.createFrom()
          .emitter(
              emitter -> {
                if (requestQueue.isEmpty()) {
                  Log.infov("Waiting for a match for request {0}", request);
                  var unicaster = UnicastProcessor.<JoinResponse>create();
                  unicasterByRequest.put(request, unicaster);
                  requestQueue.offer(request);
                  unicaster
                      .ifNoItem()
                      .after(Duration.ofSeconds(5))
                      .recoverWithMulti(
                          () -> {
                            Log.infov("Creating a bot player for request {0}", request);
                            requestQueue.remove(request);
                            unicasterByRequest.remove(request);
                            return makeBotMatchFor(request);
                          })
                      .subscribe()
                      .with(emitter::complete, emitter::fail, () -> {});
                } else {
                  Log.infov("Found a match for request {0}", request);
                  var otherRequest = requestQueue.poll();

                  var game = createAndRegisterGame(request, otherRequest);
                  var gameUpdate = buildGameUpdate(game);

                  var response =
                      JoinResponse.newBuilder()
                          .setMessage(otherRequest.getName() + " VS. " + request.getName())
                          .setAssignedPlayer(Player.newBuilder().setMarker("O").setIndex(1).build())
                          .setInitialUpdate(gameUpdate)
                          .build();

                  // my response
                  emitter.complete(response);

                  // their response
                  var otherResponse =
                      JoinResponse.newBuilder()
                          .setMessage(otherRequest.getName() + " VS. " + request.getName())
                          .setAssignedPlayer(Player.newBuilder().setMarker("X").setIndex(0).build())
                          .setInitialUpdate(gameUpdate)
                          .build();
                  var otherRequestUnicaster = unicasterByRequest.remove(otherRequest);
                  otherRequestUnicaster.onNext(otherResponse);
                  otherRequestUnicaster.onComplete();
                }
              });
    }

    public Multi<JoinResponse> makeBotMatchFor(JoinRequest request) {
      var response = buildJoinResponse(request, createAndRegisterGame(request));
      var opponent =
          Multi.createFrom()
              .emitter(
                  emitter -> {
                    var gameId = response.getInitialUpdate().getGameId();
                    var gameBroadcaster = gameBroadcasterById.get(gameId);
                    gameBroadcaster
                        .subscribe()
                        .with(
                            (gameUpdate) -> {
                              Log.infov("Received a game update {0}", gameUpdate);
                              var gameState = fromServiceGameState(gameUpdate.getState());
                              if (gameState.isTerminal()) {
                                Log.infov("Game is over.");
                                emitter.complete();
                              } else if (gameUpdate.getState().getCurrentPlayerIndex() == 1) {
                                // TODO: remove the hardcoding
                                Log.infov("Making a move.");
                                var bot = BotStrategy.MINIMAX;
                                int move = bot.applyAsInt(gameState);
                                makeMove(
                                        GameMoveRequest.newBuilder()
                                            .setGameId(gameId)
                                            .setPlayer(
                                                Player.newBuilder().setMarker("O").setIndex(1))
                                            .setMove(move)
                                            .build())
                                    .subscribe()
                                    .with((_) -> {});
                              }
                            },
                            (_) -> {},
                            () -> {});
                  });
      return Multi.createFrom()
          .item(response)
          .invoke(
              () -> {
                opponent.subscribe().with((_) -> {});
              });
    }

    public Uni<GameMoveResponse> makeMove(GameMoveRequest request) {
      Log.infov("Received a move request {0}", request);
      var game = getActiveGame(request.getGameId());
      if (game == null) {
        return Uni.createFrom().failure(new RuntimeException("Game not found"));
      }
      return Uni.createFrom()
          .item(request)
          .onItem()
          .transform(
              r -> {
                var state = game.state();
                // TODO: validate the player and everything before making the move
                Log.infov("Applying move request {0}", request);
                var updatedGameState = state.afterPlayerMoves(request.getMove());
                var updatedGame = game.with(updatedGameState);
                activeGamesById.put(game.id(), updatedGame);

                // broadcast the game update
                Log.infov("Broadcasting game update {0}", updatedGame);
                gameBroadcasterById.get(game.id()).onNext(buildGameUpdate(updatedGame));
                if (updatedGameState.isTerminal()) {
                  activeGamesById.remove(game.id());
                  Log.infov("Broadcasting game end {0}", updatedGame);
                  var gameBroadcaster = gameBroadcasterById.remove(game.id());
                  gameBroadcaster.onComplete();
                }
                return buildGameMoveResponse(r);
              });
    }

    private GameMoveResponse buildGameMoveResponse(GameMoveRequest request) {
      return GameMoveResponse.newBuilder()
          .setGameId(request.getGameId())
          .setPlayer(request.getPlayer())
          .setMove(request.getMove())
          .setSuccess(true)
          .build();
    }

    private Game createAndRegisterGame(JoinRequest... requests) {
      var gameIdBuilder = new StringBuilder();
      gameIdBuilder.append(gameIdCounter.incrementAndGet());
      for (JoinRequest r : requests) {
        gameIdBuilder.append("-");
        gameIdBuilder.append(r.getRequestId());
      }
      var gameId = Base64.getEncoder().encodeToString(gameIdBuilder.toString().getBytes());
      var game = new Game(gameId, new GameState(GameBoard.withDimension(3), List.of("X", "O"), 0));
      activeGamesById.put(gameId, game);
      var broadcaster = BroadcastProcessor.<GameUpdate>create();
      gameBroadcasterById.put(gameId, broadcaster);
      gameUpdatesById.put(gameId, broadcaster.toHotStream());
      return game;
    }

    private GameState fromServiceGameState(State state) {
      // TODO: perf
      GameBoard board = GameBoard.withDimension(state.getBoard().getDimension());
      for (int i = 0; i < state.getBoard().getDimension() * state.getBoard().getDimension(); i++) {
        var m = state.getBoard().getContents(i);
        if (m != null && !m.isEmpty()) {
          board = board.withMove(m, i);
        }
      }
      return new GameState(
          board,
          state.getPlayersList().stream().map(p -> p.getMarker()).toList(),
          state.getCurrentPlayerIndex(),
          state.getPreviousMove());
    }

    public Game getActiveGame(String gameId) {
      return activeGamesById.get(gameId);
    }

    public Multi<GameUpdate> subscribeToGame(SubscriptionRequest request) {
      var game = getActiveGame(request.getGameId());
      if (game == null) {
        return Multi.createFrom().empty();
      }
      var gameBroadcaster = gameBroadcasterById.get(game.id());
      if (gameBroadcaster == null) {
        return Multi.createFrom().empty();
      }
      var gameUpdates = gameUpdatesById.get(game.id());
      if (gameUpdates == null) {
        return Multi.createFrom().empty();
      }
      // Post the current state of the world before future states
      // TODO: add a republished flag so it can ignore if it already has it
      // and maybe versioning
      return Multi.createBy()
          .concatenating()
          .streams(Multi.createFrom().item(buildGameUpdate(game)), gameUpdates);
    }

    private JoinResponse buildJoinResponse(JoinRequest request, Game game) {
      return JoinResponse.newBuilder()
          .setMessage(request.getName() + " VS. " + "BOT")
          .setAssignedPlayer(Player.newBuilder().setMarker("X").setIndex(0).build())
          .setInitialUpdate(buildGameUpdate(game))
          .build();
    }

    private GameUpdate buildGameUpdate(Game game) {
      return GameUpdate.newBuilder()
          .setGameId(game.id())
          .setState(buildGameState(game.state()))
          .build();
    }

    private State buildGameState(GameState gameState) {
      Builder state = org.xxdc.oss.example.service.State.newBuilder();
      for (int i = 0; i < gameState.playerMarkers().size(); i++) {
        state =
            state.addPlayers(
                Player.newBuilder()
                    .setMarker(gameState.playerMarkers().get(i))
                    .setIndex(i)
                    .build());
      }
      var board = Board.newBuilder();
      board.setDimension(gameState.board().dimension());
      for (int i = 0; i < gameState.board().dimension() * gameState.board().dimension(); i++) {
        board =
            board.addContents(
                gameState.board().content()[i] == null ? "" : gameState.board().content()[i]);
      }
      state = state.setBoard(board.build());
      state = state.setCurrentPlayerIndex(gameState.currentPlayerIndex());
      state = state.setPreviousMove(gameState.lastMove());
      if (gameState.isTerminal()) {
        state.setCompleted(true);
        if (gameState.lastPlayerHasChain()) {
          state.setWinningPlayerIndex(gameState.lastPlayerIndex());
        }
      }
      return state.build();
    }
  }

  static record Game(String id, GameState state) {
    public Game with(GameState state) {
      return new Game(id, state);
    }
  }

  @Override
  public Uni<JoinResponse> joinGame(JoinRequest request) {
    var requestId = UUID.randomUUID().toString();
    return gameManager.makeMatchFor(request.toBuilder().setRequestId(requestId).build());
  }

  @Override
  public Uni<GameMoveResponse> makeMove(GameMoveRequest request) {
    return gameManager.makeMove(request);
  }

  @Override
  public Multi<GameUpdate> subscribe(SubscriptionRequest request) {
    Log.infov("Received a subscription request {0}", request);
    var game = gameManager.getActiveGame(request.getGameId());
    if (game == null) {
      return Multi.createFrom().failure(new RuntimeException("Game not found"));
    }
    return gameManager.subscribeToGame(request);
  }
}
