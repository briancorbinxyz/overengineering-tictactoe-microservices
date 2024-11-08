export const startGame = async () => {
  return fetch("http://localhost:9010/games/join");
};
