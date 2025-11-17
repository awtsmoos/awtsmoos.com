
/* B"H */

// =================================================================
//                 THE PROMETHEUS CHESS ENGINE (Mk. III - UNIFIED)
// =================================================================
// This version is structurally refactored to use a single, shared
// helpers file for all core logic, ensuring 100% consistency between
// the book generator and the search engine.

// --- CORE LOGIC AND DATABASE IMPORT ---
importScripts('helpers.js');
importScripts('grandmaster_library.js');
importScripts('punishment_library.js');
/* B"H */




// =================================================================
//                 OPENING BOOK PROCESSING LOGIC
// =================================================================
/* B"H */
// REPLACE the entire opening book section at the top of prometheus_engine.js with this block.

// =================================================================
//                 OPENING BOOK PROCESSING LOGIC
// =================================================================
const openingBook = new Map();
const punishmentBook = new Map();
let lastParsedGame = null
/**
 * This function takes a raw book array (generated from PGN) and processes it
 * into the final, hash-based Map that the engine uses.
 * @param {Array} rawBook - The raw book data from generateRawBook.
 * @param {Map} targetMap - The Map object (openingBook or punishmentBook) to populate.
 */
function processRawBook(rawBook, targetMap) {
    for (const entry of rawBook) {
        if (!entry) continue;
        const fen = entry[0];
        const name = entry[1];
        const hash = calculateZobristHash(createGameState(fen)).toString();
        const bookEntry = targetMap.has(hash) ? targetMap.get(hash) : { name: name, moves: [] };
        
        for (let i = 2; i < entry.length; i++) {
            const newMove = entry[i];
            const moveExists = bookEntry.moves.some(m =>
                m.from[0] === newMove.from[0] && m.from[1] === newMove.from[1] &&
                m.to[0] === newMove.to[0] && m.to[1] === newMove.to[1] &&
                m.promotion === newMove.promotion
            );
            if (!moveExists) {
                bookEntry.moves.push(newMove);
            }
        }
        targetMap.set(hash, bookEntry);
    }
}

function buildBook(sourceArray, targetMap) {
    if (targetMap.size > 0 || typeof sourceArray === 'undefined') return;

    // The raw book is generated on the fly from the source PGNs
    const rawBook = generateRawBook(sourceArray);

    for (const entry of rawBook) {
        if (!entry) continue;
        const fen = entry[0];
        const name = entry[1];
        const hash = calculateZobristHash(createGameState(fen)).toString();
        const bookEntry = targetMap.has(hash) ? targetMap.get(hash) : { name: name, moves: [] };
        
        for (let i = 2; i < entry.length; i++) {
            const newMove = entry[i];
            const moveExists = bookEntry.moves.some(m =>
                m.from[0] === newMove.from[0] && m.from[1] === newMove.from[1] &&
                m.to[0] === newMove.to[0] && m.to[1] === newMove.to[1] &&
                m.promotion === newMove.promotion
            );
            if (!moveExists) {
                bookEntry.moves.push(newMove);
            }
        }
        targetMap.set(hash, bookEntry);
    }
}

function buildOpeningBook() {
    if (openingBook.size > 0 || typeof rawOpeningBook === 'undefined') return;
    for (const entry of rawOpeningBook) {
        if (!entry) continue;
        const fen = entry[0];
        const name = entry[1]; // Extract the opening name
        const hash = calculateZobristHash(createGameState(fen)).toString();

        // The value in our map will be an object: { name: string, moves: Move[] }
        // If the hash already exists, we'll add to its moves but keep the original name.
        const bookEntry = openingBook.has(hash) ? openingBook.get(hash) : { name: name, moves: [] };

        // Add the new moves from this PGN line to the entry
        for (let i = 2; i < entry.length; i++) {
            const newMove = entry[i];
            // Prevent adding duplicate moves if different lines converge on the same position
            const moveExists = bookEntry.moves.some(m =>
                m.from[0] === newMove.from[0] && m.from[1] === newMove.from[1] &&
                m.to[0] === newMove.to[0] && m.to[1] === newMove.to[1] &&
                m.promotion === newMove.promotion
            );
            if (!moveExists) {
                bookEntry.moves.push(newMove);
            }
        }
        openingBook.set(hash, bookEntry);
    }
}


// =================================================================
//                       CONSTANTS & CONFIGURATION
// =================================================================

const MATE_SCORE = 100000;
const MATE_IN_MAX_PLY = 64;
const NULL_MOVE_R = 3;

const Q_MAX_DEPTH = 8; 
const CONTEMPT_FACTOR = -72; // Re-defining the constant here for context
// *** MODIFIED: Added huge incentive for imminent pawn promotion. ***
const PROMOTION_IMMINENT_BONUS = 4000; // Increased to ensure engine sees the guaranteed Queen

// *** NEW: Added a massive bonus for a pawn that is one square away from promoting. ***
let nodeCount = 0;
let searchStartTime, timeLimit;
let stopSearch = false;
let killerMoves, historyTable, transpositionTable, repetitionHistory;
const TT_EXACT = 0, TT_LOWERBOUND = 1, TT_UPPERBOUND = 2;

// Piece-Square Tables
// ====================================================================================
//            REPLACE THE OLD PST CONSTANTS WITH THESE NEW ONES
// ====================================================================================
// These new Piece-Square Tables give much higher bonuses for placing pawns
// and knights in the center, strongly discouraging passive or strange flank moves.

// 
const pawnPST = [[0,0,0,0,0,0,0,0],[50,50,50,50,50,50,50,50],[10,10,20,30,30,20,10,10],[5,5,10,40,40,10,5,5],[0,0,15,50,50,15,0,0],[5,-5,-10,0,0,-10,-5,5],[5,10,10,-25,-25,10,10,5],[0,0,0,0,0,0,0,0]];
// 
const knightPST = [[-50,-40,-30,-30,-30,-30,-40,-50],[-40,-20,0,5,5,0,-20,-40],[-30,5,15,20,20,15,5,-30],[-30,10,20,30,30,20,10,-30],[-30,10,20,30,30,20,10,-30],[-30,5,15,20,20,15,5,-30],[-40,-20,0,5,5,0,-20,-40],[-50,-40,-30,-30,-30,-30,-40,-50]];
const bishopPST = [[-20,-10,-10,-10,-10,-10,-10,-20],[-10,0,0,0,0,0,0,-10],[-10,0,5,10,10,5,0,-10],[-10,5,5,10,10,5,5,-10],[-10,0,10,10,10,10,0,-10],[-10,10,10,10,10,10,10,-10],[-10,5,0,0,0,0,5,-10],[-20,-10,-10,-10,-10,-10,-10,-20]];
// 
const rookPST = [[0,0,0,0,0,0,0,0],[5,10,10,10,10,10,10,5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[0,0,0,5,5,0,0,0]];
// 
const queenPST = [[-20,-10,-10,-5,-5,-10,-10,-20],[-10,0,0,0,0,0,0,-10],[-10,0,5,5,5,5,0,-10],[-5,0,5,5,5,5,0,-5],[0,0,5,5,5,5,0,-5],[-10,5,5,5,5,5,0,-10],[-10,0,5,0,0,0,0,-10],[-20,-10,-10,-5,-5,-10,-10,-20]];
// 
const kingPSTMidGame=[[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-20,-30,-30,-40,-40,-30,-30,-20],[-10,-20,-20,-20,-20,-20,-20,-10],[20,20,0,0,0,0,20,20],[20,30,10,0,0,10,30,20]];
// 
const kingPSTEndGame=[[-50,-40,-30,-20,-20,-30,-40,-50],[-30,-20,-10,0,0,-10,-20,-30],[-30,-10,20,30,30,20,-10,-30],[-30,-10,30,40,40,30,-10,-30],[-30,-10,30,40,40,30,-10,-30],[-30,-10,20,30,30,20,-10,-30],[-30,-30,0,0,0,0,-30,-30],[-50,-30,-30,-30,-30,-30,-30,-50]];


// =================================================================
//                 SEARCH INITIALIZATION HELPER
// =================================================================
// This function sets up all necessary variables for a search.
function initializeSearch(maxTime) {
    searchStartTime = performance.now();
    timeLimit = maxTime || 4000; // Use provided time or default to 4 seconds
    stopSearch = false;
    nodeCount = 0;
    transpositionTable = new Map();
    killerMoves = Array(MATE_IN_MAX_PLY + 1).fill(null).map(() => [null, null]);
    historyTable = Array(12).fill(null).map(() => Array(64).fill(0));
    repetitionHistory = []; // Reset repetition history for the new search
}

// =================================================================
//                 EVALUATION & SEARCH (UNCHANGED)
// =================================================================

// **NEW: TACTICAL MOVE GENERATOR (INCLUDES CHECKS)**
// **CORRECTED AND OPTIMIZED TACTICAL MOVE GENERATOR**
// ====================================================================================
//            Smarter Tactical Move Generation for Quiescence Search
// ====================================================================================
// Now includes checks and direct attacks on valuable pieces to improve tactical vision.





// =================================================================
//                 REVISED EVALUATION & SEARCH (Mk. IV)
// =================================================================

// A simple structure to hold separate midgame and endgame scores for tapered evaluation.
class TaperedScore {
    constructor(mg = 0, eg = 0) {
        this.mg = mg;
        this.eg = eg;
    }
    add(other) {
        this.mg += other.mg;
        this.eg += other.eg;
        return this;
    }
    subtract(other) {
        this.mg -= other.mg;
        this.eg -= other.eg;
        return this;
    }
}

// --- PIECE VALUES (with tapered evaluation) ---
// Piece-Value Tables (Final Conservative Tuning)
const pieceValues = {
    // Increased to ensure pawns are always fought for in the endgame
    p: { mg: 100, eg: 130 }, 
    // Final conservative increase (from 340) to curb "Gambititis"
    n: { mg: 350, eg: 350 }, 
    // Final conservative increase (from 345) to curb "Gambititis"
    b: { mg: 355, eg: 355 }, 
    r: { mg: 500, eg: 500 },
    q: { mg: 900, eg: 900 },
    k: { mg: 20000, eg: 20000 }
};

function getGamePhase(board) {
    const MAX_PHASE = 24; // Standard total phase value
    let currentPhase = 0;
    const phaseValues = { n: 1, b: 1, r: 2, q: 4 };
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (p && phaseValues[p.toLowerCase()]) {
                currentPhase += phaseValues[p.toLowerCase()];
            }
        }
    }
    // Ensure phase doesn't exceed max, then normalize to a 0-1 float
    return Math.min(currentPhase, MAX_PHASE) / MAX_PHASE;
}











// ====================================================================================
//            MASTER EVALUATION HUB & HELPERS (BITBOARD v2.0 - FINAL & COMPLETE)
// ====================================================================================

// --- Bitboard-native version of isSquareAttackedByPiece ---
// This is required for the evaluateThreats function to work.
function isSquareAttackedByPiece(state, targetSq, attackerSq, attackerPieceType, attackerColor) {
    const blockers = state.occupancies[WHITE] | state.occupancies[BLACK];
    switch(attackerPieceType) {
        case P: return (PAWN_ATTACKS[attackerColor][attackerSq] & (1n << BigInt(targetSq))) !== 0n;
        case N: return (KNIGHT_ATTACKS[attackerSq] & (1n << BigInt(targetSq))) !== 0n;
        case B: return (getBishopAttacks(attackerSq, blockers) & (1n << BigInt(targetSq))) !== 0n;
        case R: return (getRookAttacks(attackerSq, blockers) & (1n << BigInt(targetSq))) !== 0n;
        case Q: return (getQueenAttacks(attackerSq, blockers) & (1n << BigInt(targetSq))) !== 0n;
        case K: return (KING_ATTACKS[attackerSq] & (1n << BigInt(targetSq))) !== 0n;
    }
    return false;
}

// ====================================================================================
//            MASTER EVALUATION HUB & HELPERS (BITBOARD v4.0 - FINAL & CORRECT)
// ====================================================================================
function popcount(bb) {
    let count = 0; while (bb > 0n) { bb = popBit(bb); count++; } return count;
}
function getGamePhase(state) {
    const MAX_PHASE = 24; let currentPhase = 0;
    currentPhase += popcount(state.pieceBitboards[N] | state.pieceBitboards[N + 6]) * 1;
    currentPhase += popcount(state.pieceBitboards[B] | state.pieceBitboards[B + 6]) * 1;
    currentPhase += popcount(state.pieceBitboards[R] | state.pieceBitboards[R + 6]) * 2;
    currentPhase += popcount(state.pieceBitboards[Q] | state.pieceBitboards[Q + 6]) * 4;
    return Math.min(currentPhase, MAX_PHASE) / MAX_PHASE;
}
// REPLACE the old evaluate AND evaluateThreats functions in awtsmoos_chess_engine.js with this new block.

function evaluate(state) {
    // --- PERFORMANCE FIX: Generate attack maps ONCE for the entire evaluation ---
    const attackMaps = generateAttackMaps(state);

    const gamePhase = getGamePhase(state);
    let whiteScore = new TaperedScore(), blackScore = new TaperedScore();
    const pieceLists = state.pieceLists;
    const whiteKingSq = pieceLists.K[0], blackKingSq = pieceLists.k[0];
    const whiteKingPos = whiteKingSq !== undefined ? { sq: whiteKingSq, r: Math.floor(whiteKingSq/8), c: whiteKingSq%8} : null;
    const blackKingPos = blackKingSq !== undefined ? { sq: blackKingSq, r: Math.floor(blackKingSq/8), c: blackKingSq%8} : null;

    for (let pieceChar in pieceLists) {
        const isWhite = pieceChar < 'a';
        const scoreTarget = isWhite ? whiteScore : blackScore;
        const pType = pieceChar.toLowerCase();
        const pieceIdx = pieceMap.indexOf(pieceChar);
        for(const sq of pieceLists[pieceChar]) {
            const r = Math.floor(sq/8), c = sq % 8;
            scoreTarget.mg += pieceValues[pType].mg; scoreTarget.eg += pieceValues[pType].eg;
            const pstRow = isWhite ? 7 - r : r;
            const pieceTypeIndex = pieceIdx % 6;
            if (pieceTypeIndex === K) {
                scoreTarget.mg += kingPSTMidGame[pstRow][c]; scoreTarget.eg += kingPSTEndGame[pstRow][c];
            } else {
                const pst = [pawnPST, knightPST, bishopPST, rookPST, queenPST][pieceTypeIndex];
                scoreTarget.mg += pst[pstRow][c]; scoreTarget.eg += pst[pstRow][c];
            }
        }
    }
    const whitePawnFiles = new Set(pieceLists.P.map(sq => sq % 8));
    const blackPawnFiles = new Set(pieceLists.p.map(sq => sq % 8));
    
    whiteScore.add(evaluateStrategicBonuses(state, WHITE, pieceLists, whitePawnFiles, blackPawnFiles, whiteKingPos));
    blackScore.add(evaluateStrategicBonuses(state, BLACK, pieceLists, blackPawnFiles, whitePawnFiles, blackKingPos));
    
    // --- Pass the pre-calculated attack maps to the helper functions ---
    whiteScore.subtract(evaluateThreats(state, WHITE, attackMaps));
    blackScore.subtract(evaluateThreats(state, BLACK, attackMaps));
    
    if(whiteKingPos) whiteScore.subtract(evaluateKingSafety(state, whiteKingPos, BLACK, pieceLists));
    if(blackKingPos) blackScore.subtract(evaluateKingSafety(state, blackKingPos, WHITE, pieceLists));

    const finalWhite = (whiteScore.mg * gamePhase) + (whiteScore.eg * (1 - gamePhase));
    const finalBlack = (blackScore.mg * gamePhase) + (blackScore.eg * (1 - gamePhase));
    const evaluation = Math.round(finalWhite - finalBlack);
    return (state.turn === WHITE ? 1 : -1) * evaluation;
}

function evaluateThreats(state, color, attackMaps) {
    const penalty = new TaperedScore();

    const [ourColor, enemyColor] = (color === WHITE) ? [WHITE, BLACK] : [BLACK, WHITE];
    const enemyAttackMap = (enemyColor === WHITE) ? attackMaps.white : attackMaps.black;
    const enemyPawnAttacks = (enemyColor === WHITE) ? attackMaps.white_pawns : attackMaps.black_pawns;
    
    // Get bitboards for our major and minor pieces
    const ourKnights = state.pieceBitboards[ourColor * 6 + N];
    const ourBishops = state.pieceBitboards[ourColor * 6 + B];
    const ourRooks = state.pieceBitboards[ourColor * 6 + R];
    const ourQueens = state.pieceBitboards[ourColor * 6 + Q];

    // Penalize our pieces being attacked by their pawns (a very significant threat)
    const PAWN_THREAT_PENALTY = 200; // A high, flat penalty for being attacked by a pawn
    penalty.mg += popcount(ourKnights & enemyPawnAttacks) * PAWN_THREAT_PENALTY;
    penalty.mg += popcount(ourBishops & enemyPawnAttacks) * PAWN_THREAT_PENALTY;
    penalty.mg += popcount(ourRooks & enemyPawnAttacks) * 300;
    penalty.mg += popcount(ourQueens & enemyPawnAttacks) * 450;

    // Apply a smaller penalty for any piece being on a square controlled by any enemy piece.
    // This correctly identifies hanging or poorly-placed pieces.
    const HANGING_PIECE_PENALTY = 35; // A smaller, general penalty
    penalty.mg += popcount((ourKnights | ourBishops) & enemyAttackMap) * HANGING_PIECE_PENALTY;
    penalty.mg += popcount(ourRooks & enemyAttackMap) * (HANGING_PIECE_PENALTY + 20);
    penalty.mg += popcount(ourQueens & enemyAttackMap) * (HANGING_PIECE_PENALTY + 40);
    
    return penalty;
}
function evaluateStrategicBonuses(state, color, pieceLists, friendlyPawnFiles, enemyPawnFiles, myKingPos) {
    const score = new TaperedScore(); const isWhite = color === WHITE; const startRank = isWhite ? 7 : 0;
    for (const pawnSq of pieceLists[isWhite ? 'P' : 'p']) {
        const r = Math.floor(pawnSq / 8), c = pawnSq % 8;
        if ((c === 3 || c === 4) && (r === (isWhite ? 4 : 3) || r === (isWhite ? 3 : 4))) score.mg += 45;
    }
    const canCastle = isWhite ? (state.castling & (WKCA | WQCA)) : (state.castling & (BKCA | BQCA));
    if (myKingPos) {
        const kingOnStartSquare = myKingPos.r === startRank && myKingPos.c === 4;
        const hasCastled = myKingPos.r === startRank && (myKingPos.c === 6 || myKingPos.c === 2);
        if (hasCastled) score.add(new TaperedScore(myKingPos.c === 6 ? 90 : 70, 30));
        if (!kingOnStartSquare && !hasCastled && canCastle) score.subtract(new TaperedScore(100, 30));
    }
    for (const sq of pieceLists[isWhite ? 'N' : 'n']) { if (Math.floor(sq/8) !== startRank) score.add(new TaperedScore(30, 15)); }
    for (const sq of pieceLists[isWhite ? 'B' : 'b']) { if (Math.floor(sq/8) !== startRank) score.add(new TaperedScore(30, 15)); }
    if (pieceLists[isWhite ? 'B' : 'b'].length >= 2) score.add(new TaperedScore(85, 110));
    for (const sq of pieceLists[isWhite ? 'R' : 'r']) {
        const r = Math.floor(sq/8), c = sq % 8;
        if (!friendlyPawnFiles.has(c)) score.add(new TaperedScore(enemyPawnFiles.has(c) ? 40 : 25, 20));
        if (r === (isWhite ? 1 : 6)) score.add(new TaperedScore(50, 60));
    }
    const pawnFileCounts = new Map();
    for (const sq of pieceLists[isWhite ? 'P' : 'p']) {
        const c = sq % 8; pawnFileCounts.set(c, (pawnFileCounts.get(c) || 0) + 1);
        if (!friendlyPawnFiles.has(c - 1) && !friendlyPawnFiles.has(c + 1)) score.subtract(new TaperedScore(25, 40));
    }
    for (const count of pawnFileCounts.values()) { if (count > 1) score.subtract(new TaperedScore(20 * (count - 1), 30 * (count - 1))); }
    return score;
}








function evaluateKingSafety(state, kingPos, attackerColor, pieceLists) {
    const danger = new TaperedScore();
    const kingRank = kingPos.r, kingFile = kingPos.c;
    const isAttackerWhite = attackerColor === WHITE;
    const defenderPawnChar = isAttackerWhite ? 'p' : 'P', pawnShieldRank = isAttackerWhite ? 5 : 2;
    if (kingRank === (isAttackerWhite ? 7 : 0)) {
        for (const file of [kingFile - 1, kingFile, kingFile + 1]) {
            if (file < 0 || file > 7) continue;
            let shieldPawnFound = false;
            for (const pawnSq of pieceLists[defenderPawnChar]) {
                const r = Math.floor(pawnSq/8), c = pawnSq % 8;
                if (c === file) { shieldPawnFound = true; if (Math.abs(r - pawnShieldRank) > 1) danger.mg += 25; break; }
            }
            if (!shieldPawnFound) danger.mg += 60;
        }
    }
    let attackWeight = 0; const attackWeights = { q: 10, r: 6, b: 4, n: 4 };
    const attackerChars = isAttackerWhite ? "QRBN" : "qrbn";
    for(const char of attackerChars) {
        for (const attackerSq of pieceLists[char]) {
            const r = Math.floor(attackerSq/8), c = attackerSq % 8;
            const dist = Math.max(Math.abs(r - kingRank), Math.abs(c - kingFile));
            if (dist <= 4) attackWeight += attackWeights[char.toLowerCase()] * (5 - dist);
        }
    }
    danger.mg += Math.pow(attackWeight, 1.5); danger.eg += attackWeight * 2;
    return danger;
}






// ====================================================================================
//            BITBOARD SEARCH, QUIESCENCE & MOVE ORDERING (v3.0 - FINAL)
// ====================================================================================


function orderMoves(moves, state, ply) {
    const moveScores = [];
    const hashMove = transpositionTable.get(state.zobristHash.toString())?.move;

    for(const move of moves) {
        let score = 0;

        // 1. Highest priority: PV/Hash move from Transposition Table
        if (move === hashMove) {
            score = 2000000;
        }
        // 2. Captures, scored by MVV-LVA (Most Valuable Victim - Least Valuable Aggressor)
        else if (getMoveCapture(move)) {
            const attackerType = getMovePiece(move);
            const victimChar = state.board[getMoveTo(move)]; // Victim is what's on the 'to' square
            if(victimChar) {
                 const victimType = pieceMap.indexOf(victimChar) % 6;
                 // Prioritize captures of more valuable pieces by less valuable pieces
                 score = (pieceValues[pieceMap[victimType].toLowerCase()].mg * 10) - pieceValues[pieceMap[attackerType].toLowerCase()].mg;
            }
            score += 1000000; // All captures are better than quiet moves
        }
        // 3. Killer Moves (quiet moves that caused cutoffs)
        else {
            if (killerMoves[ply][0] === move) {
                score = 900000;
            } else if (killerMoves[ply][1] === move) {
                score = 850000;
            }
            // 4. History Heuristic (quiet moves that have been good elsewhere)
            else {
                score = historyTable[getMovePiece(move) + (state.turn * 6)][getMoveTo(move)];
            }
        }
        
        // Promotions get a huge bonus
        if (getMovePromoted(move)) {
             score += pieceValues['q'].mg * 100;
        }

        moveScores.push({ move, score });
    }
    // Sort moves from highest score to lowest
    return moveScores.sort((a,b) => b.score - a.score).map(ms => ms.move);
}


function quiesce(state, alpha, beta) {
    nodeCount++;
    if ((nodeCount & 2047) === 0 && performance.now() - searchStartTime > timeLimit) {
        stopSearch = true;
    }
    if (stopSearch) return 0;

    const stand_pat = evaluate(state);
    if (stand_pat >= beta) return beta;
    if (alpha < stand_pat) alpha = stand_pat;

    // --- THE FINAL PERFORMANCE FIX: Call the specialized tactical move generator ---
    const moves = generateTacticalMoves(state);
    const orderedMoves = orderMoves(moves, state, 0);

    for (const move of orderedMoves) {
        // No need to filter here anymore, as the list only contains tactical moves.
        const unmakeInfo = makeMove(state, move);
        
        const kingSq = getLSBIndex(state.pieceBitboards[(state.turn ^ 1) * 6 + K]);
        if (isSquareAttacked_lean(state, kingSq, state.turn)) {
            unmakeMove(state, unmakeInfo);
            continue;
        }

        const score = -quiesce(state, -beta, -alpha);
        unmakeMove(state, unmakeInfo);
        if (stopSearch) return 0;

        if (score >= beta) return beta;
        if (score > alpha) alpha = score;
    }
    return alpha;
}


function search(state, depth, alpha, beta, ply) {
    if (depth <= 0) {
        return quiesce(state, alpha, beta);
    }

    nodeCount++;
    if ((nodeCount & 2047) === 0 && performance.now() - searchStartTime > timeLimit) {
        stopSearch = true;
    }
    if (stopSearch) return 0;
    
    if (ply > 0) { // Repetition check
        for (let i = moveStackPtr - 2; i >= 0; i -= 2) {
            if (moveStack[i].zobristHash === state.zobristHash) return CONTEMPT_FACTOR;
        }
    }

    const ttEntry = transpositionTable.get(state.zobristHash.toString());
    if (ply > 0 && ttEntry && ttEntry.depth >= depth) {
        if (ttEntry.flag === TT_EXACT) return ttEntry.score;
        if (ttEntry.flag === TT_LOWERBOUND) alpha = Math.max(alpha, ttEntry.score);
        else if (ttEntry.flag === TT_UPPERBOUND) beta = Math.min(beta, ttEntry.score);
        if (alpha >= beta) return ttEntry.score;
    }

    const moves = generateMoves(state);
    const orderedMoves = orderMoves(moves, state, ply);
    
    let legalMovesFound = 0;
    let bestScore = -Infinity;
    let ttFlag = TT_UPPERBOUND;
    let bestMoveForNode = 0;

    for (const move of orderedMoves) {
        const unmakeInfo = makeMove(state, move);
        
        // --- PERFORMANCE FIX: Use the lean check inside the main search loop ---
        const kingSq = getLSBIndex(state.pieceBitboards[(state.turn ^ 1) * 6 + K]);
        if (isSquareAttacked_lean(state, kingSq, state.turn)) {
            unmakeMove(state, unmakeInfo);
            continue;
        }
        legalMovesFound++;

        let score;
        if (legalMovesFound === 1) {
            score = -search(state, depth - 1, -beta, -alpha, ply + 1);
        } else {
            score = -search(state, depth - 1, -alpha - 1, -alpha, ply + 1);
            if (score > alpha && score < beta) {
                score = -search(state, depth - 1, -beta, -alpha, ply + 1);
            }
        }

        unmakeMove(state, unmakeInfo);
        if (stopSearch) return 0;

        if (score > bestScore) {
            bestScore = score;
            bestMoveForNode = move;
        }

        if (bestScore > alpha) {
            ttFlag = TT_EXACT;
            alpha = bestScore;
        }

        if (alpha >= beta) {
            if (!getMoveCapture(move)) {
                killerMoves[ply][1] = killerMoves[ply][0];
                killerMoves[ply][0] = move;
                historyTable[getMovePiece(move) + ((state.turn^1) * 6)][getMoveTo(move)] += depth * depth;
            }
            transpositionTable.set(state.zobristHash.toString(), { score: beta, depth: depth, flag: TT_LOWERBOUND, move: move });
            return beta;
        }
    }

    if (legalMovesFound === 0) {
        const kingInCheck = isSquareAttacked_lean(state, getLSBIndex(state.pieceBitboards[state.turn * 6 + K]), state.turn ^ 1);
        return kingInCheck ? -MATE_SCORE + ply : 0;
    }

    transpositionTable.set(state.zobristHash.toString(), { score: bestScore, depth: depth, flag: ttFlag, move: bestMoveForNode });
    return bestScore;
}


function searchRoot(initialState, maxDepth, maxTime) {
    initializeSearch(maxTime); // Replaces individual variable resets
    
    let bestMove = 0;
    let bestScore = -Infinity;

    for (let currentDepth = 1; currentDepth <= maxDepth; currentDepth++) {
        const moves = generateMoves(initialState);
        const orderedMoves = orderMoves(moves, initialState, 0); // Root is ply 0

        if(orderedMoves.length === 0) break;

        let alpha = -Infinity;
        let beta = Infinity;
        let legalMovesSearched = 0;
        
        for (const move of orderedMoves) {
            const unmakeInfo = makeMove(initialState, move);
            const kingSq = getLSBIndex(initialState.pieceBitboards[(initialState.turn ^ 1) * 6 + K]);

            if (isSquareAttacked(initialState, kingSq, initialState.turn)) {
                unmakeMove(initialState, unmakeInfo);
                continue;
            }
            legalMovesSearched++;

            const score = -search(initialState, currentDepth - 1, -beta, -alpha, 1);
            unmakeMove(initialState, unmakeInfo);

            if (stopSearch) break;

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
                
                // In PVS, alpha is updated inside the loop
                if (score > alpha) {
                    alpha = score;
                }
            }
        }
        
        if (stopSearch || legalMovesSearched === 0) {
            break;
        }

        // Check for mate
        if (Math.abs(bestScore) > MATE_SCORE - MATE_IN_MAX_PLY) {
            const mateIn = (MATE_SCORE - Math.abs(bestScore) + 1) / 2;
            console.log(`Mate in ${mateIn} found at depth ${currentDepth}.`);
            break; 
        }
    }

    return { bestMove, score: bestScore };
}





let perftNodeCount = 0;

function perft(state, depth) {
    if (depth === 0) {
        perftNodeCount++;
        return;
    }

    const moves = generateLegalMoves(state);
    for (const move of moves) {
        const unmakeInfo = makeMove(state, move);
        perft(state, depth - 1);
        unmakeMove(state, unmakeInfo);
    }
}

// A helper to run the test and log the results.
function runPerftTest(fen, depth) {
    console.log(`Starting Perft Test for FEN: "${fen}" at depth ${depth}`);
    const state = createGameState(fen);
    perftNodeCount = 0;
    const startTime = performance.now();
    perft(state, depth);
    const endTime = performance.now();
    const duration = (endTime - startTime).toFixed(2);
    const nps = (perftNodeCount / (duration / 1000)).toFixed(0);
    console.log(`Perft Test Complete.`);
    console.log(`Result: ${perftNodeCount} nodes found.`);
    console.log(`Time: ${duration}ms`);
    console.log(`Speed: ${nps} nodes/sec`);
    return perftNodeCount;
}
var tested=1


let DEBUG_MODE = true;
/* B"H */

// =================================================================
//              MAIN WORKER DRIVER (BITBOARD v2.0 - VERIFIED)
// =================================================================

let isInitialized = false;

function initializeEngine() {
    if (isInitialized) return;
    console.log("Prometheus Engine (Bitboard): Initialization started.");
    initializeAll();

    const rawMainBook = generateRawBook(sourceBook);
    processRawBook(rawMainBook, openingBook);
    const rawPunishBook = generateRawBook(punishmentBookSource);
    processRawBook(rawPunishBook, punishmentBook);

    isInitialized = true;
    console.log("Prometheus Engine Initialized Successfully.");
    console.log(`Mainline Openings Loaded: ${openingBook.size}`);
    console.log(`Punishment Lines Loaded: ${punishmentBook.size}`);
    
    self.postMessage({ type: 'initialization_complete' });
}

// IN prometheus_engine.js, REPLACE decodeMove and self.onmessage:

function decodeMove(move, turn) {
    const from = getMoveFrom(move);
    const to = getMoveTo(move);
    const promoted = getMovePromoted(move);
    return {
        from: [Math.floor(from / 8), from % 8],
        to: [Math.floor(to / 8), to % 8],
        promotion: promoted ? pieceMap[promoted + (turn === BLACK ? 6 : 0)] : null
    };
}

self.onmessage = function(e) {
    const { command } = e.data;
    switch (command) {
        case 'initialize':
            initializeEngine();
            break;
        case 'calculate_move': {
            if (!isInitialized) { initializeEngine(); }
            const { fen, maxTime } = e.data;
            let state = createGameState(fen);
            
            const hash = state.zobristHash.toString();
            const bookEntry = openingBook.get(hash) || punishmentBook.get(hash);

            if (bookEntry && bookEntry.moves.length > 0) {
                const randomMove = bookEntry.moves[Math.floor(Math.random() * bookEntry.moves.length)];
                postMessage({ type: 'move_result', bestMove: randomMove, score: `Book Move: ${bookEntry.name}`, timeTaken: 0, nodesSearched: 0 });
                return;
            }

            const searchResult = searchRoot(state, 99, maxTime || 4200);
            
            postMessage({
                type: 'move_result',
                bestMove: searchResult.bestMove ? decodeMove(searchResult.bestMove, state.turn) : null,
                score: searchResult.score,
                timeTaken: (performance.now() - searchStartTime).toFixed(2),
                nodesSearched: nodeCount
            });
            break;
        }
        case 'analyze_pgn': {
            const { pgnText } = e.data;
            const converter = new PgnConverter();
            const movesSAN = pgnText.replace(/\[.*?\]\s*|{.*?}|\d+\.\s*|\$\d+/g, '').replace(/\s+/g, ' ').trim().split(' ');
            const validatedMoves = [];
            const boardHistory = [converter.toFen()];

            for (const san of movesSAN) {
                if (!san || ['1-0', '0-1', '1/2-1/2', '*'].includes(san)) continue;
                const move = converter.parseSan(san);
                if (move == null) {
                    postMessage({ type: 'analysis_error', message: `Invalid PGN: Could not parse move "${san}"` });
                    return;
                }
                const decodedMove = decodeMove(move, converter.currentState.turn);
                converter.applyMove(move);
                decodedMove.san = san;
                validatedMoves.push(decodedMove);
                boardHistory.push(converter.toFen());
            }

            lastParsedGame = { moves: validatedMoves, boardHistory, initialFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", openingNames: [] };
            postMessage({ type: 'analysis_result', ...lastParsedGame });
            break;
        }
        case 'run_engine_analysis': {
            if (!lastParsedGame) break;
            console.log("Starting bitboard game analysis...");
            const { moves, initialFen } = lastParsedGame;
            let state = createGameState(initialFen);

            const ANALYSIS_THINKING_TIME = 3000;
            const BEST_MOVE_TOLERANCE = 40, MISTAKE_THRESHOLD = 90, BLUNDER_THRESHOLD = 250;

            for (let i = 0; i < moves.length; i++) {
                const actualMoveObj = moves[i];
                moveStackPtr = 0;
                
                const legalMoves = generateMoves(state);
                const actualMoveInt = legalMoves.find(m => {
                    const from = getMoveFrom(m), to = getMoveTo(m);
                    return (Math.floor(from/8) === actualMoveObj.from[0] && from%8 === actualMoveObj.from[1] &&
                            Math.floor(to/8) === actualMoveObj.to[0] && to%8 === actualMoveObj.to[1]);
                });
                
                if (actualMoveInt === undefined) {
                    console.error("Could not match played move to a legal move!", actualMoveObj);
                    if (legalMoves.length > 0) makeMove(state, legalMoves[0]);
                    continue;
                }

                let classification = 'best';
                const searchResult = searchRoot(state, 99, ANALYSIS_THINKING_TIME);
                let bestMoveFound = searchResult.bestMove;

                if (bestMoveFound !== actualMoveInt) {
                    const bestMoveEval = searchResult.score;
                    moveStackPtr = 0;
                    makeMove(state, actualMoveInt);
                    const scoreForUserMove = -searchRoot(state, 99, ANALYSIS_THINKING_TIME).score;
                    unmakeMove(state);
                    const evalDrop = bestMoveEval - scoreForUserMove;
                    if (evalDrop > BLUNDER_THRESHOLD) classification = 'blunder';
                    else if (evalDrop > MISTAKE_THRESHOLD) classification = 'mistake';
                    else if (evalDrop > BEST_MOVE_TOLERANCE) classification = 'good';
                }
                
                self.postMessage({
                    type: 'analysis_update',
                    index: i,
                    result: {
                        classification: classification,
                        bestMove: decodeMove(bestMoveFound, state.turn)
                    }
                });
                makeMove(state, actualMoveInt);
            }
            self.postMessage({ type: 'analysis_finished' });
            break;
        }
    }
};


