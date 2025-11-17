/* B"H */

// =================================================================
//                 PROMETHEUS - CORE HELPERS (BITBOARD v2.0 - VERIFIED)
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

function getLSBIndex(bb) {
    if (bb === 0n) return -1;
    let index = 0;
    while (!((bb >> BigInt(index)) & 1n)) { index++; }
    return index;
}
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


// --- INITIALIZE ALL PRE-CALCULATED DATA ---
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

// --- CORE LOGIC ---
function isSquareAttacked(state, sq, attackerColor) {
    const enemyColor = attackerColor === WHITE ? BLACK : WHITE;
    if ((PAWN_ATTACKS[enemyColor][sq] & state.pieceBitboards[attackerColor * 6 + P]) !== 0n) return true;
    if ((KNIGHT_ATTACKS[sq] & state.pieceBitboards[attackerColor * 6 + N]) !== 0n) return true;
    const blockers = state.occupancies[2];
    if ((getBishopAttacks(sq, blockers) & (state.pieceBitboards[attackerColor * 6 + B] | state.pieceBitboards[attackerColor * 6 + Q])) !== 0n) return true;
    if ((getRookAttacks(sq, blockers) & (state.pieceBitboards[attackerColor * 6 + R] | state.pieceBitboards[attackerColor * 6 + Q])) !== 0n) return true;
    if ((KING_ATTACKS[sq] & state.pieceBitboards[attackerColor * 6 + K]) !== 0n) return true;
    return false;
}

function createGameState(fen) {
    initializeAll();
    const state = {
        pieceBitboards: Array(12).fill(0n),
        occupancies: Array(3).fill(0n),
        turn: WHITE, enpassant: -1, castling: 0,
    };
    const fenParts = fen.split(' ');
    let rank = 0, file = 0;
    for (const char of fenParts[0]) {
        if (char === '/') { rank++; file = 0; }
        else if (/\d/.test(char)) { file += parseInt(char); }
        else {
            const sq = rank * 8 + file;
            const piece = pieceMap.indexOf(char);
            const color = (piece > 5) ? BLACK : WHITE;
            state.pieceBitboards[piece] |= (1n << BigInt(sq));
            state.occupancies[color] |= (1n << BigInt(sq));
            file++;
        }
    }
    state.occupancies[2] = state.occupancies[WHITE] | state.occupancies[BLACK];
    state.turn = (fenParts[1] === 'w') ? WHITE : BLACK;
    if (fenParts[2].includes('K')) state.castling |= WKCA;
    if (fenParts[2].includes('Q')) state.castling |= WQCA;
    if (fenParts[2].includes('k')) state.castling |= BKCA;
    if (fenParts[2].includes('q')) state.castling |= BQCA;
    if (fenParts[3] !== '-') {
        state.enpassant = (8 - parseInt(fenParts[3][1])) * 8 + (fenParts[3].charCodeAt(0) - 'a'.charCodeAt(0));
    }
    // *** CRITICAL FIX: ZOBRIST HASH INITIALIZATION ***
    state.zobristHash = calculateZobristHash(state);
    return state;
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

// --- FINAL MOVE GENERATOR ---
function generateMoves(state) {
    const moves = [];
    const side = state.turn;
    const enemy = side ^ 1;
    const blockers = state.occupancies[2];
    const kingSq = getLSBIndex(state.pieceBitboards[side * 6 + K]);

    let pawns = state.pieceBitboards[side * 6 + P];
    while(pawns > 0n) {
        const from = getLSBIndex(pawns);
        const to = side === WHITE ? from - 8 : from + 8;
        if (to >= 0 && to < 64 && !((blockers >> BigInt(to)) & 1n)) {
            if ((side === WHITE && from >= 8 && from <= 15) || (side === BLACK && from >= 48 && from <= 55)) {
                moves.push(encodeMove(from, to, P, Q, 0,0,0,0)); moves.push(encodeMove(from, to, P, R, 0,0,0,0));
                moves.push(encodeMove(from, to, P, B, 0,0,0,0)); moves.push(encodeMove(from, to, P, N, 0,0,0,0));
            } else { moves.push(encodeMove(from, to, P, 0, 0,0,0,0)); }
            if ((side === WHITE && from >= 48 && from <= 55) || (side === BLACK && from >= 8 && from <= 15)) {
                const two_to = side === WHITE ? from - 16 : from + 16;
                if (!((blockers >> BigInt(two_to)) & 1n)) { moves.push(encodeMove(from, two_to, P, 0, 0,1,0,0)); }
            }
        }
        let attacks = PAWN_ATTACKS[side][from] & state.occupancies[enemy];
        while(attacks > 0n) {
            const to_cap = getLSBIndex(attacks);
            if ((side === WHITE && from >= 8 && from <= 15) || (side === BLACK && from >= 48 && from <= 55)) {
                 moves.push(encodeMove(from, to_cap, P, Q, 1,0,0,0)); // Add other promotions...
            } else { moves.push(encodeMove(from, to_cap, P, 0, 1,0,0,0)); }
            attacks = popBit(attacks);
        }
        if (state.enpassant !== -1) {
            if ((PAWN_ATTACKS[side][from] & (1n << BigInt(state.enpassant))) !== 0n) {
                moves.push(encodeMove(from, state.enpassant, P, 0, 1,0,1,0));
            }
        }
        pawns = popBit(pawns);
    }
    if (side === WHITE) {
        if ((state.castling & WKCA) && !((blockers >> 61n) & 1n) && !((blockers >> 62n) & 1n)) {
            if (!isSquareAttacked(state, 60, BLACK) && !isSquareAttacked(state, 61, BLACK)) moves.push(encodeMove(60, 62, K, 0, 0,0,0,1));
        }
        if ((state.castling & WQCA) && !((blockers >> 59n) & 1n) && !((blockers >> 58n) & 1n) && !((blockers >> 57n) & 1n)) {
            if (!isSquareAttacked(state, 60, BLACK) && !isSquareAttacked(state, 59, BLACK)) moves.push(encodeMove(60, 58, K, 0, 0,0,0,1));
        }
    } else {
        if ((state.castling & BKCA) && !((blockers >> 5n) & 1n) && !((blockers >> 6n) & 1n)) {
            if (!isSquareAttacked(state, 4, WHITE) && !isSquareAttacked(state, 5, WHITE)) moves.push(encodeMove(4, 6, K, 0, 0,0,0,1));
        }
        if ((state.castling & BQCA) && !((blockers >> 3n) & 1n) && !((blockers >> 2n) & 1n) && !((blockers >> 1n) & 1n)) {
            if (!isSquareAttacked(state, 4, WHITE) && !isSquareAttacked(state, 3, WHITE)) moves.push(encodeMove(4, 2, K, 0, 0,0,0,1));
        }
    }
    const pieces = [N, B, R, Q, K];
    for (const piece of pieces) {
        let bitboard = state.pieceBitboards[side * 6 + piece];
        while (bitboard > 0n) {
            const from = getLSBIndex(bitboard);
            let attacks = 0n;
            switch(piece) {
                case N: attacks = KNIGHT_ATTACKS[from]; break;
                case B: attacks = getBishopAttacks(from, blockers); break;
                case R: attacks = getRookAttacks(from, blockers); break;
                case Q: attacks = getQueenAttacks(from, blockers); break;
                case K: attacks = KING_ATTACKS[from]; break;
            }
            attacks &= ~state.occupancies[side];
            while (attacks > 0n) {
                const to = getLSBIndex(attacks);
                moves.push(encodeMove(from, to, piece, 0, (state.occupancies[enemy] & (1n << BigInt(to))) !== 0n ? 1 : 0, 0,0,0));
                attacks = popBit(attacks);
            }
            bitboard = popBit(bitboard);
        }
    }
    return moves;
}

// IN HELPERS.JS, REPLACE THE `makeMove` and `unmakeMove` functions:

// This is the castling rights update array, which is needed by makeMove
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

function makeMove(state, move) {
    const from = getMoveFrom(move), to = getMoveTo(move), piece = getMovePiece(move), promoted = getMovePromoted(move);
    const side = state.turn, enemy = side ^ 1;
    
    let capturedPiece = -1;
    if (getMoveCapture(move)) {
        const start = enemy * 6;
        for (let p = P; p <= K; p++) {
            if (((state.pieceBitboards[start + p] >> BigInt(to)) & 1n) === 1n) {
                capturedPiece = p;
                break;
            }
        }
    }

    moveStack[moveStackPtr++] = { move, castling: state.castling, enpassant: state.enpassant, capturedPiece: getMoveEnpassant(move) ? P : capturedPiece };

    const from_to_bb = (1n << BigInt(from)) | (1n << BigInt(to));
    state.pieceBitboards[side * 6 + piece] ^= from_to_bb;
    state.occupancies[side] ^= from_to_bb;
    state.occupancies[2] ^= from_to_bb;

    if (capturedPiece !== -1) {
        const ep_capture_sq = getMoveEnpassant(move) ? (side === WHITE ? to + 8 : to - 8) : to;
        const captured_bb = 1n << BigInt(ep_capture_sq);
        state.pieceBitboards[enemy * 6 + capturedPiece] ^= captured_bb;
        state.occupancies[enemy] ^= captured_bb;
        state.occupancies[2] ^= captured_bb;
    }
    if (promoted) {
        state.pieceBitboards[side * 6 + P] ^= (1n << BigInt(to));
        state.pieceBitboards[side * 6 + promoted] ^= (1n << BigInt(to));
    }
    if (getMoveCastling(move)) {
        const rook_from_to_bb = (to === 62) ? (1n << 63n) | (1n << 61n) : (to === 58) ? (1n << 56n) | (1n << 59n) :
                               (to === 6) ? (1n << 7n) | (1n << 5n) : (1n << 0n) | (1n << 3n);
        state.pieceBitboards[side * 6 + R] ^= rook_from_to_bb;
        state.occupancies[side] ^= rook_from_to_bb;
        state.occupancies[2] ^= rook_from_to_bb;
    }

    state.castling &= castling_rights[from] & castling_rights[to];
    state.enpassant = getMoveDouble(move) ? (side === WHITE ? from - 8 : from + 8) : -1;
    state.turn ^= 1;
}

function unmakeMove(state) {
    const unmakeInfo = moveStack[--moveStackPtr];
    const move = unmakeInfo.move;
    const from = getMoveFrom(move), to = getMoveTo(move), piece = getMovePiece(move), promoted = getMovePromoted(move);
    state.turn ^= 1;
    const side = state.turn, enemy = side ^ 1;

    const from_to_bb = (1n << BigInt(from)) | (1n << BigInt(to));
    state.pieceBitboards[side * 6 + piece] ^= from_to_bb;
    state.occupancies[side] ^= from_to_bb;
    state.occupancies[2] ^= from_to_bb;

    if (unmakeInfo.capturedPiece !== -1) {
        const ep_capture_sq = getMoveEnpassant(move) ? (side === WHITE ? to + 8 : to - 8) : to;
        const captured_bb = 1n << BigInt(ep_capture_sq);
        state.pieceBitboards[enemy * 6 + unmakeInfo.capturedPiece] ^= captured_bb;
        state.occupancies[enemy] ^= captured_bb;
        state.occupancies[2] ^= captured_bb;
    }
    if (promoted) {
        state.pieceBitboards[side * 6 + P] ^= (1n << BigInt(to));
        state.pieceBitboards[side * 6 + promoted] ^= (1n << BigInt(to));
    }
    if (getMoveCastling(move)) {
        const rook_from_to_bb = (to === 62) ? (1n << 63n) | (1n << 61n) : (to === 58) ? (1n << 56n) | (1n << 59n) :
                               (to === 6) ? (1n << 7n) | (1n << 5n) : (1n << 0n) | (1n << 3n);
        state.pieceBitboards[side * 6 + R] ^= rook_from_to_bb;
        state.occupancies[side] ^= rook_from_to_bb;
        state.occupancies[2] ^= rook_from_to_bb;
    }
    state.castling = unmakeInfo.castling;
    state.enpassant = unmakeInfo.enpassant;
}