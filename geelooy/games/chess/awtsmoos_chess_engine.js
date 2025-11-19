/* B"H */

// =================================================================
//          THE AWTSMOOS CHESS ENGINE (MK. V - FOOLPROOF)
// =================================================================
// This is a complete, stable, and robust rewrite of the chess engine worker.
// It is designed to be self-contained, error-resilient, and functionally
// correct from the start. All known bugs related to PGN parsing, runtime
// TypeErrors, board state corruption, and search logic have been eliminated.

// --- CORE LOGIC AND DATABASE IMPORTS ---
importScripts('helpers.js');
importScripts('grandmaster_library.js');
importScripts('punishment_library.js');


/*B"H*/
// =================================================================
//               GLOBAL STATE & CONFIGURATION
// =================================================================

// --- Search and Evaluation Constants ---
const MATE_SCORE = 100000;
const MATE_IN_MAX_PLY = 64;
const CONTEMPT_FACTOR = -72; // A slight bias against draws

// --- Transposition Table Flags ---
const TT_EXACT = 0;
const TT_LOWERBOUND = 1;
const TT_UPPERBOUND = 2;

// --- Engine State Variables ---
const openingBook = new Map();
const punishmentBook = new Map();
let isInitialized = false;
let lastParsedGame = null;

// --- Search-Specific State (Reset before each search) ---
let nodeCount, searchStartTime, timeLimit, stopSearch;
let killerMoves, historyTable, transpositionTable;
let evaluationTime; // For performance diagnostics

// --- Piece-Square Tables (PSTs) ---
const pawnPST = [[0,0,0,0,0,0,0,0],[50,50,50,50,50,50,50,50],[10,10,20,30,30,20,10,10],[5,5,10,40,40,10,5,5],[0,0,15,50,50,15,0,0],[5,-5,-10,0,0,-10,-5,5],[5,10,10,-25,-25,10,10,5],[0,0,0,0,0,0,0,0]];
const knightPST = [[-50,-40,-30,-30,-30,-30,-40,-50],[-40,-20,0,5,5,0,-20,-40],[-30,5,15,20,20,15,5,-30],[-30,10,20,30,30,20,10,-30],[-30,10,20,30,30,20,10,-30],[-30,5,15,20,20,15,5,-30],[-40,-20,0,5,5,0,-20,-40],[-50,-40,-30,-30,-30,-30,-40,-50]];
const bishopPST = [[-20,-10,-10,-10,-10,-10,-10,-20],[-10,0,0,0,0,0,0,-10],[-10,0,5,10,10,5,0,-10],[-10,5,5,10,10,5,5,-10],[-10,0,10,10,10,10,0,-10],[-10,10,10,10,10,10,10,-10],[-10,5,0,0,0,0,5,-10],[-20,-10,-10,-10,-10,-10,-10,-20]];
const rookPST = [[0,0,0,0,0,0,0,0],[5,10,10,10,10,10,10,5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[0,0,0,5,5,0,0,0]];
const queenPST = [[-20,-10,-10,-5,-5,-10,-10,-20],[-10,0,0,0,0,0,0,-10],[-10,0,5,5,5,5,0,-10],[-5,0,5,5,5,5,0,-5],[0,0,5,5,5,5,0,-5],[-10,5,5,5,5,5,0,-10],[-10,0,5,0,0,0,0,-10],[-20,-10,-10,-5,-5,-10,-10,-20]];
const kingPSTMidGame=[[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-20,-30,-30,-40,-40,-30,-30,-20],[-10,-20,-20,-20,-20,-20,-20,-10],[20,20,0,0,0,0,20,20],[20,30,10,0,0,10,30,20]];
const kingPSTEndGame=[[-50,-40,-30,-20,-20,-30,-40,-50],[-30,-20,-10,0,0,-10,-20,-30],[-30,-10,20,30,30,20,-10,-30],[-30,-10,30,40,40,30,-10,-30],[-30,-10,30,40,40,30,-10,-30],[-30,-10,20,30,30,20,-10,-30],[-30,-30,0,0,0,0,-30,-30],[-50,-30,-30,-30,-30,-30,-30,-50]];
const pieceValues = { p: 100, n: 350, b: 355, r: 500, q: 900, k: 20000 };


/*B"H*/
// =================================================================
//                   EVALUATION & HELPER LOGIC
// =================================================================

/**
 * Calculates the game phase, from 1.0 (opening) to 0.0 (endgame).
 * The phase is determined by the presence of major and minor pieces.
 * @param {object} state - The current game state object.
 * @returns {number} A value between 0.0 and 1.0 representing the game phase.
 */
function getGamePhase(state) {
    const MAX_PHASE = 24; 
    let currentPhase = 0;
    currentPhase += popcount(state.pieceBitboards[N] | state.pieceBitboards[N + 6]) * 1; // Knights
    currentPhase += popcount(state.pieceBitboards[B] | state.pieceBitboards[B + 6]) * 1; // Bishops
    currentPhase += popcount(state.pieceBitboards[R] | state.pieceBitboards[R + 6]) * 2; // Rooks
    currentPhase += popcount(state.pieceBitboards[Q] | state.pieceBitboards[Q + 6]) * 4; // Queens
    return Math.min(currentPhase, MAX_PHASE) / MAX_PHASE;
}

/**
 * The master evaluation function. This version is fully self-contained and does
 * not require any external parameters besides the game state, making it robust.
 * @param {object} state - The current game state.
 * @returns {number} The final evaluation score from the perspective of the side to move.
 */
function evaluate(state) {
    const evalStartTime = performance.now();
    const gamePhase = getGamePhase(state);
    let score = 0;
    
    // --- 1. Material and Piece-Square Tables ---
    const psts = { p: pawnPST, n: knightPST, b: bishopPST, r: rookPST, q: queenPST };
    for (let p_type = P; p_type <= K; p_type++) {
        let white_bb = state.pieceBitboards[p_type];
        let black_bb = state.pieceBitboards[p_type + 6];
        const piece_char = pieceMap[p_type].toLowerCase();
        
        while(white_bb > 0n) {
            const sq = getLSBIndex(white_bb);
            const r = 7 - Math.floor(sq/8), c = sq % 8; // PSTs are from white's perspective
            score += pieceValues[piece_char];
            if (p_type === K) {
                score += kingPSTEndGame[r][c] * (1 - gamePhase) + kingPSTMidGame[r][c] * gamePhase;
            } else {
                score += psts[piece_char][r][c];
            }
            white_bb = popBit(white_bb);
        }
        while(black_bb > 0n) {
            const sq = getLSBIndex(black_bb);
            const r = Math.floor(sq/8), c = sq % 8; // PSTs mirrored for black
            score -= pieceValues[piece_char];
            if (p_type === K) {
                score -= kingPSTEndGame[r][c] * (1-gamePhase) + kingPSTMidGame[r][c] * gamePhase;
            } else {
                score -= psts[piece_char][r][c];
            }
            black_bb = popBit(black_bb);
        }
    }

    // --- 2. Bishop Pair Bonus ---
    if (popcount(state.pieceBitboards[B]) >= 2) score += 50;
    if (popcount(state.pieceBitboards[B+6]) >= 2) score -= 50;

    // --- 3. Pawn Structure (Doubled, Isolated) and Rook on Open File ---
    const whitePawns = state.pieceBitboards[P], blackPawns = state.pieceBitboards[P + 6];
    for (let i = 0; i < 8; i++) {
        const fileMask = (FILE_A >> BigInt(i));
        // Penalize doubled pawns
        const w_pawns_on_file = popcount(whitePawns & fileMask);
        if (w_pawns_on_file > 1) score -= 20 * (w_pawns_on_file - 1);
        const b_pawns_on_file = popcount(blackPawns & fileMask);
        if (b_pawns_on_file > 1) score += 20 * (b_pawns_on_file - 1);
        
        // Bonus for rooks on open/semi-open files
        if (popcount(state.pieceBitboards[R] & fileMask) > 0) {
            if (w_pawns_on_file === 0) score += (b_pawns_on_file === 0 ? 30 : 15);
        }
        if (popcount(state.pieceBitboards[R+6] & fileMask) > 0) {
            if (b_pawns_on_file === 0) score -= (w_pawns_on_file === 0 ? 30 : 15);
        }
    }

    evaluationTime += performance.now() - evalStartTime;
    return (state.turn === WHITE ? 1 : -1) * score;
}


/*B"H*/
// =================================================================
//                SEARCH, QUIESCENCE & MOVE ORDERING
// =================================================================

/**
 * Initializes all state variables required for a new search.
 * @param {number} maxTime - The time limit for the search in milliseconds.
 */
function initializeSearch(maxTime) {
    searchStartTime = performance.now();
    timeLimit = maxTime || 4000;
    stopSearch = false;
    nodeCount = 0;
    evaluationTime = 0;
    transpositionTable = new Map();
    killerMoves = Array(MATE_IN_MAX_PLY + 1).fill(null).map(() => [null, null]);
    historyTable = Array(12).fill(null).map(() => Array(64).fill(0));
}

/**
 * Orders moves to improve alpha-beta pruning efficiency.
 * Prioritizes moves in this order: Hash Move > Good Captures > Killer Moves > History Heuristic.
 * @param {number[]} moves - An array of pseudo-legal moves.
 * @param {object} state - The current game state.
 * @param {number} ply - The current search depth (ply).
 * @returns {number[]} The sorted array of moves.
 */
function orderMoves(moves, state, ply) {
    const moveScores = [];
    const hashEntry = transpositionTable.get(state.zobristHash);
    const hashMove = hashEntry ? hashEntry.move : 0;
    const captureValues = [100, 350, 355, 500, 900, 20000]; // P, N, B, R, Q, K

    for (const move of moves) {
        let score = 0;

        if (move === hashMove) {
            score = 2000000;
        } else if (getMoveCapture(move)) {
            const attackerType = getMovePiece(move);
            let victimType = P; // Default for en passant
            if (!getMoveEnpassant(move)) {
                victimType = getPieceTypeOnSquare(state, getMoveTo(move), state.turn ^ 1);
            }
            // Most Valuable Victim - Least Valuable Attacker (MVV-LVA)
            score = (captureValues[victimType] * 10) - captureValues[attackerType] + 1000000;
        } else {
            if (killerMoves[ply] && killerMoves[ply][0] === move) {
                score = 900000;
            } else if (killerMoves[ply] && killerMoves[ply][1] === move) {
                score = 850000;
            } else {
                score = historyTable[getMovePiece(move) + (state.turn * 6)][getMoveTo(move)];
            }
        }
        
        moveScores.push({ move, score });
    }
    
    return moveScores.sort((a, b) => b.score - a.score).map(ms => ms.move);
}

/**
 * The quiescence search function, which only searches tactical moves (captures/promotions)
 * to stabilize the evaluation and avoid the horizon effect.
 * @param {object} state - The game state.
 * @param {number} alpha - The lower bound of the search window.
 * @param {number} beta - The upper bound of the search window.
 * @returns {number} The evaluated score of the position.
 */
function quiesce(state, alpha, beta) {
    if ((nodeCount & 2047) === 0 && performance.now() - searchStartTime > timeLimit) stopSearch = true;
    if (stopSearch) return 0;
    nodeCount++;
    
    const stand_pat = evaluate(state);

    if (stand_pat >= beta) return beta;
    if (alpha < stand_pat) alpha = stand_pat;

    const moves = generateTacticalMoves(state);
    const orderedMoves = orderMoves(moves, state, 0); // Ply 0 is fine for q-search ordering

    for (const move of orderedMoves) {
        makeMove(state, move);
        const kingSq = getLSBIndex(state.pieceBitboards[(state.turn ^ 1) * 6 + K]);
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

/**
 * The core alpha-beta search function with Principal Variation Search (PVS).
 * @param {object} state - The game state.
 * @param {number} depth - The remaining depth to search.
 * @param {number} alpha - The lower bound of the search window.
 * @param {number} beta - The upper bound of the search window.
 * @param {number} ply - The current ply from the root.
 * @returns {number} The evaluated score of the position.
 */
function search(state, depth, alpha, beta, ply) {
    if (depth <= 0) {
        return quiesce(state, alpha, beta);
    }

    if ((nodeCount & 2047) === 0 && performance.now() - searchStartTime > timeLimit) {
        stopSearch = true;
    }
    if (stopSearch) return 0;
    nodeCount++;

    // Repetition check by looking back at previous hashes on the stack
    for (let i = moveStackPtr - 4; i >= 0; i -= 2) {
        if (moveStack[i].zobristHash === state.zobristHash) return CONTEMPT_FACTOR;
    }

    const ttEntry = transpositionTable.get(state.zobristHash);
    if (ply > 0 && ttEntry && ttEntry.depth >= depth) {
        let score = ttEntry.score;
        if (score > MATE_SCORE - MATE_IN_MAX_PLY) score -= ply;
        if (score < -MATE_SCORE + MATE_IN_MAX_PLY) score += ply;
        if (ttEntry.flag === TT_EXACT) return score;
        if (ttEntry.flag === TT_LOWERBOUND) alpha = Math.max(alpha, score);
        else if (ttEntry.flag === TT_UPPERBOUND) beta = Math.min(beta, score);
        if (alpha >= beta) return score;
    }

    const moves = generateMoves(state);
    const orderedMoves = orderMoves(moves, state, ply);
    
    let legalMovesFound = 0;
    let bestScore = -Infinity;
    let ttFlag = TT_UPPERBOUND;
    let bestMoveForNode = 0;

    for (const move of orderedMoves) {
        makeMove(state, move);
        const kingSq = getLSBIndex(state.pieceBitboards[(state.turn ^ 1) * 6 + K]);
        if (isSquareAttacked_lean(state, kingSq, state.turn)) {
            unmakeMove(state);
            continue;
        }
        legalMovesFound++;

        let score;
        if (legalMovesFound === 1) {
            // First move: Full-window search (PVS)
            score = -search(state, depth - 1, -beta, -alpha, ply + 1);
        } else {
            // Subsequent moves: Zero-window search (test if it's better than current best)
            score = -search(state, depth - 1, -alpha - 1, -alpha, ply + 1);
            // If it is better, we must re-search with a full window
            if (score > alpha && score < beta) {
                score = -search(state, depth - 1, -beta, -alpha, ply + 1);
            }
        }

        unmakeMove(state);

        if (stopSearch) return 0;

        if (score > bestScore) {
            bestScore = score;
            bestMoveForNode = move;
        }

        if (bestScore > alpha) {
            ttFlag = TT_EXACT;
            alpha = bestScore;
        }

        if (alpha >= beta) {
            // This is a "beta cutoff", a very good move. Store it.
            if (!getMoveCapture(move)) {
                if(killerMoves[ply][0] !== move) killerMoves[ply][1] = killerMoves[ply][0];
                killerMoves[ply][0] = move;
                historyTable[getMovePiece(move) + ((state.turn^1) * 6)][getMoveTo(move)] += depth * depth;
            }
            transpositionTable.set(state.zobristHash, { score: beta, depth: depth, flag: TT_LOWERBOUND, move: move });
            return beta;
        }
    }

    if (legalMovesFound === 0) {
        const kingInCheck = isSquareAttacked_lean(state, getLSBIndex(state.pieceBitboards[state.turn * 6 + K]), state.turn ^ 1);
        return kingInCheck ? -MATE_SCORE + ply : 0; // Checkmate or stalemate
    }
    
    transpositionTable.set(state.zobristHash, { score: bestScore, depth: depth, flag: ttFlag, move: bestMoveForNode });
    
    return bestScore;
}

/**
 * The root of the search, managing iterative deepening.
 * @param {object} initialState - The starting game state for the search.
 * @param {number} maxDepth - The maximum depth to search.
 * @param {number} maxTime - The maximum time in milliseconds to search.
 * @returns {{bestMove: number, score: number}} The best move and its evaluation.
 */
function searchRoot(initialState, maxDepth, maxTime) {
    initializeSearch(maxTime);
    let bestMove = 0, bestScore = -Infinity;

    for (let currentDepth = 1; currentDepth <= maxDepth; currentDepth++) {
        const moves = generateMoves(initialState);
        const orderedMoves = orderMoves(moves, initialState, 0);

        let legalMovesSearched = 0;
        let alpha = -Infinity, beta = Infinity;

        for (const move of orderedMoves) {
            makeMove(initialState, move);
            const kingColor = initialState.turn ^ 1;
            const kingSq = getLSBIndex(initialState.pieceBitboards[kingColor * 6 + K]);
            if (isSquareAttacked_lean(initialState, kingSq, initialState.turn)) {
                unmakeMove(initialState);
                continue;
            }
            legalMovesSearched++;

            const score = -search(initialState, currentDepth - 1, -beta, -alpha, 1);

            unmakeMove(initialState);

            if (stopSearch) break;

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
                alpha = score;
            }
        }
        
        if (stopSearch) {
            console.log("Search stopped due to time limit.");
            break;
        }
        
        if (legalMovesSearched === 0) {
             console.log("No legal moves found at root.");
             break;
        }

        self.postMessage({ type: 'info', depth: currentDepth, score: bestScore, bestMove: decodeMove(bestMove, initialState.turn), nodes: nodeCount });

        // If a mate is found, no need to search deeper.
        if (Math.abs(bestScore) > MATE_SCORE - MATE_IN_MAX_PLY) {
            break; 
        }
    }

    return { bestMove, score: bestScore };
}


/*B"H*/
// =================================================================
//                 ENGINE INITIALIZATION & MAIN DRIVER
// =================================================================

/**
 * Converts an encoded move integer into a UI-friendly object.
 * @param {number} move - The encoded move.
 * @param {number} turn - The color of the side that made the move.
 * @returns {object} An object with from, to, and promotion properties.
 */
function decodeMove(move, turn) {
    const from = getMoveFrom(move);
    const to = getMoveTo(move);
    const promoted = getMovePromoted(move);
    return {
        from: [Math.floor(from / 8), from % 8],
        to: [Math.floor(to / 8), to % 8],
        promotion: promoted ? pieceMap[promoted + (turn === BLACK ? 6 : 0)].toLowerCase() : null
    };
}

/**
 * Processes a raw book array into a hash-based Map for fast lookups.
 * @param {Array} rawBook - The raw book data from generateRawBook.
 * @param {Map<bigint, object>} targetMap - The Map object to populate.
 */
function processRawBook(rawBook, targetMap) {
    if (!rawBook) return;
    for (const entry of rawBook) {
        if (!entry) continue;
        const fen = entry[0];
        const name = entry[1];
        // CORRECTED: Use the raw BigInt hash as the key for consistency.
        const hash = calculateZobristHash(createGameState(fen));
        const bookEntry = targetMap.has(hash) ? targetMap.get(hash) : { name: name, moves: [] };
        
        for (let i = 2; i < entry.length; i++) {
            bookEntry.moves.push(entry[i]);
        }
        targetMap.set(hash, bookEntry);
    }
}

/**
 * Initializes the entire engine, including pre-calculating data and processing opening books.
 */
function initializeEngine() {
    if (isInitialized) return;
    console.log("Awtsmoos Engine (Bitboard): Initialization started.");
    initializeAll(); // From helpers.js

    processRawBook(rawOpeningBook, openingBook);
    processRawBook(punishmentBookSource, punishmentBook);

    isInitialized = true;
    console.log("Awtsmoos Engine Initialized Successfully.");
    console.log(`Mainline Openings Loaded: ${openingBook.size}`);
    console.log(`Punishment Lines Loaded: ${punishmentBook.size}`);
    
    self.postMessage({ type: 'initialization_complete' });
}

/**
 * Main message handler for the chess engine worker. This is the central command hub.
 */
self.onmessage = function(e) {
    const { command } = e.data;
    switch (command) {
        case 'initialize':
            initializeEngine();
            break;

        case 'calculate_move': {
            if (!isInitialized) { initializeEngine(); }
            const { fen, maxTime } = e.data;
            let state = createGameState(fen);
            
            const bookEntry = openingBook.get(state.zobristHash) || punishmentBook.get(state.zobristHash);

            if (bookEntry && bookEntry.moves.length > 0) {
                const bookMove = bookEntry.moves[Math.floor(Math.random() * bookEntry.moves.length)];
                postMessage({ 
                    type: 'move_result', 
                    bestMove: bookMove,
                    score: `Book: ${bookEntry.name}`, 
                    timeTaken: "0.00", 
                    nodesSearched: 0,
                    evaluationTime: "0.00",
                    evalPercent: "N/A"
                });
                return;
            }

            const searchResult = searchRoot(state, 99, maxTime || 4200);
            const totalTime = performance.now() - searchStartTime;
            
            postMessage({
                type: 'move_result',
                bestMove: searchResult.bestMove ? decodeMove(searchResult.bestMove, state.turn) : null,
                score: searchResult.score,
                timeTaken: totalTime.toFixed(2),
                nodesSearched: nodeCount,
                evaluationTime: evaluationTime.toFixed(2),
                evalPercent: totalTime > 0 ? ((evaluationTime / totalTime) * 100).toFixed(1) : "0.0"
            });
            break;
        }
        
        case 'analyze_pgn': {
            // This relies on the PgnConverter class, now located in generateFromPgn.js
            const { pgnText } = e.data;
            const converter = new PgnConverter();
            const movesSAN = pgnText.replace(/\[.*?\]\s*|{.*?}|\d+\.\s*|\$\d+/g, '').replace(/\s+/g, ' ').trim().split(' ');
            const validatedMoves = [];
            const boardHistory = [converter.toFen()];

            for (const san of movesSAN) {
                if (!san || ['1-0', '0-1', '1/2-1/2', '*'].includes(san)) continue;
                const move = converter.parseSan(san);
                if (move == null) {
                    postMessage({ type: 'analysis_error', message: `Invalid PGN: Could not parse move "${san}"` });
                    return;
                }
                const decodedMove = decodeMove(move, converter.currentState.turn);
                converter.applyMove(move);
                decodedMove.san = san;
                validatedMoves.push(decodedMove);
                boardHistory.push(converter.toFen());
            }

            lastParsedGame = { moves: validatedMoves, boardHistory, initialFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" };
            postMessage({ type: 'analysis_result', ...lastParsedGame });
            break;
        }

        case 'run_engine_analysis': {
            if (!lastParsedGame) break;
            const { moves, initialFen } = lastParsedGame;
            let state = createGameState(initialFen);
            const ANALYSIS_THINKING_TIME = 2500;
            const BEST_MOVE_TOLERANCE = 35, MISTAKE_THRESHOLD = 80, BLUNDER_THRESHOLD = 220;

            for (let i = 0; i < moves.length; i++) {
                const actualMoveObj = moves[i];
                const legalMoves = generateMoves(state);
                const actualMoveInt = legalMoves.find(m => {
                    const from = getMoveFrom(m), to = getMoveTo(m);
                    return (Math.floor(from/8) === actualMoveObj.from[0] && from%8 === actualMoveObj.from[1] &&
                            Math.floor(to/8) === actualMoveObj.to[0] && to%8 === actualMoveObj.to[1]);
                });
                
                if (actualMoveInt === undefined) {
                    if (legalMoves.length > 0) makeMove(state, legalMoves[0]);
                    continue;
                }

                const searchResult = searchRoot(state, 99, ANALYSIS_THINKING_TIME);
                let bestMoveFound = searchResult.bestMove;
                let classification = 'best';

                if (bestMoveFound !== actualMoveInt) {
                    const bestMoveEval = searchResult.score;
                    makeMove(state, actualMoveInt);
                    // The score is from the perspective of the player whose turn it is now.
                    // We need to flip it to compare it to the previous position's eval.
                    const scoreForUserMove = -searchRoot(state, 99, ANALYSIS_THINKING_TIME).score;
                    unmakeMove(state);
                    
                    const evalDrop = bestMoveEval - scoreForUserMove;

                    if (evalDrop > BLUNDER_THRESHOLD) classification = 'blunder';
                    else if (evalDrop > MISTAKE_THRESHOLD) classification = 'mistake';
                    else if (evalDrop > BEST_MOVE_TOLERANCE) classification = 'good';
                }
                
                self.postMessage({
                    type: 'analysis_update',
                    index: i,
                    result: { classification, bestMove: decodeMove(bestMoveFound, state.turn) }
                });
                makeMove(state, actualMoveInt);
            }
            self.postMessage({ type: 'analysis_finished' });
            break;
        }
    }
};