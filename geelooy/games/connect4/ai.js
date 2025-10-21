//B"H
// --- Constants for AI ---
const AI_PIECE = 2;
const PLAYER_PIECE = 1;
const SEARCH_DEPTH = 5; // How many moves ahead the AI will think. Higher is smarter but slower.

/**
 * The main entry point for the AI. It decides the best possible move.
 * @param {Array<Array<number>>} board - The current game board.
 * @param {number} aiPiece - The number representing the AI's piece.
 * @returns {number} The best column to move in.
 */
function getGolemMove(board, aiPiece) {
    const opponentPiece = (aiPiece === PLAYER_PIECE) ? AI_PIECE : PLAYER_PIECE;
    let bestScore = -Infinity;
    let bestCol = -1;
    const validLocations = getValidLocations(board);

    // Prioritize the center column to start
    if (validLocations.includes(Math.floor(board[0].length / 2))) {
        bestCol = Math.floor(board[0].length / 2);
    } else if (validLocations.length > 0) {
        bestCol = validLocations[0];
    }
    
    for (const col of validLocations) {
        const row = getNextOpenRow(board, col);
        let tempBoard = board.map(r => [...r]);
        ai_dropPiece(tempBoard, row, col, aiPiece); // Use renamed helper
        let newScore = minimax(tempBoard, SEARCH_DEPTH, -Infinity, Infinity, false, aiPiece, opponentPiece);
        if (newScore > bestScore) {
            bestScore = newScore;
            bestCol = col;
        }
    }
    return bestCol;
}

/**
 * Minimax algorithm with Alpha-Beta pruning to find the optimal move.
 */
function minimax(board, depth, alpha, beta, isMaximizingPlayer, aiPiece, opponentPiece) {
    const validLocations = getValidLocations(board);
    const isTerminal = ai_isTerminalNode(board, aiPiece, opponentPiece); // Use renamed helper

    if (depth === 0 || isTerminal) {
        if (isTerminal) {
            if (ai_checkWin(board, aiPiece)) return 10000000; // Use renamed helper
            if (ai_checkWin(board, opponentPiece)) return -10000000; // Use renamed helper
            return 0; // Game is a draw
        }
        return scorePosition(board, aiPiece, opponentPiece);
    }

    if (isMaximizingPlayer) {
        let value = -Infinity;
        for (const col of validLocations) {
            const row = getNextOpenRow(board, col);
            let b_copy = board.map(r => [...r]);
            ai_dropPiece(b_copy, row, col, aiPiece); // Use renamed helper
            value = Math.max(value, minimax(b_copy, depth - 1, alpha, beta, false, aiPiece, opponentPiece));
            alpha = Math.max(alpha, value);
            if (alpha >= beta) break; // Pruning
        }
        return value;
    } else { // Minimizing player
        let value = Infinity;
        for (const col of validLocations) {
            const row = getNextOpenRow(board, col);
            let b_copy = board.map(r => [...r]);
            ai_dropPiece(b_copy, row, col, opponentPiece); // Use renamed helper
            value = Math.min(value, minimax(b_copy, depth - 1, alpha, beta, true, aiPiece, opponentPiece));
            beta = Math.min(beta, value);
            if (alpha >= beta) break; // Pruning
        }
        return value;
    }
}


/**
 * Scores a given board state. This is the AI's "brain".
 */
function scorePosition(board, piece, opponentPiece) {
    let score = 0;
    const rows = board.length;
    const columns = board[0].length;

    // Score center column
    const centerArray = board.map(row => row[Math.floor(columns / 2)]);
    const centerCount = centerArray.filter(p => p === piece).length;
    score += centerCount * 6;

    // Score Horizontal, Vertical, and Diagonal windows
    // (This logic is unchanged)
    for (let r = 0; r < rows; r++) { for (let c = 0; c <= columns - 4; c++) { score += evaluateWindow(board[r].slice(c, c + 4), piece, opponentPiece); } }
    for (let c = 0; c < columns; c++) { for (let r = 0; r <= rows - 4; r++) { score += evaluateWindow([board[r][c], board[r+1][c], board[r+2][c], board[r+3][c]], piece, opponentPiece); } }
    for (let r = 0; r <= rows - 4; r++) { for (let c = 0; c <= columns - 4; c++) { score += evaluateWindow([board[r][c], board[r+1][c+1], board[r+2][c+2], board[r+3][c+3]], piece, opponentPiece); } }
    for (let r = 0; r <= rows - 4; r++) { for (let c = 3; c < columns; c++) { score += evaluateWindow([board[r][c], board[r+1][c-1], board[r+2][c-2], board[r+3][c-3]], piece, opponentPiece); } }

    return score;
}

/**
 * Assigns a score to a 4-piece window.
 */
function evaluateWindow(window, piece, opponentPiece) {
    let score = 0;
    const aiCount = window.filter(p => p === piece).length;
    const playerCount = window.filter(p => p === opponentPiece).length;
    const emptyCount = window.filter(p => p === 0).length;

    if (aiCount === 4) score += 1000;
    else if (aiCount === 3 && emptyCount === 1) score += 10;
    else if (aiCount === 2 && emptyCount === 2) score += 5;

    if (playerCount === 3 && emptyCount === 1) score -= 80;
    else if (playerCount === 4) score -= 1000;

    return score;
}

// --- RENAMED AI Helper Functions ---

function getValidLocations(board) {
    return Array.from({ length: board[0].length }, (_, c) => c).filter(c => board[0][c] === 0);
}

function ai_isTerminalNode(board, aiPiece, opponentPiece) {
    return ai_checkWin(board, aiPiece) || ai_checkWin(board, opponentPiece) || getValidLocations(board).length === 0;
}

function getNextOpenRow(board, col) {
    for (let r = board.length - 1; r >= 0; r--) {
        if (board[r][col] === 0) return r;
    }
}

function ai_dropPiece(board, row, col, piece) {
    if (row !== undefined && row !== null) board[row][col] = piece;
}

function ai_checkWin(board, piece) {
    const rows = board.length;
    const columns = board[0].length;
    // Check horizontal, vertical, and diagonals
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (c + 3 < columns && board[r][c] === piece && board[r][c+1] === piece && board[r][c+2] === piece && board[r][c+3] === piece) return true;
            if (r + 3 < rows && board[r][c] === piece && board[r+1][c] === piece && board[r+2][c] === piece && board[r+3][c] === piece) return true;
            if (r + 3 < rows && c + 3 < columns && board[r][c] === piece && board[r+1][c+1] === piece && board[r+2][c+2] === piece && board[r+3][c+3] === piece) return true;
            if (r - 3 >= 0 && c + 3 < columns && board[r][c] === piece && board[r-1][c+1] === piece && board[r-2][c+2] === piece && board[r-3][c+3] === piece) return true;
        }
    }
    return false;
}