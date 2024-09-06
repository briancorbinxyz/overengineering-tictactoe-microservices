package org.xxdc.oss.example;

import org.xxdc.oss.example.service.TicTacToeGame;

import java.util.List;
import java.util.UUID;

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

        private final Multi<JoinResponse> joinResponses;

        public GameManager() {
            // activate the processor so that it starts processing events
            joinRequests.log().subscribe();
            joinResponses = joinRequests.onItem().transform(request -> {
                System.out.println("Received join request: " + request);
                return JoinResponse.newBuilder()
                    .setMessage("Welcome " + request.getName() + "!")
                    .build();
            });
        }
        
        public void addJoinRequest(JoinRequest request) {
            joinRequests.onNext(request);
        }

        public Multi<JoinRequest> joinRequests() {
            return joinRequests;
        }

        public Multi<JoinResponse> joinResponses() {
            return joinResponses;
        }
    }

    @Override
    public Uni<JoinResponse> joinGame(JoinRequest request) {
        var requestId = UUID.randomUUID().toString();
        gameManager.addJoinRequest(request);
        return gameManager.joinResponses()
            .select().first(1).toUni();
    }

    @Override
    public Uni<GameUpdate> makeMove(GameMoveRequest request) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'makeMove'");
    }
}