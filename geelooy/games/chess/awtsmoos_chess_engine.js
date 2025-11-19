/* B"H */

// =================================================================
//          THE AWTSMOOS CHESS ENGINE (MK. V - FOOLPROOF)
// =================================================================

importScripts('helpers.js');
importScripts('grandmaster_library.js');
importScripts('punishment_library.js');

// --- SEARCH CONSTANTS ---
const MATE_SCORE = 100000, MATE_IN_MAX_PLY = 64, CONTEMPT_FACTOR = -72;
const TT_EXACT = 0, TT_LOWERBOUND = 1, TT_UPPERBOUND = 2;

// --- STATE ---
const openingBook = new Map();
const punishmentBook = new Map();
let isInitialized = false;
let lastParsedGame = null;
let nodeCount, searchStartTime, timeLimit, stopSearch, killerMoves, historyTable, transpositionTable, evaluationTime;

// --- EVALUATION DATA ---
const pawnPST = [[0,0,0,0,0,0,0,0],[50,50,50,50,50,50,50,50],[10,10,20,30,30,20,10,10],[5,5,10,40,40,10,5,5],[0,0,15,50,50,15,0,0],[5,-5,-10,0,0,-10,-5,5],[5,10,10,-25,-25,10,10,5],[0,0,0,0,0,0,0,0]];
const knightPST = [[-50,-40,-30,-30,-30,-30,-40,-50],[-40,-20,0,5,5,0,-20,-40],[-30,5,15,20,20,15,5,-30],[-30,10,20,30,30,20,10,-30],[-30,10,20,30,30,20,10,-30],[-30,5,15,20,20,15,5,-30],[-40,-20,0,5,5,0,-20,-40],[-50,-40,-30,-30,-30,-30,-40,-50]];
const bishopPST = [[-20,-10,-10,-10,-10,-10,-10,-20],[-10,0,0,0,0,0,0,-10],[-10,0,5,10,10,5,0,-10],[-10,5,5,10,10,5,5,-10],[-10,0,10,10,10,10,0,-10],[-10,10,10,10,10,10,10,-10],[-10,5,0,0,0,0,5,-10],[-20,-10,-10,-10,-10,-10,-10,-20]];
const rookPST = [[0,0,0,0,0,0,0,0],[5,10,10,10,10,10,10,5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[0,0,0,5,5,0,0,0]];
const queenPST = [[-20,-10,-10,-5,-5,-10,-10,-20],[-10,0,0,0,0,0,0,-10],[-10,0,5,5,5,5,0,-10],[-5,0,5,5,5,5,0,-5],[0,0,5,5,5,5,0,-5],[-10,5,5,5,5,5,0,-10],[-10,0,5,0,0,0,0,-10],[-20,-10,-10,-5,-5,-10,-10,-20]];
const kingPSTMidGame=[[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-20,-30,-30,-40,-40,-30,-30,-20],[-10,-20,-20,-20,-20,-20,-20,-10],[20,20,0,0,0,0,20,20],[20,30,10,0,0,10,30,20]];
const kingPSTEndGame=[[-50,-40,-30,-20,-20,-30,-40,-50],[-30,-20,-10,0,0,-10,-20,-30],[-30,-10,20,30,30,20,-10,-30],[-30,-10,30,40,40,30,-10,-30],[-30,-10,30,40,40,30,-10,-30],[-30,-10,20,30,30,20,-10,-30],[-30,-30,0,0,0,0,-30,-30],[-50,-30,-30,-30,-30,-30,-30,-50]];
const pieceValues = { p: 100, n: 350, b: 355, r: 500, q: 900, k: 20000 };

function getGamePhase(state) {
    const MAX_PHASE = 24; 
    let phase = 0;
    phase += popcount(state.pieceBitboards[N] | state.pieceBitboards[N + 6]);
    phase += popcount(state.pieceBitboards[B] | state.pieceBitboards[B + 6]);
    phase += popcount(state.pieceBitboards[R] | state.pieceBitboards[R + 6]) * 2;
    phase += popcount(state.pieceBitboards[Q] | state.pieceBitboards[Q + 6]) * 4;
    return Math.min(phase, MAX_PHASE) / MAX_PHASE;
}

function evaluate(state) {
    const start = performance.now();
    const phase = getGamePhase(state);
    let score = 0;
    const psts = { p: pawnPST, n: knightPST, b: bishopPST, r: rookPST, q: queenPST };
    
    for (let p = P; p <= K; p++) {
        let w = state.pieceBitboards[p], b = state.pieceBitboards[p + 6];
        const char = pieceMap[p].toLowerCase();
        while(w > 0n) {
            const sq = getLSBIndex(w), r = 7 - Math.floor(sq/8), c = sq % 8;
            score += pieceValues[char];
            if (p === K) score += kingPSTEndGame[r][c] * (1-phase) + kingPSTMidGame[r][c] * phase;
            else score += psts[char][r][c];
            w = popBit(w);
        }
        while(b > 0n) {
            const sq = getLSBIndex(b), r = Math.floor(sq/8), c = sq % 8;
            score -= pieceValues[char];
            if (p === K) score -= kingPSTEndGame[r][c] * (1-phase) + kingPSTMidGame[r][c] * phase;
            else score -= psts[char][r][c];
            b = popBit(b);
        }
    }
    
    if (popcount(state.pieceBitboards[B]) >= 2) score += 50;
    if (popcount(state.pieceBitboards[B+6]) >= 2) score -= 50;

    evaluationTime += performance.now() - start;
    return (state.turn === WHITE ? 1 : -1) * score;
}

function initializeSearch(maxTime) {
    searchStartTime = performance.now(); timeLimit = maxTime || 4000;
    stopSearch = false; nodeCount = 0; evaluationTime = 0;
    transpositionTable = new Map();
    killerMoves = Array(MATE_IN_MAX_PLY + 1).fill(null).map(() => [null, null]);
    historyTable = Array(12).fill(null).map(() => Array(64).fill(0));
}

function orderMoves(moves, state, ply) {
    const scores = [], hash = transpositionTable.get(state.zobristHash)?.move || 0;
    const vals = [100, 350, 355, 500, 900, 20000];
    for (const m of moves) {
        let score = 0;
        if (m === hash) score = 2000000;
        else if (getMoveCapture(m)) {
            const attacker = getMovePiece(m), victim = getMoveEnpassant(m) ? P : getPieceTypeOnSquare(state, getMoveTo(m), state.turn ^ 1);
            if (victim !== null) score = (vals[victim] * 10) - vals[attacker] + 1000000;
        } else {
            if (killerMoves[ply] && killerMoves[ply][0] === m) score = 900000;
            else if (killerMoves[ply] && killerMoves[ply][1] === m) score = 850000;
            else score = historyTable[getMovePiece(m) + (state.turn * 6)][getMoveTo(m)];
        }
        scores.push({ m, score });
    }
    return scores.sort((a, b) => b.score - a.score).map(s => s.m);
}

/* B"H */
function quiesce(state, alpha, beta) {
    if ((nodeCount & 2047) === 0 && performance.now() - searchStartTime > timeLimit) stopSearch = true;
    if (stopSearch) return 0;
    nodeCount++;

    const stand_pat = evaluate(state);
    if (stand_pat >= beta) return beta;
    if (alpha < stand_pat) alpha = stand_pat;

    const moves = orderMoves(generateTacticalMoves(state), state, 0);

    for (const m of moves) {
        makeMove(state, m);

        // --- DEBUG: CHECK FOR MISSING KING AFTER MOVE ---
        // The side that just moved (state.turn ^ 1) should have a King. 
        // But we are checking if the opponent (state.turn) is checking us.
        // Actually, we validate if the move we just made left OUR king in check.
        // So we look for the King of the side (state.turn ^ 1).
        const kingColor = state.turn ^ 1;
        const kingSq = getLSBIndex(state.pieceBitboards[kingColor * 6 + K]);

        if (kingSq === -1) {
            console.error("B\"H - DIAGNOSTIC: King captured in Quiesce search!");
            console.error("The move just executed caused the King to disappear.");
            console.error("Move Int:", m);
            console.error("From:", getMoveFrom(m), "To:", getMoveTo(m));
            console.error("Captured Piece Type:", getMoveCapture(m) ? "Yes" : "No");
            
            // Decode move for human readability
            const pieceStr = "PNBRQKpnbrqk"[getMovePiece(m)];
            console.error("Piece Moved:", pieceStr);
            unmakeMove(state); // unwind for clean state in console
            throw new Error("B\"H - King captured. Illegal move generated.");
        }
        // ------------------------------------------------

        if (isSquareAttacked_lean(state, kingSq, state.turn)) { 
            unmakeMove(state); 
            continue; 
        }

        const score = -quiesce(state, -beta, -alpha);
        unmakeMove(state);

        if (stopSearch) return 0;
        if (score >= beta) return beta;
        if (score > alpha) alpha = score;
    }
    return alpha;
}

/* B"H */
function search(state, depth, alpha, beta, ply) {
    if (depth <= 0) return quiesce(state, alpha, beta);
    if ((nodeCount & 2047) === 0 && performance.now() - searchStartTime > timeLimit) stopSearch = true;
    if (stopSearch) return 0;
    nodeCount++;

    for (let i = moveStackPtr - 4; i >= 0; i -= 2) if (moveStack[i].zobristHash === state.zobristHash) return CONTEMPT_FACTOR;

    const tt = transpositionTable.get(state.zobristHash);
    if (ply > 0 && tt && tt.depth >= depth) {
        let s = tt.score;
        if (s > MATE_SCORE - 64) s -= ply; if (s < -MATE_SCORE + 64) s += ply;
        if (tt.flag === TT_EXACT) return s;
        if (tt.flag === TT_LOWERBOUND) alpha = Math.max(alpha, s);
        else if (tt.flag === TT_UPPERBOUND) beta = Math.min(beta, s);
        if (alpha >= beta) return s;
    }

    const moves = orderMoves(generateMoves(state), state, ply);
    let legal = 0, best = -Infinity, flag = TT_UPPERBOUND, bestMove = 0;

    for (const m of moves) {
        makeMove(state, m);

        // --- DEBUG: CHECK FOR MISSING KING IN SEARCH ---
        const kingColor = state.turn ^ 1;
        const kingSq = getLSBIndex(state.pieceBitboards[kingColor * 6 + K]);
        
        if (kingSq === -1) {
            console.error("B\"H - DIAGNOSTIC: King captured in Main Search!");
            console.error("Move causing disappearance:", m);
            console.error("From:", getMoveFrom(m), "To:", getMoveTo(m));
            unmakeMove(state);
            throw new Error("B\"H - King captured in search. Illegal move.");
        }
        // -----------------------------------------------

        if (isSquareAttacked_lean(state, kingSq, state.turn)) { 
            unmakeMove(state); 
            continue; 
        }
        
        legal++;
        let score;
        if (legal === 1) score = -search(state, depth - 1, -beta, -alpha, ply + 1);
        else {
            score = -search(state, depth - 1, -alpha - 1, -alpha, ply + 1);
            if (score > alpha && score < beta) score = -search(state, depth - 1, -beta, -alpha, ply + 1);
        }
        unmakeMove(state);
        if (stopSearch) return 0;
        if (score > best) { best = score; bestMove = m; }
        if (best > alpha) { alpha = best; flag = TT_EXACT; }
        if (alpha >= beta) {
            if (!getMoveCapture(m)) {
                if (killerMoves[ply][0] !== m) killerMoves[ply][1] = killerMoves[ply][0];
                killerMoves[ply][0] = m;
                historyTable[getMovePiece(m) + ((state.turn^1) * 6)][getMoveTo(m)] += depth * depth;
            }
            transpositionTable.set(state.zobristHash, { score: beta, depth: depth, flag: TT_LOWERBOUND, move: m });
            return beta;
        }
    }

    if (legal === 0) return isSquareAttacked_lean(state, getLSBIndex(state.pieceBitboards[state.turn * 6 + K]), state.turn ^ 1) ? -MATE_SCORE + ply : 0;
    transpositionTable.set(state.zobristHash, { score: best, depth, flag, move: bestMove });
    return best;
}

function searchRoot(state, depth, time) {
    initializeSearch(time);
    let bestMove = 0, bestScore = -Infinity;
    for (let d = 1; d <= depth; d++) {
        const moves = orderMoves(generateMoves(state), state, 0);
        let legal = 0, alpha = -Infinity, beta = Infinity;
        for (const m of moves) {
            makeMove(state, m);
            if (isSquareAttacked_lean(state, getLSBIndex(state.pieceBitboards[(state.turn ^ 1) * 6 + K]), state.turn)) { unmakeMove(state); continue; }
            legal++;
            const score = -search(state, d - 1, -beta, -alpha, 1);
            unmakeMove(state);
            if (stopSearch) break;
            if (score > bestScore) { bestScore = score; bestMove = m; alpha = score; }
        }
        if (stopSearch || legal === 0) break;
        if (Math.abs(bestScore) > MATE_SCORE - 64) break;
    }
    return { bestMove, score: bestScore };
}

function decodeMove(move, turn) {
    const f = getMoveFrom(move), t = getMoveTo(move), p = getMovePromoted(move);
    return { from: [Math.floor(f / 8), f % 8], to: [Math.floor(t / 8), t % 8], promotion: p ? pieceMap[p + (turn === BLACK ? 6 : 0)].toLowerCase() : null };
}

function processRawBook(rawBook, targetMap) {
    if (!Array.isArray(rawBook)) return;
    for (const entry of rawBook) {
        // Defensive check: Ensure entry has data and FEN is a valid string
        if (!entry || !entry[0] || typeof entry[0] !== 'string') continue;
        
        const fen = entry[0];
        const name = entry[1];
        const hash = calculateZobristHash(createGameState(fen));
        const bookEntry = targetMap.has(hash) ? targetMap.get(hash) : { name, moves: [] };
        for (let i = 2; i < entry.length; i++) bookEntry.moves.push(entry[i]);
        targetMap.set(hash, bookEntry);
    }
}

function initializeEngine() {
    if (isInitialized) return;
    console.log("Awtsmoos Engine (Bitboard): Initialization started.");
    initializeAll();
    // Ensure rawOpeningBook exists before processing
    if (typeof rawOpeningBook !== 'undefined') processRawBook(rawOpeningBook, openingBook);
    if (typeof punishmentBookSource !== 'undefined') {
        const rawPunish = generateRawBook(punishmentBookSource);
        processRawBook(rawPunish, punishmentBook);
    }
    isInitialized = true;
    console.log("Awtsmoos Engine Initialized.");
    self.postMessage({ type: 'initialization_complete' });
}

/* B"H */
/**
 * Main message handler for the chess engine worker.
 * DIAGNOSTIC VERSION: Adds extensive logging for the opening book lookup.
 * @param {MessageEvent} e The event object from the main thread.
 */
self.onmessage = function(e) {
    const { command } = e.data;
    if (command === 'initialize') {
        initializeEngine();
    } else if (command === 'calculate_move') {
        if (!isInitialized) initializeEngine();
        
        const state = createGameState(e.data.fen);
        console.log("B\"H - Book Check: Received FEN:", e.data.fen);
        console.log("B\"H - Book Check: Calculated Zobrist Hash:", state.zobristHash);
        
        // Check both books for a matching hash
        const book = openingBook.get(state.zobristHash) || punishmentBook.get(state.zobristHash);
        
        if (book && book.moves && book.moves.length > 0) {
            console.log("B\"H - BOOK HIT! Found entry:", book.name);
            postMessage({
                type: 'move_result',
                bestMove: book.moves[Math.floor(Math.random() * book.moves.length)],
                score: `Book: ${book.name}`,
                timeTaken: "0.00",
                nodesSearched: 0
            });
            return;
        } else {
            // Log details on why the book lookup failed
            if (openingBook.size === 0 && punishmentBook.size === 0) {
                 console.log("B\"H - Book Miss: Reason - Both opening books are empty.");
            } else {
                 console.log("B\"H - Book Miss: Position hash not found in book maps.", {
                    openingBookSize: openingBook.size,
                    punishmentBookSize: punishmentBook.size
                 });
            }
        }

        // If no book move, proceed with search
        const res = searchRoot(state, 99, e.data.maxTime || 4200);
        postMessage({
            type: 'move_result',
            bestMove: res.bestMove ? decodeMove(res.bestMove, state.turn) : null,
            score: res.score,
            timeTaken: (performance.now() - searchStartTime).toFixed(2),
            nodesSearched: nodeCount
        });

    } else if (command === 'analyze_pgn') {
        const converter = new PgnConverter();
        const moves = e.data.pgnText.replace(/\[.*?\]\s*|{.*?}|\d+\.\s*|\$\d+/g, '').replace(/\s+/g, ' ').trim().split(' ');
        const valid = [], hist = [converter.toFen()];
        for (const san of moves) {
            if (['1-0', '0-1', '1/2-1/2', '*'].includes(san)) continue;
            const m = converter.parseSan(san);
            if (m === null) { postMessage({ type: 'analysis_error', message: `Invalid PGN: ${san}` }); return; }
            const d = decodeMove(m, converter.currentState.turn);
            converter.applyMove(m); d.san = san; valid.push(d); hist.push(converter.toFen());
        }
        lastParsedGame = { moves: valid, boardHistory: hist, initialFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" };
        postMessage({ type: 'analysis_result', ...lastParsedGame });
    } else if (command === 'run_engine_analysis') {
        if (!lastParsedGame) return;
        const state = createGameState(lastParsedGame.initialFen);
        for (let i = 0; i < lastParsedGame.moves.length; i++) {
            const usrMove = lastParsedGame.moves[i], moves = generateMoves(state);
            const mInt = moves.find(m => getMoveFrom(m) === (usrMove.from[0]*8+usrMove.from[1]) && getMoveTo(m) === (usrMove.to[0]*8+usrMove.to[1]));
            if (!mInt) { makeMove(state, moves[0]); continue; }
            const res = searchRoot(state, 99, 2000);
            let cls = 'best';
            if (res.bestMove !== mInt) {
                const bestScore = res.score;
                makeMove(state, mInt);
                const usrScore = -searchRoot(state, 99, 2000).score;
                unmakeMove(state);
                const drop = bestScore - usrScore;
                if (drop > 220) cls = 'blunder'; else if (drop > 80) cls = 'mistake'; else if (drop > 35) cls = 'good';
            }
            postMessage({ type: 'analysis_update', index: i, result: { classification: cls, bestMove: decodeMove(res.bestMove, state.turn) } });
            makeMove(state, mInt);
        }
        postMessage({ type: 'analysis_finished' });
    }
};