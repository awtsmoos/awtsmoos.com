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
        vx: 0,
        vy: 0,
        attunement: 'chesed',
        tikkun: 0,
        maxTikkun: 100,
        isTikkun: false,
        tikkunTimer: 0,
        combo: 0,
        lastHarvestClass: 'none'
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
export const setPlayerVelocity = (vx, vy) => { player.vx = vx; player.vy = vy; };
export const setBestAscension = (newBest) => { bestAscension = newBest; };

export const incrementTime = () => { time++; };
export const moveCamera = (speed) => { cameraY -= speed; };
export const updateAscension = (amount) => { ascension += amount; };
export const decrementTikkunTimer = () => { player.tikkunTimer--; };
export const endTikkun = () => { player.isTikkun = false; };


export function updatePlayerPosition() {
    player.x += player.vx;
    player.y += player.vy;
}

export function checkPlayerBounds(canvasWidth) {
    player.y = Math.min(player.y, cameraY + window.innerHeight - player.radius);
    player.x = Math.max(player.radius, Math.min(canvasWidth - player.radius, player.x));
}