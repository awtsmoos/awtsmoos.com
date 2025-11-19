/*B"H*/
importScripts("bitboard-helpers.js")


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