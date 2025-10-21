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
        this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
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
        this.BLOCK_SIZE = 0;
    }

    init() {
        this.board = Array.from({ length: LOGICAL_ROWS }, () => Array(COLS).fill(0));
        this.score = 0; this.lines = 0; this.level = 1; this.gameOver = false;
        this.dropCounter = 0; this.dropInterval = 1000; this.lastTime = 0; this.isSoftDropping = false;
        this.piece = null;
        this.nextPiece = this.createNewPiece();
        this.viewportY = LOGICAL_ROWS - VIEWPORT_ROWS;
        this.targetViewportY = this.viewportY;
        if (this.isAI) this.ai = new AIEngine(this);
        this.spawnNewPiece();
    }

    update(timestamp) {
        if (this.gameOver) return;
        if (!this.lastTime) this.lastTime = timestamp;
        const deltaTime = timestamp - this.lastTime; this.lastTime = timestamp;

        if (this.isAI) {
            this.ai.update(timestamp);
        } else {
            this.dropCounter += deltaTime;
            const interval = this.isSoftDropping ? 50 : this.dropInterval;
            if (this.dropCounter > interval) this.drop();
        }
        this.updateViewport();
    }

    updateViewport() {
        if (Math.abs(this.targetViewportY - this.viewportY) > 0.01) {
            this.viewportY += (this.targetViewportY - this.viewportY) * 0.1;
        }
    }

    draw() {
    if (!this.ctx) return;
    
    this.BLOCK_SIZE = this.canvas.width / COLS;
    if (!this.BLOCK_SIZE || this.canvas.width === 0) return;

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

    // **THE FIX**: Add a comprehensive check before attempting to draw the piece.
    // This ensures `this.piece` and its `matrix` are valid objects.
    if (this.piece && this.piece.matrix && Array.isArray(this.piece.matrix)) {
        this.drawMatrix(this.piece);
        if (this.piece.y + this.piece.matrix.length > this.viewportY + VIEWPORT_ROWS) {
            this.drawIndicator();
        }
    }
}

    drawBrick(ctx, logicalX, logicalY, typeId) {
        const screenY = (logicalY - this.viewportY) * this.BLOCK_SIZE;
        if (screenY < -this.BLOCK_SIZE || screenY > this.canvas.height) return;

        const c = COLORS[typeId];
        const s = this.BLOCK_SIZE;
        const bX = logicalX * s;
        const p = s * 0.1;

        const grad = ctx.createLinearGradient(bX, screenY, bX + s, screenY + s);
        grad.addColorStop(0, c);
        grad.addColorStop(1, 'black');
        ctx.fillStyle = grad;
        ctx.fillRect(bX, screenY, s, s);

        ctx.fillStyle = c;
        ctx.fillRect(bX + p, screenY + p, s - p * 2, s - p * 2);
    }

    drawMatrix(p) {
    // **THE FIX**: This check is now the primary safeguard.
    // It prevents the 'forEach' error if the matrix is somehow invalid.
    if (!p || !p.matrix || !Array.isArray(p.matrix)) {
        return;
    }
    p.matrix.forEach((row, y) => {
        // Also check if each row is valid before iterating
        if (Array.isArray(row)) {
            row.forEach((val, x) => {
                if (val !== 0) this.drawBrick(this.ctx, p.x + x, p.y + y, p.typeId);
            });
        }
    });
}
    
    drawIndicator() {
        const s = this.BLOCK_SIZE;
        const pieceWidth = this.piece.matrix[0].length * s;
        const x = this.piece.x * s;
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

    // B"H
// In gameInstance.js

spawnNewPiece() {
    if (this.gameOver) return;

    this.piece = this.nextPiece;
    this.nextPiece = this.createNewPiece();

    // **THE FIX**: Add a robust check RIGHT AFTER assigning this.piece.
    // If the piece is invalid, we stop here to prevent a crash.
    // This usually means the SHAPES constant failed to load correctly.
    if (!this.piece || !this.piece.matrix || !Array.isArray(this.piece.matrix) || this.piece.matrix.length === 0 || !Array.isArray(this.piece.matrix[0])) {
        console.error("GAME OVER: Attempted to spawn an invalid piece.", this.piece);
        this.setGameOver();
        return;
    }

    // Now it's safe to access this.piece.matrix[0]
    this.piece.x = Math.floor(COLS / 2) - Math.floor(this.piece.matrix[0].length / 2);
    this.piece.y = Math.floor(this.targetViewportY) - this.piece.matrix.length;

    // If the piece collides immediately upon spawning (e.g., the board is full), it's game over.
    if (this.collides(this.piece, {})) {
        this.setGameOver();
    }
}

    createNewPiece() {
        const typeId = Math.floor(this.pieceGenerator.random() * 7) + 1;
        return { x: 0, y: 0, matrix: SHAPES[typeId], typeId: typeId };
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

    lockPiece() {
        if (!this.piece) return;
        this.piece.matrix.forEach((row, y) => row.forEach((val, x) => {
            if (val !== 0) {
                const bY = this.piece.y + y;
                if (bY >= 0) this.board[bY][this.piece.x + x] = this.piece.typeId;
            }
        }));
        this.piece = null;
        this.sweepLines();
        this.updateCameraTarget();
        if (!this.gameOver) this.spawnNewPiece();
    }

    updateCameraTarget() {
        let highestY = LOGICAL_ROWS;
        for (let y = 0; y < LOGICAL_ROWS; y++) {
            if (this.board[y].some(c => c !== 0)) { highestY = y; break; }
        }
        if (highestY < this.targetViewportY + 4) {
            this.targetViewportY = Math.max(0, highestY - (VIEWPORT_ROWS * 0.75));
        }
    }

    setGameOver() {
        if (!this.gameOver) {
            this.gameOver = true;
            postMessage({ type: 'game_over', payload: { id: this.id } });
        }
    }

    move(dir) {
        if (this.piece && !this.collides(this.piece, { x: dir })) this.piece.x += dir;
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
        if (!this.collides(this.piece, { y: 1 })) this.piece.y++;
        else this.lockPiece();
        this.dropCounter = 0;
    }

    hardDrop() {
        if (!this.piece) return;
        while (!this.collides(this.piece, { y: 1 })) this.piece.y++;
        this.lockPiece();
    }

    applyAIMove(move) {
        if (!this.piece || !move) return;
        this.piece.matrix = move.matrix; this.piece.x = move.x;
        this.hardDrop();
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
}