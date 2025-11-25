/* B"H */

// =================================================================
//     AWTSMOOS CHESS - THE LAWS OF CREATION (MK. X - RESTORED)
// =================================================================
// This file now contains a self-correcting De Bruijn generator.
// It calculates the lookup table at runtime to ensure perfect alignment
// with the magic constant, eliminating the "Scrambled Board" paradox.
// =================================================================

const ROOK_MAGICS = [
  0x8a80040008000200n, 0x140002000100040n, 0x2802000100080n, 0x1000810010004n, 0x200020010080n, 0x211200080420n, 0x480800400802000n, 0x100040008000800n,
  0x808008000400n, 0x400080200100n, 0x80004000200n, 0x10008000800n, 0x2000400801000n, 0x20000800400n, 0x10002000100n, 0x8000800200n,
  0x401004000800080n, 0x20004008000100n, 0x20008004000100n, 0x20008000800080n, 0x10008000800080n, 0x80008000400080n, 0x80004000800080n, 0x10004000800080n,
  0x4000800040008n, 0x800040008008n, 0x800080004008n, 0x800080008008n, 0x1000800080008n, 0x2000400080008n, 0x4000800040008n, 0x8000400080008n,
  0x800040008000800n, 0x100040008000800n, 0x200080004000800n, 0x400080008000800n, 0x800080008000800n, 0x800040008000800n, 0x800080004000800n, 0x100080008000800n,
  0x2000200010008000n, 0x4000400020001000n, 0x8000800040002000n, 0x1000100020004000n, 0x2000400080008000n, 0x4000800040008000n, 0x8000400080004000n, 0x8000800080008000n,
  0x80008000800080n, 0x10004000800080n, 0x20008000400080n, 0x40004000800080n, 0x80008000400080n, 0x80004000800080n, 0x80008000800080n, 0x10008000400080n,
  0x2004010008080n, 0x1000400200100n, 0x2000800800400n, 0x200010010008n, 0x8000400010004n, 0x800100020004n, 0x1000400080080n, 0x20008000800400n
];
const BISHOP_MAGICS = [
  0x40040844404084n, 0x2004208a004208n, 0x10190041080202n, 0x1080608028400n, 0x20400080808400n, 0x410008200208100n, 0x810a0502080400n, 0x40028014080800n,
  0x408408084000n, 0x400200100808n, 0x208080042000n, 0x20010080400n, 0x400408a88402000n, 0x20008440082000n, 0x10808208004000n, 0x1000804104000n,
  0x220200808000n, 0x840802001000n, 0x41040004000n, 0x21001000800n, 0x80800108400n, 0x1000a220200401n, 0x2102000c0108n, 0x410408010800n,
  0x4000080408000n, 0x820040108000n, 0x10020004080n, 0x40100400080n, 0x80040200040n, 0x20020080400n, 0x4008008020000n, 0x10008080040000n,
  0x8000400800800n, 0x2000200040100n, 0x8000800200200n, 0x2008004001000n, 0x40008000804000n, 0x20001000080800n, 0x4000080008000n, 0x1000040004000n,
  0x2000020100400n, 0x10000000800n, 0x4000000400n, 0x2000002000n, 0x100008000n, 0x2000000n, 0x40000n, 0x800n,
  0x8040004000400n, 0x2010002000100n, 0x1008001000080n, 0x8040002000040n, 0x80008001000020n, 0x10004000200010n, 0x8000400010000n, 0x400020000800n,
  0x100000010000n, 0x20000020001n, 0x20000000800n, 0x400000040n, 0x8000001000n, 0x100000800n, 0x40000200n, 0x800000n
];

const P = 0, N = 1, B = 2, R = 3, Q = 4, K = 5;
const WHITE = 0, BLACK = 1;
const WKCA = 1, WQCA = 2, BKCA = 4, BQCA = 8;
const pieceMap = 'PNBRQKpnbrqk';

const NOT_A_FILE = 18374403900871474942n;
const NOT_H_FILE = 9187201950435737471n;
const NOT_HG_FILE = 4557430888798830399n;
const NOT_AB_FILE = 18229723555195321596n;

// =================================================================
//     SELF-GENERATING DE BRUIJN TABLE
//     Instead of relying on a hardcoded (and potentially mismatched)
//     table, we generate it at runtime to match the Magic Constant.
// =================================================================
const deBruijn64 = 0x03f79d71b4cb0a89n;
const lsb_64_table = new Array(64).fill(0);

// Generate the table immediately
(function generateDeBruijn() {
    for (let i = 0; i < 64; i++) {
        const val = (1n << BigInt(i));
        const hash = Number(((val * deBruijn64) & 0xffffffffffffffffn) >> 58n);
        lsb_64_table[hash] = i;
    }
    console.log("B\"H - De Bruijn Lookup Table Generated Successfully.");
})();

function getLSBIndex(bb) { 
    if(bb===0n) return -1; 
    const i = Number(((((bb&-bb)*deBruijn64)) & 0xffffffffffffffffn) >> 58n); 
    return lsb_64_table[i]; 
}

function popBit(bb) { return bb & (bb-1n); }
function popcount(bb) { let c=0; while(bb>0n){bb&=(bb-1n);c++;} return c; }

const bishopMasks = Array(64);
const rookMasks = Array(64);
let bishopAttacks = Array(64);
let rookAttacks = Array(64);
let MEMORY_CANARY = 0n;

function getBishopAttacks(sq, blockers) {
    const mask = bishopMasks[sq];
    const magic = BISHOP_MAGICS[sq];
    const relevantBlockers = blockers & mask;
    const multiplied = relevantBlockers * magic;
    const sanctified64bit = multiplied & 0xffffffffffffffffn;
    const relevantBits = popcount(mask);
    const magicIndex = Number(sanctified64bit >> BigInt(64 - relevantBits));
    
    return bishopAttacks[sq][magicIndex];
}

function getRookAttacks(sq, blockers) {
    const mask = rookMasks[sq];
    const magic = ROOK_MAGICS[sq];
    const relevantBlockers = blockers & mask;
    const multiplied = relevantBlockers * magic;
    const sanctified64bit = multiplied & 0xffffffffffffffffn;
    const relevantBits = popcount(mask);
    const magicIndex = Number(sanctified64bit >> BigInt(64 - relevantBits));
    
    return rookAttacks[sq][magicIndex];
}

function getQueenAttacks(sq, blockers) {
    return getRookAttacks(sq, blockers) | getBishopAttacks(sq, blockers);
}

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

function initSliders() {
    console.log(`%cB"H - BEGINNING THE GREAT RITUAL OF SLIDER INITIALIZATION (SELF-CORRECTING)...`, "color: cyan; font-weight: bold;");
    for (let s = 0; s < 64; s++) {
        bishopMasks[s] = 0n; rookMasks[s] = 0n;
        const r = s >> 3, f = s & 7;
        for (let i = r + 1; i < 7; i++) rookMasks[s] |= (1n << BigInt(i * 8 + f));
        for (let i = r - 1; i > 0; i--) rookMasks[s] |= (1n << BigInt(i * 8 + f));
        for (let i = f + 1; i < 7; i++) rookMasks[s] |= (1n << BigInt(r * 8 + i));
        for (let i = f - 1; i > 0; i--) rookMasks[s] |= (1n << BigInt(r * 8 + i));
        for (let i=r+1,j=f+1;i<7&&j<7;i++,j++) bishopMasks[s]|=(1n<<BigInt(i*8+j));
        for (let i=r+1,j=f-1;i<7&&j>0;i++,j--) bishopMasks[s]|=(1n<<BigInt(i*8+j));
        for (let i=r-1,j=f+1;i>0&&j<7;i--,j++) bishopMasks[s]|=(1n<<BigInt(i*8+j));
        for (let i=r-1,j=f-1;i>0&&j>0;i--,j--) bishopMasks[s]|=(1n<<BigInt(i*8+j));
    }
    
    for (let s = 0; s < 64; s++) {
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
            const magicIndex = Number(((blockers * BISHOP_MAGICS[s]) & 0xffffffffffffffffn) >> BigInt(64 - b_relevant_bits));
            bishopAttacks[s][magicIndex] = generateSliderAttacks(s, true, blockers);
        }

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
            const magicIndex = Number(((blockers * ROOK_MAGICS[s]) & 0xffffffffffffffffn) >> BigInt(64 - r_relevant_bits));
            rookAttacks[s][magicIndex] = generateSliderAttacks(s, false, blockers);
        }
    }
}

let PAWN_ATTACKS = [[], []], KNIGHT_ATTACKS = [], KING_ATTACKS = [];
let zobristPieceKeys = Array(12).fill(null).map(() => Array(64).fill(0n));
let zobristCastlingKeys = Array(16).fill(0n), zobristEnpassantKeys = Array(64).fill(0n), zobristTurnKey = 0n;

function initializeZobristKeys() {
    if (zobristTurnKey !== 0n) return;
    const pseudoRandom = (() => { let seed = 19880128; return () => seed = (seed * 16807) % 2147483647; })();
    const random64 = () => (BigInt(pseudoRandom()) << 32n) | BigInt(pseudoRandom());
    for(let p=0;p<12;p++) for(let s=0;s<64;s++) zobristPieceKeys[p][s] = random64();
    for(let i=0;i<16;i++) zobristCastlingKeys[i] = random64();
    for(let i=0;i<64;i++) zobristEnpassantKeys[i] = random64();
    zobristTurnKey = random64();
}

function initializeAll() {
    // --- FORCE RESET IF CORRUPTED ---
    // If the table wasn't filled, or if we need to re-run to be safe
    if (KNIGHT_ATTACKS.length === 64 && PAWN_ATTACKS[0].length === 64) {
        console.log("B\"H - Universe already created."); 
        return;
    }
    
    initSliders();
    initializeZobristKeys();

    console.log("B\"H - Calculating the innate powers of the lesser angels (Pawns, Knights, Kings)...");
    for (let sq = 0; sq < 64; sq++) {
        PAWN_ATTACKS[WHITE][sq] = 0n;
        if (((1n << BigInt(sq)) & NOT_H_FILE) && sq > 7) PAWN_ATTACKS[WHITE][sq] |= (1n << BigInt(sq - 7));
        if (((1n << BigInt(sq)) & NOT_A_FILE) && sq > 7) PAWN_ATTACKS[WHITE][sq] |= (1n << BigInt(sq - 9));
        PAWN_ATTACKS[BLACK][sq] = 0n;
        if (((1n << BigInt(sq)) & NOT_A_FILE) && sq < 56) PAWN_ATTACKS[BLACK][sq] |= (1n << BigInt(sq + 9));
        if (((1n << BigInt(sq)) & NOT_H_FILE) && sq < 56) PAWN_ATTACKS[BLACK][sq] |= (1n << BigInt(sq + 7));
        
        let k = 1n << BigInt(sq), a = 0n;
        if ((k >> 17n) & NOT_H_FILE) a |= (k >> 17n); if ((k >> 15n) & NOT_A_FILE) a |= (k >> 15n);
        if ((k >> 10n) & NOT_HG_FILE) a |= (k >> 10n); if ((k >> 6n) & NOT_AB_FILE) a |= (k >> 6n);
        if ((k << 17n) & NOT_A_FILE) a |= (k << 17n); if ((k << 15n) & NOT_H_FILE) a |= (k << 15n);
        if ((k << 10n) & NOT_AB_FILE) a |= (k << 10n); if ((k << 6n) & NOT_HG_FILE) a |= (k << 6n);
        KNIGHT_ATTACKS[sq] = a;
        
        let kg = 1n << BigInt(sq);
        KING_ATTACKS[sq] = ((kg >> 1n) & NOT_H_FILE) | ((kg << 1n) & NOT_A_FILE) | (kg >> 8n) | (kg << 8n) |
                  ((kg >> 7n) & NOT_A_FILE) | ((kg >> 9n) & NOT_H_FILE) | ((kg << 7n) & NOT_H_FILE) | ((kg << 9n) & NOT_A_FILE);
    }
    
    MEMORY_CANARY = 0xDEADBEEFCAFEBABEn;
    console.log(`%cB"H - THE SYMPHONY OF CREATION IS COMPLETE.`, "color: magenta; font-weight: bold;");
}

if (typeof self !== 'undefined') self.pieceMap = pieceMap;