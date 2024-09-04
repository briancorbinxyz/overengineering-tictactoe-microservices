package org.xxdc.oss.example;

import org.xxdc.oss.example.service.Game;
import org.xxdc.oss.example.service.JoinReply;
import org.xxdc.oss.example.service.JoinRequest;

import io.quarkus.grpc.GrpcService;
import io.smallrye.mutiny.Uni;

@GrpcService
public class GameService implements Game {

    @Override
    public Uni<JoinReply> joinGame(JoinRequest request) {
        return Uni.createFrom().item(JoinReply.newBuilder().setMessage("Hello " + request.getMessage()).build());

    }

}