package org.xxdc.oss.example;

import org.xxdc.oss.example.service.TicTacToeGame;
import org.xxdc.oss.example.service.JoinRequest;
import org.xxdc.oss.example.service.GameMoveRequest;
import org.xxdc.oss.example.service.GameUpdate;

import io.quarkus.grpc.GrpcClient;
import io.smallrye.mutiny.Uni;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("/game")
public class GameServiceResource {

    @GrpcClient
    TicTacToeGame game;

    @GET
    @Produces(MediaType.TEXT_PLAIN)
    public String hello() {
        return "hello again";
    }

    @GET
    @Path("/join")
    public Uni<String> join() {
        return game.joinGame(JoinRequest.newBuilder()
                .setMessage("Can I join?")
                .setName("Tahlia")
                .build()
            )
            .log("Game.Joiner")
            .onItem().transform(response -> response.getMessage());
    }

    @GET
    @Path("/makeMove")
    public Uni<GameUpdate> makeMove() {
        return game.makeMove(GameMoveRequest.newBuilder().build());
    }
}
