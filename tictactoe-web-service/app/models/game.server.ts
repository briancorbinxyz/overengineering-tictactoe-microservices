import { json } from "@remix-run/react";
import { s } from "node_modules/vite/dist/node/types.d-aGj9QkWt";

const game = {
  gameId: "test",
  board: {
    dimension: 3,
    contents: ["X", "", "", "X", "", "", "X", "", ""],
  },
};

const startGameResponse = {
  requestId: "123456789",
  initialUpdate: game,
  assignedPlayer: {
    name: "Steve",
    marker: "X",
    index: 0,
  },
  message: "Welcome to Tic Tac Toe!",
} 

export const startGame = async () => {
  console.info("Starting game...");
  const response = await fetch("http://localhost:9010/game/join");
  console.info("Response:", response);
  console.info("Response (Text):", await response.text());
  return Promise.resolve(startGameResponse);
};
