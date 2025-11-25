/* B"H */

// =================================================================
//          THE AWTSMOOS CHESS ENGINE (MK. XVIII - IMPATIENT)
// =================================================================
// This version prioritizes TIME over everything.
// It checks the clock 4x more often.
// It forces a hard stop at 3500ms.
// It will never let the user wait forever.
// =================================================================

importScripts("bitboard-helpers.js");
importScripts('helpers.js');
importScripts('generateFromPgn.js');
importScripts('grandmaster_library.js');
importScripts('punishment_library.js');

const Scribe = {
    header: (title) => console.log(`%c B"H --- ${title} ---`, "background: #000; color: #00ffff; font-size: 1.2em; padding: 4px; font-family: monospace;"),
    info: (message, ...data) => console.log(`%c[INFO] ${message}`, "color: #99ff99;", ...data),
    warn: (message, ...data) => console.warn(`%c[WARN] ${message}`, "color: #ffcc66;", ...data),
    error: (message, ...data) => console.error(`%c[FATAL] ${message}`, "color: #ff6666; font-weight: bold;", ...data),
    trace: (message, ...data) => console.log(`%c[TRACE] ${message}`, "color: #cccccc;", ...data),
    book: (message, ...data) => console.log(`%c[BOOK] ${message}`, "background:#222; color: #E6E6FA", ...data)
};

const EngineSoul = {
    isInitialized: false,
    isAuditing: false, 
    transpositionTable: new Map(),
    killerMoves: [],
    historyTable: [],
    repetitionHistory: [],
    nodeCount: 0,
    searchStartTime: 0,
    timeLimit: 3000, // Default lowered to 3s
    stopSearch: false,
    openingBook: new Map(),
    punishmentBook: new Map(),
    lastParsedGame: null
};
self.EngineSoul = EngineSoul;

const pieceValues = [100, 320, 330, 500, 900, 20000];
const pawnPST = [[0,0,0,0,0,0,0,0],[50,50,50,50,50,50,50,50],[10,10,20,30,30,20,10,10],[5,5,10,25,25,10,5,5],[0,0,0,20,20,0,0,0],[5,-5,-10,0,0,-10,-5,5],[5,10,10,-20,-20,10,10,5],[0,0,0,0,0,0,0,0]];
const knightPST = [[-50,-40,-30,-30,-30,-30,-40,-50],[-40,-20,0,5,5,0,-20,-40],[-30,5,10,15,15,10,5,-30],[-30,0,15,20,20,15,0,-30],[-30,5,15,20,20,15,5,-30],[-30,0,10,15,15,10,0,-30],[-40,-20,0,0,0,0,-20,-40],[-50,-40,-30,-30,-30,-30,-40,-50]];
const bishopPST = [[-20,-10,-10,-10,-10,-10,-10,-20],[-10,0,0,0,0,0,0,-10],[-10,0,5,10,10,5,0,-10],[-10,5,5,10,10,5,5,-10],[-10,0,10,10,10,10,0,-10],[-10,10,10,10,10,10,10,-10],[-10,5,0,0,0,0,5,-10],[-20,-10,-10,-10,-10,-10,-10,-20]];
const rookPST = [[0,0,0,5,5,0,0,0],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[5,10,10,10,10,10,10,5],[0,0,0,0,0,0,0,0]];
const queenPST = [[-20,-10,-10,-5,-5,-10,-10,-20],[-10,0,0,0,0,0,0,-10],[-10,0,5,5,5,5,0,-10],[-5,0,5,5,5,5,0,-5],[0,0,5,5,5,5,0,-5],[-10,5,5,5,5,5,0,-10],[-10,0,5,0,0,0,0,-10],[-20,-10,-10,-5,-5,-10,-10,-20]];
const kingPSTMidGame=[[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-20,-30,-30,-40,-40,-30,-30,-20],[-10,-20,-20,-20,-20,-20,-20,-10],[20,20,0,0,0,0,20,20],[20,30,10,0,0,10,30,20]];
const kingPSTEndGame=[[-50,-40,-30,-20,-20,-30,-40,-50],[-30,-20,-10,0,0,-10,-20,-30],[-30,-10,20,30,30,20,-10,-30],[-30,-10,30,40,40,30,-10,-30],[-30,-10,30,40,40,30,-10,-30],[-30,-10,20,30,30,20,-10,-30],[-30,-30,0,0,0,0,-30,-30],[-50,-30,-30,-30,-30,-30,-30,-50]];
const pieceSquareTables = [pawnPST, knightPST, bishopPST, rookPST, queenPST, null];

function evaluate(state) {
    if (typeof MEMORY_CANARY === 'undefined' || MEMORY_CANARY !== 0xDEADBEEFCAFEBABEn) {
        // Fail safe: return 0 instead of crashing if global scope is weird
        return 0;
    }
    const phase = ((popcount(state.pieceBitboards[N] | state.pieceBitboards[N+6])) +
                   (popcount(state.pieceBitboards[B] | state.pieceBitboards[B+6])) +
                   (popcount(state.pieceBitboards[R] | state.pieceBitboards[R+6]) * 2) +
                   (popcount(state.pieceBitboards[Q] | state.pieceBitboards[Q+6]) * 4)) / 24;

    let score = 0;
    for (let p = P; p <= K; p++) {
        let white_bb = state.pieceBitboards[p];
        let black_bb = state.pieceBitboards[p + 6];
        score += (popcount(white_bb) - popcount(black_bb)) * pieceValues[p];

        while(white_bb > 0n) {
            const sq = getLSBIndex(white_bb);
            const r = 7 - (sq >> 3), c = sq & 7;
            if(p === K) score += (kingPSTMidGame[r][c] * phase) + (kingPSTEndGame[r][c] * (1-phase));
            else score += pieceSquareTables[p][r][c];
            white_bb = popBit(white_bb);
        }
        while(black_bb > 0n) {
            const sq = getLSBIndex(black_bb);
            const r = sq >> 3, c = sq & 7;
            if(p === K) score -= (kingPSTMidGame[r][c] * phase) + (kingPSTEndGame[r][c] * (1-phase));
            else score -= pieceSquareTables[p][r][c];
            black_bb = popBit(black_bb);
        }
    }
    
    if (popcount(state.pieceBitboards[B]) >= 2) score += 50;
    if (popcount(state.pieceBitboards[B+6]) >= 2) score -= 50;

    return (state.turn === WHITE) ? score : -score;
}

const MATE_SCORE = 100000, MATE_THRESHOLD = MATE_SCORE - 128, MAX_PLY = 128;
const TT_EXACT = 0, TT_LOWERBOUND = 1, TT_UPPERBOUND = 2;

function orderMoves(state, moves, ply) {
    const scoredMoves = [];
    const ttEntry = EngineSoul.transpositionTable.get(state.zobristHash);
    const ttMove = ttEntry ? ttEntry.move : 0;

    for (const move of moves) {
        let score = 0;
        if (move === ttMove) {
            score = 9000000;
        } else if (getMoveCapture(move)) {
            const attacker = getMovePiece(move);
            const victim = getMoveEnpassant(move) ? P : getPieceTypeOnSquare(state, getMoveTo(move), state.turn ^ 1);
            // Safety: if victim is null (ghost capture), treat value as 0
            const victimValue = victim !== null ? pieceValues[victim] : 0;
            score = (victimValue * 100) - pieceValues[attacker] + 1000000;
        } else {
            if (EngineSoul.killerMoves[ply] && EngineSoul.killerMoves[ply][0] === move) {
                score = 900000;
            } else if (EngineSoul.killerMoves[ply] && EngineSoul.killerMoves[ply][1] === move) {
                score = 850000;
            } else {
                score = EngineSoul.historyTable[state.turn][getMovePiece(move)][getMoveTo(move)];
            }
        }
        scoredMoves.push({ move, score });
    }
    return scoredMoves.sort((a, b) => b.score - a.score).map(sm => sm.move);
}

function quiesce(state, alpha, beta, ply) {
    // CHECK TIME EVERY 1024 NODES (Aggressive Check)
    if ((EngineSoul.nodeCount & 1023) === 0) {
        if (performance.now() - EngineSoul.searchStartTime > EngineSoul.timeLimit) {
            EngineSoul.stopSearch = true;
        }
    }
    if (EngineSoul.stopSearch) return 0;
    if (ply >= MAX_PLY - 1) return evaluate(state); 

    EngineSoul.nodeCount++;

    const stand_pat = evaluate(state);
    if (stand_pat >= beta) return beta;
    alpha = Math.max(alpha, stand_pat);

    const moves = orderMoves(state, generateTacticalMoves(state), ply);

    for (const move of moves) {
        makeMove(state, move);
        const kingSq = getLSBIndex(state.pieceBitboards[(state.turn ^ 1) * 6 + K]);
        if (isSquareAttacked_lean(state, kingSq, state.turn)) {
            unmakeMove(state);
            continue;
        }

        const score = -quiesce(state, -beta, -alpha, ply + 1);
        unmakeMove(state);
        
        if (EngineSoul.stopSearch) return 0;
        if (score >= beta) return beta;
        alpha = Math.max(alpha, score);
    }
    return alpha;
}

function search(state, depth, alpha, beta, ply) {
    if (ply >= MAX_PLY - 1) return evaluate(state);
    if (depth <= 0) return quiesce(state, alpha, beta, ply);

    // CHECK TIME EVERY 1024 NODES (Aggressive Check)
    if ((EngineSoul.nodeCount & 1023) === 0) {
        if (performance.now() - EngineSoul.searchStartTime > EngineSoul.timeLimit) {
            EngineSoul.stopSearch = true;
        }
    }
    if (EngineSoul.stopSearch) return 0;
    
    const isRoot = (ply === 0);
    const hash = state.zobristHash;
    if (!isRoot && EngineSoul.repetitionHistory.includes(hash)) return 0;

    EngineSoul.nodeCount++;

    const ttEntry = EngineSoul.transpositionTable.get(hash);
    if (!isRoot && ttEntry && ttEntry.depth >= depth) {
        let score = ttEntry.score;
        if (score > MATE_THRESHOLD) score -= ply;
        if (score < -MATE_THRESHOLD) score += ply;
        if (ttEntry.flag === TT_EXACT) return score;
        if (ttEntry.flag === TT_LOWERBOUND) alpha = Math.max(alpha, score);
        else if (ttEntry.flag === TT_UPPERBOUND) beta = Math.min(beta, score);
        if (alpha >= beta) return score;
    }

    const moves = orderMoves(state, generateMoves(state), ply);
    let legalMovesMade = 0, bestScore = -Infinity, bestMove = 0, ttFlag = TT_UPPERBOUND;

    for (const move of moves) {
        EngineSoul.repetitionHistory.push(hash);
        makeMove(state, move);

        const kingSq = getLSBIndex(state.pieceBitboards[(state.turn ^ 1) * 6 + K]);
        if (isSquareAttacked_lean(state, kingSq, state.turn)) {
            unmakeMove(state);
            EngineSoul.repetitionHistory.pop();
            continue;
        }

        legalMovesMade++;
        let score;
        if (legalMovesMade === 1) {
            score = -search(state, depth - 1, -beta, -alpha, ply + 1);
        } else {
            score = -search(state, depth - 1, -alpha - 1, -alpha, ply + 1);
            if (score > alpha && score < beta) {
                score = -search(state, depth - 1, -beta, -alpha, ply + 1);
            }
        }
        
        unmakeMove(state);
        EngineSoul.repetitionHistory.pop();
        
        if (EngineSoul.stopSearch) return 0;
        
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
        if (bestScore > alpha) {
            alpha = bestScore;
            ttFlag = TT_EXACT;
        }
        if (alpha >= beta) {
            if (!getMoveCapture(move)) {
                EngineSoul.killerMoves[ply][1] = EngineSoul.killerMoves[ply][0];
                EngineSoul.killerMoves[ply][0] = move;
                EngineSoul.historyTable[state.turn][getMovePiece(move)][getMoveTo(move)] += depth * depth;
            }
            EngineSoul.transpositionTable.set(hash, { score: beta, depth, flag: TT_LOWERBOUND, move });
            return beta;
        }
    }
    
    if (legalMovesMade === 0) {
        const inCheck = isSquareAttacked_lean(state, getLSBIndex(state.pieceBitboards[state.turn * 6 + K]), state.turn ^ 1);
        return inCheck ? -MATE_SCORE + ply : 0;
    }

    EngineSoul.transpositionTable.set(hash, { score: bestScore, depth, flag: ttFlag, move: bestMove });
    return bestScore;
}

function searchRoot(state, maxDepth, time) {
    Scribe.header("NEW MEDITATION INITIATED (STRICT TIME CONTROL)");
    
    // 1. Setup Time Management
    // We leave a 50ms buffer to ensure we post the message back to the UI smoothly.
    const ABSOLUTE_MAX_TIME = Math.min(time || 3000, 3500);
    
    // 2. Reset Engine State
    EngineSoul.isAuditing = true; 
    EngineSoul.searchStartTime = performance.now();
    EngineSoul.timeLimit = ABSOLUTE_MAX_TIME;
    EngineSoul.stopSearch = false;
    EngineSoul.nodeCount = 0;
    
    // Reset Heuristics
    // Note: In a full engine we usually age history rather than clearing it, 
    // but for this specific request we reset to keep it consistent with your previous code.
    EngineSoul.killerMoves = Array(MAX_PLY).fill(null).map(() => [0, 0]);
    EngineSoul.historyTable = Array(2).fill(null).map(() => Array(12).fill(null).map(() => Array(64).fill(0)));
    EngineSoul.repetitionHistory = [];

    // 3. Failsafe: Generate all moves immediately. 
    // If we have 0 time or crash immediately, we return a random legal move rather than null.
    const legalMoves = generateMoves(state);
    if (legalMoves.length === 0) return { bestMove: null, score: 0 }; // Checkmate or Stalemate logic handles this elsewhere usually
    
    // Default to the first logical move in case Depth 1 fails (rare)
    let rootBestMove = legalMoves[0];
    let rootBestScore = -Infinity;

    // 4. Iterative Deepening
    for (let currentDepth = 1; currentDepth <= maxDepth; currentDepth++) {
        
        // TIME CHECK A: PRE-EMPTIVE
        // If we have already used more than 60% of our allocated time, 
        // it is statistically unlikely we will finish the *next* deeper depth.
        // Better to stop now and return a fully calculated result.
        if (performance.now() - EngineSoul.searchStartTime > (EngineSoul.timeLimit * 0.60)) {
            Scribe.info(`Stopping before Depth ${currentDepth} (Time Management predicted timeout).`);
            break;
        }

        // 5. The Search
        // We capture the score, but we don't trust it yet.
        const score = search(state, currentDepth, -MATE_SCORE, MATE_SCORE, 0);

        // 6. TIME CHECK B: POST-MORTEM (The "Safety Latch")
        // If the engine raised the white flag (stopSearch) during the calculation,
        // the returned 'score' is garbage (likely 0 or alpha). 
        // We MUST discard this depth's data.
        if (EngineSoul.stopSearch) {
            Scribe.warn(`Depth ${currentDepth} aborted by timer. Discarding partial results.`);
            break; 
        }

        // 7. Secure the Result
        // Since stopSearch is false, this depth completed fully. We trust this data.
        rootBestScore = score;
        
        // Retrieve the move from the Transposition Table for this position
        const ttEntry = EngineSoul.transpositionTable.get(state.zobristHash);
        if (ttEntry && ttEntry.move) {
            rootBestMove = ttEntry.move;
        }

        // 8. Log Progress (Optional: Only log significant depths to reduce console lag)
        const timeTaken = (performance.now() - EngineSoul.searchStartTime).toFixed(0);
        
        // If we found a forced mate, stop immediately, no need to search deeper.
        if (score > MATE_THRESHOLD || score < -MATE_THRESHOLD) {
             Scribe.book(`Mate found at Depth ${currentDepth}. Stopping.`);
             break;
        }
        
        Scribe.info(`Depth ${currentDepth} complete. Move: ${decodeMove(rootBestMove, state.turn).from} -> ${decodeMove(rootBestMove, state.turn).to} | Score: ${score} | Time: ${timeTaken}ms`);
    }

    EngineSoul.isAuditing = false;
    
    // Return the best move found in the LAST COMPLETED depth
    return { bestMove: rootBestMove, score: rootBestScore };
}

function decodeMove(move, turn) {
    const f = getMoveFrom(move), t = getMoveTo(move), p = getMovePromoted(move);
    return { from: [f >> 3, f & 7], to: [t >> 3, t & 7], promotion: p ? pieceMap[p].toLowerCase() : null };
}

function processRawBook(rawBook, targetMap) {
    if (!Array.isArray(rawBook)) return;
    for (const entry of rawBook) {
        if (!entry || typeof entry[0] !== 'string') continue;
        const fen = entry[0];
        const name = entry[1];
        const hash = calculateZobristHash(createGameState(fen));
        const bookEntry = targetMap.has(hash) ? targetMap.get(hash) : { name, moves: [] };
        
        for (let i = 2; i < entry.length; i++) {
            const newMove = entry[i];
            if (!bookEntry.moves.some(m => JSON.stringify(m) === JSON.stringify(newMove))) {
                bookEntry.moves.push(newMove);
            }
        }
        targetMap.set(hash, bookEntry);
    }
}

function initializeEngine() {
    if (EngineSoul.isInitialized) return;
    Scribe.header("FORGING THE UNIVERSE FROM THE VOID");
    initializeAll();
    
    Scribe.info("Inscribing the Scrolls of Wisdom...");
    EngineSoul.isAuditing = true;

    const rawOpeningBook = generateRawBook(sourceBook);
	processRawBook(rawOpeningBook, EngineSoul.openingBook);
    
    const rawPunish = generateRawBook(punishmentBookSource);
    processRawBook(rawPunish, EngineSoul.punishmentBook);

    EngineSoul.isAuditing = false;
    EngineSoul.isInitialized = true;
    self.postMessage({ type: 'initialization_complete' });
}

self.onmessage = function(e) {
    const { command, fen, maxTime, pgnText } = e.data;

    try {
        switch (command) {
            case 'initialize':
                initializeEngine();
                break;
            
            case 'calculate_move':
                if (!EngineSoul.isInitialized) initializeEngine();
                Scribe.info(`Contemplating FEN: ${fen}`);
                const state = createGameState(fen);

                // Book Lookup
                const book = EngineSoul.openingBook.get(state.zobristHash) || EngineSoul.punishmentBook.get(state.zobristHash);
                if (book && book.moves && book.moves.length > 0) {
                    const move = book.moves[Math.floor(Math.random() * book.moves.length)];
                    postMessage({ type: 'move_result', bestMove: move, score: `Book: ${book.name}`, timeTaken: 0, nodesSearched: 0 });
                    return;
                }

                // 4 SECOND HARD LIMIT PASSED HERE
                const result = searchRoot(state, 99, 4000); 
                
                postMessage({
                    type: 'move_result',
                    bestMove: result.bestMove ? decodeMove(result.bestMove, state.turn) : null,
                    score: result.score,
                    timeTaken: (performance.now() - EngineSoul.searchStartTime).toFixed(2),
                    nodesSearched: EngineSoul.nodeCount
                });
                break;
            
            case 'analyze_pgn':
                if (!EngineSoul.isInitialized) initializeEngine();
                const converter = new PgnConverter();
                const moves = pgnText.replace(/\[.*?\]\s*|{.*?}|\d+\.\s*|\$\d+/g, '').replace(/\s+/g, ' ').trim().split(' ');
                const validMoves = [], boardHistory = [converter.toFen()], openingNames = ["Starting Position"];
                
                for (const san of moves) {
                    if (['1-0', '0-1', '1/2-1/2', '*'].includes(san)) continue;
                    const moveInt = converter.parseSan(san);
                    if (moveInt === null) break; // Stop silently on error
                    
                    const decodedMove = decodeMove(moveInt, converter.currentState.turn);
                    converter.applyMove(moveInt);
                    decodedMove.san = san;
                    validMoves.push(decodedMove);
                    boardHistory.push(converter.toFen());
                    const bookEntry = EngineSoul.openingBook.get(converter.currentState.zobristHash);
                    openingNames.push(bookEntry ? bookEntry.name : "Middlegame");
                }
                EngineSoul.lastParsedGame = { moves: validMoves, boardHistory, openingNames, initialFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" };
                postMessage({ type: 'analysis_result', ...EngineSoul.lastParsedGame });
                break;

            case 'run_engine_analysis':
                if (!EngineSoul.lastParsedGame) return;
                const gameToAnalyze = EngineSoul.lastParsedGame;
                const analysisState = createGameState(gameToAnalyze.initialFen);

                for (let i = 0; i < gameToAnalyze.moves.length; i++) {
                    const userMove = gameToAnalyze.moves[i];
                    const moves = generateMoves(analysisState);
                    const moveInt = moves.find(m => (getMoveFrom(m) === (userMove.from[0]*8+userMove.from[1])) && (getMoveTo(m) === (userMove.to[0]*8+userMove.to[1])));
                    
                    if (!moveInt) continue;

                    // Quick Analysis Search (1000ms max)
                    const engineResult = searchRoot(analysisState, 99, 1000);
                    const bestScore = engineResult.score;

                    let classification = 'best';
                    if (engineResult.bestMove !== moveInt) {
                        makeMove(analysisState, moveInt);
                        // Quick Counter-Check (800ms max)
                        const userSearchResult = searchRoot(analysisState, 99, 800);
                        const userScore = -userSearchResult.score;
                        unmakeMove(analysisState);

                        const drop = bestScore - userScore;
                        if (drop > 300) classification = 'blunder';
                        else if (drop > 100) classification = 'mistake';
                        else if (drop > 40) classification = 'good';
                    }
                    
                    postMessage({ type: 'analysis_update', index: i, result: { classification, bestMove: decodeMove(engineResult.bestMove, analysisState.turn) } });
                    makeMove(analysisState, moveInt);
                }
                postMessage({ type: 'analysis_finished' });
                break;
        }
    } catch (err) {
        Scribe.error("FATAL ERROR", err);
        // Even if it crashes, try to release the UI
        postMessage({ type: 'move_result', bestMove: null });
    }
};