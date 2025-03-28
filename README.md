# Monkey vs Fox Board Game

A 2-player multiplayer strategy board game where monkeys battle foxes on a diagonal grid.

## Game Description

This is a strategic board game where two players, represented by Monkeys and Foxes, compete to reach the opposite side of the board or eliminate all opponent pieces.

### Features

- Real-time multiplayer gameplay
- Room/lobby system with join codes
- Diagonal movement on an 8x8 board
- 12 pieces per player
- Special abilities with cooldowns:
  - Double Jump: Move a piece twice in one turn
  - Swap: Exchange positions of two friendly pieces
  - Block: Make a tile impassable for 2 turns

## How to Play

1. The first player creates a game and receives a room code
2. The second player joins using the room code
3. The game begins with the Monkey player making the first move
4. Players take turns moving their pieces diagonally:
   - Monkeys can only move diagonally downward
   - Foxes can only move diagonally upward
5. Use special abilities strategically to gain an advantage

### Win Conditions

Win the game by either:
1. Moving one of your pieces to the opposite side of the board
2. Capturing all of your opponent's pieces

## Technical Details

This game is built using:
- Frontend: HTML5, CSS3, JavaScript
- Backend: Node.js with Express
- Real-time Communication: Socket.io

## Setup and Installation

1. Clone the repository:
```
git clone https://github.com/talalfahim/monkey-game.git
```

2. Navigate to the project directory:
```
cd monkey-game
```

3. Install dependencies:
```
npm install
```

4. Start the server:
```
npm start
```

5. Open your browser and navigate to:
```
http://localhost:3000
```

## Development

To run the server in development mode with automatic restarts:
```
npm run dev
```

## Future Enhancements

- Add piece capturing mechanics
- Implement more abilities
- Create a single-player mode against AI
- Add sound effects and animations
- Implement a ranking system

## License

MIT License 