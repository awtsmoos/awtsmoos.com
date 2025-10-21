// B"H
// gameInstance.js
// Depends on: constants.js, aiEngine.js

class SeededRandom {
    constructor(seedStr) {
        let h = 1779033703;
        for (let i = 0, l = seedStr.length; i < l; i++) {
            h = Math.imul(3432918353, h ^ seedStr.charCodeAt(i));
            h = (h << 13) | (h >>> 19);
        }
        this.seed = h;
    }
    
    random() {
        this.seed = (this.seed * 1664525 + 1013904223) >>> 0;
        return this.seed / 4294967296;
    }
}

class GameInstance {
    constructor(id, isAI, canvas) {
        this.id = id;
        this.isAI = isAI;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.pieceGenerator = new SeededRandom(id.toString() + Math.random().toString());
        
        // Game state variables
        this.board = [];
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.gameOver = false;
        this.piece = null;
        this.nextPiece = null;
        
        // Timing and control variables
        this.dropCounter = 0;
        this.dropInterval = 1000;
        this.lastTime = 0;
        this.isSoftDropping = false;

        // Viewport and rendering variables
        this.BLOCK_SIZE = 0;
        this.viewportY = 0;
        this.targetViewportY = 0;
        this.renderOffsetX = 0;
        this.renderOffsetY = 0;

        if (this.isAI) {
            this.ai = new AIEngine(this);
        }
        console.log(`[P${this.id}] GameInstance constructed. AI: ${isAI}`);
    }

    // --- CORE INITIALIZATION ---
    init() {
        console.log(`[P${this.id}] --- INITIALIZING GAME ---`);
        this.board = Array.from({ length: LOGICAL_ROWS }, () => Array(COLS).fill(0));
        this.score = 0; this.lines = 0; this.level = 1; this.gameOver = false;
        this.dropCounter = 0; this.dropInterval = 1000; this.lastTime = 0; this.isSoftDropping = false;
        this.piece = null;
        this.viewportY = LOGICAL_ROWS - VIEWPORT_ROWS;
        this.targetViewportY = this.viewportY;
        
        // Pre-generate the first "next" piece before spawning the first active piece
        this.nextPiece = this.createNewPiece();
        console.log(`[P${this.id}] First 'next' piece created. TypeID: ${this.nextPiece.typeId}`);

        // Spawn the first piece to start the game
        this.spawnNewPiece();
    }

    // --- CORE GAME LOOP ---
    update(timestamp) {
        if (this.gameOver) return;
        if (!this.lastTime) this.lastTime = timestamp;
        
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        if (this.isAI) {
            this.ai.update(timestamp);
        } else {
            this.dropCounter += deltaTime;
            const currentDropInterval = this.isSoftDropping ? 50 : this.dropInterval;
            if (this.dropCounter > currentDropInterval) {
                this.drop();
            }
        }
        this.updateViewport();
    }

    updateViewport() {
        if (Math.abs(this.targetViewportY - this.viewportY) > 0.01) {
            this.viewportY += (this.targetViewportY - this.viewportY) * 0.1;
        }
    }

    // --- RENDERING LOGIC ---
    draw() {
        if (!this.ctx) return;

        const blockSizeW = this.canvas.width / COLS;
        const blockSizeH = this.canvas.height / VIEWPORT_ROWS;
        this.BLOCK_SIZE = Math.min(blockSizeW, blockSizeH);

        if (!this.BLOCK_SIZE || this.canvas.width === 0) return;

        const playfieldWidth = COLS * this.BLOCK_SIZE;
        const playfieldHeight = VIEWPORT_ROWS * this.BLOCK_SIZE;

        this.renderOffsetX = (this.canvas.width - playfieldWidth) / 2;
        this.renderOffsetY = (this.canvas.height - playfieldHeight) / 2;

        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const startRow = Math.floor(this.viewportY);
        const endRow = Math.ceil(this.viewportY + VIEWPORT_ROWS);

        for (let y = startRow; y < endRow && y < LOGICAL_ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                if (this.board[y]?.[x] !== 0) {
                    this.drawBrick(this.ctx, x, y, this.board[y][x]);
                }
            }
        }

        if (this.piece && this.piece.matrix) {
            this.drawMatrix(this.piece);
            if (this.piece.y + this.piece.matrix.length > this.viewportY + VIEWPORT_ROWS) {
                this.drawIndicator();
            }
        }
    }

    drawBrick(ctx, logicalX, logicalY, typeId) {
        const screenX = logicalX * this.BLOCK_SIZE + this.renderOffsetX;
        const screenY = (logicalY - this.viewportY) * this.BLOCK_SIZE + this.renderOffsetY;

        if (screenY < -this.BLOCK_SIZE || screenY > this.canvas.height + this.BLOCK_SIZE) return;

        const c = COLORS[typeId];
        const s = this.BLOCK_SIZE;
        const p = s * 0.1;

        const grad = ctx.createLinearGradient(screenX, screenY, screenX + s, screenY + s);
        grad.addColorStop(0, c);
        grad.addColorStop(1, 'black');
        ctx.fillStyle = grad;
        ctx.fillRect(screenX, screenY, s, s);

        ctx.fillStyle = c;
        ctx.fillRect(screenX + p, screenY + p, s - p * 2, s - p * 2);
    }

    drawMatrix(p) {
        p.matrix.forEach((row, y) => {
            row.forEach((val, x) => {
                if (val !== 0) this.drawBrick(this.ctx, p.x + x, p.y + y, p.typeId);
            });
        });
    }

    drawIndicator() {
        const s = this.BLOCK_SIZE;
        const pieceWidth = this.piece.matrix[0].length * s;
        const x = this.piece.x * s + this.renderOffsetX;
        const y = this.canvas.height - s * 0.5;
        const c = COLORS[this.piece.typeId];
        
        this.ctx.fillStyle = c;
        this.ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 150) * 0.25;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y); this.ctx.lineTo(x + pieceWidth, y);
        this.ctx.lineTo(x + pieceWidth / 2, y + s * 0.4);
        this.ctx.closePath(); this.ctx.fill();
        this.ctx.globalAlpha = 1.0;
    }

    // --- PIECE MANAGEMENT LOGIC ---
    spawnNewPiece() {
        if (this.gameOver) return;

        this.piece = this.nextPiece;
        this.nextPiece = this.createNewPiece();

        if (!this.piece || !this.piece.matrix) {
            console.error(`[P${this.id}] FATAL: Attempted to spawn an invalid piece. Check SHAPES constant.`);
            this.setGameOver();
            return;
        }
        
        this.piece.x = Math.floor(COLS / 2) - Math.floor(this.piece.matrix[0].length / 2);
        this.piece.y = Math.floor(this.targetViewportY) - this.piece.matrix.length;
        
        console.log(`[P${this.id}] SPAWNING PIECE. TypeID: ${this.piece.typeId}. Pos: (${this.piece.x}, ${this.piece.y}). Next piece is TypeID: ${this.nextPiece.typeId}`);

        if (this.collides(this.piece, {})) {
            console.log(`[P${this.id}] Game Over: Piece collided immediately on spawn.`);
            this.setGameOver();
        }
    }

    lockPiece() {
        if (!this.piece) return;

        console.log(`[P${this.id}] LOCKING PIECE. TypeID: ${this.piece.typeId}. Pos: (${this.piece.x}, ${this.piece.y})`);

        this.piece.matrix.forEach((row, y) => {
            row.forEach((val, x) => {
                if (val !== 0) {
                    const boardY = this.piece.y + y;
                    if (boardY >= 0) { // Only lock parts of the piece that are on the board
                        this.board[boardY][this.piece.x + x] = this.piece.typeId;
                    }
                }
            });
        });
        
        this.piece = null;
        this.sweepLines();
        this.updateCameraTarget();

        if (!this.gameOver) {
            this.spawnNewPiece();
        }
    }

    createNewPiece() {
        const typeId = Math.floor(this.pieceGenerator.random() * 7) + 1;
        return { x: 0, y: 0, matrix: SHAPES[typeId], typeId: typeId };
    }

    // --- GAMEPLAY MECHANICS ---
    move(dir) {
        if (this.piece && !this.collides(this.piece, { x: dir })) {
            this.piece.x += dir;
        }
    }

    rotate() {
        if (!this.piece) return;
        const originalMatrix = this.piece.matrix;
        const newMatrix = originalMatrix[0].map((_, i) => originalMatrix.map(row => row[i]).reverse());
        const tempPiece = { ...this.piece, matrix: newMatrix };
        
        let offset = 0;
        if (this.collides(tempPiece, {})) {
            offset = tempPiece.x < COLS / 2 ? 1 : -1; // Wall kick
            if (this.collides(tempPiece, { x: offset })) {
                offset = 0; // Wall kick failed
            }
        }

        if (offset !== 0 || !this.collides(tempPiece, {})) {
            this.piece.x += offset;
            this.piece.matrix = newMatrix;
        }
    }

    drop() {
        if (!this.piece) return;
        if (!this.collides(this.piece, { y: 1 })) {
            this.piece.y++;
        } else {
            this.lockPiece();
        }
        this.dropCounter = 0;
    }

    hardDrop() {
        if (!this.piece) return;
        while (!this.collides(this.piece, { y: 1 })) {
            this.piece.y++;
        }
        this.lockPiece();
    }

    collides(piece, offset) {
        const pMatrix = piece.matrix;
        const pX = piece.x + (offset.x || 0);
        const pY = piece.y + (offset.y || 0);

        for (let y = 0; y < pMatrix.length; y++) {
            for (let x = 0; x < pMatrix[y].length; x++) {
                if (pMatrix[y][x] !== 0) {
                    const boardX = pX + x;
                    const boardY = pY + y;
                    if (boardX < 0 || boardX >= COLS || boardY >= LOGICAL_ROWS || (this.board[boardY]?.[boardX] !== 0)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    sweepLines() {
        let clearedCount = 0;
        for (let y = LOGICAL_ROWS - 1; y >= 0; y--) {
            if (this.board[y].every(value => value !== 0)) {
                clearedCount++;
                this.board.splice(y, 1);
                y++; // Re-check the same row index since the board shifted down
            }
        }

        if (clearedCount > 0) {
            // Add new empty lines at the top
            for (let i = 0; i < clearedCount; i++) {
                this.board.unshift(Array(COLS).fill(0));
            }
            
            const oldLevel = this.level;
            this.lines += clearedCount;
            this.score += (10 * clearedCount * clearedCount) * this.level; // Example scoring
            this.level = Math.floor(this.lines / 10) + 1;
            
            if (this.level > oldLevel) {
                this.dropInterval = 1000 * Math.pow(0.85, this.level - 1);
            }

            console.log(`[P${this.id}] CLEARED ${clearedCount} LINES. Total lines: ${this.lines}. Score: ${this.score}. Level: ${this.level}`);
            postMessage({ type: 'ui_update', payload: { id: this.id, score: this.score, level: this.level, lines: this.lines } });
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
        if (highestBlockY < this.targetViewportY + 4) {
            this.targetViewportY = Math.max(0, highestBlockY - (VIEWPORT_ROWS * 0.75));
        }
    }

    setGameOver() {
        if (!this.gameOver) {
            this.gameOver = true;
            console.log(`[P${this.id}] --- GAME OVER --- Final Score: ${this.score}, Lines: ${this.lines}`);
            postMessage({ type: 'game_over', payload: { id: this.id } });
        }
    }

    // For AI if used
    applyAIMove(move) {
        if (!this.piece || !move) return;
        this.piece.matrix = move.matrix;
        this.piece.x = move.x;
        this.hardDrop();
    }
}