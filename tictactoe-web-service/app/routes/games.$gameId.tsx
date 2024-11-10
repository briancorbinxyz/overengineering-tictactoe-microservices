import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import invariant from "tiny-invariant";
import gameAudioUrl from "~/audio/itty-bitty-8-bit-kevin-macleod-main-version-7983-03-13.mp3";
import GameBoard from "~/components/gameboard";
import { initialGameState } from "~/models/game";
import { commitSession, getSession } from "~/sessions";

// =============================================================================
// Controller
// =============================================================================

// The live game data returnable from the loader
type GameData = {
  gameId: string;
  playerId: PlayerData;
};

type PlayerData = {
  index: number;
  marker: string;
};

// Remix Route: loader
export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  const gameId = params.gameId;

  if (session.has("gameId") && session.get("gameId") === gameId) {
    console.log("Participant entered game", params.gameId);
    // The current user is a participant in this game
    const playerId = session.get("playerId") as PlayerData | undefined;
    invariant(gameId, "Participating player should have a game id");
    invariant(playerId, "Participating player should have an id");

    const liveGameData: GameData = {
      gameId: gameId,
      playerId: playerId,
    };
    return json(liveGameData, {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } else {
    // The current user is a guest in this game
    console.log("Guest entered game", params.gameId);
    return json(
      { gameId: gameId, playerId: undefined },
      {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      },
    );
  }
};

const subscribeToGame = (gameId: string) => {
  console.info("Subscribing to game:", gameId);
  return new EventSource(`http://localhost:9010/games/${gameId}/subscribe`);
};
// =============================================================================
// View
// =============================================================================

export default function Game() {
  // Read
  // - Game ID
  const { gameId, playerId } = useLoaderData<typeof loader>();
  invariant(gameId, "A valid game id is required");
  // - Subscribe to the game events
  const [gameEvent, setGameEvent] = useState(initialGameState.state);
  const [gameAudio, setGameAudio] = useState<HTMLAudioElement>();

  // Run once on mount
  useEffect(() => {
    setGameAudio(new Audio(gameAudioUrl));
  }, []);

  // Every time there is a new game
  useEffect(() => {
    if (gameAudio) {
      gameAudio.currentTime = 0;
      gameAudio.volume = 1;
      gameAudio.play();
    }

    const eventSource = subscribeToGame(gameId);

    eventSource.onmessage = (event) => {
      console.log("Data:", event.data);
      const newState = JSON.parse(event.data).state;
      if (newState.completed && gameAudio) {
        setTimeout(async () => {
          // Fade out the game audio
          for (let i = 1; i <= 10; i++) {
            gameAudio.volume = 1 - i * 0.1;
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
          await gameAudio.pause();
        }, 1000);
        console.log("Game completed");
      }
      setGameEvent(newState);
    };

    eventSource.onerror = (error) => {
      console.error("Error:", error);
      eventSource.close();
    };

    return () => {
      gameAudio?.pause();
      eventSource.close();
    };
  }, [gameId, gameAudio]);

  // Render
  return (
    <main className="border-gray-50">
      <div className="flex justify-center font-['Strong_Young'] text-xl text-blue-900">
        Welcome {playerId !== undefined ? "Player " + playerId.marker : "Guest"}
        !
      </div>
      <GameBoard state={gameEvent} gameId={gameId} activePlayerId={playerId} />
    </main>
  );
}
