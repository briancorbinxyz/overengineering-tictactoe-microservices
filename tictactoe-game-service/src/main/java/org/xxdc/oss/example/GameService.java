package org.xxdc.oss.example;

import org.xxdc.oss.example.service.TicTacToeGame;
import org.xxdc.oss.example.service.GameMoveRequest;
import org.xxdc.oss.example.service.GameUpdate;
import org.xxdc.oss.example.service.JoinRequest;
import org.xxdc.oss.example.service.JoinResponse;

import io.quarkus.grpc.GrpcService;
import io.smallrye.mutiny.Multi;
import io.smallrye.mutiny.Uni;

@GrpcService
public class GameService implements TicTacToeGame {

    private final GameManager gameManager = new GameManager();

    @Override
    public Uni<JoinResponse> joinGame(JoinRequest request) {
        gameManager.addJoinRequest(request);
        return Uni.createFrom()
            .item(JoinResponse.newBuilder()
                .setMessage("Welcome " + request.getName() + "!").build()
            );
    }

    @Override
    public Uni<GameUpdate> makeMove(GameMoveRequest request) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'makeMove'");
    }

    static class GameManager {
        private final Multi<JoinRequest> joinRequests = Multi.createFrom().empty();

        public void addJoinRequest(JoinRequest request) {
            //joinRequests.emit(request);
        }
    }

}