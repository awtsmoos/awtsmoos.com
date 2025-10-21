// B"H

// --- Self-contained Seeded Random Number Generator ---
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

// --- Game Constants ---
const COLORS = { 1: '#F07', 2: '#0CF', 3: '#0F9', 4: '#F80', 5: '#FFD700', 6: '#93F', 7: '#FFF' };
const SHAPES = { 1: [[1, 1, 1, 1]], 2: [[1, 1, 1], [0, 1, 0]], 3: [[1, 1, 0], [0, 1, 1]], 4: [[0, 1, 1], [1, 1, 0]], 5: [[1, 1, 1], [1, 0, 0]], 6: [[1, 1, 1], [0, 0, 1]], 7: [[1, 1], [1, 1]] };
const COLS = 10;
const LOGICAL_ROWS = 40;
const VIEWPORT_ROWS = 18;

// --- Global State ---
let gameInstances = [];
let animationFrameId;
let backgroundAnimationId;
let backgroundCtx;
let backgroundStars = [];

// *** PURE CALCULATOR AI ENGINE V3 ***
class AIEngine {
    constructor(game) {
        this.game = game;
        this.isThinking = false;
        this.thinkDelay = 100; // ms
        this.lastThinkTime = 0;
    }

    update(timestamp) {
        if (this.game.gameOver || !this.game.piece || this.isThinking) {
            return;
        }
        if (timestamp - this.lastThinkTime > this.thinkDelay) {
            this.isThinking = true;
            this.lastThinkTime = timestamp;
            const bestMove = this.findBestMove();
            if (bestMove) {
                this.game.applyAIMove(bestMove);
            } else {
                // As a fallback if no move is found
                this.game.hardDrop();
            }
            this.isThinking = false;
        }
    }

    findBestMove() {
        if (!this.game.piece || !this.game.piece.matrix) return null;

        let bestScore = -Infinity;
        let bestMove = null;

        // Iterate through all possible rotations
        for (let rot = 0; rot < 4; rot++) {
            let currentMatrix = this.game.piece.matrix;
            for (let i = 0; i < rot; i++) {
                currentMatrix = currentMatrix[0].map((_, c) => currentMatrix.map(row => row[c]).reverse());
            }

            // Iterate through all possible horizontal positions
            for (let x = -2; x < COLS; x++) {
                const moveCandidate = { x, y: 0, matrix: currentMatrix };

                // Check if this placement is valid at the top
                if (this._collides(moveCandidate, this.game.board, {})) {
                    continue;
                }

                // Simulate a hard drop to find the final position
                let tempBoard = this.game.board.map(r => [...r]);
                let finalY = 0;
                while (!this._collides({ ...moveCandidate, y: finalY }, tempBoard, { y: 1 })) {
                    finalY++;
                }

                // Place the piece on the temporary board
                moveCandidate.matrix.forEach((row, my) => {
                    row.forEach((value, mx) => {
                        if (value !== 0) {
                            const boardY = finalY + my;
                            const boardX = moveCandidate.x + mx;
                            if (boardY >= 0 && boardX >= 0 && boardY < LOGICAL_ROWS && boardX < COLS) {
                                tempBoard[boardY][boardX] = 1; // Use a generic value for scoring
                            }
                        }
                    });
                });

                const score = this.scoreBoard(tempBoard);

                if (score > bestScore) {
                    bestScore = score;
                    bestMove = { x: moveCandidate.x, matrix: moveCandidate.matrix };
                }
            }
        }
        return bestMove;
    }

    _collides(piece, board, offset) {
        if (!piece || !piece.matrix) return true;
        for (let y = 0; y < piece.matrix.length; y++) {
            for (let x = 0; x < piece.matrix[y].length; x++) {
                if (piece.matrix[y][x] !== 0) {
                    const nextX = piece.x + x + (offset.x || 0);
                    const nextY = piece.y + y + (offset.y || 0);
                    if (nextX < 0 || nextX >= COLS || nextY >= LOGICAL_ROWS || (board[nextY] && board[nextY][nextX] !== 0)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    scoreBoard(board) {
        let aggregateHeight = 0, holes = 0, completedLines = 0, bumpiness = 0;
        const columnHeights = Array(COLS).fill(0);

        for (let x = 0; x < COLS; x++) {
            for (let y = 0; y < LOGICAL_ROWS; y++) {
                if (board[y][x] !== 0) {
                    columnHeights[x] = LOGICAL_ROWS - y;
                    break;
                }
            }
        }

        aggregateHeight = columnHeights.reduce((sum, height) => sum + height, 0);

        for (let x = 0; x < COLS; x++) {
            for (let y = LOGICAL_ROWS - columnHeights[x] + 1; y < LOGICAL_ROWS; y++) {
                if (board[y][x] === 0) holes++;
            }
        }

        for (let i = 0; i < COLS - 1; i++) {
            bumpiness += Math.abs(columnHeights[i] - columnHeights[i + 1]);
        }
        
        for (let y = 0; y < LOGICAL_ROWS; y++) {
            if (board[y].every(cell => cell !== 0)) completedLines++;
        }

        return (completedLines * 0.76) - (aggregateHeight * 0.51) - (holes * 0.35) - (bumpiness * 0.18);
    }
}

// *** UNBREAKABLE RE-ARCHITECTURE OF THE GAME INSTANCE V2 ***
class GameInstance {
    constructor(id, isAI, canvas) {
        this.id = id;
        this.isAI = isAI;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.pieceGenerator = new SeededRandom(Math.random().toString());
        this.BLOCK_SIZE = 0;
    }

    init() {
        this.board = Array.from({ length: LOGICAL_ROWS }, () => Array(COLS).fill(0));
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.gameOver = false;
        this.dropCounter = 0;
        this.dropInterval = 1000;
        this.lastTime = 0;
        this.isSoftDropping = false;
        this.piece = null;
        this.nextPiece = this.createNewPiece();
        this.viewportY = LOGICAL_ROWS - VIEWPORT_ROWS;
        this.targetViewportY = this.viewportY;

        if (this.isAI) {
            this.ai = new AIEngine(this);
        }

        this.spawnNewPiece();
    }

    update(timestamp) {
        if (this.gameOver) return;
        if (!this.lastTime) this.lastTime = timestamp;

        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        if (this.isAI) {
            this.ai.update(timestamp);
        } else { // Gravity only applies to human players
            this.dropCounter += deltaTime;
            const interval = this.isSoftDropping ? 50 : this.dropInterval;
            if (this.dropCounter > interval) {
                this.drop();
            }
        }
        this.updateViewport();
    }

    updateViewport() {
        if (Math.abs(this.targetViewportY - this.viewportY) > 0.01) {
            this.viewportY += (this.targetViewportY - this.viewportY) * 0.1; // Smooth scrolling
        }
    }

    draw() {
        if (!this.ctx) return;
        
        // **FIX:** Recalculate block size on every frame to handle canvas resizing.
        // This is the core fix for the "blank screen" issue.
        this.BLOCK_SIZE = this.canvas.width / COLS;
        if (!this.BLOCK_SIZE || this.canvas.width === 0) {
            return; // Don't draw if the canvas has no size
        }
        
        // Draw background
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw the board from the current viewport
        const startRow = Math.floor(this.viewportY);
        const endRow = Math.ceil(this.viewportY + VIEWPORT_ROWS);

        for (let y = startRow; y < endRow && y < LOGICAL_ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                if (this.board[y]?.[x] !== 0) {
                    this.drawBrick(this.ctx, x, y, this.board[y][x]);
                }
            }
        }

        // Draw the current piece and its indicator
        if (this.piece && this.piece.matrix) {
            this.drawMatrix(this.piece);
            if (this.piece.y + this.piece.matrix.length > this.viewportY + VIEWPORT_ROWS) {
                this.drawIndicator();
            }
        }
    }
    
    drawIndicator() {
        if (!this.piece || !this.piece.matrix) return;
        const s = this.BLOCK_SIZE;
        const pieceWidth = this.piece.matrix[0].length * s;
        const x = this.piece.x * s;
        const y = this.canvas.height - s * 0.5;
        const c = COLORS[this.piece.typeId];
        
        this.ctx.fillStyle = c;
        this.ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 150) * 0.25;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + pieceWidth, y);
        this.ctx.lineTo(x + pieceWidth / 2, y + s * 0.4);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.globalAlpha = 1.0;
    }

    drawBrick(ctx, logicalX, logicalY, typeId) {
        const screenY = (logicalY - this.viewportY) * this.BLOCK_SIZE;
        // Cull bricks that are off-screen
        if (screenY < -this.BLOCK_SIZE || screenY > this.canvas.height) return;

        const c = COLORS[typeId];
        const s = this.BLOCK_SIZE;
        const bX = logicalX * s;
        const p = s * 0.1; // Padding

        const grad = ctx.createLinearGradient(bX, screenY, bX + s, screenY + s);
        grad.addColorStop(0, c);
        grad.addColorStop(1, 'black');
        ctx.fillStyle = grad;
        ctx.fillRect(bX, screenY, s, s);

        ctx.fillStyle = c;
        ctx.fillRect(bX + p, screenY + p, s - p * 2, s - p * 2);

        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = p / 2;
        ctx.strokeRect(bX + p, screenY + p, s - p * 2, s - p * 2);
    }
    
    drawMatrix(p) {
        if (!p || !p.matrix) return;
        p.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.drawBrick(this.ctx, p.x + x, p.y + y, p.typeId);
                }
            });
        });
    }

    spawnNewPiece() {
        if (this.gameOver) return;
        this.piece = this.nextPiece;
        this.nextPiece = this.createNewPiece();

        if (!this.piece || !this.piece.matrix || !this.piece.matrix[0]) {
            this.setGameOver();
            return;
        }

        this.piece.x = Math.floor(COLS / 2) - Math.floor(this.piece.matrix[0].length / 2);
        this.piece.y = Math.floor(this.targetViewportY) - 2; // Spawn above the viewport

        // If spawn collides, try to move up. If still colliding, game over.
        let attempts = 0;
        while (this.collides(this.piece, {})) {
            this.piece.y--;
            attempts++;
            if (attempts > 5) {
                this.setGameOver();
                return;
            }
        }
    }

    createNewPiece() {
        const typeId = Math.floor(this.pieceGenerator.random() * 7) + 1;
        return { x: 0, y: 0, matrix: SHAPES[typeId], typeId: typeId };
    }

    collides(piece, offset) {
        if (!piece || !piece.matrix) return true;
        for (let y = 0; y < piece.matrix.length; y++) {
            for (let x = 0; x < piece.matrix[y].length; x++) {
                if (piece.matrix[y][x] !== 0) {
                    const nextX = piece.x + x + (offset.x || 0);
                    const nextY = piece.y + y + (offset.y || 0);
                    if (nextX < 0 || nextX >= COLS || nextY >= LOGICAL_ROWS || (this.board[nextY] && this.board[nextY][nextX] !== 0)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    lockPiece() {
        if (!this.piece) return;
        this.piece.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    const boardY = this.piece.y + y;
                    const boardX = this.piece.x + x;
                    if (boardY >= 0 && boardY < LOGICAL_ROWS) {
                        this.board[boardY][boardX] = this.piece.typeId;
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

    updateCameraTarget() {
        let highestBlockY = LOGICAL_ROWS;
        for (let y = 0; y < LOGICAL_ROWS; y++) {
            if (this.board[y].some(cell => cell !== 0)) {
                highestBlockY = y;
                break;
            }
        }

        const currentTarget = this.targetViewportY;
        // If the stack gets too high in the current view
        if (highestBlockY < currentTarget + 4) {
            let newTarget = highestBlockY - (VIEWPORT_ROWS * 0.75);
            this.targetViewportY = Math.max(0, Math.min(LOGICAL_ROWS - VIEWPORT_ROWS, newTarget));
        }
        // If the stack is very low (e.g. after many lines cleared)
        else if (highestBlockY > currentTarget + VIEWPORT_ROWS * 0.6) {
            let newTarget = highestBlockY - (VIEWPORT_ROWS * 0.75);
            this.targetViewportY = Math.min(LOGICAL_ROWS - VIEWPORT_ROWS, newTarget);
        }
    }

    setGameOver() {
        if (!this.gameOver) {
            this.gameOver = true;
            postMessage({ type: 'game_over', payload: { id: this.id } });
        }
    }

    move(direction) {
        if (!this.piece) return;
        if (!this.collides(this.piece, { x: direction })) {
            this.piece.x += direction;
        }
    }

    rotate() {
        if (!this.piece) return;
        const originalMatrix = this.piece.matrix;
        const newMatrix = originalMatrix[0].map((_, i) => originalMatrix.map(row => row[i]).reverse());
        const tempPiece = { ...this.piece, matrix: newMatrix };

        // Basic wall kick logic
        let offset = 0;
        if (this.collides(tempPiece, {})) {
            offset = tempPiece.x < COLS / 2 ? 1 : -1; // Kick away from center
            if (this.collides(tempPiece, { x: offset })) {
                 offset *= -2; // Try kicking farther the other way
                 if (this.collides(tempPiece, { x: offset })) {
                    offset = 0; // Can't kick, rotation fails
                 }
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

    applyAIMove(move) {
        if (!this.piece || !move) return;
        this.piece.matrix = move.matrix;
        this.piece.x = move.x;
        this.hardDrop();
    }

    sweepLines() {
        let linesCleared = 0;
        for (let y = LOGICAL_ROWS - 1; y >= 0; y--) {
            if (this.board[y] && this.board[y].every(value => value !== 0)) {
                linesCleared++;
                this.board.splice(y, 1);
                this.board.unshift(Array(COLS).fill(0));
                y++; // Re-check the same row index since we shifted everything down
            }
        }

        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.score += (10 * linesCleared * linesCleared) * this.level;
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = 1000 * Math.pow(0.85, this.level - 1);
            postMessage({
                type: 'ui_update',
                payload: { id: this.id, score: this.score, level: this.level, lines: this.lines }
            });
        }
    }
}

// --- Background Animation ---
function setupBackground(canvas) {
    backgroundCtx = canvas.getContext('2d');
    canvas.width = 1920;
    canvas.height = 1080;
    backgroundStars = [];
    for (let i = 0; i < 200; i++) {
        backgroundStars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 1.5,
            vx: Math.floor(Math.random() * 50) - 25,
            vy: Math.floor(Math.random() * 50) - 25
        });
    }
    if (backgroundAnimationId) cancelAnimationFrame(backgroundAnimationId);
    drawBackground();
}

function drawBackground() {
    if (!backgroundCtx) return;
    const canvas = backgroundCtx.canvas;
    backgroundCtx.clearRect(0, 0, canvas.width, canvas.height);
    backgroundCtx.globalCompositeOperation = "lighter";

    for (let i = 0, x = backgroundStars.length; i < x; i++) {
        let s = backgroundStars[i];
        backgroundCtx.fillStyle = "#111";
        backgroundCtx.beginPath();
        backgroundCtx.arc(s.x, s.y, s.r, 0, 2 * Math.PI);
        backgroundCtx.fill();
        backgroundCtx.fillStyle = "#222";
        backgroundCtx.beginPath();
        backgroundCtx.arc(s.x, s.y, s.r / 1.5, 0, 2 * Math.PI);
        backgroundCtx.fill();

        s.x += s.vx / 500;
        s.y += s.vy / 500;

        if (s.x < 0 || s.x > canvas.width) s.vx = -s.vx;
        if (s.y < 0 || s.y > canvas.height) s.vy = -s.vy;
    }
    backgroundAnimationId = requestAnimationFrame(drawBackground);
}


// --- MAIN GAME LOOP ---
function gameLoop(timestamp) {
    try {
        gameInstances.forEach(inst => {
            inst.update(timestamp);
            inst.draw();
        });
        animationFrameId = requestAnimationFrame(gameLoop);
    } catch (e) {
        console.error("FATAL ERROR IN GAME LOOP:", e);
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
    }
}

// --- MAIN WORKER MESSAGE HANDLER ---
self.onmessage = ({ data }) => {
    try {
        switch (data.type) {
            case 'init':
                const { bgCanvas, p1Canvas, p2Canvas, mode } = data.payload;
                
                if (bgCanvas) {
                    setupBackground(bgCanvas);
                }

                gameInstances = [];
                if (p1Canvas) {
                    const isP1AI = (mode === 'aivai');
                    const p1 = new GameInstance(1, isP1AI, p1Canvas);
                    gameInstances.push(p1);
                }
                if (mode !== 'single' && p2Canvas) {
                    const p2 = new GameInstance(2, true, p2Canvas); // P2 is always AI in current modes
                    gameInstances.push(p2);
                }

                gameInstances.forEach(inst => inst.init());

                if (animationFrameId) cancelAnimationFrame(animationFrameId);
                gameLoop();
                break;

            case 'input':
                const player1 = gameInstances.find(i => i.id === 1 && !i.isAI);
                if (player1) {
                    const { action, value } = data.payload;
                    switch (action) {
                        case 'move': player1.move(value); break;
                        case 'rotate': player1.rotate(); break;
                        case 'hard_drop': player1.hardDrop(); break;
                        case 'soft_drop_start': player1.isSoftDropping = true; break;
                        case 'soft_drop_end': player1.isSoftDropping = false; break;
                    }
                }
                break;
        }
    } catch (e) {
        console.error("UNHANDLED WORKER ERROR:", e);
    }
};