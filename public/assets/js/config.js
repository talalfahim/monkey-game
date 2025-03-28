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
        SIZE: 20, // Orb size in pixels
        SPEED: 20, // Pixels per second - much slower for better gameplay
        COLOR: '#f39c12', // Orange
        LIFE_SPAN: 3000 // How long orbs live (ms) - reduced to 3 seconds
    },
    
    // Game settings
    GAME_SETTINGS: {
        TICK_RATE: 60, // Game loop ticks per second
        DIFFICULTY_INCREASE_INTERVAL: 10, // Seconds between difficulty increases
        INITIAL_LIVES: 1
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
        PAUSE: 'Escape'
    },
    
    // Game states
    GAME_STATES: {
        MENU: 'menu',
        PLAYING: 'playing',
        GAME_OVER: 'game_over',
        PAUSED: 'paused'
    }
}; 