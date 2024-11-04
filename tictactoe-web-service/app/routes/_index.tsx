import { Link } from "@remix-run/react";

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
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-16">
        <header className="flex flex-col items-center gap-9">
          <h1>Over-Engineering Tic-Tac-Toe</h1>
        </header>
        <nav className="flex flex-col items-center justify-center gap-1 rounded-3xl border border-gray-200 p-6 dark:border-gray-700">
          <Link to="games" className="my-2 flex flex-col gap-2"></Link>
        </nav>
      </div>
    </div>
  );
}