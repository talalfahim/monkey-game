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
        this.startButton = document.getElementById('start-game-btn');
        this.quitButton = document.getElementById('leave-game-btn');
        this.playAgainButton = document.getElementById('play-again-btn');
        this.backToMenuButton = document.getElementById('back-to-menu-btn');
        
        // Game info elements
        this.scoreElement = document.getElementById('score-value');
        this.timeElement = document.getElementById('time-value');
        this.finalScoreElement = document.getElementById('final-score-value');
        this.finalTimeElement = document.getElementById('final-time-value');
        this.immunityStatusElement = document.getElementById('immunity-status');
        
        // Ability card elements
        this.deathDodgeCard = document.getElementById('death-dodge-card');
        this.abilityStatus = document.getElementById('ability-status');
        this.abilityCooldown = document.getElementById('ability-cooldown');
        this.cooldownInterval = null;
        this.cooldownStartTime = 0;
        this.cooldownDuration = GAME_CONFIG.GAME_SETTINGS.IMMUNITY_COOLDOWN;
        
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
        this.scoreElement.textContent = score;
    }
    
    // Update the time display
    updateTime(time) {
        this.timeElement.textContent = time;
    }
    
    // Update the immunity status display
    updateImmunityStatus(status) {
        if (status === 'active') {
            this.immunityStatusElement.textContent = 'Immunity: Active';
            this.immunityStatusElement.style.color = '#2ecc71';
            
            // Update ability card
            this.updateAbilityCard('active');
            
            // If cooldown was running, clear it
            if (this.cooldownInterval) {
                clearInterval(this.cooldownInterval);
                this.cooldownInterval = null;
            }
            
        } else if (status === 'cooldown') {
            this.immunityStatusElement.textContent = 'Immunity: Cooling Down';
            this.immunityStatusElement.style.color = '#e74c3c';
            
            // Update ability card to cooldown state
            this.updateAbilityCard('cooldown');
            
            // Start cooldown animation
            this.startCooldownAnimation();
            
        } else {
            this.immunityStatusElement.textContent = 'Immunity: Ready (Press P)';
            this.immunityStatusElement.style.color = '#3498db';
            
            // Update ability card to ready state
            this.updateAbilityCard('ready');
            
            // If cooldown was running, clear it
            if (this.cooldownInterval) {
                clearInterval(this.cooldownInterval);
                this.cooldownInterval = null;
            }
        }
    }
    
    // Update the Death Dodge ability card
    updateAbilityCard(status) {
        // Remove all status classes
        this.deathDodgeCard.classList.remove('ready', 'active', 'cooldown');
        this.abilityCooldown.classList.remove('ready', 'active', 'cooldown');
        
        // Add appropriate class
        this.deathDodgeCard.classList.add(status);
        this.abilityCooldown.classList.add(status);
        
        // Update status text
        if (status === 'active') {
            this.abilityStatus.textContent = 'ACTIVE';
            this.abilityStatus.style.backgroundColor = '#2ecc71';
        } else if (status === 'cooldown') {
            this.abilityStatus.textContent = 'COOLDOWN';
            this.abilityStatus.style.backgroundColor = '#e74c3c';
        } else {
            this.abilityStatus.textContent = 'READY';
            this.abilityStatus.style.backgroundColor = '#3498db';
        }
    }
    
    // Start cooldown animation
    startCooldownAnimation() {
        this.cooldownStartTime = performance.now();
        
        // Reset cooldown overlay
        this.abilityCooldown.style.clipPath = 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)';
        
        // If interval is already running, clear it
        if (this.cooldownInterval) {
            clearInterval(this.cooldownInterval);
        }
        
        // Update cooldown every 100ms
        this.cooldownInterval = setInterval(() => {
            const elapsed = performance.now() - this.cooldownStartTime;
            const progress = Math.min(elapsed / this.cooldownDuration, 1);
            
            // Update clip path based on progress (bottom to top)
            const clipValue = 100 - (progress * 100);
            this.abilityCooldown.style.clipPath = `polygon(0 ${clipValue}%, 100% ${clipValue}%, 100% 100%, 0% 100%)`;
            
            // If cooldown is complete, reset
            if (progress >= 1) {
                clearInterval(this.cooldownInterval);
                this.cooldownInterval = null;
                
                // The game manager will call updateImmunityStatus('ready') 
                // when the cooldown actually completes
            }
        }, 100);
    }
    
    // Set the final score on game over
    setFinalScore(score, time) {
        this.finalScoreElement.textContent = score;
        this.finalTimeElement.textContent = time;
        
        // Clear any running cooldown intervals
        if (this.cooldownInterval) {
            clearInterval(this.cooldownInterval);
            this.cooldownInterval = null;
        }
    }
}

// Create UI manager instance
const UIManager = new UI(); 