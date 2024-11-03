import { Outlet } from "@remix-run/react";
import { Form } from "@remix-run/react";
import { MetaFunction } from "@remix-run/react";
import { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { startGame } from "~/models/game.server";

// =============================================================================
// Controller
// =============================================================================

// Remix Route: Meta
export const meta: MetaFunction = () => {
  return [
    { title: "Over-Engineering Tic-Tac-Toe" },
    { name: "description", content: "This is over-engineering tic-tac-toe!" },
  ];
};

// Remix Route: Action
export const action = async ({ request }: ActionFunctionArgs) => {
  return redirect("/games/new");
};

// =============================================================================
// View
// =============================================================================

const Game = () => {
  // Read 

  // Render
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <header className="flex flex-col items-center gap-2">
          <h1>Over-Engineering Tic-Tac-Toe</h1>
        </header>
        <nav>
          <main className="flex flex-col items-center justify-center gap-1 rounded-3xl border border-gray-200 p-2 dark:border-gray-700">
            <Outlet />
          </main>
          <Form method="post">
            <div className="my-2 flex flex-col gap-2">
              <input
                id="name"
                name="name"
                placeholder="Steve"
                className="text-center"
              />
              <button className="rounded border-gray-50" type="submit">
                Join Game
              </button>
            </div>
          </Form>
        </nav>
      </div>
    </div>
  )
}

export default Game;