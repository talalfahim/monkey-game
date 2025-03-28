const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Import game logic
const GameRoom = require('./game-room');

// Create express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files
app.use(express.static(path.join(__dirname, '../../public')));

// Store active game rooms
const gameRooms = new Map();

// Socket.io connection
io.on('connection', (socket) => {
    console.log('New client connected', socket.id);
    
    // Create a new game room
    socket.on('create_room', () => {
        // Generate a unique room code
        const roomCode = generateRoomCode();
        
        // Create a new game room
        const gameRoom = new GameRoom(roomCode);
        gameRooms.set(roomCode, gameRoom);
        
        // Join the room
        socket.join(roomCode);
        
        // Add the player to the game
        gameRoom.addPlayer(socket.id, 'monkey');
        
        // Send room code to the client
        socket.emit('room_created', { roomCode });
        
        console.log(`Room created: ${roomCode}`);
    });
    
    // Join an existing game room
    socket.on('join_room', (data) => {
        const { roomCode } = data;
        
        // Check if the room exists
        if (!gameRooms.has(roomCode)) {
            socket.emit('error', { message: 'Room does not exist' });
            return;
        }
        
        const gameRoom = gameRooms.get(roomCode);
        
        // Check if the room is full
        if (gameRoom.isFull()) {
            socket.emit('room_full');
            return;
        }
        
        // Join the room
        socket.join(roomCode);
        
        // Add the player to the game
        gameRoom.addPlayer(socket.id, 'fox');
        
        // Notify the client
        socket.emit('room_joined', { roomCode });
        
        // Notify the other player
        socket.to(roomCode).emit('player_joined');
        
        console.log(`Player joined room: ${roomCode}`);
    });
    
    // Start the game
    socket.on('game_start', (data) => {
        const { roomCode } = data;
        
        // Check if the room exists
        if (!gameRooms.has(roomCode)) {
            socket.emit('error', { message: 'Room does not exist' });
            return;
        }
        
        const gameRoom = gameRooms.get(roomCode);
        
        // Check if the player is in the room
        if (!gameRoom.hasPlayer(socket.id)) {
            socket.emit('error', { message: 'You are not in this room' });
            return;
        }
        
        // Start the game
        gameRoom.startGame();
        
        // Get initial game state
        const gameState = gameRoom.getGameState();
        
        // Notify all players in the room
        io.to(roomCode).emit('game_start', gameState);
        
        console.log(`Game started in room: ${roomCode}`);
    });
    
    // Move a piece
    socket.on('move_piece', (data) => {
        const { roomCode, pieceId, toX, toY } = data;
        
        // Check if the room exists
        if (!gameRooms.has(roomCode)) {
            socket.emit('error', { message: 'Room does not exist' });
            return;
        }
        
        const gameRoom = gameRooms.get(roomCode);
        
        // Check if the player is in the room
        if (!gameRoom.hasPlayer(socket.id)) {
            socket.emit('error', { message: 'You are not in this room' });
            return;
        }
        
        // Check if it's the player's turn
        if (!gameRoom.isPlayerTurn(socket.id)) {
            socket.emit('error', { message: 'It is not your turn' });
            return;
        }
        
        // Move the piece
        const moveResult = gameRoom.movePiece(pieceId, toX, toY);
        
        if (!moveResult.success) {
            socket.emit('error', { message: moveResult.message });
            return;
        }
        
        // Get updated game state
        const gameState = gameRoom.getGameState();
        
        // Check if the game is over
        if (gameRoom.isGameOver()) {
            // Notify all players
            io.to(roomCode).emit('game_over', { 
                winner: gameRoom.getWinner(),
                boardState: gameState.boardState
            });
            
            console.log(`Game over in room: ${roomCode}, winner: ${gameRoom.getWinner()}`);
            
            // Remove the room after a delay
            setTimeout(() => {
                gameRooms.delete(roomCode);
                console.log(`Room removed: ${roomCode}`);
            }, 60000); // Remove after 1 minute
            
            return;
        }
        
        // Notify all players of the update
        io.to(roomCode).emit('game_update', gameState);
        
        console.log(`Piece moved in room: ${roomCode}`);
    });
    
    // Use an ability
    socket.on('use_ability', (data) => {
        const { roomCode, ability } = data;
        
        // Check if the room exists
        if (!gameRooms.has(roomCode)) {
            socket.emit('error', { message: 'Room does not exist' });
            return;
        }
        
        const gameRoom = gameRooms.get(roomCode);
        
        // Check if the player is in the room
        if (!gameRoom.hasPlayer(socket.id)) {
            socket.emit('error', { message: 'You are not in this room' });
            return;
        }
        
        // Check if it's the player's turn
        if (!gameRoom.isPlayerTurn(socket.id)) {
            socket.emit('error', { message: 'It is not your turn' });
            return;
        }
        
        // Use the ability
        const abilityResult = gameRoom.useAbility(socket.id, ability);
        
        if (!abilityResult.success) {
            socket.emit('error', { message: abilityResult.message });
            return;
        }
        
        // Get updated game state
        const gameState = gameRoom.getGameState();
        
        // Notify all players of the update
        io.to(roomCode).emit('game_update', gameState);
        
        console.log(`Ability used in room: ${roomCode}`);
    });
    
    // Disconnect
    socket.on('disconnect', () => {
        console.log('Client disconnected', socket.id);
        
        // Check all rooms for the player
        for (const [roomCode, gameRoom] of gameRooms.entries()) {
            if (gameRoom.hasPlayer(socket.id)) {
                // Remove the player from the room
                gameRoom.removePlayer(socket.id);
                
                // If the room is empty, remove it
                if (gameRoom.isEmpty()) {
                    gameRooms.delete(roomCode);
                    console.log(`Room removed: ${roomCode}`);
                } else {
                    // Notify remaining players
                    io.to(roomCode).emit('player_left');
                }
                
                break;
            }
        }
    });
});

// Generate a random 6-character room code
function generateRoomCode() {
    // Generate a code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Ensure it's unique
    if (gameRooms.has(code)) {
        return generateRoomCode();
    }
    
    return code;
}

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
}); 