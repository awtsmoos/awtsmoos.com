/*B"H*/

// =================================================================
//                 WEB WORKER (AI LOGIC - REWRITTEN FOR CORRECTNESS)
// =================================================================

// Piece values in centipawns
const pieceValues = { 'P': 100, 'N': 320, 'B': 330, 'R': 500, 'Q': 900, 'K': 20000 };

// Piece-Square Tables (PSTs) for positional evaluation
const pawnPST = [[0,0,0,0,0,0,0,0],[50,50,50,50,50,50,50,50],[10,10,20,30,30,20,10,10],[5,5,10,25,25,10,5,5],[0,0,0,20,20,0,0,0],[5,-5,-10,0,0,-10,-5,5],[5,10,10,-20,-20,10,10,5],[0,0,0,0,0,0,0,0]];
const knightPST = [[-50,-40,-30,-30,-30,-30,-40,-50],[-40,-20,0,0,0,0,-20,-40],[-30,0,10,15,15,10,0,-30],[-30,5,15,20,20,15,5,-30],[-30,0,15,20,20,15,0,-30],[-30,5,10,15,15,10,5,-30],[-40,-20,0,5,5,0,-20,-40],[-50,-40,-30,-30,-30,-30,-40,-50]];
const bishopPST = [[-20,-10,-10,-10,-10,-10,-10,-20],[-10,0,0,0,0,0,0,-10],[-10,0,5,10,10,5,0,-10],[-10,5,5,10,10,5,5,-10],[-10,0,10,10,10,10,0,-10],[-10,10,10,10,10,10,10,-10],[-10,5,0,0,0,0,5,-10],[-20,-10,-10,-10,-10,-10,-10,-20]];
const rookPST = [[0,0,0,0,0,0,0,0],[5,10,10,10,10,10,10,5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[0,0,0,5,5,0,0,0]];
const queenPST = [[-20,-10,-10,-5,-5,-10,-10,-20],[-10,0,0,0,0,0,0,-10],[-10,0,5,5,5,5,0,-10],[-5,0,5,5,5,5,0,-5],[0,0,5,5,5,5,0,-5],[-10,5,5,5,5,5,0,-10],[-10,0,5,0,0,0,0,-10],[-20,-10,-10,-5,-5,-10,-10,-20]];
const kingPSTMidGame = [[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-20,-30,-30,-40,-40,-30,-30,-20],[-10,-20,-20,-20,-20,-20,-20,-10],[20,20,0,0,0,0,20,20],[20,30,10,0,0,10,30,20]];
const kingPSTEndGame = [[-50,-40,-30,-20,-20,-30,-40,-50],[-30,-20,-10,0,0,-10,-20,-30],[-30,-10,20,30,30,20,-10,-30],[-30,-10,30,40,40,30,-10,-30],[-30,-10,30,40,40,30,-10,-30],[-30,-10,20,30,30,20,-10,-30],[-30,-30,0,0,0,0,-30,-30],[-50,-30,-30,-30,-30,-30,-30,-50]];

let transpositionTable = {};
let nodeCount = 0;

function cloneBoard(board) { return board.map(row => row.slice()); }

function makeMove(board, move) {
    const newBoard = cloneBoard(board);
    const piece = newBoard[move.from[0]][move.from[1]];
    newBoard[move.to[0]][move.to[1]] = piece;
    newBoard[move.from[0]][move.from[1]] = '';
    if (piece.toLowerCase() === 'p' && (move.to[0] === 0 || move.to[0] === 7)) {
        newBoard[move.to[0]][move.to[1]] = piece === 'P' ? 'Q' : 'q';
    }
    return newBoard;
}

// --- Move Generation Functions ---
function getPawnMoves(r, c, board) {
    const moves = []; const piece = board[r][c]; const isWhite = piece === 'P'; const dir = isWhite ? -1 : 1; const startRow = isWhite ? 6 : 1;
    if (r + dir < 0 || r + dir >= 8) return moves;
    if (board[r + dir][c] === '') { moves.push({from:[r,c], to:[r+dir,c]}); if(r===startRow&&board[r+2*dir][c]===''){moves.push({from:[r,c],to:[r+2*dir,c]});}}
    const caps=[[dir,-1],[dir,1]]; for(const[dr,dc] of caps){ const nr=r+dr,nc=c+dc; if(nr>=0&&nr<8&&nc>=0&&nc<8){const tp=board[nr][nc];if(tp!==''&&isWhite!==(tp===tp.toUpperCase())){moves.push({from:[r,c],to:[nr,nc]});}}} return moves;
}
function getKnightMoves(r, c, board) {
    const moves = []; const piece = board[r][c]; const isWhite = piece === piece.toUpperCase(); const offsets = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
    for(const[dr,dc] of offsets){const nr=r+dr,nc=c+dc;if(nr>=0&&nr<8&&nc>=0&&nc<8){const target=board[nr][nc];if(target===''){moves.push({from:[r,c],to:[nr,nc]});}else{if(isWhite!==(target===target.toUpperCase())){moves.push({from:[r,c],to:[nr,nc]});}}}} return moves;
}
function getSlidingMoves(r, c, board, directions) {
    const moves=[]; const piece=board[r][c]; const isWhite=piece===piece.toUpperCase(); for(const[dr,dc] of directions){let nr=r+dr,nc=c+dc; while(nr>=0&&nr<8&&nc>=0&&nc<8){const target=board[nr][nc]; if(target===''){moves.push({from:[r,c],to:[nr,nc]});}else{if(isWhite!==(target===target.toUpperCase())){moves.push({from:[r,c],to:[nr,nc]});}break;}nr+=dr;nc+=dc;}} return moves;
}
function getKingMoves(r, c, board) {
    const moves = []; const piece = board[r][c]; const isWhite = piece === piece.toUpperCase(); const offsets = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
    for(const[dr,dc] of offsets){const nr=r+dr,nc=c+dc;if(nr>=0&&nr<8&&nc>=0&&nc<8){const target=board[nr][nc];if(target===''){moves.push({from:[r,c],to:[nr,nc]});}else{if(isWhite!==(target===target.toUpperCase())){moves.push({from:[r,c],to:[nr,nc]});}}}} return moves;
}
function getPseudoLegalMovesForPiece(piece, r, c, board) {
    switch (piece.toLowerCase()) {
        case 'p': return getPawnMoves(r, c, board); case 'n': return getKnightMoves(r, c, board);
        case 'b': return getSlidingMoves(r, c, board, [[-1,-1],[-1,1],[1,-1],[1,1]]);
        case 'r': return getSlidingMoves(r, c, board, [[-1,0],[1,0],[0,-1],[0,1]]);
        case 'q': return getSlidingMoves(r, c, board, [[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]]);
        case 'k': return getKingMoves(r, c, board); default: return [];
    }
}

// --- Legality Checking ---
function findKing(board, color) {
    const kingPiece = color === 'w' ? 'K' : 'k';
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (board[r][c] === kingPiece) return { r, c };
    return null;
}
function isSquareAttacked(board, r, c, attackerColor) {
    for (let r_att = 0; r_att < 8; r_att++) for (let c_att = 0; c_att < 8; c_att++) {
        const piece = board[r_att][c_att]; if (piece === '') continue;
        const isWhitePiece = piece === piece.toUpperCase();
        if ((attackerColor === 'w' && !isWhitePiece) || (attackerColor === 'b' && isWhitePiece)) continue;
        const moves = getPseudoLegalMovesForPiece(piece, r_att, c_att, board);
        for (const move of moves) {
            if (move.to[0] === r && move.to[1] === c) {
                if (piece.toLowerCase() === 'p') { if (move.from[1] !== c) return true; }
                else { return true; }
            }
        }
    }
    return false;
}
function generateAllLegalMoves(board, color, capturesOnly = false) {
    const legalMoves = [];
    const opponentColor = color === 'w' ? 'b' : 'w';
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece === '') continue;
        const isWhitePiece = piece === piece.toUpperCase();
        if ((color === 'w' && !isWhitePiece) || (color === 'b' && isWhitePiece)) continue;
        const pseudoMoves = getPseudoLegalMovesForPiece(piece, r, c, board);
        for (const move of pseudoMoves) {
            if (capturesOnly && board[move.to[0]][move.to[1]] === '') continue;
            const newBoard = makeMove(board, move);
            const kingPos = findKing(newBoard, color);
            if (kingPos && !isSquareAttacked(newBoard, kingPos.r, kingPos.c, opponentColor)) {
                legalMoves.push(move);
            }
        }
    }
    return legalMoves;
}

// --- FEN Utilities ---
function createBoardFromFEN(fen) {
    const [boardPart] = fen.split(' ');
    return boardPart.split('/').map(row => { let newRow = []; for (const char of row) { if (isNaN(parseInt(char))) newRow.push(char); else for (let i = 0; i < parseInt(char); i++) newRow.push(''); } return newRow; });
}
function boardToFEN(board) {
    return board.map(row => { let empty = 0; let fenRow = ''; for (const cell of row) { if (cell === '') empty++; else { if (empty > 0) { fenRow += empty; empty = 0; } fenRow += cell; }} if (empty > 0) fenRow += empty; return fenRow; }).join('/');
}

// --- AI Core: Evaluation ---
function evaluateBoard(board) {
    let totalScore = 0;
    let pieceCount = 0;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece === '') continue;
            pieceCount++;
            const isWhite = piece === piece.toUpperCase();
            const pieceType = piece.toUpperCase();
            let score = pieceValues[pieceType];
            const isEndgame = pieceCount <= 10;
            let pst;
            switch(pieceType) {
                case 'P': pst = pawnPST; break; case 'N': pst = knightPST; break;
                case 'B': pst = bishopPST; break; case 'R': pst = rookPST; break;
                case 'Q': pst = queenPST; break; case 'K': pst = isEndgame ? kingPSTEndGame : kingPSTMidGame; break;
            }
            score += isWhite ? pst[r][c] : pst[7 - r][c];
            totalScore += isWhite ? score : -score;
        }
    }
    return totalScore;
}

// --- AI Core: Search ---
function quiesce(board, alpha, beta, turn) {
    nodeCount++;
    const isWhiteTurn = turn === 'w';
    let standPat = evaluateBoard(board);
    if (!isWhiteTurn) standPat = -standPat;

    if (standPat >= beta) return beta;
    if (alpha < standPat) alpha = standPat;

    const captureMoves = generateAllLegalMoves(board, turn, true);
    for (const move of captureMoves) {
        const newBoard = makeMove(board, move);
        const score = -quiesce(newBoard, -beta, -alpha, turn === 'w' ? 'b' : 'w');
        if (score >= beta) return beta;
        if (score > alpha) alpha = score;
    }
    return alpha;
}

function negamax(board, depth, alpha, beta, turn) {
    const boardFEN = boardToFEN(board);
    const ttEntry = transpositionTable[boardFEN];
    if (ttEntry && ttEntry.depth >= depth) {
        if (ttEntry.flag === 'EXACT') return ttEntry.score;
        if (ttEntry.flag === 'LOWERBOUND' && ttEntry.score > alpha) alpha = ttEntry.score;
        else if (ttEntry.flag === 'UPPERBOUND' && ttEntry.score < beta) beta = ttEntry.score;
        if (alpha >= beta) return ttEntry.score;
    }

    if (depth === 0) {
        return quiesce(board, alpha, beta, turn);
    }
    nodeCount++;

    const legalMoves = generateAllLegalMoves(board, turn);
    if (legalMoves.length === 0) {
        const kingPos = findKing(board, turn);
        if (kingPos && isSquareAttacked(board, kingPos.r, kingPos.c, turn === 'w' ? 'b' : 'w')) {
            return -20000 - depth;
        }
        return 0;
    }

    let maxScore = -Infinity;
    for (const move of legalMoves) {
        const newBoard = makeMove(board, move);
        const score = -negamax(newBoard, depth - 1, -beta, -alpha, turn === 'w' ? 'b' : 'w');
        if (score > maxScore) maxScore = score;
        if (score > alpha) alpha = score;
        if (alpha >= beta) break;
    }

    let flag = 'EXACT';
    if (maxScore <= alpha) flag = 'UPPERBOUND';
    else if (maxScore >= beta) flag = 'LOWERBOUND';
    transpositionTable[boardFEN] = { score: maxScore, depth, flag };

    return maxScore;
}

// --- Web worker entry point ---
self.onmessage = function(e) {
    const { command, fen, maxDepth, color } = e.data;
    if (command === 'calculate_move') {
        const startTime = performance.now();
        const board = createBoardFromFEN(fen);
        nodeCount = 0;
        transpositionTable = {};

        const legalMoves = generateAllLegalMoves(board, color);
        if (legalMoves.length === 0) {
            postMessage({ bestMove: null });
            return;
        }

        let bestMove = legalMoves[0];
        let bestScore = -Infinity;
        const isWhiteTurn = color === 'w';

        for (const move of legalMoves) {
            const newBoard = makeMove(board, move);
            let score = -negamax(newBoard, maxDepth - 1, -Infinity, Infinity, color === 'w' ? 'b' : 'w');
            if (!isWhiteTurn) score = -score;
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        
        const endTime = performance.now();
        postMessage({ bestMove, timeTaken: (endTime - startTime).toFixed(2), nodesSearched: nodeCount });
    }
};