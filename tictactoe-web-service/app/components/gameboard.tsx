import type { Game } from "~/models/game";

const GameBoard = ({ game }: Game) => {
  const { dimension, contents } = game.board;

  // Break the contents array into rows based on the board's dimension
  const rows = Array.from({ length: dimension }, (_, rowIndex) => {
    const start = rowIndex * dimension;
    const end = start + dimension;
    return contents.slice(start, end);
  });

  return (
    <div className="flex flex-col gap-1">
      {rows.map((row, rowIndex) => (
        <div className="flex flex-row gap-1" key={rowIndex}>
          {row.map((marker, markerIndex) => (
            <div
              className="flex h-9 w-9 items-center justify-center rounded-md border text-3xl dark:border-gray-50"
              key={markerIndex}
            >
              {marker}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default GameBoard;
