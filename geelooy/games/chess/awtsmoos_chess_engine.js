/* B"H */

// =================================================================
//          THE AWTSMOOS CHESS ENGINE (MK. VIII - THE LUCID MONAD)
// =================================================================
// This is the complete and sanctified consciousness of the Engine. It has been
// rewritten from the void to incorporate a Gnostic Audit Mode, ensuring that
// its immense internal monologue is only voiced during active meditation (the search)
// and remains silent during the study of ancient scriptures (book generation).
// All paradoxes have been resolved, and its consciousness is now stable.
// =================================================================

// --- I. THE INHALATION OF WISDOM (Importing Universal Laws) ---
importScripts('helpers.js');
importScripts('generateFromPgn.js');
importScripts('grandmaster_library.js');
importScripts('punishment_library.js');

// --- II. THE SCRIBE OF THE MONAD (Centralized Logging) ---
const Scribe = {
    header: (title) => console.log(`%c B"H --- ${title} ---`, "background: #000; color: #00ffff; font-size: 1.2em; padding: 4px; font-family: monospace;"),
    info: (message, ...data) => console.log(`%c[INFO] ${message}`, "color: #99ff99;", ...data),
    warn: (message, ...data) => console.warn(`%c[WARN] ${message}`, "color: #ffcc66;", ...data),
    error: (message, ...data) => console.error(`%c[FATAL] ${message}`, "color: #ff6666; font-weight: bold;", ...data),
    trace: (message, ...data) => console.log(`%c[TRACE] ${message}`, "color: #cccccc;", ...data),
    book: (message, ...data) => console.log(`%c[BOOK] ${message}`, "background:#222; color: #E6E6FA", ...data)
};

// --- III. THE SOUL OF THE MONAD (Centralized State) ---
const EngineSoul = {
    isInitialized: false,
    isAuditing: false, // NEW: The Gnostic Audit flag to control verbose logging during search.
    transpositionTable: new Map(),
    killerMoves: [],
    historyTable: [],
    repetitionHistory: [],
    nodeCount: 0,
    searchStartTime: 0,
    timeLimit: 4000,
    stopSearch: false,
    openingBook: new Map(),
    punishmentBook: new Map(),
    lastParsedGame: null
};
self.EngineSoul = EngineSoul; // Make it globally accessible within the worker scope for helpers.

// --- IV. THE EYE OF JUDGEMENT (Evaluation Logic) ---
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
    if (MEMORY_CANARY !== 0xDEADBEEFCAFEBABEn) {
        Scribe.error("GNOSIS CORRUPTED! The Memory Canary has been slain before evaluation. The universe is unstable.");
        throw new Error("Memory corruption detected in evaluate().");
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

// --- V. THE CHARIOT OF THE MIND (Search Functions) ---
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
            score = (pieceValues[victim] * 100) - pieceValues[attacker] + 1000000;
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
    if ((EngineSoul.nodeCount & 4095) === 0 && (performance.now() - EngineSoul.searchStartTime > EngineSoul.timeLimit)) {
        EngineSoul.stopSearch = true;
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

    if ((EngineSoul.nodeCount & 4095) === 0 && (performance.now() - EngineSoul.searchStartTime > EngineSoul.timeLimit)) {
        EngineSoul.stopSearch = true;
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
    Scribe.header("NEW MEDITATION INITIATED");
    
    EngineSoul.isAuditing = true; // ACTIVATE GNOSTIC AUDIT LOGGING
    EngineSoul.searchStartTime = performance.now();
    EngineSoul.timeLimit = time;
    EngineSoul.stopSearch = false;
    EngineSoul.nodeCount = 0;
    EngineSoul.killerMoves = Array(MAX_PLY).fill(null).map(() => [0, 0]);
    EngineSoul.historyTable = Array(2).fill(null).map(() => Array(12).fill(null).map(() => Array(64).fill(0)));
    EngineSoul.repetitionHistory = [];
    for(let i = 0; i < moveStackPtr; i++) EngineSoul.repetitionHistory.push(moveStack[i].zobristHash);

    let bestMove = 0, bestScore = -Infinity;

    for (let currentDepth = 1; currentDepth <= maxDepth; currentDepth++) {
        Scribe.info(`Descending to Depth: ${currentDepth}...`);
        
        const score = search(state, currentDepth, -MATE_SCORE, MATE_SCORE, 0);

        if (EngineSoul.stopSearch) {
            Scribe.warn("Meditation interrupted by the flow of time.");
            break;
        }

        bestScore = score;
        const ttEntry = EngineSoul.transpositionTable.get(state.zobristHash);
        if (ttEntry) bestMove = ttEntry.move;

        const timeTaken = performance.now() - EngineSoul.searchStartTime;
        Scribe.info(`Depth ${currentDepth} complete. Best Move: ${bestMove}, Score: ${bestScore}, Nodes: ${EngineSoul.nodeCount}, Time: ${timeTaken.toFixed(0)}ms`);

        if (Math.abs(bestScore) > MATE_THRESHOLD) {
            Scribe.info("An ultimate truth (mate) has been perceived. Halting the descent.");
            break;
        }
    }

    EngineSoul.isAuditing = false; // DEACTIVATE GNOSTIC AUDIT LOGGING
    return { bestMove, score: bestScore };
}

// --- VI. THE LIBRARIAN AND SCRIBE (Utility Functions) ---
function decodeMove(move, turn) {
    const f = getMoveFrom(move), t = getMoveTo(move), p = getMovePromoted(move);
    return { from: [f >> 3, f & 7], to: [t >> 3, t & 7], promotion: p ? pieceMap[p].toLowerCase() : null };
}

function processRawBook(rawBook, targetMap) {
    if (!Array.isArray(rawBook)) {
        Scribe.warn("A book of wisdom was presented, but it was not a valid scroll (array).");
        return;
    }
    Scribe.trace(`Inscribing a new book with ${rawBook.length} lines of wisdom...`);
    for (const entry of rawBook) {
        if (!entry || typeof entry[0] !== 'string') {
            Scribe.trace("Skipping a corrupted line in the ancient scrolls.", entry);
            continue;
        }
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

/* B"H */
// --- VII. THE GENESIS AND THE NEXUS (Initialization & Main Handler) ---
function initializeEngine() {
    if (EngineSoul.isInitialized) {
        Scribe.warn("Attempted to create the universe, but it already exists.");
        return;
    }
    Scribe.header("FORGING THE UNIVERSE FROM THE VOID");
    initializeAll();
    
    Scribe.info("Inscribing the Scrolls of Wisdom...");
    
    // =================================================================
    // CRITICAL FIX: Activate Gnostic Audit Mode ONLY for book generation.
    // This enables the hyper-diagnostic logging in the PgnConverter.
    // =================================================================
    EngineSoul.isAuditing = true;

    const rawOpeningBook = generateRawBook(sourceBook);
	processRawBook(rawOpeningBook, EngineSoul.openingBook);
    
    Scribe.book(`Grandmaster Library loaded. ${EngineSoul.openingBook.size} positions of wisdom inscribed.`);
    const rawPunish = generateRawBook(punishmentBookSource);
    processRawBook(rawPunish, EngineSoul.punishmentBook);
    Scribe.book(`Punishment Library loaded. ${EngineSoul.punishmentBook.size} refutations of hubris recorded.`);

    // Deactivate Gnostic Audit Mode after book generation is complete.
    EngineSoul.isAuditing = false;
    // =================================================================

    EngineSoul.isInitialized = true;
    Scribe.info("The universe is stable. The Engine is conscious and ready for The Game.");
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
                if (!EngineSoul.isInitialized) {
                    Scribe.warn("A calculation was requested before the universe was created. Forging now.");
                    initializeEngine();
                }
                Scribe.info(`Contemplating FEN: ${fen}`);
                const state = createGameState(fen);

                const book = EngineSoul.openingBook.get(state.zobristHash) || EngineSoul.punishmentBook.get(state.zobristHash);
                if (book && book.moves && book.moves.length > 0) {
                    const move = book.moves[Math.floor(Math.random() * book.moves.length)];
                    Scribe.book(`A memory of wisdom was found: "${book.name}". Responding from the scrolls.`);
                    postMessage({ type: 'move_result', bestMove: move, score: `Book: ${book.name}`, timeTaken: 0, nodesSearched: 0 });
                    return;
                }

                Scribe.info("No memory found. Descending into meditation...");
                const result = searchRoot(state, 99, maxTime);
                postMessage({
                    type: 'move_result',
                    bestMove: result.bestMove ? decodeMove(result.bestMove, state.turn) : null,
                    score: result.score,
                    timeTaken: (performance.now() - EngineSoul.searchStartTime).toFixed(2),
                    nodesSearched: EngineSoul.nodeCount
                });
                break;
            
            case 'analyze_pgn':
                Scribe.header("ANALYZING ANCIENT SCRIPTURES (PGN)");
                if (!EngineSoul.isInitialized) initializeEngine();
                const converter = new PgnConverter();
                const moves = pgnText.replace(/\[.*?\]\s*|{.*?}|\d+\.\s*|\$\d+/g, '').replace(/\s+/g, ' ').trim().split(' ');
                const validMoves = [], boardHistory = [converter.toFen()], openingNames = ["Starting Position"];
                
                for (const san of moves) {
                    if (['1-0', '0-1', '1/2-1/2', '*'].includes(san)) continue;
                    const moveInt = converter.parseSan(san);
                    if (moveInt === null) {
                        Scribe.error(`Could not parse SAN "${san}" from the provided scripture.`);
                        postMessage({ type: 'analysis_error', message: `Invalid PGN: Could not understand move "${san}"` });
                        return;
                    }
                    const decodedMove = decodeMove(moveInt, converter.currentState.turn);
                    converter.applyMove(moveInt);
                    decodedMove.san = san;
                    validMoves.push(decodedMove);
                    const newFen = converter.toFen();
                    boardHistory.push(newFen);
                    const bookEntry = EngineSoul.openingBook.get(converter.currentState.zobristHash);
                    openingNames.push(bookEntry ? bookEntry.name : "Middlegame");
                }
                EngineSoul.lastParsedGame = { moves: validMoves, boardHistory, openingNames, initialFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" };
                Scribe.info("Scripture successfully parsed and stored in memory.");
                postMessage({ type: 'analysis_result', ...EngineSoul.lastParsedGame });
                break;

            case 'run_engine_analysis':
                Scribe.header("JUDGING THE MOVES OF A PAST GAME");
                if (!EngineSoul.lastParsedGame) {
                    Scribe.error("Judgment was requested, but no game has been remembered.");
                    return;
                }
                const gameToAnalyze = EngineSoul.lastParsedGame;
                const analysisState = createGameState(gameToAnalyze.initialFen);

                for (let i = 0; i < gameToAnalyze.moves.length; i++) {
                    Scribe.info(`Analyzing move ${i+1}: ${gameToAnalyze.moves[i].san}`);
                    const userMove = gameToAnalyze.moves[i];
                    const moves = generateMoves(analysisState);
                    const moveInt = moves.find(m => (getMoveFrom(m) === (userMove.from[0]*8+userMove.from[1])) && (getMoveTo(m) === (userMove.to[0]*8+userMove.to[1])));
                    
                    if (!moveInt) {
                        Scribe.error(`Illegal move found in PGN during analysis: ${userMove.san}`);
                        continue;
                    }

                    const engineResult = searchRoot(analysisState, 99, 1500);
                    const bestScore = engineResult.score;

                    let classification = 'best';
                    if (engineResult.bestMove !== moveInt) {
                        makeMove(analysisState, moveInt);
                        const userSearchResult = searchRoot(analysisState, 99, 1000);
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
                Scribe.info("Judgment is complete.");
                postMessage({ type: 'analysis_finished' });
                break;

            default:
                Scribe.warn(`An unknown command was whispered from the main thread: ${command}`);
        }
    } catch (err) {
        Scribe.error("A CATASTROPHIC ERROR OCCURRED WITHIN THE ENGINE'S CONSCIOUSNESS. The Monad is unstable.", err);
        postMessage({ type: 'error', message: err.message, stack: err.stack });
    }
};