import invariant from "tiny-invariant";
import type { GameState } from "~/models/game";
import { makeMove } from "~/services/game.api"

const GameBoard = ({state, game_id}: GameState) => {
  const { dimension, contents } = state.board;

  // Break the contents array into rows based on the board's dimension
  const rows = Array.from({ length: dimension }, (_, rowIndex) => {
    const start = rowIndex * dimension;
    const end = start + dimension;
    return contents.slice(start, end);
  });

  // Make a move
  const handleClick = async (event: React.MouseEvent) => {
    const locationId: number = +(event.target as HTMLDivElement).id;
    invariant(!isNaN(locationId), "Event target should have a valid numeric id");

    if (game_id) {
        console.log("Move selected", locationId);
        await makeMove(game_id, locationId, "")
    } else {
        console.debug("Clicked", locationId);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      {rows.map((row, rowIndex) => (
        <div className="flex flex-row gap-1" key={rowIndex}>
          {row.map((marker, markerIndex) => (
            <div
              className="flex h-9 w-9 items-center justify-center rounded-md border text-3xl dark:border-gray-50"
              key={markerIndex}
              onClick={handleClick}
              id={String(rowIndex * dimension + markerIndex)}
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
