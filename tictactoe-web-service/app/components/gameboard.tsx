import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import invariant from "tiny-invariant";
import drawAudioUrl from "~/audio/game-draw.mp3";
import loseAudioUrl from "~/audio/game-lost.mp3";
import winAudioUrl from "~/audio/game-win.mp3";
import moveAudioUrl from "~/audio/player-move.mp3";
import clickFailAudioUrl from "~/audio/click-fail.mp3";
import type { GameState } from "~/models/game";
import { makeMove } from "~/services/game.api";

const GameBoard = ({ state, gameId, activePlayerId }: GameState) => {
  const { dimension, contents } = state.board;
  const [moveAudio, setMoveAudio] = useState<HTMLAudioElement>();
  const [loseAudio, setLoseAudio] = useState<HTMLAudioElement>();
  const [winAudio, setWinAudio] = useState<HTMLAudioElement>();
  const [drawAudio, setDrawAudio] = useState<HTMLAudioElement>();
  const [clickFailAudio, setClickFailAudio] = useState<HTMLAudioElement>();
  const [statusText, setStatusText] = useState<string>("");

  // Set up audio
  useEffect(() => {
    // Audio is only available on the browser (client) side
    setMoveAudio(new Audio(moveAudioUrl));
    setLoseAudio(new Audio(loseAudioUrl));
    setWinAudio(new Audio(winAudioUrl));
    setDrawAudio(new Audio(drawAudioUrl));
    setClickFailAudio(new Audio(clickFailAudioUrl));
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
        if (state.board.contents[locationId] === "") {
          if (moveAudio) {
            moveAudio.currentTime = 0;
            await moveAudio?.play();
          }
          await makeMove(gameId, locationId, activePlayerId?.marker);
        } else {
          if (clickFailAudio) {
            clickFailAudio.currentTime = 0;
            clickFailAudio.play();
          }
        }
      } else {
        if (clickFailAudio) {
          clickFailAudio.currentTime = 0;
          clickFailAudio.play();
        }
        console.log("Move attempted when not active player", locationId);
      }
    } else {
      console.debug("Clicked", locationId);
    }
  };

  useEffect(() => {
    setStatusText(gameStatus());
  }, [state]);

  const gameStatus = () => {
    if (state.completed) {
      if (state.winning_player_index !== undefined) {
        if (state.winning_player_index !== activePlayerId?.index) {
          if (loseAudio) {
            loseAudio.currentTime = 0;
            loseAudio.play();
          }
        } else {
          if (winAudio) {
            winAudio.currentTime = 0;
            winAudio.play();
          }
        }
        return `Player ${state.players[state.winning_player_index].marker} wins!`;
      } else {
        if (drawAudio) {
          drawAudio.currentTime = 0;
          drawAudio.play();
        }
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
        {gameId ? statusText : ""}
      </div>
    </div>
  );
};

export default GameBoard;
