/**
 * Game Configuration
 * Contains all the constants and settings for the game
 */

const GAME_CONFIG = {
    // Board dimensions
    BOARD_SIZE: 8,
    TOTAL_PIECES_PER_PLAYER: 12,
    
    // Player types
    PLAYER_TYPES: {
        MONKEY: 'monkey',
        FOX: 'fox'
    },
    
    // Game states
    GAME_STATES: {
        WAITING: 'waiting_for_opponent',
        READY: 'ready_to_start',
        IN_PROGRESS: 'in_progress',
        FINISHED: 'finished'
    },
    
    // Initial piece positions
    // The board is represented as an 8x8 grid
    // Each position is an [x, y] coordinate
    INITIAL_POSITIONS: {
        monkey: [
            [1, 0], [3, 0], [5, 0], [7, 0],
            [0, 1], [2, 1], [4, 1], [6, 1],
            [1, 2], [3, 2], [5, 2], [7, 2]
        ],
        fox: [
            [0, 5], [2, 5], [4, 5], [6, 5],
            [1, 6], [3, 6], [5, 6], [7, 6],
            [0, 7], [2, 7], [4, 7], [6, 7]
        ]
    },
    
    // Abilities configuration
    ABILITIES: {
        DOUBLE_JUMP: {
            name: 'Double Jump',
            cooldown: 3, // turns
            description: 'Move a piece twice in one turn'
        },
        SWAP: {
            name: 'Swap',
            cooldown: 5,
            description: 'Swap positions of two of your pieces'
        },
        BLOCK: {
            name: 'Block',
            cooldown: 4,
            description: 'Block a tile for 2 turns'
        }
    },
    
    // Movement rules
    DIAGONAL_DIRECTIONS: [
        [-1, -1], [1, -1], [-1, 1], [1, 1]
    ],
    
    // Socket events
    EVENTS: {
        // Connection events
        CONNECT: 'connect',
        DISCONNECT: 'disconnect',
        
        // Room events
        CREATE_ROOM: 'create_room',
        JOIN_ROOM: 'join_room',
        ROOM_CREATED: 'room_created',
        ROOM_JOINED: 'room_joined',
        ROOM_FULL: 'room_full',
        PLAYER_JOINED: 'player_joined',
        
        // Game events
        GAME_START: 'game_start',
        GAME_UPDATE: 'game_update',
        MOVE_PIECE: 'move_piece',
        USE_ABILITY: 'use_ability',
        GAME_OVER: 'game_over',
        
        // Error events
        ERROR: 'error'
    }
}; 