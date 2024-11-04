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
    <main className="border-gray-50">
      <GameBoard game={initialGame} />
    </main>
  );
}
