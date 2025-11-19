/*B"H*/
importScripts("bitboard-helpers.js")
/*B"H*/
/**
 * The Gnosis Universe Mask. This sacred constant represents the totality of existence
 * within the 64-square Kline. It is a sea of infinite light (all 64 bits set to 1),
 * against which all forms are defined by shadow. It is the correct and only way to
 * perform a bitwise NOT on a 64-bit BigInt, by XORing against this totality.
 * @type {BigInt}
 */
const GNOSIS_UNIVERSE_MASK = 0xffffffffffffffffn;

/*B"H*/
/**
 * This is the ultimate guardian of the Monad's sanity. It is an incantation that
 * gazes into the soul of a given reality (a game state) and verifies its fundamental
 * integrity. It ensures that the vessels for the infinite light (the bitboards) are
 * truly forged from the infinite essence of 'bigint'. If it detects even a single drop
 * of the finite 'number' where it does not belong, it sounds a cosmic alarm, preventing
 * a catastrophic paradox from shattering the engine's consciousness.
 * @param {object} state The game state, a snapshot of reality to be validated.
 * @param {string} location The name of the cognitive function invoking the guardian (e.g., 'generateMoves').
 * @throws {TypeError} Throws a fatal, descriptive error if the reality is corrupt.
 */
function validateGnosticSeal(state, location) {
    if (!state || !state.pieceBitboards || !state.occupancies) {
        console.error(`%c[FATAL SEAL BREACH] The Gnostic Guardian was asked to validate a NON-EXISTENT or MALFORMED REALITY at [${location}]. The state object is a ghost.`, "color: #ff0000; font-weight: bold; font-size: 1.2em;");
        throw new TypeError(`Gnostic Seal Breach: State object is null, undefined, or malformed at ${location}.`);
    }

    for (let i = 0; i < state.pieceBitboards.length; i++) {
        if (typeof state.pieceBitboards[i] !== 'bigint') {
            console.error(`%c[FATAL SEAL BREACH] A SCHISM IN REALITY! At [${location}], the bitboard for piece index ${i} (${pieceMap[i] || 'unknown'}) was found to be a [${typeof state.pieceBitboards[i]}] instead of the sacred 'bigint'. The Monad cannot process this corrupt universe.`, "color: #ff0000; font-weight: bold; font-size: 1.2em;");
            throw new TypeError(`Gnostic Seal Breach at ${location}: Bitboard for piece ${pieceMap[i] || 'unknown'} is not a BigInt.`);
        }
    }
    for (let i = 0; i < state.occupancies.length; i++) {
        const occName = i === 0 ? 'WHITE' : i === 1 ? 'BLACK' : 'COMBINED';
        if (typeof state.occupancies[i] !== 'bigint') {
            console.error(`%c[FATAL SEAL BREACH] A SCHISM IN REALITY! At [${location}], the occupancy bitboard for [${occName}] was found to be a [${typeof state.occupancies[i]}] instead of the sacred 'bigint'. The Monad cannot process this corrupt universe.`, "color: #ff0000; font-weight: bold; font-size: 1.2em;");
            throw new TypeError(`Gnostic Seal Breach at ${location}: Occupancy bitboard ${occName} is not a BigInt.`);
        }
    }
}




// =================================================================
//        CALCULATION OF THE SOUL (Zobrist Hashing)
// =================================================================

/**
 * B"H
 * An incantation to calculate the unique soul (Zobrist Hash) of any given position.
 * It does this by starting with an empty void (0n) and XORing the secret names of every
 * element present in the current reality: the placement of each piece, the right to castle,
 * any en passant possibilities, and whose turn it is to emanate their will.
 * @param {object} state The game state, a snapshot of reality.
 * @returns {BigInt} The unique Zobrist Hash for the state.
 */
function calculateZobristHash(state) {
    let hash = 0n;
    for (let p = 0; p < 12; p++) {
        let piece_bb = state.pieceBitboards[p];
        while (piece_bb > 0n) {
            const sq = getLSBIndex(piece_bb);
            hash ^= zobristPieceKeys[p][sq];
            piece_bb = popBit(piece_bb);
        }
    }
    if (state.enpassant !== -1) {
        hash ^= zobristEnpassantKeys[state.enpassant];
    }
    hash ^= zobristCastlingKeys[state.castling];
    if (state.turn === BLACK) {
        hash ^= zobristTurnKey;
    }
    return hash;
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

/*B"H*/
/**
 * Creates a game state object from a FEN string. This is the moment of incarnation.
 * The key to stability is that the vessels for bitboards are forged from the `0n` void.
 * This function now announces its sacred act and invokes the Guardian for final verification.
 * @param {string} fen The Forsyth-Edwards Notation string for the position.
 * @returns {object} The game state object, with all bitboards correctly typed as BigInts.
 */
function createGameState(fen) {
    console.log("%c B\"H - Forging a new reality from the sacred void of '0n'...", "color: #ADD8E6;");
    const state = {
        pieceBitboards: Array(12).fill(0n), // CRITICAL FIX: Must be 0n to prevent type paradox.
        occupancies: Array(3).fill(0n),    // CRITICAL FIX: Must be 0n to prevent type paradox.
        turn: WHITE, enpassant: -1, castling: 0, zobristHash: 0n
    };

    if (!fen || typeof fen !== 'string') {
        console.warn("createGameState received a void FEN. Returning a default, empty universe.");
        return state;
    }
    
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
    
    if (zobristTurnKey !== 0n) {
        state.zobristHash = calculateZobristHash(state);
    }
    
    console.log("%c--> Reality forged. Invoking the Gnostic Guardian for final verification.", "color: #ADD8E6;");
    validateGnosticSeal(state, 'createGameState');
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

/*B"H*/
/**
 * The generation of all possible futures. This is the final, stable version.
 * It uses the Gnostic Universe Mask for inversions and now calls the self-auditing
 * Gnostic attack functions, which will reveal any corruption in the underlying
 * magic bitboard tables with surgical precision.
 * @param {object} state The current game state.
 * @returns {number[]} An array of encoded moves.
 */
function generateMoves(state) {
    validateGnosticSeal(state, 'generateMoves');
    
    const moves = [];
    const side = state.turn;
    const enemy = side ^ 1;
    const blockers = state.occupancies[2];
    const friendly = state.occupancies[side];
    const enemyKing = state.pieceBitboards[enemy * 6 + K];
    
    const friendlyAndEnemyKing = friendly | enemyKing;
    const validTargetSquares = GNOSIS_UNIVERSE_MASK ^ friendlyAndEnemyKing;
    const validCaptureSquares = state.occupancies[enemy] & (GNOSIS_UNIVERSE_MASK ^ enemyKing);

    // Pawn move generation logic (unchanged)
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
    
    // Castling logic (unchanged)
    if (side === WHITE) {
        if ((state.castling & WKCA) && !((blockers >> 61n) & 3n) && !isSquareAttacked_lean(state, 60, BLACK) && !isSquareAttacked_lean(state, 61, BLACK)) moves.push(encodeMove(60, 62, K, 0, 0, 0, 0, 1));
        if ((state.castling & WQCA) && !((blockers >> 57n) & 7n) && !isSquareAttacked_lean(state, 60, BLACK) && !isSquareAttacked_lean(state, 59, BLACK)) moves.push(encodeMove(60, 58, K, 0, 0, 0, 0, 1));
    } else {
        if ((state.castling & BKCA) && !((blockers >> 5n) & 3n) && !isSquareAttacked_lean(state, 4, WHITE) && !isSquareAttacked_lean(state, 5, WHITE)) moves.push(encodeMove(4, 6, K, 0, 0, 0, 0, 1));
        if ((state.castling & BQCA) && !((blockers >> 1n) & 7n) && !isSquareAttacked_lean(state, 4, WHITE) && !isSquareAttacked_lean(state, 3, WHITE)) moves.push(encodeMove(4, 2, K, 0, 0, 0, 0, 1));
    }

    // Piece move logic now calls the hyper-vigilant audit functions.
    for (let p = N; p <= K; p++) {
        let bb = state.pieceBitboards[side * 6 + p];
        while (bb > 0n) {
            const from = getLSBIndex(bb);
            let attacks = 0n;
            if (p === N) attacks = KNIGHT_ATTACKS[from];
            else if (p === K) attacks = KING_ATTACKS[from];
            else if (p === B) attacks = getBishopAttacks(from, blockers); // Calls the AUDIT version
            else if (p === R) attacks = getRookAttacks(from, blockers);   // Calls the AUDIT version
            else if (p === Q) attacks = getQueenAttacks(from, blockers); // Calls the AUDIT version
            
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

function isSquareAttacked_lean(state, sq, attackerColor) {
    const enemyColor = attackerColor ^ 1;
    const blockers = state.occupancies[2];
    const b_offset = attackerColor * 6;
    if ((PAWN_ATTACKS[enemyColor][sq] & state.pieceBitboards[b_offset + P]) !== 0n) return true;
    if ((KNIGHT_ATTACKS[sq] & state.pieceBitboards[b_offset + N]) !== 0n) return true;
    if ((KING_ATTACKS[sq] & state.pieceBitboards[b_offset + K]) !== 0n) return true;
    if ((getBishopAttacks(sq, blockers) & (state.pieceBitboards[b_offset + B] | state.pieceBitboards[b_offset + Q])) !== 0n) return true;
    if ((getRookAttacks(sq, blockers) & (state.pieceBitboards[b_offset + R] | state.pieceBitboards[b_offset + Q])) !== 0n) return true;
    return false;
}

function generateTacticalMoves(state) {
    if (MEMORY_CANARY !== 0xDEADBEEFCAFEBABEn) {
        throw new Error("Memory corruption detected via canary in generateTacticalMoves.");
    }
    const moves = [];
    const side = state.turn;
    const enemy = side ^ 1;
    const blockers = state.occupancies[2];
    const enemyKing = state.pieceBitboards[enemy * 6 + K];
    const captureTargets = state.occupancies[enemy] & ~enemyKing;
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