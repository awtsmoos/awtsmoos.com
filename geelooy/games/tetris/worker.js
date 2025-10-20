// B"H

// Worker scope does not have 'window', so we use 'self'
self.importScripts('https://cdnjs.cloudflare.com/ajax/libs/seedrandom/3.0.5/seedrandom.min.js');

// --- Game Constants ---
const COLORS = { 1: '#F07', 2: '#0CF', 3: '#0F9', 4: '#F80', 5: '#FFD700', 6: '#93F', 7: '#FFF' };
const SHAPES = { 1: [[1, 1, 1, 1]], 2: [[1, 1, 1], [0, 1, 0]], 3: [[1, 1, 0], [0, 1, 1]], 4: [[0, 1, 1], [1, 1, 0]], 5: [[1, 1, 1], [1, 0, 0]], 6: [[1, 1, 1], [0, 0, 1]], 7: [[1, 1], [1, 1]] };
const COLS = 10;
const LOGICAL_ROWS = 40;
const VIEWPORT_ROWS = 18;

let gameInstances = [];
let animationFrameId;

// --- Main Game Class (Worker Version) ---
class GameInstance {
    constructor(id, isAI, canvas) {
        this.id = id;
        this.isAI = isAI;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        this.board = Array.from({ length: LOGICAL_ROWS }, () => Array(COLS).fill(0));
        this.score = 0; this.lines = 0; this.level = 1; this.gameOver = false;
        this.dropCounter = 0; this.dropInterval = 1000; this.lastTime = 0; this.isSoftDropping = false;
        
        this.pieceGenerator = new Math.seedrandom(Math.random().toString());
        this.piece = null; this.nextPiece = this.createNewPiece();
        
        this.viewportY = LOGICAL_ROWS - VIEWPORT_ROWS;
        this.targetViewportY = this.viewportY;
        
        if (this.isAI) {
            // AI logic would be instantiated here if needed
        }
        
        this.resize();
        this.spawnNewPiece();
    }

    resize() {
        // The main thread handles the container size, we just match the canvas resolution
        const { width, height } = this.canvas;
        this.BLOCK_SIZE = width / COLS;
    }

    update(timestamp) {
        if (this.gameOver) return;
        if (!this.lastTime) this.lastTime = timestamp;
        
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.dropCounter += deltaTime;
        const interval = this.isSoftDropping ? 50 : this.dropInterval;
        if (this.dropCounter > interval) {
            this.drop();
        }
        this.updateViewport();
    }
    
    updateViewport() {
        if (Math.abs(this.targetViewportY - this.viewportY) > 0.01) {
            this.viewportY += (this.targetViewportY - this.viewportY) * 0.1;
        } else {
            this.viewportY = this.targetViewportY;
        }
    }

    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const startRow = Math.floor(this.viewportY);
        const endRow = Math.ceil(this.viewportY + VIEWPORT_ROWS);

        for(let y = startRow; y < endRow && y < LOGICAL_ROWS; y++) {
            for(let x = 0; x < COLS; x++) {
                if(this.board[y]?.[x] !== 0) {
                    this.drawBrick(this.ctx, x, y, this.board[y][x]);
                }
            }
        }

        if (this.piece) {
            this.drawMatrix(this.piece, 1);
            // Draw off-screen indicator
            if (this.piece.y + this.piece.matrix.length > this.viewportY + VIEWPORT_ROWS) {
                this.drawIndicator();
            }
        }
    }
    
    drawIndicator() {
        const s = this.BLOCK_SIZE;
        const x = this.piece.x * s;
        const y = this.canvas.height - s * 0.5;
        this.ctx.fillStyle = COLORS[this.piece.typeId];
        this.ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 150) * 0.25;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + s * this.piece.matrix[0].length, y);
        this.ctx.lineTo(x + s * this.piece.matrix[0].length / 2, y + s * 0.4);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.globalAlpha = 1.0;
    }

    drawBrick(ctx, logicalX, logicalY, t, a = 1) {
        const screenY = (logicalY - this.viewportY) * this.BLOCK_SIZE;
        if (screenY < -this.BLOCK_SIZE || screenY > this.canvas.height) return;

        const c = COLORS[t], s = this.BLOCK_SIZE, bX = logicalX * s, p = s * 0.1;
        ctx.globalAlpha = a;
        const grad = ctx.createLinearGradient(bX, screenY, bX + s, screenY + s);
        grad.addColorStop(0, c); grad.addColorStop(1, 'black');
        ctx.fillStyle = grad; ctx.fillRect(bX, screenY, s, s);
        ctx.fillStyle = c; ctx.fillRect(bX + p, screenY + p, s - p * 2, s - p * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = p / 2;
        ctx.strokeRect(bX + p, screenY + p, s - p * 2, s - p * 2);
        ctx.globalAlpha = 1.0;
    }

    drawMatrix(p, a) { p.matrix.forEach((r, y) => r.forEach((v, x) => { if (v !== 0) this.drawBrick(this.ctx, p.x + x, p.y + y, p.typeId, a); })); }

    spawnNewPiece() {
        this.piece = this.nextPiece;
        this.nextPiece = this.createNewPiece();
        this.piece.x = Math.floor(COLS / 2) - Math.floor(this.piece.matrix[0].length / 2);
        this.piece.y = Math.floor(this.targetViewportY) - 3; // Spawn just above the viewport
        if (this.collides(this.piece, { x: 0, y: 0 })) {
            this.setGameOver();
        }
    }

    createNewPiece() { const t = Math.floor(this.pieceGenerator() * 7) + 1; return { x: 0, y: 0, matrix: SHAPES[t], typeId: t }; }

    collides(p, o) {
        for (let y = 0; y < p.matrix.length; y++) {
            for (let x = 0; x < p.matrix[y].length; x++) {
                if (p.matrix[y][x] !== 0) {
                    const nX = p.x + x + o.x;
                    const nY = p.y + y + o.y;
                    if (nX < 0 || nX >= COLS || nY >= LOGICAL_ROWS || this.board[nY]?.[nX] !== 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    lockPiece() {
        if (!this.piece) return;
        this.piece.matrix.forEach((r, y) => r.forEach((v, x) => { if (v !== 0) { const bY = this.piece.y + y; if (bY >= 0) this.board[bY][this.piece.x + x] = this.piece.typeId; } }));
        this.sweepLines();
        this.updateCameraTarget();
        if (!this.gameOver) {
            this.spawnNewPiece();
        }
    }

    updateCameraTarget() {
        let highestBlockY = LOGICAL_ROWS;
        for (let y = 0; y < LOGICAL_ROWS; y++) {
            if (this.board[y].some(cell => cell !== 0)) {
                highestBlockY = y;
                break;
            }
        }
        // Only scroll up if the stack gets within the top 4 rows of the viewport
        if (highestBlockY < this.targetViewportY + 4) {
             let target = highestBlockY - (VIEWPORT_ROWS * 0.75);
             this.targetViewportY = Math.max(0, Math.min(LOGICAL_ROWS - VIEWPORT_ROWS, target));
        }
    }
    
    sweepLines() { /* ... unchanged ... */ }
    setGameOver() { this.gameOver = true; postMessage({ type: 'game_over', payload: { id: this.id } }); }
    move(d) { if (!this.gameOver && this.piece && !this.collides(this.piece, { x: d, y: 0 })) { this.piece.x += d; } }
    rotate() { /* ... unchanged ... */ }
    drop() { if (this.piece) { if (!this.collides(this.piece, { x: 0, y: 1 })) { this.piece.y++; } else { this.lockPiece(); } } this.dropCounter = 0; }
    hardDrop() { if (this.piece) { while (!this.collides(this.piece, { x: 0, y: 1 })) { this.piece.y++; } this.lockPiece(); } }
}

// --- Worker Main Logic ---
self.onmessage = ({ data }) => {
    switch (data.type) {
        case 'init':
            const { bgCanvas, p1Canvas, p2Canvas, mode } = data.payload;
            
            // Background is handled here now
            // ... (code for background animation)
            
            const p1 = new GameInstance(1, mode === 'aivai', p1Canvas);
            gameInstances.push(p1);

            if (mode !== 'single') {
                const p2 = new GameInstance(2, true, p2Canvas);
                gameInstances.push(p2);
            }
            
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
};

function gameLoop(timestamp) {
    gameInstances.forEach(inst => {
        inst.update(timestamp);
        inst.draw();
    });
    animationFrameId = requestAnimationFrame(gameLoop);
}

// Stubs for functions moved to GameInstance or not needed in worker
GameInstance.prototype.sweepLines = function() {
    let cleared = 0;
    for (let y = LOGICAL_ROWS - 1; y >= 0; y--) {
        if (this.board[y] && this.board[y].every(v => v !== 0)) {
            cleared++;
            this.board.splice(y, 1);
            this.board.unshift(Array(COLS).fill(0));
            y++; 
        }
    }
    if (cleared > 0) {
        this.lines += cleared;
        this.score += (10 * cleared * cleared) * this.level;
        this.level = Math.floor(this.lines / 10) + 1;
        this.dropInterval = 1000 * Math.pow(0.85, this.level - 1);
        postMessage({ type: 'ui_update', payload: { id: this.id, score: this.score, level: this.level, lines: this.lines } });
    }
};

GameInstance.prototype.rotate = function() {
    if (this.gameOver || !this.piece) return;
    const r = this.piece.matrix[0].map((_, i) => this.piece.matrix.map(row => row[i]).reverse());
    const p = { ...this.piece, matrix: r }; let o = 0;
    if (this.collides(p, { x: 0, y: 0 })) { o = p.x < COLS / 2 ? 1 : -1; if (this.collides(p, {x:o,y:0})) { o *= -1; if (this.collides(p,{x:o,y:0})) o=0;}}
    if (o !== 0 || !this.collides(p, {x:0, y:0})) { this.piece.x += o; this.piece.matrix = r; }
};