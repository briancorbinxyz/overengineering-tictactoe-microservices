import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import GameBoard from "~/components/gameboard";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { initialGame } from "~/models/game";

// =============================================================================
// Controller
// =============================================================================

// Remix Route: loader
export const loader = async ({ params }: LoaderFunctionArgs) => { 
    console.log("I Loaded", params)
    return await Promise.resolve(params.gameId);
}

const subscribeToGame = (gameId: string) => {
  console.info("Subscribing to game:", gameId)
  const eventSource = new EventSource(`http://localhost:9010/games/${gameId}/subscribe`);
  return eventSource;
};
// =============================================================================
// View
// =============================================================================

export default function Index() {
  // Read
  // - Game ID 
  const gameId = useLoaderData<typeof loader>();
  // - Subscribe to the game events
  const [gameEvent, setGameEvent] = useState(initialGame);

  useEffect(() => {
    const eventSource = subscribeToGame(gameId);

    eventSource.onmessage = (event) => {
      console.log("Data:", event.data);
      setGameEvent(event.data.state);
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
      <GameBoard game={gameEvent} />
    </main>
  );
}
