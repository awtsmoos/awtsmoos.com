// B"H



// gameInstance.js - FINAL VERSION (Replaces the entire class)

// B"H
// In gameInstance.js

class SeededRandom {
    /**
     * Creates a new pseudo-random number generator.
     * @param {string} seedStr - A string to use as the initial seed.
     */
    constructor(seedStr) {
        // This is a "hashing" function to convert an arbitrary string
        // into a starting 32-bit integer number for the seed.
        let h = 1779033703; // An arbitrary starting number
        for (let i = 0; i < seedStr.length; i++) {
            h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
            h = (h << 13) | (h >>> 19);
        }
        
        // The final seed must be a positive integer.
        // We ensure this with an unsigned right shift by 0.
        this.seed = h >>> 0;

        // If the seed somehow ends up as 0, which can cause issues with some
        // algorithms, we set it to a default non-zero value.
        if (this.seed === 0) {
            this.seed = 1;
        }
    }

    /**
     * Generates the next pseudo-random number in the sequence.
     * @returns {number} A floating-point number between 0 (inclusive) and 1 (exclusive).
     */
    random() {
        // This is the Mulberry32 algorithm. It's known for being fast and effective.
        let t = this.seed += 0x6D2B79F5; // Add a large hexadecimal constant
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        t = ((t ^ (t >>> 14)) >>> 0);

        // Update the seed for the next call
        this.seed = t;

        // Divide by the maximum possible 32-bit integer value to get a
        // result between 0 and 1.
        return this.seed / 4294967296;
    }
}




// B"H
// gameInstance.js - FINAL VERSION (Replaces the entire class)

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
        this.canvas = canvas; // This canvas is already high-resolution
        this.ctx = canvas.getContext('2d');
        this.pieceGenerator = new SeededRandom(id.toString() + Math.random().toString());

        // We store the devicePixelRatio to use in all our calculations.
        this.dpr = dpr;

        if (isAI) this.ai = new AIEngine(this);
    }

    init() {
        this.board = Array.from({ length: LOGICAL_ROWS }, () => Array(COLS).fill(0));
        this.score = 0; this.lines = 0; this.level = 1; this.gameOver = false;
        this.dropCounter = 0; this.dropInterval = 1000; this.lastTime = 0; this.isSoftDropping = false;
        this.piece = null;
        
        // --- START OF ASPECT RATIO FIX ---
        // All calculations are now done in PHYSICAL PIXELS.
        // We use canvas.width (e.g., 189 * 2 = 378px) not cssWidth.
        this.blockSize = this.canvas.width / COLS;
        
        // The number of visible rows is based on the physical height and square block size.
        const visibleRows = this.canvas.height / this.blockSize;
        this.viewportTopY = LOGICAL_ROWS - visibleRows;
        // --- END OF ASPECT RATIO FIX ---

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

    draw() {
        if (!this.ctx) return;
        
        // Clear the entire high-resolution canvas.
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw locked pieces
        for (let y = 0; y < LOGICAL_ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                if (this.board[y][x] !== 0) {
                    this.drawBrick(x, y, this.board[y][x]);
                }
            }
        }

        // Draw current piece
        if (this.piece) {
            this.piece.matrix.forEach((row, y) => {
                row.forEach((val, x) => {
                    if (val !== 0) {
                        this.drawBrick(this.piece.x + x, this.piece.y + y, this.piece.typeId);
                    }
                });
            });
        }
    }

    drawBrick(logicalX, logicalY, typeId) {
        // All drawing is now in the canvas's native physical pixel coordinates.
        const screenX = logicalX * this.blockSize;
        const screenY = (logicalY - this.viewportTopY) * this.blockSize;

        if (screenY < -this.blockSize || screenY > this.canvas.height) return;

        const c = COLORS[typeId];
        const p = this.blockSize * 0.1;

        const grad = this.ctx.createLinearGradient(screenX, screenY, screenX + this.blockSize, screenY + this.blockSize);
        grad.addColorStop(0, c);
        grad.addColorStop(1, 'black');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(screenX, screenY, this.blockSize, this.blockSize);

        this.ctx.fillStyle = c;
        this.ctx.fillRect(screenX + p, screenY + p, this.blockSize - p * 2, this.blockSize - p * 2);
    }

    spawnNewPiece() {
        if (this.gameOver) return;
        this.piece = this.nextPiece;
        this.nextPiece = this.createNewPiece();

        this.piece.x = Math.floor(COLS / 2) - Math.floor(this.piece.matrix[0].length / 2);
        this.piece.y = Math.floor(this.viewportTopY) - this.piece.matrix.length;
        
        // This ensures the piece is fully on screen when it spawns
        while ((this.piece.y + this.piece.matrix.length) < Math.floor(this.viewportTopY)) {
             this.piece.y++;
        }

        if (this.collides(this.piece, {})) {
            this.setGameOver();
        }
    }

    // --- PASTE THE REST OF YOUR UNCHANGED FUNCTIONS BELOW ---
    // (lockPiece, createNewPiece, move, rotate, drop, etc.)
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
        if (!this.collides(this.piece, { y: 1 })) {
            this.piece.y++;
        } else {
            this.lockPiece();
        }
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
                    if (bX < 0 || bX >= COLS || bY >= LOGICAL_ROWS || (bY >= 0 && this.board[bY]?.[bX] !== 0)) return true;
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








