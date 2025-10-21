// B"H
document.addEventListener('DOMContentLoaded', () => {
    const mainMenu = document.getElementById('main-menu');
    const gameScreen = document.getElementById('game-screen');
    let gameWorker;

    // **FIX**: Moved the message handler to its own function for clarity.
    function handleWorkerMessages({ data }) {
        if (data.type === 'ui_update') {
            const { id, score, level, lines } = data.payload;
            document.getElementById(`p${id}-score`).innerText = score;
            document.getElementById(`p${id}-level`).innerText = level;
            document.getElementById(`p${id}-lines`).innerText = lines;
        } else if (data.type === 'game_over') {
            const overlay = document.createElement('div');
            overlay.className = 'game-over-overlay';
            overlay.innerText = 'Game Over';
            const canvasContainer = document.getElementById(`p${data.payload.id}-canvas`).parentElement;
            // Prevent adding multiple overlays
            if (!canvasContainer.querySelector('.game-over-overlay')) {
                 canvasContainer.appendChild(overlay);
            }
        }
    }

    // B"H
// In main.js

function startGame(mode) {
    mainMenu.classList.add('hidden');
    gameScreen.classList.remove('hidden');

    if (gameWorker) {
        gameWorker.terminate();
    }
    gameWorker = new Worker('worker.js');
    gameWorker.addEventListener('message', handleWorkerMessages);

    const p1c = document.getElementById('p1-container');
    const p2c = document.getElementById('p2-container');
    p1c.classList.remove('hidden');
    p2c.classList.remove('hidden');
    document.getElementById('p1-descend').classList.remove('hidden');
    document.querySelectorAll('.game-over-overlay').forEach(el => el.remove());

    // --- START OF FIX ---
    const p1Canvas = document.getElementById('p1-canvas');
    const p2Canvas = document.getElementById('p2-canvas');

    // **FIX**: Get the REAL dimensions of the canvases from the DOM.
    // We use clientWidth as it respects CSS sizing.
    const p1Rect = p1Canvas.getBoundingClientRect();

    const offscreenP1 = p1Canvas.transferControlToOffscreen();
    
    let initPayload = {
        p1Canvas: offscreenP1,
        // Send the dimensions to the worker.
        p1Dimensions: { width: p1Rect.width, height: p1Rect.height },
        mode: mode
    };
    const transferable = [offscreenP1];

    if (mode === 'single') {
        gameScreen.classList.remove('vertical-layout');
        p2c.classList.add('hidden');
        document.getElementById('p1-title').classList.add('hidden');
    } else {
        gameScreen.classList.add('vertical-layout');
        
        // **FIX**: Also get and send P2 dimensions.
        const p2Rect = p2Canvas.getBoundingClientRect();
        const offscreenP2 = p2Canvas.transferControlToOffscreen();
        
        initPayload.p2Canvas = offscreenP2;
        initPayload.p2Dimensions = { width: p2Rect.width, height: p2Rect.height };
        
        transferable.push(offscreenP2);
        document.getElementById('p1-title').classList.remove('hidden');
        document.getElementById('p1-title').innerText = (mode === 'pvai') ? 'PLAYER 1' : 'GOLEM';
    }
    // --- END OF FIX ---

    // Note: We've removed bgCanvas logic as it was not part of the core issue.
    gameWorker.postMessage({ type: 'init', payload: initPayload }, transferable);
    setupEventListeners(p1Canvas);
}

    function setupEventListeners(canvas) {
        document.removeEventListener('keydown', handleKey); // Remove old listeners
        document.removeEventListener('keyup', handleKey);
        document.addEventListener('keydown', handleKey);
        document.addEventListener('keyup', handleKey);

        let startX = 0, startY = 0, startTime = 0;
        const BLOCK_SIZE = canvas.clientWidth / 10;

        canvas.addEventListener('touchstart', e => {
            e.preventDefault();
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            startTime = Date.now();
        }, { passive: false });

        canvas.addEventListener('touchmove', e => {
            e.preventDefault();
            const deltaX = e.changedTouches[0].clientX - startX;
            if (Math.abs(deltaX) > BLOCK_SIZE) {
                gameWorker.postMessage({ type: 'input', payload: { action: 'move', value: Math.sign(deltaX) } });
                startX = e.changedTouches[0].clientX;
            }
        }, { passive: false });

        canvas.addEventListener('touchend', e => {
            e.preventDefault();
            const deltaX = e.changedTouches[0].clientX - startX;
            const deltaY = e.changedTouches[0].clientY - startY;
            const duration = Date.now() - startTime;
            if (duration < 250 && Math.abs(deltaX) < 20 && Math.abs(deltaY) < 20) {
                gameWorker.postMessage({ type: 'input', payload: { action: 'rotate' } });
            }
        }, { passive: false });

        const button = document.getElementById('p1-descend');
        const startDrop = (e) => { e.preventDefault(); gameWorker.postMessage({ type: 'input', payload: { action: 'soft_drop_start' } }); };
        const endDrop = (e) => { e.preventDefault(); gameWorker.postMessage({ type: 'input', payload: { action: 'soft_drop_end' } }); };
        button.addEventListener('mousedown', startDrop);
        button.addEventListener('mouseup', endDrop);
        button.addEventListener('mouseleave', endDrop);
        button.addEventListener('touchstart', startDrop);
        button.addEventListener('touchend', endDrop);
    }

    function handleKey(e) {
        const keyMap = {
            'ArrowLeft': { action: 'move', value: -1 }, 'ArrowRight': { action: 'move', value: 1 },
            'ArrowUp': { action: 'rotate' }, 'Space': { action: 'hard_drop' },
            'ArrowDown': { action: e.type === 'keydown' ? 'soft_drop_start' : 'soft_drop_end' }
        };
        if (keyMap[e.code]) {
            e.preventDefault();
            if (e.type === 'keydown' && e.repeat) return;
            gameWorker.postMessage({ type: 'input', payload: keyMap[e.code] });
        }
    }

    document.getElementById('play-single').addEventListener('click', () => startGame('single'));
    document.getElementById('play-pvai').addEventListener('click', () => startGame('pvai'));
    document.getElementById('play-aivai').addEventListener('click', () => startGame('aivai'));
});