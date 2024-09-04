package org.xxdc.oss.example;

import org.xxdc.oss.example.service.Game;
import org.xxdc.oss.example.service.JoinRequest;

import io.quarkus.grpc.GrpcClient;
import io.smallrye.mutiny.Uni;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("/game")
public class GameServiceResource {

    @GrpcClient
    Game game;

    @GET
    @Produces(MediaType.TEXT_PLAIN)
    public String hello() {
        return "hello again";
    }

    @GET
    @Path("/join")
    public Uni<String> join() {
        return game.joinGame(JoinRequest.newBuilder().setMessage("Can I join?").build())
            .onItem().transform(response -> response.getMessage());
    }
}
