import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { Form, MetaFunction, Outlet, useNavigation } from "@remix-run/react";
import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import clickAudioUrl from "~/audio/click.mp3";
import Toast from "~/components/toast";
import GameAudioContext from "~/contexts/gameaudio.context";
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
  // Server-side state
  const navigation = useNavigation();
  const isIdle = Boolean(navigation.state === "idle");
  // Client-side state
  const [isPlaying] = useState(false);
  const [clickAudio, setClickAudio] = useState<HTMLAudioElement>();

  // TODO: Combine with local storage into a custom hook
  const [muteMusic, setMuteMusic] = useState(false);
  const [muteSfx, setMuteSfx] = useState(false);

  useEffect(() => {
    if (window.localStorage.getItem("muteMusic") === "true") {
      setMuteMusic(true);
    }
    if (window.localStorage.getItem("muteSfx") === "true") {
      setMuteSfx(true);
    }
  }, []);

  useEffect(() => {
    setClickAudio(new Audio(clickAudioUrl));
  }, []);

  const handleClick = useCallback(() => {
    if (!muteSfx && clickAudio) {
      clickAudio.currentTime = 0;
      clickAudio.play();
    }
  }, [muteSfx, clickAudio]);

  // Render
  return (
    <GameAudioContext.Provider
      value={{ muteMusic: muteMusic, muteSfx: muteSfx }}
    >
      <div className="flex flex-col bg-yellow-500">
        <div className="overflow:hidden h-[theme(spacing.12)] bg-black">
          <nav className="float-right flex flex-row gap-3 px-2 py-1 text-center ">
            <button id="mute-sfx" onClick={() => {
                setMuteSfx(!muteSfx);
                window?.localStorage.setItem("muteSfx", (!muteSfx).toString());
              }}>
              {muteSfx ? (
                <svg
                  className="dark:text-red-800"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.133 12.632v-1.8a5.407 5.407 0 0 0-4.154-5.262.955.955 0 0 0 .021-.106V3.1a1 1 0 0 0-2 0v2.364a.933.933 0 0 0 .021.106 5.406 5.406 0 0 0-4.154 5.262v1.8C6.867 15.018 5 15.614 5 16.807 5 17.4 5 18 5.538 18h12.924C19 18 19 17.4 19 16.807c0-1.193-1.867-1.789-1.867-4.175Zm-13.267-.8a1 1 0 0 1-1-1 9.424 9.424 0 0 1 2.517-6.391A1.001 1.001 0 1 1 6.854 5.8a7.43 7.43 0 0 0-1.988 5.037 1 1 0 0 1-1 .995Zm16.268 0a1 1 0 0 1-1-1A7.431 7.431 0 0 0 17.146 5.8a1 1 0 0 1 1.471-1.354 9.424 9.424 0 0 1 2.517 6.391 1 1 0 0 1-1 .995ZM8.823 19a3.453 3.453 0 0 0 6.354 0H8.823Z" />
                  <path
                    fillRule="evenodd"
                    d="M5.707 4.293a1 1 0 0 0-1.414 1.414l14 14a1 1 0 0 0 1.414-1.414l-14-14zm1.414 1.414 11.172 11.172L7.121 5.707z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6 text-gray-800 dark:text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.133 12.632v-1.8a5.407 5.407 0 0 0-4.154-5.262.955.955 0 0 0 .021-.106V3.1a1 1 0 0 0-2 0v2.364a.933.933 0 0 0 .021.106 5.406 5.406 0 0 0-4.154 5.262v1.8C6.867 15.018 5 15.614 5 16.807 5 17.4 5 18 5.538 18h12.924C19 18 19 17.4 19 16.807c0-1.193-1.867-1.789-1.867-4.175Zm-13.267-.8a1 1 0 0 1-1-1 9.424 9.424 0 0 1 2.517-6.391A1.001 1.001 0 1 1 6.854 5.8a7.43 7.43 0 0 0-1.988 5.037 1 1 0 0 1-1 .995Zm16.268 0a1 1 0 0 1-1-1A7.431 7.431 0 0 0 17.146 5.8a1 1 0 0 1 1.471-1.354 9.424 9.424 0 0 1 2.517 6.391 1 1 0 0 1-1 .995ZM8.823 19a3.453 3.453 0 0 0 6.354 0H8.823Z" />
                </svg>
              )}
            </button>
            <button id="mute-music" onClick={() => {
              setMuteMusic(!muteMusic);
              window?.localStorage.setItem("muteMusic", (!muteMusic).toString());
            }
            }>
              {muteMusic ? (
                <svg
                  className="h-6 w-6 text-gray-800 dark:text-red-800"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  {/* music unmuted */}
                  <path d="M5.707 4.293a1 1 0 0 0-1.414 1.414l14 14a1 1 0 0 0 1.414-1.414l-.004-.005C21.57 16.498 22 13.938 22 12a9.972 9.972 0 0 0-2.929-7.071 1 1 0 1 0-1.414 1.414A7.972 7.972 0 0 1 20 12c0 1.752-.403 3.636-1.712 4.873l-1.433-1.433C17.616 14.37 18 13.107 18 12c0-1.678-.69-3.197-1.8-4.285a1 1 0 1 0-1.4 1.428A3.985 3.985 0 0 1 16 12c0 .606-.195 1.335-.59 1.996L13 11.586V6.135c0-1.696-1.978-2.622-3.28-1.536L7.698 6.284l-1.99-1.991ZM4 8h.586L13 16.414v1.451c0 1.696-1.978 2.622-3.28 1.536L5.638 16H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2Z" />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6 text-gray-800 dark:text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  {/* music muted */}
                  <path d="M13 6.037c0-1.724-1.978-2.665-3.28-1.562L5.638 7.933H4c-1.105 0-2 .91-2 2.034v4.066c0 1.123.895 2.034 2 2.034h1.638l4.082 3.458c1.302 1.104 3.28.162 3.28-1.562V6.037Z" />
                  <path
                    fillRule="evenodd"
                    d="M14.786 7.658a.988.988 0 0 1 1.414-.014A6.135 6.135 0 0 1 18 12c0 1.662-.655 3.17-1.715 4.27a.989.989 0 0 1-1.414.014 1.029 1.029 0 0 1-.014-1.437A4.085 4.085 0 0 0 16 12a4.085 4.085 0 0 0-1.2-2.904 1.029 1.029 0 0 1-.014-1.438Z"
                    clipRule="evenodd"
                  />
                  <path
                    fillRule="evenodd"
                    d="M17.657 4.811a.988.988 0 0 1 1.414 0A10.224 10.224 0 0 1 22 12c0 2.807-1.12 5.35-2.929 7.189a.988.988 0 0 1-1.414 0 1.029 1.029 0 0 1 0-1.438A8.173 8.173 0 0 0 20 12a8.173 8.173 0 0 0-2.343-5.751 1.029 1.029 0 0 1 0-1.438Z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
            <div id="login">
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
            </div>
          </nav>
        </div>
        <div className="flex h-[calc(100vh-theme(spacing.12)*2)] items-center justify-center bg-yellow-500">
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
                    onClick={handleClick}
                  >
                    {isIdle ? "Start Game" : "Matchmaking..."}
                  </motion.button>
                </div>
              </Form>
              <footer className="mb-auto flex hidden">
                <Toast message="Error - unable connect to game api gateway."></Toast>
              </footer>
            </div>
            <div className="my-5 flex flex-col justify-start">
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
        <div className="h-[theme(spacing.12)] flow flow-row items-center justify-center text-center">
          <div>Credits</div>
        </div>
      </div>
    </GameAudioContext.Provider>
  );
};

export default Game;
