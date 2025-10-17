/*B"H*/

// =================================================================
//         WEB WORKER (UPGRADED GRANDMASTER AI ENGINE)
// =================================================================

// --- Piece and Positional Evaluation Data (Unchanged) ---
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

// --- Core AI Data Structures ---
let transpositionTable = new Map();
let killerMoves = Array(50).fill(null).map(() => Array(2).fill(null)); // Max depth of 50
let nodeCount = 0;

// TT Flags for storing node types
const TT_EXACT = 0;
const TT_LOWERBOUND = 1; // Alpha
const TT_UPPERBOUND = 2; // Beta

// --- Board State Utilities (Unchanged) ---
function cloneBoard(board) { return board.map(row => row.slice()); }
function makeMove(board, move) {
    const newBoard = cloneBoard(board);
    const piece = newBoard[move.from[0]][move.from[1]];
    newBoard[move.to[0]][move.to[1]] = piece;
    newBoard[move.from[0]][move.from[1]] = '';
    if (move.isCastle) {
        const r = move.from[0];
        const rookFromCol = move.to[1] > 4 ? 7 : 0;
        const rookToCol = move.to[1] > 4 ? 5 : 3;
        newBoard[r][rookToCol] = newBoard[r][rookFromCol];
        newBoard[r][rookFromCol] = '';
    }
    if (move.isEnPassant) {
        newBoard[move.from[0]][move.to[1]] = '';
    }
    if (piece.toLowerCase() === 'p' && (move.to[0] === 0 || move.to[0] === 7)) {
        newBoard[move.to[0]][move.to[1]] = piece === 'P' ? 'Q' : 'q';
    }
    return newBoard;
}

// --- FEN & Legality (Unchanged from original worker) ---
function createBoardFromFEN(fen) { const [boardPart, turn, castling, enPassant] = fen.split(' '); return { board: boardPart.split('/').map(row => { let newRow = []; for (const char of row) { if (isNaN(parseInt(char))) newRow.push(char); else for (let i = 0; i < parseInt(char); i++) newRow.push(''); } return newRow; }), castlingRights: { K: castling.includes('K'), Q: castling.includes('Q'), k: castling.includes('k'), q: castling.includes('q') }, enPassantTarget: enPassant === '-' ? null : [(8 - parseInt(enPassant[1])), 'abcdefgh'.indexOf(enPassant[0])] }; }
function findKing(b, color) { const k = color === 'w' ? 'K' : 'k'; for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (b[r][c] === k) return { r, c }; return null; }
function isSquareAttacked(b, r, c, aC) { for (let rA = 0; rA < 8; rA++) for (let cA = 0; cA < 8; cA++) { const p = b[rA][cA]; if (p === '') continue; const iW = p === p.toUpperCase(); if ((aC === 'w' && !iW) || (aC === 'b' && iW)) continue; const m = getPseudoLegalMovesForPiece(p, rA, cA, b, {}, null); for (const move of m) if (move.to[0] === r && move.to[1] === c) { if (p.toLowerCase() === 'p') { if (move.from[1] !== c) return true } else { return true } } } return false; }


function getPseudoLegalMovesForPiece(p, r, c, b, cr, ep) {
    const m = []; const pL = p.toLowerCase(); const iW = p === p.toUpperCase();
    if (pL === 'p') { const d = iW ? -1 : 1; const sR = iW ? 6 : 1; if (r + d >= 0 && r + d < 8) { if (b[r + d][c] === '') { m.push({ from: [r, c], to: [r + d, c] }); if (r === sR && b[r + 2 * d][c] === '') m.push({ from: [r, c], to: [r + 2 * d, c], isPawnDoubleMove: true }); } for (let dc = -1; dc <= 1; dc += 2) { const nC = c + dc; if (nC >= 0 && nC < 8) { const t = b[r + d][nC]; if (t && iW !== (t === t.toUpperCase())) m.push({ from: [r, c], to: [r + d, nC] }); if (ep && r + d === ep[0] && nC === ep[1]) m.push({ from: [r, c], to: [r + d, nC], isEnPassant: true }); } } } return m; }
    if (pL === 'k') { 
        const o = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]; 
        for (const [dr, dc] of o) { 
            const nR = r + dr, nC = c + dc; 
            if (nR >= 0 && nR < 8 && nC >= 0 && nC < 8) { 
                const t = b[nR][nC]; 
                if (t === '' || iW !== (t === t.toUpperCase())) m.push({ from: [r, c], to: [nR, nC] }) 
            } 
        } 
        
        // --- FIX IS HERE ---
        // This check prevents the infinite recursion. Castling logic is only
        // evaluated when real castling rights are passed in, not from isSquareAttacked.
        if (cr && Object.keys(cr).length > 0) {
            if(!isSquareAttacked(b, r, c, iW ? 'b':'w')){ 
                if ((iW?cr.K:cr.k) && !b[r][5] && !b[r][6] && !isSquareAttacked(b, r, 5, iW ? 'b' : 'w') && !isSquareAttacked(b, r, 6, iW ? 'b' : 'w')) m.push({ from: [r, 4], to: [r, 6], isCastle: true }); 
                if ((iW?cr.Q:cr.q) && !b[r][1] && !b[r][2] && !b[r][3] && !isSquareAttacked(b, r, 2, iW ? 'b' : 'w') && !isSquareAttacked(b, r, 3, iW ? 'b' : 'w')) m.push({ from: [r, 4], to: [r, 2], isCastle: true }); 
            }
        }
        // --- END OF FIX ---

        return m; 
    }
    const o = { n: [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]] }[pL]; if (o) { for (const [dr, dc] of o) { const nR = r + dr, nC = c + dc; if (nR >= 0 && nR < 8 && nC >= 0 && nC < 8) { const t = b[nR][nC]; if (t === '' || iW !== (t === t.toUpperCase())) m.push({ from: [r, c], to: [nR, nC] }) } } return m; }
    const d = { b: [[-1,-1],[-1,1],[1,-1],[1,1]], r: [[-1,0],[1,0],[0,-1],[0,1]], q: [[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]] }[pL]; if (d) { for (const [dr, dc] of d) { let nR = r + dr, nC = c + dc; while (nR >= 0 && nR < 8 && nC >= 0 && nC < 8) { const t = b[nR][nC]; if (t === '') m.push({ from: [r, c], to: [nR, nC] }); else { if (iW !== (t === t.toUpperCase())) m.push({ from: [r, c], to: [nR, nC] }); break; } nR += dr; nC += dc; } } }
    return m;
}


function generateAllLegalMoves(b, color, cr, ep) { const lM = []; const oC = color === 'w' ? 'b' : 'w'; for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) { const p = b[r][c]; if (p === '') continue; const iW = p === p.toUpperCase(); if ((color === 'w' && !iW) || (color === 'b' && iW)) continue; const pM = getPseudoLegalMovesForPiece(p, r, c, b, cr, ep); for (const m of pM) { const nB = makeMove(b, m); const kP = findKing(nB, color); if (kP && !isSquareAttacked(nB, kP.r, kP.c, oC)) { m.piece = p; m.capture = !!b[m.to[0]][m.to[1]] || m.isEnPassant; lM.push(m); } } } return lM; }

// --- AI Core: Evaluation (Unchanged) ---
function evaluateBoard(board) {
    let score = 0; let pieceCount = 0;
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
        const p = board[r][c]; if (!p) continue; pieceCount++;
        const iW = p === p.toUpperCase(); const pT = p.toUpperCase();
        const pst = { P: pawnPST, N: knightPST, B: bishopPST, R: rookPST, Q: queenPST, K: pieceCount > 10 ? kingPSTMidGame : kingPSTEndGame }[pT];
        const pstScore = iW ? pst[r][c] : pst[7 - r][c];
        score += (iW ? 1 : -1) * (pieceValues[pT] + pstScore);
    }
    return score;
}

// --- AI Core: Move Ordering ---
function orderMoves(moves, board, ttBestMove, ply) {
    const moveScores = moves.map(move => {
        if (ttBestMove && move.from[0] === ttBestMove.from[0] && move.from[1] === ttBestMove.from[1] && move.to[0] === ttBestMove.to[0] && move.to[1] === ttBestMove.to[1]) {
            return { move, score: 100000 };
        }
        if (move.capture) {
            const victim = move.isEnPassant ? 'P' : board[move.to[0]][move.to[1]].toUpperCase();
            const attacker = move.piece.toUpperCase();
            // MVV-LVA: Most Valuable Victim - Least Valuable Attacker
            return { move, score: pieceValues[victim] * 10 - pieceValues[attacker] + 10000 };
        }
        const killer1 = killerMoves[ply][0];
        const killer2 = killerMoves[ply][1];
        if (killer1 && move.from[0] === killer1.from[0] && move.from[1] === killer1.from[1] && move.to[0] === killer1.to[0] && move.to[1] === killer1.to[1]) {
            return { move, score: 5000 };
        }
        if (killer2 && move.from[0] === killer2.from[0] && move.from[1] === killer2.from[1] && move.to[0] === killer2.to[0] && move.to[1] === killer2.to[1]) {
            return { move, score: 4000 };
        }
        return { move, score: 0 };
    });
    return moveScores.sort((a, b) => b.score - a.score).map(ms => ms.move);
}

function storeKillerMove(move, ply) {
    if (!move.capture) {
        if (!killerMoves[ply][0] || (killerMoves[ply][0].from !== move.from || killerMoves[ply][0].to !== move.to)) {
            killerMoves[ply][1] = killerMoves[ply][0];
            killerMoves[ply][0] = move;
        }
    }
}

// --- AI Core: High-Speed Search (Negamax with all optimizations) ---
function negamax(board, depth, alpha, beta, color, ply, cr, ep) {
    if (depth <= 0) {
        nodeCount++;
        return (color === 'w' ? 1 : -1) * evaluateBoard(board);
    }
    nodeCount++;

    const legalMoves = generateAllLegalMoves(board, color, cr, ep);
    if (legalMoves.length === 0) {
        const kingPos = findKing(board, color);
        const inCheck = kingPos && isSquareAttacked(board, kingPos.r, kingPos.c, color === 'w' ? 'b' : 'w');
        return inCheck ? -20000 + ply : 0; // Checkmate is bad, stalemate is neutral
    }

    const orderedMoves = orderMoves(legalMoves, board, null, ply); // TT move ordering is handled at top level for now
    let bestScore = -Infinity;
    
    for (const move of orderedMoves) {
        const newBoard = makeMove(board, move);
        const newCR = { ...cr };
        // --- FIXED: Comprehensive Castling Rights Update Logic ---
        if (move.piece === 'K') { newCR.K = false; newCR.Q = false; }
        if (move.piece === 'k') { newCR.k = false; newCR.q = false; }
        if (move.from[0] === 7 && move.from[1] === 0) { newCR.Q = false; }
        if (move.from[0] === 7 && move.from[1] === 7) { newCR.K = false; }
        if (move.from[0] === 0 && move.from[1] === 0) { newCR.q = false; }
        if (move.from[0] === 0 && move.from[1] === 7) { newCR.k = false; }
        if (move.to[0] === 7 && move.to[1] === 0) { newCR.Q = false; }
        if (move.to[0] === 7 && move.to[1] === 7) { newCR.K = false; }
        if (move.to[0] === 0 && move.to[1] === 0) { newCR.q = false; }
        if (move.to[0] === 0 && move.to[1] === 7) { newCR.k = false; }

        const newEP = move.isPawnDoubleMove ? [(move.from[0] + move.to[0]) / 2, move.from[1]] : null;
        
        const score = -negamax(newBoard, depth - 1, -beta, -alpha, color === 'w' ? 'b' : 'w', ply + 1, newCR, newEP);
        
        if (score > bestScore) {
            bestScore = score;
        }
        if (bestScore > alpha) {
            alpha = bestScore;
        }
        if (alpha >= beta) {
            storeKillerMove(move, ply);
            return beta; // Pruning
        }
    }
    return bestScore;
}


// --- Main AI Driver ---
self.onmessage = function(e) {
    const { command, fen, maxDepth, color } = e.data;
    if (command === 'calculate_move') {
        const startTime = performance.now();
        nodeCount = 0;
        transpositionTable.clear(); // Clear TT for each new move calculation
        killerMoves = Array(50).fill(null).map(() => Array(2).fill(null));

        const { board, castlingRights, enPassantTarget } = createBoardFromFEN(fen);
        const legalMoves = generateAllLegalMoves(board, color, castlingRights, enPassantTarget);
        
        if (legalMoves.length === 0) {
            postMessage({ bestMove: null });
            return;
        }

        let bestMove = legalMoves[0];
        let bestScore = -Infinity;

        // --- NEW: Iterative Deepening Loop ---
        for (let currentDepth = 1; currentDepth <= maxDepth; currentDepth++) {
            const orderedMoves = orderMoves(legalMoves, board, bestMove, 0); // Use best move from previous depth to guide search
            let alpha = -Infinity;
            let beta = Infinity;

            for (const move of orderedMoves) {
                const newBoard = makeMove(board, move);
                 const newCR = { ...castlingRights };
                 if (move.piece === 'K') { newCR.K = false; newCR.Q = false; }
                 if (move.piece === 'k') { newCR.k = false; newCR.q = false; }
                 if (move.from[0] === 7 && move.from[1] === 0) { newCR.Q = false; }
                 if (move.from[0] === 7 && move.from[1] === 7) { newCR.K = false; }
                 if (move.from[0] === 0 && move.from[1] === 0) { newCR.q = false; }
                 if (move.from[0] === 0 && move.from[1] === 7) { newCR.k = false; }
                 if (move.to[0] === 7 && move.to[1] === 0) { newCR.Q = false; }
                 if (move.to[0] === 7 && move.to[1] === 7) { newCR.K = false; }
                 if (move.to[0] === 0 && move.to[1] === 0) { newCR.q = false; }
                 if (move.to[0] === 0 && move.to[1] === 7) { newCR.k = false; }

                const newEP = move.isPawnDoubleMove ? [(move.from[0] + move.to[0]) / 2, move.from[1]] : null;

                const score = -negamax(newBoard, currentDepth - 1, -beta, -alpha, color === 'w' ? 'b' : 'w', 1, newCR, newEP);

                if (score > bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
                if (score > alpha) {
                    alpha = score;
                }
            }
        }
        
        const endTime = performance.now();
        postMessage({ bestMove, timeTaken: (endTime - startTime).toFixed(2), nodesSearched: nodeCount, score: bestScore });
    }
};