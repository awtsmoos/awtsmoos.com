// B"H
// aiEngine.js
// Depends on: constants.js

class AIEngine {
    constructor(game) {
        this.game = game;
        this.isThinking = false;
        this.thinkDelay = 100;
        this.lastThinkTime = 0;
    }

    update(timestamp) {
        if (this.game.gameOver || !this.game.piece || this.isThinking) return;
        if (timestamp - this.lastThinkTime > this.thinkDelay) {
            this.isThinking = true;
            this.lastThinkTime = timestamp;
            const bestMove = this.findBestMove();
            if (bestMove) {
                this.game.applyAIMove(bestMove);
            } else {
                this.game.hardDrop();
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
                    if (v !== 0) {
                        const bY = finalY + my, bX = moveCandidate.x + mx;
                        if (bY >= 0 && bX >= 0 && bY < LOGICAL_ROWS && bX < COLS) {
                            tempBoard[bY][bX] = 1;
                        }
                    }
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

    _collides(piece, board, offset) {
        const pMatrix = piece.matrix;
        const pX = piece.x + (offset.x || 0);
        const pY = piece.y + (offset.y || 0);

        for (let y = 0; y < pMatrix.length; y++) {
            for (let x = 0; x < pMatrix[y].length; x++) {
                if (pMatrix[y][x] !== 0) {
                    const bX = pX + x;
                    const bY = pY + y;
                    if (bX < 0 || bX >= COLS || bY >= LOGICAL_ROWS || (board[bY] && board[bY][bX] !== 0)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    scoreBoard(board) {
        let holes = 0, aggregateHeight = 0, completedLines = 0, bumpiness = 0;
        const colHeights = Array(COLS).fill(0);

        for (let x = 0; x < COLS; x++) {
            for (let y = 0; y < LOGICAL_ROWS; y++) {
                if (board[y][x] !== 0) {
                    colHeights[x] = LOGICAL_ROWS - y;
                    break;
                }
            }
        }

        aggregateHeight = colHeights.reduce((sum, h) => sum + h, 0);

        for (let x = 0; x < COLS; x++) {
            for (let y = LOGICAL_ROWS - colHeights[x] + 1; y < LOGICAL_ROWS; y++) {
                if (board[y][x] === 0) holes++;
            }
        }

        for (let i = 0; i < COLS - 1; i++) {
            bumpiness += Math.abs(colHeights[i] - colHeights[i + 1]);
        }
        
        for (let y = 0; y < LOGICAL_ROWS; y++) {
            if (board[y].every(c => c !== 0)) completedLines++;
        }

        return (completedLines * 0.76) - (aggregateHeight * 0.51) - (holes * 0.35) - (bumpiness * 0.18);
    }
}