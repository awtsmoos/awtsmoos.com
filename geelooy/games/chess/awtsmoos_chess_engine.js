
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
/**
 * This function takes a raw book array (generated from PGN) and processes it
 * into the final, hash-based Map that the engine uses.
 * @param {Array} rawBook - The raw book data from generateRawBook.
 * @param {Map} targetMap - The Map object (openingBook or punishmentBook) to populate.
 */
function processRawBook(rawBook, targetMap) {
    for (const entry of rawBook) {
        if (!entry) continue;
        const fen = entry[0];
        const name = entry[1];
        const hash = calculateZobristHash(createGameState(fen)).toString();
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

function buildBook(sourceArray, targetMap) {
    if (targetMap.size > 0 || typeof sourceArray === 'undefined') return;

    // The raw book is generated on the fly from the source PGNs
    const rawBook = generateRawBook(sourceArray);

    for (const entry of rawBook) {
        if (!entry) continue;
        const fen = entry[0];
        const name = entry[1];
        const hash = calculateZobristHash(createGameState(fen)).toString();
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

function buildOpeningBook() {
    if (openingBook.size > 0 || typeof rawOpeningBook === 'undefined') return;
    for (const entry of rawOpeningBook) {
        if (!entry) continue;
        const fen = entry[0];
        const name = entry[1]; // Extract the opening name
        const hash = calculateZobristHash(createGameState(fen)).toString();

        // The value in our map will be an object: { name: string, moves: Move[] }
        // If the hash already exists, we'll add to its moves but keep the original name.
        const bookEntry = openingBook.has(hash) ? openingBook.get(hash) : { name: name, moves: [] };

        // Add the new moves from this PGN line to the entry
        for (let i = 2; i < entry.length; i++) {
            const newMove = entry[i];
            // Prevent adding duplicate moves if different lines converge on the same position
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

// Piece-Square Tables
// ====================================================================================
//            REPLACE THE OLD PST CONSTANTS WITH THESE NEW ONES
// ====================================================================================
// These new Piece-Square Tables give much higher bonuses for placing pawns
// and knights in the center, strongly discouraging passive or strange flank moves.

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
}

// =================================================================
//                 EVALUATION & SEARCH (UNCHANGED)
// =================================================================

// DELETE EVERYTHING from the "TaperedScore" class definition (or its preceding comment)
// all the way down to the end of the last evaluation helper function.
// REPLACE it all with this single, self-contained, and correct evaluation engine block.

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



// --- THE PURE BITBOARD EVALUATION FUNCTION ---
function evaluate(state) {
    const attackMaps = generateAttackMaps(state);
    const gamePhase = getGamePhase(state);
    let score = 0;
    
    // --- Material and Piece-Square Table Evaluation ---
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

    // --- Strategic Bonuses (Bitboard Native) ---
    const whitePawns = state.pieceBitboards[P];
    const blackPawns = state.pieceBitboards[P + 6];

    // Doubled & Isolated Pawns
    for (let i = 0; i < 8; i++) {
        const fileMask = FILE_A << BigInt(i);
        const w_pawns_on_file = popcount(whitePawns & fileMask);
        const b_pawns_on_file = popcount(blackPawns & fileMask);
        if (w_pawns_on_file > 1) score -= 25 * (w_pawns_on_file -1);
        if (b_pawns_on_file > 1) score += 25 * (b_pawns_on_file -1);

        if (w_pawns_on_file > 0) {
            const adjacentMask = ((FILE_A << BigInt(i-1)) & NOT_H_FILE) | ((FILE_A << BigInt(i+1)) & NOT_A_FILE);
            if ((whitePawns & adjacentMask) === 0n) score -= 20;
        }
        if (b_pawns_on_file > 0) {
            const adjacentMask = ((FILE_A << BigInt(i-1)) & NOT_H_FILE) | ((FILE_A << BigInt(i+1)) & NOT_A_FILE);
            if ((blackPawns & adjacentMask) === 0n) score += 20;
        }
    }

    // Rook on Open/Semi-Open File
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

    // Bishop Pair
    if (popcount(state.pieceBitboards[B]) >= 2) score += 50;
    if (popcount(state.pieceBitboards[B+6]) >= 2) score -= 50;

    // --- Threats and King Safety (Bitboard Native) ---
    const whiteKingSq = getLSBIndex(state.pieceBitboards[K]);
    const blackKingSq = getLSBIndex(state.pieceBitboards[K + 6]);
    
    // King Safety
    if (whiteKingSq !== -1) {
        const whiteKingZone = KING_ATTACK_ZONE[WHITE][whiteKingSq];
        score -= popcount(whiteKingZone & attackMaps.black) * 8; // Penalty for each enemy attack near king
    }
    if (blackKingSq !== -1) {
        const blackKingZone = KING_ATTACK_ZONE[BLACK][blackKingSq];
        score += popcount(blackKingZone & attackMaps.white) * 8; // Bonus for attacking near enemy king
    }
    
    // Final score adjustment based on whose turn it is
    return (state.turn === WHITE ? 1 : -1) * score;
}





// ====================================================================================
//            BITBOARD SEARCH, QUIESCENCE & MOVE ORDERING (v3.0 - FINAL)
// ====================================================================================


/* B"H */

/**
 * Orders moves for a given position to improve alpha-beta pruning efficiency.
 * MVV-LVA (Most Valuable Victim - Least Valuable Attacker) is used for captures.
 * @param {number[]} moves - An array of pseudo-legal moves.
 * @param {object} state - The current game state.
 * @param {number} ply - The current search depth (ply).
 * @returns {number[]} The sorted array of moves.
 */
function orderMoves(moves, state, ply) {
    const moveScores = [];
    const hashEntry = transpositionTable.get(state.zobristHash.toString());
    const hashMove = hashEntry ? hashEntry.move : 0;
    const pieceValues = [100, 350, 355, 500, 900, 20000];

    for (const move of moves) {
        let score = 0;

        if (move === hashMove) {
            score = 2000000;
        } else if (getMoveCapture(move)) {
            const attackerType = getMovePiece(move);
            const to = getMoveTo(move);
            let victimType = P; // Default to pawn for en-passant

            if (!getMoveEnpassant(move)) {
                 for (let p_type = P; p_type <= K; p_type++) {
                    if ((state.pieceBitboards[(state.turn ^ 1) * 6 + p_type] & (1n << BigInt(to))) !== 0n) {
                        victimType = p_type;
                        break;
                    }
                }
            }
            score = (pieceValues[victimType] * 10) - pieceValues[attackerType] + 1000000;
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
            score += pieceValues[getMovePromoted(move)] * 100; // Promotion bonus
        }

        moveScores.push({ move, score });
    }
    
    return moveScores.sort((a, b) => b.score - a.score).map(ms => ms.move);
}

/*B"H*/

/**
 * Quiescence search to stabilize the evaluation by only searching tactical moves (captures, promotions).
 * This version is heavily optimized to avoid calling the full `orderMoves` function. Instead,
 * it uses a lightweight, inline sorting method for tactical moves, which is critical for
 * high performance as this function is called at the leaves of the search tree.
 * @param {object} state - The game state.
 * @param {number} alpha - The alpha value for the search window.
 * @param {number} beta - The beta value for the search window.
 * @returns {number} The evaluated score of the position.
 */
function quiesce(state, alpha, beta) {
    if ((nodeCount & 2047) === 0 && performance.now() - searchStartTime > timeLimit) {
        stopSearch = true;
    }
    if (stopSearch) return 0;
    nodeCount++;

    // The "stand-pat" score is the evaluation of the position assuming no more tactical moves are made.
    const stand_pat = evaluate(state);

    // If the static evaluation of this position is already better than what the opponent
    // can achieve, we can prune this search branch immediately.
    if (stand_pat >= beta) {
        return beta;
    }
    if (alpha < stand_pat) {
        alpha = stand_pat;
    }

    const moves = generateTacticalMoves(state);
    
    // --- Lightweight Move Ordering for Quiescence ---
    // This inline sort is much faster than calling the full `orderMoves` function.
    const pieceValues = [100, 350, 355, 500, 900, 0]; // Values for MVV-LVA scoring
    const moveScores = [];
    const enemy = state.turn ^ 1;

    for (const move of moves) {
        let score = 0;
        // Promotions are the most valuable tactical moves, so give them a huge boost.
        const promotedPiece = getMovePromoted(move);
        if (promotedPiece) {
            score = 1000000 + pieceValues[promotedPiece];
        } else if (getMoveCapture(move)) {
            const attackerType = getMovePiece(move);
            const to = getMoveTo(move);
            let victimType = P; // Default to pawn for en-passant captures

            if (!getMoveEnpassant(move)) {
                // Find the victim's piece type to score the capture (MVV-LVA).
                for (let p_type = P; p_type <= K; p_type++) {
                    if ((state.pieceBitboards[enemy * 6 + p_type] & (1n << BigInt(to))) !== 0n) {
                        victimType = p_type;
                        break;
                    }
                }
            }
            // Score captures using "Most Valuable Victim - Least Valuable Attacker".
            score = (pieceValues[victimType] * 10) - pieceValues[attackerType];
        }
        moveScores.push({ move, score });
    }
    
    // Sort moves by their generated score in descending order.
    const orderedMoves = moveScores.sort((a, b) => b.score - a.score).map(ms => ms.move);
    // --- End of Lightweight Move Ordering ---

    for (const move of orderedMoves) {
        // Your `helpers.js` uses a global stack for undoing moves, so the correct
        // calling pattern is `makeMove(state, move)` followed by `unmakeMove(state)`.
        makeMove(state, move);
        
        // A move is only legal if the king is not left in check after it's made.
        const kingSq = getLSBIndex(state.pieceBitboards[(state.turn ^ 1) * 6 + K]);
        if (isSquareAttacked_lean(state, kingSq, state.turn)) {
            unmakeMove(state);
            continue;
        }

        const score = -quiesce(state, -beta, -alpha);
        unmakeMove(state);
        
        if (stopSearch) return 0;

        // Standard alpha-beta pruning logic.
        if (score >= beta) {
            return beta; // Beta cutoff
        }
        if (score > alpha) {
            alpha = score; // A new best move was found in this variation.
        }
    }

    return alpha;
}


/*B"H*/
/**
 * The core alpha-beta search function with PVS, transposition tables, and other enhancements.
 * This version is fully optimized to prevent memory allocation and use fast TT lookups.
 * @param {object} state - The game state.
 * @param {number} depth - The remaining depth to search.
 * @param {number} alpha - The lower bound of the search window.
 * @param {number} beta - The upper bound of the search window.
 * @param {number} ply - The current ply from the root, used for mate score adjustment.
 * @returns {number} The evaluated score of the position relative to the side to move.
 */
function search(state, depth, alpha, beta, ply) {
    // --- 1. Base Cases and Exit Conditions ---

    // If we've reached a terminal node in this branch, switch to quiescence search.
    if (depth <= 0) {
        return quiesce(state, alpha, beta);
    }

    // Periodically check if the allotted time has been exceeded.
    if ((nodeCount & 2047) === 0 && performance.now() - searchStartTime > timeLimit) {
        stopSearch = true;
    }
    if (stopSearch) {
        return 0; // Bail out immediately if the stop signal is received.
    }
    nodeCount++;

    // Check for threefold repetition. A repeated position is usually a draw.
    // We check every other move for the same color's turn.
    for (let i = moveStackPtr - 2; i >= 0; i -= 2) {
        if (moveStack[i].zobristHash === state.zobristHash) {
            return CONTEMPT_FACTOR; // Return a slight penalty to discourage bland draws.
        }
    }

    // --- 2. Transposition Table Lookup ---

    const ttEntry = transpositionTable.get(state.zobristHash);
    if (ply > 0 && ttEntry && ttEntry.depth >= depth) {
        let score = ttEntry.score;

        // Adjust mate scores from the TT. A mate found at a deeper ply (e.g., ply 5)
        // is better than the same mate found at the root (ply 1).
        if (score > MATE_SCORE - MATE_IN_MAX_PLY) score -= ply;
        if (score < -MATE_SCORE + MATE_IN_MAX_PLY) score += ply;

        if (ttEntry.flag === TT_EXACT) return score;
        if (ttEntry.flag === TT_LOWERBOUND) alpha = Math.max(alpha, score);
        else if (ttEntry.flag === TT_UPPERBOUND) beta = Math.min(beta, score);
        
        if (alpha >= beta) return score; // The stored value caused a cutoff.
    }

    // --- 3. Move Generation and Iteration ---

    const moves = generateMoves(state);
    const orderedMoves = orderMoves(moves, state, ply);
    
    let legalMovesFound = 0;
    let bestScore = -Infinity;
    let ttFlag = TT_UPPERBOUND; // Assume we won't raise alpha.
    let bestMoveForNode = 0;

    for (const move of orderedMoves) {
        makeMove(state, move);
        
        // A move is only legal if it does not leave the king in check.
        const kingSq = getLSBIndex(state.pieceBitboards[(state.turn ^ 1) * 6 + K]);
        if (isSquareAttacked_lean(state, kingSq, state.turn)) {
            unmakeMove(state);
            continue;
        }
        legalMovesFound++;

        // --- 4. Recursive Search Call (with PVS) ---
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

        unmakeMove(state);

        if (stopSearch) return 0; // Check again after the recursive call.

        // --- 5. Alpha-Beta Pruning Logic ---
        if (score > bestScore) {
            bestScore = score;
            bestMoveForNode = move;
        }

        if (bestScore > alpha) {
            ttFlag = TT_EXACT; // We have found a new best move, so this is a PV-node.
            alpha = bestScore;
        }

        if (alpha >= beta) {
            // This move is too good; the opponent will not allow this line. Prune the rest.
            if (!getMoveCapture(move)) {
                // Store quiet moves that cause cutoffs as "killer moves".
                if(killerMoves[ply] && killerMoves[ply][0] !== move) {
                    killerMoves[ply][1] = killerMoves[ply][0];
                }
                killerMoves[ply][0] = move;
                // Reward this quiet move in the history table.
                historyTable[getMovePiece(move) + ((state.turn^1) * 6)][getMoveTo(move)] += depth * depth;
            }
            // Store this position in the TT as a lower bound.
            transpositionTable.set(state.zobristHash, { score: beta, depth: depth, flag: TT_LOWERBOUND, move: move });
            return beta;
        }
    }

    // --- 6. Handle Checkmate and Stalemate ---

    if (legalMovesFound === 0) {
        const kingInCheck = isSquareAttacked_lean(state, getLSBIndex(state.pieceBitboards[state.turn * 6 + K]), state.turn ^ 1);
        // If there are no legal moves, it's either checkmate or stalemate.
        // Add ply to the score so the engine prefers faster mates.
        return kingInCheck ? -MATE_SCORE + ply : 0;
    }

    // --- 7. Store Final Result in Transposition Table ---
    if (bestMoveForNode) {
       transpositionTable.set(state.zobristHash, { score: bestScore, depth: depth, flag: ttFlag, move: bestMoveForNode });
    }
    
    return bestScore;
}

/**
 * The root of the search function, using iterative deepening.
 * @param {object} initialState - The starting game state for the search.
 * @param {number} maxDepth - The maximum depth to search.
 * @param {number} maxTime - The maximum time in milliseconds to search.
 * @returns {{bestMove: number, score: number}} The best move found and its evaluation.
 */
function searchRoot(initialState, maxDepth, maxTime) {
    initializeSearch(maxTime);
    let bestMove = 0, bestScore = -Infinity;

    for (let currentDepth = 1; currentDepth <= maxDepth; currentDepth++) {
        let alpha = -Infinity, beta = Infinity;
        
        // Generate and order moves once per depth at the root
        const moves = generateMoves(initialState);
        const orderedMoves = orderMoves(moves, initialState, 0);

        let legalMovesSearched = 0;
        let currentBestMoveForDepth = 0;

        for (const move of orderedMoves) {
            const unmakeInfo = makeMove(initialState, move);
            
            const kingColor = initialState.turn ^ 1;
            const kingSq = getLSBIndex(initialState.pieceBitboards[kingColor * 6 + K]);
            if (isSquareAttacked_lean(initialState, kingSq, initialState.turn)) {
                unmakeMove(initialState, unmakeInfo);
                continue;
            }
            legalMovesSearched++;

            const score = -search(initialState, currentDepth - 1, -beta, -alpha, 1);
            unmakeMove(initialState, unmakeInfo);

            if (stopSearch) break;

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
                currentBestMoveForDepth = move; // Track best move for this iteration
            }
            
            if (score > alpha) {
                alpha = score;
            }
        }
        
        if (stopSearch || legalMovesSearched === 0) {
            break;
        }

        // Post intermediate results if you have a UI that can handle it
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
            
            const hash = state.zobristHash.toString();
            const bookEntry = openingBook.get(hash) || punishmentBook.get(hash);

            if (bookEntry && bookEntry.moves.length > 0) {
                const randomMove = bookEntry.moves[Math.floor(Math.random() * bookEntry.moves.length)];
                postMessage({ type: 'move_result', bestMove: randomMove, score: `Book Move: ${bookEntry.name}`, timeTaken: 0, nodesSearched: 0 });
                return;
            }

            const searchResult = searchRoot(state, 99, maxTime || 4200);
            
            postMessage({
                type: 'move_result',
                bestMove: searchResult.bestMove ? decodeMove(searchResult.bestMove, state.turn) : null,
                score: searchResult.score,
                timeTaken: (performance.now() - searchStartTime).toFixed(2),
                nodesSearched: nodeCount
            });
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
            console.log("Starting bitboard game analysis...");
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
                    console.error("Could not match played move to a legal move!", actualMoveObj);
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
                    result: {
                        classification: classification,
                        bestMove: decodeMove(bestMoveFound, state.turn)
                    }
                });
                makeMove(state, actualMoveInt);
            }
            self.postMessage({ type: 'analysis_finished' });
            break;
        }
    }
};


