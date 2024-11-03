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

// =============================================================================
// View
// =============================================================================

export default function Index() {
  // Read
  // - Join
  const newGame = useLoaderData<typeof loader>();
  // - Subscribe
  const [gameEvent, setGameEvent] = useState(null);

  useEffect(() => {
    const eventSource = new EventSource(`http://localhost:9010/${newGame.initialUpdate.gameId}/subscribe`);

    eventSource.onmessage = (event) => {
      console.log(event.data);
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
      <GameBoard game={newGame.initialUpdate} />
      {gameEvent}
    </main>
  );
}
