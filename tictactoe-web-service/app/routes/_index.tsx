import type { MetaFunction } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { useState } from "react";
import GameBoard from "~/components/gameboard";

// ======================================
// Controller
// ======================================

// Meta: Include meta-information
export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

// ======================================
// View
// ======================================

export default function Index() {
  const [game, setGame] = useState(initialGame);
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-16">
        <header className="flex flex-col items-center gap-9">
          <h1>Over-Engineering Tic-Tac-Toe</h1>
        </header>
        <nav className="flex flex-col items-center justify-center gap-1 rounded-3xl border border-gray-200 p-6 dark:border-gray-700">
          <div>
            <GameBoard game={game}></GameBoard>
          </div>
          <Form>
            <button className="border-gray-50">Join Game</button>
          </Form>
        </nav>
      </div>
    </div>
  );
}

// ======================================
// Model
// ======================================

const initialGame = {
  board: {
    dimension: 3,
    contents: ["", "", "", "", "", "", "", "", ""],
  },
};
