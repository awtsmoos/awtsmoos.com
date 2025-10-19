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
function generateTacticalMoves(state) {
    const tacticalMoves = [];
    const pseudoLegalMoves = [];
    const opponentColor = state.turn === 'w' ? 'b' : 'w';

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = state.board[r][c];
            if (p && (p.toUpperCase() === p) === (state.turn === 'w')) {
                generateMovesForPiece(pseudoLegalMoves, p, r, c, state);
            }
        }
    }

    for (const move of pseudoLegalMoves) {
        // A tactical move is a capture, a promotion, or a check.
        const { newState } = makeMove(state, move);
        const kingPos = newState.kingPos[opponentColor];
        
        // We must ensure the move is legal by checking if our own king is safe.
        const ownKingPos = newState.kingPos[state.turn];
        if (ownKingPos && isSquareAttacked(newState.board, ownKingPos.r, ownKingPos.c, opponentColor)) {
            continue; // Skip illegal moves
        }

        const isCheck = kingPos && isSquareAttacked(newState.board, kingPos.r, kingPos.c, state.turn);

        if (move.capture || move.promotion || isCheck) {
            tacticalMoves.push(move);
        }
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

    // 5. Final Tapered Score
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
function isStalemateBlunder(resultingState, currentEval) {
    // Only check for stalemate blunders if we are in a completely winning position.
    // The threshold (e.g., 5000) means an advantage of at least a rook. Adjust as needed.
    const WINNING_THRESHOLD = 5000;
    const isWinning = Math.abs(currentEval) > WINNING_THRESHOLD;

    if (!isWinning) {
        return false;
    }

    // If we are winning and make a move that leaves the opponent with NO legal moves,
    // it's a stalemate. This is a catastrophic blunder.
    const opponentHasMoves = generateLegalMoves(resultingState).length > 0;

    if (!opponentHasMoves) {
        const inCheck = resultingState.kingPos[resultingState.turn] && isSquareAttacked(resultingState.board, resultingState.kingPos[resultingState.turn].r, resultingState.kingPos[resultingState.turn].c, resultingState.turn === 'w' ? 'b' : 'w');
        // If they have no moves AND are not in check, it's a stalemate.
        return !inCheck;
    }

    return false;
}




// *** ENHANCED QUIESCENCE SEARCH (CHECKS FORKS AND OTHER THREATS) ***
function quiesce(state, alpha, beta, ply) {
    if ((nodeCount & 2047) === 0 && performance.now() - searchStartTime > timeLimit) {
        stopSearch = true;
    }
    if (stopSearch) return 0;

    if (ply >= MATE_IN_MAX_PLY) {
        return evaluate(state);
    }
    nodeCount++;

    const standPat = evaluate(state);
    if (standPat >= beta) {
        return beta; // Fail-high
    }
    if (alpha < standPat) {
        alpha = standPat;
    }

    // Use the new generator that includes checks
    const moves = generateTacticalMoves(state);
    
    // Simple move ordering for quiescence (MVV-LVA)
    moves.sort((a, b) => {
        let scoreA = 0, scoreB = 0;
        if (a.capture) scoreA = (pieceValues[a.capture.toLowerCase()].mg * 10) - pieceValues[a.piece.toLowerCase()].mg;
        if (a.promotion) scoreA += pieceValues[a.promotion.toLowerCase()].mg;
        if (b.capture) scoreB = (pieceValues[b.capture.toLowerCase()].mg * 10) - pieceValues[b.piece.toLowerCase()].mg;
        if (b.promotion) scoreB += pieceValues[b.promotion.toLowerCase()].mg;
        return scoreB - scoreA;
    });

    for (const move of moves) {
        const { newState } = makeMove(state, move);
        repetitionHistory.push(newState.zobristHash);
        const score = -quiesce(newState, -beta, -alpha, ply + 1);
        repetitionHistory.pop();

        if (stopSearch) return 0;

        if (score >= beta) {
            return beta; // Beta-cutoff
        }
        if (score > alpha) {
            alpha = score;
        }
    }

    return alpha;
}

// =================================================================
//                 ADVANCED SEARCH & MOVE ORDERING (Mk. V)
// =================================================================

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
function search(state, depth, alpha, beta, ply) {
    // --- Step 1: Termination & Draw Checks ---
    if ((nodeCount & 2047) === 0 && performance.now() - searchStartTime > timeLimit) {
        stopSearch = true;
    }
    if (stopSearch) return 0;

    // **NEW: DYNAMIC CONTEMPT FOR REPETITIONS**
    // Severely discourage draws in equal or winning positions.
    if (ply > 0 && repetitionHistory.filter(h => h === state.zobristHash).length >= 2) {
        const staticEval = evaluate(state);
        // If we are winning, a draw is bad (negative score).
        // If we are losing, a draw is good (positive score).
        // The contempt value is roughly 80% of a pawn's value, scaled by the position.
        // A positive evaluation means we are better, so we treat a draw as a loss.
        // A negative evaluation means we are worse, so we treat a draw as a win.
        const contempt = -80 + Math.abs(staticEval) / 20;
        return Math.sign(staticEval) > 0 ? -contempt : contempt;
    }

    if (ply >= MATE_IN_MAX_PLY) {
        return evaluate(state); // Max depth reached
    }

    // --- (The rest of the search function remains the same as the Mk. V version) ---

    // --- Step 2: Transposition Table Lookup ---
    const isRoot = ply === 0;
    const ttEntry = !isRoot ? transpositionTable.get(state.zobristHash.toString()) : null;
    if (ttEntry && ttEntry.depth >= depth) {
        if (ttEntry.flag === TT_EXACT) return ttEntry.score;
        if (ttEntry.flag === TT_LOWERBOUND && ttEntry.score >= beta) return beta;
        if (ttEntry.flag === TT_UPPERBOUND && ttEntry.score <= alpha) return alpha;
    }

    // --- Step 3: Quiescence Search & Pruning Prep ---
    nodeCount++;
    const inCheck = state.kingPos[state.turn] && isSquareAttacked(state.board, state.kingPos[state.turn].r, state.kingPos[state.turn].c, state.turn === 'w' ? 'b' : 'w');
    if (depth <= 0) {
        return quiesce(state, alpha, beta, ply);
    }
    if (inCheck) depth++;
    const staticEval = evaluate(state);

    // --- Step 4: Advanced Pruning Techniques ---
    if (!inCheck && !isRoot && depth >= NULL_MOVE_R + 1 && state.moveCount > 5 && staticEval >= beta) {
        const { newState: nullMoveState } = makeMove(state, { isNullMove: true });
        const score = -search(nullMoveState, depth - 1 - NULL_MOVE_R, -beta, -beta + 1, ply + 1);
        if (score >= beta) {
            return beta;
        }
    }

    // --- Step 5: Generate and Order Moves ---
    const moves = generateLegalMoves(state);
    if (moves.length === 0) {
        return inCheck ? -MATE_SCORE + ply : 0;
    }
    const orderedMoves = orderMoves(moves, state, ttEntry ? ttEntry.bestMove : null, ply);

    // --- Step 6: Iterate Through Moves ---
    let originalAlpha = alpha;
    let bestMove = null;
    let bestScore = -Infinity;
    
    for (let i = 0; i < orderedMoves.length; i++) {
        const move = orderedMoves[i];
        const { newState } = makeMove(state, move);
        if (isStalemateBlunder(newState, staticEval)) {
            continue;
        }
        repetitionHistory.push(newState.zobristHash);
        let score;
        if (i === 0) {
            score = -search(newState, depth - 1, -beta, -alpha, ply + 1);
        } else {
            let reduction = 0;
            if (depth >= 3 && i >= 3 && !inCheck && !move.capture && !move.promotion) {
                 reduction = 1 + Math.floor(Math.log(i) * Math.log(depth) / 2);
                 reduction = Math.min(reduction, depth - 2);
            }
            score = -search(newState, depth - 1 - reduction, -alpha - 1, -alpha, ply + 1);
            if (score > alpha && score < beta) {
                score = -search(newState, depth - 1, -beta, -alpha, ply + 1);
            }
        }
        repetitionHistory.pop();
        if (stopSearch) return 0;
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
        if (bestScore > alpha) {
            alpha = bestScore;
        }
        if (alpha >= beta) {
            if (!move.capture) {
                if (killerMoves[ply]?.[0] !== move) {
                    killerMoves[ply][1] = killerMoves[ply][0];
                    killerMoves[ply][0] = move;
                }
                if (move.piece) {
                    historyTable[pieceMap.indexOf(move.piece)][move.to[0] * 8 + move.to[1]] += depth * depth;
                }
            }
            transpositionTable.set(state.zobristHash.toString(), { score: beta, depth, flag: TT_LOWERBOUND, bestMove: move });
            return beta;
        }
    }

    // --- Step 7: Store Result ---
    const flag = (bestScore > originalAlpha) ? TT_EXACT : TT_UPPERBOUND;
    transpositionTable.set(state.zobristHash.toString(), { score: bestScore, depth, flag, bestMove });
    return bestScore;
}






function searchRoot(initialState, maxDepth) {
    // This function remains exactly the same as you provided
    let bestMove = null, bestScore = -Infinity;
    let alpha = -Infinity, beta = Infinity;
    const moves = generateLegalMoves(initialState);
    if (moves.length === 0) return { bestMove: null, score: evaluate(initialState) };
    const timerId = setTimeout(() => { stopSearch = true; }, timeLimit - 50);
    for (let currentDepth = 1; currentDepth <= maxDepth; currentDepth++) {
        const orderedMoves = orderMoves(moves, bestMove, 0);
        let bestMoveForThisDepth = orderedMoves[0];
        for (const move of orderedMoves) {
            if (stopSearch) break;
            const { newState } = makeMove(initialState, move);
            repetitionHistory.push(newState.zobristHash);
            let score;
            if (move === orderedMoves[0]) { score = -search(newState, currentDepth - 1, -beta, -alpha, 1); }
            else {
                score = -search(newState, currentDepth - 1, -alpha - 1, -alpha, 1);
                if (score > alpha && score < beta) { score = -search(newState, currentDepth - 1, -beta, -alpha, 1); }
            }
            repetitionHistory.pop();
            if (stopSearch) break;
            if (score > alpha) { alpha = score; bestMoveForThisDepth = move; }
        }
        if (stopSearch) break;
        bestMove = bestMoveForThisDepth;
        bestScore = alpha;
        if (bestScore <= alpha || bestScore >= beta) { alpha = -Infinity; beta = Infinity; currentDepth--; continue; }
        const aspirationWindow = 50;
        alpha = bestScore - aspirationWindow; beta = bestScore + aspirationWindow;
        if (Math.abs(bestScore) >= MATE_SCORE - MATE_IN_MAX_PLY) break;
    }
    clearTimeout(timerId);
    return { bestMove, score: bestScore };
}

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