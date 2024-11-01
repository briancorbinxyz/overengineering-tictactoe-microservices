import { useState } from "react";
import { Outlet } from "@remix-run/react";

// =============================================================================
// View
// =============================================================================

const Game = () => {
  // Read 

  // Render
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-16">
        <header className="flex flex-col items-center gap-9">
          <h1>Over-Engineering Tic-Tac-Toe</h1>
        </header>
        <nav className="flex flex-col items-center justify-center gap-1 rounded-3xl border border-gray-200 p-6 dark:border-gray-700">
          <main className="border-gray-50 grid">
            <Outlet />
          </main>
        </nav>
      </div>
    </div>
  )
}

export default Game;