import { json } from "@remix-run/react";

export const startGame = async () => {
  console.error("Starting...");
  return Promise.resolve(json("started"));
};
