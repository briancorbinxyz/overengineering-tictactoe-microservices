package org.xxdc.oss.example;

import org.xxdc.oss.example.service.TicTacToeGame;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentLinkedDeque;

import org.xxdc.oss.example.service.GameMoveRequest;
import org.xxdc.oss.example.service.GameUpdate;
import org.xxdc.oss.example.service.JoinRequest;
import org.xxdc.oss.example.service.JoinResponse;

import io.quarkus.grpc.GrpcService;
import io.smallrye.mutiny.Multi;
import io.smallrye.mutiny.Uni;
import io.smallrye.mutiny.operators.multi.processors.BroadcastProcessor;

// https://quarkus.io/guides/logging
import io.quarkus.logging.Log;

@GrpcService
public class GameService implements TicTacToeGame {

    private final GameManager gameManager = new GameManager();

    static class GameManager {

        private final ConcurrentLinkedDeque<JoinRequest> requests = new ConcurrentLinkedDeque<>();
        private final BroadcastProcessor<JoinRequest> joinRequests = BroadcastProcessor.create();
        private final BroadcastProcessor<JoinResponse> joinResponses = BroadcastProcessor.create();

        public GameManager() {
            // activate the processor so that it starts processing events
            // TODO: split this into a separate game-manager-service
            joinRequests.onItem().transformToMulti(request -> {
                requests.add(request);
                Log.infov("Received a join request: {0}", request);
                List<JoinRequest> nextMatch = new ArrayList<>(2);
                var requestOne = requests.poll();
                var requestTwo = requests.poll();
                if (requestOne != null && requestTwo != null) {
                    nextMatch.add(requestOne);
                    nextMatch.add(requestTwo);

                    var one =  JoinResponse.newBuilder()
                        .setRequestId(requestOne.getRequestId())
                        .setMessage("Welcome " + requestOne.getName() + " and " + requestTwo.getName() + "!")
                        .build();
                    var two =  JoinResponse.newBuilder()
                    .setRequestId(requestTwo.getRequestId())
                    .setMessage("Welcome " + requestOne.getName() + " and " + requestTwo.getName() + "!")
                    .build();

                    return Multi.createFrom().items(one, two);
                } else {
                    if (requestOne != null) {
                        requests.push(requestOne);
                    }
                } 
                return Multi.createFrom().empty();
            }).merge().subscribe().with(joinResponse -> {
                Log.infov("Sending join response: {0}", joinResponse);
                joinResponses.onNext(joinResponse);
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
        var responses = gameManager.joinResponses()
            .select().first(response -> requestId.equals(response.getRequestId()))
            .toUni();
        gameManager.addJoinRequest(request.toBuilder().setRequestId(requestId).build());
        return responses;
    }

    @Override
    public Uni<GameUpdate> makeMove(GameMoveRequest request) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'makeMove'");
    }
}