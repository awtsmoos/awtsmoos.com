// B"H

const TILE_SIZE = 24;
const MAZE_WIDTH = 19; // Must be an odd number
const MAZE_HEIGHT = 21; // Must be an odd number

// Movement Speeds (pixels per second)
const NESHAMA_SPEED = 100;
const KLIPAH_SPEED = 85;

const NESHAMA_POWERUP_DURATION = 8000; // 8 seconds in milliseconds
const WALL_REMOVAL_PERCENTAGE = 0.30; // 30% of internal walls will be removed to create loops.

const ALEPH_BET = [
    'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ', 'ל', 'מ', 
    'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת'
];

const KLIPOT_CONFIG = [
    { color: 'red', startTile: { x: MAZE_WIDTH - 2, y: 1 } },
    // ** FIX: Moved pink Klipah to a safe starting position in the center **
    { color: 'pink', startTile: { x: Math.floor(MAZE_WIDTH / 2), y: Math.floor(MAZE_HEIGHT / 2) } },
    { color: 'cyan', startTile: { x: MAZE_WIDTH - 2, y: MAZE_HEIGHT - 2 } },
    { color: 'orange', startTile: { x: 1, y: MAZE_HEIGHT - 2 } }
];