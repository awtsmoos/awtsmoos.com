// B"H
// Manages the core state of the game.

export let player;
export let entities;
export let particles;
export let cameraY;
export let gameState = 'waiting';
export let time;
export let ascension;
export let bestAscension;
export let groundY;

// --- NEW: UI State for the new menu ---
export let menuButtons = {};

export function init(canvasWidth, canvasHeight) {
    player = {
        x: canvasWidth / 2,
        y: canvasHeight * 0.8,
        radius: 15,
        tikkun: 0,
        maxTikkun: 100,
        isTikkun: false,
        tikkunTimer: 0,
        combo: 0
    };
    entities = [];
    particles = [];
    ascension = 0;
    bestAscension = localStorage.getItem('kavanahBestAscension') || 0;
    cameraY = 0;
    time = 0;
    gameState = 'waiting';
    groundY = canvasHeight + 100; // Initialize ground off-screen

    // --- NEW: Define button dimensions for the menu ---
    const btnWidth = canvasWidth * 0.6;
    const btnHeight = 60;
    const centerX = canvasWidth / 2 - btnWidth / 2;
    menuButtons = {
        start: { x: centerX, y: canvasHeight * 0.5, w: btnWidth, h: btnHeight },
        teachings: { x: centerX, y: canvasHeight * 0.5 + 80, w: btnWidth, h: btnHeight },
        back: { x: centerX, y: canvasHeight * 0.85, w: btnWidth, h: btnHeight }
    };
}

export const getPlayer = () => player;
export const getEntities = () => entities;
export const getParticles = () => particles;
export const getCameraY = () => cameraY;
export const getGameState = () => gameState;
export const getTime = () => time;
export const getAscension = () => ascension;
export const getBestAscension = () => bestAscension;
export const getGroundY = () => groundY;
export const getUIState = () => ({ gameState, menuButtons });

export const setGameState = (newState) => { gameState = newState; };
export const setBestAscension = (newBest) => { bestAscension = newBest; };
export const setPlayerPosition = (newX, newY) => { player.x = newX; player.y = newY; };

export const incrementTime = () => { time++; };
export const moveCamera = (speed) => { 
    cameraY -= speed;
    groundY -= speed; // The ground moves with the camera
};
export const updateAscension = (amount) => { ascension += amount; };
export const decrementTikkunTimer = () => { player.tikkunTimer--; };
export const endTikkun = () => { player.isTikkun = false; };

export function checkPlayerBounds(canvasWidth) {
    player.y = Math.min(player.y, cameraY + window.innerHeight - player.radius);
    player.x = Math.max(player.radius, Math.min(canvasWidth - player.radius, player.x));
}