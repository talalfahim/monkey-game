/**
 * UI Manager
 * Handles UI interactions and screen transitions
 */

class UIManager {
    constructor() {
        // Screen elements
        this.menuScreen = document.getElementById('menu-screen');
        this.createGameScreen = document.getElementById('create-game-screen');
        this.joinGameScreen = document.getElementById('join-game-screen');
        this.gameScreen = document.getElementById('game-screen');
        
        // Button elements
        this.createGameBtn = document.getElementById('create-game-btn');
        this.joinGameBtn = document.getElementById('join-game-btn');
        this.startGameBtn = document.getElementById('start-game-btn');
        this.backToMenuBtn = document.getElementById('back-to-menu-btn');
        this.joinBtn = document.getElementById('join-btn');
        this.joinBackBtn = document.getElementById('join-back-btn');
        this.leaveGameBtn = document.getElementById('leave-game-btn');
        
        // Input elements
        this.roomCodeInput = document.getElementById('room-code-input');
        this.roomCodeDisplay = document.getElementById('room-code');
        
        // Game info elements
        this.playerTurnDisplay = document.getElementById('player-turn');
        this.abilityButtons = document.querySelectorAll('.ability-btn');
        
        // Game board element
        this.gameBoardElement = document.getElementById('game-board');
        
        // Setup event listeners
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Menu buttons
        this.createGameBtn.addEventListener('click', () => this.showScreen('create'));
        this.joinGameBtn.addEventListener('click', () => this.showScreen('join'));
        this.backToMenuBtn.addEventListener('click', () => this.showScreen('menu'));
        this.joinBackBtn.addEventListener('click', () => this.showScreen('menu'));
        this.leaveGameBtn.addEventListener('click', () => this.handleLeaveGame());
        
        // Game buttons
        this.startGameBtn.addEventListener('click', () => this.handleStartGame());
        this.joinBtn.addEventListener('click', () => this.handleJoinGame());
        
        // Ability buttons
        this.abilityButtons.forEach(btn => {
            btn.addEventListener('click', (event) => {
                const ability = event.target.getAttribute('data-ability');
                this.handleUseAbility(ability);
            });
        });
    }
    
    showScreen(screenName) {
        // Hide all screens
        this.menuScreen.classList.add('hidden');
        this.createGameScreen.classList.add('hidden');
        this.joinGameScreen.classList.add('hidden');
        this.gameScreen.classList.add('hidden');
        
        // Show the selected screen
        switch (screenName) {
            case 'menu':
                this.menuScreen.classList.remove('hidden');
                break;
            case 'create':
                this.createGameScreen.classList.remove('hidden');
                // Trigger room creation when showing this screen
                if (typeof gameManager !== 'undefined') {
                    gameManager.createRoom();
                }
                break;
            case 'join':
                this.joinGameScreen.classList.remove('hidden');
                break;
            case 'game':
                this.gameScreen.classList.remove('hidden');
                break;
        }
    }
    
    setRoomCode(code) {
        this.roomCodeDisplay.textContent = code;
    }
    
    enableStartButton() {
        this.startGameBtn.disabled = false;
    }
    
    updatePlayerTurn(playerType) {
        const playerName = playerType === GAME_CONFIG.PLAYER_TYPES.MONKEY ? 'Monkey' : 'Fox';
        this.playerTurnDisplay.textContent = `${playerName}'s Turn`;
        
        // Add visual indication of current turn
        this.playerTurnDisplay.className = '';
        this.playerTurnDisplay.classList.add(`player-${playerType}`);
    }
    
    updateAbilityCooldowns(abilities) {
        this.abilityButtons.forEach(btn => {
            const abilityName = btn.getAttribute('data-ability');
            const ability = abilities[abilityName];
            
            if (ability && ability.cooldown > 0) {
                btn.disabled = true;
                btn.textContent = `${ability.name} (${ability.cooldown})`;
            } else {
                btn.disabled = false;
                btn.textContent = ability ? ability.name : abilityName;
            }
        });
    }
    
    createBoardUI(boardState, playerType, validMoves = []) {
        // Clear existing board
        this.gameBoardElement.innerHTML = '';
        
        // Create board tiles
        for (let y = 0; y < GAME_CONFIG.BOARD_SIZE; y++) {
            for (let x = 0; x < GAME_CONFIG.BOARD_SIZE; x++) {
                const tile = document.createElement('div');
                tile.classList.add('board-tile');
                
                // Add checker pattern
                const isLightTile = (x + y) % 2 === 0;
                tile.classList.add(isLightTile ? 'tile-light' : 'tile-dark');
                
                // Set data attributes for position
                tile.setAttribute('data-x', x);
                tile.setAttribute('data-y', y);
                
                // Check if this position has a valid move
                const isValidMove = validMoves.some(move => move[0] === x && move[1] === y);
                if (isValidMove) {
                    tile.classList.add('tile-valid-move');
                }
                
                // Add piece if there's one at this position
                const piece = boardState.find(p => p.x === x && p.y === y);
                if (piece) {
                    const pieceElement = document.createElement('div');
                    pieceElement.classList.add('game-piece');
                    pieceElement.classList.add(`piece-${piece.type}`);
                    
                    // Set data attributes for piece
                    pieceElement.setAttribute('data-piece-id', piece.id);
                    pieceElement.setAttribute('data-piece-type', piece.type);
                    
                    // Add event listener for piece selection
                    if (piece.type === playerType) {
                        pieceElement.addEventListener('click', (event) => {
                            const pieceId = event.target.getAttribute('data-piece-id');
                            this.handlePieceSelection(pieceId);
                            event.stopPropagation();
                        });
                    }
                    
                    tile.appendChild(pieceElement);
                }
                
                // Add event listener for tile selection
                tile.addEventListener('click', () => {
                    if (isValidMove) {
                        this.handleTileSelection(x, y);
                    }
                });
                
                this.gameBoardElement.appendChild(tile);
            }
        }
    }
    
    showGameResult(winner) {
        const winnerName = winner === GAME_CONFIG.PLAYER_TYPES.MONKEY ? 'Monkey' : 'Fox';
        alert(`Game Over! ${winnerName} wins!`);
        this.showScreen('menu');
    }
    
    // Event handlers - these will be connected to the game manager
    handleStartGame() {
        if (typeof gameManager !== 'undefined') {
            gameManager.startGame();
            this.showScreen('game');
        }
    }
    
    handleJoinGame() {
        const roomCode = this.roomCodeInput.value.trim();
        if (roomCode && typeof gameManager !== 'undefined') {
            gameManager.joinRoom(roomCode);
        } else {
            alert('Please enter a valid room code');
        }
    }
    
    handleLeaveGame() {
        if (typeof gameManager !== 'undefined') {
            gameManager.leaveGame();
            this.showScreen('menu');
        }
    }
    
    handlePieceSelection(pieceId) {
        if (typeof gameManager !== 'undefined') {
            gameManager.selectPiece(pieceId);
        }
    }
    
    handleTileSelection(x, y) {
        if (typeof gameManager !== 'undefined') {
            gameManager.movePiece(x, y);
        }
    }
    
    handleUseAbility(ability) {
        if (typeof gameManager !== 'undefined') {
            gameManager.useAbility(ability);
        }
    }
}

// Create UI manager instance
const uiManager = new UIManager(); 