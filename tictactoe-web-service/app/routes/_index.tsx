import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { startGame } from "~/models/game.server";
import { redirect } from "@remix-run/node"
import { Outlet, Link } from "@remix-run/react";

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
  console.log("Performing action");
  const game = await startGame();

  console.log(game);
  return redirect("/games");
};

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
          <Link to="games"></Link>
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
  );
}