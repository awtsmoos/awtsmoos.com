/* B"H */

// =================================================================
//                 PROMETHEUS - CORE HELPERS (BITBOARD v3.0 - OPTIMIZED)
// =================================================================

// --- CONSTANTS ---
const P = 0, N = 1, B = 2, R = 3, Q = 4, K = 5;
const WHITE = 0, BLACK = 1;
const WKCA = 1, WQCA = 2, BKCA = 4, BQCA = 8;
const pieceMap = 'PNBRQKpnbrqk';

// --- BITBOARD MASKS & UTILITIES ---
const NOT_A_FILE = 18374403900871474942n;
const NOT_H_FILE = 9187201950435737471n;
const NOT_HG_FILE = 4557430888798830399n;
const NOT_AB_FILE = 18229723555195321596n;

/**
 * Gets the index of the least significant bit in a bitboard.
 * @param {bigint} bb The bitboard.
 * @returns {number} The index of the LSB (0-63), or -1 if the bitboard is empty.
 */
function getLSBIndex(bb) {
    if (bb === 0n) return -1;
    let index = 0;
    while (!((bb >> BigInt(index)) & 1n)) { index++; }
    return index;
}

/**
 * Clears the least significant bit from a bitboard.
 * @param {bigint} bb The bitboard.
 * @returns {bigint} The bitboard with the LSB removed.
 */
function popBit(bb) { return bb & (bb - 1n); }

// --- PRE-CALCULATED ATTACK TABLES ---
let PAWN_ATTACKS = [[], []];
let KNIGHT_ATTACKS = [];
let KING_ATTACKS = [];

// --- ZOBRIST HASHING ---
var zobristPieceKeys = Array(12).fill(null).map(() => Array(64).fill(0n));
var zobristCastlingKeys = Array(16).fill(0n);
var zobristEnpassantKeys = Array(64).fill(0n);
var zobristTurnKey = 0n;

/**
 * Initializes Zobrist keys for hashing board positions if they haven't been already.
 * Uses a simple pseudo-random number generator for deterministic keys.
 */
function initializeZobristKeys() {
    if (zobristTurnKey !== 0n) return;
    const pseudoRandom = (() => { let seed = 19880128; return () => seed = (seed * 16807) % 2147483647; })();
    const random64 = () => (BigInt(pseudoRandom()) << 32n) | BigInt(pseudoRandom());
    for(let p = 0; p < 12; p++) for(let s = 0; s < 64; s++) zobristPieceKeys[p][s] = random64();
    for(let i = 0; i < 16; i++) zobristCastlingKeys[i] = random64();
    for(let i = 0; i < 64; i++) zobristEnpassantKeys[i] = random64();
    zobristTurnKey = random64();
}

/**
 * Calculates the Zobrist hash for a given game state.
 * @param {object} state The game state object.
 * @returns {bigint} The Zobrist hash.
 */
function calculateZobristHash(state) {
    let hash = 0n;
    for(let p = 0; p < 12; p++) {
        let bb = state.pieceBitboards[p];
        while(bb > 0n) {
            const sq = getLSBIndex(bb);
            hash ^= zobristPieceKeys[p][sq];
            bb = popBit(bb);
        }
    }
    if(state.enpassant !== -1) hash ^= zobristEnpassantKeys[state.enpassant];
    hash ^= zobristCastlingKeys[state.castling];
    if(state.turn === BLACK) hash ^= zobristTurnKey;
    return hash;
}


/**
 * Initializes all pre-calculated data such as attack tables and Zobrist keys.
 * This function is idempotent and safe to call multiple times.
 */
function initializeAll() {
    if (KNIGHT_ATTACKS.length > 0) return;
    initializeZobristKeys();
    for (let sq = 0; sq < 64; sq++) {
        PAWN_ATTACKS[WHITE][sq] = 0n;
        if (((1n << BigInt(sq)) & NOT_A_FILE) !== 0n && sq >= 8) PAWN_ATTACKS[WHITE][sq] |= (1n << BigInt(sq - 9));
        if (((1n << BigInt(sq)) & NOT_H_FILE) !== 0n && sq >= 8) PAWN_ATTACKS[WHITE][sq] |= (1n << BigInt(sq - 7));
        PAWN_ATTACKS[BLACK][sq] = 0n;
        if (((1n << BigInt(sq)) & NOT_A_FILE) !== 0n && sq < 56) PAWN_ATTACKS[BLACK][sq] |= (1n << BigInt(sq + 7));
        if (((1n << BigInt(sq)) & NOT_H_FILE) !== 0n && sq < 56) PAWN_ATTACKS[BLACK][sq] |= (1n << BigInt(sq + 9));
        let knightBB = 1n << BigInt(sq);
        let attacks = 0n;
        if (((knightBB >> 17n) & NOT_H_FILE) !== 0n) attacks |= (knightBB >> 17n);
        if (((knightBB >> 15n) & NOT_A_FILE) !== 0n) attacks |= (knightBB >> 15n);
        if (((knightBB >> 10n) & NOT_HG_FILE) !== 0n) attacks |= (knightBB >> 10n);
        if (((knightBB >> 6n) & NOT_AB_FILE) !== 0n) attacks |= (knightBB >> 6n);
        if (((knightBB << 17n) & NOT_A_FILE) !== 0n) attacks |= (knightBB << 17n);
        if (((knightBB << 15n) & NOT_H_FILE) !== 0n) attacks |= (knightBB << 15n);
        if (((knightBB << 10n) & NOT_AB_FILE) !== 0n) attacks |= (knightBB << 10n);
        if (((knightBB << 6n) & NOT_HG_FILE) !== 0n) attacks |= (knightBB << 6n);
        KNIGHT_ATTACKS[sq] = attacks;
        let kingBB = 1n << BigInt(sq);
        attacks = ((kingBB >> 1n) & NOT_H_FILE) | ((kingBB << 1n) & NOT_A_FILE) | (kingBB >> 8n) | (kingBB << 8n) |
                  ((kingBB >> 7n) & NOT_A_FILE) | ((kingBB >> 9n) & NOT_H_FILE) | ((kingBB << 7n) & NOT_H_FILE) | ((kingBB << 9n) & NOT_A_FILE);
        KING_ATTACKS[sq] = attacks;
    }
}

// --- ON-THE-FLY SLIDER ATTACK GENERATION ---
function getBishopAttacks(sq, blockers) {
    let attacks = 0n; const r = Math.floor(sq / 8), c = sq % 8;
    for (let i = r + 1, j = c + 1; i <= 7 && j <= 7; i++, j++) { attacks |= (1n << BigInt(i * 8 + j)); if ((1n << BigInt(i * 8 + j)) & blockers) break; }
    for (let i = r + 1, j = c - 1; i <= 7 && j >= 0; i++, j--) { attacks |= (1n << BigInt(i * 8 + j)); if ((1n << BigInt(i * 8 + j)) & blockers) break; }
    for (let i = r - 1, j = c + 1; i >= 0 && j <= 7; i--, j++) { attacks |= (1n << BigInt(i * 8 + j)); if ((1n << BigInt(i * 8 + j)) & blockers) break; }
    for (let i = r - 1, j = c - 1; i >= 0 && j >= 0; i--, j--) { attacks |= (1n << BigInt(i * 8 + j)); if ((1n << BigInt(i * 8 + j)) & blockers) break; }
    return attacks;
}
function getRookAttacks(sq, blockers) {
    let attacks = 0n; const r = Math.floor(sq / 8), c = sq % 8;
    for (let i = r + 1; i <= 7; i++) { attacks |= (1n << BigInt(i * 8 + c)); if ((1n << BigInt(i * 8 + c)) & blockers) break; }
    for (let i = r - 1; i >= 0; i--) { attacks |= (1n << BigInt(i * 8 + c)); if ((1n << BigInt(i * 8 + c)) & blockers) break; }
    for (let j = c + 1; j <= 7; j++) { attacks |= (1n << BigInt(r * 8 + j)); if ((1n << BigInt(r * 8 + j)) & blockers) break; }
    for (let j = c - 1; j >= 0; j--) { attacks |= (1n << BigInt(r * 8 + j)); if ((1n << BigInt(r * 8 + j)) & blockers) break; }
    return attacks;
}
function getQueenAttacks(sq, blockers) { return getRookAttacks(sq, blockers) | getBishopAttacks(sq, blockers); }


/**
 * Creates a new game state object from a FEN string.
 * All operations will be performed directly on the bitboards for maximum speed.
 * @param {string} fen - The Forsyth-Edwards Notation string representing the position.
 * @returns {object} The initialized game state object.
 */
function createGameState(fen) {
    initializeAll();
    const state = {
        pieceBitboards: Array(12).fill(0n),
        occupancies: Array(3).fill(0n),
        turn: WHITE, 
        enpassant: -1, 
        castling: 0,
        zobristHash: 0n
    };
    
    const fenParts = fen.split(' ');
    let rank = 0, file = 0;

    for (const char of fenParts[0]) {
        if (char === '/') {
            rank++;
            file = 0;
        } else if (/\d/.test(char)) {
            file += parseInt(char);
        } else {
            const sq = rank * 8 + file;
            const piece = pieceMap.indexOf(char);
            state.pieceBitboards[piece] |= (1n << BigInt(sq));
            file++;
        }
    }
    
    state.occupancies[WHITE] = state.pieceBitboards[P] | state.pieceBitboards[N] | state.pieceBitboards[B] | state.pieceBitboards[R] | state.pieceBitboards[Q] | state.pieceBitboards[K];
    state.occupancies[BLACK] = state.pieceBitboards[P+6] | state.pieceBitboards[N+6] | state.pieceBitboards[B+6] | state.pieceBitboards[R+6] | state.pieceBitboards[Q+6] | state.pieceBitboards[K+6];
    state.occupancies[2] = state.occupancies[WHITE] | state.occupancies[BLACK];
    
    state.turn = (fenParts[1] === 'w') ? WHITE : BLACK;
    if (fenParts[2].includes('K')) state.castling |= WKCA;
    if (fenParts[2].includes('Q')) state.castling |= WQCA;
    if (fenParts[2].includes('k')) state.castling |= BKCA;
    if (fenParts[2].includes('q')) state.castling |= BQCA;
    
    if (fenParts[3] !== '-') {
        state.enpassant = (8 - parseInt(fenParts[3][1])) * 8 + (fenParts[3].charCodeAt(0) - 'a'.charCodeAt(0));
    }

    state.zobristHash = calculateZobristHash(state);
    return state;
}

const castling_rights = [
     7, 15, 15, 15,  3, 15, 15, 11,
    15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15,
    13, 15, 15, 15, 12, 15, 15, 14
];

let moveStack = Array(256).fill(0);
let moveStackPtr = 0;

/**
 * Finds which piece type is on a given square for a given side. Used to identify captured pieces.
 * @param {object} state The game state.
 * @param {number} sq The square index.
 * @returns {number | null} The piece type (P, N, B, R, Q, K) or null if no piece is found.
 */
function findCapturedPieceType(state, sq) {
    const target_bb = 1n << BigInt(sq);
    const enemy = state.turn ^ 1;
    for (let p_type = P; p_type <= K; p_type++) {
        if ((state.pieceBitboards[enemy * 6 + p_type] & target_bb) !== 0n) {
            return p_type;
        }
    }
    return null; // Should not happen for a valid capture, except en passant
}

/**
 * Performs a move on the board state, updating only bitboards. This is hyper-optimized for the search loop.
 * @param {object} state - The game state.
 * @param {number} move - The encoded move integer.
 * @returns {object} Information needed to unmake the move.
 */
function makeMove(state, move) {
    const from = getMoveFrom(move), to = getMoveTo(move), piece = getMovePiece(move), promoted = getMovePromoted(move);
    const side = state.turn, enemy = side ^ 1;
    const from_bb = 1n << BigInt(from), to_bb = 1n << BigInt(to);
    
    // Store state for unmakeMove. The hash must be from *before* the move.
    const unmakeInfo = { 
        move, 
        castling: state.castling, 
        enpassant: state.enpassant, 
        capturedPiece: P, // Default for en passant
        zobristHash: state.zobristHash 
    };
    
    state.pieceBitboards[side * 6 + piece] ^= (from_bb | to_bb);
    state.occupancies[side] ^= (from_bb | to_bb);

    if (getMoveCapture(move)) {
        if (getMoveEnpassant(move)) {
            const captured_pawn_sq = (side === WHITE) ? to + 8 : to - 8;
            state.pieceBitboards[enemy * 6 + P] ^= (1n << BigInt(captured_pawn_sq));
            state.occupancies[enemy] ^= (1n << BigInt(captured_pawn_sq));
        } else {
            unmakeInfo.capturedPiece = findCapturedPieceType(state, to);
            state.pieceBitboards[enemy * 6 + unmakeInfo.capturedPiece] ^= to_bb;
            state.occupancies[enemy] ^= to_bb;
        }
    }
    if (promoted) {
        state.pieceBitboards[side * 6 + P] ^= to_bb;
        state.pieceBitboards[side * 6 + promoted] ^= to_bb;
    }
    if (getMoveCastling(move)) {
        let rook_from, rook_to;
        if (to === 62) { rook_from = 63; rook_to = 61; }
        else if (to === 58) { rook_from = 56; rook_to = 59; }
        else if (to === 6) { rook_from = 7; rook_to = 5; }
        else { rook_from = 0; rook_to = 3; }
        state.pieceBitboards[side * 6 + R] ^= ((1n << BigInt(rook_from)) | (1n << BigInt(rook_to)));
        state.occupancies[side] ^= ((1n << BigInt(rook_from)) | (1n << BigInt(rook_to)));
    }
    
    state.occupancies[2] = state.occupancies[WHITE] | state.occupancies[BLACK];
    state.castling &= castling_rights[from] & castling_rights[to];
    state.enpassant = getMoveDouble(move) ? (side === WHITE ? from - 8 : from + 8) : -1;
    state.turn ^= 1;
    state.zobristHash = calculateZobristHash(state);
    
    // We now use a move stack instead of returning unmake info to avoid object creation overhead.
    moveStack[moveStackPtr++] = unmakeInfo;
    return unmakeInfo; // Return for compatibility if needed elsewhere, though the stack is faster for search.
}


/**
 * Reverts a move on the board state using info from the move stack. Optimized for search.
 * @param {object} state - The game state.
 * @param {object} unmakeInfo - The unmake information from the move stack.
 */
function unmakeMove(state, unmakeInfo) {
    const { move, castling, enpassant, capturedPiece, zobristHash } = unmakeInfo;
    
    state.turn ^= 1;
    const from = getMoveFrom(move), to = getMoveTo(move), piece = getMovePiece(move), promoted = getMovePromoted(move);
    const side = state.turn, enemy = side ^ 1;
    const from_bb = 1n << BigInt(from), to_bb = 1n << BigInt(to);

    state.pieceBitboards[side * 6 + piece] ^= (from_bb | to_bb);
    state.occupancies[side] ^= (from_bb | to_bb);

    if (promoted) {
        state.pieceBitboards[side * 6 + P] ^= to_bb;
        state.pieceBitboards[side * 6 + promoted] ^= to_bb;
    }
    if (getMoveCapture(move)) {
        if (getMoveEnpassant(move)) {
            const captured_pawn_sq = (side === WHITE) ? to + 8 : to - 8;
            state.pieceBitboards[enemy * 6 + P] ^= (1n << BigInt(captured_pawn_sq));
            state.occupancies[enemy] ^= (1n << BigInt(captured_pawn_sq));
        } else {
            state.pieceBitboards[enemy * 6 + capturedPiece] ^= to_bb;
            state.occupancies[enemy] ^= to_bb;
        }
    }
    if (getMoveCastling(move)) {
        let rook_from, rook_to;
        if (to === 62) { rook_from = 63; rook_to = 61; }
        else if (to === 58) { rook_from = 56; rook_to = 59; }
        else if (to === 6) { rook_from = 7; rook_to = 5; }
        else { rook_from = 0; rook_to = 3; }
        state.pieceBitboards[side * 6 + R] ^= ((1n << BigInt(rook_from)) | (1n << BigInt(rook_to)));
        state.occupancies[side] ^= ((1n << BigInt(rook_from)) | (1n << BigInt(rook_to)));
    }
    
    state.occupancies[2] = state.occupancies[WHITE] | state.occupancies[BLACK];
    state.castling = castling;
    state.enpassant = enpassant;
    state.zobristHash = zobristHash;
    moveStackPtr--; // Pop from the stack
}


/**
 * Checks if a specific square is attacked by a piece of a given color.
 * THIS IS THE HYPER-OPTIMIZED VERSION for use inside the search loop.
 * It does NOT generate full attack maps; instead, it checks for attackers
 * by looking "outward" from the target square.
 * @param {object} state - The current game state object with all bitboards.
 * @param {number} sq - The square to check (0-63).
 * @param {number} attackerColor - The color of the attacker (WHITE or BLACK).
 * @returns {boolean} - True if the square is attacked, false otherwise.
 */
function isSquareAttacked_lean(state, sq, attackerColor) {
    const enemyColor = attackerColor ^ 1;
    const blockers = state.occupancies[2];

    if ((PAWN_ATTACKS[enemyColor][sq] & state.pieceBitboards[attackerColor * 6 + P]) !== 0n) return true;
    if ((KNIGHT_ATTACKS[sq] & state.pieceBitboards[attackerColor * 6 + N]) !== 0n) return true;
    if ((KING_ATTACKS[sq] & state.pieceBitboards[attackerColor * 6 + K]) !== 0n) return true;

    const rooksAndQueens = state.pieceBitboards[attackerColor * 6 + R] | state.pieceBitboards[attackerColor * 6 + Q];
    if ((getRookAttacks(sq, blockers) & rooksAndQueens) !== 0n) return true;

    const bishopsAndQueens = state.pieceBitboards[attackerColor * 6 + B] | state.pieceBitboards[attackerColor * 6 + Q];
    if ((getBishopAttacks(sq, blockers) & bishopsAndQueens) !== 0n) return true;

    return false;
}

// --- MOVE ENCODING/DECODING ---
const encodeMove = (from, to, piece, promoted, capture, double, enpassant, castling) => (from) | (to << 6) | (piece << 12) | (promoted << 16) | (capture << 20) | (double << 21) | (enpassant << 22) | (castling << 23);
const getMoveFrom = (move) => move & 0x3f;
const getMoveTo = (move) => (move >> 6) & 0x3f;
const getMovePiece = (move) => (move >> 12) & 0xf;
const getMovePromoted = (move) => (move >> 16) & 0xf;
const getMoveCapture = (move) => (move >> 20) & 1;
const getMoveDouble = (move) => (move >> 21) & 1;
const getMoveEnpassant = (move) => (move >> 22) & 1;
const getMoveCastling = (move) => (move >> 23) & 1;

/**
 * Generates all pseudo-legal moves for the current position.
 * @param {object} state - The current game state.
 * @returns {number[]} An array of encoded moves.
 */
function generateMoves(state) {
    const moves = [];
    const side = state.turn, enemy = side ^ 1;
    const blockers = state.occupancies[2];

    let pawns = state.pieceBitboards[side * 6 + P];
    while (pawns > 0n) {
        const from = getLSBIndex(pawns);
        const rank = side === WHITE ? (7 - Math.floor(from / 8)) : Math.floor(from / 8);
        const one_step = side === WHITE ? from - 8 : from + 8;
        if (one_step >= 0 && one_step < 64 && !((blockers >> BigInt(one_step)) & 1n)) {
            if (rank === 6) {
                moves.push(encodeMove(from, one_step, P, Q, 0, 0, 0, 0), encodeMove(from, one_step, P, R, 0, 0, 0, 0), encodeMove(from, one_step, P, B, 0, 0, 0, 0), encodeMove(from, one_step, P, N, 0, 0, 0, 0));
            } else {
                moves.push(encodeMove(from, one_step, P, 0, 0, 0, 0, 0));
            }
            if (rank === 1) {
                const two_steps = side === WHITE ? from - 16 : from + 16;
                if (!((blockers >> BigInt(two_steps)) & 1n)) moves.push(encodeMove(from, two_steps, P, 0, 0, 1, 0, 0));
            }
        }
        let attacks = PAWN_ATTACKS[side][from] & state.occupancies[enemy];
        while (attacks > 0n) {
            const to = getLSBIndex(attacks);
            if (rank === 6) {
                moves.push(encodeMove(from, to, P, Q, 1, 0, 0, 0), encodeMove(from, to, P, R, 1, 0, 0, 0), encodeMove(from, to, P, B, 1, 0, 0, 0), encodeMove(from, to, P, N, 1, 0, 0, 0));
            } else {
                moves.push(encodeMove(from, to, P, 0, 1, 0, 0, 0));
            }
            attacks = popBit(attacks);
        }
        if (state.enpassant !== -1 && (PAWN_ATTACKS[side][from] & (1n << BigInt(state.enpassant))) !== 0n) {
            moves.push(encodeMove(from, state.enpassant, P, 0, 1, 0, 1, 0));
        }
        pawns = popBit(pawns);
    }
    if (side === WHITE) {
        if ((state.castling & WKCA) && !((blockers >> 61n) & 1n) && !((blockers >> 62n) & 1n) && !isSquareAttacked_lean(state, 60, BLACK) && !isSquareAttacked_lean(state, 61, BLACK)) moves.push(encodeMove(60, 62, K, 0, 0, 0, 0, 1));
        if ((state.castling & WQCA) && !((blockers >> 59n) & 1n) && !((blockers >> 58n) & 1n) && !((blockers >> 57n) & 1n) && !isSquareAttacked_lean(state, 60, BLACK) && !isSquareAttacked_lean(state, 59, BLACK)) moves.push(encodeMove(60, 58, K, 0, 0, 0, 0, 1));
    } else {
        if ((state.castling & BKCA) && !((blockers >> 5n) & 1n) && !((blockers >> 6n) & 1n) && !isSquareAttacked_lean(state, 4, WHITE) && !isSquareAttacked_lean(state, 5, WHITE)) moves.push(encodeMove(4, 6, K, 0, 0, 0, 0, 1));
        if ((state.castling & BQCA) && !((blockers >> 3n) & 1n) && !((blockers >> 2n) & 1n) && !((blockers >> 1n) & 1n) && !isSquareAttacked_lean(state, 4, WHITE) && !isSquareAttacked_lean(state, 3, WHITE)) moves.push(encodeMove(4, 2, K, 0, 0, 0, 0, 1));
    }
    const pieces = [N, B, R, Q, K];
    for (const piece of pieces) {
        let bitboard = state.pieceBitboards[side * 6 + piece];
        while (bitboard > 0n) {
            const from = getLSBIndex(bitboard);
            let attacks = (piece === N) ? KNIGHT_ATTACKS[from] : (piece === B) ? getBishopAttacks(from, blockers) : (piece === R) ? getRookAttacks(from, blockers) : (piece === Q) ? getQueenAttacks(from, blockers) : KING_ATTACKS[from];
            attacks &= ~state.occupancies[side];
            while (attacks > 0n) {
                const to = getLSBIndex(attacks);
                moves.push(encodeMove(from, to, piece, 0, ((state.occupancies[enemy] >> BigInt(to)) & 1n), 0, 0, 0));
                attacks = popBit(attacks);
            }
            bitboard = popBit(bitboard);
        }
    }
    return moves;
}

/**
 * Generates only tactical moves (captures and promotions) for the quiescence search.
 * @param {object} state - The current game state.
 * @returns {number[]} An array of encoded tactical moves.
 */
function generateTacticalMoves(state) {
    const moves = [];
    const side = state.turn, enemy = side ^ 1;
    const blockers = state.occupancies[2];

    let pawns = state.pieceBitboards[side * 6 + P];
    while (pawns > 0n) {
        const from = getLSBIndex(pawns);
        const rank = side === WHITE ? (7 - Math.floor(from / 8)) : Math.floor(from / 8);
        const one_step = side === WHITE ? from - 8 : from + 8;
        if (rank === 6 && one_step >= 0 && one_step < 64 && !((blockers >> BigInt(one_step)) & 1n)) {
            moves.push(encodeMove(from, one_step, P, Q, 0, 0, 0, 0), encodeMove(from, one_step, P, R, 0, 0, 0, 0), encodeMove(from, one_step, P, B, 0, 0, 0, 0), encodeMove(from, one_step, P, N, 0, 0, 0, 0));
        }
        let attacks = PAWN_ATTACKS[side][from] & state.occupancies[enemy];
        while (attacks > 0n) {
            const to = getLSBIndex(attacks);
            if (rank === 6) {
                moves.push(encodeMove(from, to, P, Q, 1, 0, 0, 0), encodeMove(from, to, P, R, 1, 0, 0, 0), encodeMove(from, to, P, B, 1, 0, 0, 0), encodeMove(from, to, P, N, 1, 0, 0, 0));
            } else {
                moves.push(encodeMove(from, to, P, 0, 1, 0, 0, 0));
            }
            attacks = popBit(attacks);
        }
        if (state.enpassant !== -1 && (PAWN_ATTACKS[side][from] & (1n << BigInt(state.enpassant))) !== 0n) {
            moves.push(encodeMove(from, state.enpassant, P, 0, 1, 0, 1, 0));
        }
        pawns = popBit(pawns);
    }
    const pieces = [N, B, R, Q, K];
    for (const piece of pieces) {
        let bitboard = state.pieceBitboards[side * 6 + piece];
        while (bitboard > 0n) {
            const from = getLSBIndex(bitboard);
            let attacks = (piece === N) ? KNIGHT_ATTACKS[from] : (piece === B) ? getBishopAttacks(from, blockers) : (piece === R) ? getRookAttacks(from, blockers) : (piece === Q) ? getQueenAttacks(from, blockers) : KING_ATTACKS[from];
            attacks &= state.occupancies[enemy];
            while (attacks > 0n) {
                const to = getLSBIndex(attacks);
                moves.push(encodeMove(from, to, piece, 0, 1, 0, 0, 0));
                attacks = popBit(attacks);
            }
            bitboard = popBit(bitboard);
        }
    }
    return moves;
}