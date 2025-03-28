/**
 * UI Manager
 * Handles all UI updates and interactions
 */
class UI {
    constructor() {
        // Screens
        this.menuScreen = document.getElementById('menu-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');
        
        // Buttons
        this.startButton = document.getElementById('start-game');
        this.quitButton = document.getElementById('quit-game');
        this.playAgainButton = document.getElementById('play-again');
        this.backToMenuButton = document.getElementById('back-to-menu');
        
        // Game info elements
        this.scoreElement = document.getElementById('score');
        this.timeElement = document.getElementById('time');
        this.finalScoreElement = document.getElementById('final-score');
        this.immunityStatusElement = document.getElementById('immunity-status');
        
        // Bind events
        this.bindEvents();
    }
    
    // Initialize event listeners
    bindEvents() {
        this.startButton.addEventListener('click', () => {
            this.showScreen('game');
            gameManager.startGame();
        });
        
        this.quitButton.addEventListener('click', () => {
            gameManager.quitGame();
            this.showScreen('menu');
        });
        
        this.playAgainButton.addEventListener('click', () => {
            this.showScreen('game');
            gameManager.startGame();
        });
        
        this.backToMenuButton.addEventListener('click', () => {
            this.showScreen('menu');
        });
    }
    
    // Show a specific screen and hide others
    showScreen(screenName) {
        this.menuScreen.classList.add('hidden');
        this.gameScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
        
        switch (screenName) {
            case 'menu':
                this.menuScreen.classList.remove('hidden');
                break;
            case 'game':
                this.gameScreen.classList.remove('hidden');
                break;
            case 'game-over':
                this.gameOverScreen.classList.remove('hidden');
                break;
        }
    }
    
    // Update the score display
    updateScore(score) {
        this.scoreElement.textContent = `Score: ${score}`;
    }
    
    // Update the time display
    updateTime(time) {
        this.timeElement.textContent = `Time: ${time}s`;
    }
    
    // Update the immunity status display
    updateImmunityStatus(status) {
        if (status === 'active') {
            this.immunityStatusElement.textContent = 'Immunity: Active';
            this.immunityStatusElement.style.color = '#2ecc71';
        } else if (status === 'cooldown') {
            this.immunityStatusElement.textContent = 'Immunity: Cooling Down';
            this.immunityStatusElement.style.color = '#e74c3c';
        } else {
            this.immunityStatusElement.textContent = 'Immunity: Ready (Press P)';
            this.immunityStatusElement.style.color = '#3498db';
        }
    }
    
    // Set the final score on game over
    setFinalScore(score, time) {
        this.finalScoreElement.textContent = `Final Score: ${score} | Survived: ${time} seconds`;
    }
}

// Create UI manager instance
const UIManager = new UI(); 