//B"H
import { Game } from './js/game.js';
import { RenderSystem } from './js/systems/render_system.js';
import { InputSystem } from './js/systems/input_system.js';
import { UISystem } from './js/systems/ui_system.js';

const glCanvas = document.getElementById('gl-canvas');
const pauseScreen = document.getElementById('pause-message');
const pauseBtn = document.getElementById('pause-btn');

let renderSystem, inputSystem, uiSystem, game;
let lastTime = 0;

function init() {
    game = new Game(window.innerWidth, window.innerHeight);
    renderSystem = new RenderSystem(glCanvas);
    uiSystem = new UISystem('text-canvas');
    inputSystem = new InputSystem(game);
    
    resize();
    requestAnimationFrame(loop);
}

function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderSystem.resize(w, h);
    uiSystem.resize(w, h);
    game.width = w;
    game.height = h;
}
window.addEventListener('resize', resize);

function togglePause() {
    if(!game.isPlaying) return;
    game.isPaused = !game.isPaused;
    pauseScreen.style.display = game.isPaused ? 'block' : 'none';
    if(!game.isPaused) game.audio.resume();
}
pauseBtn.addEventListener('click', togglePause);
pauseScreen.addEventListener('click', togglePause);

document.addEventListener('visibilitychange', () => {
    if(document.hidden && game.isPlaying) {
        game.isPaused = true;
        pauseScreen.style.display = 'block';
    }
});

function loop(timestamp) {
    const dt = timestamp - lastTime;
    lastTime = timestamp;

    if(game.isPlaying && !game.isPaused) {
        game.update();
    }
    
    renderSystem.render(game, timestamp);
    uiSystem.render(game, renderSystem.renderer);

    requestAnimationFrame(loop);
}

init();
