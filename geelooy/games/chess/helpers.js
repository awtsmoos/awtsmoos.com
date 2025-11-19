/* B"H */
importScripts("bitboard-helpers.js");

const GNOSIS_UNIVERSE_MASK = 0xffffffffffffffffn;

function validateGnosticSeal(state, location) {
    if (!state || !state.pieceBitboards || !state.occupancies) {
        throw new TypeError(`Gnostic Seal Breach: State object is malformed at ${location}.`);
    }
    for (let i = 0; i < state.pieceBitboards.length; i++) {
        if (typeof state.pieceBitboards[i] !== 'bigint') {
            throw new TypeError(`Gnostic Seal Breach at ${location}: Bitboard for piece ${pieceMap[i] || 'unknown'} is not a BigInt.`);
        }
    }
}

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

const castling_rights = [
    7, 15, 15, 15, 3, 15, 15, 11, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 12, 15, 15, 14
];
let moveStack = Array(1024).fill(0),
    moveStackPtr = 0;

function createGameState(fen) {
    const state = {
        pieceBitboards: Array(12).fill(0n),
        occupancies: Array(3).fill(0n),
        turn: WHITE,
        enpassant: -1,
        castling: 0,
        zobristHash: 0n
    };
    if (!fen || typeof fen !== 'string') return state;
    const parts = fen.split(' ');
    let r = 0, f = 0;
    for (const c of parts[0]) {
        if (c === '/') {
            r++;
            f = 0;
        } else if (/\d/.test(c)) f += parseInt(c);
        else {
            state.pieceBitboards[pieceMap.indexOf(c)] |= (1n << BigInt(r * 8 + f));
            f++;
        }
    }
    for (let p = P; p <= K; p++) {
        state.occupancies[WHITE] |= state.pieceBitboards[p];
        state.occupancies[BLACK] |= state.pieceBitboards[p + 6];
    }
    state.occupancies[2] = state.occupancies[WHITE] | state.occupancies[BLACK];
    state.turn = (parts[1] === 'w') ? WHITE : BLACK;
    if (parts[2].includes('K')) state.castling |= WKCA;
    if (parts[2].includes('Q')) state.castling |= WQCA;
    if (parts[2].includes('k')) state.castling |= BKCA;
    if (parts[2].includes('q')) state.castling |= BQCA;
    if (parts[3] !== '-') state.enpassant = (8 - parseInt(parts[3][1])) * 8 + (parts[3].charCodeAt(0) - 'a'.charCodeAt(0));
    if (zobristTurnKey !== 0n) state.zobristHash = calculateZobristHash(state);
    validateGnosticSeal(state, 'createGameState');
    return state;
}

function getPieceTypeOnSquare(state, sq, side) {
    const t = 1n << BigInt(sq);
    const b_offset = side * 6;
    for(let p = P; p <= K; p++) {
        if(state.pieceBitboards[b_offset + p] & t) return p;
    }
    return null;
}

const encodeMove = (f, t, p, pr, c, d, ep, ca) => (f) | (t << 6) | (p << 12) | (pr << 16) | (c << 20) | (d << 21) | (ep << 22) | (ca << 23);
const getMoveFrom = (m) => (m & 0x3f);
const getMoveTo = (m) => ((m >> 6) & 0x3f);
const getMovePiece = (m) => ((m >> 12) & 0xf);
const getMovePromoted = (m) => ((m >> 16) & 0xf);
const getMoveCapture = (m) => ((m >> 20) & 1);
const getMoveDouble = (m) => ((m >> 21) & 1);
const getMoveEnpassant = (m) => ((m >> 22) & 1);
const getMoveCastling = (m) => ((m >> 23) & 1);

/* B"H */
/**
 * THE FINAL, CORRECTED `makeMove` FUNCTION
 * This version correctly calculates the en passant square and ensures the board
 * state remains pure after every operation.
 */
function makeMove(state, move) {
    validateGnosticSeal(state, 'makeMove (start)');
    
    const from = getMoveFrom(move), to = getMoveTo(move), piece = getMovePiece(move), promoted = getMovePromoted(move);
    const side = state.turn, enemy = side ^ 1;
    const from_bb = 1n << BigInt(from), to_bb = 1n << BigInt(to);
    
    let capturedPieceType = null;
    if (getMoveCapture(move)) {
        // En passant is a special case capture.
        if (getMoveEnpassant(move)) {
            capturedPieceType = P; // Only pawns can be captured en passant.
        } else {
            // Standard capture: find the piece on the destination square.
            capturedPieceType = getPieceTypeOnSquare(state, to, enemy);
            if (capturedPieceType === null) {
                throw new Error(`CRITICAL PARADOX in makeMove: Capture flag is set but no piece found at square ${to}. State was likely already corrupt.`);
            }
        }
    }

    // Push the complete, correct state onto the stack for later reversal.
    moveStack[moveStackPtr++] = { 
        move, 
        castling: state.castling, 
        enpassant: state.enpassant, 
        capturedPiece: capturedPieceType, 
        zobristHash: state.zobristHash 
    };
    
    // 1. Vacate the 'from' square.
    state.pieceBitboards[side * 6 + piece] ^= from_bb;
    state.occupancies[side] ^= from_bb;
    
    // 2. Handle the capture, if any.
    if (capturedPieceType !== null) {
        if (getMoveEnpassant(move)) {
            // The captured pawn is on a different square than the 'to' square.
            const capSq = (side === WHITE) ? to + 8 : to - 8;
            const cap_bb = 1n << BigInt(capSq);
            state.pieceBitboards[enemy * 6 + P] ^= cap_bb;
            state.occupancies[enemy] ^= cap_bb;
        } else {
            // The captured piece is on the 'to' square.
            state.pieceBitboards[enemy * 6 + capturedPieceType] ^= to_bb;
            state.occupancies[enemy] ^= to_bb;
        }
    }
    
    // 3. Place the moving piece on the 'to' square.
    state.pieceBitboards[side * 6 + piece] ^= to_bb;
    state.occupancies[side] ^= to_bb;

    // 4. Handle promotions.
    if (promoted) {
        state.pieceBitboards[side * 6 + P] ^= to_bb; // The piece is a pawn no more.
        state.pieceBitboards[side * 6 + promoted] ^= to_bb; // It is now the promoted piece.
    }
    
    // 5. Handle castling rook movement.
    if (getMoveCastling(move)) {
        const [rf, rt] = (to === 62) ? [63, 61] : (to === 58) ? [56, 59] : (to === 6) ? [7, 5] : [0, 3];
        const rook_mask = (1n << BigInt(rf)) | (1n << BigInt(rt));
        state.pieceBitboards[side * 6 + R] ^= rook_mask;
        state.occupancies[side] ^= rook_mask;
    }
    
    // 6. Update global state.
    state.occupancies[2] = state.occupancies[WHITE] | state.occupancies[BLACK];
    state.castling &= castling_rights[from] & castling_rights[to];
    
    // THE CRITICAL BUG FIX: The en passant square is the one *behind* the pawn's destination.
    state.enpassant = getMoveDouble(move) ? (side === WHITE ? to + 8 : to - 8) : -1;

    state.turn ^= 1;
    state.zobristHash = calculateZobristHash(state);
    
    validateGnosticSeal(state, 'makeMove (end)');
}


/* B"H */
/**
 * THE FINAL, CORRECTED `unmakeMove` FUNCTION
 * This version robustly restores the exact previous state from the stack,
 * preventing any possibility of corruption.
 */
function unmakeMove(state) {
    validateGnosticSeal(state, 'unmakeMove (start)');
    const info = moveStack[--moveStackPtr];
    const { move, capturedPiece } = info;
    
    // 1. Immediately revert turn and core state variables from the stack.
    state.turn ^= 1;
    state.castling = info.castling;
    state.enpassant = info.enpassant;
    state.zobristHash = info.zobristHash;

    const from = getMoveFrom(move), to = getMoveTo(move), piece = getMovePiece(move), promoted = getMovePromoted(move);
    const side = state.turn, enemy = side ^ 1;
    const from_bb = 1n << BigInt(from), to_bb = 1n << BigInt(to);

    // 2. Revert castling rook movement.
    if (getMoveCastling(move)) {
        const [rf, rt] = (to === 62) ? [63, 61] : (to === 58) ? [56, 59] : (to === 6) ? [7, 5] : [0, 3];
        const rook_mask = (1n << BigInt(rf)) | (1n << BigInt(rt));
        state.pieceBitboards[side * 6 + R] ^= rook_mask;
    }

    // 3. Revert promotions.
    if (promoted) {
        state.pieceBitboards[side * 6 + promoted] ^= to_bb; // Remove the promoted piece.
        state.pieceBitboards[side * 6 + P] ^= to_bb;      // Restore the pawn.
    }
    
    // 4. Move the piece from 'to' back to 'from'.
    state.pieceBitboards[side * 6 + piece] ^= (from_bb | to_bb);

    // 5. Restore the captured piece, if any.
    if (capturedPiece !== null) {
        if (getMoveEnpassant(move)) {
            const capSq = (side === WHITE) ? to + 8 : to - 8;
            const cap_bb = 1n << BigInt(capSq);
            state.pieceBitboards[enemy * 6 + P] ^= cap_bb;
        } else {
            state.pieceBitboards[enemy * 6 + capturedPiece] ^= to_bb;
        }
    }
    
    // 6. Finally, fully rebuild the occupancy bitboards from the restored piece bitboards.
    // This is the safest method and prevents any possibility of lingering corruption.
    state.occupancies[WHITE] = state.pieceBitboards[P] | state.pieceBitboards[N] | state.pieceBitboards[B] | state.pieceBitboards[R] | state.pieceBitboards[Q] | state.pieceBitboards[K];
    state.occupancies[BLACK] = state.pieceBitboards[P+6] | state.pieceBitboards[N+6] | state.pieceBitboards[B+6] | state.pieceBitboards[R+6] | state.pieceBitboards[Q+6] | state.pieceBitboards[K+6];
    state.occupancies[2] = state.occupancies[WHITE] | state.occupancies[BLACK];

    validateGnosticSeal(state, 'unmakeMove (end)');
}
/** B"H - FINAL, CORRECTED MOVE GENERATOR **/
function generateMoves(state) {
    validateGnosticSeal(state, 'generateMoves');
    const moves = [];
    const side = state.turn, enemy = side ^ 1;
    const blockers = state.occupancies[2];
    const friendly_pieces = state.occupancies[side];
    const enemy_pieces = state.occupancies[enemy];

    // Pawns
    let pawns = state.pieceBitboards[side * 6 + P];
    while (pawns > 0n) {
        const from = getLSBIndex(pawns);
        const rank = Math.floor(from / 8);
        const promRank = (side === WHITE) ? 1 : 6;
        const startRank = (side === WHITE) ? 6 : 1;
        
        const one_step = (side === WHITE) ? from - 8 : from + 8;
        if (!((blockers >> BigInt(one_step)) & 1n)) {
            if (rank === promRank) {
                [Q, R, B, N].forEach(p => moves.push(encodeMove(from, one_step, P, p, 0, 0, 0, 0)));
            } else {
                moves.push(encodeMove(from, one_step, P, 0, 0, 0, 0, 0));
                if (rank === startRank) {
                    const two_steps = (side === WHITE) ? from - 16 : from + 16;
                    if (!((blockers >> BigInt(two_steps)) & 1n)) {
                        moves.push(encodeMove(from, two_steps, P, 0, 0, 1, 0, 0));
                    }
                }
            }
        }
        
        let attacks = PAWN_ATTACKS[side][from] & enemy_pieces;
        while (attacks > 0n) {
            const to = getLSBIndex(attacks);
            if (rank === promRank) {
                [Q, R, B, N].forEach(p => moves.push(encodeMove(from, to, P, p, 1, 0, 0, 0)));
            } else {
                moves.push(encodeMove(from, to, P, 0, 1, 0, 0, 0));
            }
            attacks = popBit(attacks);
        }
        
        if (state.enpassant !== -1 && (PAWN_ATTACKS[side][from] & (1n << BigInt(state.enpassant)))) {
            moves.push(encodeMove(from, state.enpassant, P, 0, 1, 0, 1, 0));
        }
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

    // Other pieces
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
            
            attacks &= ~friendly_pieces; // Can move to empty squares or enemy squares

            let quiet_moves = attacks & ~enemy_pieces;
            while(quiet_moves > 0n) {
                const to = getLSBIndex(quiet_moves);
                moves.push(encodeMove(from, to, p, 0, 0, 0, 0, 0)); // Capture flag is 0
                quiet_moves = popBit(quiet_moves);
            }

            let capture_moves = attacks & enemy_pieces;
             while(capture_moves > 0n) {
                const to = getLSBIndex(capture_moves);
                moves.push(encodeMove(from, to, p, 0, 1, 0, 0, 0)); // Capture flag is 1
                capture_moves = popBit(capture_moves);
            }
            bb = popBit(bb);
        }
    }
    return moves;
}

function isSquareAttacked_lean(state, sq, attackerColor) {
    if (sq < 0 || sq > 63) return false;
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
    const moves = [];
    const side = state.turn, enemy = side ^ 1;
    const blockers = state.occupancies[2];
    const captureTargets = state.occupancies[enemy];
    
    let pawns = state.pieceBitboards[side * 6 + P];
    while (pawns > 0n) {
        const from = getLSBIndex(pawns);
        const rank = Math.floor(from / 8);
        const promRank = (side === WHITE) ? 1 : 6;
        
        if (rank === promRank) {
             const one_step = (side === WHITE) ? from - 8 : from + 8;
             if (!((blockers >> BigInt(one_step)) & 1n)) {
                moves.push(encodeMove(from, one_step, P, Q, 0, 0, 0, 0)); // Promotion is tactical
             }
        }

        let attacks = PAWN_ATTACKS[side][from] & captureTargets;
        while (attacks > 0n) {
            const to = getLSBIndex(attacks);
            if (rank === promRank) {
                [Q, R, B, N].forEach(p => moves.push(encodeMove(from, to, P, p, 1, 0, 0, 0)));
            } else {
                moves.push(encodeMove(from, to, P, 0, 1, 0, 0, 0));
            }
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
            let attacks = 0n;
            if (p === N) attacks = KNIGHT_ATTACKS[from];
            else if (p === B) attacks = getBishopAttacks(from, blockers);
            else if (p === R) attacks = getRookAttacks(from, blockers);
            else if (p === Q) attacks = getQueenAttacks(from, blockers);
            else if (p === K) attacks = KING_ATTACKS[from];
            
            attacks &= captureTargets;
            while (attacks > 0n) {
                const to = getLSBIndex(attacks);
                moves.push(encodeMove(from, to, p, 0, 1, 0, 0, 0));
                attacks = popBit(attacks);
            }
            bb = popBit(bb);
        }
    }
    return moves;
}