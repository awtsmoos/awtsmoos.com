/* B"H */

// =================================================================
//                 AWTSMOOS CHESS - HELPERS (MK. V - ROBUST)
// =================================================================

// --- PIECE & COLOR CONSTANTS ---
const P = 0, N = 1, B = 2, R = 3, Q = 4, K = 5;
const WHITE = 0, BLACK = 1;
const WKCA = 1, WQCA = 2, BKCA = 4, BQCA = 8;
const pieceMap = 'PNBRQKpnbrqk';

// --- BITBOARD MASKS & UTILITIES ---
const NOT_A_FILE = 18374403900871474942n;
const NOT_H_FILE = 9187201950435737471n;
const NOT_HG_FILE = 4557430888798830399n;
const NOT_AB_FILE = 18229723555195321596n;
const FILE_A = 72340172838076673n; // Needed for evaluation

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
    while (bb > 0n) {
        bb &= (bb - 1n);
        count++;
    }
    return count;
}


/*B"H*/
// =================================================================
//               DEFINITIVE MAGIC BITBOARD INITIALIZATION
// =================================================================
const bishopMagics = [0x40040844404084n, 0x20040844404084n, 0x10040844404084n, 0x8040844404084n, 0x4040844404084n, 0x2040844404084n, 0x1040844404084n, 0x840844404084n, 0x40020408444040n, 0x20020408444040n, 0x10020408444040n, 0x8020408444040n, 0x4020408444040n, 0x2020408444040n, 0x1020408444040n, 0x820408444040n, 0x40010204084440n, 0x20010204084440n, 0x10010204084440n, 0x8010204084440n, 0x4010204084440n, 0x2010204084440n, 0x1010204084440n, 0x810204084440n, 0x40008102040844n, 0x20008102040844n, 0x10008102040844n, 0x8008102040844n, 0x4008102040844n, 0x2008102040844n, 0x1008102040844n, 0x808102040844n, 0x40004081020408n, 0x20004081020408n, 0x10004081020408n, 0x8004081020408n, 0x4004081020408n, 0x2004081020408n, 0x1004081020408n, 0x804081020408n, 0x40002040810204n, 0x20002040810204n, 0x10002040810204n, 0x8002040810204n, 0x4002040810204n, 0x2002040810204n, 0x1002040810204n, 0x802040810204n, 0x40001020408102n, 0x20001020408102n, 0x10001020408102n, 0x8001020408102n, 0x4001020408102n, 0x2001020408102n, 0x1001020408102n, 0x801020408102n, 0x40000801020408n, 0x20000801020408n, 0x10000801020408n, 0x8000801020408n, 0x4000801020408n, 0x2000801020408n, 0x1000801020408n, 0x800801020408n];
const rookMagics = [0x8a80104000800020n, 0x1480040000800080n, 0x4840008000800800n, 0x8080004000800800n, 0x4080002000400800n, 0x8040001000400800n, 0x80004000800800n, 0x2000200100800800n, 0x1004000802000400n, 0x2080080040002000n, 0x8010000800800n, 0x4000401004000n, 0x2200800100020080n, 0x4104000800801000n, 0x400040400080080n, 0x8080010000400n, 0x4000100080800n, 0x8000810010000n, 0x100008808000n, 0x20004010000n, 0x40004008000800n, 0x80008004000800n, 0x40008002000400n, 0x20000200080400n, 0x80004008002000n, 0x80008001000400n, 0x80002000400800n, 0x100010002000400n, 0x20000500100400n, 0x80080008001000n, 0x80040004000800n, 0x400804001000200n, 0x80020004000200n, 0x2004002000100n, 0x200800800400n, 0x80008002000400n, 0x104000200040080n, 0x800000800100100n, 0x48080004000200n, 0x20040001000800n, 0x40080001000400n, 0x80080040002000n, 0x200010040080n, 0x10004000200800n, 0x80001000400200n, 0x4000200010080n, 0x200400801000n, 0x100020000400800n, 0x4008008000400n, 0x20004000200800n, 0x10008008004000n, 0x8000800800100n, 0x8000400100020n, 0x40008000800200n, 0x1000400800800n, 0x20001000080400n, 0x80008000400080n, 0x4000400020001001n, 0x200200010040080n, 0x10008000400020n, 0x800040008000200n, 0x400800200010080n, 0x2004000800080100n, 0x1002000400080080n];

const bishopMasks = Array(64).fill(0n);
const rookMasks = Array(64).fill(0n);
const bishopAttacks = Array(64).fill(null).map(() => Array(512).fill(0n));
const rookAttacks = Array(64).fill(null).map(() => Array(4096).fill(0n));

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
    for (let s = 0; s < 64; s++) {
        const bmask = bishopMasks[s], rmask = rookMasks[s];
        const bcnt = popcount(bmask), rcnt = popcount(rmask);
        for (let i = 0; i < (1 << bcnt); i++) {
            let temp = bmask, blockers = 0n;
            for (let j = 0; j < bcnt; j++) {
                const lsb = getLSBIndex(temp); temp = popBit(temp);
                if ((i >> j) & 1) blockers |= (1n << BigInt(lsb));
            }
            bishopAttacks[s][Number((blockers * bishopMagics[s]) >> BigInt(64 - bcnt))] = generateSliderAttacks(s, true, blockers);
        }
        for (let i = 0; i < (1 << rcnt); i++) {
            let temp = rmask, blockers = 0n;
            for (let j = 0; j < rcnt; j++) {
                const lsb = getLSBIndex(temp); temp = popBit(temp);
                if ((i >> j) & 1) blockers |= (1n << BigInt(lsb));
            }
            rookAttacks[s][Number((blockers * rookMagics[s]) >> BigInt(64 - rcnt))] = generateSliderAttacks(s, false, blockers);
        }
    }
}

function getBishopAttacks(sq, blockers) {
    const mask = bishopMasks[sq], bcnt = popcount(mask);
    const res = bishopAttacks[sq][Number(((blockers & mask) * bishopMagics[sq]) >> BigInt(64 - bcnt))];
    return (typeof res === 'bigint') ? res : 0n;
}
function getRookAttacks(sq, blockers) {
    const mask = rookMasks[sq], bcnt = popcount(mask);
    const res = rookAttacks[sq][Number(((blockers & mask) * rookMagics[sq]) >> BigInt(64 - bcnt))];
    return (typeof res === 'bigint') ? res : 0n;
}
function getQueenAttacks(sq, blockers) { return getRookAttacks(sq, blockers) | getBishopAttacks(sq, blockers); }


/*B"H*/
// =================================================================
//               ZOBRIST & PRE-COMPUTED ATTACKS
// =================================================================
let PAWN_ATTACKS = [[], []], KNIGHT_ATTACKS = [], KING_ATTACKS = [];
let zobristPieceKeys = Array(12).fill(null).map(() => Array(64).fill(0n));
let zobristCastlingKeys = Array(16).fill(0n), zobristEnpassantKeys = Array(64).fill(0n), zobristTurnKey = 0n;

function initializeZobristKeys() {
    if (zobristTurnKey !== 0n) return;
    const pseudoRandom = (() => { let seed = 19880128; return () => seed = (seed * 16807) % 2147483647; })();
    const random64 = () => (BigInt(pseudoRandom()) << 32n) | BigInt(pseudoRandom());
    for(let p = 0; p < 12; p++) for(let s = 0; s < 64; s++) zobristPieceKeys[p][s] = random64();
    for(let i = 0; i < 16; i++) zobristCastlingKeys[i] = random64();
    for(let i = 0; i < 64; i++) zobristEnpassantKeys[i] = random64();
    zobristTurnKey = random64();
}

function calculateZobristHash(state) {
    let hash = 0n;
    for(let p = 0; p < 12; p++) {
        let bb = state.pieceBitboards[p];
        while(bb > 0n) { hash ^= zobristPieceKeys[p][getLSBIndex(bb)]; bb = popBit(bb); }
    }
    if(state.enpassant !== -1) hash ^= zobristEnpassantKeys[state.enpassant];
    hash ^= zobristCastlingKeys[state.castling];
    if(state.turn === BLACK) hash ^= zobristTurnKey;
    return hash;
}

function initializeAll() {
    if (KNIGHT_ATTACKS.length > 0) return;
    initSliders(); initializeZobristKeys();
    for (let sq = 0; sq < 64; sq++) {
        PAWN_ATTACKS[WHITE][sq] = 0n;
        if (((1n << BigInt(sq)) & NOT_A_FILE) && sq >= 8) PAWN_ATTACKS[WHITE][sq] |= (1n << BigInt(sq - 9));
        if (((1n << BigInt(sq)) & NOT_H_FILE) && sq >= 8) PAWN_ATTACKS[WHITE][sq] |= (1n << BigInt(sq - 7));
        PAWN_ATTACKS[BLACK][sq] = 0n;
        if (((1n << BigInt(sq)) & NOT_A_FILE) && sq < 56) PAWN_ATTACKS[BLACK][sq] |= (1n << BigInt(sq + 7));
        if (((1n << BigInt(sq)) & NOT_H_FILE) && sq < 56) PAWN_ATTACKS[BLACK][sq] |= (1n << BigInt(sq + 9));
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

function createGameState(fen) {
    initializeAll();
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
    state.zobristHash = calculateZobristHash(state);
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
 * Determines if a specific square is attacked by a given side.
 * DEBUG MODE: Includes heavy logging to catch 'Missing King' (sq === -1) errors.
 * @param {Object} state - The game state.
 * @param {number} sq - The square index (0-63).
 * @param {number} attackerColor - The color of the attacker (WHITE or BLACK).
 * @returns {boolean} True if the square is attacked.
 */
function isSquareAttacked_lean(state, sq, attackerColor) {
    // --- DEBUG: CRASH PREVENTION & LOGGING ---
    if (sq === -1 || sq === undefined || sq === null || sq < 0 || sq > 63) {
        console.error("B\"H - CRITICAL ERROR: isSquareAttacked_lean called with invalid square!", sq);
        console.error("Attacker Color:", attackerColor === 0 ? "WHITE" : "BLACK");
        console.error("Turn in State:", state.turn === 0 ? "WHITE" : "BLACK");
        
        // Log Bitboards to see if King exists
        const whiteKing = state.pieceBitboards[5]; // K
        const blackKing = state.pieceBitboards[11]; // k
        console.error("White King Bitboard:", whiteKing, "LSB:", getLSBIndex(whiteKing));
        console.error("Black King Bitboard:", blackKing, "LSB:", getLSBIndex(blackKing));
        
        console.error("Full State Object:", state);
        console.trace("Stack Trace for Invalid Square Call");

        // Return false to allow the loop to continue slightly longer to print other logs, 
        // or throw to stop immediately. Throwing is safer to preserve console history.
        throw new Error("B\"H - Aborting: King is missing from the board (Square index -1).");
    }
    // -----------------------------------------

    const enemy = attackerColor ^ 1;
    const blockers = state.occupancies[2];

    // Pawn Attacks
    if ((PAWN_ATTACKS[enemy][sq] & state.pieceBitboards[attackerColor * 6 + P]) !== 0n) return true;
    
    // Knight Attacks
    if ((KNIGHT_ATTACKS[sq] & state.pieceBitboards[attackerColor * 6 + N]) !== 0n) return true;
    
    // King Attacks
    if ((KING_ATTACKS[sq] & state.pieceBitboards[attackerColor * 6 + K]) !== 0n) return true;
    
    // Slider Attacks (Rook/Queen)
    const rookQ = state.pieceBitboards[attackerColor * 6 + R] | state.pieceBitboards[attackerColor * 6 + Q];
    if (rookQ !== 0n) {
        if ((getRookAttacks(sq, blockers) & rookQ) !== 0n) return true;
    }

    // Slider Attacks (Bishop/Queen)
    const bishopQ = state.pieceBitboards[attackerColor * 6 + B] | state.pieceBitboards[attackerColor * 6 + Q];
    if (bishopQ !== 0n) {
        if ((getBishopAttacks(sq, blockers) & bishopQ) !== 0n) return true;
    }

    return false;
}

/*B"H*/

/**
 * Generates all pseudo-legal moves for the current state.
 * Updated to prevent generating moves that capture the King.
 * @param {object} state - The current game state.
 * @returns {Array} An array of encoded moves.
 */
function generateMoves(state) {
    const moves = [], side = state.turn, enemy = side ^ 1, blockers = state.occupancies[2];
    const friendly = state.occupancies[side];
    
    // CRITICAL FIX: Exclude the enemy King from valid capture targets.
    // This prevents the engine from "capturing" the King, removing it from the board,
    // and subsequently crashing when checking for check.
    const enemies = state.occupancies[enemy] & ~state.pieceBitboards[enemy * 6 + K];

    // Pawns
    let pawns = state.pieceBitboards[side * 6 + P];
    while (pawns > 0n) {
        const from = getLSBIndex(pawns);
        const rank = Math.floor(from / 8), promRank = (side === WHITE) ? 1 : 6, startRank = (side === WHITE) ? 6 : 1;
        const one = (side === WHITE) ? from - 8 : from + 8;
        
        // Quiet pushes
        if (!((blockers >> BigInt(one)) & 1n)) {
            if (rank === promRank) {
                moves.push(encodeMove(from, one, P, Q, 0, 0, 0, 0), encodeMove(from, one, P, R, 0, 0, 0, 0), encodeMove(from, one, P, B, 0, 0, 0, 0), encodeMove(from, one, P, N, 0, 0, 0, 0));
            } else {
                moves.push(encodeMove(from, one, P, 0, 0, 0, 0, 0));
                const two = (side === WHITE) ? from - 16 : from + 16;
                if (rank === startRank && !((blockers >> BigInt(two)) & 1n)) moves.push(encodeMove(from, two, P, 0, 0, 1, 0, 0));
            }
        }
        
        // Captures (using the corrected 'enemies' mask)
        let attacks = PAWN_ATTACKS[side][from] & enemies;
        while (attacks > 0n) {
            const to = getLSBIndex(attacks);
            if (rank === promRank) {
                moves.push(encodeMove(from, to, P, Q, 1, 0, 0, 0), encodeMove(from, to, P, R, 1, 0, 0, 0), encodeMove(from, to, P, B, 1, 0, 0, 0), encodeMove(from, to, P, N, 1, 0, 0, 0));
            } else moves.push(encodeMove(from, to, P, 0, 1, 0, 0, 0));
            attacks = popBit(attacks);
        }
        
        // En Passant (The victim pawn is not the King, so this logic remains standard)
        if (state.enpassant !== -1 && (PAWN_ATTACKS[side][from] & (1n << BigInt(state.enpassant)))) moves.push(encodeMove(from, state.enpassant, P, 0, 1, 0, 1, 0));
        pawns = popBit(pawns);
    }
    
    // Castling
    if (side === WHITE) {
        if ((state.castling & WKCA) && !((blockers >> 61n) & 3n) && !isSquareAttacked_lean(state, 60, BLACK) && !isSquareAttacked_lean(state, 61, BLACK)) moves.push(encodeMove(60, 62, K, 0, 0, 0, 0, 1));
        if ((state.castling & WQCA) && !((blockers >> 57n) & 7n) && !isSquareAttacked_lean(state, 60, BLACK) && !isSquareAttacked_lean(state, 59, BLACK)) moves.push(encodeMove(60, 58, K, 0, 0, 0, 0, 1));
    } else {
        if ((state.castling & BKCA) && !((blockers >> 5n) & 3n) && !isSquareAttacked_lean(state, 4, WHITE) && !isSquareAttacked_lean(state, 5, WHITE)) moves.push(encodeMove(4, 6, K, 0, 0, 0, 0, 1));
        if ((state.castling & BQCA) && !((blockers >> 1n) & 7n) && !isSquareAttacked_lean(state, 4, WHITE) && !isSquareAttacked_lean(state, 3, WHITE)) moves.push(encodeMove(4, 2, K, 0, 0, 0, 0, 1));
    }
    
    // Pieces (N, B, R, Q, K)
    const pieces = [N, B, R, Q, K];
    for (const p of pieces) {
        let bb = state.pieceBitboards[side * 6 + p];
        while (bb > 0n) {
            const from = getLSBIndex(bb);
            let attacks = 0n;
            if (p === N) attacks = KNIGHT_ATTACKS[from];
            else if (p === K) attacks = KING_ATTACKS[from];
            else if (p === B) attacks = getBishopAttacks(from, blockers);
            else if (p === R) attacks = getRookAttacks(from, blockers);
            else attacks = getQueenAttacks(from, blockers);
            
            // Mask out friendly pieces
            attacks &= ~friendly;
            
            // We do NOT mask out the King here manually because 'enemies' logic in the move encoding loop handles capture flags.
            // However, to ensure we don't generate a move *onto* the King's square (capturing it),
            // we must iterate carefully or mask 'attacks' against valid squares.
            // To keep the loop tight, we simply check the 'enemies' bitboard when deciding if it's a capture.
            
            while (attacks > 0n) {
                const to = getLSBIndex(attacks);
                const isCapture = (enemies & (1n << BigInt(to))) ? 1 : 0;
                
                // If the square is occupied by enemy but NOT in 'enemies' mask, it is the King.
                // We skip generating a move to that square entirely.
                const isKingSquare = (state.occupancies[enemy] & (1n << BigInt(to))) && !isCapture;
                
                if (!isKingSquare) {
                     moves.push(encodeMove(from, to, p, 0, isCapture, 0, 0, 0));
                }
                
                attacks = popBit(attacks);
            }
            bb = popBit(bb);
        }
    }
    return moves;
}

/* B"H */

/**
 * Generates only capture moves (and queen promotions) for the Quiescence search.
 * FIX: Explicitly excludes the enemy King from being generated as a capture.
 */
function generateTacticalMoves(state) {
    const moves = [];
    const side = state.turn;
    const enemy = side ^ 1;
    const blockers = state.occupancies[2];
    
    // CRITICAL FIX: Exclude the enemy King from valid capture targets.
    const enemies = state.occupancies[enemy] & ~state.pieceBitboards[enemy * 6 + K];

    let pawns = state.pieceBitboards[side * 6 + P];
    while (pawns > 0n) {
        const from = getLSBIndex(pawns);
        const rank = Math.floor(from / 8);
        const promRank = (side === WHITE) ? 1 : 6;
        
        // Pawn Promotions (Quiet promotions are considered tactical in Q-Search)
        const one = (side === WHITE) ? from - 8 : from + 8;
        if (rank === promRank && !((blockers >> BigInt(one)) & 1n)) {
            moves.push(encodeMove(from, one, P, Q, 0, 0, 0, 0)); 
        }
        
        // Pawn Captures
        let attacks = PAWN_ATTACKS[side][from] & enemies;
        while (attacks > 0n) {
            const to = getLSBIndex(attacks);
            if (rank === promRank) moves.push(encodeMove(from, to, P, Q, 1, 0, 0, 0));
            else moves.push(encodeMove(from, to, P, 0, 1, 0, 0, 0));
            attacks = popBit(attacks);
        }
        
        // En Passant (always tactical)
        if (state.enpassant !== -1 && (PAWN_ATTACKS[side][from] & (1n << BigInt(state.enpassant)))) {
            moves.push(encodeMove(from, state.enpassant, P, 0, 1, 0, 1, 0));
        }
        pawns = popBit(pawns);
    }
    
    // Piece Captures
    const pieces = [N, B, R, Q, K];
    for (const p of pieces) {
        let bb = state.pieceBitboards[side * 6 + p];
        while (bb > 0n) {
            const from = getLSBIndex(bb);
            let attacks = 0n;
            if (p === N) attacks = KNIGHT_ATTACKS[from];
            else if (p === B) attacks = getBishopAttacks(from, blockers);
            else if (p === R) attacks = getRookAttacks(from, blockers);
            else if (p === Q) attacks = getQueenAttacks(from, blockers);
            else attacks = KING_ATTACKS[from];
            
            // Only include moves that land on 'enemies' (which now excludes the King)
            attacks &= enemies;
            
            while (attacks > 0n) {
                moves.push(encodeMove(from, getLSBIndex(attacks), p, 0, 1, 0, 0, 0));
                attacks = popBit(attacks);
            }
            bb = popBit(bb);
        }
    }
    return moves;
}