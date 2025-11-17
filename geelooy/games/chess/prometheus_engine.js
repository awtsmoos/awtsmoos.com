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

// MAIN EVALUATION HUB



// ====================================================================================
//            REPLACE YOUR OLD getAttackers() AND see() FUNCTIONS WITH THESE
// ====================================================================================
// These are the verified, high-performance helper functions required for the new
// SEE-based move ordering. They are essential for the search to work correctly.

function getAttackers(state, r, c, attackerColor) {
    const attackers = [];
    const board = state.board;

    for (let pr = 0; pr < 8; pr++) {
        for (let pc = 0; pc < 8; pc++) {
            const piece = board[pr][pc];
            if (piece && (piece.toUpperCase() === piece) === (attackerColor === 'w')) {
                // Check if this specific piece attacks the target square
                if (isSquareAttackedByPiece(board, r, c, pr, pc, attackerColor)) {
                    attackers.push({ piece, r: pr, c: pc });
                }
            }
        }
    }
    // Sort attackers by their value, least valuable first (Pawn, Knight, etc.)
    attackers.sort((a, b) => pieceValues[a.piece.toLowerCase()].mg - pieceValues[b.piece.toLowerCase()].mg);
    return attackers;
}

function see(state, fromR, fromC, toR, toC) {
    const board = state.board;
    const initialAttacker = board[fromR][fromC];
    const initialVictim = board[toR][toC];
    if (!initialAttacker || !initialVictim) return 0;

    let gain = [pieceValues[initialVictim.toLowerCase()].mg];
    let currentBoard = board.map(row => row.slice());
    let currentAttacker = { piece: initialAttacker, r: fromR, c: fromC };
    let turn = state.turn;

    // Simulate the first capture
    currentBoard[toR][toC] = currentAttacker.piece;
    currentBoard[fromR][fromC] = null;

    while (true) {
        turn = (turn === 'w') ? 'b' : 'w'; // Switch sides for the recapture
        let attackers = getAttackers({ board: currentBoard }, toR, toC, turn);
        
        // If the other side has no more attackers, the exchange is over.
        if (attackers.length === 0) break;

        // The next attacker is the least valuable one.
        currentAttacker = attackers[0];
        
        // The value of the piece we are about to capture
        const capturedValue = pieceValues[currentBoard[toR][toC].toLowerCase()].mg;
        gain.push(capturedValue);

        // Simulate the recapture
        currentBoard[toR][toC] = currentAttacker.piece;
        currentBoard[currentAttacker.r][currentAttacker.c] = null;
    }

    // Negamax the gain list to find the final score from the perspective of the initial attacker.
    // A positive score means the exchange is favorable.
    let score = 0;
    for (let i = gain.length - 1; i > 0; i--) {
        score = gain[i] - score;
    }
    score = gain[0] - score;
    
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

// --- MASTER EVALUATION HUB (NOW WITH PIECE LISTS) ---
// This is the new, high-performance evaluation function.
function evaluate(state) {
    // We get the board AND the piece lists directly from the state
    const { board, pieceLists } = state; 
    const gamePhase = getGamePhase(board);

    let whiteScore = new TaperedScore();
    let blackScore = new TaperedScore();

    // --- REMOVED THE SLOW PART ---
    // The big loop that created pieceData is GONE.
    // We now pass state.pieceLists directly to the helper functions.
    const pieceData = pieceLists; 
    const whitePawnFiles = new Set(pieceData.P.map(sq => sq % 8));
    const blackPawnFiles = new Set(pieceData.p.map(sq => sq % 8));

    // 1. Base Material and Positional Score (Now much faster)
    for (const piece in pieceLists) {
        const pType = piece.toLowerCase();
        const isWhite = piece.toUpperCase() === piece;
        const scoreTarget = isWhite ? whiteScore : blackScore;
        
        for (const squareIndex of pieceLists[piece]) {
            const r = Math.floor(squareIndex / 8);
            const c = squareIndex % 8;
            
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
    
    // 2. Advanced Strategic Bonuses
    whiteScore.add(evaluateStrategicBonuses(state, 'w', pieceData, whitePawnFiles, blackPawnFiles));
    blackScore.add(evaluateStrategicBonuses(state, 'b', pieceData, blackPawnFiles, whitePawnFiles));

    // 3. Threat Analysis
    whiteScore.subtract(evaluateThreats(state, 'w', pieceData));
    blackScore.subtract(evaluateThreats(state, 'b', pieceData));

    // 4. Endgame-Specific Factors
    whiteScore.add(evaluateEndgameFactors(state, 'w', pieceData));
    blackScore.add(evaluateEndgameFactors(state, 'b', pieceData));
    
    // 5. King Safety
    if (state.kingPos.w) whiteScore.subtract(evaluateKingSafety(state, state.kingPos.w, 'b', pieceData));
    if (state.kingPos.b) blackScore.subtract(evaluateKingSafety(state, state.kingPos.b, 'w', pieceData));
    
    // 6. Final Tapered Score
    const finalWhite = (whiteScore.mg * gamePhase) + (whiteScore.eg * (1 - gamePhase));
    const finalBlack = (blackScore.mg * gamePhase) + (blackScore.eg * (1 - gamePhase));
    const evaluation = Math.round(finalWhite - finalBlack);
    return (state.turn === 'w' ? 1 : -1) * evaluation;
}


// --- evaluateStrategicBonuses (UPDATED FOR PIECE LISTS) ---
function evaluateStrategicBonuses(state, color, pieceData, friendlyPawnFiles, enemyPawnFiles) {
    const score = new TaperedScore();
    const isWhite = color === 'w';
    const startRank = isWhite ? 7 : 0;
    const myKingPos = isWhite ? state.kingPos.w : state.kingPos.b;
    
    const myPawns = isWhite ? pieceData.P : pieceData.p;
    for (const pawnSq of myPawns) {
        // Convert square index to row and column
        const r = Math.floor(pawnSq / 8);
        const c = pawnSq % 8;
        if (c === 3 || c === 4) { // d and e files
            if (r === (isWhite ? 4 : 3) || r === (isWhite ? 3 : 4)) {
                score.mg += 45;
            }
        }
    }
    
    const canCastleKingSide = isWhite ? state.castlingRights.w?.k : state.castlingRights.b?.k;
    const canCastleQueenSide = isWhite ? state.castlingRights.w?.q : state.castlingRights.b?.q;
    const canStillCastle = canCastleKingSide || canCastleQueenSide;

    let hasCastled = false;
    let kingOnStartSquare = false;

    if (myKingPos) {
        kingOnStartSquare = myKingPos.r === startRank && myKingPos.c === 4;
        if (myKingPos.r === startRank && (myKingPos.c === 6 || myKingPos.c === 2)) {
            hasCastled = true;
            score.add(new TaperedScore(myKingPos.c === 6 ? 90 : 70, 30));
        }
    }

    if (!kingOnStartSquare && !hasCastled && canStillCastle) {
        score.subtract(new TaperedScore(100, 30));
    }

    for (const knightSq of (isWhite ? pieceData.N : pieceData.n)) {
        const r = Math.floor(knightSq / 8);
        if (r !== startRank) score.add(new TaperedScore(30, 15));
    }
    for (const bishopSq of (isWhite ? pieceData.B : pieceData.b)) {
        const r = Math.floor(bishopSq / 8);
        if (r !== startRank) score.add(new TaperedScore(30, 15));
    }
    if ((isWhite ? pieceData.B : pieceData.b).length >= 2) {
        score.add(new TaperedScore(85, 110));
    }
    for (const rookSq of (isWhite ? pieceData.R : pieceData.r)) {
        const r = Math.floor(rookSq / 8);
        const c = rookSq % 8;
        if (!friendlyPawnFiles.has(c)) {
             score.add(new TaperedScore(enemyPawnFiles.has(c) ? 40 : 25, 20));
        }
        if (r === (isWhite ? 1 : 6)) {
            score.add(new TaperedScore(50, 60));
        }
    }

    const pawnFileCounts = new Map();
    for (const pawnSq of myPawns) {
        const c = pawnSq % 8; // Get column from square index
        pawnFileCounts.set(c, (pawnFileCounts.get(c) || 0) + 1);
        if (!friendlyPawnFiles.has(c - 1) && !friendlyPawnFiles.has(c + 1)) {
            score.subtract(new TaperedScore(25, 40));
        }
    }
    for (const count of pawnFileCounts.values()) {
        if (count > 1) {
            score.subtract(new TaperedScore(20 * (count - 1), 30 * (count - 1)));
        }
    }

    return score;
}

// --- evaluateEndgameFactors (UPDATED FOR PIECE LISTS) ---
function evaluateEndgameFactors(state, color, pieceData) {
    const score = new TaperedScore();
    const isWhite = color === 'w';
    const myKingPos = isWhite ? state.kingPos.w : state.kingPos.b;
    const enemyKingPos = isWhite ? state.kingPos.b : state.kingPos.w;
    if (!myKingPos || !enemyKingPos) return score;
    
    const kingCentrality = - (Math.abs(myKingPos.r - 3.5) + Math.abs(myKingPos.c - 3.5));
    score.eg += Math.round(kingCentrality * 15); 
    const kingProximity = 7 - (Math.abs(myKingPos.r - enemyKingPos.r) + Math.abs(myKingPos.c - enemyKingPos.c));
    score.eg += kingProximity * 8; 
    
    const friendlyPawns = isWhite ? pieceData.P : pieceData.p;
    const enemyPawns = isWhite ? pieceData.p : pieceData.P;
    
    for (const pSq of friendlyPawns) {
        // Convert square index to row and column
        const p_r = Math.floor(pSq / 8);
        const p_c = pSq % 8;
        let isPassed = true;
        for (const epSq of enemyPawns) {
            // Convert enemy pawn index
            const ep_r = Math.floor(epSq / 8);
            const ep_c = epSq % 8;
            if (Math.abs(ep_c - p_c) <= 1 && (isWhite ? ep_r < p_r : ep_r > p_r)) {
                isPassed = false;
                break;
            }
        }
        if (isPassed) {
            const rank = isWhite ? 7 - p_r : p_r;
            let bonus;
            if (rank === 6) {
                bonus = PROMOTION_IMMINENT_BONUS; 
            } else {
                bonus = [0, 20, 30, 50, 80, 150, 0, 0][rank]; 
            }
            score.mg += bonus;
            score.eg += bonus * 3;
            const kingPawnDist = Math.max(Math.abs(myKingPos.r - p_r), Math.abs(myKingPos.c - p_c));
            score.eg += (8 - kingPawnDist) * 10;
        }
    }
    return score;
}

// --- evaluateThreats (UPDATED FOR PIECE LISTS) ---
function evaluateThreats(state, color, pieceData) {
    const penalty = new TaperedScore();
    const isWhite = color === 'w';
    const ourPieceTypes = isWhite ? ['P', 'N', 'B', 'R', 'Q'] : ['p', 'n', 'b', 'r', 'q'];
    const enemyPieceTypes = isWhite ? ['p', 'n', 'b', 'r', 'q'] : ['P', 'N', 'B', 'R', 'Q'];
    const enemyColor = isWhite ? 'b' : 'w';

    for (const ourPType of ourPieceTypes) {
        const ourPieces = pieceData[ourPType];
        if (ourPieces.length === 0) continue;

        for (const enemyPType of enemyPieceTypes) {
            const enemyPieces = pieceData[enemyPType];
            if (enemyPieces.length === 0) continue;

            const ourValue = pieceValues[ourPType.toLowerCase()].mg;
            const enemyValue = pieceValues[enemyPType.toLowerCase()].mg;

            if (enemyValue >= ourValue) continue;

            for (const ourPieceSq of ourPieces) {
                // Convert our piece's square index
                const our_r = Math.floor(ourPieceSq / 8);
                const our_c = ourPieceSq % 8;
                for (const enemyPieceSq of enemyPieces) {
                    // Convert enemy piece's square index
                    const enemy_r = Math.floor(enemyPieceSq / 8);
                    const enemy_c = enemyPieceSq % 8;
                    if (isSquareAttackedByPiece(state.board, our_r, our_c, enemy_r, enemy_c, enemyColor)) {
                        const potentialLoss = ourValue - enemyValue;
                        const PENALTY_MULTIPLIER = 0.95; 
                        penalty.mg += potentialLoss * PENALTY_MULTIPLIER; 
                        penalty.eg += potentialLoss * PENALTY_MULTIPLIER;
                    }
                }
            }
        }
    }
    return penalty;
}

// --- evaluateKingSafety (UPDATED FOR PIECE LISTS) ---
function evaluateKingSafety(state, kingPos, attackerColor, pieceData) {
    const danger = new TaperedScore();
    if (!kingPos) return danger;

    const isAttackerWhite = attackerColor === 'w';
    const kingFile = kingPos.c;
    const kingRank = kingPos.r;
    
    const pawnShieldRank = isAttackerWhite ? 2 : 5;
    const shieldFiles = [kingFile - 1, kingFile, kingFile + 1];
    
    if (kingRank === (isAttackerWhite ? 0 : 7)) {
        for (const file of shieldFiles) {
            if (file < 0 || file > 7) continue;
            let shieldPawnFound = false;
            const defenderPawns = isAttackerWhite ? pieceData.p : pieceData.P;
            for (const pawnSq of defenderPawns) {
                // Convert pawn square index
                const r = Math.floor(pawnSq / 8);
                const c = pawnSq % 8;
                if (c === file) {
                    shieldPawnFound = true;
                    if (Math.abs(r - pawnShieldRank) > 1) {
                         danger.mg += 25;
                    }
                    break;
                }
            }
            if (!shieldPawnFound) {
                danger.mg += 60;
            }
        }
    }

    let attackWeight = 0;
    const attackerPieceTypes = isAttackerWhite ? ['Q', 'R', 'B', 'N'] : ['q', 'r', 'b', 'n'];
    const attackWeights = { q: 10, r: 6, b: 4, n: 4 };

    for (const pType of attackerPieceTypes) {
        for (const attackerSq of pieceData[pType]) {
            // Convert attacker square index
            const r = Math.floor(attackerSq / 8);
            const c = attackerSq % 8;
            const dist = Math.max(Math.abs(r - kingRank), Math.abs(c - kingFile));
            if (dist <= 4) {
                attackWeight += attackWeights[pType.toLowerCase()] * (5 - dist);
            }
        }
    }
    
    danger.mg += Math.pow(attackWeight, 1.5);
    danger.eg += attackWeight * 2;

    return danger;
}




// You will need this NEW HELPER function for evaluateKingSafety to work.
// It checks if a specific piece at (pr, pc) attacks a target square (tr, tc).
// --- CRITICAL REWRITE FOR SPEED AND INTEGRITY ---
// This function checks if a SPECIFIC piece at (pr, pc) attacks a TARGET square (tr, tc).

function isSquareAttackedByPiece(board, tr, tc, pr, pc, attackerColor) {
    const p = board[pr][pc];
    if (!p) return false;
    const pType = p.toLowerCase();
    const isWhiteAttacker = (p.toUpperCase() === p);
    
    // Safety check: ensure the piece being checked is of the correct color
    if (isWhiteAttacker !== (attackerColor === 'w')) return false;

    const dr = tr - pr;
    const dc = tc - pc;

    // 1. PAWN (The fastest check)
    if (pType === 'p') {
        const dir = isWhiteAttacker ? -1 : 1; // White moves -1 rank, Black moves +1 rank
        return dr === dir && Math.abs(dc) === 1;
    }

    // 2. KNIGHT (The second fastest check)
    if (pType === 'n') {
        const absDr = Math.abs(dr);
        const absDc = Math.abs(dc);
        return (absDr === 2 && absDc === 1) || (absDr === 1 && absDc === 2);
    }
    
    // 3. KING (The third fastest check)
    if (pType === 'k') {
        return Math.abs(dr) <= 1 && Math.abs(dc) <= 1;
    }

    // --- SLIDERS: Rook, Bishop, Queen ---
    
    // 4. ROOK/QUEEN (Vertical/Horizontal)
    if (dr === 0 || dc === 0) { // On a straight line
        if (pType === 'r' || pType === 'q') {
            const stepR = dr === 0 ? 0 : (dr > 0 ? 1 : -1);
            const stepC = dc === 0 ? 0 : (dc > 0 ? 1 : -1);
            
            for (let i = 1; i < 8; i++) {
                const nR = pr + i * stepR;
                const nC = pc + i * stepC;
                if (nR === tr && nC === tc) return true;
                if (board[nR]?.[nC]) break; // Path blocked by another piece
            }
        }
    }

    // 5. BISHOP/QUEEN (Diagonal)
    if (Math.abs(dr) === Math.abs(dc)) { // On a diagonal
        if (pType === 'b' || pType === 'q') {
            const stepR = dr > 0 ? 1 : -1;
            const stepC = dc > 0 ? 1 : -1;

            for (let i = 1; i < 8; i++) {
                const nR = pr + i * stepR;
                const nC = pc + i * stepC;
                if (nR === tr && nC === tc) return true;
                if (board[nR]?.[nC]) break; // Path blocked by another piece
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






// ====================================================================================
//            REPLACE YOUR OLD searchRoot() FUNCTION WITH THIS ONE
// ====================================================================================
// This version adds dynamic time management to think harder when tempted to repeat.
function searchRoot(initialState, maxDepth) {
    let bestMove = null;
    let bestScore = -Infinity;
    const moves = generateLegalMoves(initialState);
    const ABSOLUTE_MAX_TIME = 7000; // The hard 7-second ceiling you requested

    if (moves.length === 0) {
        return { bestMove: null, score: evaluate(initialState) };
    }

    let timerId = setTimeout(() => { stopSearch = true; }, timeLimit - 50);
    let repetitionFoundAsBestMove = false; // Flag to track if we're settling on a repetition

    for (let currentDepth = 1; currentDepth <= maxDepth; currentDepth++) {
        const orderedMoves = orderMoves(moves, initialState, bestMove, 0);
        let bestMoveForThisDepth = orderedMoves[0];
        const currentEval = evaluate(initialState);

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

        // *** NEW LOGIC: After searching a depth, check if the best move is a repetition ***
        repetitionFoundAsBestMove = false; // Reset flag for this depth
        if (bestMoveForThisDepth) {
            const unmakeInfo = makeMove(initialState, bestMoveForThisDepth);
            if (repetitionHistory.includes(initialState.zobristHash)) {
                 if (DEBUG_MODE) console.warn(`Engine wants to repeat at depth ${currentDepth}. Will consider extending time.`);
                 repetitionFoundAsBestMove = true;
            }
            unmakeMove(initialState, unmakeInfo);
        }

        // *** MODIFIED LOGIC: Check time and decide whether to extend ***
        if (stopSearch) {
            const elapsedTime = performance.now() - searchStartTime;
            // If we are about to stop due to time, BUT our best move is a repetition,
            // AND we are under the absolute time limit, then we grant an extension.
            if (repetitionFoundAsBestMove && elapsedTime < ABSOLUTE_MAX_TIME) {
                if (DEBUG_MODE) console.log(`REPETITION PENALTY: Extending search time to ${ABSOLUTE_MAX_TIME}ms max.`);
                
                // Keep searching by resetting the stop flag
                stopSearch = false;
                
                // Update the global time limit to the new hard ceiling
                timeLimit = ABSOLUTE_MAX_TIME;
                
                // Clear the old timer and set a new one for the remaining time
                clearTimeout(timerId);
                timerId = setTimeout(() => { stopSearch = true; }, timeLimit - elapsedTime);
            } else {
                // Otherwise, if no repetition or time is truly up, break as normal
                break;
            }
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



// ====================================================================================
//            REPLACE YOUR OLD search() FUNCTION WITH THIS ONE
// ====================================================================================
// This is the definitive, high-performance search function. It incorporates
// Late Move Reductions (LMR) and Futility Pruning, allowing it to search
// many plies deeper and avoid the reckless blunders seen previously.
function search(state, depth, alpha, beta, ply, previousMoveWasNull) {
    if ((nodeCount & 2047) === 0 && performance.now() - searchStartTime > timeLimit) stopSearch = true;
    if (stopSearch) return 0;

    // Repetition and draw checks remain the same
    /* B"H */

	// --- DYNAMIC CONTEMPT FACTOR (FIX FOR FORCED DRAWS) ---
	// This logic prevents the engine from accepting a draw in a winning position.
	
	/*const isRepetition = ply > 0 && repetitionHistory.includes(state.zobristHash);
	if (isRepetition) {
	    // We've found a repetition. Is it a good or bad thing?
	    // Get a quick evaluation of the current position to find out.
	    const currentEval = evaluate(state);
	    
	    // If we are in a winning position (eval > 150), a draw is a failure.
	    // Return a negative "contempt" score to discourage it.
	    if (currentEval > 150) {
	        return -200;
	    }
	    
	    // If we are in a losing position (eval < -150), a draw is a success.
	    // Return a positive score to encourage it.
	    if (currentEval < -150) {
	        return 200;
	    }
	    
	    // If the position is roughly equal, a draw is neutral. Return 0.
	    return 0; 
	}
	// This part handles the forced 3-fold repetition leading to an immediate draw claim.
	if (repetitionHistory.filter(h => h === state.zobristHash).length >= 2) {
	    return 0; // A forced draw is always 0.
	}*/
	    
    
    
    if (ply >= MATE_IN_MAX_PLY) return evaluate(state);

    // Transposition Table lookup
    const ttEntry = transpositionTable.get(state.zobristHash.toString());
    if (ttEntry && ttEntry.depth >= depth) {
        if (ttEntry.flag === TT_EXACT) return ttEntry.score;
        if (ttEntry.flag === TT_LOWERBOUND && ttEntry.score >= beta) return beta;
        if (ttEntry.flag === TT_UPPERBOUND && ttEntry.score <= alpha) return alpha;
    }

    nodeCount++;
    const inCheck = state.kingPos[state.turn] && isSquareAttacked(state.board, state.kingPos[state.turn].r, state.kingPos[state.turn].c, state.turn === 'w' ? 'b' : 'w');
    
    if (depth <= 0) return quiesce(state, alpha, beta, ply);

    // Increase depth if in check
    if (inCheck) depth++;

    // --- NEW: Futility Pruning ---
    // If we are near the search horizon (low depth) and the current evaluation is already
    // much worse than the best score we have (alpha), prune this branch.
    const staticEval = evaluate(state);
    if (!inCheck && depth <= 3) {
        const futilityMargin = [0, 200, 350, 550][depth];
        if (staticEval + futilityMargin <= alpha) {
            return alpha;
        }
    }

    // Null Move Pruning
    if (!inCheck && !previousMoveWasNull && ply > 0 && depth >= NULL_MOVE_R + 1 && staticEval >= beta) {
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
        // --- NEW: Late Move Reductions (LMR) ---
        // For moves ordered later in the list (i > 3), which are less likely to be good,
        // we initially search them with a reduced depth.
        if (depth >= 3 && i > 3 && !inCheck && !move.capture && !move.promotion) {
            let reduction = 1;
            // Increase reduction for very late moves
            if (i > 8) reduction = 2;
            
            // Search with reduced depth
            score = -search(state, depth - 1 - reduction, -alpha - 1, -alpha, ply + 1, false);
            
            // If this move is better than expected, we must re-search at full depth
            if (score > alpha) {
                score = -search(state, depth - 1, -alpha - 1, -alpha, ply + 1, false);
            }
        } else {
            // For the first few moves or tactical moves, do a full PVS search
            if (legalMovesFound === 1) { // First move is always a full window search
                score = -search(state, depth - 1, -beta, -alpha, ply + 1, false);
            } else { // Subsequent moves use a null-window search
                score = -search(state, depth - 1, -alpha - 1, -alpha, ply + 1, false);
                if (score > alpha && score < beta) { // Re-search if it fails high
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
            // This move caused a cutoff, so it's a "killer move"
            if (!move.capture) {
                // Shift existing killer move
                killerMoves[ply][1] = killerMoves[ply][0];
                killerMoves[ply][0] = move;
            }
            return beta; // Beta cutoff
        }
    }

    if (legalMovesFound === 0) {
        return inCheck ? -MATE_SCORE + ply : 0; // Checkmate or stalemate
    }

    // Save result to Transposition Table
    const flag = (bestScore > originalAlpha) ? TT_EXACT : TT_UPPERBOUND;
    transpositionTable.set(state.zobristHash.toString(), { score: bestScore, depth, flag, bestMove });
    return bestScore;
}





// ====================================================================================
//            REPLACE YOUR OLD quiesce() FUNCTION WITH THIS ONE
// ====================================================================================
// This new version is far more robust. It searches all captures AND all checks,
// preventing the engine from missing simple tactical replies and mates.
// It removes aggressive SEE pruning that was causing tactical blindness.
function quiesce(state, alpha, beta, ply, qDepth = 0) {
    if ((nodeCount & 2047) === 0 && performance.now() - searchStartTime > timeLimit) stopSearch = true;
    if (stopSearch) return 0;
    if (ply >= MATE_IN_MAX_PLY || qDepth >= Q_MAX_DEPTH) return evaluate(state);

    nodeCount++;
    const inCheck = state.kingPos[state.turn] && isSquareAttacked(state.board, state.kingPos[state.turn].r, state.kingPos[state.turn].c, state.turn === 'w' ? 'b' : 'w');

    // If we are not in check, the "stand-pat" score is an option.
    // The engine can choose to do nothing if the position is already good.
    if (!inCheck) {
        const standPat = evaluate(state);
        if (standPat >= beta) return beta;
        if (alpha < standPat) alpha = standPat;
    }

    const moves = generatePseudoLegalMoves(state);
    const tacticalMoves = [];

    // Generate a list of all tactical moves (captures, promotions, and checks)
    for (const move of moves) {
        if (move.capture || move.promotion) {
            tacticalMoves.push(move);
        } else if (!inCheck) { // Only add quiet checks if not already in check to avoid infinite loops
            const unmakeInfo = makeMove(state, move);
            const enemyKingPos = state.kingPos[state.turn];
            const isCheck = enemyKingPos && isSquareAttacked(state.board, enemyKingPos.r, enemyKingPos.c, state.turn === 'w' ? 'b' : 'w');
            unmakeMove(state, unmakeInfo);
            if (isCheck) {
                tacticalMoves.push(move);
            }
        }
    }
    
    // If in check, all legal moves must be considered.
    if(inCheck) {
         tacticalMoves.push(...moves);
    }

    // Order moves to search the most promising ones first (MVV-LVA)
    tacticalMoves.sort((a, b) => {
        let scoreA = a.promotion ? 10000 : (a.capture ? (pieceValues[a.capture.toLowerCase()].mg * 10) - pieceValues[a.piece.toLowerCase()].mg : 0);
        let scoreB = b.promotion ? 10000 : (b.capture ? (pieceValues[b.capture.toLowerCase()].mg * 10) - pieceValues[b.piece.toLowerCase()].mg : 0);
        return scoreB - scoreA;
    });

    for (const move of tacticalMoves) {
        const unmakeInfo = makeMove(state, move);

        // A full legality check is essential within quiescence search
        const originalTurn = state.turn === 'w' ? 'b' : 'w';
        const kingPos = state.kingPos[originalTurn];
        if (kingPos && isSquareAttacked(state.board, kingPos.r, kingPos.c, state.turn)) {
            unmakeMove(state, unmakeInfo);
            continue; // Skip illegal moves
        }
        
        repetitionHistory.push(state.zobristHash);
        const score = -quiesce(state, -beta, -alpha, ply + 1, qDepth + 1);
        repetitionHistory.pop();
        unmakeMove(state, unmakeInfo);

        if (stopSearch) return 0;
        if (score >= beta) return beta; // Fail-hard beta cutoff
        if (score > alpha) alpha = score;
    }

    // If we are in check and have no legal moves, it's checkmate.
    if (inCheck && alpha <= -MATE_SCORE) {
        return -MATE_SCORE + ply;
    }
    
    return alpha;
}



// ====================================================================================
//            REPLACE YOUR OLD orderMoves() FUNCTION WITH THIS CORRECTED VERSION
// ====================================================================================
function orderMoves(moves, state, pvMove, ply) {
    const moveScores = [];

    // Get the killer moves for the current depth, if they exist.
    const killer1 = killerMoves[ply] ? killerMoves[ply][0] : null;
    const killer2 = killerMoves[ply] ? killerMoves[ply][1] : null;

    for (const move of moves) {
        let score = 0;

        // 1. PV Move: Highest priority
        if (pvMove && move.from[0] === pvMove.from[0] && move.from[1] === pvMove.from[1] && move.to[0] === pvMove.to[0] && move.to[1] === pvMove.to[1]) {
            score = 1000000;
        }
        // 2. Captures and Promotions
        else if (move.capture || move.promotion) {
            if (move.promotion) {
                score = 900000 + pieceValues[move.promotion.toLowerCase()].mg;
            } else {
                const seeScore = see(state, move.from[0], move.from[1], move.to[0], move.to[1]);
                if (seeScore >= 0) {
                    score = 800000 + seeScore; // Good captures
                } else {
                    score = 10000 + seeScore; // Bad captures (searched after quiet moves)
                }
            }
        }
        // 3. Quiet Moves (Non-captures)
        else {
            // Killer Moves (Checked robustly now)
            if (killer1 && killer1.from[0] === move.from[0] && killer1.from[1] === move.from[1] && killer1.to[0] === move.to[0] && killer1.to[1] === move.to[1]) {
                score = 90000;
            } else if (killer2 && killer2.from[0] === move.from[0] && killer2.from[1] === move.from[1] && killer2.to[0] === move.to[0] && killer2.to[1] === move.to[1]) {
                score = 80000;
            }
            // History Heuristic
            else {
                score = historyTable[pieceMap.indexOf(move.piece)][move.to[0] * 8 + move.to[1]] || 0;
            }
        }
        moveScores.push({ move, score });
    }

    // Sort all moves based on their assigned score
    return moveScores.sort((a, b) => b.score - a.score).map(item => item.move);
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
/* B"H */
let isInitialized = false;

function initializeEngine() {
    if (isInitialized) return;
    
    console.log("Prometheus Engine: Initialization started.");
    initializeZobristKeys();

    const totalLines = sourceBook.length + punishmentBookSource.length;
    let linesProcessed = 0;

    // Callback function to report progress to the main thread
    const reportProgress = (countInCategory) => {
        linesProcessed++;
        const percentage = Math.round((linesProcessed / totalLines) * 100);
        self.postMessage({
            type: 'progress',
            percentage: percentage
        });
    };

    // Process the main grandmaster library
    const rawMainBook = generateRawBook(sourceBook, reportProgress);
    processRawBook(rawMainBook, openingBook);
    
    // The starting count for the next book is the end of the last one
    linesProcessed = sourceBook.length; 
    
    // Process the punishment library
    const rawPunishBook = generateRawBook(punishmentBookSource, reportProgress);
    processRawBook(rawPunishBook, punishmentBook);

    isInitialized = true;
    console.log("Prometheus Engine Initialized Successfully.");
    console.log(`Mainline Openings Loaded: ${openingBook.size}`);
    console.log(`Punishment Lines Loaded: ${punishmentBook.size}`);
    
    // Signal to the main thread that loading is complete.
    self.postMessage({ type: 'initialization_complete' });
}

/* B"H */

// --- REPLACE the entire self.onmessage function with this definitive, unified version ---

self.onmessage = function(e) {
    const { command } = e.data;

    // A consistent thinking time for analysis to keep it fast but deep. 3 seconds is a good balance.
    const ANALYSIS_THINKING_TIME = 3000; 

    // Use a switch to handle different commands from the main thread
    switch (command) {
        case 'initialize':
            initializeEngine();
            break;

        case 'set_debug':
            DEBUG_MODE = e.data.debug;
            break;
            
        case 'calculate_move': {
            // This is the "Playing" mode logic
            if (!isInitialized) {
                console.error("Engine received calculate_move command before it was initialized.");
                initializeEngine();
            }

            // It receives maxTime from main.js (which you set to 10 seconds)
            const { fen, maxDepth, maxTime } = e.data;

            initializeSearch(maxTime); // Use the provided time limit
            const initialState = createGameState(fen);
            repetitionHistory.push(initialState.zobristHash);
            
            // Book move logic remains the same...
            const currentHash = initialState.zobristHash.toString();
            if (openingBook.has(currentHash)) {
                // ... (book move code is unchanged)
                 const bookEntry = openingBook.get(currentHash);
                const bookMoves = bookEntry.moves;
                const openingName = bookEntry.name;
                const legalMoves = generateLegalMoves(initialState);

                const verifiedBookMoves = bookMoves.filter(bookMove => 
                    legalMoves.some(legalMove => 
                        legalMove.from[0] === bookMove.from[0] && legalMove.from[1] === bookMove.from[1] &&
                        legalMove.to[0] === bookMove.to[0] && legalMove.to[1] === bookMove.to[1]
                    )
                );

                if (verifiedBookMoves.length > 0) {
                    if (DEBUG_MODE) console.log(`**MAIN BOOK HIT**: Playing standard opening.`);
                    const randomVerifiedMove = verifiedBookMoves[Math.floor(Math.random() * verifiedBookMoves.length)];
                    postMessage({ type: 'move_result', bestMove: randomVerifiedMove, score: `Book Move: ${openingName}`, timeTaken: 0, nodesSearched: 0 });
                    return;
                }
            } else if (punishmentBook.has(currentHash)) {
                 // ... (punishment book code is unchanged)
                  const bookEntry = punishmentBook.get(currentHash);
                const bookMoves = bookEntry.moves;
                const trapName = bookEntry.name;
                const legalMoves = generateLegalMoves(initialState);

                const verifiedBookMoves = bookMoves.filter(bookMove => 
                    legalMoves.some(legalMove => 
                        legalMove.from[0] === bookMove.from[0] && legalMove.from[1] === bookMove.from[1] &&
                        legalMove.to[0] === bookMove.to[0] && legalMove.to[1] === bookMove.to[1]
                    )
                );

                if (verifiedBookMoves.length > 0) {
                    if (DEBUG_MODE) console.log(`**PUNISHMENT BOOK HIT**: Responding to opponent's mistake.`);
                    const randomVerifiedMove = verifiedBookMoves[Math.floor(Math.random() * verifiedBookMoves.length)];
                    postMessage({ type: 'move_result', bestMove: randomVerifiedMove, score: `Punish Move: ${trapName}`, timeTaken: 0, nodesSearched: 0 });
                    return;
                }
            }
            
            // If no book move, think until time runs out. Depth is set high so time is the only limit.
            const { bestMove, score } = searchRoot(initialState, 99, maxTime);
            postMessage({
                type: 'move_result',
                bestMove: bestMove, score: score,
                timeTaken: (performance.now() - searchStartTime).toFixed(2),
                nodesSearched: nodeCount
            });
            break;
        }
            
        case 'analyze_pgn':
            // This logic is unchanged
            const { pgnText } = e.data;
            const fenMatch = pgnText.match(/\[FEN\s+"(.*?)"\]/);
            const initialFen = fenMatch ? fenMatch[1] : "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
            let moveText = pgnText.replace(/\[.*?\]\s*|{.*?}|\d+\.\s*|\$\d+/g, '').replace(/\s+/g, ' ').trim();
            const movesSAN = moveText.split(' ').filter(m => m && !['1-0', '0-1', '1/2-1/2', '*'].includes(m));
            const validator = new PgnConverter();
            validator.currentState = createGameState(initialFen);
            const validatedMoves = [];
            const boardHistory = [initialFen];
            const openingNames = ["Starting Position"];
            for (const san of movesSAN) {
                const move = validator.parseSan(san);
                if (!move) {
                    postMessage({ type: 'analysis_error', message: `Invalid PGN: Could not parse move "${san}"` });
                    return;
                }
                validator.applyMove(move);
                validatedMoves.push(move);
                boardHistory.push(validator.toFen());
                const currentHash = calculateZobristHash(validator.currentState).toString();
                let foundName = null;
                if (openingBook.has(currentHash)) {
                    foundName = openingBook.get(currentHash).name;
                } else if (punishmentBook.has(currentHash)) {
                    foundName = punishmentBook.get(currentHash).name;
                }
                openingNames.push(foundName);
            }
            const gameData = {
                moves: validatedMoves,
                boardHistory: boardHistory,
                openingNames: openingNames,
                initialFen: initialFen
            };
            lastParsedGame = gameData;
            postMessage({
                type: 'analysis_result',
                moves: validatedMoves,
                boardHistory: boardHistory,
                openingNames: openingNames
            });
            break;

        /* B"H */

// --- REPLACE the 'run_engine_analysis' case with this final, memory-consistent version ---

case 'run_engine_analysis': {
    if (!lastParsedGame) {
        postMessage({ type: 'analysis_error', message: "No PGN has been loaded to analyze." });
        return;
    }

    console.log("Starting unified game analysis with shared memory...");
    const { moves, initialFen, openingNames } = lastParsedGame;
    const game = new PgnConverter();
    game.currentState = createGameState(initialFen);

    const ANALYSIS_THINKING_TIME = 3000;
    const BEST_MOVE_TOLERANCE = 40; 
    const MISTAKE_THRESHOLD = 90;   
    const BLUNDER_THRESHOLD = 250;  

    for (let i = 0; i < moves.length; i++) {
        const actualMove = moves[i];
        let classification = 'good';
        let bestMoveFound = null;

        const unmakeInfoForMateCheck = makeMove(game.currentState, actualMove);
        const isCheckmate = generateLegalMoves(game.currentState).length === 0 && isSquareAttacked(game.currentState.board, game.currentState.kingPos[game.currentState.turn].r, game.currentState.kingPos[game.currentState.turn].c, game.currentState.turn === 'w' ? 'b' : 'w');
        unmakeMove(game.currentState, unmakeInfoForMateCheck);
        
        const isBookMove = openingNames[i + 1] !== null && i < 30;

        if (isCheckmate || isBookMove) {
            classification = 'best';
            bestMoveFound = actualMove;
        } else {
            // *** THE CRITICAL CHANGE IS HERE ***
            // Initialize the search environment ONCE for this position.
            initializeSearch(ANALYSIS_THINKING_TIME * 2); // Give it enough total time for two searches
            repetitionHistory = [game.currentState.zobristHash];

            // Search 1: Find the best move. This will populate the transposition table (the memory).
            const searchResult = searchRoot(game.currentState, 99, ANALYSIS_THINKING_TIME);
            const bestMoveEval = searchResult.score;
            bestMoveFound = searchResult.bestMove;

            const playedIsBest = bestMoveFound && actualMove && (bestMoveFound.from[0] === actualMove.from[0] && bestMoveFound.from[1] === actualMove.from[1] && bestMoveFound.to[0] === actualMove.to[0] && bestMoveFound.to[1] === actualMove.to[1]);

            if (playedIsBest) {
                classification = 'best';
                bestMoveFound = actualMove;
            } else {
                // Search 2: Evaluate the user's move. 
                // We DO NOT re-initialize. This search will use the memory from the first search.
                const unmakeInfo = makeMove(game.currentState, actualMove);
                // We reset the stop flag and timer, but NOT the memory.
                stopSearch = false;
                searchStartTime = performance.now(); 
                // This search is now much faster and stronger because it uses the shared memory.
                const scoreForUserMove = -searchRoot(game.currentState, 99, ANALYSIS_THINKING_TIME).score;
                unmakeMove(game.currentState, unmakeInfo);
                
                const evalDrop = bestMoveEval - scoreForUserMove;

                if (evalDrop > BLUNDER_THRESHOLD) {
                    classification = 'blunder';
                } else if (evalDrop > MISTAKE_THRESHOLD) {
                    classification = 'mistake';
                } else if (evalDrop <= BEST_MOVE_TOLERANCE) {
                    classification = 'best';
                    bestMoveFound = actualMove; 
                } else {
                    classification = 'good';
                }
            }
        }

        game.applyMove(actualMove);
        self.postMessage({
            type: 'analysis_update',
            index: i,
            result: { classification: classification, bestMove: bestMoveFound }
        });
    }

    self.postMessage({ type: 'analysis_finished' });
    console.log("Full game analysis complete.");
    break;
}
    }
}

