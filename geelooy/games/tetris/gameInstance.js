// B"H
// gameInstance.js REVISED - FULL REPLACEMENT

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
        if (this.isAI) this.ai = new AIEngine(this);
    }

    init() {
        this.board = Array.from({ length: LOGICAL_ROWS }, () => Array(COLS).fill(0));
        this.score = 0; this.lines = 0; this.level = 1; this.gameOver = false;
        this.dropCounter = 0; this.dropInterval = 1000; this.lastTime = 0; this.isSoftDropping = false;
        this.piece = null;
        this.nextPiece = this.createNewPiece();
        this.spawnNewPiece();
    }

    update(timestamp) {
        if (this.gameOver || !timestamp) return;
        if (!this.lastTime) this.lastTime = timestamp;
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        if (this.isAI) {
            this.ai.update(timestamp);
        } else {
            this.dropCounter += deltaTime;
            const interval = this.isSoftDropping ? 50 : this.dropInterval;
            if (this.dropCounter > interval) this.drop();
        }
    }

    // --- RENDERING LOGIC (THE PRIMARY FIX) ---
    draw() {
        if (!this.ctx) return;

        // 1. BLOCK_SIZE is now determined ONLY by the width.
        const BLOCK_SIZE = this.canvas.width / COLS;
        if (!BLOCK_SIZE) return;

        // 2. Calculate how many rows are visible based on the canvas's height.
        const visibleRows = this.canvas.height / BLOCK_SIZE;
        
        // 3. Define the viewport's top row so the bottom of the board is visible.
        const viewportTopY = LOGICAL_ROWS - visibleRows;

        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw the locked pieces on the board
        for (let y = 0; y < LOGICAL_ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                if (this.board[y][x] !== 0) {
                    this.drawBrick(this.ctx, x, y, this.board[y][x], BLOCK_SIZE, viewportTopY);
                }
            }
        }

        // Draw the current falling piece
        if (this.piece) {
            this.piece.matrix.forEach((row, y) => {
                row.forEach((val, x) => {
                    if (val !== 0) {
                        this.drawBrick(this.ctx, this.piece.x + x, this.piece.y + y, this.piece.typeId, BLOCK_SIZE, viewportTopY);
                    }
                });
            });
        }
    }

    drawBrick(ctx, logicalX, logicalY, typeId, blockSize, viewportTopY) {
        // Translate logical board coordinates to screen coordinates
        const screenX = logicalX * blockSize;
        const screenY = (logicalY - viewportTopY) * blockSize;

        // Don't draw bricks that are completely off-screen
        if (screenY < -blockSize || screenY > this.canvas.height) return;

        const c = COLORS[typeId];
        const p = blockSize * 0.1;

        const grad = ctx.createLinearGradient(screenX, screenY, screenX + blockSize, screenY + blockSize);
        grad.addColorStop(0, c);
        grad.addColorStop(1, 'black');
        ctx.fillStyle = grad;
        ctx.fillRect(screenX, screenY, blockSize, blockSize);

        ctx.fillStyle = c;
        ctx.fillRect(screenX + p, screenY + p, blockSize - p * 2, blockSize - p * 2);
    }
    
    // --- PIECE MANAGEMENT ---
    spawnNewPiece() {
        if (this.gameOver) return;
        this.piece = this.nextPiece;
        this.nextPiece = this.createNewPiece();

        this.piece.x = Math.floor(COLS / 2) - Math.floor(this.piece.matrix[0].length / 2);
        // Spawn piece at the very top of the logical board
        this.piece.y = 0; 

        if (this.collides(this.piece, {})) {
            this.setGameOver();
        }
    }

    lockPiece() {
        if (!this.piece) return;
        this.piece.matrix.forEach((row, y) => {
            row.forEach((val, x) => {
                if (val !== 0) {
                    const bY = this.piece.y + y;
                    if (bY >= 0) this.board[bY][this.piece.x + x] = this.piece.typeId;
                }
            });
        });
        this.piece = null;
        this.sweepLines();
        if (!this.gameOver) this.spawnNewPiece();
    }

    createNewPiece() {
        const typeId = Math.floor(this.pieceGenerator.random() * 7) + 1;
        return { x: 0, y: 0, matrix: SHAPES[typeId], typeId: typeId };
    }

    // --- GAMEPLAY MECHANICS (Unchanged) ---
    move(dir) { if (this.piece && !this.collides(this.piece, { x: dir })) this.piece.x += dir; }
    rotate() {
        if (!this.piece) return;
        const newMatrix = this.piece.matrix[0].map((_, i) => this.piece.matrix.map(row => row[i]).reverse());
        const tempPiece = { ...this.piece, matrix: newMatrix };
        let offset = 0;
        if (this.collides(tempPiece, {})) {
            offset = tempPiece.x < COLS / 2 ? 1 : -1;
            if (this.collides(tempPiece, { x: offset })) offset = 0;
        }
        if (offset !== 0 || !this.collides(tempPiece, {})) {
            this.piece.x += offset; this.piece.matrix = newMatrix;
        }
    }
    drop() {
        if (!this.piece) return;
        if (!this.collides(this.piece, { y: 1 })) this.piece.y++;
        else this.lockPiece();
        this.dropCounter = 0;
    }
    hardDrop() {
        if (!this.piece) return;
        while (!this.collides(this.piece, { y: 1 })) this.piece.y++;
        this.lockPiece();
    }
    collides(piece, offset) {
        const pMatrix = piece.matrix, pX = piece.x + (offset.x || 0), pY = piece.y + (offset.y || 0);
        for (let y = 0; y < pMatrix.length; y++) {
            for (let x = 0; x < pMatrix[y].length; x++) {
                if (pMatrix[y][x] !== 0) {
                    const bX = pX + x, bY = pY + y;
                    if (bX < 0 || bX >= COLS || bY >= LOGICAL_ROWS || (this.board[bY]?.[bX] !== 0)) return true;
                }
            }
        }
        return false;
    }
    sweepLines() {
        let cleared = 0;
        for (let y = LOGICAL_ROWS - 1; y >= 0; y--) {
            if (this.board[y].every(v => v !== 0)) {
                cleared++; this.board.splice(y, 1);
                this.board.unshift(Array(COLS).fill(0)); y++;
            }
        }
        if (cleared > 0) {
            this.lines += cleared; this.score += (10 * cleared * cleared) * this.level;
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = 1000 * Math.pow(0.85, this.level - 1);
            postMessage({ type: 'ui_update', payload: { id: this.id, score: this.score, level: this.level, lines: this.lines } });
        }
    }
    setGameOver() {
        if (!this.gameOver) {
            this.gameOver = true;
            postMessage({ type: 'game_over', payload: { id: this.id } });
        }
    }
    applyAIMove(move) {
        if (!this.piece || !move) return;
        this.piece.matrix = move.matrix; this.piece.x = move.x;
        this.hardDrop();
    }
}