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
        // REMOVED: attunement, lastHarvestClass
    };
    entities = [];
    particles = [];
    ascension = 0;
    bestAscension = localStorage.getItem('kavanahBestAscension') || 0;
    cameraY = 0;
    time = 0;
    gameState = 'waiting';
}

export const getPlayer = () => player;
export const getEntities = () => entities;
export const getParticles = () => particles;
export const getCameraY = () => cameraY;
export const getGameState = () => gameState;
export const getTime = () => time;
export const getAscension = () => ascension;
export const getBestAscension = () => bestAscension;


export const setGameState = (newState) => { gameState = newState; };
export const setBestAscension = (newBest) => { bestAscension = newBest; };
export const setPlayerPosition = (newX, newY) => { player.x = newX; player.y = newY; };

export const incrementTime = () => { time++; };
export const moveCamera = (speed) => { cameraY -= speed; };
export const updateAscension = (amount) => { ascension += amount; };
export const decrementTikkunTimer = () => { player.tikkunTimer--; };
export const endTikkun = () => { player.isTikkun = false; };
export const movePlayer = (dx, dy) => { player.x += dx; player.y += dy; };

export function checkPlayerBounds(canvasWidth) {
    player.y = Math.min(player.y, cameraY + window.innerHeight - player.radius);
    player.x = Math.max(player.radius, Math.min(canvasWidth - player.radius, player.x));
}