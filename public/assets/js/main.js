/**
 * Main JavaScript file
 * Initializes the game components and handles document ready events
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('Fox Hunt game initialized');
    
    // Initialize the UI
    UIManager.init();
    
    // Create a favicon dynamically
    createFavicon();
    
    // Add keyboard instructions
    addKeyboardInstructions();
});

/**
 * Creates a favicon for the game
 */
function createFavicon() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    // Draw a fox icon (simplified)
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(32, 32, 30, 0, Math.PI * 2);
    ctx.fill();
    
    // Add fox details
    ctx.fillStyle = '#fff';
    // Eyes
    ctx.beginPath();
    ctx.arc(22, 26, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(42, 26, 5, 0, Math.PI * 2);
    ctx.fill();
    // Snout
    ctx.beginPath();
    ctx.moveTo(22, 40);
    ctx.lineTo(32, 48);
    ctx.lineTo(42, 40);
    ctx.closePath();
    ctx.fill();
    
    // Add the favicon to the document
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/png';
    link.href = canvas.toDataURL('image/png');
    document.head.appendChild(link);
}

/**
 * Adds keyboard instructions to the game description
 */
function addKeyboardInstructions() {
    const gameDescription = document.querySelector('.game-description');
    
    // Create instructions element
    const instructions = document.createElement('div');
    instructions.className = 'keyboard-instructions';
    instructions.innerHTML = `
        <p><strong>Controls:</strong></p>
        <div class="key-info">
            <div class="key">↑</div><span>Move Up</span>
        </div>
        <div class="key-info">
            <div class="key">↓</div><span>Move Down</span>
        </div>
        <div class="key-info">
            <div class="key">←</div><span>Move Left</span>
        </div>
        <div class="key-info">
            <div class="key">→</div><span>Move Right</span>
        </div>
        <div class="key-info">
            <div class="key">ESC</div><span>Pause Game</span>
        </div>
    `;
    
    // Add CSS for key instructions
    const style = document.createElement('style');
    style.textContent = `
        .keyboard-instructions {
            margin-top: 20px;
            font-size: 0.9rem;
        }
        
        .key-info {
            display: flex;
            align-items: center;
            margin: 5px 0;
            justify-content: center;
        }
        
        .key {
            background-color: #34495e;
            color: #ecf0f1;
            padding: 5px 10px;
            border-radius: 4px;
            margin-right: 10px;
            min-width: 30px;
            text-align: center;
            box-shadow: 0 2px 3px rgba(0, 0, 0, 0.3);
        }
    `;
    
    document.head.appendChild(style);
    gameDescription.appendChild(instructions);
} 