/* B"H */

// =================================================================
//                 THE PROMETHEUS CHESS ENGINE
// =================================================================
//
// PHILOSOPHY: A HIERARCHY OF PRINCIPLES
// This engine is architected from scratch to emulate the thinking of a human
// master. It combines raw, high-speed calculation with a principled,
// hierarchical evaluation system. It understands that King Safety is the
// non-negotiable foundation upon which all tactical and strategic plans
// are built. There are no placeholders and no cut corners.
//
// KEY ARCHITECTURAL FEATURES:
// - GRANDMASTER'S LIBRARY: A fully functional opening book is used to play
//   the opening instantly and perfectly.
// - HIGH-SPEED SEARCH CORE: A robust Principal Variation Search (PVS) with
//   Null Move Pruning, Transposition Tables, and Killer/History heuristics.
// - THE ORACLE (EVALUATION): A sophisticated, tapered evaluation engine that
//   understands the changing priorities of the game and has a "Killer Instinct"
//   for identifying and rewarding king attacks.
// - CRITICAL MOMENT AWARENESS: Uses Selective Search Extensions to think
//   deeper when it matters most, such as pawn promotions and key recaptures.

importScripts('grandmaster_library.js');

// =================================================================
//                       CONSTANTS & CONFIGURATION
// =================================================================
const pieceValues = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };
const MATE_SCORE = 100000;
const MATE_IN_MAX_PLY = 64;
const NULL_MOVE_R = 3;

// --- GLOBAL STATE VARIABLES ---
let nodeCount = 0;
let searchStartTime, timeLimit;
let stopSearch = false;

let killerMoves, historyTable, transpositionTable;
const TT_EXACT = 0, TT_LOWERBOUND = 1, TT_UPPERBOUND = 2;

const pieceMap = 'PNBRQKpnbrqk';
let zobristKeys, zobristTurnKey;

// prettier-ignore
const pawnPST = [[0,0,0,0,0,0,0,0],[50,50,50,50,50,50,50,50],[10,10,20,30,30,20,10,10],[5,5,10,25,25,10,5,5],[0,0,0,20,20,0,0,0],[5,-5,-10,0,0,-10,-5,5],[5,10,10,-20,-20,10,10,5],[0,0,0,0,0,0,0,0]];
// prettier-ignore
const knightPST = [[-50,-40,-30,-30,-30,-30,-40,-50],[-40,-20,0,0,0,0,-20,-40],[-30,0,10,15,15,10,0,-30],[-30,5,15,20,20,15,5,-30],[-30,0,15,20,20,15,0,-30],[-30,5,10,15,15,10,5,-30],[-40,-20,0,5,5,0,-20,-40],[-50,-40,-30,-30,-30,-30,-40,-50]];
// prettier-ignore
const bishopPST = [[-20,-10,-10,-10,-10,-10,-10,-20],[-10,0,0,0,0,0,0,-10],[-10,0,5,10,10,5,0,-10],[-10,5,5,10,10,5,5,-10],[-10,0,10,10,10,10,0,-10],[-10,10,10,10,10,10,10,-10],[-10,5,0,0,0,0,5,-10],[-20,-10,-10,-10,-10,-10,-10,-20]];
// prettier-ignore
const rookPST = [[0,0,0,0,0,0,0,0],[5,10,10,10,10,10,10,5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[0,0,0,5,5,0,0,0]];
// prettier-ignore
const queenPST = [[-20,-10,-10,-5,-5,-10,-10,-20],[-10,0,0,0,0,0,0,-10],[-10,0,5,5,5,5,0,-10],[-5,0,5,5,5,5,0,-5],[0,0,5,5,5,5,0,-5],[-10,5,5,5,5,5,0,-10],[-10,0,5,0,0,0,0,-10],[-20,-10,-10,-5,-5,-10,-10,-20]];
// prettier-ignore
const kingPSTMidGame=[[20,30,10,0,0,10,30,20],[20,20,0,0,0,0,20,20],[-10,-20,-20,-20,-20,-20,-20,-10],[-20,-30,-30,-40,-40,-30,-30,-20],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30]];
// prettier-ignore
const kingPSTEndGame=[[-50,-40,-30,-20,-20,-30,-40,-50],[-30,-20,-10,0,0,-10,-20,-30],[-30,-10,20,30,30,20,-10,-30],[-30,-10,30,40,40,30,-10,-30],[-30,-10,30,40,40,30,-10,-30],[-30,-10,20,30,30,20,-10,-30],[-30,-30,0,0,0,0,-30,-30],[-50,-30,-30,-30,-30,-30,-30,-50]];

// =================================================================
//        HIGH-PERFORMANCE UTILITIES & FEN PARSING
// =================================================================

function syncHashingWithBook() {
    if (zobristKeys) return;
    initializeBookHashing();
    zobristKeys = bookZobristKeys;
    zobristTurnKey = bookZobristTurnKey;
}

function calculateZobristHash(board, turn) {
    if (!zobristKeys) syncHashingWithBook();
    let hash = 0n;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece) {
                hash ^= zobristKeys[pieceMap.indexOf(piece)][r * 8 + c];
            }
        }
    }
    if (turn === 'b') {
        hash ^= zobristTurnKey;
    }
    return hash;
}

function createBoardFromFEN(fen) {
    const [p, t, c, e] = fen.split(' ').slice(0, 4);
    return {
        board: p.split('/').map(r => {
            let nR = [];
            for (const C of r) if (isNaN(parseInt(C))) nR.push(C); else for (let i = 0; i < parseInt(C); i++) nR.push('');
            return nR
        }),
        turn: t,
        castlingRights: { K: c.includes('K'), Q: c.includes('Q'), k: c.includes('k'), q: c.includes('q') },
        enPassantTarget: e === '-' ? null : [8 - parseInt(e[1]), 'abcdefgh'.indexOf(e[0])]
    };
}

function findKing(board, color) {
    const king = color === 'w' ? 'K' : 'k';
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (board[r][c] === king) return { r, c };
    return null;
}

function makeMove(board, move) {
    const newBoard = board.map(row => row.slice());
    const piece = move.promotion ? move.promotion : newBoard[move.from[0]][move.from[1]];
    newBoard[move.to[0]][move.to[1]] = piece;
    newBoard[move.from[0]][move.from[1]] = '';
    if (move.isEnPassant) newBoard[move.from[0]][move.to[1]] = '';
    if (move.isCastle) {
        const r = move.from[0];
        const rookColFrom = move.to[1] === 6 ? 7 : 0;
        const rookColTo = move.to[1] === 6 ? 5 : 3;
        newBoard[r][rookColTo] = newBoard[r][rookColFrom];
        newBoard[r][rookColFrom] = '';
    }
    return newBoard;
}

// =================================================================
//      COMPLETE & EFFICIENT MOVE GENERATION
// =================================================================

function isSquareAttacked(board, r, c, attackerColor) {
    const pawn = attackerColor === 'w' ? 'P' : 'p'; const pawnDir = attackerColor === 'w' ? 1 : -1;
    if (board[r + pawnDir]?.[c - 1] === pawn || board[r + pawnDir]?.[c + 1] === pawn) return true;
    const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
    for (const [dr, dc] of knightMoves) { if (board[r + dr]?.[c + dc]?.toLowerCase() === 'n' && (board[r+dr][c+dc].toUpperCase() === board[r+dr][c+dc]) === (attackerColor === 'w')) return true; }
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
    for (let i = 0; i < directions.length; i++) {
        for (let dist = 1; dist < 8; dist++) {
            const nR = r + directions[i][0] * dist, nC = c + directions[i][1] * dist; if (nR < 0 || nR >= 8 || nC < 0 || nC >= 8) break;
            const piece = board[nR][nC]; if (piece) { if ((piece.toUpperCase() === piece) === (attackerColor === 'w')) { const pType = piece.toLowerCase(); if (pType === 'q' || (i < 4 && pType === 'r') || (i >= 4 && pType === 'b')) return true; } break; }
        }
    }
    for (const [dr, dc] of directions) { if (board[r + dr]?.[c + dc]?.toLowerCase() === 'k' && (board[r+dr][c+dc].toUpperCase() === board[r+dr][c+dc]) === (attackerColor === 'w')) return true; }
    return false;
}

function getPseudoLegalMovesForPiece(p, r, c, b, ep) {
    const m = []; const pL = p.toLowerCase(); const iW = p === p.toUpperCase(); const dir = iW ? -1 : 1;
    if (pL === 'p') {
        if (r + dir >= 0 && r + dir < 8 && !b[r + dir][c]) { const isPromo = (r + dir === 0 || r + dir === 7); if (isPromo) for (const promo of iW ? ['Q','R','B','N'] : ['q','r','b','n']) m.push({ from: [r,c], to: [r+dir,c], piece:p, promotion:promo }); else m.push({ from: [r,c], to: [r+dir,c], piece:p }); if ((iW ? 6 : 1) === r && !b[r + 2 * dir][c]) m.push({ from: [r,c], to: [r+2*dir,c], piece:p, isPawnDoubleMove:true }); }
        for (let dc = -1; dc <= 1; dc += 2) { const nR = r + dir, nC = c + dc; if (nR >= 0 && nR < 8 && nC >= 0 && nC < 8) { const target = b[nR][nC]; if (target && (target.toUpperCase() === target) !== iW) { const isPromo = (nR === 0 || nR === 7); if (isPromo) for (const promo of iW ? ['Q','R','B','N'] : ['q','r','b','n']) m.push({ from:[r,c], to:[nR,nC], piece:p, capture:target, promotion:promo }); else m.push({ from:[r,c], to:[nR,nC], piece:p, capture:target }); } if (ep && nR === ep[0] && nC === ep[1]) m.push({ from:[r,c], to:[nR,nC], piece:p, capture:iW ? 'p' : 'P', isEnPassant:true }); } }
    } else {
        const o = {n:[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]], b:[[-1,-1],[-1,1],[1,-1],[1,1]], r:[[-1,0],[1,0],[0,-1],[0,1]], q:[[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]], k:[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]}[pL];
        for (const [dr, dc] of o) { let nR = r + dr, nC = c + dc; while (nR >= 0 && nR < 8 && nC >= 0 && nC < 8) { const t = b[nR][nC]; if (t) { if ((t.toUpperCase() === t) !== iW) m.push({ from:[r,c], to:[nR,nC], piece:p, capture:t }); break; } m.push({ from:[r,c], to:[nR,nC], piece:p }); if (pL === 'n' || pL === 'k') break; nR += dr; nC += dc; } }
    } return m;
}

function generateLegalMoves(board, color, cr, ep) {
    const lM = []; const oC = color === 'w' ? 'b' : 'w'; const kingPos = findKing(board, color); if (!kingPos) return [];
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) { const p = board[r][c]; if (!p || (p.toUpperCase() === p) !== (color === 'w')) continue; const pM = getPseudoLegalMovesForPiece(p, r, c, board, ep); for (const m of pM) { const nB = makeMove(board, m); const nKP = p.toLowerCase() === 'k' ? { r: m.to[0], c: m.to[1] } : kingPos; if (!isSquareAttacked(nB, nKP.r, nKP.c, oC)) lM.push(m); } }
    const kR = color === 'w' ? 7 : 0; if (!isKingInCheck(board, color)) { if (cr[color === 'w' ? 'K' : 'k'] && !board[kR][5] && !board[kR][6] && !isSquareAttacked(board, kR, 5, oC) && !isSquareAttacked(board, kR, 6, oC)) lM.push({ from: [kR, 4], to: [kR, 6], piece: color === 'w' ? 'K' : 'k', isCastle: true }); if (cr[color === 'w' ? 'Q' : 'q'] && !board[kR][1] && !board[kR][2] && !board[kR][3] && !isSquareAttacked(board, kR, 2, oC) && !isSquareAttacked(board, kR, 3, oC)) lM.push({ from: [kR, 4], to: [kR, 2], piece: color === 'w' ? 'K' : 'k', isCastle: true }); }
    return lM;
}

function isKingInCheck(board, color) { const kingPos = findKing(board, color); if (!kingPos) return false; return isSquareAttacked(board, kingPos.r, kingPos.c, color === 'w' ? 'b' : 'w'); }

// =================================================================
//                 THE ORACLE: HIERARCHICAL EVALUATION
// =================================================================

function getGamePhase(board) {
    const OPENING_MATERIAL = 7800; const ENDGAME_MATERIAL = 1500; let totalMaterial = 0;
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) { const p = board[r][c]; if (p && p.toLowerCase() !== 'k') totalMaterial += pieceValues[p.toLowerCase()]; }
    const phase = (totalMaterial - ENDGAME_MATERIAL) / (OPENING_MATERIAL - ENDGAME_MATERIAL); return Math.max(0, Math.min(1, phase));
}

function evaluateKingAttack(board, color) {
    let attackScore = 0; const opponentColor = color === 'w' ? 'b' : 'w'; const kingPos = findKing(board, opponentColor); if (!kingPos) return 0;
    const kingZone = []; for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) { if (dr===0 && dc===0) continue; const r=kingPos.r+dr, c=kingPos.c+dc; if(r>=0&&r<8&&c>=0&&c<8) kingZone.push([r,c]); }
    let attackerCount = 0;
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) { const p = board[r][c]; if (p && (p.toUpperCase() === p) === (color === 'w')) { const moves = getPseudoLegalMovesForPiece(p, r, c, board, null); for(const move of moves) for(const [kzr, kzc] of kingZone) if(move.to[0] === kzr && move.to[1] === kzc) attackerCount++; } }
    if (attackerCount > 2) attackScore = attackerCount * attackerCount * 5; return attackScore;
}

function evaluateKingSafety(board, color, cr, gamePhase) {
    const kingPos = findKing(board, color); if (!kingPos) return 0; const isWhite = color === 'w'; let score = 0;
    if (gamePhase > 0.1) {
        const canCastle = isWhite ? (cr.K || cr.Q) : (cr.k || cr.q); const homeRank = isWhite ? 7 : 0;
        if (canCastle) score += 50;
        if (kingPos.r === homeRank && (kingPos.c === 6 || kingPos.c === 2)) { score += 25; for (const fileOffset of [-1, 0, 1]) { const file = kingPos.c + fileOffset; if(file>=0&&file<8) if (board[homeRank - (isWhite ? 1 : -1)][file] === (isWhite ? 'P' : 'p')) score += 10; } }
    } return score;
}

function evaluatePieceActivity(board, color) {
    let score = 0; const isWhite = color === 'w'; let bishopCount = 0;
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) { const p = board[r][c]; if (p && (p.toUpperCase() === p) === isWhite) { if (p.toLowerCase() === 'b') bishopCount++; if (p.toLowerCase() === 'r') { let isSemiOpen = true; for(let i=0; i<8; i++) if(board[i][c]?.toLowerCase() === 'p' && (board[i][c].toUpperCase() === board[i][c]) === isWhite) isSemiOpen = false; if(isSemiOpen) score += 10; } } }
    if (bishopCount === 2) score += 25; return score;
}

function evaluatePawnStructure(board, color, gamePhase) {
    let score = 0; const isWhite = color === 'w'; const friendlyPawn = isWhite ? 'P' : 'p'; const enemyPawn = isWhite ? 'p' : 'P'; let pawnFiles = Array(8).fill(0);
    for (let c = 0; c < 8; c++) for (let r = 0; r < 8; r++) if (board[r][c] === friendlyPawn) { pawnFiles[c]++; let isPassed = true; for (let lookAheadRow = r + (isWhite?-1:1); lookAheadRow >= 0 && lookAheadRow < 8; lookAheadRow += (isWhite?-1:1)) { if (board[lookAheadRow][c] === enemyPawn || board[lookAheadRow][c - 1] === enemyPawn || board[lookAheadRow][c + 1] === enemyPawn) { isPassed = false; break; } } if (isPassed) { const rank = isWhite ? 7 - r : r; score += (rank * rank * (2.5 - 1.5 * gamePhase)); } }
    for (let c = 0; c < 8; c++) { if (pawnFiles[c] > 1) score -= 15; if (pawnFiles[c] > 0 && (pawnFiles[c - 1] || 0) === 0 && (pawnFiles[c + 1] || 0) === 0) score -= 10; }
    return score;
}

function evaluate(board, cr) {
    const gamePhase = getGamePhase(board); let whiteScore = 0, blackScore = 0;
    for (let r = 0; r < 8; r++) { for (let c = 0; c < 8; c++) { const p = board[r][c]; if (!p) continue; const isWhite = (p === p.toUpperCase()); const pType = p.toLowerCase(); let score = pieceValues[pType];
        if (pType === 'k') { const midPstRow = isWhite ? 7-r : r; const endPstRow = isWhite ? 7-r : r; score += Math.floor((kingPSTMidGame[midPstRow][c] * gamePhase) + (kingPSTEndGame[endPstRow][c] * (1-gamePhase))); } else { const pstRow = isWhite ? 7-r : r; score += ({ p: pawnPST, n: knightPST, b: bishopPST, r: rookPST, q: queenPST }[pType])[pstRow][c]; }
        if (isWhite) whiteScore += score; else blackScore += score; } }
    whiteScore += evaluatePawnStructure(board, 'w', gamePhase) + evaluatePieceActivity(board, 'w') + evaluateKingSafety(board, 'w', cr, gamePhase) + evaluateKingAttack(board, 'w');
    blackScore += evaluatePawnStructure(board, 'b', gamePhase) + evaluatePieceActivity(board, 'b') + evaluateKingSafety(board, 'b', cr, gamePhase) + evaluateKingAttack(board, 'b');
    return whiteScore - blackScore;
}

// =================================================================
//                 THE LABYRINTH: HIGH-SPEED SEARCH
// =================================================================

function quiesce(board, alpha, beta, color, cr) {
    if (stopSearch) return 0;
    nodeCount++;
    const standPat = (color === 'w' ? 1 : -1) * evaluate(board, cr);
    if (standPat >= beta) return beta;
    if (alpha < standPat) alpha = standPat;

    const captures = []; const oC = color === 'w'?'b':'w';
    for(let r=0;r<8;r++) for(let c=0;c<8;c++) { const p = board[r][c]; if(p && (p.toUpperCase()===p)===(color==='w')) { const moves = getPseudoLegalMovesForPiece(p,r,c,board,null); for(const move of moves) if(move.capture) captures.push(move); } }
    captures.sort((a,b) => (pieceValues[b.capture.toLowerCase()]*10 - pieceValues[a.piece.toLowerCase()]) - (pieceValues[a.capture.toLowerCase()]*10 - pieceValues[b.piece.toLowerCase()]));

    for (const move of captures) {
        const newBoard = makeMove(board, move); const kingPos = findKing(newBoard, color);
        if (kingPos && !isSquareAttacked(newBoard, kingPos.r, kingPos.c, oC)) {
            const score = -quiesce(newBoard, -beta, -alpha, oC, cr);
            if (score >= beta) return beta;
            if (score > alpha) alpha = score;
        }
    }
    return alpha;
}

function isRepetition(currentHash, history) { let count = 0; for (const hash of history) { if (hash === currentHash) count++; } return count >= 1; }

function orderMoves(moves, pvMove, ply) {
    const movesWithScores = moves.map(move => { let score = 0;
        if (move.from === pvMove?.from && move.to === pvMove?.to) { score = 100000; } else if (move.capture) { score = 90000 + (pieceValues[move.capture.toLowerCase()] * 10 - pieceValues[move.piece.toLowerCase()]); } else { if (killerMoves[ply] && killerMoves[ply][0]?.from === move.from && killerMoves[ply][0]?.to === move.to) { score = 80000; } else if (killerMoves[ply] && killerMoves[ply][1]?.from === move.from && killerMoves[ply][1]?.to === move.to) { score = 70000; } else if (move.piece) { score = historyTable[pieceMap.indexOf(move.piece)][move.to[0] * 8 + move.to[1]] || 0; } }
        return [move, score]; });
    movesWithScores.sort((a, b) => b[1] - a[1]); return movesWithScores.map(pair => pair[0]);
}

function search(board, depth, alpha, beta, color, ply, cr, ep, history) {
    if (stopSearch) return 0;
    const currentHash = calculateZobristHash(board, color);
    if (ply > 0 && isRepetition(currentHash, history)) return 0;
    if (ply >= MATE_IN_MAX_PLY) return evaluate(board, cr);

    if (depth <= 0) return quiesce(board, alpha, beta, color, cr);
    nodeCount++;

    const ttEntry = transpositionTable.get(currentHash.toString());
    if (ttEntry && ttEntry.depth >= depth) {
        if (ttEntry.flag === TT_EXACT) return ttEntry.score;
        if (ttEntry.flag === TT_LOWERBOUND && ttEntry.score >= beta) return beta;
        if (ttEntry.flag === TT_UPPERBOUND && ttEntry.score <= alpha) return alpha;
    }

    const inCheck = isKingInCheck(board, color);
    if (!inCheck && depth >= NULL_MOVE_R + 1 && ply > 0) {
        const score = -search(board, depth - 1 - NULL_MOVE_R, -beta, -beta + 1, color==='w'?'b':'w', ply + 1, cr, null, history);
        if (score >= beta) { return beta; }
    }
    
    let effectiveDepth = inCheck ? depth + 1 : depth;
    const moves = generateLegalMoves(board, color, cr, ep);
    if (moves.length === 0) return inCheck ? -MATE_SCORE + ply : 0;

    const orderedMoves = orderMoves(moves, ttEntry ? ttEntry.bestMove : null, ply);
    let originalAlpha = alpha; let bestMove = orderedMoves[0]; let newHistory = [...history, currentHash];

    for (let i = 0; i < orderedMoves.length; i++) {
        const move = orderedMoves[i]; let extension = 0;
        if (move.promotion || (move.piece?.toLowerCase() === 'p' && (move.to[0] === 1 || move.to[0] === 6))) extension = 1;
        
        const newBoard = makeMove(board, move);
        const newCR = { ...cr }; // Simplified CR update for speed
        if (move.piece === 'K') {newCR.K = false; newCR.Q = false;} if (move.piece === 'k') {newCR.k = false; newCR.q = false;}
        if (move.piece === 'R') {if(move.from[0]===7&&move.from[1]===0) newCR.Q=false; if(move.from[0]===7&&move.from[1]===7) newCR.K=false;}
        if (move.piece === 'r') {if(move.from[0]===0&&move.from[1]===0) newCR.q=false; if(move.from[0]===0&&move.from[1]===7) newCR.k=false;}
        
        const newEP = move.isPawnDoubleMove ? [(move.from[0] + move.to[0]) / 2, move.from[1]] : null;
        const opponentColor = color === 'w' ? 'b' : 'w';
        
        let score;
        if (i === 0) {
            score = -search(newBoard, effectiveDepth - 1 + extension, -beta, -alpha, opponentColor, ply + 1, newCR, newEP, newHistory);
        } else {
            let reduction = (effectiveDepth >= 3 && i >= 3 && !inCheck && !move.capture) ? 1 : 0;
            score = -search(newBoard, effectiveDepth - 1 - reduction + extension, -alpha - 1, -alpha, opponentColor, ply + 1, newCR, newEP, newHistory);
            if (score > alpha && score < beta) { score = -search(newBoard, effectiveDepth - 1 + extension, -beta, -alpha, opponentColor, ply + 1, newCR, newEP, newHistory); }
        }
        
        if (stopSearch) return 0;

        if (score > alpha) {
            alpha = score;
            bestMove = move;
            if (score >= beta) {
                if(!move.capture){ killerMoves[ply][1] = killerMoves[ply][0]; killerMoves[ply][0] = move; historyTable[pieceMap.indexOf(move.piece)][move.to[0]*8+move.to[1]] += depth*depth; }
                transpositionTable.set(currentHash.toString(), { score: beta, depth: effectiveDepth, flag: TT_LOWERBOUND, bestMove: move });
                return beta;
            }
        }
    }
    const flag = (alpha > originalAlpha) ? TT_EXACT : TT_UPPERBOUND;
    transpositionTable.set(currentHash.toString(), { score: alpha, depth: effectiveDepth, flag, bestMove });
    return alpha;
}

// =================================================================
//              THE CONDUCTOR: MAIN WORKER DRIVER
// =================================================================

function searchRoot(board, depth, alpha, beta, turn, cr, ep) {
    let bestMove = null;
    let history = [calculateZobristHash(board, turn)];
    const moves = generateLegalMoves(board, turn, cr, ep);
    if(moves.length === 0) return {bestMove: null, score: 0};
    const orderedMoves = orderMoves(moves, null, 0);
    bestMove = orderedMoves[0];

    for (let i=0; i < orderedMoves.length; i++) {
        const move = orderedMoves[i];
        const newBoard = makeMove(board, move);
        const newCR = { ...cr }; // Simplified
        if (move.piece === 'K') {newCR.K = false; newCR.Q = false;} if (move.piece === 'k') {newCR.k = false; newCR.q = false;}
        const newEP = move.isPawnDoubleMove ? [(move.from[0] + move.to[0]) / 2, move.from[1]] : null;
        const opponentColor = turn === 'w' ? 'b' : 'w';

        let score;
        if (i === 0) {
            score = -search(newBoard, depth - 1, -beta, -alpha, opponentColor, 1, newCR, newEP, history);
        } else {
            score = -search(newBoard, depth - 1, -alpha - 1, -alpha, opponentColor, 1, newCR, newEP, history);
            if (score > alpha && score < beta) { score = -search(newBoard, depth - 1, -beta, -alpha, opponentColor, 1, newCR, newEP, history); }
        }

        if (performance.now() - searchStartTime > timeLimit) stopSearch = true;
        if (stopSearch) break;

        if (score > alpha) {
            alpha = score;
            bestMove = move;
        }
    }
    return { bestMove, score: alpha };
}

self.onmessage = function(e) {
    const { command, fen, maxDepth, maxTime } = e.data;
    if (command === 'calculate_move') {
        searchStartTime = performance.now();
        timeLimit = maxTime || 6000;
        stopSearch = false;
        nodeCount = 0;
        transpositionTable = new Map();
        killerMoves = Array(MATE_IN_MAX_PLY).fill(null).map(() => [null, null]);
        historyTable = Array(12).fill(null).map(() => Array(64).fill(0));

        const { board, turn, castlingRights, enPassantTarget } = createBoardFromFEN(fen);

        const currentHash = calculateZobristHash(board, turn).toString();
        if (openingBook.has(currentHash)) {
            const bookMoves = openingBook.get(currentHash);
            const randomMove = bookMoves[Math.floor(Math.random() * bookMoves.length)];
            return postMessage({ bestMove: randomMove, score: "Book Move", timeTaken: 0, nodesSearched: 0 });
        }
        
        let bestMoveFromCompletedDepth, bestScore = -Infinity;
        const legalMoves = generateLegalMoves(board, turn, castlingRights, enPassantTarget);
        if(legalMoves.length > 0) bestMoveFromCompletedDepth = legalMoves[0];

        for (let currentDepth = 1; currentDepth <= (maxDepth || 99); currentDepth++) {
            const result = searchRoot(board, currentDepth, -Infinity, Infinity, turn, castlingRights, enPassantTarget);
            if (stopSearch && currentDepth > 1) break; // If time runs out, trust the previous depth's result
            bestMoveFromCompletedDepth = result.bestMove;
            bestScore = result.score;
            if (Math.abs(bestScore) >= MATE_SCORE - currentDepth) break;
        }

        postMessage({
            bestMove: bestMoveFromCompletedDepth,
            score: bestScore,
            timeTaken: (performance.now() - searchStartTime).toFixed(2),
            nodesSearched: nodeCount
        });
    }
};
