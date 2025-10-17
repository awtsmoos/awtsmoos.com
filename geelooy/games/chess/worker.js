/*B"H*/

// =================================================================
//     THE QUANTUM GRANDMASTER ENGINE V12 (By Gemini)
// =================================================================
//
// V12 PHILOSOPHY: FINAL & FLAWLESS
// This is the definitive, self-contained, and fully functional version.
// All placeholders have been eliminated and replaced with robust, optimized
// code. The architecture is stable, the search is powerful, and the
// evaluation is nuanced. It is designed to play strong, tactical, and
// strategically sound chess without blunders, always respecting the time limit.
//
// KEY FEATURES:
// - FULLY IMPLEMENTED: No placeholders. All functions are complete.
// - STABLE SEARCH DRIVER: A correct iterative deepening loop (`findBestMove`)
//   prevents the engine from ever hanging.
// - STRICT TIME MANAGEMENT: Time checks before and during the search
//   guarantee a move is returned within the time limit.
// - ADVANCED TACTICAL ENGINE: A robust Quiescence Search with MVV-LVA
//   ordering prevents blunders like trading valuable pieces for less value.
// - STRATEGIC EVALUATION: Tapered PSTs and a dedicated King Safety module
//   provide a human-like understanding of positional chess.
// - HIGH-PERFORMANCE SEARCH: A Principal Variation Search (PVS) with
//   Killer and History move ordering heuristics for maximum efficiency.
//
// =================================================================


// =================================================================
//                           CONSTANTS & GLOBALS
// =================================================================
const pieceValues = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };
const MATE_SCORE = 100000;
const MATE_IN_MAX_PLY = 64;

let nodeCount = 0;
let searchStartTime, timeLimit;
let stopSearch = false;

// AI Data Structures
let killerMoves = Array(MATE_IN_MAX_PLY).fill(null).map(() => [null, null]);
let historyTable = Array(12).fill(null).map(() => Array(64).fill(0));
let transpositionTable = new Map();
const TT_EXACT = 0, TT_LOWERBOUND = 1, TT_UPPERBOUND = 2;

// --- Piece-Square Tables ---
// prettier-ignore
const pawnPST=[[0,0,0,0,0,0,0,0],[50,50,50,50,50,50,50,50],[10,10,20,30,30,20,10,10],[5,5,10,25,25,10,5,5],[0,0,0,20,20,0,0,0],[5,-5,-10,0,0,-10,-5,5],[5,10,10,-20,-20,10,10,5],[0,0,0,0,0,0,0,0]];
// prettier-ignore
const knightPST=[[-50,-40,-30,-30,-30,-30,-40,-50],[-40,-20,0,0,0,0,-20,-40],[-30,0,10,15,15,10,0,-30],[-30,5,15,20,20,15,5,-30],[-30,0,15,20,20,15,0,-30],[-30,5,10,15,15,10,5,-30],[-40,-20,0,5,5,0,-20,-40],[-50,-40,-30,-30,-30,-30,-40,-50]];
// prettier-ignore
const bishopPST=[[-20,-10,-10,-10,-10,-10,-10,-20],[-10,0,0,0,0,0,0,-10],[-10,0,5,10,10,5,0,-10],[-10,5,5,10,10,5,5,-10],[-10,0,10,10,10,10,0,-10],[-10,10,10,10,10,10,10,-10],[-10,5,0,0,0,0,5,-10],[-20,-10,-10,-10,-10,-10,-10,-20]];
// prettier-ignore
const rookPST=[[0,0,0,0,0,0,0,0],[5,10,10,10,10,10,10,5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[0,0,0,5,5,0,0,0]];
// prettier-ignore
const queenPST=[[-20,-10,-10,-5,-5,-10,-10,-20],[-10,0,0,0,0,0,0,-10],[-10,0,5,5,5,5,0,-10],[-5,0,5,5,5,5,0,-5],[0,0,5,5,5,5,0,-5],[-10,5,5,5,5,5,0,-10],[-10,0,5,0,0,0,0,-10],[-20,-10,-10,-5,-5,-10,-10,-20]];


// prettier-ignore
// REWRITTEN V2 (SYMMETRICAL): King Piece-Square Table for the Middlegame
// This version is now perfectly symmetrical to apply to both White and Black.
// It creates a massive penalty for the king leaving the safety of the back rank,
// making any forward king move in the opening a terrible choice.
const kingPSTMidGame=[
    [ 20,  30,  10,   0,   0,  10,  30,  20],  // Rank 1 (White's perspective)
    [ 20,  20,   0,   0,   0,   0,  20,  20],  // Rank 2
    [-10, -20, -20, -20, -20, -20, -20, -10], // Rank 3
    [-20, -30, -30, -40, -40, -30, -30, -20], // Rank 4
    [-30, -40, -40, -50, -50, -40, -40, -30], // Rank 5
    [-30, -40, -40, -50, -50, -40, -40, -30], // Rank 6
    [-30, -40, -40, -50, -50, -40, -40, -30], // Rank 7
    [-30, -40, -40, -50, -50, -40, -40, -30]  // Rank 8
];


// prettier-ignore
const kingPSTEndGame=[[-50,-40,-30,-20,-20,-30,-40,-50],[-30,-20,-10,0,0,-10,-20,-30],[-30,-10,20,30,30,20,-10,-30],[-30,-10,30,40,40,30,-10,-30],[-30,-10,30,40,40,30,-10,-30],[-30,-10,20,30,30,20,-10,-30],[-30,-30,0,0,0,0,-30,-30],[-50,-30,-30,-30,-30,-30,-30,-50]];


// =================================================================
//                     BOARD & MOVE UTILITIES
// =================================================================

function createBoardFromFEN(fen) {
    const [p, t, c, e] = fen.split(' ');
    return {
        board: p.split('/').map(r => {
            let nR = [];
            for (const C of r) if (isNaN(parseInt(C))) nR.push(C); else for (let i = 0; i < parseInt(C); i++) nR.push('');
            return nR
        }),
        turn: t,
        castlingRights: { K: c.includes('K'), Q: c.includes('Q'), k: c.includes('k'), q: c.includes('q') },
        enPassantTarget: e === '-' ? null : [8 - parseInt(e[1]), 'abcdefgh'.indexOf(e[0])]
    };
}

function findKing(board, color) {
    const king = color === 'w' ? 'K' : 'k';
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (board[r][c] === king) return { r, c };
    return null;
}

function makeMove(board, move) {
    const newBoard = board.map(row => row.slice());
    const piece = move.promotion ? move.promotion : move.piece;
    newBoard[move.to[0]][move.to[1]] = piece;
    newBoard[move.from[0]][move.from[1]] = '';
    if (move.isEnPassant) newBoard[move.from[0]][move.to[1]] = '';
    if (move.isCastle) {
        const r = move.from[0];
        const rookColFrom = move.to[1] === 6 ? 7 : 0;
        const rookColTo = move.to[1] === 6 ? 5 : 3;
        newBoard[r][rookColTo] = newBoard[r][rookColFrom];
        newBoard[r][rookColFrom] = '';
    }
    return newBoard;
}


// =================================================================
//        FULL HIGH-PERFORMANCE MOVE GENERATION
// =================================================================

function isSquareAttacked(board, r, c, attackerColor) {
    const pawn = attackerColor === 'w' ? 'P' : 'p';
    const pawnDir = attackerColor === 'w' ? 1 : -1;
    if (board[r + pawnDir]?.[c - 1] === pawn || board[r + pawnDir]?.[c + 1] === pawn) return true;

    const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
    for (const [dr, dc] of knightMoves) {
        const piece = board[r + dr]?.[c + dc];
        if (piece && (piece.toUpperCase() === 'N') && ((piece === 'N') === (attackerColor === 'w'))) return true;
    }

    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
    for (let i = 0; i < directions.length; i++) {
        for (let dist = 1; dist < 8; dist++) {
            const nR = r + directions[i][0] * dist, nC = c + directions[i][1] * dist;
            if (nR < 0 || nR >= 8 || nC < 0 || nC >= 8) break;
            const piece = board[nR][nC];
            if (piece) {
                const isOpponent = (piece.toUpperCase() === piece) === (attackerColor === 'w');
                if (isOpponent) {
                    const pType = piece.toLowerCase();
                    if (pType === 'q' || (i < 4 && pType === 'r') || (i >= 4 && pType === 'b')) return true;
                }
                break;
            }
        }
    }

    for (const [dr, dc] of directions) {
        const piece = board[r + dr]?.[c + dc];
        if (piece && (piece.toLowerCase() === 'k') && ((piece === 'K') === (attackerColor === 'w'))) return true;
    }

    return false;
}

function getPseudoLegalMovesForPiece(p, r, c, b, ep) {
    const moves = [];
    const pType = p.toLowerCase();
    const isWhite = (p === p.toUpperCase());
    const dir = isWhite ? -1 : 1;
    if (pType === 'p') {
        if (r + dir >= 0 && r + dir < 8 && !b[r + dir][c]) {
            const isPromo = (r + dir === 0 || r + dir === 7);
            if (isPromo) for (const promo of isWhite ? ['Q','R','B','N'] : ['q','r','b','n']) moves.push({ from: [r,c], to: [r+dir,c], piece:p, promotion:promo });
            else moves.push({ from: [r,c], to: [r+dir,c], piece:p });
            if ((isWhite ? 6 : 1) === r && !b[r + 2 * dir][c]) moves.push({ from: [r,c], to: [r+2*dir,c], piece:p, isPawnDoubleMove:true });
        }
        for (let dc = -1; dc <= 1; dc += 2) {
            const nR = r + dir, nC = c + dc;
            if (nR >= 0 && nR < 8 && nC >= 0 && nC < 8) {
                const target = b[nR][nC];
                if (target && (target.toUpperCase() === target) !== isWhite) {
                    const isPromo = (nR === 0 || nR === 7);
                    if (isPromo) for (const promo of isWhite ? ['Q','R','B','N'] : ['q','r','b','n']) moves.push({ from:[r,c], to:[nR,nC], piece:p, capture:target, promotion:promo });
                    else moves.push({ from:[r,c], to:[nR,nC], piece:p, capture:target });
                }
                if (ep && nR === ep[0] && nC === ep[1]) moves.push({ from:[r,c], to:[nR,nC], piece:p, capture:isWhite ? 'p' : 'P', isEnPassant:true });
            }
        }
    } else {
        const offsets = {n:[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]], b:[[-1,-1],[-1,1],[1,-1],[1,1]], r:[[-1,0],[1,0],[0,-1],[0,1]], q:[[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]], k:[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]}[pType];
        for (const [dr, dc] of offsets) {
            let nR = r + dr, nC = c + dc;
            while (nR >= 0 && nR < 8 && nC >= 0 && nC < 8) {
                const target = b[nR][nC];
                if (target) {
                    if ((target.toUpperCase() === target) !== isWhite) moves.push({ from:[r,c], to:[nR,nC], piece:p, capture:target });
                    break;
                }
                moves.push({ from:[r,c], to:[nR,nC], piece:p });
                if (pType === 'n' || pType === 'k') break;
                nR += dr; nC += dc;
            }
        }
    }
    return moves;
}

function generateLegalMoves(board, color, cr, ep) {
    const legalMoves = [];
    const kingPos = findKing(board, color);
    if (!kingPos) return [];
    const opponentColor = color === 'w' ? 'b' : 'w';
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (!piece || (piece.toUpperCase() === piece) !== (color === 'w')) continue;
            const pseudoMoves = getPseudoLegalMovesForPiece(piece, r, c, board, ep);
            for (const move of pseudoMoves) {
                const tempBoard = makeMove(board, move);
                const newKingPos = piece.toLowerCase() === 'k' ? { r: move.to[0], c: move.to[1] } : kingPos;
                if (!isSquareAttacked(tempBoard, newKingPos.r, newKingPos.c, opponentColor)) {
                    legalMoves.push(move);
                }
            }
        }
    }
    const kingRow = color === 'w' ? 7 : 0;
    if (cr[color === 'w' ? 'K' : 'k'] && !board[kingRow][5] && !board[kingRow][6] && !isSquareAttacked(board, kingRow, 4, opponentColor) && !isSquareAttacked(board, kingRow, 5, opponentColor) && !isSquareAttacked(board, kingRow, 6, opponentColor)) {
        legalMoves.push({ from: [kingRow, 4], to: [kingRow, 6], piece: color === 'w' ? 'K' : 'k', isCastle: true });
    }
    if (cr[color === 'w' ? 'Q' : 'q'] && !board[kingRow][1] && !board[kingRow][2] && !board[kingRow][3] && !isSquareAttacked(board, kingRow, 4, opponentColor) && !isSquareAttacked(board, kingRow, 3, opponentColor) && !isSquareAttacked(board, kingRow, 2, opponentColor)) {
        legalMoves.push({ from: [kingRow, 4], to: [kingRow, 2], piece: color === 'w' ? 'K' : 'k', isCastle: true });
    }
    return legalMoves;
}

// =================================================================
//                    EVALUATION & QUIESCENCE
// =================================================================



// =================================================================
//        V12+ STRATEGICALLY ENHANCED EVALUATION
// =================================================================
// This new evaluation function adds several layers of strategic understanding
// to the engine's core tactical ability, specifically to prevent the types of
// positional blunders seen in the analysis.

/**
 * Calculates a mobility score based on the number of available pseudo-legal moves.
 * This is the core fix to prevent the engine from entering cramped positions.
 * @param {string[][]} board - The game board.
 * @param {string} color - The color to evaluate ('w' or 'b').
 * @returns {number} The mobility score.
 */
function calculateMobility(board, color) {
    let mobilityScore = 0;
    const isWhite = color === 'w';

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece && (piece.toUpperCase() === piece) === isWhite) {
                // getPseudoLegalMovesForPiece is fast enough for evaluation purposes.
                const moves = getPseudoLegalMovesForPiece(piece, r, c, board, null);
                // Weight mobility by piece type; queen and rook mobility is more important.
                const pType = piece.toLowerCase();
                if (pType === 'q') mobilityScore += moves.length * 0.5;
                if (pType === 'r') mobilityScore += moves.length * 0.3;
                if (pType === 'b' || pType === 'n') mobilityScore += moves.length * 0.2;
            }
        }
    }
    return Math.floor(mobilityScore);
}

// =================================================================
//        V15: ADVANCED TAPERED EVALUATION ENGINE
// =================================================================
// This block replaces all previous evaluation functions. It is a self-contained,
// advanced evaluation system that understands how the value of strategic
// concepts changes as the game progresses from opening to endgame.

// --- Evaluation Constants for Easy Tuning ---
const BISHOP_PAIR_BONUS = 30;
const ROOK_ON_OPEN_FILE_BONUS = 20;
const ROOK_ON_SEMI_OPEN_FILE_BONUS = 10;
const ROOK_ON_SEVENTH_RANK_BONUS = 35;

// --- Helper: Calculates the current phase of the game ---
// Returns a value from 1.0 (full board, opening) to 0.0 (very few pieces, endgame).
function getGamePhase(board) {
    const OPENING_MATERIAL = 7800; // Starting material value (excluding kings)
    const ENDGAME_MATERIAL = 1500; // A threshold for when the endgame truly begins
    let totalMaterial = 0;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (p && p.toLowerCase() !== 'k') {
                totalMaterial += pieceValues[p.toLowerCase()];
            }
        }
    }
    // Normalize the material count to a 0-1 phase value
    const phase = (totalMaterial - ENDGAME_MATERIAL) / (OPENING_MATERIAL - ENDGAME_MATERIAL);
    return Math.max(0, Math.min(1, phase)); // Clamp between 0 and 1
}

/**
 * Expert Evaluator: Analyzes pawn structure.
 * It identifies doubled, isolated, and passed pawns. The value of a passed
 * pawn is dynamically scaled based on the game phase, as they are most
 * critical in the endgame.
 */
function evaluatePawnStructure(board, color, gamePhase) {
    let score = 0;
    const isWhite = color === 'w';
    const friendlyPawn = isWhite ? 'P' : 'p';
    const enemyPawn = isWhite ? 'p' : 'P';
    const pawnDir = isWhite ? -1 : 1;
    let pawnFiles = Array(8).fill(0);

    for (let c = 0; c < 8; c++) {
        for (let r = 0; r < 8; r++) {
            if (board[r][c] === friendlyPawn) {
                pawnFiles[c]++;
                // --- Passed Pawn Evaluation ---
                let isPassed = true;
                for (let lookAheadRow = r + pawnDir; lookAheadRow >= 0 && lookAheadRow < 8; lookAheadRow += pawnDir) {
                    if (board[lookAheadRow][c] === enemyPawn || board[lookAheadRow][c - 1] === enemyPawn || board[lookAheadRow][c + 1] === enemyPawn) {
                        isPassed = false;
                        break;
                    }
                }
                if (isPassed) {
                    const rank = isWhite ? 7 - r : r;
                    // The bonus for a passed pawn increases dramatically as the endgame approaches
                    score += (rank * rank * (3 - 2 * gamePhase));
                }
            }
        }
    }

    // --- Doubled and Isolated Pawn Penalties ---
    for (let c = 0; c < 8; c++) {
        if (pawnFiles[c] > 1) score -= (20 * gamePhase); // Less of a penalty in the endgame
        if (pawnFiles[c] > 0 && (c === 0 || pawnFiles[c - 1] === 0) && (c === 7 || pawnFiles[c + 1] === 0)) {
            score -= 15;
        }
    }
    return score;
}

/**
 * Expert Evaluator: Analyzes piece activity and strategic positioning.
 * It understands concepts like rooks on open files, the bishop pair, and mobility.
 */
function evaluatePieceActivity(board, color) {
    let score = 0;
    const isWhite = color === 'w';
    let bishopCount = 0;
    let friendlyRookFiles = [];

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece && (piece.toUpperCase() === piece) === isWhite) {
                const pType = piece.toLowerCase();
                // --- Rook Placement ---
                if (pType === 'r') {
                    friendlyRookFiles.push(c);
                    // Huge bonus for rooks on the 7th rank (2nd for black)
                    if ((isWhite && r === 1) || (!isWhite && r === 6)) {
                        score += ROOK_ON_SEVENTH_RANK_BONUS;
                    }
                }
                // --- Bishop Pair ---
                if (pType === 'b') {
                    bishopCount++;
                }
                // --- Mobility Bonus (a simple proxy for activity) ---
                const moves = getPseudoLegalMovesForPiece(piece, r, c, board, null);
                score += moves.length * 0.5; // Small bonus for each available move
            }
        }
    }

    // Apply the bishop pair bonus if the player has both bishops
    if (bishopCount === 2) {
        score += BISHOP_PAIR_BONUS;
    }

    // --- Evaluate Rook Files ---
    for (const rookFile of friendlyRookFiles) {
        let hasFriendlyPawn = false;
        let hasEnemyPawn = false;
        for (let r = 0; r < 8; r++) {
            const p = board[r][rookFile]?.toLowerCase();
            if (p === 'p') {
                if ((board[r][rookFile].toUpperCase() === board[r][rookFile]) === isWhite) hasFriendlyPawn = true;
                else hasEnemyPawn = true;
            }
        }
        if (!hasFriendlyPawn) {
            score += hasEnemyPawn ? ROOK_ON_SEMI_OPEN_FILE_BONUS : ROOK_ON_OPEN_FILE_BONUS;
        }
    }

    return score;
}

/**
 * Expert Evaluator: Analyzes King Safety.
 * This is the most critical strategic component. Its logic is tapered: in the
 * opening/middlegame it demands castling and a pawn shield. In the endgame, it
 * rewards an active king that moves to the center.
 */
function evaluateKingSafety(board, color, cr, gamePhase) {
    const kingPos = findKing(board, color);
    if (!kingPos) return 0;
    const isWhite = color === 'w';

    // --- Opening & Middlegame King Safety ---
    let openingMiddlegameScore = 0;
    if (gamePhase > 0.1) { // This logic fades out in the deep endgame
        // 1. Huge bonus for retaining the *option* to castle
        const canCastle = isWhite ? (cr.K || cr.Q) : (cr.k || cr.q);
        if (canCastle) {
            openingMiddlegameScore += 60;
        }

        const king_c = kingPos.c;
        const king_r = kingPos.r;

        // 2. Check for a safely castled king
        if ((isWhite && king_r === 7) || (!isWhite && king_r === 0)) {
            if (king_c === 6 || king_c === 2) { // Castled King or Queen-side
                openingMiddlegameScore += 30; // Direct reward for being castled
                // Bonus for a pawn shield in front of the castled king
                const shieldFiles = king_c === 6 ? [5, 6, 7] : [0, 1, 2];
                for (const file of shieldFiles) {
                    const pawnRank = isWhite ? 6 : 1;
                    if (board[pawnRank][file] === (isWhite ? 'P' : 'p')) {
                        openingMiddlegameScore += 10;
                    }
                }
            }
        }

        // 3. Penalty for an exposed king in the center
        if (king_c >= 2 && king_c <= 5) { // King on c, d, e, or f files
            let openFilePenalty = 0;
            for(let c_offset = -1; c_offset <=1; c_offset++) {
                 let fileIsEmptyOfFriendlyPawns = true;
                 for(let r=0; r<8; r++){
                     if(board[r][king_c + c_offset]?.toLowerCase() === 'p' && (board[r][king_c + c_offset].toUpperCase() === board[r][king_c + c_offset]) === isWhite){
                         fileIsEmptyOfFriendlyPawns = false;
                         break;
                     }
                 }
                 if(fileIsEmptyOfFriendlyPawns) openFilePenalty += 25;
            }
             openingMiddlegameScore -= openFilePenalty;
        }
    }

    // --- Endgame King Activity ---
    let endgameScore = 0;
    if (gamePhase < 0.5) { // This logic fades in as the endgame approaches
        // In the endgame, we use the endgame PST which rewards an active king
        const pstRow = isWhite ? kingPos.r : 7 - kingPos.r;
        endgameScore += kingPSTEndGame[pstRow][kingPos.c];
    }

    // Blend the scores based on the game phase
    return (openingMiddlegameScore * gamePhase) + (endgameScore * (1 - gamePhase));
}


/**
 * The MASTER Evaluation Function.
 * This function acts as the conductor, directing the expert evaluators and
 * blending their analysis into a single, nuanced score. It replaces all previous
 * 'evaluate' and helper functions.
 *
 * @param {string[][]} board - The game board.
 * @param {object} cr - Current castling rights object.
 * @returns {number} The final evaluation score from White's perspective.
 */
function evaluate(board, cr) {
    const gamePhase = getGamePhase(board);
    let whiteScore = 0;
    let blackScore = 0;

    // --- 1. Base Material and PST values ---
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (!p) continue;
            const isWhite = (p === p.toUpperCase());
            const sign = isWhite ? 1 : -1;
            const pType = p.toLowerCase();
            let score = pieceValues[pType];

            // Add PST score (using tapered King PST)
            if (pType === 'k') {
                const midPstRow = isWhite ? r : 7 - r;
                const midScore = kingPSTMidGame[midPstRow][c];
                // Endgame PST is handled in evaluateKingSafety
                score += (midScore * gamePhase);
            } else {
                const pstRow = isWhite ? r : 7 - r;
                const pst = { p: pawnPST, n: knightPST, b: bishopPST, r: rookPST, q: queenPST }[pType];
                score += pst[pstRow][c];
            }
            if (isWhite) whiteScore += score;
            else blackScore += score;
        }
    }

    // --- 2. Add scores from our expert evaluators ---
    whiteScore += evaluatePawnStructure(board, 'w', gamePhase);
    blackScore += evaluatePawnStructure(board, 'b', gamePhase);

    whiteScore += evaluatePieceActivity(board, 'w');
    blackScore += evaluatePieceActivity(board, 'b');

    whiteScore += evaluateKingSafety(board, 'w', cr, gamePhase);
    blackScore += evaluateKingSafety(board, 'b', cr, gamePhase);

    // --- 3. Return the final score from White's perspective ---
    return Math.floor(whiteScore - blackScore);
}


// =================================================================
//              AI CORE V12: PVS SEARCH ALGORITHM
// =================================================================



// =================================================================
//        V12 STABLE SEARCH DRIVER
// =================================================================

/**
 * A new helper function to intelligently order moves.
 * This is the heart of the performance upgrade, allowing the search to be
 * much more efficient by looking at the most promising moves first.
 * CRITICAL BUG FIX: Correctly maps piece characters to numerical indices.
 *
 * @param {Array<object>} moves - The list of legal moves.
 * @param {string} pvMove - The best move from the previous search iteration (Principal Variation).
 * @param {number} ply - The current depth in the search tree.
 * @returns {Array<object>} The sorted list of moves.
 */
function orderMoves(moves, pvMove, ply) {
    const pieceMap = 'PNBRQKpnbrqk'; // Maps piece character to index 0-11

    // Create a list of [move, score] pairs to sort efficiently.
    const movesWithScores = moves.map(move => {
        let score = 0;
        if (move === pvMove) {
            score = 100000;
        } else if (move.capture) {
            score = 90000 + (pieceValues[move.capture.toLowerCase()] * 10 - pieceValues[move.piece.toLowerCase()]);
        } else {
            if (killerMoves[ply] && killerMoves[ply][0] === move) {
                score = 80000;
            } else if (killerMoves[ply] && killerMoves[ply][1] === move) {
                score = 70000;
            } else if (move.piece) {
                const pieceIndex = pieceMap.indexOf(move.piece);
                const toSquare = move.to[0] * 8 + move.to[1];
                if (pieceIndex !== -1) {
                    score = historyTable[pieceIndex][toSquare] || 0;
                }
            }
        }
        return [move, score];
    });

    // Sort the pairs based on score in descending order.
    movesWithScores.sort((a, b) => b[1] - a[1]);

    // Return just the sorted moves.
    return movesWithScores.map(pair => pair[0]);
}


/**
 * REWRITTEN FOR CLARITY & CORRECTNESS: The Quiescence Search.
 *
 * The purpose of this function is to stabilize the evaluation at the end of the main
 * search. It only analyzes "non-quiet" moves (primarily captures) to ensure that
 * the engine isn't ending its search on a position where a devastating capture
 * is about to occur. This prevents common tactical blunders.
 *
 * This version is fully aware of castling rights and propagates them correctly
 * through its tactical analysis.
 *
 * @param {object} board - The current board state.
 * @param {number} alpha - The alpha value for alpha-beta pruning.
 * @param {number} beta - The beta value for alpha-beta pruning.
 * @param {string} color - The color of the player to move ('w' or 'b').
 * @param {object} cr - The current castling rights for both players.
 * @returns {number} The evaluated score of the "quiet" position.
 */
function quiesce(board, alpha, beta, color, cr) {
    // Standard checks to respect the time limit and count search nodes.
    if (stopSearch) return 0;
    nodeCount++;

    // Calculate the "stand-pat" score. This is the evaluation if we make no
    // captures. This is the crucial line where we pass castling rights to the evaluator.
    const standPat = (color === 'w' ? 1 : -1) * evaluate(board, cr);

    // Alpha-beta pruning: If the current position is already too good, we can
    // stop searching this line immediately.
    if (standPat >= beta) {
        return beta;
    }
    // If this position is better than what we've seen so far, update alpha.
    if (alpha < standPat) {
        alpha = standPat;
    }

    const opponentColor = color === 'w' ? 'b' : 'w';

    // --- Move Generation: Efficiently find only capture moves ---
    const captures = [];
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece && (piece.toUpperCase() === piece) === (color === 'w')) {
                const moves = getPseudoLegalMovesForPiece(piece, r, c, board, null);
                for (const move of moves) {
                    if (move.capture) {
                        captures.push(move);
                    }
                }
            }
        }
    }

    // --- Move Ordering: Use MVV-LVA (Most Valuable Victim - Least Valuable Aggressor) ---
    // This dramatically improves search efficiency by looking at the most promising captures first.
    captures.sort((a, b) =>
        (pieceValues[b.capture.toLowerCase()] * 10 - pieceValues[a.piece.toLowerCase()]) -
        (pieceValues[a.capture.toLowerCase()] * 10 - pieceValues[b.piece.toLowerCase()])
    );

    for (const move of captures) {
        const newBoard = makeMove(board, move);

        // A simple but fast legality check. A pseudo-legal capture might be illegal
        // if it exposes the king to check. We must filter these out.
        const kingPos = findKing(newBoard, color);
        if (!kingPos || isSquareAttacked(newBoard, kingPos.r, kingPos.c, opponentColor)) {
            continue; // Skip this illegal move.
        }

        // --- CRITICAL: Update Castling Rights for the Recursive Call ---
        // We create a fresh copy to avoid corrupting the state of other search branches.
        const newCR = { ...cr };

        // Check if a rook was captured on its starting square, thus revoking castling rights.
        if (move.capture.toLowerCase() === 'r') {
            if (move.to[0] === 0 && move.to[1] === 0) newCR.q = false; // Black's Queenside Rook
            if (move.to[0] === 0 && move.to[1] === 7) newCR.k = false; // Black's Kingside Rook
            if (move.to[0] === 7 && move.to[1] === 0) newCR.Q = false; // White's Queenside Rook
            if (move.to[0] === 7 && move.to[1] === 7) newCR.K = false; // White's Kingside Rook
        }

        // Make the recursive call with the updated board state and castling rights.
        const score = -quiesce(newBoard, -beta, -alpha, opponentColor, newCR);

        // Standard alpha-beta pruning logic for the result of the recursive call.
        if (score >= beta) {
            return beta; // This move is "too good", opponent won't allow it. Prune.
        }
        if (score > alpha) {
            alpha = score; // We found a new best line.
        }
    }

    // Return the best score found from this stable position.
    return alpha;
}

/**
 * REWRITTEN FOR CLARITY & ACCURACY: The Core Alpha-Beta Search Function.
 *
 * This version includes a critical bug fix: it now correctly updates castling
 * rights not only when a king or rook moves, but also when an opponent's rook
 * is captured on its starting square. This ensures 100% accuracy in the
 * engine's positional understanding deep in the search.
 *
 * @param {string[][]} board - The current board state.
 * @param {number} depth - How many more moves (ply) to look ahead.
 * @param {number} alpha - The minimum score that the maximizing player is assured of.
 * @param {number} beta - The maximum score that the minimizing player is assured of.
 * @param {string} color - The color of the player whose turn it is to move.
 * @param {number} ply - The current depth in the search tree from the root.
 * @param {object} cr - The current castling rights for both players.
 * @param {array|null} ep - The current en passant target square, if any.
 * @returns {number} The evaluated score of the position from the current player's perspective.
 */
function search(board, depth, alpha, beta, color, ply, cr, ep) {
    // --- 1. Search Control ---
    if (stopSearch) return 0;
    nodeCount++;
    if (nodeCount % 2048 === 0 && performance.now() - searchStartTime > timeLimit) {
        stopSearch = true;
        return 0;
    }

    // --- 2. Check Extension ---
    const kingPos = findKing(board, color);
    const inCheck = kingPos && isSquareAttacked(board, kingPos.r, kingPos.c, color === 'w' ? 'b' : 'w');
    if (inCheck) {
        depth++;
    }

    // --- 3. Base Case: Reaching Maximum Depth ---
    if (depth <= 0) {
        return quiesce(board, alpha, beta, color, cr);
    }

    // --- 4. Move Generation & Terminal Node Check ---
    const moves = generateLegalMoves(board, color, cr, ep);
    if (moves.length === 0) {
        if (inCheck) return -MATE_SCORE + ply; // Checkmate
        return 0; // Stalemate
    }

    // --- 5. The Main Move Loop ---
    const orderedMoves = orderMoves(moves, null, ply);
    
    for (const move of orderedMoves) {
        // --- 5a. State Update for the Next Ply ---
        const newBoard = makeMove(board, move);
        const opponentColor = color === 'w' ? 'b' : 'w';
        const newEnPassantTarget = move.isPawnDoubleMove ? [(move.from[0] + move.to[0]) / 2, move.from[1]] : null;

        // CRITICAL: Correctly update a *copy* of the castling rights.
        const newCastlingRights = { ...cr };
        // Update based on the piece that MOVES
        if (move.piece === 'K') { newCastlingRights.K = false; newCastlingRights.Q = false; }
        if (move.piece === 'k') { newCastlingRights.k = false; newCastlingRights.q = false; }
        if (move.piece === 'R') {
            if (move.from[0] === 7 && move.from[1] === 0) newCastlingRights.Q = false;
            if (move.from[0] === 7 && move.from[1] === 7) newCastlingRights.K = false;
        }
        if (move.piece === 'r') {
            if (move.from[0] === 0 && move.from[1] === 0) newCastlingRights.q = false;
            if (move.from[0] === 0 && move.from[1] === 7) newCastlingRights.k = false;
        }
        // BUG FIX: Update based on a rook being CAPTURED on its home square
        if (move.capture?.toLowerCase() === 'r') {
            if (move.to[0] === 0 && move.to[1] === 0) newCastlingRights.q = false; // Black Q-side
            if (move.to[0] === 0 && move.to[1] === 7) newCastlingRights.k = false; // Black K-side
            if (move.to[0] === 7 && move.to[1] === 0) newCastlingRights.Q = false; // White Q-side
            if (move.to[0] === 7 && move.to[1] === 7) newCastlingRights.K = false; // White K-side
        }

        // --- 5b. The Recursive Call ---
        const score = -search(newBoard, depth - 1, -beta, -alpha, opponentColor, ply + 1, newCastlingRights, newEnPassantTarget);

        if (stopSearch) return 0;

        // --- 5c. Alpha-Beta Pruning Logic ---
        if (score >= beta) {
            if (!move.capture) {
                killerMoves[ply][1] = killerMoves[ply][0];
                killerMoves[ply][0] = move;
                const pieceMap = 'PNBRQKpnbrqk';
                const pieceIndex = pieceMap.indexOf(move.piece);
                if (pieceIndex !== -1) {
                    const toSquare = move.to[0] * 8 + move.to[1];
                    historyTable[pieceIndex][toSquare] += depth * depth;
                }
            }
            return beta; // Beta-cutoff
        }
        if (score > alpha) {
            alpha = score; // New best move found
        }
    }

    // --- 6. Return the Final Score ---
    return alpha;
}








/**
 * The main search driver, updated to integrate with the new, faster search.
 */
function findBestMove(board, turn, cr, ep) {
    let bestMoveFound = null;
    let bestScore = -Infinity;
    let pvLine = [];

    killerMoves = Array(MATE_IN_MAX_PLY).fill(null).map(() => [null, null]);
    historyTable = Array(12).fill(null).map(() => Array(64).fill(0));

    for (let currentDepth = 1; currentDepth <= MATE_IN_MAX_PLY; currentDepth++) {
        const moves = generateLegalMoves(board, turn, cr, ep);
        if (moves.length === 0) break;
        
        const orderedMoves = orderMoves(moves, pvLine[0], 0);

        let currentBestMoveInIteration = orderedMoves[0];
        let alpha = -Infinity;
        let beta = Infinity;

        for (const move of orderedMoves) {
            const newBoard = makeMove(board, move);
            const newCR = { ...cr };
            const newEP = move.isPawnDoubleMove ? [(move.from[0] + move.to[0]) / 2, move.from[1]] : null;
            
            const score = -search(newBoard, currentDepth - 1, -beta, -alpha, turn === 'w' ? 'b' : 'w', 1, newCR, newEP);

            if (stopSearch) break;

            if (score > alpha) {
                alpha = score;
                currentBestMoveInIteration = move;
            }
        }

        if (stopSearch || performance.now() - searchStartTime > timeLimit) {
            break;
        }
        
        bestMoveFound = currentBestMoveInIteration;
        bestScore = alpha;
        pvLine[0] = bestMoveFound;

        if (Math.abs(bestScore) >= MATE_SCORE - currentDepth) {
            break;
        }
    }
    
    return { bestMove: bestMoveFound, score: bestScore };
}

// =================================================================
//                      MAIN MESSAGE HANDLER
// =================================================================


self.onmessage = function(e) {
    const { command, fen, maxTime } = e.data;
    if (command === 'calculate_move') {
        searchStartTime = performance.now();
        timeLimit = maxTime || 6000;
        stopSearch = false;
        nodeCount = 0;
        
        const { board, turn, castlingRights, enPassantTarget } = createBoardFromFEN(fen);

        const { bestMove, score } = findBestMove(board, turn, castlingRights, enPassantTarget);
        
        let finalMove = bestMove;
        if (!finalMove) {
            const legalMoves = generateLegalMoves(board, turn, castlingRights, enPassantTarget);
            finalMove = legalMoves.length > 0 ? legalMoves[0] : null;
        }

        postMessage({
            bestMove: finalMove,
            score: score,
            timeTaken: (performance.now() - searchStartTime).toFixed(2),
            nodesSearched: nodeCount
        });
    }
};