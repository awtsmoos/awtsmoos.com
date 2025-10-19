/* B"H */

// =================================================================
//                 PROMETHEUS - CORE HELPERS (FINAL & UNIFIED)
// =================================================================
// This file is the single source of truth for all game state,
// move generation, and move execution logic. Both the main engine and
// the PGN converter import this file to ensure 100% consistency.

// --- ZOBRIST & HASHING GLOBALS ---
var zobristKeys, zobristTurnKey, zobristCastlingKeys, zobristEnPassantKeys;
const pieceMap = 'PNBRQKpnbrqk';

// --- MOVE GENERATION CONSTANTS ---
const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
const kingMoves = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
const rookDirections = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const bishopDirections = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
const queenDirections = [...rookDirections, ...bishopDirections];
const castlingUpdateMask = [
    14, 15, 15, 15, 12, 15, 15, 13, // a8(q), e8(kq), h8(k)
    15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15,
    11, 15, 15, 15,  3, 15, 15,  7  // a1(Q), e1(KQ), h1(K)
];

// --- INITIALIZATION ---
function initializeZobristKeys() {
    if (zobristKeys) return;
    const pseudoRandom = (() => { let seed = 19880128; return () => seed = (seed * 16807) % 2147483647; })();
    const random64 = () => (BigInt(pseudoRandom()) << 32n) | BigInt(pseudoRandom());
    zobristKeys = Array(12).fill(null).map(() => Array(64).fill(0n).map(random64));
    zobristTurnKey = random64();
    zobristCastlingKeys = Array(16).fill(0n).map(random64);
    zobristEnPassantKeys = Array(8).fill(0n).map(random64);
}

// --- CORE LOGIC FUNCTIONS ---

function findKing(board, color) {
    const king = color === 'w' ? 'K' : 'k';
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (board[r][c] === king) return { r, c };
    return null;
}

function isSquareAttacked(board, r, c, attackerColor) {
    const isWhiteAttacker = attackerColor === 'w';
    const pawn = isWhiteAttacker ? 'P' : 'p';
    const pawnAttackDir = isWhiteAttacker ? 1 : -1;
    if (board[r + pawnAttackDir]?.[c - 1] === pawn || board[r + pawnAttackDir]?.[c + 1] === pawn) return true;
    for (const [dr, dc] of knightMoves) {
        const piece = board[r + dr]?.[c + dc];
        if (piece && piece.toLowerCase() === 'n' && (piece.toUpperCase() === piece) === isWhiteAttacker) return true;
    }
    for (const [dr, dc] of kingMoves) {
        const piece = board[r + dr]?.[c + dc];
        if (piece && piece.toLowerCase() === 'k' && (piece.toUpperCase() === piece) === isWhiteAttacker) return true;
    }
    for (const [dr, dc] of rookDirections) {
        for (let i = 1; i < 8; i++) {
            const piece = board[r + dr * i]?.[c + dc * i];
            if (piece) {
                if ((piece.toUpperCase() === piece) === isWhiteAttacker && (piece.toLowerCase() === 'r' || piece.toLowerCase() === 'q')) return true;
                break;
            }
        }
    }
    for (const [dr, dc] of bishopDirections) {
        for (let i = 1; i < 8; i++) {
            const piece = board[r + dr * i]?.[c + dc * i];
            if (piece) {
                if ((piece.toUpperCase() === piece) === isWhiteAttacker && (piece.toLowerCase() === 'b' || piece.toLowerCase() === 'q')) return true;
                break;
            }
        }
    }
    return false;
}

function generateMovesForPiece(moves, p, r, c, state) {
    const { board, enPassantTarget } = state;
    const pL = p.toLowerCase();
    const isWhite = p === p.toUpperCase();
    const addMove = (to, flags = {}) => moves.push({ from: [r, c], to, piece: p, ...flags });
    if (pL === 'p') {
        const dir = isWhite ? -1 : 1;
        const startRank = isWhite ? 6 : 1;
        const promoRank = isWhite ? 0 : 7;
        const nextR = r + dir;
        if (nextR >= 0 && nextR < 8) {
            if (!board[nextR][c]) {
                if (nextR === promoRank) { for (const promo of isWhite ? "QRBN" : "qrbn") addMove([nextR, c], { promotion: promo }); }
                else { addMove([nextR, c]); }
            }
            for (let dc of [-1, 1]) {
                const nC = c + dc;
                if (nC >= 0 && nC < 8) {
                    const target = board[nextR][nC];
                    if (target && (target.toUpperCase() === target) !== isWhite) {
                        if (nextR === promoRank) { for (const promo of isWhite ? "QRBN" : "qrbn") addMove([nextR, nC], { capture: target, promotion: promo }); }
                        else { addMove([nextR, nC], { capture: target }); }
                    }
                    if (enPassantTarget && nextR === enPassantTarget[0] && nC === enPassantTarget[1]) {
                        addMove([nextR, nC], { capture: isWhite ? 'p' : 'P', isEnPassant: true });
                    }
                }
            }
        }
        if (r === startRank && !board[r + dir][c] && !board[r + 2 * dir][c]) {
            addMove([r + 2 * dir, c], { isPawnDoubleMove: true });
        }
    } else {
        const directions = { n: knightMoves, b: bishopDirections, r: rookDirections, q: queenDirections, k: kingMoves }[pL];
        for (const [dr, dc] of directions) {
            let nR = r + dr, nC = c + dc;
            while (nR >= 0 && nR < 8 && nC >= 0 && nC < 8) {
                const target = board[nR][nC];
                if (target) {
                    if ((target.toUpperCase() === target) !== isWhite) addMove([nR, nC], { capture: target });
                    break;
                }
                addMove([nR, nC]);
                if (pL === 'n' || pL === 'k') break;
                nR += dr; nC += dc;
            }
        }
    }
}

function generateLegalMoves(state) {
    const legalMoves = [];
    const pseudoLegalMoves = [];
    const { board, turn, castlingRights, kingPos } = state;
    const color = turn;
    const opponentColor = color === 'w' ? 'b' : 'w';
    const kingPosition = kingPos[color];
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (p && (p.toUpperCase() === p) === (color === 'w')) {
                generateMovesForPiece(pseudoLegalMoves, p, r, c, state);
            }
        }
    }
    if (kingPosition && !isSquareAttacked(board, kingPosition.r, kingPosition.c, opponentColor)) {
        const r = color === 'w' ? 7 : 0;
        const kingSideMask = color === 'w' ? 8 : 2;
        // FIX: Removed redundant check for the destination square being attacked.
        // The main validation loop already checks the king's final position.
        if ((castlingRights & kingSideMask) && !board[r][5] && !board[r][6] && !isSquareAttacked(board, r, 5, opponentColor)) {
            pseudoLegalMoves.push({ from: [r, 4], to: [r, 6], piece: color === 'w' ? 'K' : 'k', isCastle: true });
        }
        const queenSideMask = color === 'w' ? 4 : 1;
        // FIX: Removed redundant check for the destination square being attacked.
        if ((castlingRights & queenSideMask) && !board[r][1] && !board[r][2] && !board[r][3] && !isSquareAttacked(board, r, 3, opponentColor)) {
            pseudoLegalMoves.push({ from: [r, 4], to: [r, 2], piece: color === 'w' ? 'K' : 'k', isCastle: true });
        }
    }
    for (const move of pseudoLegalMoves) {
        const [fromR, fromC] = move.from;
        const [toR, toC] = move.to;
        const piece = board[fromR][fromC];
        const tempBoard = board.map(row => row.slice());
        tempBoard[toR][toC] = piece;
        tempBoard[fromR][fromC] = '';
        if (move.isCastle) {
            const rookFromC = toC === 6 ? 7 : 0;
            const rookToC = toC === 6 ? 5 : 3;
            tempBoard[fromR][rookToC] = tempBoard[fromR][rookFromC];
            tempBoard[fromR][rookFromC] = '';
        }
        if (move.isEnPassant) {
            tempBoard[color === 'w' ? toR + 1 : toR - 1][toC] = '';
        }
        const currentKingPos = (piece.toLowerCase() === 'k') ? { r: toR, c: toC } : kingPosition;
        if (currentKingPos && !isSquareAttacked(tempBoard, currentKingPos.r, currentKingPos.c, opponentColor)) {
            legalMoves.push(move);
        }
    }
    return legalMoves;
}


function calculateZobristHash(state) {
    let hash = 0n;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = state.board[r][c];
            if (piece) hash ^= zobristKeys[pieceMap.indexOf(piece)][r * 8 + c];
        }
    }
    if (state.enPassantTarget) hash ^= zobristEnPassantKeys[state.enPassantTarget[1]];
    hash ^= zobristCastlingKeys[state.castlingRights];
    if (state.turn === 'b') hash ^= zobristTurnKey;
    return hash;
}

function createGameState(fen) {
    initializeZobristKeys();
    const [pieces, turn, castling, enPassant, half, full] = fen.split(' ');
    const board = Array(8).fill(null).map(() => Array(8).fill(''));
    pieces.split('/').forEach((row, r) => {
        let c = 0;
        for (const char of row) {
            if (isNaN(parseInt(char))) { board[r][c++] = char; }
            else { c += parseInt(char); }
        }
    });
    let castlingRights = 0;
    if (castling.includes('K')) castlingRights |= 8;
    if (castling.includes('Q')) castlingRights |= 4;
    if (castling.includes('k')) castlingRights |= 2;
    if (castling.includes('q')) castlingRights |= 1;
    const enPassantTarget = enPassant === '-' ? null : [8 - parseInt(enPassant[1]), 'abcdefgh'.indexOf(enPassant[0])];
    const state = {
        board, turn, castlingRights, enPassantTarget,
        kingPos: { w: findKing(board, 'w'), b: findKing(board, 'b') },
        moveCount: ((parseInt(full) || 1) - 1) * 2 + (turn === 'b' ? 1 : 0)
    };
    state.zobristHash = calculateZobristHash(state);
    return state;
}








/* B"H */

// =================================================================
//                 PROMETHEUS - CORE HELPERS (FINAL & UNIFIED)
// =================================================================
// This file contains both the IMMUTABLE move function for tools
// and the high-performance MUTABLE make/unmake pair for the engine.


// =================================================================================
//   VERSION 1: IMMUTABLE FUNCTION FOR TOOLS (LIKE PGN CONVERTER)
// =================================================================================
// This is your original function, renamed. It is safe and does not modify state.
// It creates and returns a completely new state object.

function makeMoveImmutable(state, move) {
    if (move.isNullMove) {
        let newHash = state.zobristHash ^ zobristTurnKey;
        if (state.enPassantTarget) newHash ^= zobristEnPassantKeys[state.enPassantTarget[1]];
        return { newState: { ...state, turn: state.turn === 'w' ? 'b' : 'w', enPassantTarget: null, zobristHash: newHash, moveCount: state.moveCount + 1 } };
    }
    const { board, turn, castlingRights, enPassantTarget, zobristHash, kingPos } = state;
    const newBoard = board.map(row => row.slice());
    let newHash = zobristHash;
    const [fromR, fromC] = move.from;
    const [toR, toC] = move.to;
    const piece = newBoard[fromR][fromC];
    const finalPiece = move.promotion ? move.promotion : piece;
    newBoard[fromR][fromC] = '';
    newBoard[toR][toC] = finalPiece;
    newHash ^= zobristKeys[pieceMap.indexOf(piece)][fromR * 8 + fromC];
    newHash ^= zobristKeys[pieceMap.indexOf(finalPiece)][toR * 8 + toC];
    newHash ^= zobristTurnKey;
    if (enPassantTarget) newHash ^= zobristEnPassantKeys[enPassantTarget[1]];
    if (move.isEnPassant) {
        const capturedPawnPos = [turn === 'w' ? toR + 1 : toR - 1, toC];
        const capturedPiece = newBoard[capturedPawnPos[0]][capturedPawnPos[1]];
        newBoard[capturedPawnPos[0]][capturedPawnPos[1]] = '';
        newHash ^= zobristKeys[pieceMap.indexOf(capturedPiece)][capturedPawnPos[0] * 8 + capturedPawnPos[1]];
    }
    let newEnPassantTarget = null;
    if (move.isPawnDoubleMove) {
        newEnPassantTarget = [turn === 'w' ? fromR - 1 : fromR + 1, fromC];
        newHash ^= zobristEnPassantKeys[fromC];
    }
    let newCastlingRights = castlingRights;
    if (newCastlingRights !== 0) {
        newHash ^= zobristCastlingKeys[newCastlingRights];
        newCastlingRights &= castlingUpdateMask[fromR * 8 + fromC];
        newCastlingRights &= castlingUpdateMask[toR * 8 + toC];
        newHash ^= zobristCastlingKeys[newCastlingRights];
    }
    if (move.isCastle) {
        const rookFromC = toC === 6 ? 7 : 0;
        const rookToC = toC === 6 ? 5 : 3;
        const rook = newBoard[fromR][rookFromC];
        newBoard[fromR][rookFromC] = '';
        newBoard[fromR][rookToC] = rook;
        newHash ^= zobristKeys[pieceMap.indexOf(rook)][fromR * 8 + rookFromC];
        newHash ^= zobristKeys[pieceMap.indexOf(rook)][fromR * 8 + rookToC];
    }
    const newKingPos = { ...kingPos };
    if (piece.toLowerCase() === 'k') newKingPos[turn] = { r: toR, c: toC };
    return { newState: { board: newBoard, turn: turn === 'w' ? 'b' : 'w', castlingRights: newCastlingRights, enPassantTarget: newEnPassantTarget, kingPos: newKingPos, zobristHash: newHash, moveCount: state.moveCount + 1 } };
}


// =================================================================================
//   VERSION 2: HIGH-PERFORMANCE MUTABLE FUNCTIONS FOR THE SEARCH ENGINE
// =================================================================================
// This new pair of functions modifies the state directly and then reverts it.
// This is thousands of times faster and is essential for the search.

// ====================================================================================
//            FINAL & ROBUST MAKE/UNMAKE FUNCTIONS (WITH NULL MOVE FIX)
// ====================================================================================

function makeMove(state, move) {
    // --- **NEW: HANDLE NULL MOVE CASE** ---
    // This is the critical fix for the infinite loop.
    if (move.isNullMove) {
        const unmakeInfo = {
            isNullMove: true,
            oldEnPassantTarget: state.enPassantTarget,
            zobristHash: state.zobristHash
        };
        state.turn = state.turn === 'w' ? 'b' : 'w';
        state.enPassantTarget = null;
        // Update hash for turn flip and cleared en passant square
        state.zobristHash ^= zobristTurnKey;
        if (unmakeInfo.oldEnPassantTarget) {
            state.zobristHash ^= zobristEnPassantKeys[unmakeInfo.oldEnPassantTarget[1]];
        }
        return unmakeInfo;
    }
    // --- **END OF FIX** ---

    const unmakeInfo = {
        from: move.from, to: move.to, captured: state.board[move.to[0]][move.to[1]] || null, promotion: move.promotion || null,
        isEnPassant: move.isEnPassant || false, isCastle: move.isCastle || false,
        oldCastlingRights: state.castlingRights, oldEnPassantTarget: state.enPassantTarget, oldMoveCount: state.moveCount,
        zobristHash: state.zobristHash
    };
    const [fromR, fromC] = move.from;
    const [toR, toC] = move.to;
    const piece = state.board[fromR][fromC];
    state.board[toR][toC] = piece;
    state.board[fromR][fromC] = null;
    if (move.isEnPassant) {
        const capturedPawnR = state.turn === 'w' ? toR + 1 : toR - 1;
        unmakeInfo.captured = state.board[capturedPawnR][toC];
        state.board[capturedPawnR][toC] = null;
    } else if (move.isCastle) {
        const rookFromC = toC === 6 ? 7 : 0;
        const rookToC = toC === 6 ? 5 : 3;
        const rook = state.board[fromR][rookFromC];
        state.board[fromR][rookFromC] = null;
        state.board[fromR][rookToC] = rook;
    } else if (move.promotion) {
        state.board[toR][toC] = move.promotion;
    }
    if (piece.toLowerCase() === 'k') { state.kingPos[state.turn] = { r: toR, c: toC }; }
    state.enPassantTarget = move.isPawnDoubleMove ? [(fromR + toR) / 2, fromC] : null;
    state.castlingRights &= castlingUpdateMask[fromR * 8 + fromC];
    state.castlingRights &= castlingUpdateMask[toR * 8 + toC];
    state.turn = state.turn === 'w' ? 'b' : 'w';
    state.moveCount++;
    state.zobristHash = calculateZobristHash(state);
    return unmakeInfo;
}




// ====================================================================================
//                 FINAL, CORRECTED, AND ROBUST UNMAKE_MOVE FUNCTION
// ====================================================================================

function unmakeMove(state, unmakeInfo) {
    // --- HANDLE NULL MOVE CASE ---
    if (unmakeInfo.isNullMove) {
        state.turn = state.turn === 'w' ? 'b' : 'w';
        state.enPassantTarget = unmakeInfo.oldEnPassantTarget;
        state.zobristHash = unmakeInfo.zobristHash;
        return;
    }
    // --- END OF NULL MOVE CASE ---

    const originalTurn = state.turn === 'w' ? 'b' : 'w';
    state.turn = originalTurn;
    state.moveCount = unmakeInfo.oldMoveCount;
    state.castlingRights = unmakeInfo.oldCastlingRights;
    state.enPassantTarget = unmakeInfo.oldEnPassantTarget;
    const [fromR, fromC] = unmakeInfo.from;
    const [toR, toC] = unmakeInfo.to;
    let piece = state.board[toR][toC];
    if (unmakeInfo.promotion) { piece = originalTurn === 'w' ? 'P' : 'p'; }
    state.board[fromR][fromC] = piece;
    state.board[toR][toC] = unmakeInfo.captured;
    if (unmakeInfo.isEnPassant) {
        const capturedPawnR = originalTurn === 'w' ? toR + 1 : toR - 1;
        state.board[capturedPawnR][toC] = unmakeInfo.captured;
        state.board[toR][toC] = null;
    } else if (unmakeInfo.isCastle) {
        const rookFromC = toC === 6 ? 7 : 0;
        const rookToC = toC === 6 ? 5 : 3;
        const rook = state.board[fromR][rookToC];
        state.board[fromR][rookToC] = null;
        state.board[fromR][rookFromC] = rook; // <<<<<<< SYNTAX ERROR FIXED HERE
    }
    if (piece.toLowerCase() === 'k') { state.kingPos[originalTurn] = { r: fromR, c: fromC }; }
    state.zobristHash = unmakeInfo.zobristHash;
}

