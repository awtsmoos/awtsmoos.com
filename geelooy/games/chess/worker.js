/*B"H*/

// =================================================================
//         WEB WORKER (GRANDMASTER-GRADE REWRITE)
// =================================================================

// --- Evaluation Data ---
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

// *** FIXED: Re-balanced King PST to prevent suicidal tendencies ***
// Values are smaller and focus on safety without overriding material value.
// prettier-ignore
const kingPSTMidGame = [[-20,-30,-30,-40,-40,-30,-30,-20],[-20,-30,-30,-40,-40,-30,-30,-20],[-20,-30,-30,-40,-40,-30,-30,-20],[-20,-30,-30,-40,-40,-30,-30,-20],[-10,-20,-20,-30,-30,-20,-20,-10],[0,-10,-10,-10,-10,-10,-10,0],[10,10,-5,-5,-5,-5,10,10],[20,25,15,5,5,15,25,20]];
// prettier-ignore
const kingPSTEndGame = [[-50,-40,-30,-20,-20,-30,-40,-50],[-30,-20,-10,0,0,-10,-20,-30],[-30,-10,20,30,30,20,-10,-30],[-30,-10,30,40,40,30,-10,-30],[-30,-10,30,40,40,30,-10,-30],[-30,-10,20,30,30,20,-10,-30],[-30,-30,0,0,0,0,-30,-30],[-50,-30,-30,-30,-30,-30,-30,-50]];

// --- Core AI Data Structures ---
let transpositionTable = new Map();
let killerMoves = Array(50).fill(null).map(() => Array(2).fill(null));
let nodeCount = 0;
const TT_EXACT = 0, TT_LOWERBOUND = 1, TT_UPPERBOUND = 2; // Transposition Table flags

// --- Zobrist Hashing (for high-speed TT) ---
let zobristKeys = {};
function initZobrist() {
    const pieceMap = 'PNBRQKpnbrqk';
    zobristKeys.pieces = Array(12).fill(null).map(() => Array(64).fill(null).map(() => Math.floor(Math.random() * 2**32)));
    zobristKeys.castling = Array(16).fill(null).map(() => Math.floor(Math.random() * 2**32));
    zobristKeys.enPassant = Array(8).fill(null).map(() => Math.floor(Math.random() * 2**32));
    zobristKeys.blackToMove = Math.floor(Math.random() * 2**32);
}
initZobrist();

function computeZobristHash(board, cr, ep, turn) {
    let hash = 0;
    const pieceMap = 'PNBRQKpnbrqk';
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece) {
                const pieceIndex = pieceMap.indexOf(piece);
                hash ^= zobristKeys.pieces[pieceIndex][r * 8 + c];
            }
        }
    }
    const crIndex = (cr.K << 3) | (cr.Q << 2) | (cr.k << 1) | cr.q;
    hash ^= zobristKeys.castling[crIndex];
    if (ep) hash ^= zobristKeys.enPassant[ep[1]];
    if (turn === 'b') hash ^= zobristKeys.blackToMove;
    return hash;
}

// --- FEN & Legality (Unchanged) ---
function createBoardFromFEN(fen) {
    // Provide default values to prevent destructuring errors on incomplete FENs
    const [boardPart, turn = 'w', castling = '-', enPassant = '-'] = fen.split(' '); 
    
    return { 
        board: boardPart.split('/').map(row => { 
            let newRow = []; 
            for (const char of row) { 
                if (isNaN(parseInt(char))) newRow.push(char); 
                else for (let i = 0; i < parseInt(char); i++) newRow.push(''); 
            } 
            return newRow; 
        }), 
        turn, 
        castlingRights: { 
            K: castling.includes('K'), 
            Q: castling.includes('Q'), 
            k: castling.includes('k'), 
            q: castling.includes('q') 
        }, 
        enPassantTarget: enPassant === '-' ? null : [(8 - parseInt(enPassant[1])), 'abcdefgh'.indexOf(enPassant[0])] 
    }; 
}

function findKing(b, color) { const k = color === 'w' ? 'K' : 'k'; for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (b[r][c] === k) return { r, c }; return null; }
function isSquareAttacked(b, r, c, attackerColor) { for (let rA = 0; rA < 8; rA++) for (let cA = 0; cA < 8; cA++) { const p = b[rA][cA]; if (!p) continue; const isWhite = p === p.toUpperCase(); const correctColor = (attackerColor === 'w' && isWhite) || (attackerColor === 'b' && !isWhite); if (!correctColor) continue; const m = getPseudoLegalMovesForPiece(p, rA, cA, b, null, null, true); for (const move of m) if (move.to[0] === r && move.to[1] === c) return true; } return false; }
function getPseudoLegalMovesForPiece(p, r, c, b, cr, ep, isForAttackCheck = false) {
    const m = []; const pL = p.toLowerCase(); const iW = p === p.toUpperCase();
    if (pL === 'p') { const d = iW ? -1 : 1; const sR = iW ? 6 : 1; if (r + d >= 0 && r + d < 8) { if (!isForAttackCheck && b[r+d][c] === '') { m.push({ from: [r,c], to: [r+d,c] }); if (r === sR && b[r+2*d][c] === '') m.push({ from: [r,c], to: [r+2*d,c], isPawnDoubleMove: true }); } for (let dc = -1; dc <= 1; dc += 2) { const nC = c + dc; if (nC >= 0 && nC < 8) { if(b[r+d][nC] && iW !== (b[r+d][nC]===b[r+d][nC].toUpperCase())) m.push({ from: [r,c], to: [r+d,nC] }); if (ep && r+d === ep[0] && nC === ep[1]) m.push({ from: [r,c], to: [r+d,nC], isEnPassant: true }); } } } return m; }
    if (pL === 'k') { const o = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]; for (const [dr, dc] of o) { const nR = r + dr, nC = c + dc; if (nR >= 0 && nR < 8 && nC >= 0 && nC < 8) { if (!b[nR][nC] || iW !== (b[nR][nC] === b[nR][nC].toUpperCase())) m.push({ from: [r, c], to: [nR, nC] }) } } if (!isForAttackCheck && cr) { if(!isSquareAttacked(b, r, c, iW ? 'b':'w')){ if ((iW?cr.K:cr.k) && !b[r][5] && !b[r][6] && !isSquareAttacked(b, r, 5, iW?'b':'w') && !isSquareAttacked(b, r, 6, iW?'b':'w')) m.push({ from: [r,4], to: [r,6], isCastle: true }); if ((iW?cr.Q:cr.q) && !b[r][1] && !b[r][2] && !b[r][3] && !isSquareAttacked(b, r, 2, iW?'b':'w') && !isSquareAttacked(b, r, 3, iW?'b':'w')) m.push({ from: [r,4], to: [r,2], isCastle: true }); } } return m; }
    const o = { n: [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]] }[pL]; if (o) { for (const [dr, dc] of o) { const nR = r + dr, nC = c + dc; if (nR >= 0 && nR < 8 && nC >= 0 && nC < 8) { if (!b[nR][nC] || iW !== (b[nR][nC] === b[nR][nC].toUpperCase())) m.push({ from: [r, c], to: [nR, nC] }) } } return m; }
    const d = { b: [[-1,-1],[-1,1],[1,-1],[1,1]], r: [[-1,0],[1,0],[0,-1],[0,1]], q: [[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]] }[pL]; if (d) { for (const [dr, dc] of d) { let nR = r + dr, nC = c + dc; while (nR >= 0 && nR < 8 && nC >= 0 && nC < 8) { const t = b[nR][nC]; if (t === '') m.push({ from: [r, c], to: [nR, nC] }); else { if (iW !== (t === t.toUpperCase())) m.push({ from: [r, c], to: [nR, nC] }); break; } nR += dr; nC += dc; } } }
    return m;
}
function generateAllLegalMoves(b, color, cr, ep) { const lM = []; const oC = color === 'w' ? 'b' : 'w'; for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) { const p = b[r][c]; if (!p) continue; const iW = p === p.toUpperCase(); if ((color === 'w' && !iW) || (color === 'b' && iW)) continue; const pM = getPseudoLegalMovesForPiece(p, r, c, b, cr, ep); for (const m of pM) { const nB = makeMove(b, m); const kP = findKing(nB, color); if (kP && !isSquareAttacked(nB, kP.r, kP.c, oC)) { m.piece = p; m.capture = !!b[m.to[0]][m.to[1]] || m.isEnPassant; const kingPos = findKing(nB, oC); m.check = kingPos && isSquareAttacked(nB, kingPos.r, kingPos.c, color); lM.push(m); } } } return lM; }
function makeMove(board, move) { const nB = board.map(r=>r.slice()); const p = nB[move.from[0]][move.from[1]]; nB[move.to[0]][move.to[1]] = p; nB[move.from[0]][move.from[1]] = ''; if (move.isCastle) { const r = move.from[0]; const rF = move.to[1]>4?7:0; const rT = move.to[1]>4?5:3; nB[r][rT] = nB[r][rF]; nB[r][rF] = ''; } if (move.isEnPassant) { nB[move.from[0]][move.to[1]] = ''; } if (p.toLowerCase()==='p'&&(move.to[0]===0||move.to[0]===7)) { nB[move.to[0]][move.to[1]] = p==='P'?'Q':'q'; } return nB; }

// --- AI Core: Evaluation ---
function evaluateBoard(board) {
    let score = 0; let pieceCount = 0; let whiteBishops = 0; let blackBishops = 0;
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
        const p = board[r][c]; if (!p) continue; pieceCount++;
        const iW = p === p.toUpperCase(); const pT = p.toUpperCase();
        if (pT === 'B') iW ? whiteBishops++ : blackBishops++;
        const pst = { P: pawnPST, N: knightPST, B: bishopPST, R: rookPST, Q: queenPST, K: pieceCount > 10 ? kingPSTMidGame : kingPSTEndGame }[pT];
        const pstScore = iW ? pst[r][c] : pst[7 - r][c];
        score += (iW ? 1 : -1) * (pieceValues[pT] + pstScore);
    }
    if (whiteBishops >= 2) score += 30; // Bishop pair bonus
    if (blackBishops >= 2) score -= 30;
    return score;
}

// --- AI Core: Move Ordering ---
function orderMoves(moves, board, ttMove, ply) {
    return moves.sort((a, b) => {
        let scoreA = 0, scoreB = 0;
        if (ttMove && a.from[0] === ttMove.from[0] && a.from[1] === ttMove.from[1] && a.to[0] === ttMove.to[0] && a.to[1] === ttMove.to[1]) scoreA = 100000;
        if (ttMove && b.from[0] === ttMove.from[0] && b.from[1] === ttMove.from[1] && b.to[0] === ttMove.to[0] && b.to[1] === ttMove.to[1]) scoreB = 100000;
        if (a.capture) scoreA = pieceValues[ (a.isEnPassant ? 'P' : board[a.to[0]][a.to[1]].toUpperCase()) ] * 10 - pieceValues[ a.piece.toUpperCase() ] + 10000;
        if (b.capture) scoreB = pieceValues[ (b.isEnPassant ? 'P' : board[b.to[0]][b.to[1]].toUpperCase()) ] * 10 - pieceValues[ b.piece.toUpperCase() ] + 10000;
        if (!a.capture && killerMoves[ply][0] && a.from[0] === killerMoves[ply][0].from[0] && a.to[0] === killerMoves[ply][0].to[0]) scoreA = 5000;
        if (!b.capture && killerMoves[ply][0] && b.from[0] === killerMoves[ply][0].from[0] && b.to[0] === killerMoves[ply][0].to[0]) scoreB = 5000;
        return scoreB - scoreA;
    });
}
function storeKillerMove(move, ply) { if (!move.capture) { killerMoves[ply][1] = killerMoves[ply][0]; killerMoves[ply][0] = move; } }

// --- AI Core: Search ---
function quiesce(board, alpha, beta, color, cr, ep) {
    nodeCount++;
    const standPat = (color === 'w' ? 1 : -1) * evaluateBoard(board);
    if (standPat >= beta) return beta;
    if (alpha < standPat) alpha = standPat;

    const moves = generateAllLegalMoves(board, color, cr, ep).filter(m => m.capture || m.check);
    const orderedMoves = orderMoves(moves, board, null, 0); // Simple ordering for q-search

    for (const move of orderedMoves) {
        const newBoard = makeMove(board, move);
        const score = -quiesce(newBoard, -beta, -alpha, color === 'w' ? 'b' : 'w', cr, null);
        if (score >= beta) return beta;
        if (score > alpha) alpha = score;
    }
    return alpha;
}

function negamax(board, depth, alpha, beta, color, ply, cr, ep, history) {
    // --- FIX IS HERE: Only check for repetitions on future moves (ply > 0) ---
    if (ply > 0) {
        const hash = computeZobristHash(board, cr, ep, color);
        if (history.has(hash)) {
            return 0; // This position is a repetition, it's a draw.
        }
    }
    // --- END OF FIX ---

    // The hash is now calculated here, after the root check.
    const hash = computeZobristHash(board, cr, ep, color);
    const ttEntry = transpositionTable.get(hash);
    if (ttEntry && ttEntry.depth >= depth) {
        if (ttEntry.flag === TT_EXACT) return ttEntry.score;
        if (ttEntry.flag === TT_LOWERBOUND) alpha = Math.max(alpha, ttEntry.score);
        else if (ttEntry.flag === TT_UPPERBOUND) beta = Math.min(beta, ttEntry.score);
        if (alpha >= beta) return ttEntry.score;
    }

    if (depth <= 0) {
        return quiesce(board, alpha, beta, color, cr, ep);
    }
    nodeCount++;
    
    const newHistory = new Set(history);
    newHistory.add(hash);

    const inCheck = isSquareAttacked(board, findKing(board, color).r, findKing(board, color).c, color === 'w' ? 'b' : 'w');
    if (inCheck) depth++;

    const moves = generateAllLegalMoves(board, color, cr, ep);
    if (moves.length === 0) {
    // *** FIX: Make delivering mate much more attractive ***
    // A mate found sooner (at a lower ply) will now have a significantly higher score.
    return inCheck ? -30000 + ply * 100 : 0;
}

    const orderedMoves = orderMoves(moves, board, ttEntry ? ttEntry.bestMove : null, ply);
    let bestMove = null;
    let score = -Infinity;
    let ttFlag = TT_UPPERBOUND;

    for (const move of orderedMoves) {
        const newBoard = makeMove(board, move);
        const newCR = { ...cr };
        if (move.piece === 'K') { newCR.K = false; newCR.Q = false; } else if (move.piece === 'k') { newCR.k = false; newCR.q = false; }
        if (move.from[0] === 7 && move.from[1] === 0 || move.to[0] === 7 && move.to[1] === 0) newCR.Q = false;
        if (move.from[0] === 7 && move.from[1] === 7 || move.to[0] === 7 && move.to[1] === 7) newCR.K = false;
        if (move.from[0] === 0 && move.from[1] === 0 || move.to[0] === 0 && move.to[1] === 0) newCR.q = false;
        if (move.from[0] === 0 && move.from[1] === 7 || move.to[0] === 0 && move.to[1] === 7) newCR.k = false;
        const newEP = move.isPawnDoubleMove ? [(move.from[0] + move.to[0]) / 2, move.from[1]] : null;
        
        score = -negamax(newBoard, depth - 1, -beta, -alpha, color === 'w' ? 'b' : 'w', ply + 1, newCR, newEP, newHistory);
        
        if (score > alpha) {
            alpha = score;
            bestMove = move;
            ttFlag = TT_EXACT;
        }
        if (alpha >= beta) {
            storeKillerMove(move, ply);
            transpositionTable.set(hash, { score: beta, depth, flag: TT_LOWERBOUND, bestMove: move });
            return beta;
        }
    }
    transpositionTable.set(hash, { score: alpha, depth, flag: ttFlag, bestMove });
    return alpha;
}

// --- Main AI Driver ---
self.onmessage = function(e) {
    const { command, fen, maxDepth, fenHistory } = e.data;
    if (command === 'calculate_move') {
        const startTime = performance.now();
        nodeCount = 0;
        transpositionTable.clear();
        killerMoves = Array(50).fill(null).map(() => Array(2).fill(null));

        const history = new Set();
        if (fenHistory) {
            fenHistory.forEach(pastFen => {
                const { board, turn, castlingRights, enPassantTarget } = createBoardFromFEN(pastFen);
                const hash = computeZobristHash(board, castlingRights, enPassantTarget, turn);
                history.add(hash);
            });
        }

        const { board, turn, castlingRights, enPassantTarget } = createBoardFromFEN(fen);
        const legalMoves = generateAllLegalMoves(board, turn, castlingRights, enPassantTarget);
        
        if (legalMoves.length === 0) {
            postMessage({ bestMove: null });
            return;
        }

        let bestMove = legalMoves[0];
        let bestScore = -Infinity;
        
        // --- NEW: Logic for adding variety ---
        let topMoves = [];
        const moveSelectionMargin = 25; // in centipawns. 25 is a good balance.

        for (let currentDepth = 1; currentDepth <= maxDepth; currentDepth++) {
            let alpha = -Infinity;
            let beta = Infinity;
            
            // At the start of each new search, reset the list of top moves
            topMoves = []; 
            bestScore = -Infinity;

            const orderedMoves = orderMoves(legalMoves, board, bestMove, 0);

            for (const move of orderedMoves) {
                const newBoard = makeMove(board, move);
                const newCR = { ...castlingRights };
                if (move.piece === 'K') { newCR.K = false; newCR.Q = false; } else if (move.piece === 'k') { newCR.k = false; newCR.q = false; }
                if (move.from[0] === 7 && (move.from[1] === 0 || move.to[1] === 0)) newCR.Q = false;
                if (move.from[0] === 7 && (move.from[1] === 7 || move.to[1] === 7)) newCR.K = false;
                if (move.from[0] === 0 && (move.from[1] === 0 || move.to[1] === 0)) newCR.q = false;
                if (move.from[0] === 0 && (move.from[1] === 7 || move.to[1] === 7)) newCR.k = false;

                const newEP = move.isPawnDoubleMove ? [(move.from[0] + move.to[0]) / 2, move.from[1]] : null;
                const score = -negamax(newBoard, currentDepth - 1, -beta, -alpha, turn === 'w' ? 'b' : 'w', 1, newCR, newEP, history);
                
                if (score > bestScore) {
                    bestScore = score;
                    // This is the new best move, so clear the list and add it.
                    topMoves = [move]; 
                } else if (Math.abs(score - bestScore) <= moveSelectionMargin) {
                    // This move is "good enough" to be considered, so add it to the list.
                    topMoves.push(move);
                }
                
                if (score > alpha) {
                    alpha = score;
                }
            }
            // Select a random move from the list of top candidates
            if (topMoves.length > 0) {
                bestMove = topMoves[Math.floor(Math.random() * topMoves.length)];
            }
        }
        
        const endTime = performance.now();
        postMessage({ bestMove, timeTaken: (endTime - startTime).toFixed(2), nodesSearched: nodeCount, score: bestScore });
    }
};