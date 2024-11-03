import { json } from "@remix-run/react";

export const startGame = async () => {
  console.info("Joining game...");
  const response = await fetch("http://localhost:9010/games/join");
  const responseMessage = await response.json();
  console.info("Joined game:", responseMessage?.initial_update?.game_id);
  return json(responseMessage);
};
