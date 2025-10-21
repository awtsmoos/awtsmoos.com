// B"H

// --- Self-contained Seeded Random Number Generator ---
class SeededRandom {
    constructor(seedStr) { let h = 1779033703; for (let i = 0, l = seedStr.length; i < l; i++) { h = Math.imul(3432918353, h ^ seedStr.charCodeAt(i)); h = (h << 13) | (h >>> 19); } this.seed = h; }
    random() { this.seed = (this.seed * 1664525 + 1013904223) % 4294967296; return this.seed / 4294967296; }
}

// --- Game Constants ---
const COLORS = { 1: '#F07', 2: '#0CF', 3: '#0F9', 4: '#F80', 5: '#FFD700', 6: '#93F', 7: '#FFF' };
const SHAPES = { 1: [[1, 1, 1, 1]], 2: [[1, 1, 1], [0, 1, 0]], 3: [[1, 1, 0], [0, 1, 1]], 4: [[0, 1, 1], [1, 1, 0]], 5: [[1, 1, 1], [1, 0, 0]], 6: [[1, 1, 1], [0, 0, 1]], 7: [[1, 1], [1, 1]] };
const COLS = 10;
const LOGICAL_ROWS = 40;
const VIEWPORT_ROWS = 18;

let gameInstances = [];
let animationFrameId;

// *** FORTIFIED AI ENGINE V2 ***
class AIEngine {
    constructor(game) { this.game = game; this.isThinking = false; }
    update() { if (!this.isThinking && !this.game.gameOver && this.game.piece) { this.isThinking = true; setTimeout(() => this.think(), 50); } }
    think() {
        if (this.game.gameOver || !this.game.piece) { this.isThinking = false; return; }
        const bestMove = this.findBestMove();
        if (bestMove) { this.game.piece.matrix = bestMove.matrix; this.game.piece.x = bestMove.x; this.game.hardDrop(); } 
        else if (!this.game.gameOver) { this.game.hardDrop(); }
        this.isThinking = false;
    }
    _collides(piece, board, offset) {
        if (!piece || !piece.matrix) return true;
        for (let y = 0; y < piece.matrix.length; y++) { for (let x = 0; x < piece.matrix[y].length; x++) { if (piece.matrix[y][x] !== 0) { const nX = piece.x + x + (offset.x || 0), nY = piece.y + y + (offset.y || 0); if (nX < 0 || nX >= COLS || nY >= LOGICAL_ROWS || board[nY]?.[nX] !== 0) return true; } } }
        return false;
    }
    findBestMove() {
        if (!this.game.piece || !this.game.piece.matrix) return null;
        let bestScore = -Infinity, bestMove = null;
        for (let rot = 0; rot < 4; rot++) {
            let currentMatrix = this.game.piece.matrix;
            for (let i = 0; i < rot; i++) { currentMatrix = currentMatrix[0].map((_, c) => currentMatrix.map(row => row[c]).reverse()); }
            for (let x = -2; x < COLS; x++) {
                const moveCandidate = { x, y: 0, matrix: currentMatrix };
                if (this._collides(moveCandidate, this.game.board, {})) continue;
                let tempBoard = this.game.board.map(r => [...r]); let finalY = 0;
                while (!this._collides({ ...moveCandidate, y: finalY }, tempBoard, { y: 1 })) { finalY++; }
                moveCandidate.matrix.forEach((r, my) => r.forEach((v, mx) => { if (v !== 0) { const bY = finalY + my, bX = moveCandidate.x + mx; if (bY >= 0 && bX >= 0 && bY < LOGICAL_ROWS && bX < COLS) { tempBoard[bY][bX] = 1; } } }));
                const score = this.scoreBoard(tempBoard);
                if (score > bestScore) { bestScore = score; bestMove = { x: moveCandidate.x, matrix: moveCandidate.matrix }; }
            }
        }
        return bestMove;
    }
    scoreBoard(board) {
        let aggregateHeight = 0, holes = 0, lines = 0, bumpiness = 0;
        const columnHeights = Array(COLS).fill(0);
        for (let x = 0; x < COLS; x++) { for (let y = 0; y < LOGICAL_ROWS; y++) { if (board[y][x] !== 0) { columnHeights[x] = LOGICAL_ROWS - y; break; } } }
        aggregateHeight = columnHeights.reduce((a, b) => a + b, 0);
        for (let x = 0; x < COLS; x++) { for (let y = LOGICAL_ROWS - columnHeights[x]; y < LOGICAL_ROWS; y++) { if (board[y][x] === 0) holes++; } }
        for (let i = 0; i < COLS - 1; i++) { bumpiness += Math.abs(columnHeights[i] - columnHeights[i + 1]); }
        for (let y = 0; y < LOGICAL_ROWS; y++) { if(board[y].every(cell => cell !== 0)) lines++; }
        return (lines * 0.76) - (aggregateHeight * 0.51) - (holes * 0.35) - (bumpiness * 0.18);
    }
}

// *** UNBREAKABLE RE-ARCHITECTURE OF THE GAME INSTANCE ***
class GameInstance {
    constructor(id, isAI, canvas) {
        this.id = id; this.isAI = isAI; this.canvas = canvas; this.ctx = canvas.getContext('2d');
        this.pieceGenerator = new SeededRandom(Math.random().toString());
    }

    init() {
        this.board = Array.from({ length: LOGICAL_ROWS }, () => Array(COLS).fill(0));
        this.score = 0; this.lines = 0; this.level = 1; this.gameOver = false;
        this.dropCounter = 0; this.dropInterval = 1000; this.lastTime = 0; this.isSoftDropping = false;
        this.piece = null;
        this.nextPiece = this.createNewPiece();
        this.viewportY = LOGICAL_ROWS - VIEWPORT_ROWS; this.targetViewportY = this.viewportY;
        if (this.isAI) { this.ai = new AIEngine(this); }
        this.resize();
        this.spawnNewPiece();
    }
    
    resize() { this.BLOCK_SIZE = this.canvas.width / COLS; }

    update(timestamp) {
        if (this.gameOver) return;
        if (!this.lastTime) this.lastTime = timestamp;
        const deltaTime = timestamp - this.lastTime; this.lastTime = timestamp;
        if (this.isAI) { this.ai.update(); }
        this.dropCounter += deltaTime;
        const interval = this.isSoftDropping ? 50 : this.dropInterval;
        if (this.dropCounter > interval) { this.drop(); }
        this.updateViewport();
    }
    
    updateViewport() { if (Math.abs(this.targetViewportY - this.viewportY) > 0.01) { this.viewportY += (this.targetViewportY - this.viewportY) * 0.1; } }

    // *** DEFENSIVE DRAWING LOGIC ***
    draw() {
        this.ctx.fillStyle = '#000'; this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        const startRow = Math.floor(this.viewportY); const endRow = Math.ceil(this.viewportY + VIEWPORT_ROWS);
        for(let y = startRow; y < endRow && y < LOGICAL_ROWS; y++) { for(let x = 0; x < COLS; x++) { if(this.board[y]?.[x] !== 0) { this.drawBrick(this.ctx, x, y, this.board[y][x]); } } }
        // THE ULTIMATE GUARD: Only draw the piece if it is a complete, valid object.
        if (this.piece && this.piece.matrix) {
            this.drawMatrix(this.piece);
            if (this.piece.y + this.piece.matrix.length > this.viewportY + VIEWPORT_ROWS) { this.drawIndicator(); }
        }
    }
    
    drawIndicator() { if (!this.piece || !this.piece.matrix) return; const s = this.BLOCK_SIZE, x = this.piece.x * s, y = this.canvas.height - s * 0.5, c = COLORS[this.piece.typeId]; this.ctx.fillStyle = c; this.ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 150) * 0.25; this.ctx.beginPath(); this.ctx.moveTo(x, y); this.ctx.lineTo(x + s * this.piece.matrix[0].length, y); this.ctx.lineTo(x + s * this.piece.matrix[0].length / 2, y + s * 0.4); this.ctx.closePath(); this.ctx.fill(); this.ctx.globalAlpha = 1.0; }
    drawBrick(ctx, logicalX, logicalY, t) { const screenY = (logicalY - this.viewportY) * this.BLOCK_SIZE; if (screenY < -this.BLOCK_SIZE || screenY > this.canvas.height) return; const c = COLORS[t], s = this.BLOCK_SIZE, bX = logicalX * s, p = s * 0.1; const grad = ctx.createLinearGradient(bX, screenY, bX + s, screenY + s); grad.addColorStop(0, c); grad.addColorStop(1, 'black'); ctx.fillStyle = grad; ctx.fillRect(bX, screenY, s, s); ctx.fillStyle = c; ctx.fillRect(bX + p, screenY + p, s - p * 2, s - p * 2); ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = p / 2; ctx.strokeRect(bX + p, screenY + p, s - p * 2, s - p * 2); }
    drawMatrix(p) { if (!p || !p.matrix) return; p.matrix.forEach((r, y) => r.forEach((v, x) => { if (v !== 0) this.drawBrick(this.ctx, p.x + x, p.y + y, p.typeId); })); }
    
    // *** ATOMIC AND BULLETPROOF SPAWN FUNCTION ***
    spawnNewPiece() {
        if (this.gameOver) return;
        const newPiece = this.nextPiece;
        this.nextPiece = this.createNewPiece();

        if (!newPiece || !newPiece.matrix || !newPiece.matrix[0]) {
            this.setGameOver(); return;
        }

        newPiece.x = Math.floor(COLS / 2) - Math.floor(newPiece.matrix[0].length / 2);
        newPiece.y = Math.floor(this.targetViewportY) - 2;
        
        let attempts = 0;
        while (this.collides(newPiece, {})) {
            newPiece.y--;
            attempts++;
            if (attempts > 5) { this.setGameOver(); return; }
        }
        // Only assign to the official piece when it's fully validated and positioned.
        this.piece = newPiece;
    }

    createNewPiece() { const t = Math.floor(this.pieceGenerator.random() * 7) + 1; return { x: 0, y: 0, matrix: SHAPES[t], typeId: t }; }

    collides(piece, offset) {
        if (!piece || !piece.matrix) return true;
        for (let y = 0; y < piece.matrix.length; y++) { for (let x = 0; x < piece.matrix[y].length; x++) { if (piece.matrix[y][x] !== 0) { const nX = piece.x + x + (offset.x || 0); const nY = piece.y + y + (offset.y || 0); if (nX < 0 || nX >= COLS || nY >= LOGICAL_ROWS || this.board[nY]?.[nX] !== 0) return true; } } }
        return false;
    }

    lockPiece() {
        if (!this.piece) return;
        this.piece.matrix.forEach((r, y) => r.forEach((v, x) => { if (v !== 0) { const bY = this.piece.y + y; if (bY >= 0 && bY < LOGICAL_ROWS) this.board[bY][this.piece.x + x] = this.piece.typeId; } }));
        this.piece = null; // Transition to a null state. The engine is safe with this.
        this.sweepLines();
        this.updateCameraTarget();
        if (!this.gameOver) { this.spawnNewPiece(); }
    }

    updateCameraTarget() { let highestBlockY = LOGICAL_ROWS; for (let y = 0; y < LOGICAL_ROWS; y++) { if (this.board[y].some(cell => cell !== 0)) { highestBlockY = y; break; } } let currentTop = this.targetViewportY; if (highestBlockY < currentTop + 4) { let target = highestBlockY - (VIEWPORT_ROWS * 0.75); this.targetViewportY = Math.max(0, Math.min(LOGICAL_ROWS - VIEWPORT_ROWS, target)); } else if (highestBlockY > currentTop + VIEWPORT_ROWS * 0.6) { let target = highestBlockY - (VIEWPORT_ROWS * 0.75); this.targetViewportY = Math.min(LOGICAL_ROWS - VIEWPORT_ROWS, target); } }
    
    setGameOver() { if(!this.gameOver) { this.gameOver = true; postMessage({ type: 'game_over', payload: { id: this.id } }); } }
    
    // *** ALL FUNCTIONS BELOW HAVE IRONCLAD GUARDS ***
    move(d) { if (!this.piece) return; if (!this.collides(this.piece, { x: d })) { this.piece.x += d; } }
    rotate() { if (!this.piece) return; const r = this.piece.matrix[0].map((_, i) => this.piece.matrix.map(row => row[i]).reverse()); const p = { ...this.piece, matrix: r }; let o = 0; if (this.collides(p, {})) { o = p.x < COLS / 2 ? 1 : -1; if (this.collides(p, {x:o})) { o *= -1; if (this.collides(p,{x:o})) o=0;}} if (o !== 0 || !this.collides(p, {})) { this.piece.x += o; this.piece.matrix = r; } }
    drop() { if (!this.piece) return; if (!this.collides(this.piece, { y: 1 })) { this.piece.y++; } else { this.lockPiece(); } this.dropCounter = 0; }
    hardDrop() { if (!this.piece) return; while (!this.collides(this.piece, { y: 1 })) { this.piece.y++; } this.lockPiece(); }
    
    sweepLines() {
        let cleared = 0;
        for (let y = LOGICAL_ROWS - 1; y >= 0; y--) { if (this.board[y] && this.board[y].every(v => v !== 0)) { cleared++; this.board.splice(y, 1); this.board.unshift(Array(COLS).fill(0)); y++; } }
        if (cleared > 0) { this.lines += cleared; this.score += (10 * cleared * cleared) * this.level; this.level = Math.floor(this.lines / 10) + 1; this.dropInterval = 1000 * Math.pow(0.85, this.level - 1); postMessage({ type: 'ui_update', payload: { id: this.id, score: this.score, level: this.level, lines: this.lines } }); }
    }
}

// --- MAIN WORKER LOGIC WITH ERROR BOUNDARIES ---
self.onmessage = ({ data }) => {
    try {
        switch (data.type) {
            case 'init':
                const { bgCanvas, p1Canvas, p2Canvas, mode } = data.payload;
                let bgCtx = bgCanvas.getContext('2d'); let stars = [];
                function resizeBg() { bgCanvas.width = 1920; bgCanvas.height = 1080; stars = []; for (let i = 0; i < 200; i++) { stars.push({ x: Math.random() * bgCanvas.width, y: Math.random() * bgCanvas.height, radius: Math.random() * 1.5, vx: Math.floor(Math.random() * 50) - 25, vy: Math.floor(Math.random() * 50) - 25 }); } }
                function drawBg() { if(!bgCtx) return; bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height); bgCtx.globalCompositeOperation = "lighter"; for (let i = 0, x = stars.length; i < x; i++) { let s = stars[i]; bgCtx.fillStyle = "#111"; bgCtx.beginPath(); bgCtx.arc(s.x, s.y, s.radius, 0, 2 * Math.PI); bgCtx.fill(); bgCtx.fillStyle = "#222"; bgCtx.beginPath(); bgCtx.arc(s.x, s.y, s.radius / 1.5, 0, 2 * Math.PI); bgCtx.fill(); s.x += s.vx / 500; s.y += s.vy / 500; if (s.x < 0 || s.x > bgCanvas.width) s.vx = -s.vx; if (s.y < 0 || s.y > bgCanvas.height) s.vy = -s.vy; } requestAnimationFrame(drawBg); }
                resizeBg(); drawBg();
                
                gameInstances = [];
                if (p1Canvas) { const p1 = new GameInstance(1, mode === 'aivai', p1Canvas); gameInstances.push(p1); }
                if (mode !== 'single' && p2Canvas) { const p2 = new GameInstance(2, true, p2Canvas); gameInstances.push(p2); }
                
                gameInstances.forEach(inst => inst.init());
                if (animationFrameId) cancelAnimationFrame(animationFrameId);
                gameLoop();
                break;
            case 'input':
                const player1 = gameInstances.find(inst => inst.id === 1 && !inst.isAI);
                if (player1) {
                    const { action, value } = data.payload;
                    switch(action) {
                        case 'move': player1.move(value); break;
                        case 'rotate': player1.rotate(); break;
                        case 'hard_drop': player1.hardDrop(); break;
                        case 'soft_drop_start': player1.isSoftDropping = true; break;
                        case 'soft_drop_end': player1.isSoftDropping = false; break;
                    }
                }
                break;
        }
    } catch (e) { console.error("UNHANDLED WORKER ERROR:", e); }
};

function gameLoop(timestamp) {
    try {
        gameInstances.forEach(inst => { inst.update(timestamp); inst.draw(); });
        animationFrameId = requestAnimationFrame(gameLoop);
    } catch(e) { console.error("FATAL ERROR IN GAME LOOP:", e); if (animationFrameId) cancelAnimationFrame(animationFrameId); }
}