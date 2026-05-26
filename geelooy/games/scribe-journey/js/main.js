
//B"H

// js/main.js
import { initInput } from './input.js';
import { initUI } from './ui.js';
import { renderGameState, updateTimeVisuals, addParticle } from './render.js';
import * as GameEngine from './workers/gameWorker.js';

document.addEventListener('DOMContentLoaded', () => {

    const canvas = document.getElementById('gameCanvas');
    const container = document.getElementById('gameContainer');
    const ctx = canvas.getContext('2d');
    
    // Responsive Canvas Resizing
    function resize() {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        ctx.imageSmoothingEnabled = false; 
    }
    window.addEventListener('resize', resize);
    resize();

    // Inject extra menu buttons dynamically
    const gameMenu = document.getElementById('gameMenu');
    if (gameMenu && !document.querySelector('[data-action="bestiary-screen"]')) {
        const createBtn = (text, action, color) => {
            const btn = document.createElement('button');
            btn.className = 'menu-button';
            btn.dataset.action = action;
            btn.textContent = text;
            if(color) btn.classList.add('menu-button-accent');
            return btn;
        };
        
        const returnBtn = gameMenu.lastElementChild;
        gameMenu.insertBefore(createBtn('Quest Board (NPC Mode)', 'player-quest-screen', '#00ff00'), returnBtn);
        gameMenu.insertBefore(createBtn('666 Features Log', 'features-screen', '#ff55ff'), returnBtn);
        gameMenu.insertBefore(createBtn('Sefer HaYetzira (Bestiary)', 'bestiary-screen'), returnBtn);
        gameMenu.insertBefore(createBtn('Mitzvah Tank (Achievements)', 'mitzvah-screen'), returnBtn);
        gameMenu.insertBefore(createBtn('50 Gates (Cheats)', 'gates-screen', '#ffaa00'), returnBtn);
    }

    const callbacks = {
        onStateUpdate: (payload) => {
            renderGameState(ctx, payload.state);
        },
        onTimeUpdate: (payload) => {
            updateTimeVisuals(ctx, payload.timeOfDay, payload.weather, payload.moonPhase, payload.isShabbat, payload.lightLevel, payload.maxLightLevel);
        },
        onUIUpdate: (payload) => {
            ui.update(payload);
            // Handle Visual FX from worker
            if (payload.fx) {
                if (payload.fx.type === 'particles') {
                    // Explode particles at player position
                    for(let i=0; i<payload.fx.amount; i++) {
                        addParticle('spark', canvas.width/2, canvas.height/2, payload.fx.color);
                    }
                }
            }
        },
        onToast: (payload) => {
            ui.showToast(payload.message, payload.type);
        }
    };

    function sendToEngine(action, payload) {
        if (action === 'input') {
            GameEngine.dispatch(payload);
        } else {
            GameEngine.dispatch({ action, ...payload });
        }
    }

    const ui = initUI(sendToEngine);
    initInput(sendToEngine);

    // Initialize Engine
    GameEngine.initGame(callbacks);

    // Start Loop
    function loop(now) {
        GameEngine.gameLoop(now);
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
});
