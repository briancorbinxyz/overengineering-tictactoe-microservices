import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { startGame } from "~/models/game.server";
import GameBoard from "~/components/gameboard";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";

// =============================================================================
// Controller
// =============================================================================

// Remix Route: loader
export const loader = async ({ request }: ActionFunctionArgs) => await startGame();

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
  // - Join the game
  const {initial_update, assigned_player, message} = useLoaderData<typeof loader>();
  // - Subscribe to the game events
  const [gameEvent, setGameEvent] = useState(null);

  useEffect(() => {
    const eventSource = subscribeToGame(initial_update.game_id);

    eventSource.onmessage = (event) => {
      console.log("Data:", event.data);
      setGameEvent(event.data);
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
      <GameBoard game={initial_update.state} />
      {gameEvent}
    </main>
  );
}
