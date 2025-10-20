// B"H
document.addEventListener('DOMContentLoaded', () => {
    const mainMenu = document.getElementById('main-menu');
    const gameScreen = document.getElementById('game-screen');
    let gameWorker;

    function startGame(mode) {
        mainMenu.classList.add('hidden');
        gameScreen.classList.remove('hidden');

        if (gameWorker) {
            gameWorker.terminate();
        }
        gameWorker = new Worker('worker.js');

        const p1c = document.getElementById('p1-container');
        const p2c = document.getElementById('p2-container');
        p1c.classList.remove('hidden');
        p2c.classList.remove('hidden');
        document.getElementById('p1-descend').classList.remove('hidden');

        // Clear any previous overlays
        document.querySelectorAll('.game-over-overlay').forEach(el => el.remove());

        // Setup Canvases
        const bgCanvas = document.getElementById('background-canvas');
        const p1Canvas = document.getElementById('p1-canvas');
        const p2Canvas = document.getElementById('p2-canvas');

        const offscreenBg = bgCanvas.transferControlToOffscreen();
        const offscreenP1 = p1Canvas.transferControlToOffscreen();
        
        let initPayload = {
            bgCanvas: offscreenBg,
            p1Canvas: offscreenP1,
            mode: mode
        };
        const transferable = [offscreenBg, offscreenP1];

        if (mode === 'single') {
            gameScreen.classList.remove('vertical-layout');
            p2c.classList.add('hidden');
            document.getElementById('p1-title').classList.add('hidden');
        } else {
            gameScreen.classList.add('vertical-layout');
            const offscreenP2 = p2Canvas.transferControlToOffscreen();
            initPayload.p2Canvas = offscreenP2;
            transferable.push(offscreenP2);
            document.getElementById('p1-title').classList.remove('hidden');
            document.getElementById('p1-title').innerText = (mode === 'pvai') ? 'PLAYER 1' : 'GOLEM';
        }

        gameWorker.postMessage({ type: 'init', payload: initPayload }, transferable);
        setupEventListeners(p1Canvas);
    }

    function setupEventListeners(canvas) {
        // Keyboard Controls
        document.addEventListener('keydown', handleKey);
        document.addEventListener('keyup', handleKey);

        // Touch Controls
        let startX = 0, startY = 0, startTime = 0;
        const BLOCK_SIZE = canvas.clientWidth / 10; // Approximate for gesture sensitivity

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

        // Descend Button
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
            if(e.type === 'keydown' && e.repeat) return; // Prevent spamming
            gameWorker.postMessage({ type: 'input', payload: keyMap[e.code] });
        }
    }

    // Listen for UI updates from worker
    gameWorker?.addEventListener('message', ({ data }) => {
        if (data.type === 'ui_update') {
            const { id, score, level, lines } = data.payload;
            document.getElementById(`p${id}-score`).innerText = score;
            document.getElementById(`p${id}-level`).innerText = level;
            document.getElementById(`p${id}-lines`).innerText = lines;
        } else if (data.type === 'game_over') {
             const overlay = document.createElement('div');
             overlay.className = 'game-over-overlay';
             overlay.innerText = 'Game Over';
             document.getElementById(`p${data.payload.id}-canvas`).parentElement.appendChild(overlay);
        }
    });

    // Menu Buttons
    document.getElementById('play-single').addEventListener('click', () => startGame('single'));
    document.getElementById('play-pvai').addEventListener('click', () => startGame('pvai'));
    document.getElementById('play-aivai').addEventListener('click', () => startGame('aivai'));
});