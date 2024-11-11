export const makeMove = async (
  gameId: string,
  location: number,
  playerMarker: string,
) => {
  return fetch(
    `http://localhost:9010/games/${gameId}/makeMove?location=${location}`,
  );
};

export const gameExists = async (gameId: string) => {
  return fetch(`http://localhost:9010/games/${gameId}/exists`);
};