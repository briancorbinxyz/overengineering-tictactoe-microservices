package org.xxdc.oss.example;

import org.xxdc.oss.example.service.TicTacToeGame;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentLinkedDeque;

import org.checkerframework.checker.units.qual.s;
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
        private final BroadcastProcessor<JoinRequest> botRequests = BroadcastProcessor.create();
        private final BroadcastProcessor<JoinResponse> joinResponses = BroadcastProcessor.create();

        public GameManager() {
            // TODO: split this into a separate game-manager-service
            initMinimumPlayerPolicy();
            initBotPolicy();
        }

        private void initMinimumPlayerPolicy() {
            joinRequests.onItem().transformToMulti(request -> {
                requests.add(request);
                Log.infov("Received a join request: {0}", request);
                List<JoinRequest> nextMatch = new ArrayList<>(2);
                var requestOne = requests.poll();
                var requestTwo = requests.poll();
                if (requestOne != null && requestTwo != null) {
                    nextMatch.add(requestOne);
                    nextMatch.add(requestTwo);

                    var responseOne =  JoinResponse.newBuilder()
                        .setRequestId(requestOne.getRequestId())
                        .setMessage(requestOne.getName() + " VS " + requestTwo.getName() + "!")
                        .build();

                    var responseTwo =  JoinResponse.newBuilder()
                        .setRequestId(requestTwo.getRequestId())
                        .setMessage(requestOne.getName() + " VS " + requestTwo.getName() + "!")
                        .build();

                    return Multi.createFrom().items(responseOne, responseTwo);
                } else {
                    if (requestOne != null) {
                        requests.push(requestOne);
                        botRequests.onNext(requestOne);
                    }
                    if (requestTwo != null) {
                        requests.push(requestTwo);
                        botRequests.onNext(requestTwo);
                    }
                } 
                return Multi.createFrom().empty();
            }).merge().subscribe().with(joinResponse -> {
                Log.infov("Sending a join response: {0}", joinResponse);
                joinResponses.onNext(joinResponse);
            });
        }

        private void initBotPolicy() {
            // Wait 10 seconds before adding a bot player if there are unmatched players
            // https://smallrye.io/smallrye-mutiny/2.0.0/guides/delaying-events/
            botRequests.onItem()
                .call(i -> Uni.createFrom().nullItem().onItem().delayIt().by(Duration.ofSeconds(10)))
                .subscribe().with(r -> {
                    // Add a bot player if there are unmatched players
                    if (requests.size() % 2 == 1) {
                        Log.infov("Creating a bot for request: {0}", r.getRequestId());
                        var request = JoinRequest.newBuilder()
                            .setRequestId(UUID.randomUUID().toString())
                            .setName("Bot")
                            .setMessage("I'm a bot!")
                            .build();
                        addJoinRequest(request);
                    } else {
                        Log.debugv("No bot needed for request: {0}", r.getRequestId());
                    }
                });
        }
        
        public void addJoinRequest(JoinRequest request) {
            joinRequests.onNext(request);
        }

        public Multi<JoinRequest> joinRequests() {
            return joinRequests;
        }

        private Uni<JoinResponse> selectResponseFor(JoinRequest request) {
            return joinResponses
                .onItem().invoke(r -> Log.infov("Received a join response: {0}", r))
                .select().where(response -> response.getRequestId().equals(request.getRequestId()))
                .toUni();
        }

        public Uni<JoinResponse> createGameFor(JoinRequest request) {
            return selectResponseFor(request)
                .onSubscription().invoke(c -> addJoinRequest(request))
                .onItem().invoke(c -> Log.infov("Fulfilled request: {0}", request));
        }

    }

    @Override
    public Uni<JoinResponse> joinGame(JoinRequest request) {
        var requestId = UUID.randomUUID().toString();
        return gameManager.createGameFor(request.toBuilder().setRequestId(requestId).build());
    }

    @Override
    public Uni<GameUpdate> makeMove(GameMoveRequest request) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'makeMove'");
    }
}