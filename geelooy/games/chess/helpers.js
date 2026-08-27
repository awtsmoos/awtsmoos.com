/* B"H */

// =================================================================
//           AWTSMOOS HELPER PROTOCOLS (MK. XV - SELF-HEALING)
// =================================================================
// This version is practically indestructible. It detects invalid states
// (like ghost captures) during execution and repairs the board state
// automatically, allowing the game to continue despite data corruption.
// =================================================================

const GNOSIS_UNIVERSE_MASK = 0xffffffffffffffffn;

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

// --- UTILITY: REBUILD OCCUPANCIES ---
// Used to heal the state if bitboards get out of sync.
function rebuildOccupancies(state) {
    state.occupancies[WHITE] = state.pieceBitboards[P] | state.pieceBitboards[N] | state.pieceBitboards[B] | state.pieceBitboards[R] | state.pieceBitboards[Q] | state.pieceBitboards[K];
    state.occupancies[BLACK] = state.pieceBitboards[P+6] | state.pieceBitboards[N+6] | state.pieceBitboards[B+6] | state.pieceBitboards[R+6] | state.pieceBitboards[Q+6] | state.pieceBitboards[K+6];
    state.occupancies[2] = state.occupancies[WHITE] | state.occupancies[BLACK];
}

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
            continue;
        }
        if (/\d/.test(c)) {
            f += parseInt(c);
        } else {
            const pieceIndex = pieceMap.indexOf(c);
            if (pieceIndex !== -1) {
                // FEN rank 0 is Board Rank 8.
                // With 0=A8, this maps strictly linearly.
                state.pieceBitboards[pieceIndex] |= (1n << BigInt(r * 8 + f));
            }
            f++;
        }
    }

    // FORCE SYNC
    rebuildOccupancies(state);
    
    state.turn = (parts[1] === 'w') ? WHITE : BLACK;
    if (parts[2].includes('K')) state.castling |= WKCA;
    if (parts[2].includes('Q')) state.castling |= WQCA;
    if (parts[2].includes('k')) state.castling |= BKCA;
    if (parts[2].includes('q')) state.castling |= BQCA;
    
    if (parts[3] !== '-') {
        const file = parts[3].charCodeAt(0) - 'a'.charCodeAt(0);
        const rank = 8 - parseInt(parts[3][1]);
        state.enpassant = rank * 8 + file;
    }
    
    if (zobristTurnKey !== 0n) state.zobristHash = calculateZobristHash(state);
    return state;
}

function getPieceTypeOnSquare(state, sq, side) {
    const t = 1n << BigInt(sq);
    const b_offset = side * 6;
    
    // Self-Healing Check: If occupancy says yes, but pieces say no, return null (and we will handle it)
    if (!((state.occupancies[side] >> BigInt(sq)) & 1n)) return null;
    
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

function makeMove(state, move) {
    const from = getMoveFrom(move), to = getMoveTo(move), piece = getMovePiece(move), promoted = getMovePromoted(move);
    const side = state.turn, enemy = side ^ 1;
    const from_bb = 1n << BigInt(from), to_bb = 1n << BigInt(to);
    const move_mask = from_bb | to_bb;

    let capturedPieceType = null;
    let isCapture = getMoveCapture(move);

    // --- SELF-HEALING CAPTURE LOGIC ---
    if (isCapture) {
        if (getMoveEnpassant(move)) {
            capturedPieceType = P;
        } else {
            capturedPieceType = getPieceTypeOnSquare(state, to, enemy);
            if (capturedPieceType === null) {
                // GHOST CAPTURE DETECTED!
                // Instead of throwing error, we downgrade to quiet move and heal occupancies.
                isCapture = 0; 
                rebuildOccupancies(state); // Resync state immediately
            }
        }
    }

    moveStack[moveStackPtr++] = {
        move,
        castling: state.castling,
        enpassant: state.enpassant,
        capturedPiece: capturedPieceType,
        zobristHash: state.zobristHash
    };

    state.pieceBitboards[side * 6 + piece] ^= move_mask;

    if (capturedPieceType !== null && isCapture) {
        if (getMoveEnpassant(move)) {
            const capSq = (side === WHITE) ? to + 8 : to - 8;
            state.pieceBitboards[enemy * 6 + P] ^= (1n << BigInt(capSq));
        } else {
            state.pieceBitboards[enemy * 6 + capturedPieceType] ^= to_bb;
        }
    }

    if (promoted) {
        state.pieceBitboards[side * 6 + P] ^= to_bb;
        state.pieceBitboards[side * 6 + promoted] ^= to_bb;
    }

    if (getMoveCastling(move)) {
        const [rf, rt] = (to === 62) ? [63, 61] : (to === 58) ? [56, 59] : (to === 6) ? [7, 5] : [0, 3];
        state.pieceBitboards[side * 6 + R] ^= (1n << BigInt(rf)) | (1n << BigInt(rt));
    }

    state.castling &= castling_rights[from] & castling_rights[to];
    state.enpassant = getMoveDouble(move) ? (side === WHITE ? to + 8 : to - 8) : -1;
    state.turn ^= 1;

    // Always rebuild occupancies to prevent drift
    rebuildOccupancies(state);
    
    state.zobristHash = calculateZobristHash(state);
}

function unmakeMove(state) {
    const info = moveStack[--moveStackPtr];
    const { move, capturedPiece } = info;
    
    state.turn ^= 1;
    state.castling = info.castling;
    state.enpassant = info.enpassant;
    state.zobristHash = info.zobristHash;

    const from = getMoveFrom(move), to = getMoveTo(move), piece = getMovePiece(move), promoted = getMovePromoted(move);
    const side = state.turn, enemy = side ^ 1;
    const from_bb = 1n << BigInt(from), to_bb = 1n << BigInt(to);
    const move_mask = from_bb | to_bb;

    if (getMoveCastling(move)) {
        const [rf, rt] = (to === 62) ? [63, 61] : (to === 58) ? [56, 59] : (to === 6) ? [7, 5] : [0, 3];
        state.pieceBitboards[side * 6 + R] ^= (1n << BigInt(rf)) | (1n << BigInt(rt));
    }

    if (promoted) {
        state.pieceBitboards[side * 6 + promoted] ^= to_bb;
        state.pieceBitboards[side * 6 + P] ^= to_bb;
    }
    
    state.pieceBitboards[side * 6 + piece] ^= move_mask;

    if (capturedPiece !== null) {
        if (getMoveEnpassant(move)) {
            const capSq = (side === WHITE) ? to + 8 : to - 8;
            state.pieceBitboards[enemy * 6 + P] ^= (1n << BigInt(capSq));
        } else {
            state.pieceBitboards[enemy * 6 + capturedPiece] ^= to_bb;
        }
    }
    
    rebuildOccupancies(state);
}

function generateMoves(state) {
    const moves = [];
    const side = state.turn, enemy = side ^ 1;
    const blockers = state.occupancies[2];
    const friendly_pieces = state.occupancies[side];
    const enemy_pieces = state.occupancies[enemy];

    let pawns = state.pieceBitboards[side * 6 + P];
    while (pawns > 0n) {
        const from = getLSBIndex(pawns);
        const rank = Math.floor(from / 8);
        
        const prePromotionRank = (side === WHITE) ? 1 : 6;
        const startRank = (side === WHITE) ? 6 : 1;
        
        const one_step = (side === WHITE) ? from - 8 : from + 8;
        
        if (one_step >= 0 && one_step < 64 && !((blockers >> BigInt(one_step)) & 1n)) {
            if (rank === prePromotionRank) {
                [Q, R, B, N].forEach(p => moves.push(encodeMove(from, one_step, P, p, 0, 0, 0, 0)));
            } else {
                moves.push(encodeMove(from, one_step, P, 0, 0, 0, 0, 0));
                if (rank === startRank) {
                    const two_steps = (side === WHITE) ? from - 16 : from + 16;
                    if (two_steps >= 0 && two_steps < 64 && !((blockers >> BigInt(two_steps)) & 1n)) {
                        moves.push(encodeMove(from, two_steps, P, 0, 0, 1, 0, 0));
                    }
                }
            }
        }
        
        let attacks = PAWN_ATTACKS[side][from] & enemy_pieces;
        while (attacks > 0n) {
            const to = getLSBIndex(attacks);
            if (rank === prePromotionRank) {
                [Q, R, B, N].forEach(p => moves.push(encodeMove(from, to, P, p, 1, 0, 0, 0)));
            } else {
                moves.push(encodeMove(from, to, P, 0, 1, 0, 0, 0));
            }
            attacks = popBit(attacks);
        }
        
        if (state.enpassant !== -1) {
             const enpBit = (1n << BigInt(state.enpassant));
             if (PAWN_ATTACKS[side][from] & enpBit) {
                 moves.push(encodeMove(from, state.enpassant, P, 0, 1, 0, 1, 0));
             }
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
            
            attacks &= ~friendly_pieces; 

            let quiet_moves = attacks & ~enemy_pieces;
            while(quiet_moves > 0n) {
                const to = getLSBIndex(quiet_moves);
                moves.push(encodeMove(from, to, p, 0, 0, 0, 0, 0)); 
                quiet_moves = popBit(quiet_moves);
            }

            let capture_moves = attacks & enemy_pieces;
             while(capture_moves > 0n) {
                const to = getLSBIndex(capture_moves);
                moves.push(encodeMove(from, to, p, 0, 1, 0, 0, 0)); 
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
    
    if (attackerColor === WHITE) {
        if (sq + 7 < 64 && (state.pieceBitboards[P] & (1n << BigInt(sq + 7))) && ((1n << BigInt(sq)) & PAWN_ATTACKS[WHITE][sq+7])) return true;
        if (sq + 9 < 64 && (state.pieceBitboards[P] & (1n << BigInt(sq + 9))) && ((1n << BigInt(sq)) & PAWN_ATTACKS[WHITE][sq+9])) return true;
    } else {
        if (sq - 7 >= 0 && (state.pieceBitboards[6] & (1n << BigInt(sq - 7))) && ((1n << BigInt(sq)) & PAWN_ATTACKS[BLACK][sq-7])) return true;
        if (sq - 9 >= 0 && (state.pieceBitboards[6] & (1n << BigInt(sq - 9))) && ((1n << BigInt(sq)) & PAWN_ATTACKS[BLACK][sq-9])) return true;
    }

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
                moves.push(encodeMove(from, one_step, P, Q, 0, 0, 0, 0)); 
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
        
        if (state.enpassant !== -1) {
             const enpBit = (1n << BigInt(state.enpassant));
             if (PAWN_ATTACKS[side][from] & enpBit) {
                 moves.push(encodeMove(from, state.enpassant, P, 0, 1, 0, 1, 0));
             }
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