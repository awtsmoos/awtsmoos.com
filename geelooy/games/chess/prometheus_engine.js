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
// ====================================================================================
//            Smarter Tactical Move Generation for Quiescence Search
// ====================================================================================
// Now includes checks and direct attacks on valuable pieces to improve tactical vision.

function generateTacticalMoves(state) {
    const tacticalMoves = [];
    const pseudoLegalMoves = generatePseudoLegalMoves(state); // Use the faster generator
    const opponentColor = state.turn === 'w' ? 'b' : 'w';
    const highValueVictims = ['q', 'r']; // We are interested in threats to queens and rooks

    for (const move of pseudoLegalMoves) {
        // --- High-Performance Pattern: Make, Check, Unmake ---
        const unmakeInfo = makeMove(state, move);
        
        const ownKingPos = state.kingPos[opponentColor];
        const isIllegal = ownKingPos && isSquareAttacked(state.board, ownKingPos.r, ownKingPos.c, state.turn);
        
        if (!isIllegal) {
            // A move is tactical if it's a capture, a promotion, a check,
            // or if it attacks an enemy queen or rook.
            const enemyKingPos = state.kingPos[state.turn];
            const isCheck = enemyKingPos && isSquareAttacked(state.board, enemyKingPos.r, enemyKingPos.c, opponentColor);
            
            let isHighValueThreat = false;
            if (!move.capture) { // Only check for threats on non-capture moves
                const victim = state.board[move.to[0]][move.to[1]];
                if (victim && highValueVictims.includes(victim.toLowerCase())) {
                     // Check if our moving piece is now attacking this high-value piece
                     if(isSquareAttackedByPiece(state.board, move.to[0], move.to[1], move.to[0], move.to[1], opponentColor)) {
                         isHighValueThreat = true;
                     }
                }
            }

            if (move.capture || move.promotion || isCheck || isHighValueThreat) {
                tacticalMoves.push(move);
            }
        }
        
        unmakeMove(state, unmakeInfo);
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



// ====================================================================================
//            NEW HELPER #1: getAttackers - Essential for SEE
// ====================================================================================
// Finds all pieces of a given color that are attacking a specific square.
function getAttackers(state, r, c, attackerColor) {
    const attackers = [];
    const board = state.board;
    // Loop through all pieces of the attacker's color
    for (let pr = 0; pr < 8; pr++) {
        for (let pc = 0; pc < 8; pc++) {
            const piece = board[pr][pc];
            if (piece && (piece.toUpperCase() === piece) === (attackerColor === 'w')) {
                if (isSquareAttackedByPiece(board, r, c, pr, pc, attackerColor)) {
                    attackers.push({ piece, r: pr, c: pc });
                }
            }
        }
    }
    // Sort attackers by their value, least valuable first (pawn, knight, etc.)
    attackers.sort((a, b) => pieceValues[a.piece.toLowerCase()].mg - pieceValues[b.piece.toLowerCase()].mg);
    return attackers;
}

// ====================================================================================
//            NEW HELPER #2: Static Exchange Evaluation (SEE)
// ====================================================================================
// Determines the material gain/loss from a series of captures on a target square.
// A positive score means the exchange is favorable.
function see(state, fromR, fromC, toR, toC) {
    const board = state.board;
    const initialAttacker = board[fromR][fromC];
    const initialVictim = board[toR][toC];
    if (!initialAttacker || !initialVictim) return 0;

    let gain = [pieceValues[initialVictim.toLowerCase()].mg];
    let currentBoard = board.map(row => row.slice());
    let currentAttacker = { piece: initialAttacker, r: fromR, c: fromC };
    let turn = state.turn;

    // Simulate the capture
    currentBoard[toR][toC] = currentAttacker.piece;
    currentBoard[fromR][fromC] = null;

    while (true) {
        turn = (turn === 'w') ? 'b' : 'w'; // Switch sides for the recapture
        let attackers = getAttackers({ board: currentBoard }, toR, toC, turn);
        
        // If the other side has no attackers for the square, the exchange is over.
        if (attackers.length === 0) break;

        // The next attacker is the least valuable one.
        currentAttacker = attackers[0];
        
        // Add the value of the piece we just captured to our gain list.
        gain.push(pieceValues[currentBoard[toR][toC].toLowerCase()].mg);

        // Simulate the recapture
        currentBoard[toR][toC] = currentAttacker.piece;
        currentBoard[currentAttacker.r][currentAttacker.c] = null;
    }

    // Negamax the gain list to find the final result.
    let score = 0;
    for (let i = gain.length - 1; i >= 0; i--) {
        score = gain[i] - score;
    }
    
    return score;
}


// ====================================================================================
//            FINAL, CORRECT, AND HIGH-PERFORMANCE EVALUATION FUNCTIONS
// ====================================================================================
// This version removes the disastrous move generation from the evaluation,
// restoring the engine's speed and playing strength.

// ====================================================================================
//            FINAL, CORRECTED, AND HIGH-PERFORMANCE EVALUATION FUNCTIONS
// ====================================================================================
// This version correctly passes variables between functions, fixing the 'undefined' crash.




// ====================================================================================
//            FINAL, CORRECT, AND HIGH-PERFORMANCE EVALUATION FUNCTIONS
// ====================================================================================
// This version removes the disastrous mobility loop from the evaluation,
// relying on fast Piece-Square Tables to restore the engine's speed and strength.





// ====================================================================================
//                        NEW HELPER: KING SAFETY ZONE
// ====================================================================================
// This helper function gets the 9 squares in the king's immediate vicinity.
function getKingZone(kingPos) {
    if (!kingPos) return [];
    const zone = [];
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            const r = kingPos.r + dr;
            const c = kingPos.c + dc;
            if (r >= 0 && r < 8 && c >= 0 && c < 8) {
                zone.push({ r, c });
            }
        }
    }
    return zone;
}


// ====================================================================================
//         MASTER EVALUATION HUB & ALL NEW STRATEGIC/TACTICAL FUNCTIONS (Mk. VII)
// ====================================================================================

// --- MASTER EVALUATION HUB ---
// This function now coordinates all the new, smarter evaluation components.
function evaluate(state) {
    const { board } = state;
    const gamePhase = getGamePhase(board);

    let whiteScore = new TaperedScore();
    let blackScore = new TaperedScore();

    // Pre-calculate piece locations and pawn files once to pass to helper functions.
    const pieceData = { P: [], p: [], N: [], n: [], B: [], b: [], R: [], r: [], Q: [], q: [], K: [], k: [] };
    for (let r = 0; r < 8; r++) { for (let c = 0; c < 8; c++) { if (board[r][c]) pieceData[board[r][c]].push({ r, c }); } }
    
    const whitePawnFiles = new Set(pieceData.P.map(p => p.c));
    const blackPawnFiles = new Set(pieceData.p.map(p => p.c));

    // 1. Base Material and Positional Score
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (!p) continue;
            const isWhite = p.toUpperCase() === p;
            const pType = p.toLowerCase();
            const scoreTarget = isWhite ? whiteScore : blackScore;
            
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

    // 2. Advanced Strategic Bonuses (Pawn Structure, Mobility, etc.)
    whiteScore.add(evaluateStrategicBonuses(state, 'w', pieceData, whitePawnFiles, blackPawnFiles));
    blackScore.add(evaluateStrategicBonuses(state, 'b', pieceData, blackPawnFiles, whitePawnFiles));

    // 3. Threat Analysis
   // whiteScore.add(evaluateThreats(state, 'w', pieceData));
   // blackScore.add(evaluateThreats(state, 'b', pieceData));

    // 4. Endgame-Specific Factors (Passed Pawns, King Activity)
    whiteScore.add(evaluateEndgameFactors(state, 'w', pieceData));
    blackScore.add(evaluateEndgameFactors(state, 'b', pieceData));
    
    // 5. King Safety (Applied last as a penalty)
    if (state.kingPos.w) whiteScore.subtract(evaluateKingSafety(state, state.kingPos.w, 'b', pieceData));
if (state.kingPos.b) blackScore.subtract(evaluateKingSafety(state, state.kingPos.b, 'w', pieceData));
    
    
    // 6. Final Tapered Score
    const finalWhite = (whiteScore.mg * gamePhase) + (whiteScore.eg * (1 - gamePhase));
    const finalBlack = (blackScore.mg * gamePhase) + (blackScore.eg * (1 - gamePhase));
    const evaluation = Math.round(finalWhite - finalBlack);
    return (state.turn === 'w' ? 1 : -1) * evaluation;
}


// --- REWRITTEN & ENHANCED: STRATEGIC BONUSES ---
// Now includes Pawn Structure, Mobility, and Good vs. Bad Bishops.
// ====================================================================================
//            EVALUATE STRATEGIC BONUSES (Mk. IX - WITH CASTLING & KING MOVEMENT)
// ====================================================================================
// ====================================================================================
//            EVALUATE STRATEGIC BONUSES (Mk. X - BUGFIX, TEMPO & ENHANCED MOBILITY)
// ====================================================================================
// ====================================================================================
//            EVALUATE STRATEGIC BONUSES (Mk. XIII - WITH CASTLING INCENTIVE)
// ====================================================================================
function evaluateStrategicBonuses(state, color, pieceData, friendlyPawnFiles, enemyPawnFiles) {
    const score = new TaperedScore();
    const isWhite = color === 'w';
    const startRank = isWhite ? 7 : 0;
    
    // --- NEW: POWERFUL INCENTIVE TO CASTLE ---
    // We check if the king has castled and give a significant midgame bonus for it.
    // This teaches the engine that castling is a high-priority strategic goal.
    const myKingPos = isWhite ? state.kingPos.w : state.kingPos.b;
    if (myKingPos) {
        // Check for kingside castling (King on g-file)
        if (myKingPos.c === 6 && myKingPos.r === startRank) {
            score.add(new TaperedScore(50, 10)); // Strong midgame safety bonus
        }
        // Check for queenside castling (King on c-file)
        else if (myKingPos.c === 2 && myKingPos.r === startRank) {
            score.add(new TaperedScore(40, 5)); // Slightly smaller bonus as queenside can be riskier
        }
    }

    // --- EXISTING LOGIC BELOW ---

    // Development & Tempo Bonus
    const myKnights = isWhite ? pieceData.N : pieceData.n;
    const myBishops = isWhite ? pieceData.B : pieceData.b;
    for (const knight of myKnights) {
        if (knight.r !== startRank) score.add(new TaperedScore(10, 0));
    }
    for (const bishop of myBishops) {
        if (bishop.r !== startRank) score.add(new TaperedScore(10, 0));
    }

    // Bishop Pair Bonus
    if (myBishops.length >= 2) {
        score.add(new TaperedScore(50, 75));
    }

    // Rook on Open/Semi-Open File Bonus
    for (const rook of (isWhite ? pieceData.R : pieceData.r)) {
        if (!friendlyPawnFiles.has(rook.c)) {
             score.add(new TaperedScore(enemyPawnFiles.has(rook.c) ? 20 : 40, 15));
        }
        if (rook.r === (isWhite ? 1 : 6)) { // Rook on 7th rank
            score.add(new TaperedScore(40, 50));
        }
    }

    // Pawn Structure Evaluation
    const myPawns = isWhite ? pieceData.P : pieceData.p;
    const pawnFileCounts = new Map();
    for (const pawn of myPawns) {
        pawnFileCounts.set(pawn.c, (pawnFileCounts.get(pawn.c) || 0) + 1);
        if (!friendlyPawnFiles.has(pawn.c - 1) && !friendlyPawnFiles.has(pawn.c + 1)) {
            score.subtract(new TaperedScore(20, 25)); // Isolated Pawn
        }
    }
    for (const count of pawnFileCounts.values()) {
        if (count > 1) {
            score.subtract(new TaperedScore(25 * (count - 1), 35 * (count - 1))); // Doubled Pawn
        }
    }

    // Good vs. Bad Bishop Evaluation
    for (const bishop of myBishops) {
        const bishopColor = (bishop.r + bishop.c) % 2;
        let trappedPawns = 0;
        for (const pawn of myPawns) {
            if ((pawn.c >= 3 && pawn.c <= 4) && (pawn.r + pawn.c) % 2 === bishopColor) {
                trappedPawns++;
            }
        }
        score.subtract(new TaperedScore(trappedPawns * 10, trappedPawns * 5));
    }

    // Lightweight Mobility
    let mobilityScore = 0;
    const pieceTypesForMobility = ['N', 'B', 'R', 'Q'];
    for(const pType of pieceTypesForMobility) {
        const pieces = isWhite ? pieceData[pType] : pieceData[pType.toLowerCase()];
        const directions = { N: knightMoves, B: bishopDirections, R: rookDirections, Q: queenDirections }[pType];
        
        for(const piece of pieces) {
            for(const [dr, dc] of directions) {
                let nR = piece.r + dr, nC = piece.c + dc;
                while(nR >= 0 && nR < 8 && nC >= 0 && nC < 8) {
                    if (state.board[nR][nC]) break;
                    mobilityScore += 1;
                    if (pType === 'N') break;
                    nR += dr; nC += dc;
                }
            }
        }
    }
    score.add(new TaperedScore(mobilityScore, mobilityScore / 2));

    return score;
}




// --- NEW FUNCTION: THREAT ANALYSIS ---
// Rewards the engine for creating threats against enemy pieces.

// --- ENHANCED: ENDGAME FACTORS ---
// Now includes logic for "candidate" passed pawns.
function evaluateEndgameFactors(state, color, pieceData) {
    const score = new TaperedScore();
    const isWhite = color === 'w';
    const myKingPos = isWhite ? state.kingPos.w : state.kingPos.b;
    const enemyKingPos = isWhite ? state.kingPos.b : state.kingPos.w;
    if (!myKingPos || !enemyKingPos) return score;

    const kingCentrality = - (Math.abs(myKingPos.r - 3.5) + Math.abs(myKingPos.c - 3.5));
    score.eg += Math.round(kingCentrality * 10);
    const kingProximity = 7 - (Math.abs(myKingPos.r - enemyKingPos.r) + Math.abs(myKingPos.c - enemyKingPos.c));
    score.eg += kingProximity * 5;

    const friendlyPawns = isWhite ? pieceData.P : pieceData.p;
    const enemyPawns = isWhite ? pieceData.p : pieceData.P;

    for (const p of friendlyPawns) {
        let isPassed = true;
        let stoppers = 0; // --- NEW: Count potential blockers
        for (const ep of enemyPawns) {
            if (Math.abs(ep.c - p.c) <= 1 && (isWhite ? ep.r < p.r : ep.r > p.r)) {
                isPassed = false;
                stoppers++;
            }
        }
        if (isPassed) {
            const rank = isWhite ? 7 - p.r : p.r;
            const bonus = [0, 20, 30, 50, 80, 150, 300, 500][rank];
            score.mg += bonus;
            score.eg += bonus * 2.5;
            const kingPawnDist = Math.max(Math.abs(myKingPos.r - p.r), Math.abs(myKingPos.c - p.c));
            score.eg += (8 - kingPawnDist) * 10;
        } else {
            // --- NEW: Candidate Passed Pawn Bonus ---
            // If a pawn isn't passed but has few or no stoppers, it's a future threat.
            if (stoppers === 0) {
                 score.add(new TaperedScore(20, 40)); // True candidate
            } else if (stoppers === 1) {
                 score.add(new TaperedScore(10, 20)); // Potential candidate
            }
        }
    }
    return score;
}

// ====================================================================================
//            NEW HIGH-PERFORMANCE THREAT ANALYSIS (Mk. VIII)
// ====================================================================================
// This version is extremely fast as it avoids move generation entirely.
function evaluateThreats(state, color, pieceData) {
    const score = new TaperedScore();
    const isWhite = color === 'w';
    const attackerPieceTypes = isWhite ? ['P', 'N', 'B', 'R', 'Q'] : ['p', 'n', 'b', 'r', 'q'];
    const victimPieceTypes = isWhite ? ['p', 'n', 'b', 'r', 'q'] : ['P', 'N', 'B', 'R', 'Q'];

    for (const attackerPType of attackerPieceTypes) {
        const attackers = pieceData[attackerPType];
        if (attackers.length === 0) continue;

        for (const victimPType of victimPieceTypes) {
            const victims = pieceData[victimPType];
            if (victims.length === 0) continue;

            for (const attacker of attackers) {
                for (const victim of victims) {
                    // Check if the attacker piece directly attacks the victim's square
                    if (isSquareAttackedByPiece(state.board, victim.r, victim.c, attacker.r, attacker.c, color)) {
                        const attackerValue = pieceValues[attackerPType.toLowerCase()].mg;
                        const victimValue = pieceValues[victimPType.toLowerCase()].mg;
                        // Add a small bonus for creating a threat, especially against a more valuable piece
                        if (victimValue > attackerValue) {
                            score.mg += Math.round(victimValue / 25);
                        }
                    }
                }
            }
        }
    }
    return score;
}


// --- COMPLETELY REWRITTEN: KING SAFETY ---
// This new version evaluates threats to the "King Zone" for a much more accurate danger assessment.
// ====================================================================================
//            SMARTER & FASTER King Safety (Mk. XI)
// ====================================================================================
// This version is faster and better understands real threats vs. passive exposure.

// ====================================================================================
//            King Safety with Endgame Awareness (Mk. XII)
// ====================================================================================
// This version now returns a TaperedScore to apply penalties in the endgame,
// preventing the king from making suicidal marches.

// ====================================================================================
//            King Safety with "Queen Danger" Sense (Mk. XIV - FINAL)
// ====================================================================================
// This version adds a massive penalty for enemy queen proximity, fixing both
// unsound sacrifices and the failure to escape perpetual check.

function evaluateKingSafety(state, kingPos, attackerColor, pieceData) {
    const danger = new TaperedScore();
    const isAttackerWhite = attackerColor === 'w';
    
    // --- NEW: QUEEN PROXIMITY PENALTY ---
    // This is the most important part of the fix. If the enemy queen is close,
    // the position is inherently dangerous, even if there are no other attackers.
    const enemyQueen = isAttackerWhite ? pieceData.Q[0] : pieceData.q[0];
    if (enemyQueen) {
        const queenDist = Math.max(Math.abs(kingPos.r - enemyQueen.r), Math.abs(kingPos.c - enemyQueen.c));
        if (queenDist <= 2) { // Queen is within a 2-square radius
            danger.mg += 100; // Massive penalty
            danger.eg += 50;
        } else if (queenDist <= 3) {
            danger.mg += 50;
            danger.eg += 25;
        }
    }

    let attackerCount = 0;
    const attackerPieceTypes = isAttackerWhite ? ['N', 'B', 'R', 'Q'] : ['n', 'b', 'r', 'q'];
    for (const pType of attackerPieceTypes) {
        attackerCount += pieceData[pType].length;
    }

    // Only proceed with detailed calculation if there are enough pieces for an attack.
    if (attackerCount < 2) {
        return danger;
    }

    let dangerScore = 0;
    const kingZone = getKingZone(kingPos);
    const attackWeights = { q: 9, r: 5, b: 3, n: 3 };
    
    for (const pType of attackerPieceTypes) {
        const attackers = pieceData[pType];
        for (const attacker of attackers) {
            for (const zoneSquare of kingZone) {
                if (isSquareAttackedByPiece(state.board, zoneSquare.r, zoneSquare.c, attacker.r, attacker.c, attackerColor)) {
                    dangerScore += attackWeights[pType.toLowerCase()];
                }
            }
        }
    }
    
    // This scales the danger based on the number of attackers but does so in a much
    // more controlled, linear way, preventing the score from exploding.
    const scaledDanger = dangerScore * (1 + (attackerCount / 4));

    danger.mg += Math.round(scaledDanger);
    danger.eg += Math.round(scaledDanger / 2);

    return danger;
    
      danger.mg += scaledDanger;
    danger.eg += scaledDanger / 2;

    return danger;
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

// ====================================================================================
//            BUGFIXED & CORRECT searchRoot (STABLE AND FAST)
// ====================================================================================
// This version removes the incorrect repetition history management that was causing
// the "0 nodes searched" bug.
function searchRoot(initialState, maxDepth) {
    let bestMove = null;
    let bestScore = -Infinity;
    const moves = generateLegalMoves(initialState);

    if (moves.length === 0) {
        return { bestMove: null, score: evaluate(initialState) };
    }

    const timerId = setTimeout(() => { stopSearch = true; }, timeLimit - 50);

    for (let currentDepth = 1; currentDepth <= maxDepth; currentDepth++) {
        const orderedMoves = orderMoves(moves, initialState, bestMove, 0);
        let bestMoveForThisDepth = orderedMoves[0];
        const currentEval = evaluate(initialState);

        let alpha = -Infinity;
        let beta = Infinity;
        
        for (let i = 0; i < orderedMoves.length; i++) {
            const move = orderedMoves[i];
            
            
            if (stopSearch) break;

            // === NEW: FUTILITY PRUNING LOGIC ===
        // We only apply this heuristic if:
        // - We are not in check.
        // - We are in the late-middle to endgame (ply > 0).
        // - The move is a quiet move (not a capture or promotion).
        // - The search depth is low (we are near the horizon).
        if (!inCheck && ply > 0 && !move.capture && !move.promotion && depth <= 3) {
            const futilityMargin = [0, 150, 350, 550][depth]; // Margin increases as depth gets shallower
            
            // If the current evaluation plus the margin is still worse than alpha,
            // this move is unlikely to be good enough, so we skip (prune) it.
            if (staticEval + futilityMargin <= alpha) {
                continue; // Prune this move
            }
            }
            
            
            
            const unmakeInfo = makeMove(initialState, move);
            let score;

            if (isStalemateBlunder(initialState, currentEval)) {
                score = -MATE_SCORE;
            } else {
                repetitionHistory.push(initialState.zobristHash);
                
                if (i === 0) {
                    score = -search(initialState, currentDepth - 1, -beta, -alpha, 1, false);
                } else {
                    score = -search(initialState, currentDepth - 1, -alpha - 1, -alpha, 1, false);
                    if (score > alpha && score < beta) {
                        score = -search(initialState, currentDepth - 1, -beta, -alpha, 1, false);
                    }
                }
                repetitionHistory.pop();
            }
            unmakeMove(initialState, unmakeInfo);

            if (stopSearch) break;

            if (score > alpha) {
                alpha = score;
                bestMoveForThisDepth = move;
            }
        }

        if (stopSearch) {
            break;
        }

        bestMove = bestMoveForThisDepth;
        bestScore = alpha;

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

// ====================================================================================
//            FINAL, CORRECT, AND HIGH-PERFORMANCE search (WITH AGGRESSIVE REPETITION HANDLING)
// ====================================================================================

// ====================================================================================
//            CORRECTED SEARCH (WITH ROBUST REPETITION HANDLING)
// ====================================================================================



// ====================================================================================
//            SEARCH WITH MORE AGGRESSIVE REPETITION HANDLING
// ====================================================================================
// ====================================================================================
//            THE CORRECT AND WORKING search FUNCTION (FINAL VERSION)
// ====================================================================================
// This version fixes the "low node count" bug permanently by correctly managing
// the repetition history within the recursive search.
// It also includes the aggressive "never draw a won game" logic.

// ====================================================================================
//            THE DEFINITIVE, CORRECT search FUNCTION (FINAL)
// ====================================================================================
// This version permanently fixes the "low node count" bug by correctly managing the
// repetition history. It only requires changing this one function.

// ====================================================================================
//            THE ORIGINAL, WORKING search FUNCTION (WITH ONE TARGETED FIX)
// ====================================================================================
// This restores the original, correct search structure that searched thousands of nodes.
// The ONLY change is to the inside of the repetition check to make it more aggressive.

// ====================================================================================
//            SEARCH WITH RUTHLESS "ANTI-DRAW" LOGIC (FINAL VERSION)
// ====================================================================================
// This version fixes the bug where the engine forces a draw in a winning position.

// ====================================================================================
//            THE CORRECT search FUNCTION (Based on Your Working Original)
// ====================================================================================
// This restores the original, working search logic that searched thousands of nodes.
// The ONLY change is to the return value inside the repetition block to make the
// engine avoid draws when it is winning.

function search(state, depth, alpha, beta, ply, previousMoveWasNull) {
    if ((nodeCount & 2047) === 0 && performance.now() - searchStartTime > timeLimit) stopSearch = true;
    if (stopSearch) return 0;

    // --- YOUR ORIGINAL, WORKING REPETITION DETECTION LOGIC ---
    // The condition ">= 2" is correct and is what allowed the search to work.
    if (ply > 0 && repetitionHistory.filter(h => h === state.zobristHash).length >= 2) {
        
        // --- THE NEW, RUTHLESS "ANTI-DRAW" CONSEQUENCE ---
        // This is the only part that is different from your original code.
        const staticEval = evaluate(state);
        const WINNING_THRESHOLD = 150; // A clear 1.5 pawn advantage.

        if (staticEval > WINNING_THRESHOLD) {
            return -MATE_SCORE / 2; // Treat draw as a catastrophic blunder when winning.
        }
        if (staticEval < -WINNING_THRESHOLD) {
            return MATE_SCORE / 2; // Treat draw as a huge success when losing.
        }
        return 0; // Treat draw as a neutral outcome in an equal game.
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
        repetitionHistory.push(state.zobristHash);
        const score = -search(state, depth - 1 - NULL_MOVE_R, -beta, -beta + 1, ply + 1, true);
        repetitionHistory.pop();
        unmakeMove(state, unmakeInfo);
        if (score >= beta) return beta;
    }

    const moves = generatePseudoLegalMoves(state);
    const orderedMoves = orderMoves(moves, state, ttEntry ? ttEntry.bestMove : null, ply);
    
    let originalAlpha = alpha;
    let bestMove = null;
    let bestScore = -Infinity;
    let legalMovesFound = 0;
    
    for (let i = 0; i < orderedMoves.length; i++) {
        const move = orderedMoves[i];
        const unmakeInfo = makeMove(state, move);
        
        const originalTurn = state.turn === 'w' ? 'b' : 'w';
        const kingPos = state.kingPos[originalTurn];
        if (kingPos && isSquareAttacked(state.board, kingPos.r, kingPos.c, state.turn)) {
            unmakeMove(state, unmakeInfo);
            continue;
        }
        legalMovesFound++;

        repetitionHistory.push(state.zobristHash);
        
        let score;
        if (isStalemateBlunder(state, staticEval)) {
            score = -MATE_SCORE;
        } else {
            if (i === 0) {
                score = -search(state, depth - 1, -beta, -alpha, ply + 1, false);
            } else {
                score = -search(state, depth - 1, -alpha - 1, -alpha, ply + 1, false);
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
            return beta;
        }
    }

    if (legalMovesFound === 0) {
        return inCheck ? -MATE_SCORE + ply : 0;
    }

    const flag = (bestScore > originalAlpha) ? TT_EXACT : TT_UPPERBOUND;
    transpositionTable.set(state.zobristHash.toString(), { score: bestScore, depth, flag, bestMove });
    return bestScore;
}




// ====================================================================================
//            REWRITTEN QUIESCENCE SEARCH (WITH STATIC EXCHANGE EVALUATION)
// ====================================================================================
function quiesce(state, alpha, beta, ply) {
    if ((nodeCount & 2047) === 0 && performance.now() - searchStartTime > timeLimit) stopSearch = true;
    if (stopSearch) return 0;
    if (ply >= MATE_IN_MAX_PLY) return evaluate(state);

    nodeCount++;
    const standPat = evaluate(state);
    if (standPat >= beta) return beta;
    if (alpha < standPat) alpha = standPat;

    const moves = generateTacticalMoves(state);
    moves.sort((a, b) => { // Simple MVV-LVA for initial ordering
        let scoreA = a.capture ? (pieceValues[a.capture.toLowerCase()].mg * 10) - pieceValues[a.piece.toLowerCase()].mg : 0;
        let scoreB = b.capture ? (pieceValues[b.capture.toLowerCase()].mg * 10) - pieceValues[b.piece.toLowerCase()].mg : 0;
        return scoreB - scoreA;
    });

    for (const move of moves) {
        // --- **THE SEE FILTER** ---
        // If it's a capture, we first check if it's tactically sound using SEE.
        // We only search captures that are winning or equal (SEE >= 0).
        if (move.capture) {
            if (see(state, move.from[0], move.from[1], move.to[0], move.to[1]) < 0) {
                continue; // This is a bad capture, so we prune it immediately.
            }
        }

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
var tested=1
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