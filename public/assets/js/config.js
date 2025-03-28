/**
 * Game Configuration
 * Contains all the constants and settings for the game
 */

const GAME_CONFIG = {
    // Board dimensions
    BOARD_SIZE: 10, // 10x10 grid
    TILE_SIZE: 60, // 60px per tile
    
    // Game entities
    PLAYER: {
        SPEED: 1.5, // Moves 1.5 tiles at a time - increased for better dodging
        SIZE: 40, // Player size in pixels
        COLOR: '#3498db' // Blue
    },
    
    FOX: {
        SIZE: 50, // Fox size in pixels
        COLOR: '#e74c3c', // Red
        SHOOT_INTERVAL: [1500, 2500], // Increased interval between shots (ms)
        MAX_ORBS_PER_SECOND: 2 // Reduced from 3 to 2
    },
    
    ORB: {
        SIZE: 10, // Orb size in pixels
        SPEED: 120, // Pixels per second - cut in half for slower gameplay
        COLOR: '#e74c3c', // Orange
        LIFE_SPAN: 5000, // How long orbs live (ms) - reduced to 2 seconds
        HOMING_COLOR: '#9b59b6',         // Purple color for homing shots
        HOMING_SIZE: 15,                 // Slightly larger than regular orbs
        HOMING_GLOW: '0 0 20px #9b59b6' // Glowing effect for homing shots
    },
    
    // Game settings
    GAME_SETTINGS: {
        TICK_RATE: 60, // Game loop ticks per second
        DIFFICULTY_INCREASE_INTERVAL: 10, // Seconds between difficulty increases
        INITIAL_LIVES: 1,
        IMMUNITY_COOLDOWN: 10000, // 10 seconds cooldown for immunity ability
        IMMUNITY_DURATION: 3000, // 3 seconds of immunity when activated
        GRID_SIZE: 10,
        CELL_SIZE: 50,
        INITIAL_HOMING_SHOT_DELAY: 8000, // First homing shot appears at 8 seconds
        HOMING_SHOT_INTERVAL: 17000,      // Then every 17 seconds
        HOMING_SHOT_CHARGE_TIME: 1500,    // 1.5 seconds charging time
        HOMING_SHOT_SPEED: 180,           // Slightly faster than regular orbs
        HOMING_SHOT_TRACKING_STRENGTH: 0.15 // How strongly it tracks the player (0-1)
    },
    
    // Direction mappings for keyboard controls
    DIRECTIONS: {
        UP: { x: 0, y: -1 },
        DOWN: { x: 0, y: 1 },
        LEFT: { x: -1, y: 0 },
        RIGHT: { x: 1, y: 0 }
    },
    
    // Key codes
    KEYS: {
        UP: 'ArrowUp',
        DOWN: 'ArrowDown',
        LEFT: 'ArrowLeft',
        RIGHT: 'ArrowRight',
        PAUSE: 'Escape',
        IMMUNITY: 'p' // Key to activate immunity
    },
    
    // Game states
    GAME_STATES: {
        MENU: 'menu',
        PLAYING: 'playing',
        GAME_OVER: 'game_over',
        PAUSED: 'paused'
    }
}; 