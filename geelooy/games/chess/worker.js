/*B"H*/

// =================================================================
//         WEB WORKER (THE FINAL GRANDMASTER AI ENGINE)
// =================================================================

// --- Piece and Positional Evaluation Data ---
const pieceValues = { 'P': 100, 'N': 320, 'B': 330, 'R': 500, 'Q': 900, 'K': 20000 };
// prettier-ignore
const pawnPST = [[0,0,0,0,0,0,0,0],[50,50,50,50,50,50,50,50],[10,10,20,30,30,20,10,10],[5,5,10,25,25,10,5,5],[0,0,0,20,20,0,0,0],[5,-5,-10,0,0,-10,-5,5],[5,10,10,-20,-20,10,10,5],[0,0,0,0,0,0,0,0]];
// prettier-ignore
const knightPST = [[-50,-40,-30,-30,-30,-30,-40,-50],[-40,-20,0,5,5,0,-20,-40],[-30,5,10,15,15,10,5,-30],[-30,5,15,20,20,15,5,-30],[-30,5,15,20,20,15,5,-30],[-30,5,10,15,15,10,5,-30],[-40,-20,0,5,5,0,-20,-40],[-50,-40,-30,-30,-30,-30,-40,-50]];
// prettier-ignore
const bishopPST = [[-20,-10,-10,-10,-10,-10,-10,-20],[-10,5,0,0,0,0,5,-10],[-10,10,10,10,10,10,10,-10],[-10,0,10,10,10,10,0,-10],[-10,5,5,10,10,5,5,-10],[-10,0,5,10,10,5,0,-10],[-10,0,0,0,0,0,0,-10],[-20,-10,-10,-10,-10,-10,-10,-20]];
// prettier-ignore
const rookPST = [[0,0,0,5,5,0,0,0],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[5,10,10,10,10,10,10,5],[0,0,0,0,0,0,0,0]];
// prettier-ignore
const queenPST = [[-20,-10,-10,-5,-5,-10,-10,-20],[-10,0,5,0,0,0,0,-10],[-10,5,5,5,5,5,0,-10],[-5,0,5,5,5,5,0,-5],[0,0,5,5,5,5,0,-5],[-10,0,5,5,5,5,0,-10],[-10,0,0,0,0,0,0,-10],[-20,-10,-10,-5,-5,-10,-10,-20]];
// prettier-ignore
const kingPSTMidGame = [[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-20,-30,-30,-40,-40,-30,-30,-20],[-10,-20,-20,-20,-20,-20,-20,-10],[20,20,0,0,0,0,20,20],[20,30,10,0,0,10,30,20]];
// prettier-ignore
const kingPSTEndGame = [[-50,-40,-30,-20,-20,-30,-40,-50],[-30,-20,-10,0,0,-10,-20,-30],[-30,-10,20,30,30,20,-10,-30],[-30,-10,30,40,40,30,-10,-30],[-30,-10,30,40,40,30,-10,-30],[-30,-10,20,30,30,20,-10,-30],[-30,-30,0,0,0,0,-30,-30],[-50,-30,-30,-30,-30,-30,-30,-50]];

let transpositionTable = {};
let nodeCount = 0;
let killerMoves = Array(30).fill(null).map(() => Array(2).fill(null));

// --- Board State Utilities ---
function cloneBoard(board) { return board.map(row => row.slice()); }
function makeMove(board, move) {
    const newBoard = cloneBoard(board);
    const piece = newBoard[move.from[0]][move.from[1]];
    newBoard[move.to[0]][move.to[1]] = piece;
    newBoard[move.from[0]][move.from[1]] = '';
    // Handle castling
    if (piece.toLowerCase() === 'k') {
        if (Math.abs(move.from[1] - move.to[1]) === 2) {
            const r = move.from[0];
            const rookFromCol = move.to[1] > move.from[1] ? 7 : 0;
            const rookToCol = move.to[1] > move.from[1] ? 5 : 3;
            newBoard[r][rookToCol] = newBoard[r][rookFromCol];
            newBoard[r][rookFromCol] = '';
        }
    }
    if (piece.toLowerCase() === 'p' && (move.to[0] === 0 || move.to[0] === 7)) {
        newBoard[move.to[0]][move.to[1]] = piece === 'P' ? 'Q' : 'q';
    }
    return newBoard;
}

// --- FEN & Legality ---
function createBoardFromFEN(fen) { const [boardPart, turn, castling] = fen.split(' '); return { board: boardPart.split('/').map(row => { let newRow = []; for (const char of row) { if (isNaN(parseInt(char))) newRow.push(char); else for (let i = 0; i < parseInt(char); i++) newRow.push(''); } return newRow; }), castlingRights: castling }; }
function boardToFEN(board) { return board.map(row => { let empty = 0; let fenRow = ''; for (const cell of row) { if (cell === '') empty++; else { if (empty > 0) { fenRow += empty; empty = 0; } fenRow += cell; } } if (empty > 0) fenRow += empty; return fenRow; }).join('/'); }
function findKing(b, color) { const k = color === 'w' ? 'K' : 'k'; for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (b[r][c] === k) return { r, c }; return null; }
function isSquareAttacked(b, r, c, aC) { for (let rA = 0; rA < 8; rA++) for (let cA = 0; cA < 8; cA++) { const p = b[rA][cA]; if (p === '') continue; const iW = p === p.toUpperCase(); if ((aC === 'w' && !iW) || (aC === 'b' && iW)) continue; const m = getPseudoLegalMovesForPiece(p, rA, cA, b, {}); for (const move of m) if (move.to[0] === r && move.to[1] === c) { if (p.toLowerCase() === 'p') { if (move.from[1] !== c) return true } else { return true } } } return false; }
function getPseudoLegalMovesForPiece(p, r, c, b, castlingRights) {
    const m = []; const pL = p.toLowerCase(); const iW = p === p.toUpperCase();
    if (pL === 'p') { const d = iW ? -1 : 1; const sR = iW ? 6 : 1; if (r + d >= 0 && r + d < 8) { if (b[r + d][c] === '') { m.push({ from: [r, c], to: [r + d, c] }); if (r === sR && b[r + 2 * d][c] === '') m.push({ from: [r, c], to: [r + 2 * d, c] }) } for (let dc = -1; dc <= 1; dc += 2) { const nC = c + dc; if (nC >= 0 && nC < 8) { const t = b[r + d][nC]; if (t && iW !== (t === t.toUpperCase())) m.push({ from: [r, c], to: [r + d, nC] }) } } } return m; }
    if (pL === 'k') {
        const o = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
        for (const [dr, dc] of o) { const nR = r + dr, nC = c + dc; if (nR >= 0 && nR < 8 && nC >= 0 && nC < 8) { const t = b[nR][nC]; if (t === '' || iW !== (t === t.toUpperCase())) m.push({ from: [r, c], to: [nR, nC] }) } }
        const kingSide = iW ? 'K' : 'k'; const queenSide = iW ? 'Q' : 'q';
        if (castlingRights[kingSide] && !b[r][5] && !b[r][6] && !isSquareAttacked(b, r, 4, iW ? 'b' : 'w') && !isSquareAttacked(b, r, 5, iW ? 'b' : 'w')) m.push({ from: [r, 4], to: [r, 6] });
        if (castlingRights[queenSide] && !b[r][1] && !b[r][2] && !b[r][3] && !isSquareAttacked(b, r, 4, iW ? 'b' : 'w') && !isSquareAttacked(b, r, 3, iW ? 'b' : 'w')) m.push({ from: [r, 4], to: [r, 2] });
        return m;
    }
    const o = { n: [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]] }[pL];
    if (o) { for (const [dr, dc] of o) { const nR = r + dr, nC = c + dc; if (nR >= 0 && nR < 8 && nC >= 0 && nC < 8) { const t = b[nR][nC]; if (t === '' || iW !== (t === t.toUpperCase())) m.push({ from: [r, c], to: [nR, nC] }) } } return m; }
    const d = { b: [[-1, -1], [-1, 1], [1, -1], [1, 1]], r: [[-1, 0], [1, 0], [0, -1], [0, 1]], q: [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]] }[pL];
    if (d) { for (const [dr, dc] of d) { let nR = r + dr, nC = c + dc; while (nR >= 0 && nR < 8 && nC >= 0 && nC < 8) { const t = b[nR][nC]; if (t === '') { m.push({ from: [r, c], to: [nR, nC] }); } else { if (iW !== (t === t.toUpperCase())) m.push({ from: [r, c], to: [nR, nC] }); break; } nR += dr; nC += dc; } } }
    return m;
}
function generateAllLegalMoves(b, color, castlingRights, capturesOnly = false) { const lM = []; const oC = color === 'w' ? 'b' : 'w'; for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) { const p = b[r][c]; if (p === '') continue; const iW = p === p.toUpperCase(); if ((color === 'w' && !iW) || (color === 'b' && iW)) continue; const pM = getPseudoLegalMovesForPiece(p, r, c, b, castlingRights); for (const m of pM) { if (capturesOnly && !b[m.to[0]][m.to[1]]) continue; const nB = makeMove(b, m); const kP = findKing(nB, color); if (kP && !isSquareAttacked(nB, kP.r, kP.c, oC)) { m.piece = p; m.capture = !!b[m.to[0]][m.to[1]]; lM.push(m); } } } return lM; }

// --- AI Core: Evaluation with King Safety ---
function evaluateBoard(board, castlingRights) {
    let score = 0; let pieceCount = 0;
    const whiteKingPos = findKing(board, 'w');
    const blackKingPos = findKing(board, 'b');

    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
        const p = board[r][c]; if (!p) continue; pieceCount++;
        const iW = p === p.toUpperCase(); const pT = p.toUpperCase();
        const pst = { P: pawnPST, N: knightPST, B: bishopPST, R: rookPST, Q: queenPST, K: pieceCount > 12 ? kingPSTMidGame : kingPSTEndGame }[pT];
        const pstScore = iW ? pst[r][c] : pst[7 - r][c];
        score += (iW ? 1 : -1) * (pieceValues[pT] + pstScore);
    }

    // ** NEW: King Safety & Castling Bonus **
    const CASTLING_BONUS = 40;
    if (castlingRights.K || castlingRights.Q) score += CASTLING_BONUS;
    if (castlingRights.k || castlingRights.q) score -= CASTLING_BONUS;

    const kingShieldPenalty = (kingPos) => {
        let penalty = 0;
        const pawn = kingPos.r === 0 ? 'p' : 'P';
        for (let dc = -1; dc <= 1; dc++) {
            const c = kingPos.c + dc;
            if (c < 0 || c > 7) continue;
            let foundPawn = false;
            for(let dr = 1; dr <= 2; dr++) {
                const r = kingPos.r + (pawn === 'P' ? -dr : dr);
                if (r < 0 || r > 7) break;
                if(board[r][c] === pawn) { foundPawn = true; break; }
            }
            if(!foundPawn) penalty += 20;
        }
        return penalty;
    };

    if (whiteKingPos) score -= kingShieldPenalty(whiteKingPos);
    if (blackKingPos) score += kingShieldPenalty(blackKingPos);

    return score;
}

// --- AI Core: High-Speed Search ---
function quiesce(board, alpha, beta, turn, castlingRights) { nodeCount++; const standPat = (turn === 'w' ? 1 : -1) * evaluateBoard(board, castlingRights); if (standPat >= beta) return beta; if (alpha < standPat) alpha = standPat; const captureMoves = generateAllLegalMoves(board, turn, castlingRights, true); for (const move of captureMoves) { const newBoard = makeMove(board, move); const score = -quiesce(newBoard, -beta, -alpha, turn === 'w' ? 'b' : 'w', castlingRights); if (score >= beta) return beta; if (score > alpha) alpha = score; } return alpha; }
function search(board, depth, alpha, beta, turn, ply, fenHistory, castlingRights) {
    const boardFEN = boardToFEN(board);
    if (fenHistory.has(boardFEN) && fenHistory.get(boardFEN) >= 2) return 0;
    const kingPos = findKing(board, turn);
    const inCheck = kingPos ? isSquareAttacked(board, kingPos.r, kingPos.c, turn === 'w' ? 'b' : 'w') : false;
    if (inCheck) depth++;

    if (depth <= 0) return quiesce(board, alpha, beta, turn, castlingRights);
    nodeCount++;
    const legalMoves = generateAllLegalMoves(board, turn, castlingRights);

    if (legalMoves.length === 0) return inCheck ? -20000 + ply : 0;

    legalMoves.sort((a, b) => { const victimA = a.capture ? pieceValues[board[a.to[0]][a.to[1]].toUpperCase()] : 0; const victimB = b.capture ? pieceValues[board[b.to[0]][b.to[1]].toUpperCase()] : 0; return (victimB - pieceValues[a.piece.toUpperCase()]) - (victimA - pieceValues[b.piece.toUpperCase()]); });

    let bSearchPv = true;
    for (const move of legalMoves) {
        fenHistory.set(boardFEN, (fenHistory.get(boardFEN) || 0) + 1);
        const newBoard = makeMove(board, move);
        const newCastlingRights = {...castlingRights};
        if(move.piece === 'K') { newCastlingRights.K = false; newCastlingRights.Q = false; }
        if(move.piece === 'k') { newCastlingRights.k = false; newCastlingRights.q = false; }
        // Add more logic for rook moves if necessary for castling rights
        
        let score;
        if (bSearchPv) {
            score = -search(newBoard, depth - 1, -beta, -alpha, turn === 'w' ? 'b' : 'w', ply + 1, fenHistory, newCastlingRights);
        } else {
            score = -search(newBoard, depth - 1, -alpha - 1, -alpha, turn === 'w' ? 'b' : 'w', ply + 1, fenHistory, newCastlingRights);
            if (score > alpha && score < beta) {
                score = -search(newBoard, depth - 1, -beta, -alpha, turn === 'w' ? 'b' : 'w', ply + 1, fenHistory, newCastlingRights);
            }
        }
        fenHistory.set(boardFEN, fenHistory.get(boardFEN) - 1);

        if (score > alpha) {
            alpha = score;
            bSearchPv = false;
        }
        if (alpha >= beta) break;
    }
    return alpha;
}

// --- Main AI Driver ---
self.onmessage = function(e) {
    const { command, fen, maxDepth, color, fenHistory } = e.data;
    if (command === 'calculate_move') {
        const startTime = performance.now();
        const { board, castlingRights } = createBoardFromFEN(fen);
        nodeCount = 0;
        transpositionTable = {};
        killerMoves = Array(30).fill(null).map(() => Array(2).fill(null));

        let bestMove = null;
        let bestScore = -Infinity;

        const historyMap = new Map();
        fenHistory.forEach(f => historyMap.set(f, (historyMap.get(f) || 0) + 1));

        const legalMoves = generateAllLegalMoves(board, color, castlingRights);
        if (legalMoves.length === 0) { postMessage({ bestMove: null }); return; }

        for (let currentDepth = 1; currentDepth <= maxDepth; currentDepth++) {
            let alpha = -Infinity, beta = Infinity;
            for (const move of legalMoves) {
                const newBoard = makeMove(board, move);
                const score = -search(newBoard, currentDepth - 1, -beta, -alpha, color === 'w' ? 'b' : 'w', 1, historyMap, castlingRights);
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
                if (score > alpha) alpha = score;
            }
        }
        
        const endTime = performance.now();
        postMessage({ bestMove, timeTaken: (endTime - startTime).toFixed(2), nodesSearched: nodeCount });
    }
};