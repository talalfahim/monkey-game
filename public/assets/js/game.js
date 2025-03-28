/**
 * Game Manager
 * Handles the core game logic
 */
class GameManager {
    constructor() {
        // Game state
        this.state = GAME_CONFIG.GAME_STATES.MENU;
        this.score = 0;
        this.time = 0;
        this.gameLoopInterval = null;
        this.lastTick = 0;
        this.isPaused = false;
        
        // Game entities
        this.player = null;
        this.fox = null;
        this.orbs = [];
        this.tiles = [];
        
        // Bind methods to this instance
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.gameLoop = this.gameLoop.bind(this);
        this.foxShootOrb = this.foxShootOrb.bind(this);
        this.activateImmunity = this.activateImmunity.bind(this);
    }
    
    // Initialize the game board
    initializeBoard() {
        const boardElement = document.getElementById('game-board');
        
        // Clear the board
        boardElement.innerHTML = '';
        
        // Set board dimensions
        boardElement.style.gridTemplateColumns = `repeat(${GAME_CONFIG.BOARD_SIZE}, 1fr)`;
        boardElement.style.gridTemplateRows = `repeat(${GAME_CONFIG.BOARD_SIZE}, 1fr)`;
        
        // Create tiles
        this.tiles = [];
        for (let y = 0; y < GAME_CONFIG.BOARD_SIZE; y++) {
            for (let x = 0; x < GAME_CONFIG.BOARD_SIZE; x++) {
                const tile = document.createElement('div');
                tile.classList.add('board-tile');
                
                // Checker pattern
                const isLight = (x + y) % 2 === 0;
                tile.classList.add(isLight ? 'tile-light' : 'tile-dark');
                
                // Set data attributes for position
                tile.setAttribute('data-x', x);
                tile.setAttribute('data-y', y);
                
                boardElement.appendChild(tile);
                
                // Store tile reference
                this.tiles.push({
                    element: tile,
                    x: x,
                    y: y
                });
            }
        }
        
        // Create player
        this.player = {
            element: document.createElement('div'),
            x: Math.floor(GAME_CONFIG.BOARD_SIZE * 0.75),
            y: GAME_CONFIG.BOARD_SIZE - 1,
            size: GAME_CONFIG.PLAYER.SIZE,
            immune: false,
            immunityAvailable: true,
            lastImmunityUse: 0
        };
        
        this.player.element.classList.add('player');
        boardElement.appendChild(this.player.element);
        this.updatePlayerPosition();
        
        // Create fox enemy
        this.fox = {
            element: document.createElement('div'),
            x: Math.floor(GAME_CONFIG.BOARD_SIZE * 0.25),
            y: 0,
            size: GAME_CONFIG.FOX.SIZE,
            lastShootTime: 0,
            shootInterval: GAME_CONFIG.FOX.SHOOT_INTERVAL[0]
        };
        
        this.fox.element.classList.add('fox-enemy');
        boardElement.appendChild(this.fox.element);
        this.updateFoxPosition();
    }
    
    // Start the game
    startGame() {
        // Reset game state
        this.score = 0;
        this.time = 0;
        this.orbs = [];
        
        // Initialize the board
        this.initializeBoard();
        
        // Reset player immunity
        this.player.immune = false;
        this.player.immunityAvailable = true;
        this.player.lastImmunityUse = 0;
        
        // Update the UI
        UIManager.updateScore(this.score);
        UIManager.updateTime(this.time);
        UIManager.updateImmunityStatus('ready');
        
        // Add a 3-second grace period before the fox starts shooting
        this.fox.lastShootTime = performance.now() + 3000; 
        
        // Set up event listeners
        document.addEventListener('keydown', this.handleKeyDown);
        
        // Start the game loop
        this.lastTick = performance.now();
        this.state = GAME_CONFIG.GAME_STATES.PLAYING;
        this.gameLoopInterval = setInterval(this.gameLoop, 1000 / GAME_CONFIG.GAME_SETTINGS.TICK_RATE);
        
        // Start timer for incremental scoring
        this.scoreTimer = setInterval(() => {
            this.score += 10;
            this.time += 1;
            UIManager.updateScore(this.score);
            UIManager.updateTime(this.time);
        }, 1000);
    }
    
    // Game loop
    gameLoop() {
        if (this.isPaused) return;
        
        const now = performance.now();
        const deltaTime = now - this.lastTick;
        this.lastTick = now;
        
        // Update immunity status
        this.updateImmunityStatus(now);
        
        // Move fox every 3 seconds
        if (!this.fox.lastMoveTime) {
            this.fox.lastMoveTime = now;
        }
        
        if (now - this.fox.lastMoveTime > 3000) {
            this.moveFox();
            this.fox.lastMoveTime = now;
        }
        
        // Fox shooting logic
        if (now - this.fox.lastShootTime > this.fox.shootInterval) {
            this.foxShootOrb();
            
            // Set next shooting interval
            const minInterval = GAME_CONFIG.FOX.SHOOT_INTERVAL[0];
            const maxInterval = GAME_CONFIG.FOX.SHOOT_INTERVAL[1];
            this.fox.shootInterval = Math.random() * (maxInterval - minInterval) + minInterval;
            
            // Decrease interval as time progresses (increase difficulty)
            const timeFactor = Math.min(this.time / 60, 1); // Cap at 1 minute of gameplay
            this.fox.shootInterval *= (1 - timeFactor * 0.5); // Reduce by up to 50%
            
            this.fox.lastShootTime = now;
        }
        
        // Update orbs
        this.updateOrbs(deltaTime);
        
        // Check collisions
        this.checkCollisions();
    }
    
    // Move the fox enemy
    moveFox() {
        // Fox stays at the top of the board but moves left and right
        const newX = Math.floor(Math.random() * GAME_CONFIG.BOARD_SIZE);
        
        this.fox.x = newX;
        this.updateFoxPosition();
    }
    
    // Fox shoots an orb
    foxShootOrb() {
        const boardElement = document.getElementById('game-board');
        
        // Calculate direction vector from fox to player
        let directionX = this.player.x - this.fox.x;
        let directionY = this.player.y - this.fox.y;
        
        // Create a new orb
        const orb = {
            element: document.createElement('div'),
            x: this.fox.x,
            y: this.fox.y,
            size: GAME_CONFIG.ORB.SIZE,
            directionX: directionX,
            directionY: directionY,
            speed: GAME_CONFIG.ORB.SPEED,
            createdAt: performance.now()
        };
        
        // Normalize direction vector to ensure consistent speed
        const length = Math.sqrt(directionX * directionX + directionY * directionY);
        if (length > 0) { // Avoid division by zero
            orb.directionX = directionX / length;
            orb.directionY = directionY / length;
            
            // Add slight variation to make it not perfectly accurate (more fun)
            const accuracy = 0.9; // 90% accuracy
            orb.directionX = orb.directionX * accuracy + (Math.random() * 0.2 - 0.1);
            orb.directionY = orb.directionY * accuracy + (Math.random() * 0.2 - 0.1);
            
            // Re-normalize after adding variation
            const newLength = Math.sqrt(orb.directionX * orb.directionX + orb.directionY * orb.directionY);
            if (newLength > 0) {
                orb.directionX /= newLength;
                orb.directionY /= newLength;
            }
        }
        
        orb.element.classList.add('orb');
        boardElement.appendChild(orb.element);
        
        // Set initial position
        this.updateOrbPosition(orb);
        
        // Add to orbs array
        this.orbs.push(orb);
        
        // Limit the maximum number of orbs
        if (this.orbs.length > GAME_CONFIG.FOX.MAX_ORBS_PER_SECOND * 3) {
            const oldestOrb = this.orbs.shift();
            boardElement.removeChild(oldestOrb.element);
        }
    }
    
    // Update all orbs
    updateOrbs(deltaTime) {
        const boardElement = document.getElementById('game-board');
        
        // Convert deltaTime to seconds
        const deltaSeconds = deltaTime / 1000;
        
        // Remove old orbs
        const now = performance.now();
        this.orbs = this.orbs.filter(orb => {
            if (now - orb.createdAt > GAME_CONFIG.ORB.LIFE_SPAN) {
                boardElement.removeChild(orb.element);
                return false;
            }
            return true;
        });
        
        // Update remaining orbs positions
        this.orbs.forEach(orb => {
            // Calculate new position
            const newX = orb.x + orb.directionX * orb.speed * deltaSeconds;
            const newY = orb.y + orb.directionY * orb.speed * deltaSeconds;
            
            // Check for boundary collisions and bounce
            if (newX < 0 || newX >= GAME_CONFIG.BOARD_SIZE) {
                // Bounce off horizontal walls
                orb.directionX *= -1;
                // Ensure the orb doesn't get stuck in the wall
                orb.x += orb.directionX * 0.1;
            } else {
                orb.x = newX;
            }
            
            if (newY < 0 || newY >= GAME_CONFIG.BOARD_SIZE) {
                // Bounce off vertical walls
                orb.directionY *= -1;
                // Ensure the orb doesn't get stuck in the wall
                orb.y += orb.directionY * 0.1;
            } else {
                orb.y = newY;
            }
            
            this.updateOrbPosition(orb);
            return true;
        });
    }
    
    // Check for collisions between player and orbs
    checkCollisions() {
        // Use a smaller collision area for the player (70% of actual size for more forgiving gameplay)
        const collisionReduction = 0.3; // 30% smaller hitbox
        const adjustedSize = this.player.size * (1 - collisionReduction);
        const offset = (this.player.size - adjustedSize) / 2;
        
        const playerRect = {
            left: this.player.x * GAME_CONFIG.TILE_SIZE + (GAME_CONFIG.TILE_SIZE - adjustedSize) / 2,
            top: this.player.y * GAME_CONFIG.TILE_SIZE + (GAME_CONFIG.TILE_SIZE - adjustedSize) / 2,
            right: this.player.x * GAME_CONFIG.TILE_SIZE + (GAME_CONFIG.TILE_SIZE + adjustedSize) / 2,
            bottom: this.player.y * GAME_CONFIG.TILE_SIZE + (GAME_CONFIG.TILE_SIZE + adjustedSize) / 2
        };
        
        // Check each orb for collision with player
        for (let i = 0; i < this.orbs.length; i++) {
            const orb = this.orbs[i];
            const orbRect = {
                left: orb.x * GAME_CONFIG.TILE_SIZE,
                top: orb.y * GAME_CONFIG.TILE_SIZE,
                right: orb.x * GAME_CONFIG.TILE_SIZE + orb.size,
                bottom: orb.y * GAME_CONFIG.TILE_SIZE + orb.size
            };
            
            // Simple rectangle collision check
            if (playerRect.left < orbRect.right && 
                playerRect.right > orbRect.left && 
                playerRect.top < orbRect.bottom && 
                playerRect.bottom > orbRect.top) {
                
                // If player is immune, consume the immunity and destroy the orb
                if (this.player.immune) {
                    this.player.immune = false;
                    
                    // Remove the orb that hit the player
                    const boardElement = document.getElementById('game-board');
                    boardElement.removeChild(orb.element);
                    this.orbs.splice(i, 1);
                    
                    // Update player appearance
                    this.updatePlayerPosition();
                    
                    // Add a small score bonus for blocking a projectile
                    this.score += 25;
                    UIManager.updateScore(this.score);
                    
                    // Break since we've handled this collision
                    break;
                } else {
                    // Player is not immune, game over
                    this.gameOver();
                    break;
                }
            }
        }
    }
    
    // Handle keyboard input
    handleKeyDown(event) {
        if (this.state !== GAME_CONFIG.GAME_STATES.PLAYING) return;
        
        switch (event.key) {
            case GAME_CONFIG.KEYS.UP:
                this.movePlayer(GAME_CONFIG.DIRECTIONS.UP);
                break;
            case GAME_CONFIG.KEYS.DOWN:
                this.movePlayer(GAME_CONFIG.DIRECTIONS.DOWN);
                break;
            case GAME_CONFIG.KEYS.LEFT:
                this.movePlayer(GAME_CONFIG.DIRECTIONS.LEFT);
                break;
            case GAME_CONFIG.KEYS.RIGHT:
                this.movePlayer(GAME_CONFIG.DIRECTIONS.RIGHT);
                break;
            case GAME_CONFIG.KEYS.PAUSE:
                this.togglePause();
                break;
            case GAME_CONFIG.KEYS.IMMUNITY:
                this.activateImmunity();
                break;
        }
    }
    
    // Move the player
    movePlayer(direction) {
        const newX = this.player.x + direction.x;
        const newY = this.player.y + direction.y;
        
        // Check if move is within bounds
        if (newX >= 0 && newX < GAME_CONFIG.BOARD_SIZE && 
            newY >= 0 && newY < GAME_CONFIG.BOARD_SIZE) {
            this.player.x = newX;
            this.player.y = newY;
            this.updatePlayerPosition();
        }
    }
    
    // Update player position on the board
    updatePlayerPosition() {
        const tileSize = GAME_CONFIG.TILE_SIZE;
        
        // Center the player in the tile
        const left = this.player.x * tileSize + (tileSize - this.player.size) / 2;
        const top = this.player.y * tileSize + (tileSize - this.player.size) / 2;
        
        this.player.element.style.left = `${left}px`;
        this.player.element.style.top = `${top}px`;
        this.player.element.style.width = `${this.player.size}px`;
        this.player.element.style.height = `${this.player.size}px`;
        
        // Show visual feedback for immunity
        if (this.player.immune) {
            this.player.element.classList.add('immune');
            this.player.element.style.boxShadow = '0 0 15px 5px rgba(46, 204, 113, 0.8)';
            this.player.element.style.border = '2px solid #2ecc71';
        } else {
            this.player.element.classList.remove('immune');
            if (!this.player.immunityAvailable) {
                this.player.element.style.boxShadow = '0 0 10px rgba(52, 152, 219, 0.7)';
                this.player.element.style.border = 'none';
            } else {
                this.player.element.style.boxShadow = '0 0 10px rgba(52, 152, 219, 0.7)';
                this.player.element.style.border = '2px dashed #2ecc71';
            }
        }
    }
    
    // Update fox position on the board
    updateFoxPosition() {
        const tileSize = GAME_CONFIG.TILE_SIZE;
        
        // Center the fox in the tile
        const left = this.fox.x * tileSize + (tileSize - this.fox.size) / 2;
        const top = this.fox.y * tileSize + (tileSize - this.fox.size) / 2;
        
        this.fox.element.style.left = `${left}px`;
        this.fox.element.style.top = `${top}px`;
        this.fox.element.style.width = `${this.fox.size}px`;
        this.fox.element.style.height = `${this.fox.size}px`;
    }
    
    // Update orb position
    updateOrbPosition(orb) {
        const tileSize = GAME_CONFIG.TILE_SIZE;
        
        // Position the orb relative to its coordinates
        const left = orb.x * tileSize;
        const top = orb.y * tileSize;
        
        orb.element.style.left = `${left}px`;
        orb.element.style.top = `${top}px`;
        orb.element.style.width = `${orb.size}px`;
        orb.element.style.height = `${orb.size}px`;
    }
    
    // Toggle game pause
    togglePause() {
        this.isPaused = !this.isPaused;
    }
    
    // End the game
    gameOver() {
        this.state = GAME_CONFIG.GAME_STATES.GAME_OVER;
        
        // Clear intervals
        clearInterval(this.gameLoopInterval);
        clearInterval(this.scoreTimer);
        
        // Remove event listeners
        document.removeEventListener('keydown', this.handleKeyDown);
        
        // Update final score
        UIManager.setFinalScore(this.score, this.time);
        
        // Show game over screen
        UIManager.showScreen('game-over');
    }
    
    // Clean up when leaving the game
    quitGame() {
        // Clear intervals
        if (this.gameLoopInterval) {
            clearInterval(this.gameLoopInterval);
        }
        
        if (this.scoreTimer) {
            clearInterval(this.scoreTimer);
        }
        
        // Remove event listeners
        document.removeEventListener('keydown', this.handleKeyDown);
        
        // Clear the board
        const boardElement = document.getElementById('game-board');
        boardElement.innerHTML = '';
        
        // Reset game state
        this.orbs = [];
        this.state = GAME_CONFIG.GAME_STATES.MENU;
    }
    
    // Update immunity status
    updateImmunityStatus(now) {
        // Check if immunity has expired
        if (this.player.immune && now - this.player.lastImmunityUse > GAME_CONFIG.GAME_SETTINGS.IMMUNITY_DURATION) {
            this.player.immune = false;
            this.updatePlayerPosition();
            UIManager.updateImmunityStatus('cooldown');
        }
        
        // Check if immunity cooldown has expired
        if (!this.player.immunityAvailable && 
            now - this.player.lastImmunityUse > GAME_CONFIG.GAME_SETTINGS.IMMUNITY_COOLDOWN) {
            this.player.immunityAvailable = true;
            this.updatePlayerPosition();
            UIManager.updateImmunityStatus('ready');
        }
    }
    
    // Activate immunity ability
    activateImmunity() {
        if (!this.player.immunityAvailable || this.player.immune) return;
        
        this.player.immune = true;
        this.player.immunityAvailable = false;
        this.player.lastImmunityUse = performance.now();
        
        // Play activation sound (if we had one)
        // this.playSound('immunity-activate');
        
        // Update visual appearance
        this.updatePlayerPosition();
        
        // Update UI status - this will now update both the text and card UI
        UIManager.updateImmunityStatus('active');
        
        // No need for setTimeout here since the UI and game manager both
        // track the immunity time and will update when it expires in gameLoop
    }
}

// Create the game manager instance
const gameManager = new GameManager(); 