package org.xxdc.oss.example;

import org.xxdc.oss.example.service.TicTacToeGame;

import java.util.List;

import org.xxdc.oss.example.service.GameMoveRequest;
import org.xxdc.oss.example.service.GameUpdate;
import org.xxdc.oss.example.service.JoinRequest;
import org.xxdc.oss.example.service.JoinResponse;

import io.quarkus.grpc.GrpcService;
import io.smallrye.mutiny.Multi;
import io.smallrye.mutiny.Uni;
import io.smallrye.mutiny.operators.multi.processors.BroadcastProcessor;

@GrpcService
public class GameService implements TicTacToeGame {

    private final GameManager gameManager = new GameManager();

    static class GameManager {

        private final BroadcastProcessor<JoinRequest> joinRequests = BroadcastProcessor.create();

        public GameManager() {
            // activate the processor so that it starts processing events
            joinRequests.log().subscribe().with(request -> {
                System.out.println("Received join request: " + request);
            });
        }
        
        public void addJoinRequest(JoinRequest request) {
            joinRequests.onNext(request);
        }

        public Multi<JoinRequest> joinRequests() {
            return joinRequests;
        }
    }

    @Override
    public Uni<JoinResponse> joinGame(JoinRequest request) {
        Uni<List<JoinRequest>> waitForMinimumPlayers = gameManager.joinRequests()
            .select().first(2)
            .collect().asList()
            .log();

        var response = waitForMinimumPlayers.onItem().transform(players -> {
            System.out.println("Starting game with players: " + players);
            return JoinResponse.newBuilder()
                //.setMessage("Welcome " + request.getName() + "!")
                .setMessage("Welcomed " + players.stream().map(JoinRequest::getName).reduce("", (a, b) -> a + b) + "!")
                .build();
        }).log().subscribe().with(players -> {
            System.out.println("Received response: " + players);
        });
        gameManager.addJoinRequest(request);
        return response;
    }



    @Override
    public Uni<GameUpdate> makeMove(GameMoveRequest request) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'makeMove'");
    }
}