import type { LoaderFunctionArgs } from "@remix-run/node";
import GameBoard from "~/components/gameboard";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { initialGameState } from "~/models/game";
import { json } from "@remix-run/node";
import invariant from "tiny-invariant" 

// =============================================================================
// Controller
// =============================================================================

// Remix Route: loader
export const loader = ({ params }: LoaderFunctionArgs) => { 
  return params.gameId;
}

const subscribeToGame = (gameId: string) => {
  console.info("Subscribing to game:", gameId)
  return new EventSource(`http://localhost:9010/games/${gameId}/subscribe`);
};
// =============================================================================
// View
// =============================================================================

export default function Game() {
  // Read
  // - Game ID 
  const gameId = useLoaderData<typeof loader>();
  invariant(gameId, "A valid game id is required");
  // - Subscribe to the game events
  const [gameEvent, setGameEvent] = useState(initialGameState.state);

  useEffect(() => {
    const eventSource = subscribeToGame(gameId);

    eventSource.onmessage = (event) => {
      console.log("Data:", event.data);
      setGameEvent(JSON.parse(event.data).state);
    };

    eventSource.onerror = (error) => {
      console.error('Error:', error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);


  // Render
  return (
    <main className="border-gray-50">
      <GameBoard state={gameEvent} game_id={gameId}/>
    </main>
  );
}
