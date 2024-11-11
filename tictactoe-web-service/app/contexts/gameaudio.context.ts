import { createContext } from "react";

type GameAudioContextType = {
  muteMusic: boolean;
  muteSfx: boolean;
};

const GameAudioContext = createContext<GameAudioContextType>({
  muteMusic: false,
  muteSfx: false,
});

export default GameAudioContext;
