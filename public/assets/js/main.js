/**
 * Main JavaScript file
 * Initializes the game components and handles document ready events
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('Game initialized');
    
    // Create placeholder monkey and fox images for the game
    createPlaceholderImages();
});

/**
 * Creates placeholder images for the game pieces
 * This is a temporary solution until actual images are added
 */
function createPlaceholderImages() {
    // Create a canvas for the monkey image
    const monkeyCanvas = document.createElement('canvas');
    monkeyCanvas.width = 100;
    monkeyCanvas.height = 100;
    const monkeyCtx = monkeyCanvas.getContext('2d');
    
    // Draw a monkey placeholder
    monkeyCtx.fillStyle = '#FFD700'; // Gold color
    monkeyCtx.beginPath();
    monkeyCtx.arc(50, 50, 45, 0, Math.PI * 2);
    monkeyCtx.fill();
    
    // Add monkey face
    monkeyCtx.fillStyle = '#8B4513'; // Brown color
    // Eyes
    monkeyCtx.beginPath();
    monkeyCtx.arc(35, 40, 7, 0, Math.PI * 2);
    monkeyCtx.fill();
    monkeyCtx.beginPath();
    monkeyCtx.arc(65, 40, 7, 0, Math.PI * 2);
    monkeyCtx.fill();
    // Mouth
    monkeyCtx.beginPath();
    monkeyCtx.arc(50, 65, 15, 0, Math.PI);
    monkeyCtx.fill();
    
    // Convert to image and add to the assets folder
    const monkeyImgURL = monkeyCanvas.toDataURL('image/png');
    
    // Create a canvas for the fox image
    const foxCanvas = document.createElement('canvas');
    foxCanvas.width = 100;
    foxCanvas.height = 100;
    const foxCtx = foxCanvas.getContext('2d');
    
    // Draw a fox placeholder
    foxCtx.fillStyle = '#8B0000'; // Dark red color
    foxCtx.beginPath();
    foxCtx.arc(50, 50, 45, 0, Math.PI * 2);
    foxCtx.fill();
    
    // Add fox face
    foxCtx.fillStyle = '#FFF'; // White color
    // Eyes
    foxCtx.beginPath();
    foxCtx.arc(35, 40, 7, 0, Math.PI * 2);
    foxCtx.fill();
    foxCtx.beginPath();
    foxCtx.arc(65, 40, 7, 0, Math.PI * 2);
    foxCtx.fill();
    // Snout
    foxCtx.beginPath();
    foxCtx.moveTo(35, 60);
    foxCtx.lineTo(50, 75);
    foxCtx.lineTo(65, 60);
    foxCtx.closePath();
    foxCtx.fill();
    
    // Convert to image and add to the assets folder
    const foxImgURL = foxCanvas.toDataURL('image/png');
    
    // Create and save the images
    saveImage(monkeyImgURL, 'monkey');
    saveImage(foxImgURL, 'fox');
}

/**
 * Helper function to create and inject CSS for the generated images
 */
function saveImage(dataURL, name) {
    // In a real application, we would save these files to the server
    // For this demo, we'll inject them as CSS
    const style = document.createElement('style');
    style.textContent = `
        .piece-${name} {
            background-image: url('${dataURL}') !important;
            background-size: cover;
        }
    `;
    document.head.appendChild(style);
} 