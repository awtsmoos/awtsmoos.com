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

// ====================================================================================
//            FINAL, COMPLETE, AND HIGH-PERFORMANCE generateLegalMoves
// ====================================================================================
// This version is fully optimized and correctly handles all move legality checks,
// including castling, using the fast make/unmake pattern.

function generateLegalMoves(state) {
    const legalMoves = [];
    const pseudoLegalMoves = [];
    const { turn, castlingRights, kingPos } = state;
    const opponentColor = turn === 'w' ? 'b' : 'w';
    const kingPosition = kingPos[turn];

    // --- Step 1: Generate all pseudo-legal moves for pieces ---
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = state.board[r][c];
            if (p && (p.toUpperCase() === p) === (turn === 'w')) {
                generateMovesForPiece(pseudoLegalMoves, p, r, c, state);
            }
        }
    }

    // --- Step 2: Generate pseudo-legal castling moves ---
    // We generate these separately because their legality check is special.
    if (kingPosition && !isSquareAttacked(state.board, kingPosition.r, kingPosition.c, opponentColor)) {
        const r = turn === 'w' ? 7 : 0;
        
        // Kingside Castling
        const kingSideMask = turn === 'w' ? 8 : 2;
        if ((castlingRights & kingSideMask) && !state.board[r][5] && !state.board[r][6] &&
            !isSquareAttacked(state.board, r, 5, opponentColor)) {
            pseudoLegalMoves.push({ from: [r, 4], to: [r, 6], piece: turn === 'w' ? 'K' : 'k', isCastle: true });
        }
        
        // Queenside Castling
        const queenSideMask = turn === 'w' ? 4 : 1;
        if ((castlingRights & queenSideMask) && !state.board[r][1] && !state.board[r][2] && !state.board[r][3] &&
            !isSquareAttacked(state.board, r, 3, opponentColor)) {
            pseudoLegalMoves.push({ from: [r, 4], to: [r, 2], piece: turn === 'w' ? 'K' : 'k', isCastle: true });
        }
    }

    // --- Step 3: Filter for full legality using the fast make/unmake pattern ---
    // This is the core of the optimization. No more slow board copies.
    for (const move of pseudoLegalMoves) {
        const unmakeInfo = makeMove(state, move);
        
        // After making the move, the turn has flipped. We check if the king of the
        // player who JUST moved (the "original" player) is now under attack.
        const kingOfOriginalPlayer = kingPos[turn];
        
        // The king must exist and not be under attack for the move to be legal.
        if (kingOfOriginalPlayer && !isSquareAttacked(state.board, kingOfOriginalPlayer.r, kingOfOriginalPlayer.c, state.turn)) {
            legalMoves.push(move);
        }
        
        unmakeMove(state, unmakeInfo);
    }
    
    return legalMoves;
}



// ====================================================================================
//            FINAL, HIGH-PERFORMANCE PSEUDO-LEGAL MOVE GENERATOR
// ====================================================================================
// This function is now extremely fast because it ONLY generates moves.
// It does not check for legality (leaving the king in check).

function generatePseudoLegalMoves(state) {
    const pseudoLegalMoves = [];
    const { turn, castlingRights, kingPos } = state;
    const opponentColor = turn === 'w' ? 'b' : 'w';

    // --- Step 1: Generate all piece moves ---
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = state.board[r][c];
            if (p && (p.toUpperCase() === p) === (turn === 'w')) {
                generateMovesForPiece(pseudoLegalMoves, p, r, c, state);
            }
        }
    }

    // --- Step 2: Generate castling moves ---
    const kingPosition = kingPos[turn];
    if (kingPosition && !isSquareAttacked(state.board, kingPosition.r, kingPosition.c, opponentColor)) {
        const r = turn === 'w' ? 7 : 0;
        // Kingside
        const kingSideMask = turn === 'w' ? 8 : 2;
        if ((castlingRights & kingSideMask) && !state.board[r][5] && !state.board[r][6] && !isSquareAttacked(state.board, r, 5, opponentColor)) {
            pseudoLegalMoves.push({ from: [r, 4], to: [r, 6], piece: turn === 'w' ? 'K' : 'k', isCastle: true });
        }
        // Queenside
        const queenSideMask = turn === 'w' ? 4 : 1;
        if ((castlingRights & queenSideMask) && !state.board[r][1] && !state.board[r][2] && !state.board[r][3] && !isSquareAttacked(state.board, r, 3, opponentColor)) {
            pseudoLegalMoves.push({ from: [r, 4], to: [r, 2], piece: turn === 'w' ? 'K' : 'k', isCastle: true });
        }
    }
    
    return pseudoLegalMoves;
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

// In helpers.js, replace your createGameState function

function createGameState(fen) {
    initializeZobristKeys();
    const [pieces, turn, castling, enPassant, half, full] = fen.split(' ');
    const board = Array(8).fill(null).map(() => Array(8).fill(''));
    
    // --- NEW: Initialize Piece Lists and Map ---
    const pieceLists = { P: [], N: [], B: [], R: [], Q: [], K: [], p: [], n: [], b: [], r: [], q: [], k: [] };
    const pieceMap = Array(64).fill(null); // A flat map for fast piece lookup by square index

    pieces.split('/').forEach((row, r) => {
        let c = 0;
        for (const char of row) {
            if (isNaN(parseInt(char))) { 
                board[r][c] = char;
                const squareIndex = r * 8 + c;
                pieceLists[char].push(squareIndex);
                pieceMap[squareIndex] = char;
                c++;
            }
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
        moveCount: ((parseInt(full) || 1) - 1) * 2 + (turn === 'b' ? 1 : 0),
        // --- ADD THE NEW PROPERTIES ---
        pieceLists: pieceLists,
        pieceMap: pieceMap
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
//   VERSION 1: IMMUTABLE FUNCTION FOR TOOLS (LIKE PGN CONVERTER) - NOW FIXED
// =================================================================================
// This version is safe for tools. It creates and returns a completely new,
// valid state object, including updated piece lists.

function makeMoveImmutable(state, move) {
    // --- Create deep copies to maintain immutability ---
    const newState = {
        ...state,
        board: state.board.map(row => row.slice()),
        pieceLists: JSON.parse(JSON.stringify(state.pieceLists)),
        pieceMap: [...state.pieceMap],
        kingPos: JSON.parse(JSON.stringify(state.kingPos))
    };

    // --- Perform the move on the NEW state object ---
    // We can simply call the mutable makeMove on our new state copy,
    // as it already contains all the correct logic.
    makeMove(newState, move);

    // The PGN converter doesn't need the unmake info, just the resulting state.
    // We also rename it to avoid conflicts in the calling scope.
    return { newState: newState };
}


// =================================================================================
//   VERSION 2: HIGH-PERFORMANCE MUTABLE FUNCTIONS FOR THE SEARCH ENGINE - NOW ROBUST
// =================================================================================
// This pair of functions modifies the state directly and then reverts it.
// This is thousands of times faster and is essential for the search.

function makeMove(state, move) {
    // --- Helper functions for updating piece lists ---
    const movePiece = (piece, from, to) => {
        state.pieceMap[from] = null;
        state.pieceMap[to] = piece;
        const list = state.pieceLists[piece];
        const index = list.indexOf(from);
        if (index > -1) list.splice(index, 1);
        list.push(to);
    };
    const removePiece = (piece, at) => {
        state.pieceMap[at] = null;
        const list = state.pieceLists[piece];
        const index = list.indexOf(at);
        if (index > -1) list.splice(index, 1);
    };
    const addPiece = (piece, at) => {
        state.pieceMap[at] = piece;
        state.pieceLists[piece].push(at);
    };

    if (move.isNullMove) {
        const unmakeInfo = {
            isNullMove: true, oldEnPassantTarget: state.enPassantTarget,
            oldMoveCount: state.moveCount, zobristHash: state.zobristHash
        };
        state.turn = state.turn === 'w' ? 'b' : 'w';
        state.enPassantTarget = null;
        state.moveCount++;
        state.zobristHash = calculateZobristHash(state);
        return unmakeInfo;
    }

    const unmakeInfo = {
        from: move.from, to: move.to, captured: state.board[move.to[0]][move.to[1]] || null, promotion: move.promotion || null,
        isEnPassant: move.isEnPassant || false, isCastle: move.isCastle || false,
        oldCastlingRights: state.castlingRights, oldEnPassantTarget: state.enPassantTarget, oldMoveCount: state.moveCount,
        zobristHash: state.zobristHash
    };

    const [fromR, fromC] = move.from;
    const [toR, toC] = move.to;
    const fromIdx = fromR * 8 + fromC;
    const toIdx = toR * 8 + toC;
    const piece = state.board[fromR][fromC];

    state.board[fromR][fromC] = null;
    if (unmakeInfo.captured) {
        removePiece(unmakeInfo.captured, toIdx);
    }
    state.board[toR][toC] = piece;
    movePiece(piece, fromIdx, toIdx);

    if (move.isEnPassant) {
        const capturedPawnR = state.turn === 'w' ? toR + 1 : toR - 1;
        unmakeInfo.captured = state.board[capturedPawnR][toC];
        state.board[capturedPawnR][toC] = null;
        removePiece(unmakeInfo.captured, capturedPawnR * 8 + toC);
    } else if (move.isCastle) {
        const rookFromC = toC === 6 ? 7 : 0;
        const rookToC = toC === 6 ? 5 : 3;
        const rook = state.board[fromR][rookFromC];
        state.board[fromR][rookFromC] = null;
        state.board[fromR][rookToC] = rook;
        movePiece(rook, fromR * 8 + rookFromC, fromR * 8 + rookToC);
    } else if (move.promotion) {
        const promotedPiece = move.promotion;
        state.board[toR][toC] = promotedPiece;
        removePiece(piece, toIdx);
        addPiece(promotedPiece, toIdx);
    }
    
    if (piece.toLowerCase() === 'k') { state.kingPos[state.turn] = { r: toR, c: toC }; }
    
    state.enPassantTarget = move.isPawnDoubleMove ? [(fromR + toR) / 2, fromC] : null;
    state.castlingRights &= castlingUpdateMask[fromIdx];
    state.castlingRights &= castlingUpdateMask[toIdx];
    state.turn = state.turn === 'w' ? 'b' : 'w';
    state.moveCount++;
    state.zobristHash = calculateZobristHash(state);
    return unmakeInfo;
}

function unmakeMove(state, unmakeInfo) {
    const addPiece = (piece, at) => {
        state.pieceMap[at] = piece;
        state.pieceLists[piece].push(at);
    };
    const movePiece = (piece, from, to) => {
        state.pieceMap[from] = null;
        state.pieceMap[to] = piece;
        const list = state.pieceLists[piece];
        const index = list.indexOf(from);
        if (index > -1) list.splice(index, 1);
        list.push(to);
    };
     const removePiece = (piece, at) => {
        state.pieceMap[at] = null;
        const list = state.pieceLists[piece];
        const index = list.indexOf(at);
        if (index > -1) list.splice(index, 1);
    };
    
    if (unmakeInfo.isNullMove) {
        state.turn = state.turn === 'w' ? 'b' : 'w';
        state.enPassantTarget = unmakeInfo.oldEnPassantTarget;
        state.moveCount = unmakeInfo.oldMoveCount;
        state.zobristHash = unmakeInfo.zobristHash;
        return;
    }

    const originalTurn = state.turn === 'w' ? 'b' : 'w';
    state.turn = originalTurn;
    state.moveCount = unmakeInfo.oldMoveCount;
    state.castlingRights = unmakeInfo.oldCastlingRights;
    state.enPassantTarget = unmakeInfo.oldEnPassantTarget;
    
    const [fromR, fromC] = unmakeInfo.from;
    const [toR, toC] = unmakeInfo.to;
    const fromIdx = fromR * 8 + fromC;
    const toIdx = toR * 8 + toC;
    
    let piece = state.board[toR][toC];
    if (unmakeInfo.promotion) {
        removePiece(piece, toIdx);
        piece = originalTurn === 'w' ? 'P' : 'p';
        addPiece(piece, fromIdx);
    }
    
    state.board[fromR][fromC] = piece;
    state.board[toR][toC] = unmakeInfo.captured;
    if(!unmakeInfo.promotion) movePiece(piece, toIdx, fromIdx);
    if (unmakeInfo.captured) {
        addPiece(unmakeInfo.captured, toIdx);
    }

    if (unmakeInfo.isEnPassant) {
        const capturedPawnR = originalTurn === 'w' ? toR + 1 : toR - 1;
        state.board[capturedPawnR][toC] = unmakeInfo.captured;
        state.board[toR][toC] = null; // En passant square becomes empty
        removePiece(unmakeInfo.captured, toIdx); // Remove from captured square's list
        addPiece(unmakeInfo.captured, capturedPawnR * 8 + toC); // Add it back
    } else if (unmakeInfo.isCastle) {
        const rookFromC = toC === 6 ? 7 : 0;
        const rookToC = toC === 6 ? 5 : 3;
        const rook = state.board[fromR][rookToC];
        state.board[fromR][rookToC] = null;
        state.board[fromR][rookFromC] = rook;
        movePiece(rook, fromR * 8 + rookToC, fromR * 8 + rookFromC);
    }
    
    if (piece.toLowerCase() === 'k') { state.kingPos[originalTurn] = { r: fromR, c: fromC }; }
    
    state.zobristHash = unmakeInfo.zobristHash;
}


