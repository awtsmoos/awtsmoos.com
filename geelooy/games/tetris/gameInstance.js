// B"H
// gameInstance.js - The Complete and Final Game Logic Class

class SeededRandom {
    constructor(seedStr) {
        let h = 1779033703;
        for (let i = 0; i < seedStr.length; i++) {
            h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
            h = (h << 13) | (h >>> 19);
        }
        this.seed = h >>> 0;
        if (this.seed === 0) this.seed = 1;
    }
    random() {
        let t = this.seed += 0x6D2B79F5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        t = ((t ^ (t >>> 14)) >>> 0);
        this.seed = t;
        return this.seed / 4294967296;
    }
}

class GameInstance {
    constructor(id, isAI, canvas, dimensions, dpr) {
        this.id = id;
        this.isAI = isAI;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.dpr = dpr;
        this.pieceGenerator = new SeededRandom(id.toString());
        this.effectsEngine = new EffectsEngine(this.ctx, this.dpr);
        if (isAI) this.ai = new AIEngine(this);
    }

    init() {
        this.board = Array.from({ length: LOGICAL_ROWS }, () => Array(COLS).fill(0));
        this.score = 0; this.lines = 0; this.level = 1; this.gameOver = false;
        this.dropCounter = 0; this.dropInterval = 1000; this.lastTime = 0;
        this.isSoftDropping = false; this.piece = null;
        this.blockSize = this.canvas.width / COLS;
        const visibleRows = this.canvas.height / this.blockSize;
        this.viewportTopY = LOGICAL_ROWS - visibleRows;
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
            if (this.dropCounter > interval) {
                this.drop();
            }
        }
        this.effectsEngine.update();
    }

    draw() {
        if (!this.ctx) return;
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        for (let y = 0; y < LOGICAL_ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                if (this.board[y][x] !== 0) {
                    this.drawBrick(x, y, this.board[y][x]);
                }
            }
        }
        if (this.piece) {
            this.piece.matrix.forEach((row, y) => {
                row.forEach((val, x) => {
                    if (val !== 0) {
                        this.drawBrick(this.piece.x + x, this.piece.y + y, this.piece.typeId);
                    }
                });
            });
        }
        this.effectsEngine.draw();
    }

    // --- CHANGE: Replaced gradient with a sharp, flat, two-tone style ---
    drawBrick(logicalX, logicalY, typeId) {
        const screenX = logicalX * this.blockSize;
        const screenY = (logicalY - this.viewportTopY) * this.blockSize;
        if (screenY < -this.blockSize || screenY > this.canvas.height) return;
        
        const c = COLORS[typeId];
        const p = this.blockSize * 0.1; // Padding
        const bs = this.blockSize;

        // Draw a black background for a distinct border
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(screenX, screenY, bs, bs);
        
        // Draw the main, smaller, flat-color block on top
        this.ctx.fillStyle = c;
        this.ctx.fillRect(screenX + p, screenY + p, bs - p * 2, bs - p * 2);
    }

    spawnNewPiece() {
        if (this.gameOver) return;
        this.piece = this.nextPiece;
        this.nextPiece = this.createNewPiece();
        this.piece.x = Math.floor(COLS / 2) - Math.floor(this.piece.matrix[0].length / 2);
        this.piece.y = Math.floor(this.viewportTopY) - this.piece.matrix.length;
        while ((this.piece.y + this.piece.matrix.length) < Math.floor(this.viewportTopY)) {
             this.piece.y++;
        }
        if (this.collides(this.piece, {})) { this.setGameOver(); }
    }

    lockPiece() {
        if (!this.piece) return;
        this.effectsEngine.triggerImpact(this.piece, this.blockSize, this.viewportTopY);
        this.piece.matrix.forEach((row, y) => {
            row.forEach((val, x) => {
                if (val !== 0) {
                    const boardY = this.piece.y + y;
                    if (boardY >= 0) {
                        this.board[boardY][this.piece.x + x] = this.piece.typeId;
                    }
                }
            });
        });
        this.piece = null;
        this.sweepLines();
        if (!this.gameOver) { this.spawnNewPiece(); }
    }

    sweepLines() {
        let clearedLines = [];
        for (let y = LOGICAL_ROWS - 1; y >= 0; y--) {
            if (this.board[y].every(v => v !== 0)) {
                clearedLines.push(y);
                this.board.splice(y, 1);
                this.board.unshift(Array(COLS).fill(0));
                y++;
            }
        }
        if (clearedLines.length > 0) {
            this.effectsEngine.triggerLineClear(clearedLines, this.blockSize, this.viewportTopY, this.canvas.width);
            this.lines += clearedLines.length;
            this.score += (10 * clearedLines.length * clearedLines.length) * this.level;
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = 1000 * Math.pow(0.85, this.level - 1);
            postMessage({ type: 'ui_update', payload: { id: this.id, score: this.score, level: this.level, lines: this.lines } });
        }
    }

    move(dir) {
        if (!this.piece) return;
        if (!this.collides(this.piece, { x: dir })) {
            this.piece.x += dir;
        } else {
            this.effectsEngine.triggerWallSlide(this.piece, dir, this.blockSize, this.viewportTopY);
        }
    }

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
        if (!this.collides(this.piece, { y: 1 })) {
            this.piece.y++;
        } else { this.lockPiece(); }
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
        const pMatrix = piece.matrix,
              pX = piece.x + (offset.x || 0),
              pY = piece.y + (offset.y || 0);
              
        for (let y = 0; y < pMatrix.length; y++) {
            for (let x = 0; x < pMatrix[y].length; x++) {
                if (pMatrix[y][x] !== 0) {
                    const bX = pX + x,
                          bY = pY + y;

                    const row = this.board[bY];
                    if (bX < 0 || bX >= COLS || bY >= LOGICAL_ROWS || (row && row[bX] !== 0)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    createNewPiece() {
        const typeId = Math.floor(this.pieceGenerator.random() * 7) + 1;
        return { x: 0, y: 0, matrix: SHAPES[typeId], typeId: typeId };
    }

    setGameOver() {
        if (!this.gameOver) {
            this.gameOver = true;
            postMessage({ type: 'game_over', payload: { id: this.id } });
        }
    }

    applyAIMove(move) {
        if (!this.piece || !move) return;
        this.piece.matrix = move.matrix;
        this.piece.x = move.x;
        this.hardDrop();
    }
}