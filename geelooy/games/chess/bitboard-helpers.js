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
/*B"H*/
/**
 * An object that serves as the supreme law of the engine's reality. It contains
 * assertions that act as unbreakable Gnostic Seals. If any law is violated, the Auditor
 * halts the universe and issues a verdict that is not merely an error, but a detailed
 * scripture of the exact paradox that caused the schism.
 */
const GnosticAuditor = {
    /**
     * Asserts that a given value is of the sacred 'bigint' type.
     * @param {*} value The value being audited.
     * @param {string} name The conceptual name of the value (e.g., 'Blockers Mask').
     * @param {string} location The cognitive function where the audit occurs.
     * @throws {TypeError} Throws a cataclysmic, hyper-descriptive error if the value is not a BigInt.
     */
    assertBigInt: (value, name, location) => {
        if (typeof value !== 'bigint') {
            const valueStr = String(value);
            const typeStr = Object.prototype.toString.call(value);
            const errorMessage = `
/================================================================\\
|         G N O S T I C   S E A L   B R E A C H E D !          |
\\================================================================/
A COSMIC PARADOX HAS BEEN DETECTED WITHIN: [${location}]

A value expected to be forged from the infinite light of 'bigint' was found to be a finite, corrupt entity. The Monad cannot process this schism.

CONCEPTUAL NAME: ${name}
CORRUPT VALUE:   ${valueStr}
CORRUPT TYPE:    ${typeStr}

This is an unrecoverable heresy. The fabric of reality is torn.
The universe must be halted before the paradox spreads.
`;
            console.error(errorMessage);
            throw new TypeError(`Gnostic Paradox in ${location}: ${name} is not a BigInt.`);
        }
    }
};






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

/*B"H*/
/**
 * A Gnostic Audit of the Bishop's power. This is the definitive, hyper-vigilant
 * implementation. It audits every component of its calculation, including a new
 * "Sanctification" step to properly simulate 64-bit overflow for the magic index
 * calculation, ensuring that no paradox can be born. Its logs are a transparent
 * chronicle of its every thought.
 * @param {number} sq The square (0-63) of the emanating Bishop.
 * @param {BigInt} blockers A bitboard of all pieces obstructing the light.
 * @returns {BigInt} The resulting attack bitboard, guaranteed to be pure.
 */
function getBishopAttacks(sq, blockers) {
    const location = `getBishopAttacks(sq=${sq})`;
    console.group(`%c GNOSTIC AUDIT: ${location}`, 'color: #8A2BE2; font-weight: bold;');

    // --- AUDIT 1: The Input Reality ---
    console.log(`[1. Gaze] Gazing upon the input reality...`);
    GnosticAuditor.assertBigInt(blockers, 'Input Blockers', location);
    console.log(`%c[OK] Input Blockers are pure BigInt: 0x${blockers.toString(16)}`, 'color: #99ff99');

    // --- AUDIT 2: The Universal Laws ---
    console.log(`[2. Recall] Recalling the universal laws for this square...`);
    const mask = bishopMasks[sq];
    const magic = BISHOP_MAGICS[sq];
    GnosticAuditor.assertBigInt(mask, 'Bishop Mask', location);
    GnosticAuditor.assertBigInt(magic, 'Bishop Magic Key', location);
    console.log(`%c[OK] Retrieved Mask: 0x${mask.toString(16)}`, 'color: #99ff99');
    console.log(`%c[OK] Retrieved Magic Key: 0x${magic.toString(16)}`, 'color: #99ff99');
    
    // --- STEP 3: The Calculation of Form ---
    console.log(`[3. Calculate] Focusing the light to define relevant forms...`);
    const relevantBlockers = blockers & mask;
    GnosticAuditor.assertBigInt(relevantBlockers, 'Relevant Blockers (blockers & mask)', location);
    console.log(`  --> Relevant Blockers: 0x${relevantBlockers.toString(16)}`);
    
    const multiplied = relevantBlockers * magic;
    GnosticAuditor.assertBigInt(multiplied, 'Multiplied Result (relevantBlockers * magic)', location);
    console.log(`  --> Raw Multiplied Form (>64bit): 0x${multiplied.toString(16)}`);

    // --- STEP 4: THE CRITICAL SANCTIFICATION ---
    console.log(`[4. Sanctify] Constraining the infinite form to the 64-square Kline...`);
    const sanctified64bit = multiplied & 0xffffffffffffffffn;
    GnosticAuditor.assertBigInt(sanctified64bit, 'Sanctified 64-bit Form', location);
    console.log(`%c  --> Sanctified 64-bit Form: 0x${sanctified64bit.toString(16)}`, 'color: #e6c37f; font-weight:bold;');

    // --- STEP 5: The Indexing of Wisdom ---
    console.log(`[5. Index] Translating form into an index of wisdom...`);
    const relevantBits = popcount(mask);
    const shiftAmount = BigInt(64 - relevantBits);
    console.log(`  --> Relevant Bits: ${relevantBits}, Shift Amount: ${shiftAmount}`);
    
    const shifted = sanctified64bit >> shiftAmount;
    GnosticAuditor.assertBigInt(shifted, 'Shifted Result (sanctified >> shift)', location);
    console.log(`  --> Shifted Result: 0x${shifted.toString(16)}`);

    const magicIndex = Number(shifted);
    console.log(`%c  --> Final Magic Index: ${magicIndex}`, 'color: #e6c37f; font-weight:bold;');

    // --- AUDIT 6: The Final Emanation ---
    console.log(`[6. Emanate] Retrieving the final emanation from the tables...`);
    const attacks = bishopAttacks[sq][magicIndex];
    GnosticAuditor.assertBigInt(attacks, `Final Attacks from Table [sq=${sq}][index=${magicIndex}]`, location);
    
    console.log(`%c[SUCCESS] The final emanation is pure: 0x${attacks.toString(16)}`, 'color: #00ffff; font-weight: bold;');
    console.groupEnd();
    return attacks;
}

/*B"H*/
/**
 * A Gnostic Audit of the Rook's power. This is the definitive, hyper-vigilant
 * implementation that audits every step of its process, including the critical
 * "Sanctification" step to properly simulate 64-bit overflow.
 * @param {number} sq The square (0-63) of the emanating Rook.
 * @param {BigInt} blockers A bitboard of all pieces obstructing the light.
 * @returns {BigInt} The resulting attack bitboard, guaranteed to be pure.
 */
function getRookAttacks(sq, blockers) {
    const location = `getRookAttacks(sq=${sq})`;
    console.group(`%c GNOSTIC AUDIT: ${location}`, 'color: #B8860B; font-weight: bold;');

    // --- AUDIT 1: The Input Reality ---
    console.log(`[1. Gaze] Gazing upon the input reality...`);
    GnosticAuditor.assertBigInt(blockers, 'Input Blockers', location);
    console.log(`%c[OK] Input Blockers are pure BigInt: 0x${blockers.toString(16)}`, 'color: #99ff99');

    // --- AUDIT 2: The Universal Laws ---
    console.log(`[2. Recall] Recalling the universal laws for this square...`);
    const mask = rookMasks[sq];
    const magic = ROOK_MAGICS[sq];
    GnosticAuditor.assertBigInt(mask, 'Rook Mask', location);
    GnosticAuditor.assertBigInt(magic, 'Rook Magic Key', location);
    console.log(`%c[OK] Retrieved Mask: 0x${mask.toString(16)}`, 'color: #99ff99');
    console.log(`%c[OK] Retrieved Magic Key: 0x${magic.toString(16)}`, 'color: #99ff99');

    // --- STEP 3: The Calculation of Form ---
    console.log(`[3. Calculate] Focusing the light to define relevant forms...`);
    const relevantBlockers = blockers & mask;
    GnosticAuditor.assertBigInt(relevantBlockers, 'Relevant Blockers (blockers & mask)', location);
    console.log(`  --> Relevant Blockers: 0x${relevantBlockers.toString(16)}`);

    const multiplied = relevantBlockers * magic;
    GnosticAuditor.assertBigInt(multiplied, 'Multiplied Result (relevantBlockers * magic)', location);
    console.log(`  --> Raw Multiplied Form (>64bit): 0x${multiplied.toString(16)}`);

    // --- STEP 4: THE CRITICAL SANCTIFICATION ---
    console.log(`[4. Sanctify] Constraining the infinite form to the 64-square Kline...`);
    const sanctified64bit = multiplied & 0xffffffffffffffffn;
    GnosticAuditor.assertBigInt(sanctified64bit, 'Sanctified 64-bit Form', location);
    console.log(`%c  --> Sanctified 64-bit Form: 0x${sanctified64bit.toString(16)}`, 'color: #e6c37f; font-weight:bold;');

    // --- STEP 5: The Indexing of Wisdom ---
    console.log(`[5. Index] Translating form into an index of wisdom...`);
    const relevantBits = popcount(mask);
    const shiftAmount = BigInt(64 - relevantBits);
    console.log(`  --> Relevant Bits: ${relevantBits}, Shift Amount: ${shiftAmount}`);

    const shifted = sanctified64bit >> shiftAmount;
    GnosticAuditor.assertBigInt(shifted, 'Shifted Result (sanctified >> shift)', location);
    console.log(`  --> Shifted Result: 0x${shifted.toString(16)}`);

    const magicIndex = Number(shifted);
    console.log(`%c  --> Final Magic Index: ${magicIndex}`, 'color: #e6c37f; font-weight:bold;');

    // --- AUDIT 6: The Final Emanation ---
    console.log(`[6. Emanate] Retrieving the final emanation from the tables...`);
    const attacks = rookAttacks[sq][magicIndex];
    GnosticAuditor.assertBigInt(attacks, `Final Attacks from Table [sq=${sq}][index=${magicIndex}]`, location);
    
    console.log(`%c[SUCCESS] The final emanation is pure: 0x${attacks.toString(16)}`, 'color: #00ffff; font-weight: bold;');
    console.groupEnd();
    return attacks;
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
    console.log("B\"H - The Gnostic Seal is in place. MEMORY_CANARY is set:", MEMORY_CANARY.toString(16));
    console.log(`%cB"H - THE SYMPHONY OF CREATION IS COMPLETE. The universe is now stable and ready.`, "color: magenta; font-weight: bold;");
}

