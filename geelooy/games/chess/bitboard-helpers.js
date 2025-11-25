/* B"H */

// =================================================================
//     AWTSMOOS CHESS - THE FOUNDATION (MK. XVI - SIMPLE & SAFE)
// =================================================================
// This version removes the "Magic Number" De Bruijn sequence entirely.
// It uses a mathematically infallible (though slightly slower) loop for 
// LSB calculation. This guarantees correct board indexing on all devices.
// =================================================================

const P = 0, N = 1, B = 2, R = 3, Q = 4, K = 5;
const WHITE = 0, BLACK = 1;
const WKCA = 1, WQCA = 2, BKCA = 4, BQCA = 8;
const pieceMap = 'PNBRQKpnbrqk';

const NOT_A_FILE = 18374403900871474942n;
const NOT_H_FILE = 9187201950435737471n;
const NOT_HG_FILE = 4557430888798830399n;
const NOT_AB_FILE = 18229723555195321596n;

// --- SAFE LSB FUNCTION (No Magic Numbers) ---
// This uses a simple lookup or calculation that cannot fail due to
// overflow or architecture differences.
function getLSBIndex(bb) {
    if (bb === 0n) return -1;
    // Convert BigInt to binary string and find the last '1'
    // This is slow but 100% accurate for debugging/stability
    // Optimization: We can use a loop since we only have 64 bits.
    let index = 0;
    while ((bb & 1n) === 0n) {
        bb >>= 1n;
        index++;
    }
    return index;
}

function popBit(bb) { return bb & (bb - 1n); }
function popcount(bb) { 
    let count = 0; 
    while (bb > 0n) { 
        bb &= (bb - 1n); 
        count++; 
    } 
    return count; 
}

// --- ROBUST SLIDER ATTACKS (Raycasting) ---
function getBishopAttacks(sq, blockers) {
    return generateSliderAttacks(sq, true, blockers);
}

function getRookAttacks(sq, blockers) {
    return generateSliderAttacks(sq, false, blockers);
}

function getQueenAttacks(sq, blockers) {
    return getRookAttacks(sq, blockers) | getBishopAttacks(sq, blockers);
}

function generateSliderAttacks(sq, isBishop, blockers) {
    let attacks = 0n;
    const r = sq >> 3, f = sq & 7;
    // Directions: [RankOffset, FileOffset]
    const directions = isBishop 
        ? [[-1, -1], [-1, 1], [1, -1], [1, 1]] 
        : [[-1, 0], [1, 0], [0, -1], [0, 1]];
        
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
    if (KNIGHT_ATTACKS.length === 64) return;
    
    initializeZobristKeys();

    // console.log("B\"H - Initializing tables (Safe Mode)...");
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
}

if (typeof self !== 'undefined') self.pieceMap = pieceMap;