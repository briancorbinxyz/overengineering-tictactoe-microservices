<img alt="image" src="https://github.com/user-attachments/assets/d90c22af-c730-4669-9f43-5e9132f676ce">

Over-Engineering Tic-Tac-Toe Microservices
---

Enterprise full-stack implementation for [Over-Engineered Tic-Tac-Toe](https://github.com/briancorbinxyz/overengineering-tictactoe) (Tic-Tac-Toe in Java deliberately over-engineered to apply features of Java introduced over time.)
<img width="824" alt="overengineering tic-tac-toe the game" src="https://github.com/user-attachments/assets/7be48433-5bb6-4169-a8a9-8f4c69480c74">

This uses what I like to call the PERQ stack:

- [Prisma](https://www.prisma.io)
- [Express](https://expressjs.com/)
- [Remix](https://quarkus.io/)
- [Quarkus](https://quarkus.io/)

For performant, modern enterprise Java-based cloud native services with Remix/React for server-side rendering.

WIP: Developed both due to my daughter's complaints that she didn't want to use the command-line and as a full-stack intermission/playground to pair with the ongoing blog post: [Road to JDK 25 - Over-Engineering Tic-Tac-Toe](https://thelifeof.briancorbin.xyz/Library/03-Resources/Road-to-JDK-25---Over-Engineering-Tic-Tac-Toe!) also serialized to Medium @ [Road to JDK 25 - Over-Engineering Tic-Tac-Toe On Medium](https://briancorbinxyz.medium.com/list/road-to-jdk-25-d0f656f66a8f).

Nothing says over-engineering like a full-stack service implementation just to play tic-tac-toe!

### Build Dependencies

- NodeJS
- Quarkus

### Status

- Basic 3x3 Tic-Tac-Toe functionality supported: Player vs Player, Player vs Bot
- Advanced: Sound effects, music, Persistent sound configuration
- Pending: Tests, Error Handling, Configurability, Administration, Timeouts, Non-standard game setups, Analytics, Cloud configuration, Network play etc.

### Services

1. [tictactoe-game-service](tictactoe-game-service): gRPC-based service for game logic and game management (Java/Quarkus)
1. [tictactoe-api-gateway](tictactoe-api-gateway): REST service for game api (Java/Quarkus)
1. [tictactoe-web-service](tictactoe-web-service): Web service for game UI (Typescript/Remix)

### Quick Start

#### Dependency Installation

If you don't have Java 23 installed on your system you can install it first with SDKMAN (Windows Users should use WSL: https://sdkman.io/install/):

```bash
curl -s "https://get.sdkman.io" | bash
```

Using SDKMAN you can then easily install Java Dependencies:

```bash
sdk install java 23-tem
sdk install quarkus
sdk install gradle
```

If you don't have Node installed on your system you can install it using NVM:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# Download and install Node.js:
nvm install 22
node -v
```

#### Starting services

After installing the build dependencies you will need to run all services in order to develop against/use the game.

1. Start [tictactoe-game-service](tictactoe-game-service): `cd tictactoe-game-service && quarkus dev`
1. Start [tictactoe-api-gateway](tictactoe-api-gateway): `cd tictactoe-api-gateway && quarkus dev`
1. Start [tictactoe-web-service](tictactoe-web-service): `cd tictactoe-web-service && npm install & npm run dev`
1. Navigate to http://localhost:5173/games
1. Hit "Start Game" and wait to play vs. bot. Alternatively, open another private window to http://localhost:5173/games and Hit "Start Game" again to play player vs. player, locally.

---
