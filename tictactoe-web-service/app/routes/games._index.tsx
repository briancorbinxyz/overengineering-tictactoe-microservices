import GameBoard from "~/components/gameboard";
import { initialGameState } from "~/models/game";

// =============================================================================
// Controller
// =============================================================================

// =============================================================================
// View
// =============================================================================

export default function Index() {
  // Read
  const { state, game_id } = initialGameState;

  // Render
  return (
    <main className="border-gray-50">
      <GameBoard state={state} game_id={game_id} />
    </main>
  );
}
