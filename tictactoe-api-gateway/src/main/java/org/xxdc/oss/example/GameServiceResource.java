package org.xxdc.oss.example;

import org.xxdc.oss.example.service.TicTacToeGame;
import org.xxdc.oss.example.service.JoinRequest;
import org.xxdc.oss.example.service.JoinResponse;
import org.xxdc.oss.example.service.GameMoveRequest;
import org.xxdc.oss.example.service.SubscriptionRequest;

import com.google.protobuf.util.JsonFormat;

import io.quarkus.grpc.GrpcClient;
import io.smallrye.mutiny.Multi;
import io.smallrye.mutiny.Uni;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.Produces;

import jakarta.inject.Inject;

@Path("/games")
public class GameServiceResource {

    @GrpcClient
    TicTacToeGame game;

    @Produces
    public JsonFormat.Printer jsonPrinter() {
        return JsonFormat.printer()
            .includingDefaultValueFields()
            .preservingProtoFieldNames()
            .omittingInsignificantWhitespace();
    }

    @GET
    @Path("/join")
    @Produces(MediaType.APPLICATION_JSON)
    public Uni<String> join() {
        return game.joinGame(JoinRequest.newBuilder()
                .setMessage("Can I join?")
                .setName("Tahlia")
                .build()
            )
            .log("Game.Joiner")
            .onItem().transform(response -> {
                try {
                    var jsonPrinter = JsonFormat.printer()
                        .includingDefaultValueFields()
                        .preservingProtoFieldNames()
                        .omittingInsignificantWhitespace();
                    return jsonPrinter.print(response);
                } catch (Exception e) {
                e.printStackTrace();
                return "{}";
            }}
        );
    }

    @GET
    @Path("/joinAndSubscribe")
    public Multi<String> joinAndSubscribe() {
        return game.joinGame(JoinRequest.newBuilder()
                .setMessage("Can I join?")
                .setName("Tahlia")
                .build()
            )
            .log("Game.Joiner")
            .onItem().transformToMulti(response -> game.subscribe(SubscriptionRequest.newBuilder()
                .setGameId(response.getInitialUpdate().getGameId())
                .build()))
            .onItem().transform(r -> r.toString());
    }

    @GET
    @Path("{id}/makeMove")
    public Uni<String> makeMove(@PathParam("id") String gameId, @QueryParam("location") int location) {
        return game.makeMove(GameMoveRequest.newBuilder()
            .setGameId(gameId)
            .setMove(location)
            .build()).onItem().transform(r -> r.toString());
    }

    @GET
    @Path("{id}/subscribe")
    @Produces(MediaType.SERVER_SENT_EVENTS)
    public Multi<String> subscribe(@PathParam("id") String gameId) {
        return game.subscribe(SubscriptionRequest.newBuilder()
            .setGameId(gameId)
            .build()).onItem().transform(r -> r.toString());
    }
}
