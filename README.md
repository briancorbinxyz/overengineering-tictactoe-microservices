![Over-Engineering TicTacToe](https://github.com/user-attachments/assets/d90c22af-c730-4669-9f43-5e9132f676ce)

Over-Engineering Tic-Tac-Toe Microservices
---

Enterprise full-stack implementation for [Over-Engineered Tic-Tac-Toe](https://github.com/briancorbinxyz/overengineering-tictactoe) (Tic-Tac-Toe in Java deliberately over-engineered to apply features of Java introduced over time.)

<img width="824" alt="image" src="https://github.com/user-attachments/assets/7be48433-5bb6-4169-a8a9-8f4c69480c74">

This uses the PERQ stack:

- [Prisma](https://www.prisma.io)
- [Express](https://expressjs.com/)
- [Remix](https://quarkus.io/)
- [Quarkus](https://quarkus.io/)

For performant, modern enterprise Java-based cloud native services with Remix/React for server-side rendering.

WIP: Developed both due to my daughter's complaints that she didn't want to use the command-line and as a full-stack intermission/playground to pair with the ongoing blog post: [Road to JDK 25 - Over-Engineering Tic-Tac-Toe](https://thelifeof.briancorbin.xyz/Library/03-Resources/Road-to-JDK-25---Over-Engineering-Tic-Tac-Toe!) also serialized to Medium @ [Road to JDK 25 - Over-Engineering Tic-Tac-Toe On Medium](https://briancorbinxyz.medium.com/list/road-to-jdk-25-d0f656f66a8f).

### Build Dependencies

- NodeJS
- Quarkus

### Status

- Basic 3x3 Tic-Tac-Toe functionality supported: Player vs Player, Player vs Bot
- Advanced: Sound effects, music, Persistent sound configuration
- Pending: Tests, Error Handling, Configurability, Administration, Timeouts, Non-standard game setups, Analytics, Cloud configuration etc.

### Starting services

After installing the build dependencies.

1. Start [tictactoe-game-service]: `cd tictactoe-game-service && quarkus dev`
1. Start [tictactoe-api-gateway]: `cd tictactoe-api-gateway && quarkus dev`
1. Start [tictactoe-web-service]: `cd tictactoe-web-service && npm install & npm run dev`
1. Navigate to http://localhost:5173/games

---
