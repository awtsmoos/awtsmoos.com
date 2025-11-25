/* B"H */

// =================================================================
//     AWTSMOOS CHESS - THE FOUNDATION (MK. XVII - GLOBAL SCOPE FIX)
// =================================================================
// CRITICAL FIX: Switched all top-level declarations from 'let' to 'var'.
// This ensures they are attached to the global 'self' object and visible
// to the main engine script, preventing the "MEMORY_CANARY is not defined" crash.
// =================================================================

var P = 0, N = 1, B = 2, R = 3, Q = 4, K = 5;
var WHITE = 0, BLACK = 1;
var WKCA = 1, WQCA = 2, BKCA = 4, BQCA = 8;
var pieceMap = 'PNBRQKpnbrqk';

var NOT_A_FILE = 18374403900871474942n;
var NOT_H_FILE = 9187201950435737471n;
var NOT_HG_FILE = 4557430888798830399n;
var NOT_AB_FILE = 18229723555195321596n;

// --- RUNTIME DE BRUIJN GENERATION ---
var deBruijn64 = 0x03f79d71b4cb0a89n;
var lsb_64_table = new Array(64).fill(0);

(function forgeUniverseIndices() {
    for (var i = 0; i < 64; i++) {
        var bit = 1n << BigInt(i);
        var hash = Number(((bit * deBruijn64) & 0xffffffffffffffffn) >> 58n);
        lsb_64_table[hash] = i;
    }
})();

function getLSBIndex(bb) { 
    if(bb===0n) return -1; 
    var i = Number(((((bb&-bb)*deBruijn64)) & 0xffffffffffffffffn) >> 58n); 
    return lsb_64_table[i]; 
}

function popBit(bb) { return bb & (bb-1n); }
function popcount(bb) { var c=0; while(bb>0n){bb&=(bb-1n);c++;} return c; }

// We declare this with var so it is strictly global
var MEMORY_CANARY = 0n;

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
    var attacks = 0n;
    var r = sq >> 3, f = sq & 7;
    
    var directions = isBishop 
        ? [[-1, -1], [-1, 1], [1, -1], [1, 1]] 
        : [[-1, 0], [1, 0], [0, -1], [0, 1]];
        
    for (var i = 0; i < directions.length; i++) {
        var dr = directions[i][0];
        var dc = directions[i][1];
        var nr = r + dr, nc = f + dc;
        
        while (nr >= 0 && nr <= 7 && nc >= 0 && nc <= 7) {
            var currentSq = 1n << BigInt(nr * 8 + nc);
            attacks |= currentSq;
            if ((currentSq & blockers) !== 0n) break; 
            nr += dr; nc += dc;
        }
    }
    return attacks;
}

// Use VAR for all global tables to ensure visibility across scripts
var PAWN_ATTACKS = [[], []];
var KNIGHT_ATTACKS = [];
var KING_ATTACKS = [];

var zobristPieceKeys = Array(12).fill(null).map(function() { return Array(64).fill(0n); });
var zobristCastlingKeys = Array(16).fill(0n);
var zobristEnpassantKeys = Array(64).fill(0n);
var zobristTurnKey = 0n;

function initializeZobristKeys() {
    if (zobristTurnKey !== 0n) return;
    
    var seed = 19880128;
    function pseudoRandom() {
        seed = (seed * 16807) % 2147483647;
        return seed;
    }
    
    function random64() {
        return (BigInt(pseudoRandom()) << 32n) | BigInt(pseudoRandom());
    }

    for(var p=0;p<12;p++) for(var s=0;s<64;s++) zobristPieceKeys[p][s] = random64();
    for(var i=0;i<16;i++) zobristCastlingKeys[i] = random64();
    for(var i=0;i<64;i++) zobristEnpassantKeys[i] = random64();
    zobristTurnKey = random64();
}

function initializeAll() {
    if (KNIGHT_ATTACKS.length === 64) return;
    
    initializeZobristKeys();

    for (var sq = 0; sq < 64; sq++) {
        PAWN_ATTACKS[WHITE][sq] = 0n;
        if (((1n << BigInt(sq)) & NOT_H_FILE) && sq > 7) PAWN_ATTACKS[WHITE][sq] |= (1n << BigInt(sq - 7));
        if (((1n << BigInt(sq)) & NOT_A_FILE) && sq > 7) PAWN_ATTACKS[WHITE][sq] |= (1n << BigInt(sq - 9));
        
        PAWN_ATTACKS[BLACK][sq] = 0n;
        if (((1n << BigInt(sq)) & NOT_A_FILE) && sq < 56) PAWN_ATTACKS[BLACK][sq] |= (1n << BigInt(sq + 9));
        if (((1n << BigInt(sq)) & NOT_H_FILE) && sq < 56) PAWN_ATTACKS[BLACK][sq] |= (1n << BigInt(sq + 7));
        
        var k = 1n << BigInt(sq), a = 0n;
        if ((k >> 17n) & NOT_H_FILE) a |= (k >> 17n); if ((k >> 15n) & NOT_A_FILE) a |= (k >> 15n);
        if ((k >> 10n) & NOT_HG_FILE) a |= (k >> 10n); if ((k >> 6n) & NOT_AB_FILE) a |= (k >> 6n);
        if ((k << 17n) & NOT_A_FILE) a |= (k << 17n); if ((k << 15n) & NOT_H_FILE) a |= (k << 15n);
        if ((k << 10n) & NOT_AB_FILE) a |= (k << 10n); if ((k << 6n) & NOT_HG_FILE) a |= (k << 6n);
        KNIGHT_ATTACKS[sq] = a;
        
        var kg = 1n << BigInt(sq);
        KING_ATTACKS[sq] = ((kg >> 1n) & NOT_H_FILE) | ((kg << 1n) & NOT_A_FILE) | (kg >> 8n) | (kg << 8n) |
                  ((kg >> 7n) & NOT_A_FILE) | ((kg >> 9n) & NOT_H_FILE) | ((kg << 7n) & NOT_H_FILE) | ((kg << 9n) & NOT_A_FILE);
    }
    
    // Set the canary last. Since it's a 'var', it's on 'self', reachable everywhere.
    MEMORY_CANARY = 0xDEADBEEFCAFEBABEn;
}

// Ensure explicit global attachment for safety in all worker environments
if (typeof self !== 'undefined') {
    self.pieceMap = pieceMap;
    self.getLSBIndex = getLSBIndex;
    self.popBit = popBit;
    self.popcount = popcount;
    self.MEMORY_CANARY = MEMORY_CANARY;
}