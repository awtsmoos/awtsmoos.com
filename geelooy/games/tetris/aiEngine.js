// B'H
// aiEngine.js

class AIEngine {
    constructor(game, difficulty = 'unbeatable') {
        this.game = game;
        this.difficulty = difficulty;
        this.isThinking = false;

        if (this.difficulty === 'adaptive') {
            this.maxThinkDelay = 1500;
            this.minThinkDelay = 200;
            this.rampingFactor = 0.98;
        } else {
            // Unbeatable AI for AI vs AI
            this.thinkDelay = 50; // Still thinks instantly
        }
        this.lastThinkTime = 0;
    }

    update(timestamp) {
        if (this.game.gameOver || !this.game.piece || this.isThinking) return;

        let currentThinkDelay = this.difficulty === 'adaptive' ?
            Math.max(this.minThinkDelay, this.maxThinkDelay * Math.pow(this.rampingFactor, this.game.lines)) :
            this.thinkDelay;

        if (this.difficulty === 'adaptive' && this.game.lines > 5 && Math.random() < 0.15) {
            currentThinkDelay *= 0.5;
        }

        if (timestamp - this.lastThinkTime > currentThinkDelay) {
            this.isThinking = true;
            this.lastThinkTime = timestamp;

            const bestMove = this.findBestMove();

            if (bestMove) {
                this.game.setAIPieceState(bestMove);

                // --- CHANGE: Aggressive dropping for AI vs AI mode ---
                // If this is an 'unbeatable' Golem, give it a high chance to immediately soft drop.
                if (this.difficulty === 'unbeatable' && Math.random() < 0.75) { // 75% chance
                    this.game.isSoftDropping = true;
                }
            }
            this.isThinking = false;
        }
    }

    findBestMove() {
        if (!this.game.piece || !this.game.piece.matrix) return null;
        let bestScore = -Infinity, bestMove = null;
        let originalMatrix = this.game.piece.matrix;

        for (let rot = 0; rot < 4; rot++) {
            let currentMatrix = originalMatrix;
            for (let i = 0; i < rot; i++) {
                currentMatrix = currentMatrix[0].map((_, c) => currentMatrix.map(row => row[c]).reverse());
            }

            for (let x = -2; x < COLS; x++) {
                const moveCandidate = { x, y: 0, matrix: currentMatrix };
                if (this._collides(moveCandidate, this.game.board, {})) continue;

                let tempBoard = this.game.board.map(r => [...r]);
                let finalY = 0;
                while (!this._collides({ ...moveCandidate, y: finalY + 1 }, tempBoard, {})) {
                    finalY++;
                }

                moveCandidate.matrix.forEach((r, my) => r.forEach((v, mx) => {
                    if (v !== 0) { const bY = finalY + my, bX = moveCandidate.x + mx; if (bY >= 0 && bX >= 0 && bY < LOGICAL_ROWS && bX < COLS) { tempBoard[bY][bX] = 1; } }
                }));

                const score = this.scoreBoard(tempBoard);
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = { x: moveCandidate.x, matrix: currentMatrix };
                }
            }
        }
        return bestMove;
    }

    _collides(piece, board, offset) { const pM = piece.matrix, pX = piece.x + (offset.x || 0), pY = piece.y + (offset.y || 0); for (let y = 0; y < pM.length; y++) { for (let x = 0; x < pM[y].length; x++) { if (pM[y][x] !== 0) { const bX = pX + x, bY = pY + y; if (bX < 0 || bX >= COLS || bY >= LOGICAL_ROWS || (board[bY] && board[bY][bX] !== 0)) return true; } } } return false; }
    scoreBoard(board) { let h = 0, aH = 0, cL = 0, b = 0; const cH = Array(COLS).fill(0); for (let x = 0; x < COLS; x++) { for (let y = 0; y < LOGICAL_ROWS; y++) { if (board[y][x] !== 0) { cH[x] = LOGICAL_ROWS - y; break; } } } aH = cH.reduce((s, h) => s + h, 0); for (let x = 0; x < COLS; x++) { for (let y = LOGICAL_ROWS - cH[x] + 1; y < LOGICAL_ROWS; y++) { if (board[y][x] === 0) h++; } } for (let i = 0; i < COLS - 1; i++) { b += Math.abs(cH[i] - cH[i + 1]); } for (let y = 0; y < LOGICAL_ROWS; y++) { if (board[y].every(c => c !== 0)) cL++; } return (cL * 0.76) - (aH * 0.51) - (h * 0.35) - (b * 0.18); }
}