package org.xxdc.oss.example;

import io.quarkus.test.junit.QuarkusTest;
import io.smallrye.mutiny.Uni;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.xxdc.oss.example.service.JoinRequest;
import org.xxdc.oss.example.service.JoinResponse;

import static org.junit.jupiter.api.Assertions.assertEquals;

@QuarkusTest
public class GameServiceTest {

    private GameService gameService;

    @BeforeEach
    public void setup() {
       gameService = new GameService();
    }

    @Test
    public void testJoinGame_SuccessfulJoin() {
        JoinRequest request = JoinRequest.newBuilder().setName("Player1").build();
        Uni<JoinResponse> response = gameService.joinGame(request);
        response.subscribe().with(joinResponse -> {
            assertEquals("Welcome Player1!", joinResponse.getMessage());
        });
    }

    @Test
    public void testJoinGame_EmptyMessage() {
        JoinRequest request = JoinRequest.newBuilder().setName("").build();
        Uni<JoinResponse> response = gameService.joinGame(request);
        response.subscribe().with(joinResponse -> {
            assertEquals("Welcome !", joinResponse.getMessage());
        });
    }

    @Test
    public void testJoinGame_NullMessage() {
        JoinRequest request = JoinRequest.newBuilder().build();
        Uni<JoinResponse> response = gameService.joinGame(request);
        response.subscribe().with(joinResponse -> {
            assertEquals("Welcome null!", joinResponse.getMessage());
        });
    }
}
