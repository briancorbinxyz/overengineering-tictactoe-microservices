// =============================================================================
// Model
// =============================================================================

// Game State
export type Game = {
  game: {
    board: {
      dimension: number;
      contents: string[];
    };
  };
};

export const initialGame = {
  board: {
    dimension: 3,
    contents: ["", "", "", "", "", "", "", "", ""],
  },
};