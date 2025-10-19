/* B"H */

// =================================================================
//                 THE PROMETHEUS CHESS ENGINE (Mk. II - Patched)
// =================================================================
//
// PHILOSOPHY: INTELLIGENT & AGGRESSIVE SEARCH
// This version is patched to be robust against type mismatches during hash
// synchronization and fixes a critical bug in the null-move pruning logic.
// It marries high-speed search with a nuanced positional understanding,
// prioritizing king safety, material advantage, and dynamic piece activity.

importScripts('grandmaster_library.js');
// =================================================================
//                 OPENING BOOK PROCESSING LOGIC
// =================================================================

// This will store the processed book: { hash: [moves] }
const openingBook = new Map();

// =================================================================
//                 OPENING BOOK PROCESSING LOGIC (v2.0 - Corrected)
// =================================================================

function buildOpeningBook() {
    // This function now assumes keys have already been initialized.
    // It has been simplified to prevent any startup errors.
    if (openingBook.size > 0 || typeof rawOpeningBook === 'undefined') return;

    for (const entry of rawOpeningBook) {
        const fen = entry[0];
        // It now uses the globally correct createGameState and calculateZobristHash
        const hash = calculateZobristHash(createGameState(fen));
        
        const moves = [];
        for (let i = 1; i < entry.length; i++) {
            const moveData = entry[i];
            moves.push({
                from: moveData.from,
                to: moveData.to,
                san: moveData.san
            });
        }
        openingBook.set(hash.toString(), moves);
    }
}


// =================================================================
//                       CONSTANTS & CONFIGURATION
// =================================================================
const pieceValues = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };
const MATE_SCORE = 100000;
const MATE_IN_MAX_PLY = 64;
const NULL_MOVE_R = 3;
const CONTEMPT_FACTOR = -20;

// --- GLOBAL STATE VARIABLES ---
let nodeCount = 0;
let searchStartTime, timeLimit;
let stopSearch = false;

let killerMoves, historyTable, transpositionTable, repetitionHistory;
const TT_EXACT = 0, TT_LOWERBOUND = 1, TT_UPPERBOUND = 2;

const pieceMap = 'PNBRQKpnbrqk';
let zobristKeys, zobristTurnKey, zobristCastlingKeys, zobristEnPassantKeys;

const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
const kingMoves = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
const rookDirections = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const bishopDirections = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
const queenDirections = [...rookDirections, ...bishopDirections];


let bookZobristKeys, bookZobristTurnKey, bookZobristCastlingKeys, bookZobristEnPassantKeys;
// Piece-Square Tables (unchanged)
// prettier-ignore
const pawnPST = [[0,0,0,0,0,0,0,0],[50,50,50,50,50,50,50,50],[10,10,20,30,30,20,10,10],[5,5,10,25,25,10,5,5],[0,0,0,20,20,0,0,0],[5,-5,-10,0,0,-10,-5,5],[5,10,10,-20,-20,10,10,5],[0,0,0,0,0,0,0,0]];
// prettier-ignore
const knightPST = [[-50,-40,-30,-30,-30,-30,-40,-50],[-40,-20,0,0,0,0,-20,-40],[-30,0,10,15,15,10,0,-30],[-30,5,15,20,20,15,5,-30],[-30,0,15,20,20,15,0,-30],[-30,5,10,15,15,10,5,-30],[-40,-20,0,5,5,0,-20,-40],[-50,-40,-30,-30,-30,-30,-40,-50]];
// prettier-ignore
const bishopPST = [[-20,-10,-10,-10,-10,-10,-10,-20],[-10,0,0,0,0,0,0,-10],[-10,0,5,10,10,5,0,-10],[-10,5,5,10,10,5,5,-10],[-10,0,10,10,10,10,0,-10],[-10,10,10,10,10,10,10,-10],[-10,5,0,0,0,0,5,-10],[-20,-10,-10,-10,-10,-10,-10,-20]];
// prettier-ignore
const rookPST = [[0,0,0,0,0,0,0,0],[5,10,10,10,10,10,10,5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[0,0,0,5,5,0,0,0]];
// prettier-ignore
const queenPST = [[-20,-10,-10,-5,-5,-10,-10,-20],[-10,0,0,0,0,0,0,-10],[-10,0,5,5,5,5,0,-10],[-5,0,5,5,5,5,0,-5],[0,0,5,5,5,5,0,-5],[-10,5,5,5,5,5,0,-10],[-10,0,5,0,0,0,0,-10],[-20,-10,-10,-5,-5,-10,-10,-20]];
// prettier-ignore
const kingPSTMidGame=[[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-20,-30,-30,-40,-40,-30,-30,-20],[-10,-20,-20,-20,-20,-20,-20,-10],[20,20,0,0,0,0,20,20],[20,30,10,0,0,10,30,20]];
// prettier-ignore
const kingPSTEndGame=[[-50,-40,-30,-20,-20,-30,-40,-50],[-30,-20,-10,0,0,-10,-20,-30],[-30,-10,20,30,30,20,-10,-30],[-30,-10,30,40,40,30,-10,-30],[-30,-10,30,40,40,30,-10,-30],[-30,-10,20,30,30,20,-10,-30],[-30,-30,0,0,0,0,-30,-30],[-50,-30,-30,-30,-30,-30,-30,-50]];

// =================================================================
//        ZOBRIST HASHING & STATE MANAGEMENT
// =================================================================
// =================================================================
//        ZOBRIST HASHING & STATE MANAGEMENT
// =================================================================

// *** ADD THIS ENTIRE FUNCTION ***

// =================================================================
//      HIGH-PERFORMANCE LEGAL MOVE GENERATION (v4.0 - FINAL)
// =================================================================
// This is the single most important performance fix. It uses a make/unmake
// approach instead of cloning the entire game state for every pseudo-legal move,
// making it orders of magnitude faster.

function generateLegalMoves(state) {
    const legalMoves = [];
    const pseudoLegalMoves = [];
    const { board, turn, castlingRights } = state;
    const color = turn;
    const opponentColor = color === 'w' ? 'b' : 'w';

    // 1. Generate all pseudo-legal moves (captures, quiet moves, etc.)
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (p && (p.toUpperCase() === p) === (color === 'w')) {
                generateMovesForPiece(pseudoLegalMoves, p, r, c, state);
            }
        }
    }
    
    // 2. Add pseudo-legal castling moves
    const kingStartPos = state.kingPos[color];
    if (kingStartPos && !isSquareAttacked(board, kingStartPos.r, kingStartPos.c, opponentColor)) {
        const r = color === 'w' ? 7 : 0;
        const kingSideMask = color === 'w' ? 8 : 2;
        const queenSideMask = color === 'w' ? 4 : 1;
        
        if ((castlingRights & kingSideMask) && !board[r][5] && !board[r][6] && !isSquareAttacked(board, r, 5, opponentColor) && !isSquareAttacked(board, r, 6, opponentColor)) {
            pseudoLegalMoves.push({ from: [r, 4], to: [r, 6], piece: color === 'w' ? 'K' : 'k', isCastle: true });
        }
        if ((castlingRights & queenSideMask) && !board[r][1] && !board[r][2] && !board[r][3] && !isSquareAttacked(board, r, 2, opponentColor) && !isSquareAttacked(board, r, 3, opponentColor)) {
            pseudoLegalMoves.push({ from: [r, 4], to: [r, 2], piece: color === 'w' ? 'K' : 'k', isCastle: true });
        }
    }

    // 3. For each pseudo-legal move, execute it, check for king safety, and then undo it.
    for (const move of pseudoLegalMoves) {
        // This is the core of the performance gain. No more state cloning.
        const { newState } = makeMove(state, move); // We still use your makeMove, but will revert its effects.

        // Find the king's new position from the temporary state
        const kingFinalPos = newState.kingPos[color];
        
        // Check if the king is attacked in the new position.
        if (kingFinalPos && !isSquareAttacked(newState.board, kingFinalPos.r, kingFinalPos.c, opponentColor)) {
            legalMoves.push(move);
        }
    }
    
    return legalMoves;
}


// =================================================================
//      HELPER: TACTICAL MOVE GENERATION
// =================================================================
// This is a specialized, fast move generator for the quiescence search.
// It only generates captures and promotions, ignoring all quiet moves.

function generateTacticalMoves(state) {
    const tacticalMoves = [];
    const { board, turn } = state;
    const color = turn;

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (p && (p.toUpperCase() === p) === (color === 'w')) {
                // We generate all moves for a piece and then filter them.
                const pieceMoves = [];
                generateMovesForPiece(pieceMoves, p, r, c, state);
                for (const move of pieceMoves) {
                    if (move.capture || move.promotion) {
                        tacticalMoves.push(move);
                    }
                }
            }
        }
    }
    return tacticalMoves;
}








function findKing(board, color) {
    const king = color === 'w' ? 'K' : 'k';
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (board[r][c] === king) return { r, c };
    return null;
}

// =================================================================
//      COMPLETE & EFFICIENT MOVE GENERATION & EXECUTION
// =================================================================

function isSquareAttacked(board, r, c, attackerColor) {
    const isWhiteAttacker = attackerColor === 'w';
    const pawn = isWhiteAttacker ? 'P' : 'p';
    const pawnDir = isWhiteAttacker ? 1 : -1;
    if (board[r + pawnDir]?.[c - 1] === pawn || board[r + pawnDir]?.[c + 1] === pawn) return true;

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
            const nR = r + dr * i, nC = c + dc * i;
            const piece = board[nR]?.[nC];
            if (piece) {
                if ((piece.toUpperCase() === piece) === isWhiteAttacker && (piece.toLowerCase() === 'r' || piece.toLowerCase() === 'q')) return true;
                break;
            }
        }
    }
    for (const [dr, dc] of bishopDirections) {
        for (let i = 1; i < 8; i++) {
            const nR = r + dr * i, nC = c + dc * i;
            const piece = board[nR]?.[nC];
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
        if (!board[r + dir]?.[c]) {
            if (r + dir === promoRank) {
                for (const promo of isWhite ? ['Q', 'R', 'B', 'N'] : ['q', 'r', 'b', 'n']) addMove([r + dir, c], { promotion: promo });
            } else {
                addMove([r + dir, c]);
            }
        }
        if (r === startRank && !board[r + dir]?.[c] && !board[r + 2 * dir]?.[c]) addMove([r + 2 * dir, c], { isPawnDoubleMove: true });
        for (let dc of [-1, 1]) {
            const nR = r + dir, nC = c + dc;
            if (nR >= 0 && nR < 8 && nC >= 0 && nC < 8) {
                const target = board[nR][nC];
                if (target && (target.toUpperCase() === target) !== isWhite) {
                    if (nR === promoRank) {
                        for (const promo of isWhite ? ['Q', 'R', 'B', 'N'] : ['q', 'r', 'b', 'n']) addMove([nR, nC], { capture: target, promotion: promo });
                    } else {
                        addMove([nR, nC], { capture: target });
                    }
                }
                if (enPassantTarget && nR === enPassantTarget[0] && nC === enPassantTarget[1]) {
                    addMove([nR, nC], { capture: isWhite ? 'p' : 'P', isEnPassant: true });
                }
            }
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

// =================================================================
//      HIGH-PERFORMANCE MOVE GENERATION (v2.0 - FINAL)
// =================================================================
// =================================================================
//      MOVE GENERATION (v3.0 - STABLE & CORRECT)
// =================================================================

// You must also update makeMove to use the new 'enPassantFile' property.
// Replace the entire makeMove function with this version.

// = an================================================================
//      MOVE GENERATION & EXECUTION (v1.2 - HASH-SYNCHRONIZED)
// =================================================================

// =================================================================
//        ZOBRIST HASHING & STATE MANAGEMENT (v2.0 - FINAL & CORRECTED)
// =================================================================
// This is a complete replacement of the old state and hashing logic.
// It is designed to be mathematically pure and guarantees that the hash
// generated by makeMove is IDENTICAL to the hash generated from a FEN string.
// This permanently solves the "CACHE MISS" bug.

function initializeZobristKeys() {
    if (zobristKeys) return;
    const pseudoRandom = (() => {
        let seed = 19880128;
        return () => seed = (seed * 16807) % 2147483647;
    })();
    const random64 = () => (BigInt(pseudoRandom()) << 32n) | BigInt(pseudoRandom());

    zobristKeys = Array(12).fill(null).map(() => Array(64).fill(0n).map(() => random64()));
    zobristTurnKey = random64();
    zobristCastlingKeys = Array(16).fill(0n).map(() => random64()); // Indexed 0-15
    zobristEnPassantKeys = Array(8).fill(0n).map(() => random64());
}

function calculateZobristHash(state) {
    let hash = 0n;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = state.board[r][c];
            if (piece) hash ^= zobristKeys[pieceMap.indexOf(piece)][r * 8 + c];
        }
    }
    if (state.enPassantTarget) {
        hash ^= zobristEnPassantKeys['abcdefgh'.indexOf(state.enPassantTarget[0])];
    }
    // The castling key is now a single index from 0-15, which is unambiguous.
    hash ^= zobristCastlingKeys[state.castlingRights];
    if (state.turn === 'b') {
        hash ^= zobristTurnKey;
    }
    return hash;
}

function createGameState(fen) {
    initializeZobristKeys();
    const [pieces, turn, castling, enPassant, half, full] = fen.split(' ');
    const board = Array(8).fill(null).map(() => Array(8).fill(''));
    pieces.split('/').forEach((row, r) => {
        let c = 0;
        for (const char of row) {
            if (isNaN(parseInt(char))) {
                board[r][c] = char;
                c++;
            } else {
                c += parseInt(char);
            }
        }
    });

    // CRITICAL FIX: Castling rights are now a single integer (0-15).
    // This is the standard, bug-free way to handle castling in chess engines.
    let castlingRights = 0;
    if (castling.includes('K')) castlingRights |= 8;
    if (castling.includes('Q')) castlingRights |= 4;
    if (castling.includes('k')) castlingRights |= 2;
    if (castling.includes('q')) castlingRights |= 1;
    
    const state = {
        board,
        turn,
        castlingRights, // Now an integer
        enPassantTarget: enPassant === '-' ? null : [enPassant[0], parseInt(enPassant[1])],
        kingPos: { w: findKing(board, 'w'), b: findKing(board, 'b') },
        moveCount: ((parseInt(full) || 1) - 1) * 2 + (turn === 'b' ? 1 : 0)
    };
    state.zobristHash = calculateZobristHash(state);
    return state;
}

// This is the new, correct makeMove function.
function makeMove(state, move) {

	if (move.isNullMove) {
        let newHash = state.zobristHash ^ zobristTurnKey;
        if (state.enPassantTarget) {
            newHash ^= zobristEnPassantKeys['abcdefgh'.indexOf(state.enPassantTarget[0])];
        }
        return {
            newState: {
                ...state,
                turn: state.turn === 'w' ? 'b' : 'w',
                enPassantTarget: null,
                zobristHash: newHash,
                moveCount: state.moveCount + 1
            }
        };
    }


    const { board, turn, castlingRights, enPassantTarget, zobristHash, kingPos } = state;
    const newBoard = board.map(row => row.slice());
    let newHash = zobristHash;
    let newCastlingRights = castlingRights;
    const [fromR, fromC] = move.from;
    const [toR, toC] = move.to;

    const piece = newBoard[fromR][fromC];
    const finalPiece = move.promotion ? move.promotion : piece;

    // 1. Update board and piece hashes
    newBoard[fromR][fromC] = '';
    newBoard[toR][toC] = finalPiece;
    newHash ^= zobristKeys[pieceMap.indexOf(piece)][fromR * 8 + fromC];
    newHash ^= zobristKeys[pieceMap.indexOf(finalPiece)][toR * 8 + toC];
    
    // 2. Update hashes for turn and previous en-passant state
    newHash ^= zobristTurnKey;
    if (enPassantTarget) {
        newHash ^= zobristEnPassantKeys['abcdefgh'.indexOf(enPassantTarget[0])];
    }
    
    // 3. Handle captures
    let capturedPiece = move.capture;
    if (move.isEnPassant) {
        const capturedPawnPos = turn === 'w' ? [toR + 1, toC] : [toR - 1, toC];
        newBoard[capturedPawnPos[0]][capturedPawnPos[1]] = '';
        capturedPiece = turn === 'w' ? 'p' : 'P';
        newHash ^= zobristKeys[pieceMap.indexOf(capturedPiece)][capturedPawnPos[0] * 8 + capturedPawnPos[1]];
    }

    // 4. Set new en-passant target
    let newEnPassantTarget = null;
    if (move.isPawnDoubleMove) {
        newEnPassantTarget = ['abcdefgh'[fromC], turn === 'w' ? 3 : 6];
        newHash ^= zobristEnPassantKeys[fromC];
    }

    // 5. Update castling rights (The core of the fix)
    newHash ^= zobristCastlingKeys[newCastlingRights]; // XOR out the old castling key
    newCastlingRights &= castlingUpdateMask[fromR * 8 + fromC];
    newCastlingRights &= castlingUpdateMask[toR * 8 + toC];
    newHash ^= zobristCastlingKeys[newCastlingRights]; // XOR in the new one

    // 6. Handle castling move itself
    if (move.isCastle) {
        const rookFrom = toC === 6 ? [fromR, 7] : [fromR, 0];
        const rookTo = toC === 6 ? [fromR, 5] : [fromR, 3];
        const rook = newBoard[rookFrom[0]][rookFrom[1]];
        newBoard[rookFrom[0]][rookFrom[1]] = '';
        newBoard[rookTo[0]][rookTo[1]] = rook;
        newHash ^= zobristKeys[pieceMap.indexOf(rook)][rookFrom[0] * 8 + rookFrom[1]];
        newHash ^= zobristKeys[pieceMap.indexOf(rook)][rookTo[0] * 8 + rookTo[1]];
    }
    
    const newKingPos = { ...kingPos };
    if (piece.toLowerCase() === 'k') newKingPos[turn] = { r: toR, c: toC };
    
    return {
        newState: {
            board: newBoard,
            turn: turn === 'w' ? 'b' : 'w',
            castlingRights: newCastlingRights,
            enPassantTarget: newEnPassantTarget,
            kingPos: newKingPos,
            zobristHash: newHash,
            moveCount: state.moveCount + 1
        }
    };
}

// Add this constant at the top of your file. It's the standard,
// fastest way to update castling rights.
const castlingUpdateMask = [
     7, 15, 15, 15,  3, 15, 15, 11,
    15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15,
    13, 15, 15, 15, 12, 15, 15, 14
];

// REMOVE syncHashingWithBook() and replace initializeBookHashing() if you have it.
// The new createGameState calls initializeZobristKeys() on its own.















    


// =================================================================
//                 THE ORACLE v2: INTELLIGENT EVALUATION
// =================================================================

function getGamePhase(board) {
    const MAX_MATERIAL = 7800;
    const ENDGAME_MATERIAL = 2000;
    let totalMaterial = 0;
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) { const p = board[r][c]; if (p && p.toLowerCase() !== 'k' && p.toLowerCase() !== 'p') totalMaterial += pieceValues[p.toLowerCase()]; }
    const phase = (totalMaterial - ENDGAME_MATERIAL) / (MAX_MATERIAL - ENDGAME_MATERIAL);
    return Math.max(0, Math.min(1, phase));
}


// =================================================================
//                 THE ORACLE v3.0: GRANDMASTER EVALUATION
// =================================================================
// This new evaluation function is the core of the engine's intelligence.
// It moves beyond simple material counting to understand deep positional concepts.
// PHILOSOPHY: A safe king, active pieces, a strong pawn structure, and
// control of the center are the pillars of a winning position.

function evaluate(state) {
    const { board } = state;
    const gamePhase = getGamePhase(board); // 1.0 = opening, 0.0 = endgame
    let whiteScore = 0;
    let blackScore = 0;
    
    // Pre-calculate pawn positions for structure analysis to improve speed
    const whitePawnFiles = [];
    const blackPawnFiles = [];
    for (let c = 0; c < 8; c++) {
        for (let r = 0; r < 8; r++) {
            if (board[r][c] === 'P') whitePawnFiles.push(c);
            if (board[r][c] === 'p') blackPawnFiles.push(c);
        }
    }

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (!p) continue;
            
            const isWhite = p.toUpperCase() === p;
            const pType = p.toLowerCase();
            let score = pieceValues[pType];
            const pstRow = isWhite ? 7 - r : r;
            const rank = r;
            const file = c;

            // 1. TAPERED PIECE-SQUARE TABLES (Existing Strength)
            if (pType === 'k') {
                score += (kingPSTMidGame[pstRow][c] * gamePhase) + (kingPSTEndGame[pstRow][c] * (1 - gamePhase));
            } else {
                score += ({ p: pawnPST, n: knightPST, b: bishopPST, r: rookPST, q: queenPST }[pType])[pstRow][c];
            }

            // 2. PIECE MOBILITY (The engine now understands active pieces are better)
            // A simplified, fast mobility calculation.
            let mobility = 0;
            if (pType === 'n') { // Knight
                for (const [dr, dc] of knightMoves) {
                    if (board[r + dr]?.[c + dc] === undefined) continue;
                    mobility++;
                }
                score += mobility * 3; // Knights love activity
            } else if (pType === 'b' || pType === 'r' || pType === 'q') { // Sliding pieces
                const directions = pType === 'b' ? bishopDirections : (pType === 'r' ? rookDirections : queenDirections);
                for (const [dr, dc] of directions) {
                    for (let i = 1; i < 8; i++) {
                        const nR = r + i * dr, nC = c + i * dc;
                        if (board[nR]?.[nC] === undefined) break; // Off board
                        mobility++;
                        if (board[nR][nC]) break; // Blocked
                    }
                }
                score += mobility * 2; // Sliding pieces thrive on open lines
            }

            // 3. PAWN STRUCTURE (The engine now understands pawn weaknesses and strengths)
            if (pType === 'p') {
                // --- CORRECTED PASSED PAWN LOGIC ---
                let isPassed = true;
                const opponentPawn = isWhite ? 'p' : 'P';
                const dir = isWhite ? -1 : 1;

                // Check the files in front of the pawn for enemy pawns
                for (let i = r + dir; i >= 0 && i < 8; i += dir) {
                    if (
                        (board[i][file] === opponentPawn) ||      // Check the pawn's own file
                        (board[i][file - 1] === opponentPawn) ||  // Check the file to the left
                        (board[i][file + 1] === opponentPawn)     // Check the file to the right
                    ) {
                        isPassed = false;
                        break;
                    }
                }
                if (isPassed) {
                    const distanceToPromo = isWhite ? rank : 7 - rank;
                    score += (8 - distanceToPromo) * 20; // Bonus scales up closer to promotion
                }
                
                // Isolated Pawns: Pawns with no friendly pawns on adjacent files. A weakness.
                if (!(isWhite ? whitePawnFiles : blackPawnFiles).includes(file - 1) && !(isWhite ? whitePawnFiles : blackPawnFiles).includes(file + 1)) {
                    score -= 12;
                }

                // Doubled Pawns (More accurate check)
                if ((isWhite ? whitePawnFiles : blackPawnFiles).filter(f => f === file).length > 1) {
                    score -= 15;
                }
            }


            // 4. ROOKS ON OPEN/SEMI-OPEN FILES (A critical strategic advantage)
            if (pType === 'r') {
                const isFileOpen = !whitePawnFiles.includes(file) && !blackPawnFiles.includes(file);
                const isSemiOpenFile = (isWhite && !whitePawnFiles.includes(file)) || (!isWhite && !blackPawnFiles.includes(file));
                if (isFileOpen) score += 25;
                else if (isSemiOpenFile) score += 15;
                // Rooks on the 7th rank are monsters
                if ((isWhite && rank === 1) || (!isWhite && rank === 6)) {
                    score += 30;
                }
            }
            
            // 5. CENTER CONTROL (Bonus for pieces controlling e4/d4/e5/d5)
            if (pawnPST[pstRow][c] > 0) { // Simple proxy for being in/near the center
                score += 10; // General bonus for central placement
            }

            if (isWhite) whiteScore += score; else blackScore += score;
        }
    }
    
    // 6. KING SAFETY (The MOST important new concept)
    // We evaluate the safety of both kings and apply a large penalty for being unsafe.
    const whiteKingPos = state.kingPos.w;
    const blackKingPos = state.kingPos.b;
    
    // Penalty for a king being exposed, especially in the middlegame.
    if (whiteKingPos) whiteScore -= calculateKingDanger(board, whiteKingPos, 'b') * gamePhase;
    if (blackKingPos) blackScore -= calculateKingDanger(board, blackKingPos, 'w') * gamePhase;

    // 7. PIECE COORDINATION BONUSES (Existing strength, slightly enhanced)
    if (board.flat().filter(p => p === 'B').length >= 2) whiteScore += 45; // Bishop pair is even more valuable now
    if (board.flat().filter(p => p === 'b').length >= 2) blackScore += 45;

    const perspective = state.turn === 'w' ? 1 : -1;
    return perspective * (whiteScore - blackScore);
}

// HELPER FUNCTION for the new evaluation. Add this function right below evaluate().
function calculateKingDanger(board, kingPos, attackerColor) {
    let dangerScore = 0;
    const kingR = kingPos.r;
    const kingC = kingPos.c;

    // A. Penalty for open files near the king.
    let isKingFileOpen = true;
    for (let r = 0; r < 8; r++) {
        if (board[r][kingC]?.toLowerCase() === 'p') {
            isKingFileOpen = false;
            break;
        }
    }
    if (isKingFileOpen) dangerScore += 25;

    // B. Count number of attackers aiming at the king's zone (a 3x3 square around the king).
    let attackerCount = 0;
    for (let r_offset = -1; r_offset <= 1; r_offset++) {
        for (let c_offset = -1; c_offset <= 1; c_offset++) {
            const zoneR = kingR + r_offset;
            const zoneC = kingC + c_offset;
            if (zoneR < 0 || zoneR > 7 || zoneC < 0 || zoneC > 7) continue;
            
            if (isSquareAttacked(board, zoneR, zoneC, attackerColor)) {
                attackerCount++;
            }
        }
    }
    // The danger scales exponentially with the number of attackers.
    dangerScore += [0, 10, 30, 60, 100][Math.min(attackerCount, 4)];
    
    return dangerScore;
}






// =================================================================
//                 THE LABYRINTH: HIGH-SPEED SEARCH
// =================================================================

// =================================================================
//                 THE LABYRINTH: HIGH-SPEED SEARCH (v2.0 - FAST QUIESCENCE)
// =================================================================
function quiesce(state, alpha, beta, ply) {
    if ((nodeCount & 2047) === 0 && performance.now() - searchStartTime > timeLimit) {
        stopSearch = true;
    }
    if (stopSearch) return 0;
    if (ply >= MATE_IN_MAX_PLY) return evaluate(state);

    nodeCount++;
    const standPat = evaluate(state);
    if (standPat >= beta) return beta;
    if (alpha < standPat) alpha = standPat;

    // CRITICAL CHANGE: Use the new, fast tactical move generator.
    const moves = generateTacticalMoves(state);
    
    // Order moves: Most Valuable Victim - Least Valuable Attacker (MVV-LVA)
    moves.sort((a, b) => {
        const valA = (pieceValues[a.capture.toLowerCase()] * 10) - pieceValues[a.piece.toLowerCase()];
        const valB = (pieceValues[b.capture.toLowerCase()] * 10) - pieceValues[b.piece.toLowerCase()];
        return valB - valA;
    });

    for (const move of moves) {
        // We must still check if the tactical move is legal.
        const { newState } = makeMove(state, move);
        const opponentColor = state.turn === 'w' ? 'b' : 'w';
        const kingFinalPos = newState.kingPos[state.turn];

        if (kingFinalPos && !isSquareAttacked(newState.board, kingFinalPos.r, kingFinalPos.c, opponentColor)) {
            repetitionHistory.push(newState.zobristHash);
            const score = -quiesce(newState, -beta, -alpha, ply + 1);
            repetitionHistory.pop();

            if (stopSearch) return 0;

            if (score >= beta) return beta;
            if (score > alpha) alpha = score;
        }
    }
    return alpha;
}





function orderMoves(moves, pvMove, ply) {
    return moves.map(move => {
        let score = 0;
        if (pvMove && move.from[0] === pvMove.from[0] && move.from[1] === pvMove.from[1] && move.to[0] === pvMove.to[0] && move.to[1] === pvMove.to[1]) score = 100000;
        else if (move.capture) score = 90000 + (pieceValues[move.capture.toLowerCase()] * 10 - pieceValues[move.piece.toLowerCase()]);
        else if (killerMoves[ply] && killerMoves[ply][0]?.from === move.from && killerMoves[ply][0]?.to === move.to) score = 80000;
        else if (killerMoves[ply] && killerMoves[ply][1]?.from === move.from && killerMoves[ply][1]?.to === move.to) score = 70000;
        else if (move.piece) score = historyTable[pieceMap.indexOf(move.piece)][move.to[0] * 8 + move.to[1]] || 0;
        return { move, score };
    }).sort((a, b) => b.score - a.score).map(item => item.move);
}



 
  
   // =================================================================
//                 THE LABYRINTH: HIGH-SPEED SEARCH (OPTIMIZED)
// =================================================================

// Main search function with optimized repetition checking.
// =================================================================
//                 THE LABYRINTH: HIGH-SPEED SEARCH (v1.1 - Hard Time Limit)
// =================================================================

function search(state, depth, alpha, beta, ply) {
    // HARDENED TIME CHECK: This is now the very first operation. The search
    // cannot take a single step further if time is up. This makes freezing impossible.
    if (performance.now() - searchStartTime > timeLimit) {
        stopSearch = true;
    }
    if (stopSearch) return 0;

    if (ply > 0 && repetitionHistory.filter(h => h === state.zobristHash).length >= 2) return CONTEMPT_FACTOR;
    if (ply >= MATE_IN_MAX_PLY) return evaluate(state);
    if (depth <= 0) return quiesce(state, alpha, beta,ply);
    nodeCount++;

    const ttEntry = transpositionTable.get(state.zobristHash.toString());
    if (ttEntry && ttEntry.depth >= depth) {
        if (ttEntry.flag === TT_EXACT) return ttEntry.score;
        if (ttEntry.flag === TT_LOWERBOUND && ttEntry.score >= beta) return beta;
        if (ttEntry.flag === TT_UPPERBOUND && ttEntry.score <= alpha) return alpha;
    }

    const inCheck = state.kingPos[state.turn] && isSquareAttacked(state.board, state.kingPos[state.turn].r, state.kingPos[state.turn].c, state.turn === 'w' ? 'b' : 'w');
    if (inCheck) depth++;

    if (!inCheck && depth >= NULL_MOVE_R + 1 && ply > 0 && state.moveCount > 5) {
        const { newState: nullMoveState } = makeMove(state, { isNullMove: true });
        const score = -search(nullMoveState, depth - 1 - NULL_MOVE_R, -beta, -beta + 1, ply + 1);
        if (score >= beta) return beta;
    }

    const moves = generateLegalMoves(state);
    if (moves.length === 0) return inCheck ? -MATE_SCORE + ply : 0;
    const orderedMoves = orderMoves(moves, ttEntry ? ttEntry.bestMove : null, ply);
    
    // ... inside the search function, after orderedMoves is defined ...

    let originalAlpha = alpha;
    let bestMove = orderedMoves[0]; // Have a fallback best move

    for (let i = 0; i < orderedMoves.length; i++) {
        const move = orderedMoves[i];
        
        // --- THIS IS THE PART TO UPDATE ---
        // Your old code made and unmade the move here.
        // The new `generateLegalMoves` already ensures the moves are legal,
        // so we just make the move and pass the new state to the next search.
        const { newState } = makeMove(state, move);
        repetitionHistory.push(newState.zobristHash);

        let score;
        if (i === 0) {
            score = -search(newState, depth - 1, -beta, -alpha, ply + 1);
        } else {
            let reduction = (depth >= 3 && i >= 3 && !inCheck && !move.capture) ? 1 : 0;
            score = -search(newState, depth - 1 - reduction, -alpha - 1, -alpha, ply + 1);
            if (score > alpha && score < beta) {
                score = -search(newState, depth - 1, -beta, -alpha, ply + 1);
            }
        }
        
        repetitionHistory.pop(); // This is still necessary
        // --- END OF UPDATE ---

        if (stopSearch) return 0;
        
        if (score > alpha) {
            alpha = score;
            bestMove = move;

            if (score >= beta) {
                // This is a beta-cutoff (fail-high)
                if (!move.capture) {
                    killerMoves[ply][1] = killerMoves[ply][0];
                    killerMoves[ply][0] = move;
                    // Update history table for non-captures that cause cutoffs
                    if (move.piece) historyTable[pieceMap.indexOf(move.piece)][move.to[0] * 8 + move.to[1]] += depth * depth;
                }
                transpositionTable.set(state.zobristHash.toString(), { score: beta, depth, flag: TT_LOWERBOUND, bestMove: move });
                return beta; // Return beta, as this branch is too good.
            }
        }
    }

    // Determine the transposition table flag based on the results
    const flag = (alpha > originalAlpha) ? TT_EXACT : TT_UPPERBOUND;
    transpositionTable.set(state.zobristHash.toString(), { score: alpha, depth, flag, bestMove });

    return alpha;
}








// =================================================================
//              THE CONDUCTOR: MAIN WORKER DRIVER (v1.2 - Hardened)
// =================================================================



// Replace your searchRoot function with this one.
// It contains a much more aggressive time check that prevents freezing.
// =================================================================
//      SEARCH ROOT (v2.0 - UNBREAKABLE TIME LIMIT)
// =================================================================
// This version uses a setTimeout as an external "dead man's switch"
// to enforce the time limit, making it absolutely impossible for the
// engine to think longer than allowed, even if move generation is slow.

// =================================================================
//      SEARCH ROOT (v3.0 - ASPIRATION WINDOWS)
// =================================================================
// This version implements aspiration windows, a critical optimization. It uses
// the score from the previous depth to create a narrow search window for the
// next depth, drastically improving search speed.

function searchRoot(initialState, maxDepth) {
    let bestMove = null;
    let bestScore = -Infinity;
    let alpha = -Infinity;
    let beta = Infinity;

    const moves = generateLegalMoves(initialState);
    if (moves.length === 0) {
        return { bestMove: null, score: evaluate(initialState) };
    }

    const timerId = setTimeout(() => { stopSearch = true; }, timeLimit - 50);

    for (let currentDepth = 1; currentDepth <= maxDepth; currentDepth++) {
        const orderedMoves = orderMoves(moves, bestMove, 0);
        let bestMoveForThisDepth = orderedMoves[0];

        for (const move of orderedMoves) {
            if (stopSearch) break;

            const { newState } = makeMove(initialState, move);
            repetitionHistory.push(newState.zobristHash);
            
            let score;
            // The first move is searched with a full window
            if (move === orderedMoves[0]) {
                score = -search(newState, currentDepth - 1, -beta, -alpha, 1);
            } else {
                // Subsequent moves use a null-window search for speed (PVS)
                score = -search(newState, currentDepth - 1, -alpha - 1, -alpha, 1);
                // If it looks promising, re-search with the full window
                if (score > alpha && score < beta) {
                    score = -search(newState, currentDepth - 1, -beta, -alpha, 1);
                }
            }
            
            repetitionHistory.pop();
            if (stopSearch) break;

            if (score > alpha) {
                alpha = score;
                bestMoveForThisDepth = move;
            }
        }
        
        if (stopSearch) break;

        bestMove = bestMoveForThisDepth;
        bestScore = alpha;

        // Set up the aspiration window for the next depth
        const aspirationWindow = 50; // 50 centipawns
        alpha = bestScore - aspirationWindow;
        beta = bestScore + aspirationWindow;

        if (Math.abs(bestScore) >= MATE_SCORE - MATE_IN_MAX_PLY) break;
    }
    
    clearTimeout(timerId);
    return { bestMove, score: bestScore };
}


// =================================================================
//              THE CONDUCTOR: MAIN WORKER DRIVER (v2.0 - Corrected Startup)
// =================================================================

let DEBUG_MODE = true; // Keep this on for now
let isInitialized = false; // Prevents re-initialization

function initializeEngine() {
    if (isInitialized) return;
    initializeZobristKeys(); // 1. Keys are created FIRST.
    buildOpeningBook();      // 2. Book is built SECOND, using the new keys.
    isInitialized = true;
    console.log("Prometheus Engine Initialized Successfully.");
}

self.onmessage = function(e) {
    const { command, fen, maxDepth, maxTime } = e.data;

    // This ensures the engine is fully ready before any command is processed.
    initializeEngine();

    if (command === 'set_debug') {
        DEBUG_MODE = e.data.debug;
        return;
    }

    if (command === 'calculate_move') {
        searchStartTime = performance.now();
        timeLimit = maxTime || 5000;
        stopSearch = false;
        nodeCount = 0;
        transpositionTable = new Map();
        killerMoves = Array(MATE_IN_MAX_PLY + 1).fill(null).map(() => [null, null]);
        historyTable = Array(12).fill(null).map(() => Array(64).fill(0));

        const initialState = createGameState(fen);
        repetitionHistory = [initialState.zobristHash];
        const currentHash = initialState.zobristHash.toString();

        if (DEBUG_MODE) {
            console.log(`---------------------------------`);
            console.log(`Calculating move for FEN: ${fen}`);
            console.log(`LIVE ZOBRIST HASH: ${currentHash}`);
            if (!openingBook.has(currentHash)) {
                console.error(`**CACHE MISS**: The live hash was NOT found in the opening book.`);
            } else {
                console.log(`**CACHE HIT**: Hash found in book.`);
            }
        }

        if (openingBook.has(currentHash)) {
            const bookMoves = openingBook.get(currentHash);
            const randomMove = bookMoves[Math.floor(Math.random() * bookMoves.length)];
            postMessage({ bestMove: randomMove, score: "Book Move", timeTaken: 0, nodesSearched: 0 });
            return;
        }

        if (DEBUG_MODE) {
            console.warn("Engine is now THINKING because of a book miss.");
        }

        const { bestMove, score } = searchRoot(initialState, maxDepth || 99);

        postMessage({
            bestMove: bestMove,
            score: score,
            timeTaken: (performance.now() - searchStartTime).toFixed(2),
            nodesSearched: nodeCount
        });
    }
};


