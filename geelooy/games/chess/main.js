/*B"H*/

// =================================================================
//                 MAIN THREAD (UI/CANVAS/EVENTS)
// =================================================================

// --- DOM Element References ---
const canvas = document.getElementById('chessCanvas');
const canvasContext = canvas.getContext('2d');
const messageDiv = document.getElementById('message');
const mainMenu = document.getElementById('mainMenu');
const playVsAiButton = document.getElementById('playVsAiButton');
const playVsPlayerButton = document.getElementById('playVsPlayerButton');
const aiVsAiButton = document.getElementById('aiVsAiButton');
const gameContainer = document.getElementById('gameContainer');
const chessContainer = document.getElementById('chessContainer');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const gameOverText = document.getElementById('gameOverText');
const replayButton = document.getElementById('replayButton');
const downloadButton = document.getElementById('downloadButton');
const colorSelectionMenu = document.getElementById('colorSelectionMenu');
const playAsWhiteButton = document.getElementById('playAsWhiteButton');
const playAsBlackButton = document.getElementById('playAsBlackButton');

// --- Constants and State ---
const SIZE = Math.min(window.innerWidth - 20, window.innerHeight - 200, 500);
const SQUARE_SIZE = SIZE / 8;
let board = [];
let gameState = {};

function resetGameState() {
    gameState = {
        gameMode: null,      // 'pva', 'pvp', 'ava'
        turn: 'w',           // 'w' or 'b'
        playerColor: 'w',    // 'w' or 'b'
        selectedSquare: null,// [r, c]
        legalMoves: [],
        isAIMoving: false,
        gameOver: false,
        moveHistory: [],
        fenHistory: [],
        pgnResult: '*',
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    };
}

// ** CUSTOM PIECE THEME **
const PIECE_EMOJIS = {
    'K': '👑', 'Q': '✡️', 'R': '🏰', 'N': '🐴', 'P': '♟️'
};
const RABBI_EMOJI = '🧔';

// --- AI Worker Initialization ---
// The worker is now loaded from the external worker.js file.
const aiWorker = new Worker('worker.js');

aiWorker.onmessage = function(e) {
    const { bestMove, timeTaken, nodesSearched } = e.data;
    if (bestMove) {
        messageDiv.textContent = `AI moved. Searched ${nodesSearched} nodes in ${timeTaken}ms.`;
        animateAIMove(bestMove);
    } else {
        updateGameStatus(); // AI has no moves, game must be over
    }
};

// --- Chess Logic (Mirrored from worker for UI-side validation) ---
// This is a minimal set for move generation to display legal moves on the UI.
const chessLogic = {};
(function(logic) {
    logic.cloneBoard = function(b) { return b.map(r => r.slice()); };
    logic.makeMove = function(b, m) { const nB = logic.cloneBoard(b); const p = nB[m.from[0]][m.from[1]]; nB[m.to[0]][m.to[1]] = p; nB[m.from[0]][m.from[1]] = ''; if (p.toLowerCase() === 'p' && (m.to[0] === 0 || m.to[0] === 7)) { nB[m.to[0]][m.to[1]] = p === 'P' ? 'Q' : 'q'; } return nB; };
    logic.getPawnMoves = function(r,c,b) { const m = []; const p = b[r][c]; const iW = p === 'P'; const d = iW ? -1 : 1; const sR = iW ? 6 : 1; if (r + d < 0 || r + d >= 8) return m; if (b[r + d][c] === '') { m.push({ from: [r, c], to: [r + d, c] }); if (r === sR && b[r + 2 * d][c] === '') { m.push({ from: [r, c], to: [r + 2 * d, c] }); } } const o = [[d, -1], [d, 1]]; for (const [dr, dc] of o) { const nR = r + dr, nC = c + dc; if (nR >= 0 && nR < 8 && nC >= 0 && nC < 8) { const t = b[nR][nC]; if (t !== '' && iW !== (t === t.toUpperCase())) { m.push({ from: [r, c], to: [nR, nC] }); } } } return m; };
    logic.getKnightMoves = function(r, c, b) { const m = []; const p = b[r][c]; const iW = p === p.toUpperCase(); const o = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]]; for (const [dr, dc] of o) { const nR = r + dr, nC = c + dc; if (nR >= 0 && nR < 8 && nC >= 0 && nC < 8) { const t = b[nR][nC]; if (t === '') { m.push({ from: [r, c], to: [nR, nC] }); } else { if (iW !== (t === t.toUpperCase())) { m.push({ from: [r, c], to: [nR, nC] }); } } } } return m; };
    logic.getSlidingMoves = function(r, c, b, d) { const m = []; const p = b[r][c]; const iW = p === p.toUpperCase(); for (const [dr, dc] of d) { let nR = r + dr, nC = c + dc; while (nR >= 0 && nR < 8 && nC >= 0 && nC < 8) { const t = b[nR][nC]; if (t === '') { m.push({ from: [r, c], to: [nR, nC] }); } else { if (iW !== (t === t.toUpperCase())) { m.push({ from: [r, c], to: [nR, nC] }); } break; } nR += dr; nC += dc; } } return m; };
    logic.getKingMoves = function(r, c, b) { const m = []; const p = b[r][c]; const iW = p === p.toUpperCase(); const o = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]; for (const [dr, dc] of o) { const nR = r + dr, nC = c + dc; if (nR >= 0 && nR < 8 && nC >= 0 && nC < 8) { const t = b[nR][nC]; if (t === '') { m.push({ from: [r, c], to: [nR, nC] }); } else { if (iW !== (t === t.toUpperCase())) { m.push({ from: [r, c], to: [nR, nC] }); } } } } return m; };
    logic.getPseudoLegalMovesForPiece = function(p, r, c, b) { switch (p.toLowerCase()) { case 'p': return logic.getPawnMoves(r, c, b); case 'n': return logic.getKnightMoves(r, c, b); case 'b': return logic.getSlidingMoves(r, c, b, [[-1, -1], [-1, 1], [1, -1], [1, 1]]); case 'r': return logic.getSlidingMoves(r, c, b, [[-1, 0], [1, 0], [0, -1], [0, 1]]); case 'q': return logic.getSlidingMoves(r, c, b, [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]]); case 'k': return logic.getKingMoves(r, c, b); default: return []; } };
    logic.findKing = function(b, color) { const k = color === 'w' ? 'K' : 'k'; for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (b[r][c] === k) return { r, c }; return null; };
    logic.isSquareAttacked = function(b, r, c, aC) { for (let rA = 0; rA < 8; rA++) for (let cA = 0; cA < 8; cA++) { const p = b[rA][cA]; if (p === '') continue; const iW = p === p.toUpperCase(); if ((aC === 'w' && !iW) || (aC === 'b' && iW)) continue; const m = logic.getPseudoLegalMovesForPiece(p, rA, cA, b); for (const move of m) if (move.to[0] === r && move.to[1] === c) { if (p.toLowerCase() === 'p') { if (move.from[1] !== c) return true; } else { return true; } } } return false; };
    logic.generateAllLegalMoves = function(b, c) { const lM = []; const oC = c === 'w' ? 'b' : 'w'; for (let r = 0; r < 8; r++) for (let c_loop = 0; c_loop < 8; c_loop++) { const p = b[r][c_loop]; if (p === '') continue; const iW = p === p.toUpperCase(); if ((c === 'w' && !iW) || (c === 'b' && iW)) continue; const pM = logic.getPseudoLegalMovesForPiece(p, r, c_loop, b); for (const m of pM) { const nB = logic.makeMove(b, m); const kP = logic.findKing(nB, c); if (kP && !logic.isSquareAttacked(nB, kP.r, kP.c, oC)) { lM.push(m); } } } return lM; };
})(chessLogic);

function initBoardFromFEN(fen) {
    const [boardPart] = fen.split(' ');
    board = boardPart.split('/').map(row => {
        let newRow = [];
        for (const char of row) {
            if (isNaN(parseInt(char))) newRow.push(char);
            else for (let i = 0; i < parseInt(char); i++) newRow.push('');
        }
        return newRow;
    });
}

// --- Game Flow & Player Interaction ---
function handleSquareClick(r, c) {
    if (gameState.gameOver || gameState.isAIMoving || gameState.gameMode === 'ava') return;
    
    const isPlayerTurn = (gameState.turn === gameState.playerColor) || gameState.gameMode === 'pvp';
    if (!isPlayerTurn) return;

    if (gameState.selectedSquare) {
        const move = gameState.legalMoves.find(m => m.to[0] === r && m.to[1] === c);
        if (move) {
            performMove(move);
            return;
        }
    }

    const piece = board[r][c];
    if (piece) {
        const pieceIsOfCurrentTurn = (gameState.turn === 'w' && piece === piece.toUpperCase()) || (gameState.turn === 'b' && piece === piece.toLowerCase());
        if (pieceIsOfCurrentTurn) {
            gameState.selectedSquare = [r, c];
            gameState.legalMoves = chessLogic.generateAllLegalMoves(board, gameState.turn).filter(m => m.from[0] === r && m.from[1] === c);
        } else {
            gameState.selectedSquare = null;
            gameState.legalMoves = [];
        }
    } else {
        gameState.selectedSquare = null;
        gameState.legalMoves = [];
    }
    drawBoard();
}

function performMove(move) {
    const piece = board[move.from[0]][move.from[1]];
    const capturedPiece = board[move.to[0]][move.to[1]];
    board = chessLogic.makeMove(board, move);
    gameState.moveHistory.push({ move, piece, capturedPiece });
    gameState.fenHistory.push(boardToFEN(board));
    gameState.selectedSquare = null;
    gameState.legalMoves = [];
    gameState.turn = gameState.turn === 'w' ? 'b' : 'w';
    
    drawBoard();

    if (!updateGameStatus()) {
        if (gameState.gameMode === 'pva') {
            startAIMove();
        } else if (gameState.gameMode === 'pvp') {
            messageDiv.textContent = `${gameState.turn === 'w' ? 'White' : 'Black'}'s turn.`;
        }
    }
}

function applyAIMove(move) {
    const piece = board[move.from[0]][move.from[1]];
    const capturedPiece = board[move.to[0]][move.to[1]];
    board = chessLogic.makeMove(board, move);
    gameState.moveHistory.push({ move, piece, capturedPiece });
    gameState.fenHistory.push(boardToFEN(board));
    gameState.turn = (gameState.turn === 'w') ? 'b' : 'w';
    gameState.isAIMoving = false;

    drawBoard();

    if (!updateGameStatus()) {
        if (gameState.gameMode === 'ava') {
            setTimeout(startAIMove, 500);
        } else {
            messageDiv.textContent = "Your turn to move.";
        }
    }
}

function updateGameStatus() {
    const legalMoves = chessLogic.generateAllLegalMoves(board, gameState.turn);
    if (legalMoves.length === 0) {
        const kingPos = chessLogic.findKing(board, gameState.turn);
        const opponentColor = gameState.turn === 'w' ? 'b' : 'w';
        if (kingPos && chessLogic.isSquareAttacked(board, kingPos.r, kingPos.c, opponentColor)) {
            const winner = opponentColor === 'w' ? 'White' : 'Black';
            showGameOver(`Checkmate! ${winner} wins.`, winner === 'White' ? '1-0' : '0-1');
        } else {
            showGameOver("Stalemate! It's a draw.", "1/2-1/2");
        }
        return true;
    }
    return false;
}

function showGameOver(message, result) {
    gameState.gameOver = true;
    gameState.pgnResult = result;
    gameOverText.textContent = message;
    gameOverOverlay.style.display = 'flex';
}

function startAIMove() {
    gameState.isAIMoving = true;
    const turnColor = gameState.turn;
    messageDiv.textContent = `${turnColor === 'w' ? 'White' : 'Black'} AI is thinking...`;
    let fen = boardToFEN(board);
    aiWorker.postMessage({
        command: 'calculate_move',
        fen: fen,
        maxDepth: 4,
        color: turnColor,
        moveCount: gameState.moveHistory.length,
        fenHistory: gameState.fenHistory
    });
}

// --- Animation ---
let animationState = { isAnimating: false };

function animateAIMove(move) {
    const piece = board[move.from[0]][move.from[1]];
    const isWhiteView = gameState.gameMode !== 'pva' || gameState.playerColor === 'w';
    
    let startRow = isWhiteView ? move.from[0] : 7 - move.from[0];
    let startCol = isWhiteView ? move.from[1] : 7 - move.from[1];
    let endRow = isWhiteView ? move.to[0] : 7 - move.to[0];
    let endCol = isWhiteView ? move.to[1] : 7 - move.to[1];

    animationState = {
        isAnimating: true,
        piece: piece,
        finalMove: move,
        startX: startCol * SQUARE_SIZE + SQUARE_SIZE / 2,
        startY: startRow * SQUARE_SIZE + SQUARE_SIZE / 2,
        endX: endCol * SQUARE_SIZE + SQUARE_SIZE / 2,
        endY: endRow * SQUARE_SIZE + SQUARE_SIZE / 2,
        startTime: performance.now(),
        duration: 250
    };
    requestAnimationFrame(animationLoop);
}

function animationLoop(timestamp) {
    if (!animationState.isAnimating) return;
    const elapsed = timestamp - animationState.startTime;
    const progress = Math.min(elapsed / animationState.duration, 1);

    drawBoard(true);

    const currentX = animationState.startX + (animationState.endX - animationState.startX) * progress;
    const currentY = animationState.startY + (animationState.endY - animationState.startY) * progress;
    
    renderPiece(animationState.piece, currentX, currentY);

    if (progress < 1) {
        requestAnimationFrame(animationLoop);
    } else {
        animationState.isAnimating = false;
        applyAIMove(animationState.finalMove);
    }
}

// --- Drawing and Rendering ---
function drawBoard(isAnimating = false) {
    canvas.width = SIZE;
    canvas.height = SIZE;
    const isWhiteView = gameState.gameMode !== 'pva' || gameState.playerColor === 'w';

    for (let r_idx = 0; r_idx < 8; r_idx++) {
        for (let c_idx = 0; c_idx < 8; c_idx++) {
            const r = isWhiteView ? r_idx : 7 - r_idx;
            const c = isWhiteView ? c_idx : 7 - c_idx;

            canvasContext.fillStyle = (r_idx + c_idx) % 2 === 0 ? '#f0d9b5' : '#b58863';
            canvasContext.fillRect(c_idx * SQUARE_SIZE, r_idx * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);

            if (gameState.selectedSquare && gameState.selectedSquare[0] === r && gameState.selectedSquare[1] === c) {
                canvasContext.fillStyle = 'rgba(255, 255, 0, 0.4)';
                canvasContext.fillRect(c_idx * SQUARE_SIZE, r_idx * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
            }

            if (gameState.legalMoves.some(m => m.to[0] === r && m.to[1] === c)) {
                canvasContext.fillStyle = 'rgba(0, 150, 0, 0.5)';
                canvasContext.beginPath();
                canvasContext.arc(c_idx * SQUARE_SIZE + SQUARE_SIZE / 2, r_idx * SQUARE_SIZE + SQUARE_SIZE / 2, SQUARE_SIZE / 5, 0, 2 * Math.PI);
                canvasContext.fill();
            }

            const piece = board[r][c];
            if (piece) {
                if (!(isAnimating && animationState.finalMove && animationState.finalMove.from[0] === r && animationState.finalMove.from[1] === c)) {
                    const centerX = c_idx * SQUARE_SIZE + SQUARE_SIZE / 2;
                    const centerY = r_idx * SQUARE_SIZE + SQUARE_SIZE / 2;
                    renderPiece(piece, centerX, centerY);
                }
            }
        }
    }
}

function renderPiece(piece, x, y) {
    const isWhite = piece === piece.toUpperCase();
    const pieceType = piece.toLowerCase();
    const emoji = pieceType === 'b' ? RABBI_EMOJI : PIECE_EMOJIS[piece.toUpperCase()];
    
    canvasContext.font = `${SQUARE_SIZE * 0.8}px serif`;
    canvasContext.textAlign = 'center';
    canvasContext.textBaseline = 'middle';
    
    // Draw the emoji first
    canvasContext.fillText(emoji, x, y);

    // ** NEW: Apply a color tint using composite operations **
    const tintColor = isWhite ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.35)';
    canvasContext.fillStyle = tintColor;
    canvasContext.globalCompositeOperation = 'source-atop';
    canvasContext.fillRect(x - SQUARE_SIZE/2, y - SQUARE_SIZE/2, SQUARE_SIZE, SQUARE_SIZE);
    
    // Reset composite operation to default
    canvasContext.globalCompositeOperation = 'source-over';

    // ** NEW: Draw the yamulka for the Rabbi piece **
    if (pieceType === 'b') {
        const yamulkaRadius = SQUARE_SIZE * 0.16;
        const yamulkaY = y - SQUARE_SIZE * 0.28; // Adjusted position for top of head
        canvasContext.fillStyle = isWhite ? '#87CEEB' : '#00008B'; // Light Blue for white, Dark Blue for black
        canvasContext.beginPath();
        // Draw a half-circle (from PI to 0 radians)
        canvasContext.arc(x, yamulkaY, yamulkaRadius, Math.PI, 0); 
        canvasContext.fill();
    }
}

// --- PGN Generation ---
function generatePGN() {
    const date = new Date();
    const pgnDate = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    let pgn = `[Event "Ultimate AI Chess Game"]\n[Site "Browser"]\n[Date "${pgnDate}"]\n`;
    pgn += `[White "${gameState.gameMode === 'pva' && gameState.playerColor === 'w' ? 'Player' : (gameState.gameMode === 'pvp' ? 'Player 1' : 'AI White')}"]\n`;
    pgn += `[Black "${gameState.gameMode === 'pva' && gameState.playerColor === 'b' ? 'Player' : (gameState.gameMode === 'pvp' ? 'Player 2' : 'AI Black')}"]\n`;
    pgn += `[Result "${gameState.pgnResult}"]\n\n`;
    
    const files = 'abcdefgh';
    let moveText = '';
    gameState.moveHistory.forEach((record, index) => {
        if (index % 2 === 0) {
            moveText += `${Math.floor(index / 2) + 1}. `;
        }
        let notation = record.piece.toUpperCase() === 'P' ? '' : record.piece.toUpperCase();
        if (record.capturedPiece) {
            if (record.piece.toUpperCase() === 'P') {
                notation += files[record.move.from[1]];
            }
            notation += 'x';
        }
        notation += files[record.move.to[1]] + (8 - record.move.to[0]);
        moveText += notation + ' ';
    });
    return pgn + moveText.trim() + ' ' + gameState.pgnResult;
}

// --- Event Handling & Setup ---
function getSquareFromCoordinates(x, y) {
    const rect = canvas.getBoundingClientRect();
    let c = Math.floor((x - rect.left) / SQUARE_SIZE);
    let r = Math.floor((y - rect.top) / SQUARE_SIZE);

    const isWhiteView = gameState.gameMode !== 'pva' || gameState.playerColor === 'w';
    if (!isWhiteView) {
        r = 7 - r;
        c = 7 - c;
    }
    return { r, c };
}

function handleCanvasEvent(event) {
    event.preventDefault();
    let clientX, clientY;
    if (event.changedTouches && event.changedTouches.length > 0) {
        clientX = event.changedTouches[0].clientX;
        clientY = event.changedTouches[0].clientY;
    } else {
        clientX = event.clientX;
        clientY = event.clientY;
    }
    if (clientX === undefined) return;
    const { r, c } = getSquareFromCoordinates(clientX, clientY);
    if (r >= 0 && r < 8 && c >= 0 && c < 8) {
        handleSquareClick(r, c);
    }
}

function startGame(mode, playerColor = 'w') {
    mainMenu.style.display = 'none';
    colorSelectionMenu.style.display = 'none';
    chessContainer.style.display = 'block';
    resetGameState();
    gameState.gameMode = mode;
    gameState.playerColor = playerColor;
    initBoardFromFEN(gameState.fen);
    gameState.fenHistory.push(gameState.fen.split(' ')[0]);
    drawBoard();

    switch (mode) {
        case 'pva':
            messageDiv.textContent = `You are ${playerColor === 'w' ? 'White' : 'Black'}. White to move.`;
            if (playerColor === 'b') {
                startAIMove();
            }
            break;
        case 'pvp':
            messageDiv.textContent = "White's turn to move.";
            break;
        case 'ava':
            messageDiv.textContent = "AI vs AI. White to move.";
            startAIMove();
            break;
    }
}

function boardToFEN(board) {
    return board.map(row => {
        let empty = 0;
        let fenRow = '';
        for (const cell of row) {
            if (cell === '') {
                empty++;
            } else {
                if (empty > 0) {
                    fenRow += empty;
                    empty = 0;
                }
                fenRow += cell;
            }
        }
        if (empty > 0) {
            fenRow += empty;
        }
        return fenRow;
    }).join('/');
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    canvas.addEventListener('mouseup', handleCanvasEvent);
    canvas.addEventListener('touchend', handleCanvasEvent);
    
    replayButton.addEventListener('click', () => {
        gameOverOverlay.style.display = 'none';
        chessContainer.style.display = 'none';
        mainMenu.style.display = 'flex';
        messageDiv.textContent = '';
    });

    downloadButton.addEventListener('click', () => {
        const pgn = generatePGN();
        const blob = new Blob([pgn], { type: 'application/x-chess-pgn' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'BH-'+Date.now()+'chess-game.pgn';
        a.click();
        URL.revokeObjectURL(url);
    });

    playVsAiButton.onclick = () => {
        mainMenu.style.display = 'none';
        colorSelectionMenu.style.display = 'flex';
    };

    playAsWhiteButton.onclick = () => startGame('pva', 'w');
    playAsBlackButton.onclick = () => startGame('pva', 'b');
    playVsPlayerButton.onclick = () => startGame('pvp');
    aiVsAiButton.onclick = () => startGame('ava');

    // Initial setup
    mainMenu.style.display = 'flex';
    resetGameState();
});