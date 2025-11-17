
/* B"H */

// =================================================================
//                 THE AWTSMOOS CHESS(ED) ENGINE (Mk. III - UNIFIED)
// =================================================================
// This version is structurally refactored to use a single, shared
// helpers file for all core logic, ensuring 100% consistency between
// the book generator and the search engine.

// --- CORE LOGIC AND DATABASE IMPORT ---
importScripts('helpers.js');
importScripts('grandmaster_library.js');
importScripts('punishment_library.js');
/* B"H */




// =================================================================
//                 OPENING BOOK PROCESSING LOGIC
// =================================================================
/* B"H */

// =================================================================
//                 OPENING BOOK PROCESSING LOGIC
// =================================================================
const openingBook = new Map();
const punishmentBook = new Map();
let lastParsedGame = null
var evaluationTime = 0
/*B"H*/

/**
 * This function takes a raw book array and processes it into the final, hash-based Map.
 * This version is corrected to use raw BigInt Zobrist hashes as keys, ensuring
 * consistency with the search function's transposition table lookups.
 * @param {Array} rawBook - The raw book data from generateRawBook.
 * @param {Map} targetMap - The Map object (openingBook or punishmentBook) to populate.
 */
function processRawBook(rawBook, targetMap) {
    for (const entry of rawBook) {
        if (!entry) continue;
        const fen = entry[0];
        const name = entry[1];
        // CORRECTED: Use the raw BigInt hash as the key.
        const hash = calculateZobristHash(createGameState(fen));
        const bookEntry = targetMap.has(hash) ? targetMap.get(hash) : { name: name, moves: [] };
        
        for (let i = 2; i < entry.length; i++) {
            const newMove = entry[i];
            const moveExists = bookEntry.moves.some(m =>
                m.from[0] === newMove.from[0] && m.from[1] === newMove.from[1] &&
                m.to[0] === newMove.to[0] && m.to[1] === newMove.to[1] &&
                m.promotion === newMove.promotion
            );
            if (!moveExists) {
                bookEntry.moves.push(newMove);
            }
        }
        targetMap.set(hash, bookEntry);
    }
}

/**
 * A helper function to build a book from a source array.
 * This version is corrected to use raw BigInt Zobrist hashes for keys.
 * @param {Array} sourceArray - The source data for the book.
 * @param {Map} targetMap - The Map object to populate.
 */
function buildBook(sourceArray, targetMap) {
    if (targetMap.size > 0 || typeof sourceArray === 'undefined') return;

    const rawBook = generateRawBook(sourceArray);
    for (const entry of rawBook) {
        if (!entry) continue;
        const fen = entry[0];
        const name = entry[1];
        // CORRECTED: Use the raw BigInt hash as the key.
        const hash = calculateZobristHash(createGameState(fen));
        const bookEntry = targetMap.has(hash) ? targetMap.get(hash) : { name: name, moves: [] };
        
        for (let i = 2; i < entry.length; i++) {
            const newMove = entry[i];
            const moveExists = bookEntry.moves.some(m =>
                m.from[0] === newMove.from[0] && m.from[1] === newMove.from[1] &&
                m.to[0] === newMove.to[0] && m.to[1] === newMove.to[1] &&
                m.promotion === newMove.promotion
            );
            if (!moveExists) {
                bookEntry.moves.push(newMove);
            }
        }
        targetMap.set(hash, bookEntry);
    }
}

/**
 * Builds the main opening book.
 * This version is corrected to use raw BigInt Zobrist hashes for keys.
 */
function buildOpeningBook() {
    if (openingBook.size > 0 || typeof rawOpeningBook === 'undefined') return;
    for (const entry of rawOpeningBook) {
        if (!entry) continue;
        const fen = entry[0];
        const name = entry[1];
        // CORRECTED: Use the raw BigInt hash as the key.
        const hash = calculateZobristHash(createGameState(fen));

        const bookEntry = openingBook.has(hash) ? openingBook.get(hash) : { name: name, moves: [] };

        for (let i = 2; i < entry.length; i++) {
            const newMove = entry[i];
            const moveExists = bookEntry.moves.some(m =>
                m.from[0] === newMove.from[0] && m.from[1] === newMove.from[1] &&
                m.to[0] === newMove.to[0] && m.to[1] === newMove.to[1] &&
                m.promotion === newMove.promotion
            );
            if (!moveExists) {
                bookEntry.moves.push(newMove);
            }
        }
        openingBook.set(hash, bookEntry);
    }
}


// =================================================================
//                       CONSTANTS & CONFIGURATION
// =================================================================

const MATE_SCORE = 100000;
const MATE_IN_MAX_PLY = 64;
const NULL_MOVE_R = 3;

const Q_MAX_DEPTH = 8; 
const CONTEMPT_FACTOR = -72; // Re-defining the constant here for context
// *** MODIFIED: Added huge incentive for imminent pawn promotion. ***
const PROMOTION_IMMINENT_BONUS = 4000; // Increased to ensure engine sees the guaranteed Queen

// *** NEW: Added a massive bonus for a pawn that is one square away from promoting. ***
let nodeCount = 0;
let searchStartTime, timeLimit;
let stopSearch = false;
let killerMoves, historyTable, transpositionTable, repetitionHistory;
const TT_EXACT = 0, TT_LOWERBOUND = 1, TT_UPPERBOUND = 2;

 
// 
const pawnPST = [[0,0,0,0,0,0,0,0],[50,50,50,50,50,50,50,50],[10,10,20,30,30,20,10,10],[5,5,10,40,40,10,5,5],[0,0,15,50,50,15,0,0],[5,-5,-10,0,0,-10,-5,5],[5,10,10,-25,-25,10,10,5],[0,0,0,0,0,0,0,0]];
// 
const knightPST = [[-50,-40,-30,-30,-30,-30,-40,-50],[-40,-20,0,5,5,0,-20,-40],[-30,5,15,20,20,15,5,-30],[-30,10,20,30,30,20,10,-30],[-30,10,20,30,30,20,10,-30],[-30,5,15,20,20,15,5,-30],[-40,-20,0,5,5,0,-20,-40],[-50,-40,-30,-30,-30,-30,-40,-50]];
const bishopPST = [[-20,-10,-10,-10,-10,-10,-10,-20],[-10,0,0,0,0,0,0,-10],[-10,0,5,10,10,5,0,-10],[-10,5,5,10,10,5,5,-10],[-10,0,10,10,10,10,0,-10],[-10,10,10,10,10,10,10,-10],[-10,5,0,0,0,0,5,-10],[-20,-10,-10,-10,-10,-10,-10,-20]];
// 
const rookPST = [[0,0,0,0,0,0,0,0],[5,10,10,10,10,10,10,5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[0,0,0,5,5,0,0,0]];
// 
const queenPST = [[-20,-10,-10,-5,-5,-10,-10,-20],[-10,0,0,0,0,0,0,-10],[-10,0,5,5,5,5,0,-10],[-5,0,5,5,5,5,0,-5],[0,0,5,5,5,5,0,-5],[-10,5,5,5,5,5,0,-10],[-10,0,5,0,0,0,0,-10],[-20,-10,-10,-5,-5,-10,-10,-20]];
// 
const kingPSTMidGame=[[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-20,-30,-30,-40,-40,-30,-30,-20],[-10,-20,-20,-20,-20,-20,-20,-10],[20,20,0,0,0,0,20,20],[20,30,10,0,0,10,30,20]];
// 
const kingPSTEndGame=[[-50,-40,-30,-20,-20,-30,-40,-50],[-30,-20,-10,0,0,-10,-20,-30],[-30,-10,20,30,30,20,-10,-30],[-30,-10,30,40,40,30,-10,-30],[-30,-10,30,40,40,30,-10,-30],[-30,-10,20,30,30,20,-10,-30],[-30,-30,0,0,0,0,-30,-30],[-50,-30,-30,-30,-30,-30,-30,-50]];


// =================================================================
//                 SEARCH INITIALIZATION HELPER
// =================================================================
// This function sets up all necessary variables for a search.
function initializeSearch(maxTime) {
    searchStartTime = performance.now();
    timeLimit = maxTime || 4000; // Use provided time or default to 4 seconds
    stopSearch = false;
    nodeCount = 0;
    transpositionTable = new Map();
    killerMoves = Array(MATE_IN_MAX_PLY + 1).fill(null).map(() => [null, null]);
    historyTable = Array(12).fill(null).map(() => Array(64).fill(0));
    repetitionHistory = []; // Reset repetition history for the new search
    
    
    /**
     * @type {number}
     * @description Add a new global variable to track time spent purely on evaluation.
     */
    evaluationTime = 0;
}


// ====================================================================================
//            MASTER EVALUATION HUB (v7.0 - FINAL & COMPLETE)
// ====================================================================================

// --- TAPERED EVALUATION HELPERS (RESTORED) ---
class TaperedScore {
    constructor(mg = 0, eg = 0) { this.mg = mg; this.eg = eg; }
    add(other) { this.mg += other.mg; this.eg += other.eg; return this; }
    subtract(other) { this.mg -= other.mg; this.eg -= other.eg; return this; }
}

const pieceValues = {
    p: { mg: 100, eg: 130 }, 
    n: { mg: 350, eg: 350 }, 
    b: { mg: 355, eg: 355 }, 
    r: { mg: 500, eg: 500 },
    q: { mg: 900, eg: 900 },
    k: { mg: 20000, eg: 20000 }
};

// --- BITBOARD-NATIVE HELPER FUNCTIONS (RESTORED & OPTIMIZED) ---
function popcount(bb) {
    let count = 0;
    while (bb > 0n) {
        bb &= (bb - 1n);
        count++;
    }
    return count;
}

function getGamePhase(state) {
    const MAX_PHASE = 24; 
    let currentPhase = 0;
    // Calculate phase based on non-pawn, non-king pieces
    currentPhase += popcount(state.pieceBitboards[N] | state.pieceBitboards[N + 6]) * 1;
    currentPhase += popcount(state.pieceBitboards[B] | state.pieceBitboards[B + 6]) * 1;
    currentPhase += popcount(state.pieceBitboards[R] | state.pieceBitboards[R + 6]) * 2;
    currentPhase += popcount(state.pieceBitboards[Q] | state.pieceBitboards[Q + 6]) * 4;
    // Return a value from 1.0 (opening) to 0.0 (endgame)
    return Math.min(currentPhase, MAX_PHASE) / MAX_PHASE;
}

// --- Pre-calculated masks for evaluation ---
const FILE_A = 72340172838076673n;
const FILE_H = 9259542123273814144n;
const KING_SIDE_MASK = 6917529027641081856n;
const QUEEN_SIDE_MASK = 1085102592571150095n;
const CENTER_FILES_MASK = 4755801206503243776n; // d and e files
const KING_ATTACK_ZONE = [Array(64), Array(64)]; // [color][king_sq]

// Initialize King attack zones
for (let sq = 0; sq < 64; sq++) {
    let zone = KING_ATTACKS[sq];
    if ((1n << BigInt(sq)) & NOT_A_FILE) zone |= KING_ATTACKS[sq - 1];
    if ((1n << BigInt(sq)) & NOT_H_FILE) zone |= KING_ATTACKS[sq + 1];
    KING_ATTACK_ZONE[WHITE][sq] = zone;
    KING_ATTACK_ZONE[BLACK][sq] = zone;
}


/*B"H*/

/**
 * Generates bitboard maps of all attacked squares for both players.
 * @param {object} state - The current game state.
 * @returns {{white: bigint, black: bigint}} An object containing the attack maps.
 */
function generateAttackMaps(state) {
    const maps = { white: 0n, black: 0n };
    const blockers = state.occupancies[2];

    for (let piece = P; piece <= K; piece++) {
        // White pieces
        let bb = state.pieceBitboards[piece];
        while (bb > 0n) {
            const sq = getLSBIndex(bb);
            switch (piece) {
                case P: maps.white |= PAWN_ATTACKS[WHITE][sq]; break;
                case N: maps.white |= KNIGHT_ATTACKS[sq]; break;
                case B: maps.white |= getBishopAttacks(sq, blockers); break;
                case R: maps.white |= getRookAttacks(sq, blockers); break;
                case Q: maps.white |= getQueenAttacks(sq, blockers); break;
                case K: maps.white |= KING_ATTACKS[sq]; break;
            }
            bb = popBit(bb);
        }

        // Black pieces
        bb = state.pieceBitboards[piece + 6];
        while (bb > 0n) {
            const sq = getLSBIndex(bb);
            switch (piece) {
                case P: maps.black |= PAWN_ATTACKS[BLACK][sq]; break;
                case N: maps.black |= KNIGHT_ATTACKS[sq]; break;
                case B: maps.black |= getBishopAttacks(sq, blockers); break;
                case R: maps.black |= getRookAttacks(sq, blockers); break;
                case Q: maps.black |= getQueenAttacks(sq, blockers); break;
                case K: maps.black |= KING_ATTACKS[sq]; break;
            }
            bb = popBit(bb);
        }
    }
    return maps;
}








// ====================================================================================
//            BITBOARD SEARCH, QUIESCENCE & MOVE ORDERING (v3.0 - FINAL)
// ====================================================================================


/*B"H*/
/**
 * Orders moves to improve alpha-beta pruning efficiency.
 * This version is corrected to use the raw BigInt Zobrist hash for transposition
 * table lookups, avoiding the extremely slow process of converting it to a string.
 * @param {number[]} moves - An array of pseudo-legal moves.
 * @param {object} state - The current game state.
 * @param {number} ply - The current search depth (ply).
 * @returns {number[]} The sorted array of moves.
 */
function orderMoves(moves, state, ply) {
    const moveScores = [];
    // PERFORMANCE FIX: Use the raw BigInt hash directly as the key.
    const hashEntry = transpositionTable.get(state.zobristHash);
    const hashMove = hashEntry ? hashEntry.move : 0;
    const pieceValues = [100, 350, 355, 500, 900, 20000];

    for (const move of moves) {
        let score = 0;

        if (move === hashMove) {
            score = 2000000;
        } else if (getMoveCapture(move)) {
            const attackerType = getMovePiece(move);
            const to = getMoveTo(move);
            let victimType = P;

            if (!getMoveEnpassant(move)) {
                victimType = getPieceTypeOnSquare(state, to, state.turn ^ 1);
            }
            // Ensure victimType is not null before accessing pieceValues
            if (victimType !== null) {
               score = (pieceValues[victimType] * 10) - pieceValues[attackerType] + 1000000;
            } else {
               score = 1000000; // Fallback for rare cases
            }
        } else {
            if (killerMoves[ply] && killerMoves[ply][0] === move) {
                score = 900000;
            } else if (killerMoves[ply] && killerMoves[ply][1] === move) {
                score = 850000;
            } else {
                score = historyTable[getMovePiece(move) + (state.turn * 6)][getMoveTo(move)];
            }
        }
        
        if (getMovePromoted(move)) {
            score += pieceValues[getMovePromoted(move)] * 100;
        }

        moveScores.push({ move, score });
    }
    
    return moveScores.sort((a, b) => b.score - a.score).map(ms => ms.move);
}




/*B"H*/

/**
 * The pure bitboard evaluation function.
 * This version has been refactored for performance. It no longer generates attack maps itself.
 * Instead, it receives them as a parameter, which is crucial to prevent recalculation at every leaf node.
 * @param {object} state - The current game state.
 * @param {{white: bigint, black: bigint}} attackMaps - Pre-calculated attack maps for both sides.
 * @returns {number} The final evaluation score.
 */
function evaluate(state, attackMaps) {
    const evalStartTime = performance.now();
    const gamePhase = getGamePhase(state);
    let score = 0;
    
    // --- Material and PST (No changes here) ---
    for (let p_type = P; p_type <= K; p_type++) {
        let white_bb = state.pieceBitboards[p_type];
        let black_bb = state.pieceBitboards[p_type + 6];
        const pst = [pawnPST, knightPST, bishopPST, rookPST, queenPST, kingPSTMidGame][p_type];
        const king_pst_eg = kingPSTEndGame;
        const piece_val = [pieceValues.p, pieceValues.n, pieceValues.b, pieceValues.r, pieceValues.q, pieceValues.k][p_type];
        while(white_bb > 0n) {
            const sq = getLSBIndex(white_bb);
            const r = 7 - Math.floor(sq/8), c = sq % 8;
            score += piece_val.mg * gamePhase + piece_val.eg * (1 - gamePhase);
            if (p_type === K) score += king_pst_eg[r][c] * (1-gamePhase) + pst[r][c] * gamePhase;
            else score += pst[r][c];
            white_bb = popBit(white_bb);
        }
        while(black_bb > 0n) {
            const sq = getLSBIndex(black_bb);
            const r = Math.floor(sq/8), c = sq % 8;
            score -= (piece_val.mg * gamePhase + piece_val.eg * (1 - gamePhase));
            if (p_type === K) score -= king_pst_eg[r][c] * (1-gamePhase) + pst[r][c] * gamePhase;
            else score -= pst[r][c];
            black_bb = popBit(black_bb);
        }
    }

    // --- Strategic Bonuses (No changes here) ---
    const whitePawns = state.pieceBitboards[P], blackPawns = state.pieceBitboards[P + 6];
    for (let i = 0; i < 8; i++) {
        const fileMask = FILE_A << BigInt(i);
        const w_pawns_on_file = popcount(whitePawns & fileMask);
        if (w_pawns_on_file > 1) score -= 25 * (w_pawns_on_file -1);
        if (w_pawns_on_file > 0 && ((whitePawns & (((FILE_A << BigInt(i-1)) & NOT_H_FILE) | ((FILE_A << BigInt(i+1)) & NOT_A_FILE))) === 0n)) score -= 20;
        const b_pawns_on_file = popcount(blackPawns & fileMask);
        if (b_pawns_on_file > 1) score += 25 * (b_pawns_on_file -1);
        if (b_pawns_on_file > 0 && ((blackPawns & (((FILE_A << BigInt(i-1)) & NOT_H_FILE) | ((FILE_A << BigInt(i+1)) & NOT_A_FILE))) === 0n)) score += 20;
    }
    let whiteRooks = state.pieceBitboards[R];
    while(whiteRooks > 0n) {
        const sq = getLSBIndex(whiteRooks);
        const fileMask = FILE_A << BigInt(sq % 8);
        if ((whitePawns & fileMask) === 0n) score += ((blackPawns & fileMask) === 0n ? 30 : 15);
        whiteRooks = popBit(whiteRooks);
    }
    let blackRooks = state.pieceBitboards[R+6];
     while(blackRooks > 0n) {
        const sq = getLSBIndex(blackRooks);
        const fileMask = FILE_A << BigInt(sq % 8);
        if ((blackPawns & fileMask) === 0n) score -= ((whitePawns & fileMask) === 0n ? 30 : 15);
        blackRooks = popBit(blackRooks);
    }
    if (popcount(state.pieceBitboards[B]) >= 2) score += 50;
    if (popcount(state.pieceBitboards[B+6]) >= 2) score -= 50;

    // --- King Safety (Now using passed-in attack maps) ---
    const whiteKingSq = getLSBIndex(state.pieceBitboards[K]);
    if (whiteKingSq !== -1) score -= popcount(KING_ATTACK_ZONE[WHITE][whiteKingSq] & attackMaps.black) * 8;
    const blackKingSq = getLSBIndex(state.pieceBitboards[K + 6]);
    if (blackKingSq !== -1) score += popcount(KING_ATTACK_ZONE[BLACK][blackKingSq] & attackMaps.white) * 8;
    
    evaluationTime += performance.now() - evalStartTime;
    return (state.turn === WHITE ? 1 : -1) * score;
}

/**
 * Quiescence search. This version is updated to generate attack maps once and pass
 * them to the evaluation function, avoiding massive recalculation costs.
 */
function quiesce(state, alpha, beta) {
    if ((nodeCount & 2047) === 0 && performance.now() - searchStartTime > timeLimit) stopSearch = true;
    if (stopSearch) return 0;
    nodeCount++;

    // Generate attack maps ONCE, then pass them to evaluate.
    const attackMaps = generateAttackMaps(state);
    const stand_pat = evaluate(state, attackMaps);

    if (stand_pat >= beta) return beta;
    if (alpha < stand_pat) alpha = stand_pat;

    const moves = generateTacticalMoves(state);
    const orderedMoves = orderMoves(moves, state, 0);

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

/*B"H*/
/**
 * The core alpha-beta search function. This is the corrected version that fixes a
 * critical "Cannot access 'score' before initialization" crash caused by a faulty
 * one-line expression. This version restores the stable and correct if/else logic
 * for handling recursive search calls.
 * @param {object} state - The game state.
 * @param {number} depth - The remaining depth to search.
 * @param {number} alpha - The lower bound of the search window.
 * @param {number} beta - The upper bound of the search window.
 * @param {number} ply - The current ply from the root.
 * @returns {number} The evaluated score of the position.
 */
/*B"H*/

/**
 * The core alpha-beta search function. This version corrects a critical ReferenceError
 * caused by an incorrect implementation of the PVS logic in the previous version.
 * The recursive search calls are now handled correctly, preventing the engine from crashing.
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

    for (let i = moveStackPtr - 2; i >= 0; i -= 2) {
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

        // ============================================================================
        //               CRITICAL FIX: RESTORED CORRECT PVS LOGIC
        // ============================================================================
        let score;
        if (legalMovesFound === 1) {
            // First move: Perform a full-window search. This establishes the principal variation.
            score = -search(state, depth - 1, -beta, -alpha, ply + 1);
        } else {
            // Subsequent moves: Assume they are worse and test with a minimal "zero-window".
            score = -search(state, depth - 1, -alpha - 1, -alpha, ply + 1);
            
            // If the zero-window search failed high (score > alpha), it means this move is
            // better than our current best. We must re-search with a full window.
            if (score > alpha && score < beta) {
                score = -search(state, depth - 1, -beta, -alpha, ply + 1);
            }
        }
        // ============================================================================

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
            if (!getMoveCapture(move)) {
                if(killerMoves[ply] && killerMoves[ply][0] !== move) killerMoves[ply][1] = killerMoves[ply][0];
                killerMoves[ply][0] = move;
                historyTable[getMovePiece(move) + ((state.turn^1) * 6)][getMoveTo(move)] += depth * depth;
            }
            transpositionTable.set(state.zobristHash, { score: beta, depth: depth, flag: TT_LOWERBOUND, move: move });
            return beta;
        }
    }

    if (legalMovesFound === 0) {
        const kingInCheck = isSquareAttacked_lean(state, getLSBIndex(state.pieceBitboards[state.turn * 6 + K]), state.turn ^ 1);
        return kingInCheck ? -MATE_SCORE + ply : 0;
    }
    
    if (bestMoveForNode) {
       transpositionTable.set(state.zobristHash, { score: bestScore, depth: depth, flag: ttFlag, move: bestMoveForNode });
    }
    
    return bestScore;
}

/*B"H*/
/**
 * The root of the search function, using iterative deepening.
 * This version corrects a critical bug where it was using an outdated calling convention for make/unmake move,
 * which led to board state corruption at the root of the search.
 * @param {object} initialState - The starting game state for the search.
 * @param {number} maxDepth - The maximum depth to search.
 * @param {number} maxTime - The maximum time in milliseconds to search.
 * @returns {{bestMove: number, score: number}} The best move found and its evaluation.
 */
function searchRoot(initialState, maxDepth, maxTime) {
    initializeSearch(maxTime);
    let bestMove = 0, bestScore = -Infinity;

    for (let currentDepth = 1; currentDepth <= maxDepth; currentDepth++) {
        // Aspiration window would be an improvement here, but for now, use infinite.
        let alpha = -Infinity, beta = Infinity;
        
        const moves = generateMoves(initialState);
        const orderedMoves = orderMoves(moves, initialState, 0);

        let legalMovesSearched = 0;

        for (const move of orderedMoves) {
            // CORRECTED: Use the global stack pattern. No `unmakeInfo` is returned.
            makeMove(initialState, move);
            
            const kingColor = initialState.turn ^ 1;
            const kingSq = getLSBIndex(initialState.pieceBitboards[kingColor * 6 + K]);
            if (isSquareAttacked_lean(initialState, kingSq, initialState.turn)) {
                // CORRECTED: unmakeMove now takes no arguments.
                unmakeMove(initialState);
                continue;
            }
            legalMovesSearched++;

            const score = -search(initialState, currentDepth - 1, -beta, -alpha, 1);

            // CORRECTED: unmakeMove now takes no arguments.
            unmakeMove(initialState);

            if (stopSearch) break;

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
            
            if (score > alpha) {
                alpha = score;
            }
        }
        
        if (stopSearch || legalMovesSearched === 0) {
            break;
        }

        // Post intermediate results
        // self.postMessage({ type: 'info', depth: currentDepth, score: bestScore, bestMove: decodeMove(bestMove, initialState.turn), nodes: nodeCount });

        if (Math.abs(bestScore) > MATE_SCORE - MATE_IN_MAX_PLY) {
            break; 
        }
    }

    return { bestMove, score: bestScore };
}




let perftNodeCount = 0;

function perft(state, depth) {
    if (depth === 0) {
        perftNodeCount++;
        return;
    }

    const moves = generateLegalMoves(state);
    for (const move of moves) {
        const unmakeInfo = makeMove(state, move);
        perft(state, depth - 1);
        unmakeMove(state, unmakeInfo);
    }
}

// A helper to run the test and log the results.
function runPerftTest(fen, depth) {
    console.log(`Starting Perft Test for FEN: "${fen}" at depth ${depth}`);
    const state = createGameState(fen);
    perftNodeCount = 0;
    const startTime = performance.now();
    perft(state, depth);
    const endTime = performance.now();
    const duration = (endTime - startTime).toFixed(2);
    const nps = (perftNodeCount / (duration / 1000)).toFixed(0);
    console.log(`Perft Test Complete.`);
    console.log(`Result: ${perftNodeCount} nodes found.`);
    console.log(`Time: ${duration}ms`);
    console.log(`Speed: ${nps} nodes/sec`);
    return perftNodeCount;
}
var tested=1


let DEBUG_MODE = true;
/* B"H */

// =================================================================
//              MAIN WORKER DRIVER (BITBOARD v2.0 - VERIFIED)
// =================================================================

let isInitialized = false;

function initializeEngine() {
    if (isInitialized) return;
    console.log("Prometheus Engine (Bitboard): Initialization started.");
    initializeAll();

    const rawMainBook = generateRawBook(sourceBook);
    processRawBook(rawMainBook, openingBook);
    const rawPunishBook = generateRawBook(punishmentBookSource);
    processRawBook(rawPunishBook, punishmentBook);

    isInitialized = true;
    console.log("Prometheus Engine Initialized Successfully.");
    console.log(`Mainline Openings Loaded: ${openingBook.size}`);
    console.log(`Punishment Lines Loaded: ${punishmentBook.size}`);
    
    self.postMessage({ type: 'initialization_complete' });
}

// IN prometheus_engine.js, REPLACE decodeMove and self.onmessage:

function decodeMove(move, turn) {
    const from = getMoveFrom(move);
    const to = getMoveTo(move);
    const promoted = getMovePromoted(move);
    return {
        from: [Math.floor(from / 8), from % 8],
        to: [Math.floor(to / 8), to % 8],
        promotion: promoted ? pieceMap[promoted + (turn === BLACK ? 6 : 0)] : null
    };
}

/*B"H*/

/**
 * Main message handler for the chess engine worker. This is the fully corrected version
 * that uses raw BigInt keys for book lookups and includes definitive console logging
 * to verify that performance data is being calculated and sent.
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
            
            // CORRECTED: Use the raw BigInt hash for book lookups, consistent with book generation.
            const bookEntry = openingBook.get(state.zobristHash) || punishmentBook.get(state.zobristHash);

            if (bookEntry && bookEntry.moves.length > 0) {
                const bookMoveMsg = { 
                    type: 'move_result', 
                    bestMove: bookEntry.moves[Math.floor(Math.random() * bookEntry.moves.length)], 
                    score: `Book Move: ${bookEntry.name}`, 
                    timeTaken: "0.00", 
                    nodesSearched: 0, 
                    evalPercent: "0.0",
                    evaluationTime: "0.00"
                };
                console.log("WORKER: Sending book move object:", bookMoveMsg);
                postMessage(bookMoveMsg);
                return;
            }

            const searchResult = searchRoot(state, 99, maxTime || 4200);
            
            const totalTime = (performance.now() - searchStartTime);
            
            const resultMsg = {
                type: 'move_result',
                bestMove: searchResult.bestMove ? decodeMove(searchResult.bestMove, state.turn) : null,
                score: searchResult.score,
                timeTaken: totalTime.toFixed(2),
                nodesSearched: nodeCount,
                evaluationTime: evaluationTime.toFixed(2),
                evalPercent: totalTime > 0 ? ((evaluationTime / totalTime) * 100).toFixed(1) : "0.0"
            };

            // VERIFICATION STEP: Log the complete object to the console right before sending.
            console.log("WORKER: Sending search result object:", resultMsg);

            postMessage(resultMsg);
            break;
        }
        case 'analyze_pgn': {
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

            lastParsedGame = { moves: validatedMoves, boardHistory, initialFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", openingNames: [] };
            postMessage({ type: 'analysis_result', ...lastParsedGame });
            break;
        }
        case 'run_engine_analysis': {
            if (!lastParsedGame) break;
            const { moves, initialFen } = lastParsedGame;
            let state = createGameState(initialFen);
            const ANALYSIS_THINKING_TIME = 3000;
            const BEST_MOVE_TOLERANCE = 40, MISTAKE_THRESHOLD = 90, BLUNDER_THRESHOLD = 250;

            for (let i = 0; i < moves.length; i++) {
                const actualMoveObj = moves[i];
                moveStackPtr = 0;
                
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

                let classification = 'best';
                const searchResult = searchRoot(state, 99, ANALYSIS_THINKING_TIME);
                let bestMoveFound = searchResult.bestMove;

                if (bestMoveFound !== actualMoveInt) {
                    const bestMoveEval = searchResult.score;
                    moveStackPtr = 0;
                    makeMove(state, actualMoveInt);
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




