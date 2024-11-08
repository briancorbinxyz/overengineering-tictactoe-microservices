// =============================================================================
// Model
// =============================================================================

// Game State
export type GameState = {
  game_id: string | null;
  state: {
    board: {
      dimension: number;
      contents: string[];
    };
  };
};

export const initialGameState: GameState = {
  game_id: null,
  state: {
    board: {
      dimension: 3,
      contents: ["", "", "", "", "", "", "", "", ""],
    },
  },
};
