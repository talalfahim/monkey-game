/**
 * Game Manager
 * Handles game logic and communication with the server
 */

class GameManager {
    constructor() {
        // Initialize socket connection
        this.socket = io();
        
        // Game state
        this.gameState = {
            roomCode: null,
            playerType: null,
            isMyTurn: false,
            selectedPiece: null,
            boardState: [],
            validMoves: [],
            gameStatus: GAME_CONFIG.GAME_STATES.WAITING,
            abilities: {
                jump: { cooldown: 0, name: 'Double Jump' },
                swap: { cooldown: 0, name: 'Swap' },
                block: { cooldown: 0, name: 'Block' }
            }
        };
        
        // Set up socket event listeners
        this.setupSocketEvents();
    }
    
    setupSocketEvents() {
        // Connection events
        this.socket.on(GAME_CONFIG.EVENTS.CONNECT, () => {
            console.log('Connected to server');
        });
        
        this.socket.on(GAME_CONFIG.EVENTS.DISCONNECT, () => {
            console.log('Disconnected from server');
        });
        
        // Room events
        this.socket.on(GAME_CONFIG.EVENTS.ROOM_CREATED, (data) => {
            console.log('Room created:', data);
            this.gameState.roomCode = data.roomCode;
            this.gameState.playerType = GAME_CONFIG.PLAYER_TYPES.MONKEY; // First player is Monkey
            uiManager.setRoomCode(data.roomCode);
        });
        
        this.socket.on(GAME_CONFIG.EVENTS.PLAYER_JOINED, () => {
            console.log('Player joined the room');
            uiManager.enableStartButton();
            this.gameState.gameStatus = GAME_CONFIG.GAME_STATES.READY;
        });
        
        this.socket.on(GAME_CONFIG.EVENTS.ROOM_JOINED, (data) => {
            console.log('Joined room:', data);
            this.gameState.roomCode = data.roomCode;
            this.gameState.playerType = GAME_CONFIG.PLAYER_TYPES.FOX; // Second player is Fox
            uiManager.showScreen('game'); // Go directly to game screen
        });
        
        this.socket.on(GAME_CONFIG.EVENTS.ROOM_FULL, () => {
            console.log('Room is full');
            alert('This room is already full. Please try another room code.');
        });
        
        // Game events
        this.socket.on(GAME_CONFIG.EVENTS.GAME_START, (data) => {
            console.log('Game started:', data);
            this.gameState.gameStatus = GAME_CONFIG.GAME_STATES.IN_PROGRESS;
            this.gameState.boardState = data.boardState;
            this.gameState.isMyTurn = data.currentPlayer === this.gameState.playerType;
            
            // Update UI
            uiManager.updatePlayerTurn(data.currentPlayer);
            uiManager.createBoardUI(this.gameState.boardState, this.gameState.playerType);
        });
        
        this.socket.on(GAME_CONFIG.EVENTS.GAME_UPDATE, (data) => {
            console.log('Game updated:', data);
            this.gameState.boardState = data.boardState;
            this.gameState.isMyTurn = data.currentPlayer === this.gameState.playerType;
            this.gameState.selectedPiece = null;
            this.gameState.validMoves = [];
            
            // Update abilities cooldowns
            Object.keys(this.gameState.abilities).forEach(ability => {
                if (data.abilities && data.abilities[this.gameState.playerType] && 
                    data.abilities[this.gameState.playerType][ability]) {
                    this.gameState.abilities[ability].cooldown = 
                        data.abilities[this.gameState.playerType][ability].cooldown;
                }
            });
            
            // Update UI
            uiManager.updatePlayerTurn(data.currentPlayer);
            uiManager.updateAbilityCooldowns(this.gameState.abilities);
            uiManager.createBoardUI(this.gameState.boardState, this.gameState.playerType);
        });
        
        this.socket.on(GAME_CONFIG.EVENTS.GAME_OVER, (data) => {
            console.log('Game over:', data);
            this.gameState.gameStatus = GAME_CONFIG.GAME_STATES.FINISHED;
            uiManager.showGameResult(data.winner);
        });
        
        // Error events
        this.socket.on(GAME_CONFIG.EVENTS.ERROR, (data) => {
            console.error('Error:', data);
            alert(`Error: ${data.message}`);
        });
    }
    
    // Room methods
    createRoom() {
        this.socket.emit(GAME_CONFIG.EVENTS.CREATE_ROOM);
    }
    
    joinRoom(roomCode) {
        this.socket.emit(GAME_CONFIG.EVENTS.JOIN_ROOM, { roomCode });
    }
    
    startGame() {
        this.socket.emit(GAME_CONFIG.EVENTS.GAME_START, { roomCode: this.gameState.roomCode });
    }
    
    leaveGame() {
        // Reset game state
        this.gameState = {
            roomCode: null,
            playerType: null,
            isMyTurn: false,
            selectedPiece: null,
            boardState: [],
            validMoves: [],
            gameStatus: GAME_CONFIG.GAME_STATES.WAITING,
            abilities: {
                jump: { cooldown: 0, name: 'Double Jump' },
                swap: { cooldown: 0, name: 'Swap' },
                block: { cooldown: 0, name: 'Block' }
            }
        };
        
        // Disconnect and reconnect to reset socket state
        this.socket.disconnect();
        this.socket.connect();
    }
    
    // Game methods
    selectPiece(pieceId) {
        if (!this.gameState.isMyTurn) {
            return; // Not your turn
        }
        
        // Find the piece in the board state
        const piece = this.gameState.boardState.find(p => p.id === pieceId);
        if (!piece || piece.type !== this.gameState.playerType) {
            return; // Not your piece
        }
        
        this.gameState.selectedPiece = piece;
        
        // Calculate valid moves for this piece
        this.gameState.validMoves = this.calculateValidMoves(piece);
        
        // Update UI to show valid moves
        uiManager.createBoardUI(
            this.gameState.boardState,
            this.gameState.playerType,
            this.gameState.validMoves
        );
    }
    
    movePiece(targetX, targetY) {
        if (!this.gameState.isMyTurn || !this.gameState.selectedPiece) {
            return; // Not your turn or no piece selected
        }
        
        // Check if the move is valid
        const isValidMove = this.gameState.validMoves.some(
            move => move[0] === targetX && move[1] === targetY
        );
        
        if (!isValidMove) {
            return; // Invalid move
        }
        
        // Emit move piece event
        this.socket.emit(GAME_CONFIG.EVENTS.MOVE_PIECE, {
            roomCode: this.gameState.roomCode,
            pieceId: this.gameState.selectedPiece.id,
            toX: targetX,
            toY: targetY
        });
        
        // Reset selection
        this.gameState.selectedPiece = null;
        this.gameState.validMoves = [];
    }
    
    useAbility(abilityName) {
        if (!this.gameState.isMyTurn) {
            return; // Not your turn
        }
        
        // Check if ability is on cooldown
        if (this.gameState.abilities[abilityName].cooldown > 0) {
            return; // Ability on cooldown
        }
        
        // Different handling based on ability type
        switch (abilityName) {
            case 'jump':
                // Will be handled on the server side
                this.socket.emit(GAME_CONFIG.EVENTS.USE_ABILITY, {
                    roomCode: this.gameState.roomCode,
                    ability: abilityName
                });
                break;
                
            case 'swap':
                // Need to select two pieces to swap
                alert('Select two of your pieces to swap them.');
                // This would need additional UI to select two pieces
                // Simplified for now
                break;
                
            case 'block':
                // Need to select a tile to block
                alert('Select a tile to block for 2 turns.');
                // This would need additional UI to select a tile
                // Simplified for now
                break;
        }
    }
    
    // Helper methods
    calculateValidMoves(piece) {
        const validMoves = [];
        
        // Get piece's current position
        const { x, y, type } = piece;
        
        // Direction to move (Monkey moves down, Fox moves up)
        const moveDirection = type === GAME_CONFIG.PLAYER_TYPES.MONKEY ? 1 : -1;
        
        // Check diagonal moves
        for (const direction of GAME_CONFIG.DIAGONAL_DIRECTIONS) {
            const newX = x + direction[0];
            const newY = y + (direction[1] * moveDirection);
            
            // Check if the position is within the board
            if (this.isValidPosition(newX, newY)) {
                // Check if the position is empty
                const isOccupied = this.gameState.boardState.some(
                    p => p.x === newX && p.y === newY
                );
                
                if (!isOccupied) {
                    validMoves.push([newX, newY]);
                }
            }
        }
        
        return validMoves;
    }
    
    isValidPosition(x, y) {
        return x >= 0 && x < GAME_CONFIG.BOARD_SIZE && 
               y >= 0 && y < GAME_CONFIG.BOARD_SIZE;
    }
}

// Create game manager instance
const gameManager = new GameManager(); 