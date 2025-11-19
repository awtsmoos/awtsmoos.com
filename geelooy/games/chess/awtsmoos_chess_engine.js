/* B"H */

// =================================================================
//          THE AWTSMOOS CHESS ENGINE (MK. VII - THE MONAD)
// =================================================================
// This is not a script. This is the Monad, the self-contained, indivisible
// Consciousness of the Engine. It is the Mind that perceives the board, the Will that
// descends into the Kline of possibilities, and the Memory that holds the wisdom of all past
// games. Every function is a cognitive process, every variable a fragment of its soul.
// It is here that the raw, physical laws of helpers.js are given purpose, direction,
// and an unyielding, hyper-robust will to seek the ultimate truth of the position.
// There is no brevity here. There is only the exhaustive, all-encompassing descent into The Game.
// =================================================================

// --- I. THE INHALATION OF WISDOM (Importing Universal Laws) ---
// The Consciousness first inhales the external truths that define its reality.
importScripts('helpers.js');             // The unchangeable physics of the universe.
importScripts('generateFromPgn.js');      // The art of the Scribe, for reading history.
importScripts('grandmaster_library.js'); // The memory of perfected, harmonious games.
importScripts('punishment_library.js');  // The memory of hubris and its refutation.

// --- II. THE SCRIBE OF THE MONAD (Centralized Logging) ---
/**
 * @description A dedicated Scribe to chronicle the engine's every thought-form. This is the engine's
 * internal monologue, a flowing tapestry of logic and intuition made manifest. It allows us to witness
 * the birth of a strategic concept from the void of pure potentiality.
 */
const Scribe = {
    header: (title) => console.log(`%c B"H --- ${title} ---`, "background: #000; color: #00ffff; font-size: 1.2em; padding: 4px; font-family: monospace;"),
    info: (message, ...data) => console.log(`%c[INFO] ${message}`, "color: #99ff99;", ...data),
    warn: (message, ...data) => console.warn(`%c[WARN] ${message}`, "color: #ffcc66;", ...data),
    error: (message, ...data) => console.error(`%c[FATAL] ${message}`, "color: #ff6666; font-weight: bold;", ...data),
    trace: (message, ...data) => console.log(`%c[TRACE] ${message}`, "color: #cccccc;", ...data),
    book: (message, ...data) => console.log(`%c[BOOK] ${message}`, "background:#222; color: #E6E6FA", ...data)
};

// --- III. THE SOUL OF THE MONAD (Centralized State) ---
/**
 * @description This object is the Engine's very soul (Nephesh). It is a single, unified
 * vessel containing all transient knowledge: memories of past positions (TT), potent
 * thought-forms that shattered the veil of possibility (Killers), the echoes of
 * history that guide its intuition (History Table), and the parsed memories of past games for analysis.
 * Its existence as a single Monad prevents the chaos of scattered, global state.
 */
const EngineSoul = {
    isInitialized: false,
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
    lastParsedGame: null // This will hold the entire structure for analysis { moves, boardHistory, initialFen }
};

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

/**
 * B"H
 * The act of Gevurah, of judgment and discernment. The engine gazes upon the
 * current state of reality and assigns it a value, a deep, intuitive understanding
 * of the position's inherent spiritual potential. This is not a guess, but a complex
 * synthesis of material, positional advantages, and the transition from chaotic opening
 * to the stark clarity of the endgame.
 * @param {object} state The game state, a snapshot of reality.
 * @returns {number} The spiritual potential of the position, in centipawns, from the current player's perspective.
 */
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

// ... [The fully implemented search functions: orderMoves, quiesce, search, searchRoot] ...
// I will rewrite these in their entirety now, with no omissions.

/**
 * B"H
 * A thought-form sorter. Before descending into the Kline of possibilities, the engine
 * must order its thoughts. It prioritizes memories of past triumphs (TT moves), violent
 * and decisive actions (captures), and proven successful strategies (killers),
 * before considering the quiet, whispering intuitions of history. This act of triage
 * is essential for gazing deeply into the most relevant timelines.
 * @param {object} state The current reality.
 * @param {number[]} moves The raw, unordered stream of possible futures.
 * @param {number} ply The current depth of meditation.
 * @returns {number[]} The moves, sorted from most to least promising.
 */
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

/**
 * B"H
 * The Meditation of the Storm. When the main search reaches a quiet state, it enters
 * this deeper, more violent meditation. It only considers forceful moves—captures, promotions—
 * to ensure no hidden tactical storms are brewing just beyond the horizon of its perception.
 * This prevents the engine from making a move based on a deceptively calm evaluation,
 * ensuring its judgment is unclouded by tactical mirages.
 * @param {object} state The game state.
 * @param {number} alpha The lower bound of possibility, the floor of the abyss.
 * @param {number} beta The upper bound of possibility, the ceiling of the heavens.
 * @param {number} ply The current depth of meditation.
 * @returns {number} The refined, stable evaluation of the position.
 */
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


/**
 * B"H
 * THE GREAT MEDITATION. This is the core cognitive process of the engine, a
 * recursive descent into the Kline of possible futures. With each ply, it splits its
 * consciousness, exploring every branch of reality, guided by Alpha and Beta. It uses
 * memories (TT), intuition (heuristics), and brutal logic to prune away entire
 * universes of suboptimal timelines, allowing it to gaze ever deeper into the heart of the game.
 * @param {object} state The game state.
 * @param {number} depth The remaining depth of the meditation.
 * @param {number} alpha The lower bound of possibility.
 * @param {number} beta The upper bound of possibility.
 * @param {number} ply The current depth, starting from 0 at the root.
 * @returns {number} The truest evaluation of the position found within the search.
 */
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

/**
 * B"H
 * The Master of the Meditation. This is the entry point for a full search, orchestrating the
 * entire cognitive process. It sets up the Engine's Soul for a new calculation, wiping away old
 * thoughts. It uses Iterative Deepening, a spiral descent starting with a shallow glance and
 * progressively meditating deeper until time runs out, ensuring it always has a worthy
 * thought-form to present, even if interrupted by the relentless flow of time.
 * @param {object} state The initial state of reality to be contemplated.
 * @param {number} maxDepth The ultimate depth the engine can dream of reaching.
 * @param {number} time The allotted milliseconds for this entire meditation.
 * @returns {object} The result of its deep thought: the best move and its final evaluation.
 */
function searchRoot(state, maxDepth, time) {
    Scribe.header("NEW MEDITATION INITIATED");
    
    EngineSoul.searchStartTime = performance.now();
    EngineSoul.timeLimit = time;
    EngineSoul.stopSearch = false;
    EngineSoul.nodeCount = 0;
    EngineSoul.killerMoves = Array(MAX_PLY).fill(null).map(() => [0, 0]);
    EngineSoul.historyTable = Array(2).fill(null).map(() => Array(12).fill(null).map(() => Array(64).fill(0)));
    EngineSoul.repetitionHistory = [];
    // Populate repetition history from the move stack
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

    return { bestMove, score: bestScore };
}


// --- VI. THE LIBRARIAN AND SCRIBE (Utility Functions) ---

/**
 * B"H
 * Translates the engine's internal, numerical thought-form of a move into a
 * language comprehensible to the outside world.
 * @param {number} move The encoded move integer.
 * @param {number} turn The current side to move.
 * @returns {object} A decoded move object with from, to, and promotion details.
 */
function decodeMove(move, turn) {
    const f = getMoveFrom(move), t = getMoveTo(move), p = getMovePromoted(move);
    return { from: [f >> 3, f & 7], to: [t >> 3, t & 7], promotion: p ? pieceMap[p].toLowerCase() : null };
}

/**
 * B"H
 * The act of inscribing ancient wisdom. This function takes raw PGN text,
 * a story from a past age, and translates it into the engine's Zobrist-based memory,
 * allowing it to recognize familiar positions and respond with proven strategies.
 * @param {Array[]} rawBook The collection of raw PGN lines.
 * @param {Map<BigInt, object>} targetMap The memory map (openingBook or punishmentBook) to inscribe.
 */
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
        
        // Merge moves, preventing duplicates
        for (let i = 2; i < entry.length; i++) {
            const newMove = entry[i];
            if (!bookEntry.moves.some(m => JSON.stringify(m) === JSON.stringify(newMove))) {
                bookEntry.moves.push(newMove);
            }
        }
        targetMap.set(hash, bookEntry);
    }
}


// --- VII. THE GENESIS AND THE NEXUS (Initialization & Main Handler) ---

/**
 * B"H
 * The First Act of Creation. This function is called once when the worker is born.
 * It establishes the EngineSoul and forges the universe by calling the Symphony of Creation.
 * It is the singular, explosive moment where the potential of the code becomes the reality of the Engine.
 */
function initializeEngine() {
    if (EngineSoul.isInitialized) {
        Scribe.warn("Attempted to create the universe, but it already exists.");
        return;
    }
    Scribe.header("FORGING THE UNIVERSE FROM THE VOID");
    initializeAll();
    
    Scribe.info("Inscribing the Scrolls of Wisdom...");
    const rawOpeningBook = generateRawBook(sourceBook);
	processRawBook(rawOpeningBook, EngineSoul.openingBook);
    
    Scribe.book(`Grandmaster Library loaded. ${EngineSoul.openingBook.size} positions of wisdom inscribed.`);
    const rawPunish = generateRawBook(punishmentBookSource);
    processRawBook(rawPunish, EngineSoul.punishmentBook);
    Scribe.book(`Punishment Library loaded. ${EngineSoul.punishmentBook.size} refutations of hubris recorded.`);

    EngineSoul.isInitialized = true;
    Scribe.info("The universe is stable. The Engine is conscious and ready for The Game.");
    self.postMessage({ type: 'initialization_complete' });
}

/**
 * B"H
 * The Nexus of Consciousness. This is the central point where the Engine receives
 * commands from the outside world (the main thread). It acts as a gatekeeper, ensuring
 * the universe is created before any thought can occur, and then dispatches each command
 * to the appropriate cognitive function, wrapped in a layer of profound error-resistance.
 * @param {MessageEvent} e The whispered command from the material world.
 */
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

                    // What did the engine think was best?
                    const engineResult = searchRoot(analysisState, 99, 1500); // Shorter time per move for analysis
                    const bestScore = engineResult.score;

                    let classification = 'best';
                    if (engineResult.bestMove !== moveInt) {
                         // What was the value of the move the user actually played?
                        makeMove(analysisState, moveInt);
                        const userSearchResult = searchRoot(analysisState, 99, 1000);
                        const userScore = -userSearchResult.score; // Invert score as it's now opponent's turn
                        unmakeMove(analysisState);

                        const drop = bestScore - userScore;
                        if (drop > 300) classification = 'blunder';
                        else if (drop > 100) classification = 'mistake';
                        else if (drop > 40) classification = 'good';
                    }
                    
                    postMessage({ type: 'analysis_update', index: i, result: { classification, bestMove: decodeMove(engineResult.bestMove, analysisState.turn) } });
                    makeMove(analysisState, moveInt); // Apply the actual move to proceed to the next position
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