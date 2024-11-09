import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { Form, MetaFunction, Outlet, useNavigation } from "@remix-run/react";
import { motion } from "framer-motion";
import { useState } from "react";
import Toast from "~/components/toast";
import { startGame } from "~/models/game.server";
import { commitSession, getSession } from "~/sessions";

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

  // set the cookie
  const session = await getSession(request.headers.get("Cookie"));
  session.set("playerId", startResponseJson.assigned_player);
  session.set("gameId", startResponseJson.initial_update.game_id);
  return redirect(`${startResponseJson.initial_update.game_id}`, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

// =============================================================================
// View
// =============================================================================

const Game = () => {
  // Read
  const navigation = useNavigation();
  const isIdle = Boolean(navigation.state === "idle");
  const [isPlaying, setPlaying] = useState(false);

  // Render
  return (
    <div className="flex flex-col bg-yellow-500">
      <div className="overflow:hidden h-12 bg-black">
        <nav className="float-right px-2 py-1 text-center">
          <svg
            className="h-[38px] w-[38px] text-gray-800 dark:text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M16 12H4m12 0-4 4m4-4-4-4m3-4h2a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-2"
            />
          </svg>
        </nav>
      </div>
      <div className="flex h-screen items-center justify-center bg-yellow-500">
        <div className="flex">
          <div className="flex flex-col items-center gap-2">
            <div>
              <h1 className="font-['Bleach'] text-8xl">Over-Engineering</h1>
            </div>
            <main className="flex flex-col items-center justify-center gap-1">
              <Outlet />
            </main>
            <Form method="post">
              <div className="my-8 flex flex-col gap-2">
                <input
                  id="name"
                  name="name"
                  placeholder="Steve"
                  className="h-10 text-center"
                  disabled={!isPlaying}
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="focus:bg-blue-850 bg-black px-4 py-2 text-white hover:bg-blue-900 disabled:bg-blue-200"
                  type="submit"
                  disabled={!isIdle}
                >
                  {isIdle ? "Join Game" : "Matchmaking..."}
                </motion.button>
              </div>
            </Form>
            <footer className="mb-auto flex hidden">
              <Toast message="Error - unable connect to game api gateway."></Toast>
            </footer>
          </div>
          <div className="my-5 flex flex-col justify-start text-left">
            <h1
              className="font-['Bleach'] text-8xl text-black opacity-80"
              style={{ writingMode: "vertical-lr" }}
            >
              Tic-
            </h1>
            <h1
              className="font-['Bleach'] text-8xl text-white opacity-45"
              style={{ writingMode: "vertical-lr" }}
            >
              Tac
            </h1>
            <h1
              className="font-['Bleach'] text-8xl text-black opacity-80"
              style={{ writingMode: "vertical-lr" }}
            >
              -Toe
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
