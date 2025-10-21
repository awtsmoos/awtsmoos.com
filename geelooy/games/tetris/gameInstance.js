// B"H
// gameInstance.js - The Complete and Final Game Logic Class

// A robust pseudo-random number generator for deterministic piece sequences.
class SeededRandom {
    constructor(seedStr) {
        let h = 1779033703;
        for (let i = 0; i < seedStr.length; i++) {
            h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
            h = (h << 13) | (h >>> 19);
        }
        this.seed = h >>> 0;
        if (this.seed === 0) this.seed = 1; // Ensure seed is non-zero
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

// The main class that controls a single instance of the Tetris game.
class GameInstance {
    /**
     * @param {number} id - The player ID (e.g., 1 or 2).
     * @param {boolean} isAI - Whether this instance is controlled by AI.
     * @param {OffscreenCanvas} canvas - The canvas element to draw on.
     * @param {object} dimensions - The CSS dimensions { width, height } of the canvas.
     * @param {number} dpr - The device's pixel ratio for high-resolution rendering.
     */
    constructor(id, isAI, canvas, dimensions, dpr) {
        this.id = id;
        this.isAI = isAI;
        this.canvas = canvas; // The canvas is already sized with DPR in worker.js
        this.ctx = canvas.getContext('2d');
        this.dpr = dpr;
        this.pieceGenerator = new SeededRandom(id.toString());
        
        // The effects engine is instantiated here, managing all visual flair.
        this.effectsEngine = new EffectsEngine(this.ctx, this.dpr);
        
        if (isAI) {
            this.ai = new AIEngine(this);
        }
    }

    /**
     * Initializes or resets the game to its starting state.
     */
    init() {
        // Game state
        this.board = Array.from({ length: LOGICAL_ROWS }, () => Array(COLS).fill(0));
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.gameOver = false;
        
        // Timing and controls
        this.dropCounter = 0;
        this.dropInterval = 1000;
        this.lastTime = 0;
        this.isSoftDropping = false;
        this.piece = null;
        
        // Rendering metrics based on the high-resolution canvas
        this.blockSize = this.canvas.width / COLS; // Block size in physical pixels
        const visibleRows = this.canvas.height / this.blockSize;
        this.viewportTopY = LOGICAL_ROWS - visibleRows;
        
        // Kickstart the game
        this.nextPiece = this.createNewPiece();
        this.spawnNewPiece();
    }

    /**
     * The main update loop, called on every animation frame.
     * @param {number} timestamp - The current time provided by requestAnimationFrame.
     */
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

        // Update all active visual effects
        this.effectsEngine.update();
    }

    /**
     * The main drawing loop, called on every animation frame.
     */
    draw() {
        if (!this.ctx) return;
        
        // Clear the entire canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw the locked pieces on the board
        for (let y = 0; y < LOGICAL_ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                if (this.board[y][x] !== 0) {
                    this.drawBrick(x, y, this.board[y][x]);
                }
            }
        }

        // Draw the current falling piece
        if (this.piece) {
            this.piece.matrix.forEach((row, y) => {
                row.forEach((val, x) => {
                    if (val !== 0) {
                        this.drawBrick(this.piece.x + x, this.piece.y + y, this.piece.typeId);
                    }
                });
            });
        }
        
        // Draw all visual effects on top of the game
        this.effectsEngine.draw();
    }

    /**
     * Draws a single Tetris block at a given logical coordinate.
     */
    drawBrick(logicalX, logicalY, typeId) {
        const screenX = logicalX * this.blockSize;
        const screenY = (logicalY - this.viewportTopY) * this.blockSize;
        
        // Cull bricks that are fully off-screen
        if (screenY < -this.blockSize || screenY > this.canvas.height) return;

        const c = COLORS[typeId];
        const p = this.blockSize * 0.1; // Padding
        const bs = this.blockSize;     // Alias for block size

        const grad = this.ctx.createLinearGradient(screenX, screenY, screenX + bs, screenY + bs);
        grad.addColorStop(0, c);
        grad.addColorStop(1, 'black');
        
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(screenX, screenY, bs, bs);
        
        this.ctx.fillStyle = c;
        this.ctx.fillRect(screenX + p, screenY + p, bs - p * 2, bs - p * 2);
    }

    /**
     * Spawns a new piece at the top of the playfield.
     */
    spawnNewPiece() {
        if (this.gameOver) return;
        this.piece = this.nextPiece;
        this.nextPiece = this.createNewPiece();
        
        this.piece.x = Math.floor(COLS / 2) - Math.floor(this.piece.matrix[0].length / 2);
        this.piece.y = Math.floor(this.viewportTopY) - this.piece.matrix.length;
        
        // Ensure the piece is immediately visible
        while ((this.piece.y + this.piece.matrix.length) < Math.floor(this.viewportTopY)) {
             this.piece.y++;
        }

        if (this.collides(this.piece, {})) {
            this.setGameOver();
        }
    }

    /**
     * Locks the current piece into the board, triggering effects.
     */
    lockPiece() {
        if (!this.piece) return;
        
        // Trigger a visual effect for the piece landing
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
        
        if (!this.gameOver) {
            this.spawnNewPiece();
        }
    }

    /**
     * Checks for and clears completed lines, triggering effects.
     */
    sweepLines() {
        let clearedLines = [];
        for (let y = LOGICAL_ROWS - 1; y >= 0; y--) {
            if (this.board[y].every(v => v !== 0)) {
                clearedLines.push(y);
                this.board.splice(y, 1);
                this.board.unshift(Array(COLS).fill(0));
                y++; // Re-check the current row index
            }
        }

        if (clearedLines.length > 0) {
            // Trigger a major visual effect for clearing lines
            this.effectsEngine.triggerLineClear(clearedLines, this.blockSize, this.viewportTopY, this.canvas.width);
            
            // Update score, level, and game speed
            this.lines += clearedLines.length;
            this.score += (10 * clearedLines.length * clearedLines.length) * this.level;
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = 1000 * Math.pow(0.85, this.level - 1);
            
            // Send UI update to the main thread
            postMessage({ type: 'ui_update', payload: { id: this.id, score: this.score, level: this.level, lines: this.lines } });
        }
    }

    /**
     * Moves the current piece horizontally.
     */
    move(dir) {
        if (this.piece && !this.collides(this.piece, { x: dir })) {
            this.piece.x += dir;
        }
    }

    /**
     * Rotates the current piece with wall-kick logic.
     */
    rotate() {
        if (!this.piece) return;
        const newMatrix = this.piece.matrix[0].map((_, i) => this.piece.matrix.map(row => row[i]).reverse());
        const tempPiece = { ...this.piece, matrix: newMatrix };
        
        let offset = 0;
        if (this.collides(tempPiece, {})) {
            offset = tempPiece.x < COLS / 2 ? 1 : -1; // Basic wall kick
            if (this.collides(tempPiece, { x: offset })) {
                offset = 0; // Wall kick failed
            }
        }
        
        if (offset !== 0 || !this.collides(tempPiece, {})) {
            this.piece.x += offset;
            this.piece.matrix = newMatrix;
        }
    }

    /**
     * Moves the piece down by one step due to gravity.
     */
    drop() {
        if (!this.piece) return;
        if (!this.collides(this.piece, { y: 1 })) {
            this.piece.y++;
        } else {
            this.lockPiece();
        }
        this.dropCounter = 0;
    }

    /**
     * Instantly drops the piece to the bottom, triggering trail effects.
     */
    hardDrop() {
        if (!this.piece) return;
        let lastY = this.piece.y;
        while (!this.collides(this.piece, { y: 1 })) {
            // Leave a particle trail as the piece falls
            if (Math.floor(this.piece.y) !== Math.floor(lastY)) {
                 this.effectsEngine.triggerHardDropTrail(
                    this.piece.x, this.piece.y, this.piece.matrix[0].length, 
                    COLORS[this.piece.typeId], this.blockSize, this.viewportTopY
                );
                lastY = this.piece.y;
            }
            this.piece.y++;
        }
        this.lockPiece();
    }

    /**
     * Checks if a piece collides with the board or its boundaries.
     */
    collides(piece, offset) {
        const pMatrix = piece.matrix;
        const pX = piece.x + (offset.x || 0);
        const pY = piece.y + (offset.y || 0);

        for (let y = 0; y < pMatrix.length; y++) {
            for (let x = 0; x < pMatrix[y].length; x++) {
                if (pMatrix[y][x] !== 0) {
                    const boardX = pX + x;
                    const boardY = pY + y;
                    // Check boundaries and collision with existing blocks
                    if (boardX < 0 || boardX >= COLS || boardY >= LOGICAL_ROWS || (boardY >= 0 && this.board[boardY]?.[boardX] !== 0)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * Creates a new piece object with a random shape.
     */
    createNewPiece() {
        const typeId = Math.floor(this.pieceGenerator.random() * 7) + 1;
        return { x: 0, y: 0, matrix: SHAPES[typeId], typeId: typeId };
    }

    /**
     * Sets the game over state and informs the main thread.
     */
    setGameOver() {
        if (!this.gameOver) {
            this.gameOver = true;
            postMessage({ type: 'game_over', payload: { id: this.id } });
        }
    }

    /**
     * Applies a move calculated by the AI engine.
     */
    applyAIMove(move) {
        if (!this.piece || !move) return;
        this.piece.matrix = move.matrix;
        this.piece.x = move.x;
        this.hardDrop();
    }
}