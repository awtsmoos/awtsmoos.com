/* B"H */

// =================================================================
//                 THE PROMETHEUS CHESS ENGINE (Mk. III - UNIFIED)
// =================================================================
// This version is structurally refactored to use a single, shared
// helpers file for all core logic, ensuring 100% consistency between
// the book generator and the search engine.

// --- CORE LOGIC AND DATABASE IMPORT ---
importScripts('helpers.js');
importScripts('grandmaster_library.js');

// =================================================================
//                 OPENING BOOK PROCESSING LOGIC
// =================================================================
const openingBook = new Map();
function buildOpeningBook() {
    if (openingBook.size > 0 || typeof rawOpeningBook === 'undefined') return;
    for (const entry of rawOpeningBook) {
        if (!entry) continue;
        const fen = entry[0];
        const hash = calculateZobristHash(createGameState(fen)).toString();
        const existingMoves = openingBook.has(hash) ? openingBook.get(hash) : [];
        for (let i = 2; i < entry.length; i++) {
            existingMoves.push(entry[i]);
        }
        openingBook.set(hash, existingMoves);
    }
}

// =================================================================
//                       CONSTANTS & CONFIGURATION
// =================================================================
const pieceValues = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };
const MATE_SCORE = 100000;
const MATE_IN_MAX_PLY = 64;
const NULL_MOVE_R = 3;
const CONTEMPT_FACTOR = -20;
let nodeCount = 0;
let searchStartTime, timeLimit;
let stopSearch = false;
let killerMoves, historyTable, transpositionTable, repetitionHistory;
const TT_EXACT = 0, TT_LOWERBOUND = 1, TT_UPPERBOUND = 2;

// Piece-Square Tables
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
const kingPSTMidGame=[[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-20,-30,-30,-40,-40,-30,-30,-20],[-10,-20,-20,-20,-20,-20,-20,-10],[20,20,0,0,0,0,20,20],[20,30,10,0,0,10,30,20]];
// prettier-ignore
const kingPSTEndGame=[[-50,-40,-30,-20,-20,-30,-40,-50],[-30,-20,-10,0,0,-10,-20,-30],[-30,-10,20,30,30,20,-10,-30],[-30,-10,30,40,40,30,-10,-30],[-30,-10,30,40,40,30,-10,-30],[-30,-10,20,30,30,20,-10,-30],[-30,-30,0,0,0,0,-30,-30],[-50,-30,-30,-30,-30,-30,-30,-50]];

// =================================================================
//                 EVALUATION & SEARCH (UNCHANGED)
// =================================================================

function generateTacticalMoves(state) {
    const tacticalMoves = [];
    const pseudoLegalMoves = [];
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = state.board[r][c];
            if (p && (p.toUpperCase() === p) === (state.turn === 'w')) {
                generateMovesForPiece(pseudoLegalMoves, p, r, c, state);
            }
        }
    }
    for (const move of pseudoLegalMoves) {
        if (move.capture || move.promotion) {
            const { newState } = makeMove(state, move);
            const kingPos = newState.kingPos[state.turn];
            if(kingPos && !isSquareAttacked(newState.board, kingPos.r, kingPos.c, newState.turn)) {
                tacticalMoves.push(move);
            }
        }
    }
    return tacticalMoves;
}

function getGamePhase(board) {
    const MAX_MATERIAL = 7800, ENDGAME_MATERIAL = 2000;
    let totalMaterial = 0;
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) { const p = board[r][c]; if (p && p.toLowerCase() !== 'k' && p.toLowerCase() !== 'p') totalMaterial += pieceValues[p.toLowerCase()]; }
    const phase = (totalMaterial - ENDGAME_MATERIAL) / (MAX_MATERIAL - ENDGAME_MATERIAL);
    return Math.max(0, Math.min(1, phase));
}

function evaluate(state) {
    // This function remains exactly the same as you provided
    const { board } = state;
    const gamePhase = getGamePhase(board);
    let whiteScore = 0, blackScore = 0;
    const whitePawnFiles = [], blackPawnFiles = [];
    for (let c = 0; c < 8; c++) { for (let r = 0; r < 8; r++) { if (board[r][c] === 'P') whitePawnFiles.push(c); if (board[r][c] === 'p') blackPawnFiles.push(c); } }
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (!p) continue;
            const isWhite = p.toUpperCase() === p;
            const pType = p.toLowerCase();
            let score = pieceValues[pType];
            const pstRow = isWhite ? 7 - r : r;
            if (pType === 'k') { score += (kingPSTMidGame[pstRow][c] * gamePhase) + (kingPSTEndGame[pstRow][c] * (1 - gamePhase)); }
            else { score += ({ p: pawnPST, n: knightPST, b: bishopPST, r: rookPST, q: queenPST }[pType])[pstRow][c]; }
            let mobility = 0;
            if (pType === 'n') { for (const [dr, dc] of knightMoves) { if (board[r + dr]?.[c + dc] !== undefined) mobility++; } score += mobility * 3; }
            else if (pType === 'b' || pType === 'r' || pType === 'q') {
                const directions = pType === 'b' ? bishopDirections : (pType === 'r' ? rookDirections : queenDirections);
                for (const [dr, dc] of directions) { for (let i = 1; i < 8; i++) { const nR = r + i * dr, nC = c + i * dc; if (board[nR]?.[nC] === undefined) break; mobility++; if (board[nR][nC]) break; } }
                score += mobility * 2;
            }
            if (pType === 'p') {
                let isPassed = true;
                const opponentPawn = isWhite ? 'p' : 'P', dir = isWhite ? -1 : 1;
                for (let i = r + dir; i >= 0 && i < 8; i += dir) { if (board[i][c] === opponentPawn || board[i][c - 1] === opponentPawn || board[i][c + 1] === opponentPawn) { isPassed = false; break; } }
                if (isPassed) score += (8 - (isWhite ? r : 7 - r)) * 20;
                if (!(isWhite ? whitePawnFiles : blackPawnFiles).includes(c - 1) && !(isWhite ? whitePawnFiles : blackPawnFiles).includes(c + 1)) score -= 12;
                if ((isWhite ? whitePawnFiles : blackPawnFiles).filter(f => f === c).length > 1) score -= 15;
            }
            if (pType === 'r') {
                if (!whitePawnFiles.includes(c) && !blackPawnFiles.includes(c)) score += 25;
                else if ((isWhite && !whitePawnFiles.includes(c)) || (!isWhite && !blackPawnFiles.includes(c))) score += 15;
                if ((isWhite && r === 1) || (!isWhite && r === 6)) score += 30;
            }
            if (pawnPST[pstRow][c] > 0) score += 10;
            if (isWhite) whiteScore += score; else blackScore += score;
        }
    }
    if (state.kingPos.w) whiteScore -= calculateKingDanger(board, state.kingPos.w, 'b') * gamePhase;
    if (state.kingPos.b) blackScore -= calculateKingDanger(board, state.kingPos.b, 'w') * gamePhase;
    if (board.flat().filter(p => p === 'B').length >= 2) whiteScore += 45;
    if (board.flat().filter(p => p === 'b').length >= 2) blackScore += 45;
    return (state.turn === 'w' ? 1 : -1) * (whiteScore - blackScore);
}

function calculateKingDanger(board, kingPos, attackerColor) {
    let dangerScore = 0;
    let isKingFileOpen = true;
    for (let r = 0; r < 8; r++) { if (board[r][kingPos.c]?.toLowerCase() === 'p') { isKingFileOpen = false; break; } }
    if (isKingFileOpen) dangerScore += 25;
    let attackerCount = 0;
    for (let ro = -1; ro <= 1; ro++) { for (let co = -1; co <= 1; co++) {
        const zoneR = kingPos.r + ro, zoneC = kingPos.c + co;
        if (zoneR < 0 || zoneR > 7 || zoneC < 0 || zoneC > 7) continue;
        if (isSquareAttacked(board, zoneR, zoneC, attackerColor)) attackerCount++;
    }}
    dangerScore += [0, 10, 30, 60, 100][Math.min(attackerCount, 4)];
    return dangerScore;
}

function quiesce(state, alpha, beta, ply) {
    if ((nodeCount & 2047) === 0 && performance.now() - searchStartTime > timeLimit) stopSearch = true;
    if (stopSearch) return 0;
    if (ply >= MATE_IN_MAX_PLY) return evaluate(state);
    nodeCount++;
    const standPat = evaluate(state);
    if (standPat >= beta) return beta;
    if (alpha < standPat) alpha = standPat;
    const moves = generateTacticalMoves(state);
    moves.sort((a, b) => {
        let scoreA = 0, scoreB = 0;
        if (a.capture) scoreA = (pieceValues[a.capture.toLowerCase()] * 10) - pieceValues[a.piece.toLowerCase()];
        if (a.promotion) scoreA += pieceValues[a.promotion.toLowerCase()];
        if (b.capture) scoreB = (pieceValues[b.capture.toLowerCase()] * 10) - pieceValues[b.piece.toLowerCase()];
        if (b.promotion) scoreB += pieceValues[b.promotion.toLowerCase()];
        return scoreB - scoreA;
    });
    for (const move of moves) {
        const { newState } = makeMove(state, move);
        repetitionHistory.push(newState.zobristHash);
        const score = -quiesce(newState, -beta, -alpha, ply + 1);
        repetitionHistory.pop();
        if (stopSearch) return 0;
        if (score >= beta) return beta;
        if (score > alpha) alpha = score;
    }
    return alpha;
}

function orderMoves(moves, pvMove, ply) {
    return moves.map(move => {
        let score = 0;
        if (pvMove && move.from[0] === pvMove.from[0] && move.from[1] === pvMove.from[1] && move.to[0] === pvMove.to[0] && move.to[1] === pvMove.to[1]) score = 100000;
        else if (move.capture) score = 90000 + (pieceValues[move.capture.toLowerCase()] * 10 - pieceValues[move.piece.toLowerCase()]);
        else if (killerMoves[ply]) {
            if (killerMoves[ply][0]?.from[0] === move.from[0] && killerMoves[ply][0]?.from[1] === move.from[1] && killerMoves[ply][0]?.to[0] === move.to[0] && killerMoves[ply][0]?.to[1] === move.to[1]) score = 80000;
            else if (killerMoves[ply][1]?.from[0] === move.from[0] && killerMoves[ply][1]?.from[1] === move.from[1] && killerMoves[ply][1]?.to[0] === move.to[0] && killerMoves[ply][1]?.to[1] === move.to[1]) score = 70000;
        }
        else if (move.piece) score = historyTable[pieceMap.indexOf(move.piece)][move.to[0] * 8 + move.to[1]] || 0;
        return { move, score };
    }).sort((a, b) => b.score - a.score).map(item => item.move);
}

function search(state, depth, alpha, beta, ply) {
    // This function remains exactly the same as you provided
    if (performance.now() - searchStartTime > timeLimit) stopSearch = true;
    if (stopSearch) return 0;
    if (ply > 0 && repetitionHistory.filter(h => h === state.zobristHash).length >= 2) return CONTEMPT_FACTOR;
    if (ply >= MATE_IN_MAX_PLY) return evaluate(state);
    if (depth <= 0) return quiesce(state, alpha, beta, ply);
    nodeCount++;
    const ttEntry = transpositionTable.get(state.zobristHash.toString());
    if (ttEntry && ttEntry.depth >= depth) {
        if (ttEntry.flag === TT_EXACT) return ttEntry.score;
        if (ttEntry.flag === TT_LOWERBOUND && ttEntry.score >= beta) return beta;
        if (ttEntry.flag === TT_UPPERBOUND && ttEntry.score <= alpha) return alpha;
    }
    const inCheck = state.kingPos[state.turn] && isSquareAttacked(state.board, state.kingPos[state.turn].r, state.kingPos[state.turn].c, state.turn === 'w' ? 'b' : 'w');
    if (inCheck) depth++;
    if (!inCheck && depth >= NULL_MOVE_R + 1 && ply > 0 && state.moveCount > 5) {
        const { newState: nullMoveState } = makeMove(state, { isNullMove: true });
        const score = -search(nullMoveState, depth - 1 - NULL_MOVE_R, -beta, -beta + 1, ply + 1);
        if (score >= beta) return beta;
    }
    const moves = generateLegalMoves(state);
    if (moves.length === 0) return inCheck ? -MATE_SCORE + ply : 0;
    const orderedMoves = orderMoves(moves, ttEntry ? ttEntry.bestMove : null, ply);
    let originalAlpha = alpha, bestMove = orderedMoves[0];
    for (let i = 0; i < orderedMoves.length; i++) {
        const move = orderedMoves[i];
        const { newState } = makeMove(state, move);
        repetitionHistory.push(newState.zobristHash);
        let score;
        if (i === 0) { score = -search(newState, depth - 1, -beta, -alpha, ply + 1); }
        else {
            let reduction = (depth >= 3 && i >= 3 && !inCheck && !move.capture) ? 1 : 0;
            score = -search(newState, depth - 1 - reduction, -alpha - 1, -alpha, ply + 1);
            if (score > alpha && score < beta) { score = -search(newState, depth - 1, -beta, -alpha, ply + 1); }
        }
        repetitionHistory.pop();
        if (stopSearch) return 0;
        if (score > alpha) {
            alpha = score; bestMove = move;
            if (score >= beta) {
                if (!move.capture) {
                    killerMoves[ply][1] = killerMoves[ply][0]; killerMoves[ply][0] = move;
                    if (move.piece) historyTable[pieceMap.indexOf(move.piece)][move.to[0] * 8 + move.to[1]] += depth * depth;
                }
                transpositionTable.set(state.zobristHash.toString(), { score: beta, depth, flag: TT_LOWERBOUND, bestMove: move });
                return beta;
            }
        }
    }
    const flag = (alpha > originalAlpha) ? TT_EXACT : TT_UPPERBOUND;
    transpositionTable.set(state.zobristHash.toString(), { score: alpha, depth, flag, bestMove });
    return alpha;
}

function searchRoot(initialState, maxDepth) {
    // This function remains exactly the same as you provided
    let bestMove = null, bestScore = -Infinity;
    let alpha = -Infinity, beta = Infinity;
    const moves = generateLegalMoves(initialState);
    if (moves.length === 0) return { bestMove: null, score: evaluate(initialState) };
    const timerId = setTimeout(() => { stopSearch = true; }, timeLimit - 50);
    for (let currentDepth = 1; currentDepth <= maxDepth; currentDepth++) {
        const orderedMoves = orderMoves(moves, bestMove, 0);
        let bestMoveForThisDepth = orderedMoves[0];
        for (const move of orderedMoves) {
            if (stopSearch) break;
            const { newState } = makeMove(initialState, move);
            repetitionHistory.push(newState.zobristHash);
            let score;
            if (move === orderedMoves[0]) { score = -search(newState, currentDepth - 1, -beta, -alpha, 1); }
            else {
                score = -search(newState, currentDepth - 1, -alpha - 1, -alpha, 1);
                if (score > alpha && score < beta) { score = -search(newState, currentDepth - 1, -beta, -alpha, 1); }
            }
            repetitionHistory.pop();
            if (stopSearch) break;
            if (score > alpha) { alpha = score; bestMoveForThisDepth = move; }
        }
        if (stopSearch) break;
        bestMove = bestMoveForThisDepth;
        bestScore = alpha;
        if (bestScore <= alpha || bestScore >= beta) { alpha = -Infinity; beta = Infinity; currentDepth--; continue; }
        const aspirationWindow = 50;
        alpha = bestScore - aspirationWindow; beta = bestScore + aspirationWindow;
        if (Math.abs(bestScore) >= MATE_SCORE - MATE_IN_MAX_PLY) break;
    }
    clearTimeout(timerId);
    return { bestMove, score: bestScore };
}

// =================================================================
//              MAIN WORKER DRIVER (UNCHANGED)
// =================================================================
let DEBUG_MODE = true;
let isInitialized = false;

function initializeEngine() {
    if (isInitialized) return;
    initializeZobristKeys();
    buildOpeningBook();
    isInitialized = true;
    console.log("Prometheus Engine Initialized Successfully.");
}

self.onmessage = function(e) {
    const { command, fen, maxDepth, maxTime } = e.data;
    initializeEngine();

    if (command === 'set_debug') {
        DEBUG_MODE = e.data.debug;
        return;
    }

    if (command === 'calculate_move') {
        searchStartTime = performance.now();
        timeLimit = maxTime || 5000;
        stopSearch = false;
        nodeCount = 0;
        transpositionTable = new Map();
        killerMoves = Array(MATE_IN_MAX_PLY + 1).fill(null).map(() => [null, null]);
        historyTable = Array(12).fill(null).map(() => Array(64).fill(0));

        const initialState = createGameState(fen);
        repetitionHistory = [initialState.zobristHash];
        
        const currentHash = initialState.zobristHash.toString();
        if (DEBUG_MODE) {
            console.log(`---------------------------------`);
            console.log(`Calculating move for FEN: ${fen}`);
            console.log(`LIVE ZOBRIST HASH: ${currentHash}`);
        }

        if (openingBook.has(currentHash)) {
            const bookMoves = openingBook.get(currentHash);
            const legalMoves = generateLegalMoves(initialState);
            const verifiedBookMoves = bookMoves.filter(bookMove => 
                legalMoves.some(legalMove => 
                    legalMove.from[0] === bookMove.from[0] && legalMove.from[1] === bookMove.from[1] &&
                    legalMove.to[0] === bookMove.to[0] && legalMove.to[1] === bookMove.to[1]
                )
            );

            if (verifiedBookMoves.length > 0) {
                if (DEBUG_MODE) console.log(`**CACHE HIT**: Hash found in book and move verified as legal.`);
                const randomVerifiedMove = verifiedBookMoves[Math.floor(Math.random() * verifiedBookMoves.length)];
                postMessage({ bestMove: randomVerifiedMove, score: "Book Move", timeTaken: 0, nodesSearched: 0 });
                return;
            } else {
                if (DEBUG_MODE) console.error(`**BOOK FAILURE**: Hash found, but all book moves were ILLEGAL. Treating as a cache miss.`);
            }
        }
        
        if (DEBUG_MODE) {
            console.warn("Engine is now THINKING because of a book miss or failure.");
        }

        const { bestMove, score } = searchRoot(initialState, maxDepth || 99);
        postMessage({
            bestMove: bestMove, score: score,
            timeTaken: (performance.now() - searchStartTime).toFixed(2),
            nodesSearched: nodeCount
        });
    }
};