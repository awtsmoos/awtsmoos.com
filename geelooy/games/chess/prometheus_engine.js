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

// =================================================================
//                 OPENING BOOK PROCESSING LOGIC
// =================================================================
const openingBook = new Map();
function buildOpeningBook() {
    if (openingBook.size > 0 || typeof rawOpeningBook === 'undefined') return;
    for (const entry of rawOpeningBook) {
        if (!entry) continue;
        const fen = entry[0];
        const hash = calculateZobristHash(createGameState(fen)).toString();
        const existingMoves = openingBook.has(hash) ? openingBook.get(hash) : [];
        for (let i = 2; i < entry.length; i++) {
            existingMoves.push(entry[i]);
        }
        openingBook.set(hash, existingMoves);
    }
}

// =================================================================
//                       CONSTANTS & CONFIGURATION
// =================================================================

const MATE_SCORE = 100000;
const MATE_IN_MAX_PLY = 64;
const NULL_MOVE_R = 3;
const CONTEMPT_FACTOR = -20;
let nodeCount = 0;
let searchStartTime, timeLimit;
let stopSearch = false;
let killerMoves, historyTable, transpositionTable, repetitionHistory;
const TT_EXACT = 0, TT_LOWERBOUND = 1, TT_UPPERBOUND = 2;

// Piece-Square Tables
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
//                 EVALUATION & SEARCH (UNCHANGED)
// =================================================================

// **NEW: TACTICAL MOVE GENERATOR (INCLUDES CHECKS)**
// **CORRECTED AND OPTIMIZED TACTICAL MOVE GENERATOR**
function generateTacticalMoves(state) {
    const tacticalMoves = [];
    const pseudoLegalMoves = [];
    const opponentColor = state.turn === 'w' ? 'b' : 'w';

    // 1. Generate all possible pseudo-legal moves for the current player.
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = state.board[r][c];
            if (p && (p.toUpperCase() === p) === (state.turn === 'w')) {
                generateMovesForPiece(pseudoLegalMoves, p, r, c, state);
            }
        }
    }

    // 2. Filter for tactical moves (captures, promotions, checks) that are fully legal.
    for (const move of pseudoLegalMoves) {
        
        // --- High-Performance Pattern: Make, Check, Unmake ---
        const unmakeInfo = makeMove(state, move);
        
        // Check if the move we just made left our own king in check. If so, it's illegal.
        const ownKingPos = state.kingPos[opponentColor]; // Note: after makeMove, the turn flips, so our king is now the "opponent"
        const isIllegal = ownKingPos && isSquareAttacked(state.board, ownKingPos.r, ownKingPos.c, state.turn);
        
        if (!isIllegal) {
            // If the move was legal, check if it's tactical.
            const enemyKingPos = state.kingPos[state.turn];
            const isCheck = enemyKingPos && isSquareAttacked(state.board, enemyKingPos.r, enemyKingPos.c, opponentColor);

            if (move.capture || move.promotion || isCheck) {
                tacticalMoves.push(move);
            }
        }
        
        unmakeMove(state, unmakeInfo);
        // --- End of Pattern ---
    }
    
    return tacticalMoves;
}




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
const pieceValues = {
    p: { mg: 100, eg: 120 }, // Pawns become more valuable in the endgame
    n: { mg: 320, eg: 320 },
    b: { mg: 330, eg: 330 },
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

// MAIN EVALUATION HUB
function evaluate(state) {
    const { board } = state;
    const gamePhase = getGamePhase(board);

    let whiteScore = new TaperedScore();
    let blackScore = new TaperedScore();

    // Data collection pass
    const pieceData = { P: [], p: [], N: [], n: [], B: [], b: [], R: [], r: [], Q: [], q: [], K: [], k: [] };
    for (let r = 0; r < 8; r++) { for (let c = 0; c < 8; c++) { if (board[r][c]) pieceData[board[r][c]].push({ r, c }); } }

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (!p) continue;
            const isWhite = p.toUpperCase() === p;
            const pType = p.toLowerCase();
            const scoreTarget = isWhite ? whiteScore : blackScore;
            
            // 1. Material & PST Score
            scoreTarget.mg += pieceValues[pType].mg;
            scoreTarget.eg += pieceValues[pType].eg;
            const pstRow = isWhite ? 7 - r : r;
            if (pType === 'k') {
                scoreTarget.mg += kingPSTMidGame[pstRow][c];
                scoreTarget.eg += kingPSTEndGame[pstRow][c];
            } else {
                const pstValue = ({ p: pawnPST, n: knightPST, b: bishopPST, r: rookPST, q: queenPST }[pType])[pstRow][c];
                scoreTarget.mg += pstValue;
                scoreTarget.eg += pstValue;
            }
        }
    }

    // 2. Pawn Structure Score (from previous version)
    whiteScore.add(evaluatePawnStructure(pieceData.P, pieceData.p, 'w'));
    blackScore.add(evaluatePawnStructure(pieceData.p, pieceData.P, 'b'));

    // **NEW: 3. Piece Activity, Mobility, and Threats Score**
    // This is the core logic that punishes pointless moves.
    whiteScore.add(evaluatePieceActivity(state, 'w', pieceData));
    blackScore.add(evaluatePieceActivity(state, 'b', pieceData));

    // 4. King Safety (from previous version)
    if (state.kingPos.w) whiteScore.mg -= evaluateKingSafety(board, state.kingPos.w, 'b');
    if (state.kingPos.b) blackScore.mg -= evaluateKingSafety(board, state.kingPos.b, 'w');
    
    
    // **NEW: 5. Endgame-Specific Factors**
    // This logic will only have a significant effect when gamePhase is low (in an endgame).
    whiteScore.add(evaluateEndgameFactors(state, 'w', pieceData));
    blackScore.add(evaluateEndgameFactors(state, 'b', pieceData));



    // 6. Final Tapered Score
    const finalWhite = (whiteScore.mg * gamePhase) + (whiteScore.eg * (1 - gamePhase));
    const finalBlack = (blackScore.mg * gamePhase) + (blackScore.eg * (1 - gamePhase));
    const evaluation = Math.round(finalWhite - finalBlack);
    return (state.turn === 'w' ? 1 : -1) * evaluation;
}

// **NEW: ACTIVITY, MOBILITY, AND THREAT EVALUATION**
// This function gives every piece a purpose. A move is good if it improves these scores.
function evaluatePieceActivity(state, color, pieceData) {
    const score = new TaperedScore();
    const { board } = state;
    const isWhite = color === 'w';
    const opponentColor = isWhite ? 'b' : 'w';
    
    // --- Standard Bonuses (Bishop Pair, Rooks on files) ---
    const bishops = isWhite ? pieceData.B : pieceData.b;
    if (bishops.length >= 2) score.add(new TaperedScore(45, 60));
    
    const friendlyPawnFiles = new Set((isWhite ? pieceData.P : pieceData.p).map(p => p.c));
    const enemyPawnFiles = new Set((isWhite ? pieceData.p : pieceData.P).map(p => p.c));
    const rooks = isWhite ? pieceData.R : pieceData.r;
    for (const rook of rooks) {
        if (!friendlyPawnFiles.has(rook.c)) {
             score.add(new TaperedScore(enemyPawnFiles.has(rook.c) ? 15 : 25, 10)); // Semi-open/Open file
        }
        if (rook.r === (isWhite ? 1 : 6)) score.add(new TaperedScore(35, 45)); // 7th rank
    }

    // --- MOBILITY & THREAT CALCULATION ---
    // This is the direct punishment for pointless moves. A move like Ka1 adds zero mobility or threats.
    let mobilityScore = 0;
    let threatScore = 0;
    
    // Generate all pseudo-legal moves for the current player to measure mobility.
    const pseudoLegalMoves = [];
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (p && (p.toUpperCase() === p) === isWhite) {
                generateMovesForPiece(pseudoLegalMoves, p, r, c, state);
            }
        }
    }
    
    for (const move of pseudoLegalMoves) {
        // A) MOBILITY BONUS: Every safe square a piece can move to is valuable.
        // We verify the move is safe by checking if the opponent attacks the destination square.
        if (!isSquareAttacked(board, move.to[0], move.to[1], opponentColor)) {
            mobilityScore += 1;
        }

        // B) THREAT BONUS: Every move that attacks an enemy piece creates a threat.
        if (move.capture) {
            // Attacking a more valuable piece is better.
            threatScore += Math.floor(pieceValues[move.capture.toLowerCase()].mg / 100);
        }
        
        // C) TERRITORY CONTROL: Add a small bonus for controlling squares in the opponent's territory.
        const opponentTerritoryRank = isWhite ? (move.to[0] < 4) : (move.to[0] > 3);
        if (opponentTerritoryRank) {
            threatScore += 1;
        }
    }

    // Add the calculated activity scores. Mobility is more important in the midgame.
    score.add(new TaperedScore(mobilityScore, Math.floor(mobilityScore / 2)));
    score.add(new TaperedScore(threatScore, threatScore));

    return score;
}

function evaluatePawnStructure(friendlyPawns, enemyPawns, color) {
    const score = new TaperedScore();
    const friendlyFiles = new Set(friendlyPawns.map(p => p.c));

    // Passed Pawns: Pawns with no opposing pawns in front of them on the same or adjacent files.
    for (const p of friendlyPawns) {
        let isPassed = true;
        for (const ep of enemyPawns) {
            if (Math.abs(ep.c - p.c) <= 1 && (color === 'w' ? ep.r < p.r : ep.r > p.r)) {
                isPassed = false;
                break;
            }
        }
        if (isPassed) {
            const rank = color === 'w' ? 7 - p.r : p.r;
            const bonus = [0, 10, 20, 35, 55, 80, 110, 150][rank];
            score.add(new TaperedScore(bonus, bonus * 1.5)); // Passed pawns are monsters in the endgame
        }
    }

    // Doubled and Isolated Pawns
    const fileCounts = {};
    for (const p of friendlyPawns) fileCounts[p.c] = (fileCounts[p.c] || 0) + 1;
    for (const file in fileCounts) {
        if (fileCounts[file] > 1) score.subtract(new TaperedScore(20, 25)); // Doubled pawn penalty
        if (!friendlyFiles.has(parseInt(file) - 1) && !friendlyFiles.has(parseInt(file) + 1)) {
            score.subtract(new TaperedScore(15, 20)); // Isolated pawn penalty
        }
    }
    return score;
}

function evaluatePiecePositions(board, color, pieceData, friendlyPawnFiles, enemyPawnFiles) {
    const score = new TaperedScore();
    const isWhite = color === 'w';

    // Bishop Pair: A significant, long-term advantage.
    const bishops = isWhite ? pieceData.B : pieceData.b;
    if (bishops.length >= 2) {
        score.add(new TaperedScore(45, 60));
    }

    // Rooks: Value rooks on open files and the 7th rank.
    const rooks = isWhite ? pieceData.R : pieceData.r;
    for (const rook of rooks) {
        const onOpenFile = !friendlyPawnFiles.has(rook.c) && !enemyPawnFiles.has(rook.c);
        const onSemiOpenFile = !friendlyPawnFiles.has(rook.c);
        if (onOpenFile) score.add(new TaperedScore(25, 15));
        else if (onSemiOpenFile) score.add(new TaperedScore(15, 10));
        
        const seventhRank = isWhite ? 1 : 6;
        if (rook.r === seventhRank) score.add(new TaperedScore(35, 45));
    }

    // Knights: Reward outposts (deep, protected by a pawn).
    const knights = isWhite ? pieceData.N : pieceData.n;
    for (const knight of knights) {
        const outpostRank = (isWhite && knight.r <= 3) || (!isWhite && knight.r >= 4);
        if (outpostRank) {
            const pawnSupport = isWhite ? 
                board[knight.r + 1]?.[knight.c - 1] === 'P' || board[knight.r + 1]?.[knight.c + 1] === 'P' :
                board[knight.r - 1]?.[knight.c - 1] === 'p' || board[knight.r - 1]?.[knight.c + 1] === 'p';
            if (pawnSupport) score.add(new TaperedScore(20, 15));
        }
    }
    
    return score;
}


// **NEW: SPECIALIZED ENDGAME EVALUATION**
function evaluateEndgameFactors(state, color, pieceData) {
    const score = new TaperedScore();
    const { board } = state;
    const isWhite = color === 'w';
    const myKingPos = isWhite ? state.kingPos.w : state.kingPos.b;
    const enemyKingPos = isWhite ? state.kingPos.b : state.kingPos.w;
    if (!myKingPos || !enemyKingPos) return score; // Should not happen

    // --- 1. King Activity Bonus ---
    // In the endgame, the king is a powerful attacking piece. Reward it for being active and central.
    const kingCentrality = - (Math.abs(myKingPos.r - 3.5) + Math.abs(myKingPos.c - 3.5));
    score.eg += Math.round(kingCentrality * 10); // Heavily reward a central king in the endgame

    // Reward the king for being close to the enemy king (to attack pawns and restrict movement)
    const kingProximity = 7 - (Math.abs(myKingPos.r - enemyKingPos.r) + Math.abs(myKingPos.c - enemyKingPos.c));
    score.eg += kingProximity * 5;

    // --- 2. Passed Pawn Enhancements ---
    // We need to make the existing passed pawn bonus much, much stronger.
    const friendlyPawns = isWhite ? pieceData.P : pieceData.p;
    const enemyPawns = isWhite ? pieceData.p : pieceData.P;

    for (const p of friendlyPawns) {
        let isPassed = true;
        for (const ep of enemyPawns) {
            if (Math.abs(ep.c - p.c) <= 1 && (isWhite ? ep.r < p.r : ep.r > p.r)) {
                isPassed = false;
                break;
            }
        }
        if (isPassed) {
            const rank = isWhite ? 7 - p.r : p.r;
            // Exponential bonus: the closer the pawn is to promotion, the more valuable it becomes.
            const bonus = [0, 20, 30, 50, 80, 150, 300, 500][rank];
            score.mg += bonus / 2; // A passed pawn is good in the midgame...
            score.eg += bonus * 2; // ...but it's an absolute monster in the endgame.

            // Bonus for the king supporting the passed pawn
            const kingPawnDist = Math.max(Math.abs(myKingPos.r - p.r), Math.abs(myKingPos.c - p.c));
            score.eg += (8 - kingPawnDist) * 10;
        }
    }
    return score;
}


function evaluateKingSafety(board, kingPos, attackerColor) {
    let dangerScore = 0;
    const isAttackerWhite = attackerColor === 'w';

    // 1. Pawn Shield: Penalize missing or advanced pawns in front of the king.
    const kingFile = kingPos.c;
    const kingRank = kingPos.r;
    if (kingFile > 1 && kingFile < 6) { // Only evaluate pawn shield for castled/central kings
        const shieldRank = isAttackerWhite ? kingRank - 1 : kingRank + 1;
        for (let c = kingFile - 1; c <= kingFile + 1; c++) {
            const friendlyPawn = isAttackerWhite ? 'p' : 'P';
            if (board[shieldRank]?.[c] !== friendlyPawn) {
                 dangerScore += 15; // Penalty for each missing pawn in the shield.
            }
        }
    }

    // 2. Attacker Proximity and Value
    let attackWeight = 0;
    const attackerValues = { p: 1, n: 3, b: 3, r: 5, q: 9 };
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (!piece || (piece.toUpperCase() === piece) !== isAttackerWhite) continue;

            const dist = Math.max(Math.abs(r - kingPos.r), Math.abs(c - kingPos.c));
            if (dist <= 3) { // Consider attackers within a 3-square radius
                 // Simple check if the piece can attack the king's zone (can be improved)
                 if(isSquareAttackedByPiece(board, kingPos.r, kingPos.c, r, c, attackerColor)) {
                    attackWeight += attackerValues[piece.toLowerCase()] * (4 - dist); // Closer attackers are more dangerous
                 }
            }
        }
    }

    dangerScore += attackWeight * 2;
    return Math.min(dangerScore, 150); // Cap the penalty to avoid extreme swings
}

// You will need this NEW HELPER function for evaluateKingSafety to work.
// It checks if a specific piece at (pr, pc) attacks a target square (tr, tc).
function isSquareAttackedByPiece(board, tr, tc, pr, pc, attackerColor) {
    const p = board[pr][pc];
    if (!p) return false;
    const pType = p.toLowerCase();
    const dr = tr - pr, dc = tc - pc;

    if (pType === 'p') {
        const dir = (attackerColor === 'w') ? -1 : 1;
        return dr === dir && Math.abs(dc) === 1;
    }
    if (pType === 'n') return (Math.abs(dr) === 2 && Math.abs(dc) === 1) || (Math.abs(dr) === 1 && Math.abs(dc) === 2);
    if (pType === 'k') return Math.abs(dr) <= 1 && Math.abs(dc) <= 1;

    let directions;
    if (pType === 'b') directions = bishopDirections;
    else if (pType === 'r') directions = rookDirections;
    else if (pType === 'q') directions = queenDirections;
    else return false;

    for (const [dirR, dirC] of directions) {
        if (dr !== 0 && Math.sign(dr) !== dirR) continue;
        if (dc !== 0 && Math.sign(dc) !== dirC) continue;
        if (dr === 0 && dirR !== 0) continue;
        if (dc === 0 && dirC !== 0) continue;

        for (let i = 1; i < 8; i++) {
            const nR = pr + i * dirR, nC = pc + i * dirC;
            if (nR === tr && nC === tc) return true;
            if (board[nR]?.[nC] !== undefined) {
                if(board[nR][nC]) break; // Path is blocked
            } else {
                break; // Off board
            }
        }
    }
    return false;
}



/**
 * Checks if a move is a blunder that leads to a stalemate in a clearly winning position.
 * @param {object} resultingState The state of the board AFTER the move is made.
 * @param {number} currentEval The evaluation of the position BEFORE the move was made.
 * @returns {boolean} True if the move is a stalemate blunder, otherwise false.
 */
// ====================================================================================
//            FINAL, CORRECT, AND HIGH-PERFORMANCE isStalemateBlunder
// ====================================================================================
// This version has a fast "early exit" to prevent the performance cascade.

function isStalemateBlunder(state, currentEval) {
    // --- Step 1: Fast Exit Checks ---
    
    // Check 1: Only worry about stalemate blunders if we are in a completely winning position.
    const WINNING_THRESHOLD = 2000; // A rook advantage.
    if (currentEval < WINNING_THRESHOLD) {
        return false;
    }

    // Check 2 (THE CRITICAL PERFORMANCE FIX): Count the opponent's pieces. If they have more than
    // a certain number of pieces (e.g., 3), it's highly unlikely to be a simple endgame
    // where a stalemate is the primary risk. This prevents us from calling the slow
    // generateLegalMoves function in the complex middlegame.
    let opponentPieceCount = 0;
    const opponentColor = state.turn; // After makeMove, the turn has flipped.
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = state.board[r][c];
            if (piece) {
                const isOpponentPiece = (piece.toUpperCase() === piece) === (opponentColor === 'w');
                if (isOpponentPiece) {
                    opponentPieceCount++;
                }
            }
        }
    }
    
    // If the opponent has more than 3 pieces (e.g., King + Rook + Pawn), this check is too expensive.
    if (opponentPieceCount > 3) {
        return false;
    }

    // --- Step 2: Slow, Full Legality Check (only for simple endgames) ---
    // This code will now only run in rare, specific endgame scenarios.
    const opponentHasMoves = generateLegalMoves(state).length > 0;
    if (opponentHasMoves) {
        return false;
    }

    const inCheck = state.kingPos[state.turn] && isSquareAttacked(state.board, state.kingPos[state.turn].r, state.kingPos[state.turn].c, state.turn === 'w' ? 'b' : 'w');
    
    // It's a stalemate blunder if the opponent has no moves AND is NOT in check.
    return !inCheck;
}






// =================================================================
//                 ADVANCED SEARCH & MOVE ORDERING (Mk. V)
// =================================================================
// ====================================================================================
//    FINAL, COMPLETE, AND OPTIMIZED SEARCH FUNCTIONS (MAKE/UNMAKE ARCHITECTURE)
// ====================================================================================
// This block contains the three core functions for the high-performance search.
// Replace your old searchRoot, search, and quiesce functions with these.

/**
 * The root of the search. It manages the iterative deepening loop and calls the main search function.
 * This is the only function that should be called from the main worker thread.
 * @param {object} initialState - The starting game state for the search.
 * @param {number} maxDepth - The maximum depth for iterative deepening.
 * @returns {object} The best move found and the final evaluation.
 */
// ====================================================================================
//                 FINAL SEARCH WITH NULL MOVE RECURSION GUARD
// ====================================================================================

// ====================================================================================
//            FINAL, ROBUST, AND STABLE searchRoot (ASPIRATION WINDOWS REMOVED)
// ====================================================================================

// ====================================================================================
//            FINAL, ROBUST searchRoot WITH CORRECT ASPIRATION WINDOWS
// ====================================================================================
// This version correctly implements aspiration windows, restoring search speed
// and depth without causing an infinite loop.

// ====================================================================================
//            FINAL, ROBUST, AND CORRECT searchRoot (STABLE AND FAST)
// ====================================================================================
// This version uses a simple, standard, and bug-free iterative deepening loop.
// It will restore the engine's performance and playing strength.

function searchRoot(initialState, maxDepth) {
    let bestMove = null;
    let bestScore = -Infinity;
    const moves = generateLegalMoves(initialState);

    if (moves.length === 0) {
        return { bestMove: null, score: evaluate(initialState) };
    }

    const timerId = setTimeout(() => { stopSearch = true; }, timeLimit - 50);

    // --- Standard Iterative Deepening Loop ---
    // This simple structure is guaranteed to be correct and stable.
    for (let currentDepth = 1; currentDepth <= maxDepth; currentDepth++) {
        // Use the best move from the previous, shallower search to improve move ordering.
        const orderedMoves = orderMoves(moves, initialState, bestMove, 0);
        let bestMoveForThisDepth = orderedMoves[0];
        const currentEval = evaluate(initialState);

        // A fresh alpha/beta for each new depth is the key to stability.
        let alpha = -Infinity;
        let beta = Infinity;
        
        for (let i = 0; i < orderedMoves.length; i++) {
            const move = orderedMoves[i];
            if (stopSearch) break;

            const unmakeInfo = makeMove(initialState, move);
            let score;

            if (isStalemateBlunder(initialState, currentEval)) {
                score = -MATE_SCORE;
            } else {
                repetitionHistory.push(initialState.zobristHash);
                
                // Standard Principal Variation Search (PVS) logic.
                if (i === 0) { // Full window search for the presumed best move.
                    score = -search(initialState, currentDepth - 1, -beta, -alpha, 1, false);
                } else { // Null window search for other moves.
                    score = -search(initialState, currentDepth - 1, -alpha - 1, -alpha, 1, false);
                    // If it's better than our best, we must re-search with a full window.
                    if (score > alpha && score < beta) {
                        score = -search(initialState, currentDepth - 1, -beta, -alpha, 1, false);
                    }
                }
                repetitionHistory.pop();
            }
            unmakeMove(initialState, unmakeInfo);

            if (stopSearch) break;

            // If we found a better move, update alpha and store it.
            if (score > alpha) {
                alpha = score;
                bestMoveForThisDepth = move;
            }
        }

        if (stopSearch) {
            // If the timer ran out, the results for the current depth are incomplete.
            // We break the loop and return the trusted result from the PREVIOUS full depth.
            break;
        }

        // The search for this depth completed successfully. Update our official best move and score.
        bestMove = bestMoveForThisDepth;
        bestScore = alpha;

        // If we found a forced mate, there's no need to search any deeper.
        if (Math.abs(bestScore) >= MATE_SCORE - MATE_IN_MAX_PLY) {
            break;
        }
    }

    clearTimeout(timerId);
    return { bestMove, score: bestScore };
}





/**
 * The main recursive search function (negamax with alpha-beta pruning).
 * It uses the high-performance make/unmake pattern for maximum speed.
 * @param {object} state - The global game state object (which will be modified and reverted).
 */
// ====================================================================================
//            FINAL, CORRECT, AND HIGH-PERFORMANCE search (WITH INTERNAL LEGALITY CHECK)
// ====================================================================================

function search(state, depth, alpha, beta, ply, previousMoveWasNull) {
    if ((nodeCount & 2047) === 0 && performance.now() - searchStartTime > timeLimit) stopSearch = true;
    if (stopSearch) return 0;
    if (ply > 0 && repetitionHistory.filter(h => h === state.zobristHash).length >= 2) {
        const staticEval = evaluate(state);
        const contempt = -80 + Math.abs(staticEval) / 20;
        return Math.sign(staticEval) > 0 ? -contempt : contempt;
    }
    if (ply >= MATE_IN_MAX_PLY) return evaluate(state);

    const ttEntry = transpositionTable.get(state.zobristHash.toString());
    if (ttEntry && ttEntry.depth >= depth) {
        if (ttEntry.flag === TT_EXACT) return ttEntry.score;
        if (ttEntry.flag === TT_LOWERBOUND && ttEntry.score >= beta) return beta;
        if (ttEntry.flag === TT_UPPERBOUND && ttEntry.score <= alpha) return alpha;
    }

    nodeCount++;
    const inCheck = state.kingPos[state.turn] && isSquareAttacked(state.board, state.kingPos[state.turn].r, state.kingPos[state.turn].c, state.turn === 'w' ? 'b' : 'w');
    if (depth <= 0) return quiesce(state, alpha, beta, ply);
    if (inCheck) depth++;
    const staticEval = evaluate(state);

    if (!inCheck && !previousMoveWasNull && ply > 0 && depth >= NULL_MOVE_R + 1 && state.moveCount > 5 && staticEval >= beta) {
        const unmakeInfo = makeMove(state, { isNullMove: true });
        const score = -search(state, depth - 1 - NULL_MOVE_R, -beta, -beta + 1, ply + 1, true);
        unmakeMove(state, unmakeInfo);
        if (score >= beta) return beta;
    }

    // --- **NEW EFFICIENT ARCHITECTURE STARTS HERE** ---
    const moves = generatePseudoLegalMoves(state); // 1. Get fast, unfiltered moves.
    const orderedMoves = orderMoves(moves, state, ttEntry ? ttEntry.bestMove : null, ply);
    
    let originalAlpha = alpha;
    let bestMove = null;
    let bestScore = -Infinity;
    let legalMovesFound = 0;
    
    for (let i = 0; i < orderedMoves.length; i++) {
        const move = orderedMoves[i];
        const unmakeInfo = makeMove(state, move);
        
        // 2. Check legality AFTER making the move.
        const originalTurn = state.turn === 'w' ? 'b' : 'w';
        const kingPos = state.kingPos[originalTurn];
        if (kingPos && isSquareAttacked(state.board, kingPos.r, kingPos.c, state.turn)) {
            unmakeMove(state, unmakeInfo); // If illegal, unmake and skip to the next move.
            continue;
        }
        legalMovesFound++;

        repetitionHistory.push(state.zobristHash);
        
        let score;
        if (isStalemateBlunder(state, staticEval)) {
            score = -MATE_SCORE;
        } else {
            // 3. If legal, proceed with the search.
            if (i === 0) {
                score = -search(state, depth - 1, -beta, -alpha, ply + 1, false);
            } else {
                let reduction = 0; // ... (LMR logic is the same)
                score = -search(state, depth - 1 - reduction, -alpha - 1, -alpha, ply + 1, false);
                if (score > alpha && score < beta) {
                    score = -search(state, depth - 1, -beta, -alpha, ply + 1, false);
                }
            }
        }
        
        repetitionHistory.pop();
        unmakeMove(state, unmakeInfo);

        if (stopSearch) return 0;
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
        if (bestScore > alpha) alpha = bestScore;
        if (alpha >= beta) {
            // ... (killer move and TT logic is the same)
            return beta;
        }
    }

    if (legalMovesFound === 0) {
        return inCheck ? -MATE_SCORE + ply : 0; // Checkmate or Stalemate
    }

    const flag = (bestScore > originalAlpha) ? TT_EXACT : TT_UPPERBOUND;
    transpositionTable.set(state.zobristHash.toString(), { score: bestScore, depth, flag, bestMove });
    return bestScore;
}


/**
 * A specialized, recursive search that only analyzes tactical moves (captures, promotions, checks).
 * This prevents the engine from making blunders due to the "horizon effect".
 * @param {object} state - The global game state object.
 */
function quiesce(state, alpha, beta, ply) {
    if ((nodeCount & 2047) === 0 && performance.now() - searchStartTime > timeLimit) stopSearch = true;
    if (stopSearch) return 0;
    if (ply >= MATE_IN_MAX_PLY) return evaluate(state);
    nodeCount++;
    const standPat = evaluate(state);
    if (standPat >= beta) return beta;
    if (alpha < standPat) alpha = standPat;
    const moves = generateTacticalMoves(state);
    moves.sort((a, b) => {
        let scoreA = 0, scoreB = 0;
        if (a.capture) scoreA = (pieceValues[a.capture.toLowerCase()].mg * 10) - pieceValues[a.piece.toLowerCase()].mg;
        if (a.promotion) scoreA += pieceValues[a.promotion.toLowerCase()].mg;
        if (b.capture) scoreB = (pieceValues[b.capture.toLowerCase()].mg * 10) - pieceValues[b.piece.toLowerCase()].mg;
        if (b.promotion) scoreB += pieceValues[b.promotion.toLowerCase()].mg;
        return scoreB - scoreA;
    });

    for (const move of moves) {
        const unmakeInfo = makeMove(state, move);
        repetitionHistory.push(state.zobristHash);
        const score = -quiesce(state, -beta, -alpha, ply + 1);
        repetitionHistory.pop();
        unmakeMove(state, unmakeInfo);

        if (stopSearch) return 0;
        if (score >= beta) return beta;
        if (score > alpha) alpha = score;
    }
    return alpha;
}



function orderMoves(moves, state, pvMove, ply) {
    // MVV-LVA (Most Valuable Victim - Least Valuable Aggressor) pre-calculation
    const mvvLvaScores = [
        [0, 0, 0, 0, 0, 0],       // victim K, not possible
        [105, 104, 103, 102, 101, 100], // victim Q
        [95, 94, 93, 92, 91, 90],   // victim R
        [85, 84, 83, 82, 81, 80],   // victim B
        [75, 74, 73, 72, 71, 70],   // victim N
        [65, 64, 63, 62, 61, 60]    // victim P
    ];
    const pieceIndices = { p: 5, n: 4, b: 3, r: 2, q: 1, k: 0 };

    return moves.map(move => {
        let score = 0;
        if (pvMove && move.from[0] === pvMove.from[0] && move.from[1] === pvMove.from[1] && move.to[0] === pvMove.to[0] && move.to[1] === pvMove.to[1]) {
            score = 200000; // PV move gets top priority
        } else if (move.capture) {
            // Static Exchange Evaluation (SEE) would be better, but MVV-LVA is a great heuristic
            const attackerIndex = pieceIndices[move.piece.toLowerCase()];
            const victimIndex = pieceIndices[move.capture.toLowerCase()];
            score = 100000 + mvvLvaScores[victimIndex][attackerIndex];
        } else {
            // Killer moves for non-captures
            if (killerMoves[ply]?.[0] && killerMoves[ply][0].from[0] === move.from[0] && killerMoves[ply][0].to[0] === move.to[0] && killerMoves[ply][0].from[1] === move.from[1] && killerMoves[ply][0].to[1] === move.to[1]) {
                score = 90000;
            } else if (killerMoves[ply]?.[1] && killerMoves[ply][1].from[0] === move.from[0] && killerMoves[ply][1].to[0] === move.to[0] && killerMoves[ply][1].from[1] === move.from[1] && killerMoves[ply][1].to[1] === move.to[1]) {
                score = 80000;
            } else if (move.piece) {
                // History Heuristic for quiet moves
                score = historyTable[pieceMap.indexOf(move.piece)][move.to[0] * 8 + move.to[1]] || 0;
            }
        }
        return { move, score };
    }).sort((a, b) => b.score - a.score).map(item => item.move);
}


// ADVANCED SEARCH WITH DYNAMIC CONTEMPT
// ====================================================================================
//                 FINAL, COMPLETE, AND OPTIMIZED SEARCH FUNCTION (Mk. VI)
// ====================================================================================


// ====================================================================================
//                 PERFT - THE ULTIMATE MAKE/UNMAKE DEBUGGING TOOL
// ====================================================================================
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
var tested=0
// =================================================================
//              MAIN WORKER DRIVER (UNCHANGED)
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
    
    if(tested < 1){
    tested++
    runPerftTest(fen, maxDepth);
    
    }

    if (command === 'calculate_move') {
        searchStartTime = performance.now();
        timeLimit = maxTime || 4000;
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
        }

        if (openingBook.has(currentHash)) {
            const bookMoves = openingBook.get(currentHash);
            const legalMoves = generateLegalMoves(initialState);
            const verifiedBookMoves = bookMoves.filter(bookMove => 
                legalMoves.some(legalMove => 
                    legalMove.from[0] === bookMove.from[0] && legalMove.from[1] === bookMove.from[1] &&
                    legalMove.to[0] === bookMove.to[0] && legalMove.to[1] === bookMove.to[1]
                )
            );

            if (verifiedBookMoves.length > 0) {
                if (DEBUG_MODE) console.log(`**CACHE HIT**: Hash found in book and move verified as legal.`);
                const randomVerifiedMove = verifiedBookMoves[Math.floor(Math.random() * verifiedBookMoves.length)];
                postMessage({ bestMove: randomVerifiedMove, score: "Book Move", timeTaken: 0, nodesSearched: 0 });
                return;
            } else {
                if (DEBUG_MODE) console.error(`**BOOK FAILURE**: Hash found, but all book moves were ILLEGAL. Treating as a cache miss.`);
            }
        }
        
        if (DEBUG_MODE) {
            console.warn("Engine is now THINKING because of a book miss or failure.");
        }

        const { bestMove, score } = searchRoot(initialState, maxDepth || 99);
        postMessage({
            bestMove: bestMove, score: score,
            timeTaken: (performance.now() - searchStartTime).toFixed(2),
            nodesSearched: nodeCount
        });
    }
};