/**
 * UI Manager
 * Handles UI interactions and screen transitions
 */
const UIManager = {
    // DOM elements
    elements: {
        screens: {
            menu: document.getElementById('menu-screen'),
            game: document.getElementById('game-screen'),
            gameOver: document.getElementById('game-over-screen')
        },
        buttons: {
            startGame: document.getElementById('start-game-btn'),
            leaveGame: document.getElementById('leave-game-btn'),
            playAgain: document.getElementById('play-again-btn'),
            backToMenu: document.getElementById('back-to-menu-btn')
        },
        score: {
            current: document.getElementById('score-value'),
            final: document.getElementById('final-score-value')
        },
        time: {
            current: document.getElementById('time-value'),
            final: document.getElementById('final-time-value')
        }
    },
    
    // Initialize the UI
    init() {
        // Set up event listeners
        this.setupEventListeners();
        
        // Show the initial screen
        this.showScreen('menu');
    },
    
    // Set up event listeners for buttons
    setupEventListeners() {
        // Start game button
        this.elements.buttons.startGame.addEventListener('click', () => {
            this.showScreen('game');
            gameManager.startGame();
        });
        
        // Leave game button
        this.elements.buttons.leaveGame.addEventListener('click', () => {
            gameManager.quitGame();
            this.showScreen('menu');
        });
        
        // Play again button
        this.elements.buttons.playAgain.addEventListener('click', () => {
            this.showScreen('game');
            gameManager.startGame();
        });
        
        // Back to menu button
        this.elements.buttons.backToMenu.addEventListener('click', () => {
            this.showScreen('menu');
        });
    },
    
    // Show a specific screen
    showScreen(screenName) {
        // Hide all screens
        Object.values(this.elements.screens).forEach(screen => {
            screen.classList.add('hidden');
        });
        
        // Show the requested screen
        switch (screenName) {
            case 'menu':
                this.elements.screens.menu.classList.remove('hidden');
                break;
            case 'game':
                this.elements.screens.game.classList.remove('hidden');
                break;
            case 'game-over':
                this.elements.screens.gameOver.classList.remove('hidden');
                break;
        }
    },
    
    // Update the current score display
    updateScore(score) {
        this.elements.score.current.textContent = score;
    },
    
    // Update the current time display
    updateTime(time) {
        this.elements.time.current.textContent = time;
    },
    
    // Set the final score and time on game over
    setFinalScore(score, time) {
        this.elements.score.final.textContent = score;
        this.elements.time.final.textContent = time;
    }
}; 