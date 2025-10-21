// B"H
// aiEngine.js
// Depends on: constants.js

class AIEngine {
    // --- CHANGE: Constructor now accepts a difficulty setting ---
    constructor(game, difficulty = 'unbeatable') {
        this.game = game;
        this.difficulty = difficulty;
        this.isThinking = false;

        // --- CHANGE: Set parameters based on difficulty ---
        if (this.difficulty === 'adaptive') {
            // Ramping difficulty for AI vs Player
            this.maxThinkDelay = 1000; // Starts very slow (1 second)
            this.minThinkDelay = 150;  // Fastest it can get (150ms)
            this.thinkDelay = this.maxThinkDelay;
            this.rampingFactor = 0.985; // How quickly it gets faster per line clear
        } else {
            // Unbeatable AI for AI vs AI
            this.thinkDelay = 50; // Consistently very fast
        }
        this.lastThinkTime = 0;
    }

    update(timestamp) {
        if (this.game.gameOver || !this.game.piece || this.isThinking) return;
        
        let currentThinkDelay = this.thinkDelay;

        // --- CHANGE: Adaptive logic for player-facing AI ---
        if (this.difficulty === 'adaptive') {
            // Calculate speed based on player's line count. It gets faster as the player clears more lines.
            const rampedDelay = this.maxThinkDelay * Math.pow(this.rampingFactor, this.game.lines);
            currentThinkDelay = Math.max(this.minThinkDelay, rampedDelay);

            // Add a random chance for a "speed burst" to make the AI less predictable
            if (this.game.lines > 5 && Math.random() < 0.15) {
                currentThinkDelay *= 0.5; // Think twice as fast for this move only
            }
        }

        if (timestamp - this.lastThinkTime > currentThinkDelay) {
            this.isThinking = true;
            this.lastThinkTime = timestamp;
            const bestMove = this.findBestMove();
            if (bestMove) {
                this.game.applyAIMove(bestMove);
            } else {
                this.game.hardDrop(); // Fallback if no move is found
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