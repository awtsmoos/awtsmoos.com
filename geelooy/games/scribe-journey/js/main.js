//B"H

// js/main.js
import { initInput } from './input.js';
import { initUI } from './ui.js';
import { renderGameState } from './render.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("B''H - Initializing The Scribe's Journey...");

    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    // Default size, will be configured by worker on init
    canvas.width = 400;
    canvas.height = 400;

    const gameWorker = new Worker('./js/workers/gameWorker.js', { type: 'module' });

    function sendToWorker(action, payload) {
        gameWorker.postMessage({ action, payload });
    }

    const ui = initUI(sendToWorker);
    initInput(sendToWorker);

    gameWorker.onmessage = (e) => {
        const { action, payload } = e.data;
        switch (action) {
            case 'gameStateUpdate':
                renderGameState(ctx, payload.state);
                break;
            case 'uiUpdate':
                ui.update(payload);
                break;
            case 'toast':
                ui.showToast(payload.message, payload.type);
                break;
        }
    };

    sendToWorker('init', {
        canvasWidth: canvas.width,
        canvasHeight: canvas.height
    });
});