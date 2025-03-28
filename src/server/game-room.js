/**
 * Game Room
 * Represents a game session with two players
 */
class GameRoom {
    constructor(roomCode) {
        this.roomCode = roomCode;
        this.players = new Map(); // Map of socket ID to player type (monkey/fox)
        this.playerTypes = new Map(); // Map of player type to socket ID
        this.gameState = {
            status: 'waiting_for_opponent',
            currentPlayer: 'monkey', // Monkey always starts
            boardState: [],
            abilities: {
                monkey: {
                    jump: { cooldown: 0 },
                    swap: { cooldown: 0 },
                    block: { cooldown: 0 }
                },
                fox: {
                    jump: { cooldown: 0 },
                    swap: { cooldown: 0 },
                    block: { cooldown: 0 }
                }
            },
            blockedTiles: [], // Array of [x, y, turnsRemaining]
            winner: null
        };
    }
    
    // Player methods
    addPlayer(socketId, playerType) {
        this.players.set(socketId, playerType);
        this.playerTypes.set(playerType, socketId);
    }
    
    removePlayer(socketId) {
        const playerType = this.players.get(socketId);
        if (playerType) {
            this.playerTypes.delete(playerType);
            this.players.delete(socketId);
        }
    }
    
    hasPlayer(socketId) {
        return this.players.has(socketId);
    }
    
    getPlayerType(socketId) {
        return this.players.get(socketId);
    }
    
    getPlayerSocket(playerType) {
        return this.playerTypes.get(playerType);
    }
    
    isFull() {
        return this.players.size >= 2;
    }
    
    isEmpty() {
        return this.players.size === 0;
    }
    
    isPlayerTurn(socketId) {
        const playerType = this.players.get(socketId);
        return playerType === this.gameState.currentPlayer;
    }
    
    // Game methods
    startGame() {
        // Initialize board state with pieces in their starting positions
        this.initializeBoardState();
        
        // Set game status to in progress
        this.gameState.status = 'in_progress';
    }
    
    initializeBoardState() {
        this.gameState.boardState = [];
        
        // Add monkey pieces
        const monkeyPositions = [
            [1, 0], [3, 0], [5, 0], [7, 0],
            [0, 1], [2, 1], [4, 1], [6, 1],
            [1, 2], [3, 2], [5, 2], [7, 2]
        ];
        
        monkeyPositions.forEach((pos, index) => {
            this.gameState.boardState.push({
                id: `monkey_${index}`,
                type: 'monkey',
                x: pos[0],
                y: pos[1]
            });
        });
        
        // Add fox pieces
        const foxPositions = [
            [0, 5], [2, 5], [4, 5], [6, 5],
            [1, 6], [3, 6], [5, 6], [7, 6],
            [0, 7], [2, 7], [4, 7], [6, 7]
        ];
        
        foxPositions.forEach((pos, index) => {
            this.gameState.boardState.push({
                id: `fox_${index}`,
                type: 'fox',
                x: pos[0],
                y: pos[1]
            });
        });
    }
    
    movePiece(pieceId, toX, toY) {
        // Find the piece
        const piece = this.gameState.boardState.find(p => p.id === pieceId);
        
        if (!piece) {
            return { success: false, message: 'Piece not found' };
        }
        
        // Check if it's the player's turn
        if (piece.type !== this.gameState.currentPlayer) {
            return { success: false, message: 'Not your piece' };
        }
        
        // Check if the move is valid
        if (!this.isValidMove(piece, toX, toY)) {
            return { success: false, message: 'Invalid move' };
        }
        
        // Check if the destination tile is blocked
        if (this.isTileBlocked(toX, toY)) {
            return { success: false, message: 'This tile is blocked' };
        }
        
        // Move the piece
        piece.x = toX;
        piece.y = toY;
        
        // Check for win condition
        if (this.checkWinCondition()) {
            this.gameState.status = 'finished';
            return { success: true };
        }
        
        // Reduce cooldowns for the current player's abilities
        this.reduceCooldowns();
        
        // Reduce turns remaining on blocked tiles
        this.updateBlockedTiles();
        
        // Switch turns
        this.gameState.currentPlayer = this.gameState.currentPlayer === 'monkey' ? 'fox' : 'monkey';
        
        return { success: true };
    }
    
    useAbility(socketId, ability) {
        const playerType = this.players.get(socketId);
        
        // Check if the ability exists
        if (!this.gameState.abilities[playerType][ability]) {
            return { success: false, message: 'Ability not found' };
        }
        
        // Check if the ability is on cooldown
        if (this.gameState.abilities[playerType][ability].cooldown > 0) {
            return { success: false, message: 'Ability is on cooldown' };
        }
        
        // Apply the ability effect
        let success = false;
        
        switch (ability) {
            case 'jump':
                // Double Jump ability - allows a piece to move twice in one turn
                // This will be handled on the client side
                this.gameState.abilities[playerType][ability].cooldown = 3;
                success = true;
                break;
                
            case 'swap':
                // Swap ability - allows swapping positions of two friendly pieces
                // This will be implemented in more detail later
                this.gameState.abilities[playerType][ability].cooldown = 5;
                success = true;
                break;
                
            case 'block':
                // Block ability - blocks a tile for 2 turns
                // This will be implemented in more detail later
                this.gameState.abilities[playerType][ability].cooldown = 4;
                success = true;
                break;
        }
        
        if (success) {
            return { success: true };
        } else {
            return { success: false, message: 'Failed to use ability' };
        }
    }
    
    // Game state checks
    isValidMove(piece, toX, toY) {
        // Check if the destination is within the board
        if (toX < 0 || toX >= 8 || toY < 0 || toY >= 8) {
            return false;
        }
        
        // Check if the destination is already occupied
        if (this.gameState.boardState.some(p => p.x === toX && p.y === toY)) {
            return false;
        }
        
        // Calculate move distance
        const dx = Math.abs(toX - piece.x);
        const dy = Math.abs(toY - piece.y);
        
        // Check if the move is diagonal
        if (dx !== dy) {
            return false;
        }
        
        // Check for direction based on player type
        // Monkey can only move down (increasing y) and Fox can only move up (decreasing y)
        if (piece.type === 'monkey' && toY < piece.y) {
            return false;
        }
        
        if (piece.type === 'fox' && toY > piece.y) {
            return false;
        }
        
        // Check if the move is one tile diagonal
        return dx === 1 && dy === 1;
    }
    
    isTileBlocked(x, y) {
        return this.gameState.blockedTiles.some(tile => tile[0] === x && tile[1] === y && tile[2] > 0);
    }
    
    checkWinCondition() {
        // Win condition 1: A player reaches the opposite side of the board
        // Monkey reaches row 7, Fox reaches row 0
        for (const piece of this.gameState.boardState) {
            if (piece.type === 'monkey' && piece.y === 7) {
                this.gameState.winner = 'monkey';
                return true;
            }
            
            if (piece.type === 'fox' && piece.y === 0) {
                this.gameState.winner = 'fox';
                return true;
            }
        }
        
        // Win condition 2: A player loses all their pieces
        const monkeyPieces = this.gameState.boardState.filter(p => p.type === 'monkey');
        const foxPieces = this.gameState.boardState.filter(p => p.type === 'fox');
        
        if (monkeyPieces.length === 0) {
            this.gameState.winner = 'fox';
            return true;
        }
        
        if (foxPieces.length === 0) {
            this.gameState.winner = 'monkey';
            return true;
        }
        
        return false;
    }
    
    reduceCooldowns() {
        // Reduce cooldowns for the current player's abilities
        const abilities = this.gameState.abilities[this.gameState.currentPlayer];
        
        for (const abilityName in abilities) {
            if (abilities[abilityName].cooldown > 0) {
                abilities[abilityName].cooldown--;
            }
        }
    }
    
    updateBlockedTiles() {
        // Reduce turns remaining on blocked tiles
        for (let i = 0; i < this.gameState.blockedTiles.length; i++) {
            this.gameState.blockedTiles[i][2]--;
        }
        
        // Remove tiles that are no longer blocked
        this.gameState.blockedTiles = this.gameState.blockedTiles.filter(tile => tile[2] > 0);
    }
    
    // Game state getters
    getGameState() {
        return {
            status: this.gameState.status,
            currentPlayer: this.gameState.currentPlayer,
            boardState: this.gameState.boardState,
            abilities: this.gameState.abilities,
            winner: this.gameState.winner
        };
    }
    
    isGameOver() {
        return this.gameState.status === 'finished';
    }
    
    getWinner() {
        return this.gameState.winner;
    }
}

module.exports = GameRoom; 