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
  const { state, gameId } = initialGameState;

  // Render
  return (
    <main className="border-gray-50">
      <div className="flex justify-center font-['Strong_Young'] text-blue-900">
        Let&apos;s Play!
      </div>
      <GameBoard state={state} gameId={gameId} />
    </main>
  );
}
