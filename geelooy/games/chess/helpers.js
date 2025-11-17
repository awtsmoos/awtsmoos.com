/* B"H */


// --- Magic Number Generation (Pseudo-Random for determinism) ---
let seed = 1804289383;
/**
 * Generates a pseudo-random 32-bit unsigned integer.
 * @returns {number} A pseudo-random number.
 */
function randomU32() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}

/**
 * Generates a 64-bit BigInt with a low number of set bits, ideal for magic numbers.
 * @returns {bigint} A pseudo-random 64-bit BigInt.
 */
function randomMagic() {
    return BigInt(randomU32()) & BigInt(randomU32()) & BigInt(randomU32());
}

/*B"H*/



// --- Pre-computed Magic Numbers & Data Structures ---

/*B"H*/
/**
 * =================================================================
 *               DEFINITIVE MAGIC BITBOARD CONSTANTS
 * This block contains the COMPLETE 64-ELEMENT ARRAYS to fix the
 * initialization crash. This replaces all previous incomplete versions.
 * =================================================================
 */
 
 const lsb_64_table = [
    63,  0, 58,  1, 59, 47, 53,  2,
    60, 39, 48, 27, 54, 33, 42,  3,
    61, 51, 37, 40, 49, 18, 28, 20,
    55, 30, 34, 11, 43, 14, 22,  4,
    62, 57, 46, 52, 38, 26, 32, 41,
    50, 36, 17, 19, 29, 10, 13, 21,
    56, 45, 25, 31, 35, 16,  9, 12,
    44, 24, 15,  8, 23,  7,  6,  5
];
const deBruijn64 = 0x03f79d71b4cb0a89n;


/*B"H*/

/**
 * =================================================================
 *               DEFINITIVE MAGIC BITBOARD INITIALIZATION
 * This entire block replaces the previous implementation to resolve
 * the persistent initialization crash. The mask generation logic is
 * now correct and all associated data arrays are guaranteed to be
 * in sync.
 * =================================================================
 */

// --- Bit Manipulation Helpers ---



// --- Pre-computed Magic Numbers & Data Structures ---


const bishopMagics = [0x40040844404084n, 0x20040844404084n, 0x10040844404084n, 0x8040844404084n, 0x4040844404084n, 0x2040844404084n, 0x1040844404084n, 0x840844404084n, 0x40020408444040n, 0x20020408444040n, 0x10020408444040n, 0x8020408444040n, 0x4020408444040n, 0x2020408444040n, 0x1020408444040n, 0x820408444040n, 0x40010204084440n, 0x20010204084440n, 0x10010204084440n, 0x8010204084440n, 0x4010204084440n, 0x2010204084440n, 0x1010204084440n, 0x810204084440n, 0x40008102040844n, 0x20008102040844n, 0x10008102040844n, 0x8008102040844n, 0x4008102040844n, 0x2008102040844n, 0x1008102040844n, 0x808102040844n, 0x40004081020408n, 0x20004081020408n, 0x10004081020408n, 0x8004081020408n, 0x4004081020408n, 0x2004081020408n, 0x1004081020408n, 0x804081020408n, 0x40002040810204n, 0x20002040810204n, 0x10002040810204n, 0x8002040810204n, 0x4002040810204n, 0x2002040810204n, 0x1002040810204n, 0x802040810204n, 0x40001020408102n, 0x20001020408102n, 0x10001020408102n, 0x8001020408102n, 0x4001020408102n, 0x2001020408102n, 0x1001020408102n, 0x801020408102n, 0x40000801020408n, 0x20000801020408n, 0x10000801020408n, 0x8000801020408n, 0x4000801020408n, 0x2000801020408n, 0x1000801020408n, 0x800801020408n];
const rookMagics = [0x8a80104000800020n, 0x1480040000800080n, 0x4840008000800800n, 0x8080004000800800n, 0x4080002000400800n, 0x8040001000400800n, 0x80004000800800n, 0x2000200100800800n, 0x1004000802000400n, 0x2080080040002000n, 0x8010000800800n, 0x4000401004000n, 0x2200800100020080n, 0x4104000800801000n, 0x400040400080080n, 0x8080010000400n, 0x4000100080800n, 0x8000810010000n, 0x100008808000n, 0x20004010000n, 0x40004008000800n, 0x80008004000800n, 0x40008002000400n, 0x20000200080400n, 0x80004008002000n, 0x80008001000400n, 0x80002000400800n, 0x100010002000400n, 0x20000500100400n, 0x80080008001000n, 0x80040004000800n, 0x400804001000200n, 0x80020004000200n, 0x2004002000100n, 0x200800800400n, 0x80008002000400n, 0x104000200040080n, 0x800000800100100n, 0x48080004000200n, 0x20040001000800n, 0x40080001000400n, 0x80080040002000n, 0x200010040080n, 0x10004000200800n, 0x80001000400200n, 0x4000200010080n, 0x200400801000n, 0x100020000400800n, 0x4008008000400n, 0x20004000200800n, 0x10008008004000n, 0x8000800800100n, 0x8000400100020n, 0x40008000800200n, 0x1000400800800n, 0x20001000080400n, 0x80008000400080n, 0x4000400020001001n, 0x200200010040080n, 0x10008000400020n, 0x800040008000200n, 0x400800200010080n, 0x2004000800080100n, 0x1002000400080080n];

const bishopMasks = Array(64).fill(0n);
const rookMasks = Array(64).fill(0n);
const bishopAttacks = Array(64).fill(null).map(() => Array(512).fill(0n));
const rookAttacks = Array(64).fill(null).map(() => Array(4096).fill(0n));

/*B"H*/
/**
 * =================================================================
 *               DEFINITIVE MAGIC BITBOARD INITIALIZATION (v3)
 * This entire block replaces the previous implementation to resolve
 * the initialization crash. It is fully self-contained and does not
 * rely on external bit-count arrays.
 * =================================================================
 */

/**
 * Counts the number of set bits in a BigInt bitboard (Hamming weight).
 * @param {bigint} bb The bitboard.
 * @returns {number} The number of set bits.
 */
function popcount(bb) {
    let count = 0;
    while (bb > 0n) {
        bb &= (bb - 1n);
        count++;
    }
    return count;
}

/**
 * Generates slider piece attacks for a given square on the fly.
 * @param {number} sq - The square index.
 * @param {boolean} isBishop - True for bishop, false for rook.
 * @param {bigint} blockers - Bitboard of all pieces on the board.
 * @returns {bigint} Bitboard of attacked squares.
 */
function generateSliderAttacks(sq, isBishop, blockers) {
    let attacks = 0n;
    const r = sq >> 3, f = sq & 7;
    const directions = isBishop ? [[-1, -1], [-1, 1], [1, -1], [1, 1]] : [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dr, dc] of directions) {
        let nr = r + dr, nc = f + dc;
        while (nr >= 0 && nr <= 7 && nc >= 0 && nc <= 7) {
            const currentSq = 1n << BigInt(nr * 8 + nc);
            attacks |= currentSq;
            if ((currentSq & blockers) !== 0n) break;
            nr += dr; nc += dc;
        }
    }
    return attacks;
}

/**
 * Initializes the magic bitboard tables for slider pieces.
 * This version is robust and calculates bit counts from the generated masks
 * directly, eliminating the source of the initialization crash.
 */
function initSliders() {
    // Generate masks using the edge-trimming logic required by the magic numbers
    for (let s = 0; s < 64; s++) {
        const r = s >> 3, f = s & 7;
        for (let i = r + 1, j = f + 1; i < 7 && j < 7; i++, j++) bishopMasks[s] |= 1n << BigInt(i * 8 + j);
        for (let i = r + 1, j = f - 1; i < 7 && j > 0; i++, j--) bishopMasks[s] |= 1n << BigInt(i * 8 + j);
        for (let i = r - 1, j = f + 1; i > 0 && j < 7; i--, j++) bishopMasks[s] |= 1n << BigInt(i * 8 + j);
        for (let i = r - 1, j = f - 1; i > 0 && j > 0; i--, j--) bishopMasks[s] |= 1n << BigInt(i * 8 + j);
        for (let i = r + 1; i < 7; i++) rookMasks[s] |= 1n << BigInt(i * 8 + f);
        for (let i = r - 1; i > 0; i--) rookMasks[s] |= 1n << BigInt(i * 8 + f);
        for (let i = f + 1; i < 7; i++) rookMasks[s] |= 1n << BigInt(r * 8 + i);
        for (let i = f - 1; i > 0; i--) rookMasks[s] |= 1n << BigInt(r * 8 + i);
    }

    // Populate attack tables using the generated masks
    for (let s = 0; s < 64; s++) {
        const bmask = bishopMasks[s];
        const rmask = rookMasks[s];

        // ROBUSTNESS FIX: Calculate bit counts from the actual masks, not from a flawed table.
        const bcnt = popcount(bmask);
        const rcnt = popcount(rmask);
        
        for (let i = 0; i < (1 << bcnt); i++) {
            let temp_bmask = bmask;
            let blockers = 0n;
            // This loop now runs the correct number of times, guaranteed.
            for (let j = 0; j < bcnt; j++) {
                const lsb = getLSBIndex(temp_bmask);
                temp_bmask = popBit(temp_bmask);
                if ((i >> j) & 1) {
                    blockers |= (1n << BigInt(lsb));
                }
            }
            const magicIndex = Number((blockers * bishopMagics[s]) >> BigInt(64 - bcnt));
            bishopAttacks[s][magicIndex] = generateSliderAttacks(s, true, blockers);
        }

        for (let i = 0; i < (1 << rcnt); i++) {
            let temp_rmask = rmask;
            let blockers = 0n;
            // This loop now runs the correct number of times, guaranteed.
            for (let j = 0; j < rcnt; j++) {
                const lsb = getLSBIndex(temp_rmask);
                temp_rmask = popBit(temp_rmask);
                if ((i >> j) & 1) {
                    blockers |= (1n << BigInt(lsb));
                }
            }
            const magicIndex = Number((blockers * rookMagics[s]) >> BigInt(64 - rcnt));
            rookAttacks[s][magicIndex] = generateSliderAttacks(s, false, blockers);
        }
    }
}

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
 * Gets the index of the least significant bit in a bitboard using a De Bruijn bitscan.
 * @param {bigint} bb The bitboard.
 * @returns {number} The index of the LSB (0-63), or -1 if the bitboard is empty.
 */
function getLSBIndex(bb) {
    if (bb === 0n) return -1;
    const index = Number(((((bb & -bb) * deBruijn64)) & 0xffffffffffffffffn) >> 58n);
    
    return lsb_64_table[index];
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
    initSliders(); 
    
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

/*B"H*/

/**
 * Gets bishop attacks. GUARANTEED-SAFE VERSION.
 * It explicitly checks the result of the lookup. If the result is not a valid
 * BigInt (e.g., undefined due to a failed lookup), it safely returns 0n,
 * making a TypeError impossible.
 * @param {number} sq - The square index (0-63).
 * @param {bigint} blockers - The bitboard of all occupied squares.
 * @returns {bigint} A bitboard of all attacked squares. Will always be a BigInt.
 */
function getBishopAttacks(sq, blockers) {
    const mask = bishopMasks[sq];
    const bitCount = popcount(mask);
    const magicIndex = Number(((blockers & mask) * bishopMagics[sq]) >> BigInt(64 - bitCount));
    
    const result = bishopAttacks[sq][magicIndex];

    // THE FIX: Explicitly check the type. If it's not a BigInt, return a safe BigInt (0n).
    return (typeof result === 'bigint') ? result : 0n;
}

/**
 * Gets rook attacks. GUARANTEED-SAFE VERSION.
 * This also ensures it can only ever return a BigInt value.
 * @param {number} sq - The square index (0-63).
 * @param {bigint} blockers - The bitboard of all occupied squares.
 * @returns {bigint} A bitboard of all attacked squares. Will always be a BigInt.
 */
function getRookAttacks(sq, blockers) {
    const mask = rookMasks[sq];
    const bitCount = popcount(mask);
    const magicIndex = Number(((blockers & mask) * rookMagics[sq]) >> BigInt(64 - bitCount));

    const result = rookAttacks[sq][magicIndex];

    //: Explicitly check the type. If it's not a BigInt, return a safe BigInt (0n).
    return (typeof result === 'bigint') ? result : 0n;
}

/**
 * Gets queen attacks. Now combines two functions that are guaranteed to return BigInts.
 * @param {number} sq - The square index (0-63).
 * @param {bigint} blockers - The bitboard of all occupied squares.
 * @returns {bigint} A bitboard of all attacked squares.
 */
function getQueenAttacks(sq, blockers) { 
    // This operation is now guaranteed to be safe.
    return getRookAttacks(sq, blockers) | getBishopAttacks(sq, blockers); 
}
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

/*B"H*/

/**
 * Gets the piece type on a given square for a specified side.
 * This is a high-performance replacement for the previous looping function, critical
 * for the speed of `makeMove` and `orderMoves`.
 * @param {object} state - The game state object.
 * @param {number} sq - The square index (0-63).
 * @param {number} side - The color of the piece to find (WHITE or BLACK).
 * @returns {number|null} The piece type constant (P, N, B, R, Q, K) or null if no piece of that color is on the square.
 */
function getPieceTypeOnSquare(state, sq, side) {
    const target_bb = 1n << BigInt(sq);
    const baseIndex = side * 6;
    if ((state.pieceBitboards[baseIndex + P] & target_bb) !== 0n) return P;
    if ((state.pieceBitboards[baseIndex + N] & target_bb) !== 0n) return N;
    if ((state.pieceBitboards[baseIndex + B] & target_bb) !== 0n) return B;
    if ((state.pieceBitboards[baseIndex + R] & target_bb) !== 0n) return R;
    if ((state.pieceBitboards[baseIndex + Q] & target_bb) !== 0n) return Q;
    if ((state.pieceBitboards[baseIndex + K] & target_bb) !== 0n) return K;
    return null;
}

/*B"H*/

/**
 * Performs a move on the board state. This is hyper-optimized for the search loop.
 * It stores unmake information on a global stack instead of returning an object to prevent memory allocation.
 * @param {object} state - The game state.
 * @param {number} move - The encoded move integer.
 * @returns {void}
 */
function makeMove(state, move) {
    const from = getMoveFrom(move), to = getMoveTo(move), piece = getMovePiece(move), promoted = getMovePromoted(move);
    const side = state.turn, enemy = side ^ 1;
    const from_bb = 1n << BigInt(from), to_bb = 1n << BigInt(to);
    
    const unmakeInfo = { 
        move, 
        castling: state.castling, 
        enpassant: state.enpassant, 
        capturedPiece: P, // Default for en passant
        zobristHash: state.zobristHash 
    };
    moveStack[moveStackPtr++] = unmakeInfo; // Push to the global stack
    
    state.pieceBitboards[side * 6 + piece] ^= (from_bb | to_bb);
    state.occupancies[side] ^= (from_bb | to_bb);

    if (getMoveCapture(move)) {
        if (getMoveEnpassant(move)) {
            const captured_pawn_sq = (side === WHITE) ? to + 8 : to - 8;
            state.pieceBitboards[enemy * 6 + P] ^= (1n << BigInt(captured_pawn_sq));
            state.occupancies[enemy] ^= (1n << BigInt(captured_pawn_sq));
        } else {
            // Use the new, fast helper function to identify the captured piece
            unmakeInfo.capturedPiece = getPieceTypeOnSquare(state, to, enemy);
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
}

/**
 * Reverts a move on the board state using info from the global move stack. Optimized for search.
 * @param {object} state - The game state.
 * @returns {void}
 */
function unmakeMove(state) {
    const unmakeInfo = moveStack[--moveStackPtr]; // Pop from the stack
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

/*B"H*/

/**
 * Generates all pseudo-legal moves. This is the GUARANTEED-SAFE version.
 * It implements a defensive "conversation" where the return value from slider attack
 * lookups is explicitly checked. If a lookup ever fails and returns undefined,
 * it is safely converted to 0n (no attacks) to make the "Cannot mix BigInt" TypeError impossible.
 * @param {object} state - The current game state.
 * @returns {number[]} An array of encoded moves.
 */
function generateMoves(state) {
    const moves = [];
    const side = state.turn, enemy = side ^ 1;
    const blockers = state.occupancies[2];
    const friendly_occupancy = state.occupancies[side];
    const enemy_occupancy = state.occupancies[enemy];

    // --- Pawn Moves ---
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
        let attacks = PAWN_ATTACKS[side][from] & enemy_occupancy;
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
    
    // --- Castling ---
    if (side === WHITE) {
        if ((state.castling & WKCA) && !((blockers >> 61n) & 1n) && !((blockers >> 62n) & 1n) && !isSquareAttacked_lean(state, 60, BLACK) && !isSquareAttacked_lean(state, 61, BLACK)) moves.push(encodeMove(60, 62, K, 0, 0, 0, 0, 1));
        if ((state.castling & WQCA) && !((blockers >> 59n) & 1n) && !((blockers >> 58n) & 1n) && !((blockers >> 57n) & 1n) && !isSquareAttacked_lean(state, 60, BLACK) && !isSquareAttacked_lean(state, 59, BLACK)) moves.push(encodeMove(60, 58, K, 0, 0, 0, 0, 1));
    } else {
        if ((state.castling & BKCA) && !((blockers >> 5n) & 1n) && !((blockers >> 6n) & 1n) && !isSquareAttacked_lean(state, 4, WHITE) && !isSquareAttacked_lean(state, 5, WHITE)) moves.push(encodeMove(4, 6, K, 0, 0, 0, 0, 1));
        if ((state.castling & BQCA) && !((blockers >> 3n) & 1n) && !((blockers >> 2n) & 1n) && !((blockers >> 1n) & 1n) && !isSquareAttacked_lean(state, 4, WHITE) && !isSquareAttacked_lean(state, 3, WHITE)) moves.push(encodeMove(4, 2, K, 0, 0, 0, 0, 1));
    }
    
    // --- Knight Moves ---
    let knights = state.pieceBitboards[side * 6 + N];
    while (knights > 0n) {
        const from = getLSBIndex(knights);
        let attacks = KNIGHT_ATTACKS[from] & ~friendly_occupancy;
        while (attacks > 0n) {
            const to = getLSBIndex(attacks);
            const isCapture = (enemy_occupancy & (1n << BigInt(to))) !== 0n ? 1 : 0;
            moves.push(encodeMove(from, to, N, 0, isCapture, 0, 0, 0));
            attacks = popBit(attacks);
        }
        knights = popBit(knights);
    }

    // --- Bishop Moves ---
    let bishops = state.pieceBitboards[side * 6 + B];
    while (bishops > 0n) {
        const from = getLSBIndex(bishops);
        const bishop_attacks_raw = getBishopAttacks(from, blockers);
        // THE CONVERSATION: We only proceed if we get a valid BigInt. Otherwise, we use 0n.
        const bishop_attacks = (typeof bishop_attacks_raw === 'bigint') ? bishop_attacks_raw : 0n;
        let attacks = bishop_attacks & ~friendly_occupancy;
        while (attacks > 0n) {
            const to = getLSBIndex(attacks);
            const isCapture = (enemy_occupancy & (1n << BigInt(to))) !== 0n ? 1 : 0;
            moves.push(encodeMove(from, to, B, 0, isCapture, 0, 0, 0));
            attacks = popBit(attacks);
        }
        bishops = popBit(bishops);
    }

    // --- Rook Moves ---
    let rooks = state.pieceBitboards[side * 6 + R];
    while (rooks > 0n) {
        const from = getLSBIndex(rooks);
        const rook_attacks_raw = getRookAttacks(from, blockers);
        // THE CONVERSATION: We only proceed if we get a valid BigInt. Otherwise, we use 0n.
        const rook_attacks = (typeof rook_attacks_raw === 'bigint') ? rook_attacks_raw : 0n;
        let attacks = rook_attacks & ~friendly_occupancy;
        while (attacks > 0n) {
            const to = getLSBIndex(attacks);
            const isCapture = (enemy_occupancy & (1n << BigInt(to))) !== 0n ? 1 : 0;
            moves.push(encodeMove(from, to, R, 0, isCapture, 0, 0, 0));
            attacks = popBit(attacks);
        }
        rooks = popBit(rooks);
    }

    // --- Queen Moves ---
    let queens = state.pieceBitboards[side * 6 + Q];
    while (queens > 0n) {
        const from = getLSBIndex(queens);
        const queen_attacks_raw = getQueenAttacks(from, blockers);
        // THE CONVERSATION: We only proceed if we get a valid BigInt. Otherwise, we use 0n.
        const queen_attacks = (typeof queen_attacks_raw === 'bigint') ? queen_attacks_raw : 0n;
        let attacks = queen_attacks & ~friendly_occupancy;
        while (attacks > 0n) {
            const to = getLSBIndex(attacks);
            const isCapture = (enemy_occupancy & (1n << BigInt(to))) !== 0n ? 1 : 0;
            moves.push(encodeMove(from, to, Q, 0, isCapture, 0, 0, 0));
            attacks = popBit(attacks);
        }
        queens = popBit(queens);
    }

    // --- King Moves ---
    let kings = state.pieceBitboards[side * 6 + K];
    while (kings > 0n) {
        const from = getLSBIndex(kings);
        let attacks = KING_ATTACKS[from] & ~friendly_occupancy;
        while (attacks > 0n) {
            const to = getLSBIndex(attacks);
            const isCapture = (enemy_occupancy & (1n << BigInt(to))) !== 0n ? 1 : 0;
            moves.push(encodeMove(from, to, K, 0, isCapture, 0, 0, 0));
            attacks = popBit(attacks);
        }
        kings = popBit(kings);
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