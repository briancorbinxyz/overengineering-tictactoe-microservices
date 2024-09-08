package org.xxdc.oss.example;

import org.xxdc.oss.example.service.TicTacToeGame;

import java.time.Duration;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

import org.xxdc.oss.example.service.GameMoveRequest;
import org.xxdc.oss.example.service.GameUpdate;
import org.xxdc.oss.example.service.JoinRequest;
import org.xxdc.oss.example.service.JoinResponse;

import io.quarkus.grpc.GrpcService;
import io.smallrye.mutiny.Multi;
import io.smallrye.mutiny.Uni;
import io.smallrye.mutiny.operators.multi.processors.UnicastProcessor;
// https://quarkus.io/guides/logging
import io.quarkus.logging.Log;

@GrpcService
public class GameService implements TicTacToeGame {

    private final GameManager gameManager = new GameManager();

    static class GameManager {

        private final ConcurrentLinkedQueue<JoinRequest> requestQueue = new ConcurrentLinkedQueue<>();

        private final ConcurrentHashMap<JoinRequest, UnicastProcessor<JoinResponse>> processorByRequest = new ConcurrentHashMap<>();

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

                    // my response
                    var response = JoinResponse.newBuilder()
                        .setMessage(otherRequest.getName() + " VS. " + request.getName())
                        .build();
                    emitter.complete(response);

                    // their response
                    var otherResponse = JoinResponse.newBuilder()
                        .setMessage(otherRequest.getName() + " VS. " + request.getName())
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

    }

    @Override
    public Uni<JoinResponse> joinGame(JoinRequest request) {
        var requestId = UUID.randomUUID().toString();
        return gameManager.makeMatchFor(request.toBuilder().setRequestId(requestId).build());
    }

    @Override
    public Uni<GameUpdate> makeMove(GameMoveRequest request) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'makeMove'");
    }
}