import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import invariant from "tiny-invariant";
import moveAudioUrl from "~/audio/bubble-pop-ding-betacut-1-00-01.mp3";
import type { GameState } from "~/models/game";
import { makeMove } from "~/services/game.api";

const GameBoard = ({ state, gameId, activePlayerId }: GameState) => {
  const { dimension, contents } = state.board;
  const [moveAudio, setMoveAudio] = useState<HTMLAudioElement>();

  // Set up audio
  useEffect(() => {
    // Audio is only available on the browser (client) side
    setMoveAudio(new Audio(moveAudioUrl));
  }, []);

  // Break the contents array into rows based on the board's dimension
  const rows = Array.from({ length: dimension }, (_, rowIndex) => {
    const start = rowIndex * dimension;
    const end = start + dimension;
    return contents.slice(start, end);
  });

  // Make a move
  const handleClick = async (event: React.MouseEvent) => {
    const locationId: number = +(event.target as HTMLDivElement).id;
    invariant(
      !isNaN(locationId),
      "Event target should have a valid numeric id",
    );

    // Only allow the active player to make a move
    if (gameId && activePlayerId && !state.completed) {
      if (state.current_player_index == activePlayerId.index) {
        console.log("Move selected", locationId);
        await makeMove(gameId, locationId, activePlayerId?.marker);
        if (moveAudio) {
          moveAudio.currentTime = 0;
          await moveAudio?.play();
        }
      } else {
        // TODO: Make more visible
        console.log("Move attempted when not active player", locationId);
      }
    } else {
      console.debug("Clicked", locationId);
    }
  };

  const gameStatus = () => {
    if (state.completed) {
      if (state.winning_player_index !== undefined) {
        return `Player ${state.players[state.winning_player_index].marker} wins!`;
      } else {
        return "It's a draw!";
      }
    } else {
      return `Turn: ${state.players[state.current_player_index].marker}`;
    }
  };

  return (
    <div key={contents.join("")}>
      <div className="flex flex-col gap-2">
        {rows.map((row, rowIndex) => (
          <div className="flex flex-row gap-2" key={rowIndex}>
            {row.map((marker, markerIndex) => (
              <motion.button
                whileHover={{ scale: 1.15 }}
                className={`flex h-14 w-14 ${marker === activePlayerId?.marker ? "text-blue-900" : ""} items-center justify-center border-opacity-45 bg-yellow-700 bg-opacity-20 font-['Strong_Young'] text-6xl dark:border-gray-50`}
                key={markerIndex}
                onClick={handleClick}
                id={String(rowIndex * dimension + markerIndex)}
              >
                <div className="">{marker}</div>
              </motion.button>
            ))}
          </div>
        ))}
      </div>
      <div className="flex justify-center font-['Strong_Young'] text-black">
        {gameId ? gameStatus() : ""}
      </div>
    </div>
  );
};

export default GameBoard;
