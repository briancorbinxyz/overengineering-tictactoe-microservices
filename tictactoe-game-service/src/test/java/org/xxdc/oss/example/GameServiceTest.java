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
        var request = JoinRequest.newBuilder().setName("Player1").build();
        var requestTwo = JoinRequest.newBuilder().setName("Player2").build();
        var response = gameService.joinGame(request);
        var responseTwo = gameService.joinGame(requestTwo);
        response.subscribe().with(joinResponse -> {
            System.out.println("Received response: " + joinResponse.getMessage());
            assertEquals("Welcome Player1!", joinResponse.getMessage());
        },
        error -> {
            System.out.println("Error: " + error.getMessage());
        });
        responseTwo.subscribe().with(joinResponse -> {
            System.out.println("Received response: " + joinResponse.getMessage());
            assertEquals("Welcome Player1!", joinResponse.getMessage());
        });
    }

    @Test
    public void testJoinGame_EmptyMessage() {
        var request = JoinRequest.newBuilder().setName("").build();
        var response = gameService.joinGame(request);
        response.subscribe().with(joinResponse -> {
            assertEquals("Welcome !", joinResponse.getMessage());
        });
    }

    @Test
    public void testJoinGame_NullMessage() {
        var request = JoinRequest.newBuilder().build();
        var response = gameService.joinGame(request);
        response.subscribe().with(joinResponse -> {
            assertEquals("Welcome null!", joinResponse.getMessage());
        });
    }
}
