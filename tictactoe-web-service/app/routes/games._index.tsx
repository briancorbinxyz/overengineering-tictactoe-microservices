import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { startGame } from "~/models/game.server";
import GameBoard from "~/components/gameboard";
import { initialGame } from "~/models/game";

// =============================================================================
// Controller
// =============================================================================

// =============================================================================
// View
// =============================================================================

export default function Index() {
  // Read

  // Render
  return (
    <main className="grid border-gray-50">
      <GameBoard game={initialGame} />
    </main>
  );
}
