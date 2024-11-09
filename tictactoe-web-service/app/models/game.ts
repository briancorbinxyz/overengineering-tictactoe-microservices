// =============================================================================
// Model
// =============================================================================

// Game State
export type GameState = {
  gameId: string | null;
  state: {
    board: {
      dimension: number;
      contents: string[];
    };
    current_player_index: number;
    players: GamePlayer[];
    completed: boolean;
    winning_player_index: number | undefined;
  };
};

export type GamePlayer = {
  index: number,
  marker: string,
}

export const initialGameState: GameState = {
  gameId: null,
  state: {
    board: {
      dimension: 3,
      contents: ["", "", "", "", "", "", "", "", ""],
    },
    current_player_index: 0,
    players: [
      { index: 0, marker: "X" } , { index: 1, marker: "O" } 
    ],
    completed: false,
    winning_player_index: undefined,
  },
};
