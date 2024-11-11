package org.xxdc.oss.example;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.BeforeEach;

@QuarkusTest
public class GameServiceTest {

  private GameService gameService;

  @BeforeEach
  public void setup() {
    gameService = new GameService();
  }
}
