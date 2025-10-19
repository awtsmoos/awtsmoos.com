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


// =================================================================
//                 OPENING BOOK PROCESSING LOGIC
// =================================================================

// This will store the processed book: { hash: [moves] }
const openingBook = new Map();

// =================================================================
//                 OPENING BOOK PROCESSING LOGIC (v2.0 - Corrected)
// =================================================================

// =================================================================
//                 OPENING BOOK PROCESSING LOGIC (v2.1 - Robust)
// =================================================================

function buildOpeningBook() {
    if (openingBook.size > 0 || typeof rawOpeningBook === 'undefined') return;

    for (const entry of rawOpeningBook) {
        if (!entry) {
            continue; 
        }

        const fen = entry[0];
        const hash = calculateZobristHash(createGameState(fen)).toString();
        
        // Check if we already have moves for this position
        const existingMoves = openingBook.has(hash) ? openingBook.get(hash) : [];
        
        for (let i = 2; i < entry.length; i++) {
            const moveData = entry[i];
            existingMoves.push({
                from: moveData.from,
                to: moveData.to,
                san: moveData.san
            });
        }
        
        // Set the combined list of moves
        openingBook.set(hash, existingMoves);
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




importScripts('grandmaster_library.js');

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

// =================================================================
//      HIGH-PERFORMANCE LEGAL MOVE GENERATION (v4.0 - ROBUST)
// =================================================================
// This version is designed to be both fast and completely reliable. Instead of
// calling the complex `makeMove` function for every pseudo-legal move, it performs
// a lightweight simulation on a temporary board to verify king safety. This
// decouples legal move generation from the main state-updating logic, preventing
// cascading bugs and eliminating a major source of illegal moves.

// =================================================================
//      LEGAL MOVE GENERATION (v5.0 - UNIFIED AND CORRECT)
// =================================================================
// This version corrects a fundamental flaw where castling moves were not
// being generated as part of the pseudo-legal move set. It now unifies
// standard piece moves and castling into a single, reliable process,
// ensuring that the book generator and the engine see the same legal moves.

function generateLegalMoves(state) {
    const legalMoves = [];
    const pseudoLegalMoves = [];
    const { board, turn, castlingRights, kingPos } = state;
    const color = turn;
    const opponentColor = color === 'w' ? 'b' : 'w';
    const kingPosition = kingPos[color];

    // 1. Generate all pseudo-legal moves for every piece.
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            // Ensure we are only moving pieces of the correct color
            if (p && (p.toUpperCase() === p) === (color === 'w')) {
                generateMovesForPiece(pseudoLegalMoves, p, r, c, state);
            }
        }
    }
    
    // 2. *** THE CRITICAL FIX ***
    // Add pseudo-legal castling moves specifically for the King.
    // This check must be done here, after we know the king is not currently in check.
    if (kingPosition && !isSquareAttacked(board, kingPosition.r, kingPosition.c, opponentColor)) {
        const r = color === 'w' ? 7 : 0; // King's starting rank
        
        // Kingside Castling ('O-O')
        const kingSideMask = color === 'w' ? 8 : 2;
        if ((castlingRights & kingSideMask) && !board[r][5] && !board[r][6]) {
            if (!isSquareAttacked(board, r, 5, opponentColor) && !isSquareAttacked(board, r, 6, opponentColor)) {
                pseudoLegalMoves.push({ from: [r, 4], to: [r, 6], piece: color === 'w' ? 'K' : 'k', isCastle: true });
            }
        }

        // Queenside Castling ('O-O-O')
        const queenSideMask = color === 'w' ? 4 : 1;
        if ((castlingRights & queenSideMask) && !board[r][1] && !board[r][2] && !board[r][3]) {
            if (!isSquareAttacked(board, r, 2, opponentColor) && !isSquareAttacked(board, r, 3, opponentColor)) {
                pseudoLegalMoves.push({ from: [r, 4], to: [r, 2], piece: color === 'w' ? 'K' : 'k', isCastle: true });
            }
        }
    }

    // 3. For each pseudo-legal move, simulate it and check for king safety.
    // This process remains the same, but now it will correctly validate the castling moves we just added.
    for (const move of pseudoLegalMoves) {
        const [fromR, fromC] = move.from;
        const [toR, toC] = move.to;
        const piece = board[fromR][fromC];

        // Create a temporary board for the simulation
        const tempBoard = board.map(row => row.slice());
        
        // Handle the move on the temporary board
        tempBoard[toR][toC] = piece;
        tempBoard[fromR][fromC] = '';

        // Special handling for en-passant capture
        if (move.isEnPassant) {
            const capturedPawnRow = color === 'w' ? toR + 1 : toR - 1;
            tempBoard[capturedPawnRow][toC] = '';
        }
        
        // Find the king's position after the move
        const currentKingPos = (piece.toLowerCase() === 'k') ? { r: toR, c: toC } : kingPosition;
        
        // If the king is not attacked after the move, it's a legal move.
        if (currentKingPos && !isSquareAttacked(tempBoard, currentKingPos.r, currentKingPos.c, opponentColor)) {
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


// =================================================================
//      MOVE VALIDATION (v2.0 - CORRECTED)
// =================================================================

// =================================================================
//      MOVE VALIDATION (v3.0 - FINAL & CORRECTED)
// =================================================================
// This version fixes a critical logic error in the pawn attack check
// that was preventing castling from ever being legal.

function isSquareAttacked(board, r, c, attackerColor) {
    const isWhiteAttacker = attackerColor === 'w';
    const pawn = isWhiteAttacker ? 'P' : 'p';
    
    // --- THE CORRECTED PAWN ATTACK LOGIC ---
    // To see if a square at rank `r` is attacked by a white pawn, we must look
    // "up" the board (to a lower rank index) for the attacker.
    // To see if it's attacked by a black pawn, we look "down" (higher rank index).
    const pawnAttackDir = isWhiteAttacker ? 1 : -1;
    
    if (board[r + pawnAttackDir]?.[c - 1] === pawn || board[r + pawnAttackDir]?.[c + 1] === pawn) {
        return true;
    }
    // --- END OF FIX ---

    // Knight attacks
    for (const [dr, dc] of knightMoves) {
        const piece = board[r + dr]?.[c + dc];
        if (piece && piece.toLowerCase() === 'n' && (piece.toUpperCase() === piece) === isWhiteAttacker) return true;
    }

    // King attacks
    for (const [dr, dc] of kingMoves) {
        const piece = board[r + dr]?.[c + dc];
        if (piece && piece.toLowerCase() === 'k' && (piece.toUpperCase() === piece) === isWhiteAttacker) return true;
    }

    // Rook and Queen sliding attacks
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

    // Bishop and Queen sliding attacks
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

// REPLACEMENT 1: A completely type-safe initialization function.
// REPLACEMENT 1: A completely type-safe initialization function.


// REPLACEMENT 2: The hash calculation, with the incorrect BigInt() cast removed.
// This function now assumes initializeZobristKeys has done its job correctly.
function calculateZobristHash(state) {
    let hash = 0n;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = state.board[r][c];
            if (piece) {
                hash ^= zobristKeys[pieceMap.indexOf(piece)][r * 8 + c];
            }
        }
    }

    if (state.enPassantTarget) {
        hash ^= zobristEnPassantKeys[state.enPassantTarget[1]];
    }

    hash ^= zobristCastlingKeys[state.castlingRights];
    
    if (state.turn === 'b') {
        hash ^= zobristTurnKey;
    }
    return hash;
}

// REPLACEMENT 3: The createGameState, just to be 100% sure it's correct.

// Add this constant at the top of your file. It's the standard,
// fastest way to update castling rights.


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
// =================================================================
//                 THE LABYRINTH: HIGH-SPEED SEARCH (v2.1 - ROBUST QUIESCENCE)
// =================================================================
// This version fixes a critical crash when sorting tactical moves. It now
// correctly handles non-capturing promotions, preventing the 'toLowerCase' error.


// =================================================================
//                 THE LABYRINTH: HIGH-SPEED SEARCH (v2.1 - ROBUST QUIESCENCE)
// =================================================================
// This version fixes a critical crash when sorting tactical moves. It now
// correctly handles non-capturing promotions, preventing the 'toLowerCase' error.

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

    const moves = generateTacticalMoves(state);
    
    // --- START OF CRITICAL FIX ---
    // This new sorting logic correctly handles both captures and promotions.
    moves.sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;

        if (a.capture) {
            scoreA = (pieceValues[a.capture.toLowerCase()] * 10) - pieceValues[a.piece.toLowerCase()];
        }
        if (a.promotion) {
            scoreA += pieceValues[a.promotion.toLowerCase()];
        }

        if (b.capture) {
            scoreB = (pieceValues[b.capture.toLowerCase()] * 10) - pieceValues[b.piece.toLowerCase()];
        }
        if (b.promotion) {
            scoreB += pieceValues[b.promotion.toLowerCase()];
        }
        
        return scoreB - scoreA;
    });
    // --- END OF CRITICAL FIX ---

    for (const move of moves) {
        // The legality check here is still important for edge cases.
        const { newState } = makeMove(state, move);
        const opponentColor = state.turn === 'w' ? 'b' : 'w';
        const kingFinalPos = newState.kingPos[state.turn];

        // Ensure the move doesn't leave the king in check
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

// =================================================================
//                 THE LABYRINTH: HIGH-SPEED SEARCH (v3.0 - PVS & LMR)
// =================================================================
// This is the main search function, now featuring Principal Variation Search (PVS)
// and Late Move Reductions (LMR) for significantly improved search efficiency.

function search(state, depth, alpha, beta, ply) {
    if (performance.now() - searchStartTime > timeLimit) {
        stopSearch = true;
    }
    if (stopSearch) return 0;

    if (ply > 0 && repetitionHistory.filter(h => h === state.zobristHash).length >= 2) return CONTEMPT_FACTOR;
    if (ply >= MATE_IN_MAX_PLY) return evaluate(state);
    if (depth <= 0) return quiesce(state, alpha, beta, ply);
    
    nodeCount++;

    const ttEntry = transpositionTable.get(state.zobristHash.toString());
    if (ttEntry && ttEntry.depth >= depth) {
        if (ttEntry.flag === TT_EXACT) return ttEntry.score;
        if (ttEntry.flag === TT_LOWERBOUND && ttEntry.score >= beta) return beta;
        if (ttEntry.flag === TT_UPPERBOUND && ttEntry.score <= alpha) return alpha;
    }

    const inCheck = state.kingPos[state.turn] && isSquareAttacked(state.board, state.kingPos[state.turn].r, state.kingPos[state.turn].c, state.turn === 'w' ? 'b' : 'w');
    if (inCheck) depth++;

    // Null Move Pruning
    if (!inCheck && depth >= NULL_MOVE_R + 1 && ply > 0 && state.moveCount > 5) {
        const { newState: nullMoveState } = makeMove(state, { isNullMove: true });
        const score = -search(nullMoveState, depth - 1 - NULL_MOVE_R, -beta, -beta + 1, ply + 1);
        if (score >= beta) return beta;
    }

    const moves = generateLegalMoves(state);
    if (moves.length === 0) return inCheck ? -MATE_SCORE + ply : 0;
    
    const orderedMoves = orderMoves(moves, ttEntry ? ttEntry.bestMove : null, ply);
    let originalAlpha = alpha;
    let bestMove = orderedMoves[0];

    for (let i = 0; i < orderedMoves.length; i++) {
        const move = orderedMoves[i];
        const { newState } = makeMove(state, move);
        repetitionHistory.push(newState.zobristHash);

        let score;
        if (i === 0) {
            // Full window search for the first, best-guess move (PVS)
            score = -search(newState, depth - 1, -beta, -alpha, ply + 1);
        } else {
            // Late Move Reduction (LMR)
            let reduction = (depth >= 3 && i >= 3 && !inCheck && !move.capture) ? 1 : 0;
            // Search with a null window, assuming the move is not better than what we have
            score = -search(newState, depth - 1 - reduction, -alpha - 1, -alpha, ply + 1);
            // If it turns out to be better, we must re-search with the full window
            if (score > alpha && score < beta) {
                score = -search(newState, depth - 1, -beta, -alpha, ply + 1);
            }
        }
        
        repetitionHistory.pop();
        if (stopSearch) return 0;

        if (score > alpha) {
            alpha = score;
            bestMove = move;

            if (score >= beta) { // Beta-cutoff
                if (!move.capture) {
                    killerMoves[ply][1] = killerMoves[ply][0];
                    killerMoves[ply][0] = move;
                    if (move.piece) historyTable[pieceMap.indexOf(move.piece)][move.to[0] * 8 + move.to[1]] += depth * depth;
                }
                transpositionTable.set(state.zobristHash.toString(), { score: beta, depth, flag: TT_LOWERBOUND, bestMove: move });
                return beta;
            }
        }
    }

    const flag = (alpha > originalAlpha) ? TT_EXACT : TT_UPPERBOUND;
    transpositionTable.set(state.zobristHash.toString(), { score: alpha, depth, flag, bestMove });

    return alpha;
}

// =================================================================
//                 MOVE ORDERING v2.0: STRATEGIC INTUITION
// =================================================================
// This function is critical for search efficiency. It sorts moves at each node
// to ensure the best ones are searched first, enabling much deeper and faster
// alpha-beta pruning. A well-ordered move list can be the difference between
// an amateur and a master-level engine.

function orderMoves(moves, pvMove, ply) {
    return moves.map(move => {
        let score = 0;

        // 1. Principal Variation (PV) Move: The absolute highest priority.
        // This is the best move found in the previous search iteration.
        if (pvMove && move.from[0] === pvMove.from[0] && move.from[1] === pvMove.from[1] && move.to[0] === pvMove.to[0] && move.to[1] === pvMove.to[1]) {
            score = 100000;
        
        // 2. Captures (MVV-LVA): Sorted by "Most Valuable Victim - Least Valuable Attacker".
        // Taking a queen with a pawn is better than taking a pawn with a queen.
        } else if (move.capture) {
            // We give captures a high base score to ensure they are searched before quiet moves.
            // The specific value is determined by the victim's value minus the attacker's.
            score = 90000 + (pieceValues[move.capture.toLowerCase()] * 10 - pieceValues[move.piece.toLowerCase()]);
        
        // 3. Killer Moves: Powerful quiet moves that caused cutoffs at the same ply.
        // We store two killer moves per ply level.
        } else if (killerMoves[ply]) {
            if (killerMoves[ply][0]?.from[0] === move.from[0] && killerMoves[ply][0]?.from[1] === move.from[1] && killerMoves[ply][0]?.to[0] === move.to[0] && killerMoves[ply][0]?.to[1] === move.to[1]) {
                score = 80000;
            } else if (killerMoves[ply][1]?.from[0] === move.from[0] && killerMoves[ply][1]?.from[1] === move.from[1] && killerMoves[ply][1]?.to[0] === move.to[0] && killerMoves[ply][1]?.to[1] === move.to[1]) {
                score = 70000;
            }
        
        // 4. History Heuristic: Scores quiet moves based on how often they have been successful.
        // This provides a general-purpose ordering for all other non-capture moves.
        } else if (move.piece) {
            score = historyTable[pieceMap.indexOf(move.piece)][move.to[0] * 8 + move.to[1]] || 0;
        }

        return { move, score };
    })
    .sort((a, b) => b.score - a.score) // Sort in descending order of score
    .map(item => item.move);           // Return only the move objects
}
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

        // If the score falls outside the window, we must research with a wider one.
        // This is the core of aspiration windows.
        if (bestScore <= alpha || bestScore >= beta) {
            alpha = -Infinity;
            beta = Infinity;
            // We decrement the depth to re-run the search for this depth with the full window
            currentDepth--; 
            continue;
        }

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





// =================================================================
//              THE CONDUCTOR: MAIN WORKER DRIVER (v2.2 - EP COMPATIBILITY)
// =================================================================

// =================================================================
//              THE CONDUCTOR: MAIN WORKER DRIVER (v3.0 - VERIFIED BOOK)
// =================================================================

let DEBUG_MODE = true;
let isInitialized = false;

function initializeEngine() {
    if (isInitialized) return;
    initializeZobristKeys();
    buildOpeningBook();
    isInitialized = true;
    console.log("Prometheus Engine Initialized Successfully.");
}

self.onmessage = function(e) {
    const { command, fen, maxDepth, maxTime } = e.data;

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
        
        const currentHash = initialState.zobristHash;
        let alternativeHash = null;

        // Corrected code:
if (initialState.enPassantTarget) {
    // The enPassantTarget is [row, col]. We need the column index, which is [1].
    const epFileIndex = initialState.enPassantTarget[1]; 
    alternativeHash = currentHash ^ zobristEnPassantKeys[epFileIndex];
}

        const correctHashInBook = openingBook.has(currentHash.toString());
        const alternativeHashInBook = alternativeHash && openingBook.has(alternativeHash.toString());

        if (DEBUG_MODE) {
            console.log(`---------------------------------`);
            console.log(`Calculating move for FEN: ${fen}`);
            console.log(`LIVE ZOBRIST HASH: ${currentHash}`);
        }

        if (correctHashInBook || alternativeHashInBook) {
            const bookHash = correctHashInBook ? currentHash.toString() : alternativeHash.toString();
            const bookMoves = openingBook.get(bookHash);

            // --- START OF CRITICAL FIX: VERIFY THE BOOK MOVE ---
            // We no longer blindly trust the book. We verify its suggestions are legal.

            // 1. Generate all genuinely legal moves for the current position.
            const legalMoves = generateLegalMoves(initialState);
            
            // 2. Filter the book's suggestions to find ones that are actually legal.
            const verifiedBookMoves = bookMoves.filter(bookMove => 
                legalMoves.some(legalMove => 
                    legalMove.from[0] === bookMove.from[0] &&
                    legalMove.from[1] === bookMove.from[1] &&
                    legalMove.to[0] === bookMove.to[0] &&
                    legalMove.to[1] === bookMove.to[1]
                )
            );

            // 3. Only proceed if there is at least one verified legal move.
            if (verifiedBookMoves.length > 0) {
                if (DEBUG_MODE) {
                    console.log(`**CACHE HIT**: Hash found in book and move verified as legal.`);
                }
                const randomVerifiedMove = verifiedBookMoves[Math.floor(Math.random() * verifiedBookMoves.length)];
                
                // Post the original "thin" move object, respecting the main thread's format.
                postMessage({ bestMove: randomVerifiedMove, score: "Book Move", timeTaken: 0, nodesSearched: 0 });
                return; // The move is legal and sent. We are done.
            } else {
                // If we are here, the book entry existed but ALL its moves were illegal.
                if (DEBUG_MODE) {
                    console.error(`**BOOK FAILURE**: Hash found, but all book moves were ILLEGAL. Treating as a cache miss.`);
                }
            }
            // --- END OF CRITICAL FIX ---
        }
        
        // If the book check fails (either no entry or illegal moves), we fall through to here.
        if (DEBUG_MODE) {
            console.error(`**CACHE MISS**: The live hash was NOT found in the opening book.`);
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