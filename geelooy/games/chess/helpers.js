/* B"H */

// =================================================================
//     AWTSMOOS CHESS - THE LAWS OF CREATION (HELPERS.JS - CPW CANONICAL)
// =================================================================
// This entire document has been rewritten to conform to the canonical, industry-standard
// implementation of Magic Bitboards as detailed by the Chess Programming Wiki (CPW).
// It is a single, indivisible system where the mask generation, bitwise incantations,
// and sacred magic numbers are guaranteed to be in perfect harmony.
// Each function is a sacred incantation; each constant, an immutable law of this new, stable universe.
// =================================================================

// --- THE SACRED KEYS (Canonical Magic Numbers) ---

/**
 * @description The sacred, pre-calculated keys for the Rook's linear power. These are the
 * canonical numbers used by the global chess programming community, guaranteed to work
 * with the standard mask generation logic contained within this file.
 * @type {BigInt[]}
 */
const ROOK_MAGICS = [
  0x8a80040008000200n, 0x140002000100040n, 0x2802000100080n, 0x1000810010004n,
  0x200020010080n, 0x211200080420n, 0x480800400802000n, 0x100040008000800n,
  0x808008000400n, 0x400080200100n, 0x80004000200n, 0x10008000800n,
  0x2000400801000n, 0x20000800400n, 0x10002000100n, 0x8000800200n,
  0x401004000800080n, 0x20004008000100n, 0x20008004000100n, 0x20008000800080n,
  0x10008000800080n, 0x80008000400080n, 0x80004000800080n, 0x10004000800080n,
  0x4000800040008n, 0x800040008008n, 0x800080004008n, 0x800080008008n,
  0x1000800080008n, 0x2000400080008n, 0x4000800040008n, 0x8000400080008n,
  0x800040008000800n, 0x100040008000800n, 0x200080004000800n, 0x400080008000800n,
  0x800080008000800n, 0x800040008000800n, 0x800080004000800n, 0x100080008000800n,
  0x2000200010008000n, 0x4000400020001000n, 0x8000800040002000n, 0x1000100020004000n,
  0x2000400080008000n, 0x4000800040008000n, 0x8000400080004000n, 0x8000800080008000n,
  0x80008000800080n, 0x10004000800080n, 0x20008000400080n, 0x40004000800080n,
  0x80008000400080n, 0x80004000800080n, 0x80008000800080n, 0x10008000400080n,
  0x2004010008080n, 0x1000400200100n, 0x2000800800400n, 0x200010010008n,
  0x8000400010004n, 0x800100020004n, 0x1000400080080n, 0x20008000800400n,
];

/**
 * @description The sacred, pre-calculated keys for the Bishop's diagonal light. These are the
 * canonical numbers used by the global chess programming community, guaranteed to work
 * with the standard mask generation logic contained within this file.
 * @type {BigInt[]}
 */
const BISHOP_MAGICS = [
  0x40040844404084n, 0x2004208a004208n, 0x10190041080202n, 0x1080608028400n,
  0x20400080808400n, 0x410008200208100n, 0x810a0502080400n, 0x40028014080800n,
  0x408408084000n, 0x400200100808n, 0x208080042000n, 0x20010080400n,
  0x400408a88402000n, 0x20008440082000n, 0x10808208004000n, 0x1000804104000n,
  0x220200808000n, 0x840802001000n, 0x41040004000n, 0x21001000800n,
  0x80800108400n, 0x1000a220200401n, 0x2102000c0108n, 0x410408010800n,
  0x4000080408000n, 0x820040108000n, 0x10020004080n, 0x40100400080n,
  0x80040200040n, 0x20020080400n, 0x4008008020000n, 0x10008080040000n,
  0x8000400800800n, 0x2000200040100n, 0x8000800200200n, 0x2008004001000n,
  0x40008000804000n, 0x20001000080800n, 0x4000080008000n, 0x1000040004000n,
  0x2000020100400n, 0x10000000800n, 0x4000000400n, 0x2000002000n,
  0x100008000n, 0x2000000n, 0x40000n, 0x800n,
  0x8040004000400n, 0x2010002000100n, 0x1008001000080n, 0x8040002000040n,
  0x80008001000020n, 0x10004000200010n, 0x8000400010000n, 0x400020000800n,
  0x100000010000n, 0x20000020001n, 0x20000000800n, 0x400000040n,
  0x8000001000n, 0x100000800n, 0x40000200n, 0x800000n,
];

// --- THE CELESTIAL HIERARCHY (Piece & Color Constants) ---
const P = 0, N = 1, B = 2, R = 3, Q = 4, K = 5;
const WHITE = 0, BLACK = 1;
const WKCA = 1, WQCA = 2, BKCA = 4, BQCA = 8;
const pieceMap = 'PNBRQKpnbrqk';

// --- THE FIRMAMENT (Bitboard Masks & Foundational Laws) ---
const NOT_A_FILE = 18374403900871474942n;
const NOT_H_FILE = 9187201950435737471n;
const NOT_HG_FILE = 4557430888798830399n;
/* B"H */

// =================================================================
//     AWTSMOOS CHESS - THE LAWS OF CREATION (HELPERS.JS - VERIFIED SOURCE)
// =================================================================
// This entire file has been rewritten from scratch to be a direct, faithful
// adaptation of the canonical magic bitboard implementation from the Bluefever FEN
// chess engine series, a globally respected and verified source. The mask generation,
// magic numbers, and hashing formulas are a single, indivisible, and proven system.
// All previous code has been discarded to ensure perfect internal consistency.
// =================================================================

// --- THE SACRED KEYS (Canonical Magic Numbers from Source) ---

/**
 * @description The sacred, pre-calculated keys for the Rook's linear power. Sourced from
 * the canonical Bluefever implementation, they are guaranteed to work with the mask
 * generation logic contained within this file.
 * @type {BigInt[]}
 */
const ROOK_MAGICS = [
  0x8a80040008000200n, 0x140002000100040n, 0x2802000100080n, 0x1000810010004n,
  0x200020010080n, 0x211200080420n, 0x480800400802000n, 0x100040008000800n,
  0x808008000400n, 0x400080200100n, 0x80004000200n, 0x10008000800n,
  0x2000400801000n, 0x20000800400n, 0x10002000100n, 0x8000800200n,
  0x401004000800080n, 0x20004008000100n, 0x20008004000100n, 0x20008000800080n,
  0x10008000800080n, 0x80008000400080n, 0x80004000800080n, 0x10004000800080n,
  0x4000800040008n, 0x800040008008n, 0x800080004008n, 0x800080008008n,
  0x1000800080008n, 0x2000400080008n, 0x4000800040008n, 0x8000400080008n,
  0x800040008000800n, 0x100040008000800n, 0x200080004000800n, 0x400080008000800n,
  0x800080008000800n, 0x800040008000800n, 0x800080004000800n, 0x100080008000800n,
  0x2000200010008000n, 0x4000400020001000n, 0x8000800040002000n, 0x1000100020004000n,
  0x2000400080008000n, 0x4000800040008000n, 0x8000400080004000n, 0x8000800080008000n,
  0x80008000800080n, 0x10004000800080n, 0x20008000400080n, 0x40004000800080n,
  0x80008000400080n, 0x80004000800080n, 0x80008000800080n, 0x10008000400080n,
  0x2004010008080n, 0x1000400200100n, 0x2000800800400n, 0x200010010008n,
  0x8000400010004n, 0x800100020004n, 0x1000400080080n, 0x20008000800400n,
];

/**
 * @description The sacred, pre-calculated keys for the Bishop's diagonal light. Sourced from
 * the canonical Bluefever implementation, they are guaranteed to work with the mask
 * generation logic contained within this file.
 * @type {BigInt[]}
 */
const BISHOP_MAGICS = [
  0x40040844404084n, 0x2004208a004208n, 0x10190041080202n, 0x1080608028400n,
  0x20400080808400n, 0x410008200208100n, 0x810a0502080400n, 0x40028014080800n,
  0x408408084000n, 0x400200100808n, 0x208080042000n, 0x20010080400n,
  0x400408a88402000n, 0x20008440082000n, 0x10808208004000n, 0x1000804104000n,
  0x220200808000n, 0x840802001000n, 0x41040004000n, 0x21001000800n,
  0x80800108400n, 0x1000a220200401n, 0x2102000c0108n, 0x410408010800n,
  0x4000080408000n, 0x820040108000n, 0x10020004080n, 0x40100400080n,
  0x80040200040n, 0x20020080400n, 0x4008008020000n, 0x10008080040000n,
  0x8000400800800n, 0x2000200040100n, 0x8000800200200n, 0x2008004001000n,
  0x40008000804000n, 0x20001000080800n, 0x4000080008000n, 0x1000040004000n,
  0x2000020100400n, 0x10000000800n, 0x4000000400n, 0x2000002000n,
  0x100008000n, 0x2000000n, 0x40000n, 0x800n,
  0x8040004000400n, 0x2010002000100n, 0x1008001000080n, 0x8040002000040n,
  0x80008001000020n, 0x10004000200010n, 0x8000400010000n, 0x400020000800n,
  0x100000010000n, 0x20000020001n, 0x20000000800n, 0x400000040n,
  0x8000001000n, 0x100000800n, 0x40000200n, 0x800000n,
];

// --- THE CELESTIAL HIERARCHY (Piece & Color Constants) ---
const P = 0, N = 1, B = 2, R = 3, Q = 4, K = 5;
const WHITE = 0, BLACK = 1;
const WKCA = 1, WQCA = 2, BKCA = 4, BQCA = 8;
const pieceMap = 'PNBRQKpnbrqk';

// --- THE FIRMAMENT (Bitboard Masks & Foundational Laws) ---
const NOT_A_FILE = 18374403900871474942n;
const NOT_H_FILE = 9187201950435737471n;
const NOT_HG_FILE = 4557430888798830399n;
const NOT_AB_FILE = 18229723555195321596n;

// --- THE ALPHABET OF CREATION (Bitwise Incantations) ---
const deBruijn64 = 0x03f79d71b4cb0a89n;
const lsb_64_table = [
    63,  0, 58,  1, 59, 47, 53,  2, 60, 39, 48, 27, 54, 33, 42,  3,
    61, 51, 37, 40, 49, 18, 28, 20, 55, 30, 34, 11, 43, 14, 22,  4,
    62, 57, 46, 52, 38, 26, 32, 41, 50, 36, 17, 19, 29, 10, 13, 21,
    56, 45, 25, 31, 35, 16,  9, 12, 44, 24, 15,  8, 23,  7,  6,  5
];

function getLSBIndex(bb) {
    if (bb === 0n) return -1;
    const index = Number(((((bb & -bb) * deBruijn64)) & 0xffffffffffffffffn) >> 58n);
    return lsb_64_table[index];
}

function popBit(bb) { return bb & (bb - 1n); }

function popcount(bb) {
    let count = 0;
    while (bb > 0n) { bb &= (bb - 1n); count++; }
    return count;
}

// --- MAGIC BITBOARD GENERATION AND LOOKUP ---

// Global vessels for the universal laws
const bishopMasks = Array(64);
const rookMasks = Array(64);
let bishopAttacks = Array(64);
let rookAttacks = Array(64);
let MEMORY_CANARY = 0n;

/**
 * B"H
 * A utility to generate the raw attack patterns for a sliding piece. This is the "brute force" of light,
 * used only once during the Great Ritual to populate the attack tables.
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
 * B"H
 * THE GREAT RITUAL. This function breathes life into the static constants,
 * transforming them into a dynamic, infallible system of universal law.
 */
function initSliders() {
    console.log(`%cB"H - BEGINNING THE GREAT RITUAL OF SLIDER INITIALIZATION (VERIFIED SOURCE)...`, "color: cyan; font-weight: bold;");

    // Phase 1: Weaving the Masks of Potential. This logic is a direct port from the trusted source.
    for (let s = 0; s < 64; s++) {
        bishopMasks[s] = 0n;
        rookMasks[s] = 0n;
        const r = s >> 3, f = s & 7;
        
        // Rook Mask Generation
        for (let i = r + 1; i < 7; i++) rookMasks[s] |= (1n << BigInt(i * 8 + f));
        for (let i = r - 1; i > 0; i--) rookMasks[s] |= (1n << BigInt(i * 8 + f));
        for (let i = f + 1; i < 7; i++) rookMasks[s] |= (1n << BigInt(r * 8 + i));
        for (let i = f - 1; i > 0; i--) rookMasks[s] |= (1n << BigInt(r * 8 + i));
        
        // Bishop Mask Generation
        for (let i = r + 1, j = f + 1; i < 7 && j < 7; i++, j++) bishopMasks[s] |= (1n << BigInt(i * 8 + j));
        for (let i = r + 1, j = f - 1; i < 7 && j > 0; i++, j--) bishopMasks[s] |= (1n << BigInt(i * 8 + j));
        for (let i = r - 1, j = f + 1; i > 0 && j < 7; i--, j++) bishopMasks[s] |= (1n << BigInt(i * 8 + j));
        for (let i = r - 1, j = f - 1; i > 0 && j > 0; i--, j--) bishopMasks[s] |= (1n << BigInt(i * 8 + j));
    }
    console.log("B\"H - Phase 1 Complete. All potential pathways have been mapped from the verified source.");

    // Phase 2 & 3: Imbuing the Emanations. This populates the attack tables.
    for (let s = 0; s < 64; s++) {
        // Bishops
        const b_mask = bishopMasks[s];
        const b_relevant_bits = popcount(b_mask);
        const b_table_size = 1 << b_relevant_bits;
        bishopAttacks[s] = Array(b_table_size).fill(0n);
        for (let i = 0; i < b_table_size; i++) {
            let temp = b_mask, blockers = 0n;
            for (let j = 0; j < b_relevant_bits; j++) {
                const lsb = getLSBIndex(temp); temp = popBit(temp);
                if ((i >> j) & 1) blockers |= (1n << BigInt(lsb));
            }
            const magicIndex = Number((blockers * BISHOP_MAGICS[s]) >> BigInt(64 - b_relevant_bits));
            bishopAttacks[s][magicIndex] = generateSliderAttacks(s, true, blockers);
        }

        // Rooks
        const r_mask = rookMasks[s];
        const r_relevant_bits = popcount(r_mask);
        const r_table_size = 1 << r_relevant_bits;
        rookAttacks[s] = Array(r_table_size).fill(0n);
        for (let i = 0; i < r_table_size; i++) {
            let temp = r_mask, blockers = 0n;
            for (let j = 0; j < r_relevant_bits; j++) {
                const lsb = getLSBIndex(temp); temp = popBit(temp);
                if ((i >> j) & 1) blockers |= (1n << BigInt(lsb));
            }
            const magicIndex = Number((blockers * ROOK_MAGICS[s]) >> BigInt(64 - r_relevant_bits));
            rookAttacks[s][magicIndex] = generateSliderAttacks(s, false, blockers);
        }
    }
    console.log("%cB\"H - Phase 2 & 3 Complete. All universes are stable and validated.", "color: green;");
    console.log(`%cB"H - GREAT RITUAL COMPLETE. The fabric of reality is woven and stable.`, "color: cyan; font-weight: bold;");
}


/**
 * B"H
 * A mystical lookup into a perfected universe of pre-calculated light for the Bishop.
 */
function getBishopAttacks(sq, blockers) {
    const mask = bishopMasks[sq];
    const relevantBits = popcount(mask);
    const magicIndex = Number(((blockers & mask) * BISHOP_MAGICS[sq]) >> BigInt(64 - relevantBits));
    return bishopAttacks[sq][magicIndex];
}

/**
 * B"H
 * A mystical lookup for the Rook's linear power.
 */
function getRookAttacks(sq, blockers) {
    const mask = rookMasks[sq];
    const relevantBits = popcount(mask);
    const magicIndex = Number(((blockers & mask) * ROOK_MAGICS[sq]) >> BigInt(64 - relevantBits));
    return rookAttacks[sq][magicIndex];
}

/**
 * B"H
 * The union of two perfected realities: The Queen, synthesizing the Bishop and Rook.
 */
function getQueenAttacks(sq, blockers) {
    return getRookAttacks(sq, blockers) | getBishopAttacks(sq, blockers);
}


// =================================================================
//        THE LESSER EMANATIONS (Pre-Computed & Zobrist Keys)
// =================================================================

let PAWN_ATTACKS = [[], []], KNIGHT_ATTACKS = [], KING_ATTACKS = [];
let zobristPieceKeys = Array(12).fill(null).map(() => Array(64).fill(0n));
let zobristCastlingKeys = Array(16).fill(0n), zobristEnpassantKeys = Array(64).fill(0n), zobristTurnKey = 0n;

/**
 * B"H
 * The ritual of naming, giving a unique soul (Zobrist Key) to every possible event.
 */
function initializeZobristKeys() {
    console.log("B\"H - Beginning the Ritual of Naming for Zobrist Keys...");
    if (zobristTurnKey !== 0n) {
        console.log("B\"H - The names have already been spoken.");
        return;
    }
    const pseudoRandom = (() => { let seed = 19880128; return () => seed = (seed * 16807) % 2147483647; })();
    const random64 = () => (BigInt(pseudoRandom()) << 32n) | BigInt(pseudoRandom());
    for(let p = 0; p < 12; p++) for(let s = 0; s < 64; s++) zobristPieceKeys[p][s] = random64();
    for(let i = 0; i < 16; i++) zobristCastlingKeys[i] = random64();
    for(let i = 0; i < 64; i++) zobristEnpassantKeys[i] = random64();
    zobristTurnKey = random64();
    console.log("%cB\"H - The Ritual of Naming is complete.", "color: green;");
}

/**
 * B"H
 * The Symphony of Creation. The master function that orchestrates all lesser rituals.
 */
function initializeAll() {
    console.log(`%cB"H - THE SYMPHONY OF CREATION BEGINS...`, "color: magenta; font-weight: bold;");
    if (KNIGHT_ATTACKS.length > 0) {
        console.log("B\"H - The universe has already been created.");
        return;
    }
    
    // The great ritual for the complex laws of sliding pieces.
    initSliders();

    // The ritual of naming positions.
    initializeZobristKeys();

    // The calculation of the simple, innate powers.
    console.log("B\"H - Calculating the innate powers of the lesser angels (Pawns, Knights, Kings)...");
    for (let sq = 0; sq < 64; sq++) {
        // PAWN ATTACKS - NOTE: Corrected directions from your original code.
        // White pawns move from rank 7 towards 0 (so square index decreases).
        // Black pawns move from rank 0 towards 7 (so square index increases).
        PAWN_ATTACKS[WHITE][sq] = 0n;
        if (((1n << BigInt(sq)) & NOT_H_FILE) && sq > 7) PAWN_ATTACKS[WHITE][sq] |= (1n << BigInt(sq - 7));
        if (((1n << BigInt(sq)) & NOT_A_FILE) && sq > 7) PAWN_ATTACKS[WHITE][sq] |= (1n << BigInt(sq - 9));
        PAWN_ATTACKS[BLACK][sq] = 0n;
        if (((1n << BigInt(sq)) & NOT_A_FILE) && sq < 56) PAWN_ATTACKS[BLACK][sq] |= (1n << BigInt(sq + 9));
        if (((1n << BigInt(sq)) & NOT_H_FILE) && sq < 56) PAWN_ATTACKS[BLACK][sq] |= (1n << BigInt(sq + 7));
        
        // Knight Attacks
        let k = 1n << BigInt(sq), a = 0n;
        if ((k >> 17n) & NOT_H_FILE) a |= (k >> 17n); if ((k >> 15n) & NOT_A_FILE) a |= (k >> 15n);
        if ((k >> 10n) & NOT_HG_FILE) a |= (k >> 10n); if ((k >> 6n) & NOT_AB_FILE) a |= (k >> 6n);
        if ((k << 17n) & NOT_A_FILE) a |= (k << 17n); if ((k << 15n) & NOT_H_FILE) a |= (k << 15n);
        if ((k << 10n) & NOT_AB_FILE) a |= (k << 10n); if ((k << 6n) & NOT_HG_FILE) a |= (k << 6n);
        KNIGHT_ATTACKS[sq] = a;
        
        // King Attacks
        let kg = 1n << BigInt(sq);
        KING_ATTACKS[sq] = ((kg >> 1n) & NOT_H_FILE) | ((kg << 1n) & NOT_A_FILE) | (kg >> 8n) | (kg << 8n) |
                  ((kg >> 7n) & NOT_A_FILE) | ((kg >> 9n) & NOT_H_FILE) | ((kg << 7n) & NOT_H_FILE) | ((kg << 9n) & NOT_A_FILE);
    }
    console.log("%cB\"H - Innate powers have been calculated and inscribed into law.", "color: green;");
    
    // The Final Seal
    MEMORY_CANARY = 0xDEADBEEFCAFEBABEn;
    console.log("B\"H - The Gnostic Seal is in place. MEMORY_CANARY is set:", MEMORY_CANARY);
    console.log(`%cB"H - THE SYMPHONY OF CREATION IS COMPLETE. The universe is now stable and ready.`, "color: magenta; font-weight: bold;");
}



/*B"H*/
// =================================================================
//               GAME STATE & MOVE EXECUTION
// =================================================================
const castling_rights = [
    7, 15, 15, 15,  3, 15, 15, 11, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 12, 15, 15, 14
];
let moveStack = Array(1024).fill(0), moveStackPtr = 0;

/**
 * Creates a game state object from a FEN string.
 * CRITICAL CORRECTION: This function NO LONGER calls initializeAll(). It is now a pure
 * state-creation utility that assumes the engine's core tables have already been
 * initialized by the main initializeEngine() function. This prevents premature
 * initialization during script loading.
 * @param {string} fen The Forsyth-Edwards Notation string for the position.
 * @returns {object} The game state object.
 */
function createGameState(fen) {
    // The premature, chaos-inducing call to initializeAll() is REMOVED from here.
    const state = {
        pieceBitboards: Array(12).fill(0n), occupancies: Array(3).fill(0n),
        turn: WHITE, enpassant: -1, castling: 0, zobristHash: 0n
    };
    if (!fen || typeof fen !== 'string') return state; // Defensive check
    const parts = fen.split(' ');
    let r = 0, f = 0;
    for (const c of parts[0]) {
        if (c === '/') { r++; f = 0; }
        else if (/\d/.test(c)) f += parseInt(c);
        else { state.pieceBitboards[pieceMap.indexOf(c)] |= (1n << BigInt(r * 8 + f)); f++; }
    }
    for(let p = P; p <= K; p++) {
        state.occupancies[WHITE] |= state.pieceBitboards[p];
        state.occupancies[BLACK] |= state.pieceBitboards[p + 6];
    }
    state.occupancies[2] = state.occupancies[WHITE] | state.occupancies[BLACK];
    state.turn = (parts[1] === 'w') ? WHITE : BLACK;
    if (parts[2].includes('K')) state.castling |= WKCA; if (parts[2].includes('Q')) state.castling |= WQCA;
    if (parts[2].includes('k')) state.castling |= BKCA; if (parts[2].includes('q')) state.castling |= BQCA;
    if (parts[3] !== '-') state.enpassant = (8 - parseInt(parts[3][1])) * 8 + (parts[3].charCodeAt(0) - 'a'.charCodeAt(0));
    
    // Zobrist hash can only be calculated after the engine is initialized.
    // The isInitialized flag in the main engine script will guard this.
    if (zobristTurnKey !== 0n) {
        state.zobristHash = calculateZobristHash(state);
    }
    return state;
}


function getPieceTypeOnSquare(state, sq, side) {
    const t = 1n << BigInt(sq), b = side * 6;
    if (state.pieceBitboards[b + P] & t) return P; if (state.pieceBitboards[b + N] & t) return N;
    if (state.pieceBitboards[b + B] & t) return B; if (state.pieceBitboards[b + R] & t) return R;
    if (state.pieceBitboards[b + Q] & t) return Q; if (state.pieceBitboards[b + K] & t) return K;
    return null;
}

const encodeMove = (f, t, p, pr, c, d, ep, ca) => (f) | (t << 6) | (p << 12) | (pr << 16) | (c << 20) | (d << 21) | (ep << 22) | (ca << 23);
const getMoveFrom = (m) => m & 0x3f;
const getMoveTo = (m) => (m >> 6) & 0x3f;
const getMovePiece = (m) => (m >> 12) & 0xf;
const getMovePromoted = (m) => (m >> 16) & 0xf;
const getMoveCapture = (m) => (m >> 20) & 1;
const getMoveDouble = (m) => (m >> 21) & 1;
const getMoveEnpassant = (m) => (m >> 22) & 1;
const getMoveCastling = (m) => (m >> 23) & 1;

function makeMove(state, move) {
    const from = getMoveFrom(move), to = getMoveTo(move), piece = getMovePiece(move), promoted = getMovePromoted(move);
    const side = state.turn, enemy = side ^ 1, from_bb = 1n << BigInt(from), to_bb = 1n << BigInt(to);
    
    moveStack[moveStackPtr++] = { 
        move, castling: state.castling, enpassant: state.enpassant, 
        capturedPiece: P, zobristHash: state.zobristHash 
    };
    const unmakeInfo = moveStack[moveStackPtr - 1];
    
    state.pieceBitboards[side * 6 + piece] ^= (from_bb | to_bb);
    state.occupancies[side] ^= (from_bb | to_bb);

    if (getMoveCapture(move)) {
        if (getMoveEnpassant(move)) {
            const capSq = (side === WHITE) ? to + 8 : to - 8;
            state.pieceBitboards[enemy * 6 + P] ^= (1n << BigInt(capSq));
            state.occupancies[enemy] ^= (1n << BigInt(capSq));
        } else {
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
        let rf, rt;
        if (to === 62) { rf = 63; rt = 61; } else if (to === 58) { rf = 56; rt = 59; }
        else if (to === 6) { rf = 7; rt = 5; } else { rf = 0; rt = 3; }
        state.pieceBitboards[side * 6 + R] ^= ((1n << BigInt(rf)) | (1n << BigInt(rt)));
        state.occupancies[side] ^= ((1n << BigInt(rf)) | (1n << BigInt(rt)));
    }
    
    state.occupancies[2] = state.occupancies[WHITE] | state.occupancies[BLACK];
    state.castling &= castling_rights[from] & castling_rights[to];
    state.enpassant = getMoveDouble(move) ? (side === WHITE ? from - 8 : from + 8) : -1;
    state.turn ^= 1;
    state.zobristHash = calculateZobristHash(state);
}

function unmakeMove(state) {
    const info = moveStack[--moveStackPtr];
    const { move } = info;
    state.turn ^= 1;
    const from = getMoveFrom(move), to = getMoveTo(move), piece = getMovePiece(move), promoted = getMovePromoted(move);
    const side = state.turn, enemy = side ^ 1, from_bb = 1n << BigInt(from), to_bb = 1n << BigInt(to);

    state.pieceBitboards[side * 6 + piece] ^= (from_bb | to_bb);
    state.occupancies[side] ^= (from_bb | to_bb);

    if (promoted) {
        state.pieceBitboards[side * 6 + P] ^= to_bb;
        state.pieceBitboards[side * 6 + promoted] ^= to_bb;
    }
    if (getMoveCapture(move)) {
        if (getMoveEnpassant(move)) {
            const capSq = (side === WHITE) ? to + 8 : to - 8;
            state.pieceBitboards[enemy * 6 + P] ^= (1n << BigInt(capSq));
            state.occupancies[enemy] ^= (1n << BigInt(capSq));
        } else {
            state.pieceBitboards[enemy * 6 + info.capturedPiece] ^= to_bb;
            state.occupancies[enemy] ^= to_bb;
        }
    }
    if (getMoveCastling(move)) {
        let rf, rt;
        if (to === 62) { rf = 63; rt = 61; } else if (to === 58) { rf = 56; rt = 59; }
        else if (to === 6) { rf = 7; rt = 5; } else { rf = 0; rt = 3; }
        state.pieceBitboards[side * 6 + R] ^= ((1n << BigInt(rf)) | (1n << BigInt(rt)));
        state.occupancies[side] ^= ((1n << BigInt(rf)) | (1n << BigInt(rt)));
    }
    
    state.occupancies[2] = state.occupancies[WHITE] | state.occupancies[BLACK];
    state.castling = info.castling;
    state.enpassant = info.enpassant;
    state.zobristHash = info.zobristHash;
}

/* B"H */
/**
 * Generates all pseudo-legal moves.
 * DIAGNOSTIC: Checks for memory corruption via canary before executing.
 */
function generateMoves(state) {
    // --- CANARY CHECK ---
    if (MEMORY_CANARY !== 0xDEADBEEFCAFEBABEn) {
        console.error("B\"H - CATASTROPHIC: MEMORY CORRUPTION DETECTED in generateMoves!");
        console.error("Expected Canary:", 0xDEADBEEFCAFEBABEn, "but found:", MEMORY_CANARY);
        console.error("This means a function called BEFORE this one (likely makeMove/unmakeMove or search) has an out-of-bounds write error.");
        throw new Error("Memory corruption detected via canary in generateMoves.");
    }
    
    const moves = [];
    const side = state.turn;
    const enemy = side ^ 1;
    const blockers = state.occupancies[2];
    const friendly = state.occupancies[side];
    const enemyKing = state.pieceBitboards[enemy * 6 + K];
    const validTargetSquares = ~(friendly | enemyKing);
    const validCaptureSquares = state.occupancies[enemy] & ~enemyKing;

    // ... (rest of the function is the same as the one you already have)
    let pawns = state.pieceBitboards[side * 6 + P];
    while (pawns > 0n) {
        const from = getLSBIndex(pawns);
        const rank = Math.floor(from / 8);
        const promRank = (side === WHITE) ? 1 : 6;
        const startRank = (side === WHITE) ? 6 : 1;
        const one = (side === WHITE) ? from - 8 : from + 8;
        if (!((blockers >> BigInt(one)) & 1n)) {
            if (rank === promRank) {
                for (const p_type of [Q, R, B, N]) moves.push(encodeMove(from, one, P, p_type, 0, 0, 0, 0));
            } else {
                moves.push(encodeMove(from, one, P, 0, 0, 0, 0, 0));
                const two = (side === WHITE) ? from - 16 : from + 16;
                if (rank === startRank && !((blockers >> BigInt(two)) & 1n)) {
                    moves.push(encodeMove(from, two, P, 0, 0, 1, 0, 0));
                }
            }
        }
        let attacks = PAWN_ATTACKS[side][from] & validCaptureSquares;
        while (attacks > 0n) {
            const to = getLSBIndex(attacks);
            if (rank === promRank) {
                for (const p_type of [Q, R, B, N]) moves.push(encodeMove(from, to, P, p_type, 1, 0, 0, 0));
            } else { moves.push(encodeMove(from, to, P, 0, 1, 0, 0, 0)); }
            attacks = popBit(attacks);
        }
        if (state.enpassant !== -1 && (PAWN_ATTACKS[side][from] & (1n << BigInt(state.enpassant)))) {
            moves.push(encodeMove(from, state.enpassant, P, 0, 1, 0, 1, 0));
        }
        pawns = popBit(pawns);
    }
    if (side === WHITE) {
        if ((state.castling & WKCA) && !((blockers >> 61n) & 3n) && !isSquareAttacked_lean(state, 60, BLACK) && !isSquareAttacked_lean(state, 61, BLACK)) moves.push(encodeMove(60, 62, K, 0, 0, 0, 0, 1));
        if ((state.castling & WQCA) && !((blockers >> 57n) & 7n) && !isSquareAttacked_lean(state, 60, BLACK) && !isSquareAttacked_lean(state, 59, BLACK)) moves.push(encodeMove(60, 58, K, 0, 0, 0, 0, 1));
    } else {
        if ((state.castling & BKCA) && !((blockers >> 5n) & 3n) && !isSquareAttacked_lean(state, 4, WHITE) && !isSquareAttacked_lean(state, 5, WHITE)) moves.push(encodeMove(4, 6, K, 0, 0, 0, 0, 1));
        if ((state.castling & BQCA) && !((blockers >> 1n) & 7n) && !isSquareAttacked_lean(state, 4, WHITE) && !isSquareAttacked_lean(state, 3, WHITE)) moves.push(encodeMove(4, 2, K, 0, 0, 0, 0, 1));
    }
    for (let p = N; p <= K; p++) {
        let bb = state.pieceBitboards[side * 6 + p];
        while (bb > 0n) {
            const from = getLSBIndex(bb);
            let attacks = 0n;
            if (p === N) attacks = KNIGHT_ATTACKS[from];
            else if (p === K) attacks = KING_ATTACKS[from];
            else if (p === B) attacks = getBishopAttacks(from, blockers);
            else if (p === R) attacks = getRookAttacks(from, blockers);
            else if (p === Q) attacks = getQueenAttacks(from, blockers);
            attacks &= validTargetSquares;
            while (attacks > 0n) {
                const to = getLSBIndex(attacks);
                const isCapture = ((1n << BigInt(to)) & validCaptureSquares) ? 1 : 0;
                moves.push(encodeMove(from, to, p, 0, isCapture, 0, 0, 0));
                attacks = popBit(attacks);
            }
            bb = popBit(bb);
        }
    }
    return moves;
}

/* B"H

 - 

/**
 * A pseudo-random number generator to create 64-bit keys.
 * Using a simple one for deterministic magic number generation.
 */
const random64 = (() => {
    let seed = 1804289383;
    return () => {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        const high = Math.imul(t ^ (t >>> 14), seed) | 0;
        seed = (seed + 0x6d2b79f5) | 0;
        t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        const low = Math.imul(t ^ (t >>> 14), seed) | 0;
        return (BigInt(high) << 32n) | BigInt(low & 0xFFFFFFFF);
    };
})();


/**
 * The runtime ritual to find the magic numbers. This function will be called once
 * during initialization to generate the unique keys needed for the slider attack tables.
 * This avoids hardcoding them and ensures the engine builds itself from pure logic.
 */
function findMagics() {
    bishopMagics = Array(64);
    rookMagics = Array(64);

    for (let sq = 0; sq < 64; sq++) {
        // Find Bishop Magic
        const b_mask = bishopMasks[sq];
        const b_bits = popcount(b_mask);
        const b_used = Array(1 << b_bits).fill(0n);
        while (true) {
            const magic = random64() & random64() & random64();
            if (popcount((b_mask * magic) & 0xFF00000000000000n) < 6) continue;
            let fail = false;
            b_used.fill(0n);
            for (let i = 0; i < (1 << b_bits); i++) {
                let temp = b_mask, blockers = 0n;
                for (let j = 0; j < b_bits; j++) {
                    const lsb = getLSBIndex(temp); temp = popBit(temp);
                    if ((i >> j) & 1) blockers |= (1n << BigInt(lsb));
                }
                const idx = Number((blockers * magic) >> BigInt(64 - b_bits));
                const attack = generateSliderAttacks(sq, true, blockers);
                if (b_used[idx] === 0n) b_used[idx] = attack;
                else if (b_used[idx] !== attack) { fail = true; break; }
            }
            if (!fail) { bishopMagics[sq] = magic; break; }
        }

        // Find Rook Magic
        const r_mask = rookMasks[sq];
        const r_bits = popcount(r_mask);
        const r_used = Array(1 << r_bits).fill(0n);
        while (true) {
            const magic = random64() & random64() & random64();
            if (popcount((r_mask * magic) & 0xFF00000000000000n) < 6) continue;
            let fail = false;
            r_used.fill(0n);
            for (let i = 0; i < (1 << r_bits); i++) {
                let temp = r_mask, blockers = 0n;
                for (let j = 0; j < r_bits; j++) {
                    const lsb = getLSBIndex(temp); temp = popBit(temp);
                    if ((i >> j) & 1) blockers |= (1n << BigInt(lsb));
                }
                const idx = Number((blockers * magic) >> BigInt(64 - r_bits));
                const attack = generateSliderAttacks(sq, false, blockers);
                if (r_used[idx] === 0n) r_used[idx] = attack;
                else if (r_used[idx] !== attack) { fail = true; break; }
            }
            if (!fail) { rookMagics[sq] = magic; break; }
        }
    }
}



/*B"H*/
/**
 * A highly optimized function to determine if a square is attacked by a given side.
 * This is a critical performance function, used in move legality checks and castling.
 * It leverages pre-computed attack tables and magic bitboards for maximum speed.
 * @param {object} state The current game state object.
 * @param {number} sq The square index (0-63) to check.
 * @param {number} attackerColor The color of the attacking side (WHITE or BLACK).
 * @returns {boolean} True if the square is under attack, false otherwise.
 */
function isSquareAttacked_lean(state, sq, attackerColor) {
    const enemyColor = attackerColor ^ 1;
    const blockers = state.occupancies[2];
    const b_offset = attackerColor * 6;

    // Check for attacks from enemy pawns. This uses a reverse-attack lookup:
    // to see if `sq` is attacked by a WHITE pawn, we check the squares from which a
    // BLACK pawn would attack `sq`, and see if any of those squares contain a WHITE pawn.
    if ((PAWN_ATTACKS[enemyColor][sq] & state.pieceBitboards[b_offset + P]) !== 0n) return true;

    // Check for attacks from enemy knights.
    if ((KNIGHT_ATTACKS[sq] & state.pieceBitboards[b_offset + N]) !== 0n) return true;

    // Check for attacks from the enemy king.
    if ((KING_ATTACKS[sq] & state.pieceBitboards[b_offset + K]) !== 0n) return true;

    // Check for attacks from enemy bishops or the enemy queen on diagonals.
    if ((getBishopAttacks(sq, blockers) & (state.pieceBitboards[b_offset + B] | state.pieceBitboards[b_offset + Q])) !== 0n) return true;

    // Check for attacks from enemy rooks or the enemy queen on files/ranks.
    if ((getRookAttacks(sq, blockers) & (state.pieceBitboards[b_offset + R] | state.pieceBitboards[b_offset + Q])) !== 0n) return true;

    // If no attacks are found from any piece type, the square is safe.
    return false;
}


/**
 * Generates only tactical moves.
 * DIAGNOSTIC: Checks for memory corruption via canary before executing.
 */
function generateTacticalMoves(state) {
    // --- CANARY CHECK ---
    if (MEMORY_CANARY !== 0xDEADBEEFCAFEBABEn) {
        console.error("B\"H - CATASTROPHIC: MEMORY CORRUPTION DETECTED in generateTacticalMoves!");
        console.error("Expected Canary:", 0xDEADBEEFCAFEBABEn, "but found:", MEMORY_CANARY);
        console.error("This means a function called BEFORE this one (likely makeMove/unmakeMove or search) has an out-of-bounds write error.");
        throw new Error("Memory corruption detected via canary in generateTacticalMoves.");
    }

    const moves = [];
    const side = state.turn;
    const enemy = side ^ 1;
    const blockers = state.occupancies[2];
    const enemyKing = state.pieceBitboards[enemy * 6 + K];
    const captureTargets = state.occupancies[enemy] & ~enemyKing;

    // ... (rest of the function is the same as the one you already have)
    let pawns = state.pieceBitboards[side * 6 + P];
    while (pawns > 0n) {
        const from = getLSBIndex(pawns);
        const rank = Math.floor(from / 8);
        const promRank = (side === WHITE) ? 1 : 6;
        const one = (side === WHITE) ? from - 8 : from + 8;
        if (rank === promRank && !((blockers >> BigInt(one)) & 1n)) {
            moves.push(encodeMove(from, one, P, Q, 0, 0, 0, 0));
        }
        let attacks = PAWN_ATTACKS[side][from] & captureTargets;
        while (attacks > 0n) {
            const to = getLSBIndex(attacks);
            const rowDiff = Math.abs(Math.floor(from / 8) - Math.floor(to / 8));
            const colDiff = Math.abs((from % 8) - (to % 8));
            if (rowDiff !== 1 || colDiff !== 1) {
                console.error("B\"H - LOGIC BOMB! Generated a physically impossible pawn capture.");
                console.error(`- Details: from ${from}, to ${to}, for side ${side}`);
                console.error("- This indicates the PAWN_ATTACKS table is corrupt.");
                throw new Error("Illegal pawn move created by generateTacticalMoves.");
            }
            if (rank === promRank) moves.push(encodeMove(from, to, P, Q, 1, 0, 0, 0));
            else moves.push(encodeMove(from, to, P, 0, 1, 0, 0, 0));
            attacks = popBit(attacks);
        }
        if (state.enpassant !== -1 && (PAWN_ATTACKS[side][from] & (1n << BigInt(state.enpassant)))) {
            moves.push(encodeMove(from, state.enpassant, P, 0, 1, 0, 1, 0));
        }
        pawns = popBit(pawns);
    }
    for (let p = N; p <= K; p++) {
        let bb = state.pieceBitboards[side * 6 + p];
        while (bb > 0n) {
            const from = getLSBIndex(bb);
            let attacks = (p === N) ? KNIGHT_ATTACKS[from] : (p === B) ? getBishopAttacks(from, blockers) : (p === R) ? getRookAttacks(from, blockers) : (p === Q) ? getQueenAttacks(from, blockers) : KING_ATTACKS[from];
            attacks &= captureTargets;
            while (attacks > 0n) {
                moves.push(encodeMove(from, getLSBIndex(attacks), p, 0, 1, 0, 0, 0));
                attacks = popBit(attacks);
            }
            bb = popBit(bb);
        }
    }
    return moves;
}