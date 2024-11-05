import { Outlet, useNavigation } from "@remix-run/react";
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
  console.info("Joining game...");
  const startResponse = await startGame();
  const startResponseJson = await startResponse.json();
  console.info("Joined game", startResponseJson.initial_update.game_id);
  return redirect(`${startResponseJson.initial_update.game_id}`)
};

// =============================================================================
// View
// =============================================================================

const Game = () => {
  // Read 
  const navigation = useNavigation();
  const isIdle = Boolean(navigation.state === "idle");

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
              <button className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-red-500" type="submit" disabled={!isIdle}>
                {isIdle ? "Join Game" : "Joining Game..."}
              </button>
            </div>
          </Form>
        </nav>
      </div>
    </div>
  )
}

export default Game;