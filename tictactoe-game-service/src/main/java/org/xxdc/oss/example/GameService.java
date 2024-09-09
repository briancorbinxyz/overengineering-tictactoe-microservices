package org.xxdc.oss.example;

import org.xxdc.oss.example.service.TicTacToeGame;

import java.time.Duration;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

import org.xxdc.oss.example.*;
import org.xxdc.oss.example.service.GameMoveRequest;
import org.xxdc.oss.example.service.GameMoveResponse;
import org.xxdc.oss.example.service.GameUpdate;
import org.xxdc.oss.example.service.JoinRequest;
import org.xxdc.oss.example.service.JoinResponse;
import org.xxdc.oss.example.service.Player;
import org.xxdc.oss.example.service.State;
import org.xxdc.oss.example.service.State.Builder;

import org.xxdc.oss.example.service.SubscriptionRequest;
import org.xxdc.oss.example.service.Board;

import io.quarkus.grpc.GrpcService;
import io.smallrye.mutiny.Multi;
import io.smallrye.mutiny.Uni;
import io.smallrye.mutiny.operators.multi.processors.BroadcastProcessor;
import io.smallrye.mutiny.operators.multi.processors.UnicastProcessor;
// https://quarkus.io/guides/logging
import io.quarkus.logging.Log;

@GrpcService
public class GameService implements TicTacToeGame {

    private final GameManager gameManager = new GameManager();

    // TODO: split the game-manager-service and the game-service
    static class GameManager {

        private final ConcurrentLinkedQueue<JoinRequest> requestQueue = new ConcurrentLinkedQueue<>();

        private final ConcurrentHashMap<JoinRequest, UnicastProcessor<JoinResponse>> processorByRequest = new ConcurrentHashMap<>();

        private final ConcurrentHashMap<String, Game> activeGamesById = new ConcurrentHashMap<>();

        private final ConcurrentHashMap<String, BroadcastProcessor<GameUpdate>> gameProcessorById = new ConcurrentHashMap<>();

        public Uni<JoinResponse> makeMatchFor(JoinRequest request) {
            Log.infov("Received a join request {0}", request);
            return Uni.createFrom().emitter(emitter -> {
                var processor = UnicastProcessor.<JoinResponse>create();
                if (requestQueue.isEmpty()) {
                    Log.infov("Waiting for player for request {0}", request);
                    processorByRequest.put(request, processor);
                    requestQueue.offer(request);
                    processor.ifNoItem().after(Duration.ofSeconds(10)).recoverWithMulti(() -> {
                        Log.infov("Creating a bot player for request {0}", request);
                        requestQueue.remove(request);
                        processorByRequest.remove(request);
                        return makeBotMatchFor(request);
                    }).subscribe().with(
                        emitter::complete,
                        emitter::fail,
                        () -> {}
                    );
                } else {
                    Log.infov("Found player for request {0}", request);
                    var otherRequest = requestQueue.poll();

                    var gameId = "demo";
                    var game = new Game(gameId, null, new GameState(GameBoard.withDimension(3), List.of("X", "O"), 0));
                    activeGamesById.put(gameId, game);
                    var gameProcessor = BroadcastProcessor.<GameUpdate>create();
                    gameProcessorById.put(gameId, gameProcessor);

                    // my response
                    var gameUpdate = createGameUpdate(game);
                    var response = JoinResponse.newBuilder()
                        .setMessage(otherRequest.getName() + " VS. " + request.getName())
                        .setAssignedPlayer(Player.newBuilder()
                            .setMarker("O")
                            .setIndex(0)
                            .build()
                        )
                        .setInitialUpdate(gameUpdate)
                        .build();
                    emitter.complete(response);

                    // their response
                    var otherResponse = JoinResponse.newBuilder()
                        .setMessage(otherRequest.getName() + " VS. " + request.getName())
                        .setAssignedPlayer(Player.newBuilder()
                            .setMarker("X")
                            .setIndex(1)
                            .build()
                        )
                        .setInitialUpdate(gameUpdate)
                        .build();
                    var otherRequestProcessor = processorByRequest.remove(otherRequest);
                    otherRequestProcessor.onNext(otherResponse);
                    otherRequestProcessor.onComplete();
                }
            });
        } 

        public Multi<JoinResponse> makeBotMatchFor(JoinRequest request) {
            return Multi.createFrom().items(
                JoinResponse.newBuilder()
                    .setMessage(request.getName() + " VS. " + "BOT")
                    .build()
            );
        }

        public Game getActiveGame(String gameId) {
            return activeGamesById.get(gameId);
        }

        public Multi<GameUpdate> subscribe(SubscriptionRequest request) {
            var game = getActiveGame(request.getGameId());
            if (game == null) {
                return Multi.createFrom().empty();
            }
            var gameProcessor = gameProcessorById.get(game.id());
            if (gameProcessor == null) {
                return Multi.createFrom().empty();
            }
            return gameProcessor.toHotStream();
        }

        public void updateGame(String id, GameState state) {
            Game game = new Game(id, null, state);
            activeGamesById.put(id, game);
            gameProcessorById.get(id).onNext(createGameUpdate(game));
        }

        private GameUpdate createGameUpdate(Game game) {
            return GameUpdate.newBuilder()
                .setGameId(game.id())
                .setState(createGameState(game.state()))
                .build();
        }

        private State createGameState(GameState s) {
            Builder state = org.xxdc.oss.example.service.State.newBuilder();
            for (int i = 0; i < s.playerMarkers().size(); i++) {
                state = state.addPlayers(Player.newBuilder().setMarker(s.playerMarkers().get(i))
                  .setIndex(i)
                  .build());
            }
            var board = Board.newBuilder();
            board.setDimension(s.board().dimension());
            for (int i = 0; i < s.board().dimension() * s.board().dimension(); i++) {
                // TODO: we need to get the actual contents (we don't expose it in the GameBoard)
                // may have to hack for now and get it from the json
               board = board.addContents(-1);
            }
            state = state.setBoard(board.build());
            state = state.setCurrentPlayerIndex(s.currentPlayerIndex());
            if (s.isTerminal()) {
                state.setWinningPlayerIndex(s.lastPlayerIndex());
            }
            return state.build();
        }

    }

    static record Game(String id, List<PlayerNode> players, GameState state) {
    }

    @Override
    public Uni<JoinResponse> joinGame(JoinRequest request) {
        var requestId = UUID.randomUUID().toString();
        return gameManager.makeMatchFor(request.toBuilder().setRequestId(requestId).build());
    }

    @Override
    public Uni<GameMoveResponse> makeMove(GameMoveRequest request) {
        Log.infov("Received a move request {0}", request);
        var game = gameManager.getActiveGame(request.getGameId());
        if (game == null) {
            return Uni.createFrom().failure(new RuntimeException("Game not found"));
        }
        Log.infov("Found a game for request {0}", request);
        return Uni.createFrom().item(GameMoveResponse.newBuilder()
            .setGameId(request.getGameId())
            .setPlayer(request.getPlayer())
            .setMove(request.getMove())
            .setSuccess(true).build()
        ).invoke(() -> {
            var state = game.state();
            // TODO: validate the player and everything before making the move
            state = state.afterPlayerMoves(request.getMove());
            gameManager.updateGame(game.id(), state);
        });
    }

    @Override
    public Multi<GameUpdate> subscribe(SubscriptionRequest request) {
        Log.infov("Received a subscription request {0}", request);
        var game = gameManager.getActiveGame(request.getGameId());
        if (game == null) {
            return Multi.createFrom().failure(new RuntimeException("Game not found"));
        }
        return gameManager.subscribe(request);
    }
}