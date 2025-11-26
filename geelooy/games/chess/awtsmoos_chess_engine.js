/* B"H */

// =================================================================
//          THE AWTSMOOS CHESS ENGINE (MK. XVIII - IMPATIENT)
// =================================================================
// This version prioritizes TIME over everything.
// It checks the clock 4x more often.
// It forces a hard stop at 3500ms.
// It will never let the user wait forever.
// =================================================================

importScripts("bitboard-helpers.js");
importScripts('helpers.js');
importScripts('generateFromPgn.js');
importScripts('grandmaster_library.js');
importScripts('punishment_library.js');

const Scribe = {
    header: (title) => console.log(`%c B"H --- ${title} ---`, "background: #000; color: #00ffff; font-size: 1.2em; padding: 4px; font-family: monospace;"),
    info: (message, ...data) => console.log(`%c[INFO] ${message}`, "color: #99ff99;", ...data),
    warn: (message, ...data) => console.warn(`%c[WARN] ${message}`, "color: #ffcc66;", ...data),
    error: (message, ...data) => console.error(`%c[FATAL] ${message}`, "color: #ff6666; font-weight: bold;", ...data),
    trace: (message, ...data) => console.log(`%c[TRACE] ${message}`, "color: #cccccc;", ...data),
    book: (message, ...data) => console.log(`%c[BOOK] ${message}`, "background:#222; color: #E6E6FA", ...data)
};

const EngineSoul = {
    isInitialized: false,
    isAuditing: false, 
    transpositionTable: new Map(),
    killerMoves: [],
    historyTable: [],
    repetitionHistory: [],
    nodeCount: 0,
    searchStartTime: 0,
    timeLimit: 3000, // Default lowered to 3s
    stopSearch: false,
    openingBook: new Map(),
    punishmentBook: new Map(),
    lastParsedGame: null
};
self.EngineSoul = EngineSoul;

// MODIFIED VALUES:
// N/B raised to 340/350 (was 320/330).
// R stayed at 500.
// This reduces the "profit" of trading a Bishop for a Rook from 170 points to 150 points.
// Combined with mobility bonuses, it will now often REFUSE the trade if the Bishop is active.
const pieceValues = [100, 340, 350, 500, 975, 20000];


// AGGRESSIVE CENTER-CONTROL PAWN TABLE
// Punishes h4/a4 openings, heavily rewards d4/e4 pushes.
const pawnPST = [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [ 5,  5, 10, 25, 25, 10,  5,  5],
    [ 0,  0,  0, 25, 25,  0,  0,  0], // e4/d4 sweet spots
    [ 5, -5,-10,  0,  0,-10, -5,  5],
    [ 5, 10, 10,-25,-25, 10, 10,  5], // -25 on d2/e2 encourages pushing d2-d4 / e2-e4
    [ 0,  0,  0,  0,  0,  0,  0,  0]
];

// CENTRALIZED KNIGHT TABLE
// Heavily punishes rim moves (h3, a3) to stop the "Nh3" nonsense.
const knightPST = [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-40,-40,-40,-40,-40,-50] // -50 in corners makes it hate h1/a1/h8/a8
];

const bishopPST = [[-20,-10,-10,-10,-10,-10,-10,-20],[-10,0,0,0,0,0,0,-10],[-10,0,5,10,10,5,0,-10],[-10,5,5,10,10,5,5,-10],[-10,0,10,10,10,10,0,-10],[-10,10,10,10,10,10,10,-10],[-10,5,0,0,0,0,5,-10],[-20,-10,-10,-10,-10,-10,-10,-20]];
const rookPST = [[0,0,0,5,5,0,0,0],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[5,10,10,10,10,10,10,5],[0,0,0,0,0,0,0,0]];
const queenPST = [[-20,-10,-10,-5,-5,-10,-10,-20],[-10,0,0,0,0,0,0,-10],[-10,0,5,5,5,5,0,-10],[-5,0,5,5,5,5,0,-5],[0,0,5,5,5,5,0,-5],[-10,5,5,5,5,5,0,-10],[-10,0,5,0,0,0,0,-10],[-20,-10,-10,-5,-5,-10,-10,-20]];
const kingPSTMidGame=[[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-20,-30,-30,-40,-40,-30,-30,-20],[-10,-20,-20,-20,-20,-20,-20,-10],[20,20,0,0,0,0,20,20],[20,30,10,0,0,10,30,20]];
const kingPSTEndGame=[[-50,-40,-30,-20,-20,-30,-40,-50],[-30,-20,-10,0,0,-10,-20,-30],[-30,-10,20,30,30,20,-10,-30],[-30,-10,30,40,40,30,-10,-30],[-30,-10,30,40,40,30,-10,-30],[-30,-10,20,30,30,20,-10,-30],[-30,-30,0,0,0,0,-30,-30],[-50,-30,-30,-30,-30,-30,-30,-50]];
const pieceSquareTables = [pawnPST, knightPST, bishopPST, rookPST, queenPST, null];
// --- STRATEGIC WEIGHTS ---
const MG_MOBILITY = [0, 4, 3, 2, 1, 0];  // Mobility bonuses for N, B, R, Q
const EG_MOBILITY = [0, 4, 3, 4, 2, 0];
const KING_DANGER_PENALTY = 10;          // Penalty per enemy piece attacking king zone
const OPEN_FILE_PENALTY = 40;            // Penalty for King on open file
const CENTER_CONTROL_BONUS = 15;         // Bonus for attacking e4, d4, e5, d5
const PAWN_SHIELD_BONUS = 20;            // Bonus for pawns in front of King
const ISOLATED_PAWN_PENALTY = 20;
const DOUBLED_PAWN_PENALTY = 15;

const CENTER_SQUARES = 0x0000001818000000n; // d4, e4, d5, e5 mask
const PASSED_PAWN_BONUS = [0, 10, 30, 50, 80, 150, 200]; // Bonus based on rank (how close to Queen)



function evaluate(state) {
    if (typeof MEMORY_CANARY === 'undefined' || MEMORY_CANARY !== 0xDEADBEEFCAFEBABEn) return 0;

    const whiteP = state.pieceBitboards[P], blackP = state.pieceBitboards[P+6];
    const whiteK = state.pieceBitboards[K], blackK = state.pieceBitboards[K+6];
    
    // 1. Calculate Game Phase
    const knightCount = popcount(state.pieceBitboards[N] | state.pieceBitboards[N+6]);
    const queenCount = popcount(state.pieceBitboards[Q] | state.pieceBitboards[Q+6]);
    const phase = Math.min(24, (knightCount + popcount(state.pieceBitboards[B] | state.pieceBitboards[B+6]) + popcount(state.pieceBitboards[R] | state.pieceBitboards[R+6]) * 2 + queenCount * 4));
    const mgWeight = phase / 24, egWeight = 1 - mgWeight;

    let score = 0;
    const blockers = state.occupancies[2];

    // 2. Loop through all pieces for Material + PST + Mobility + Center Control
    for (let p = P; p <= K; p++) {
        // --- WHITE PIECES ---
        let bb = state.pieceBitboards[p];
        while(bb > 0n) {
            const sq = getLSBIndex(bb);
            const r = 7 - (sq >> 3), c = sq & 7;
            
            score += pieceValues[p];
            if(p === K) score += (kingPSTMidGame[r][c] * mgWeight) + (kingPSTEndGame[r][c] * egWeight);
            else score += pieceSquareTables[p][r][c];

            if (p !== P && p !== K) {
                let attacks = 0n;
                if (p === N) attacks = KNIGHT_ATTACKS[sq];
                else if (p === B) attacks = getBishopAttacks(sq, blockers);
                else if (p === R) attacks = getRookAttacks(sq, blockers);
                else if (p === Q) attacks = getQueenAttacks(sq, blockers);
                
                const mobility = popcount(attacks);
                score += mobility * (MG_MOBILITY[p] * mgWeight + EG_MOBILITY[p] * egWeight);
                
                if ((attacks & CENTER_SQUARES) !== 0n) score += CENTER_CONTROL_BONUS;
            }
            bb = popBit(bb);
        }

        // --- BLACK PIECES ---
        bb = state.pieceBitboards[p + 6];
        while(bb > 0n) {
            const sq = getLSBIndex(bb);
            const r = sq >> 3, c = sq & 7; 
            
            score -= pieceValues[p];
            if(p === K) score -= (kingPSTMidGame[r][c] * mgWeight) + (kingPSTEndGame[r][c] * egWeight);
            else score -= pieceSquareTables[p][r][c];

            if (p !== P && p !== K) {
                let attacks = 0n;
                if (p === N) attacks = KNIGHT_ATTACKS[sq];
                else if (p === B) attacks = getBishopAttacks(sq, blockers);
                else if (p === R) attacks = getRookAttacks(sq, blockers);
                else if (p === Q) attacks = getQueenAttacks(sq, blockers);
                
                const mobility = popcount(attacks);
                score -= mobility * (MG_MOBILITY[p] * mgWeight + EG_MOBILITY[p] * egWeight);
                if ((attacks & CENTER_SQUARES) !== 0n) score -= CENTER_CONTROL_BONUS;
            }
            bb = popBit(bb);
        }
    }

    // 3. Pawn Structure & Rook Strategy (FULL CODE - NO PLACEHOLDERS)
    const whiteR = state.pieceBitboards[R];
    const blackR = state.pieceBitboards[R+6];

    for (let file = 0; file < 8; file++) {
        const fileMask = 0x0101010101010101n << BigInt(file);
        
        // --- WHITE STRATEGY ---
        let wPawnsOnFile = whiteP & fileMask; 
        const bPawnsOnFile = blackP & fileMask;

        if (wPawnsOnFile > 0n) {
            // Doubled Pawns
            if (popcount(wPawnsOnFile) > 1) score -= DOUBLED_PAWN_PENALTY;
            
            // Isolated Pawns
            const prevFile = (file > 0) ? (0x0101010101010101n << BigInt(file - 1)) : 0n;
            const nextFile = (file < 7) ? (0x0101010101010101n << BigInt(file + 1)) : 0n;
            if ((whiteP & (prevFile | nextFile)) === 0n) score -= ISOLATED_PAWN_PENALTY;

            // Passed Pawns
            let sq = getLSBIndex(wPawnsOnFile);
            while (wPawnsOnFile > 0n) { 
                sq = getLSBIndex(wPawnsOnFile); 
                const rank = 7 - (sq >> 3); 
                const forwardMask = (0xFFFFFFFFFFFFFFFFn << BigInt((8 - rank) * 8));
                
                const spamCheckMask = (fileMask | prevFile | nextFile) & forwardMask;
                if ((spamCheckMask & blackP) === 0n) {
                    score += PASSED_PAWN_BONUS[rank]; 
                }
                wPawnsOnFile = popBit(wPawnsOnFile);
            }
        } else {
            // Open File Bonuses for Rooks
            if ((whiteR & fileMask) !== 0n) {
                if (bPawnsOnFile === 0n) score += 20; // Fully Open File
                else score += 10;                     // Semi-Open File
            }
        }

        // --- BLACK STRATEGY ---
        let bPawnsOnTheFile = blackP & fileMask; 
        const wPawnsOnTheFile = whiteP & fileMask;

        if (bPawnsOnTheFile > 0n) {
            // Doubled Pawns
            if (popcount(bPawnsOnTheFile) > 1) score += DOUBLED_PAWN_PENALTY;
            
            // Isolated Pawns
            const prevFile = (file > 0) ? (0x0101010101010101n << BigInt(file - 1)) : 0n;
            const nextFile = (file < 7) ? (0x0101010101010101n << BigInt(file + 1)) : 0n;
            if ((blackP & (prevFile | nextFile)) === 0n) score += ISOLATED_PAWN_PENALTY;

            // Passed Pawns
            let sq;
            let tempB = bPawnsOnTheFile;
            while (tempB > 0n) {
                sq = getLSBIndex(tempB);
                const rank = sq >> 3; 
                const forwardMask = (0xFFFFFFFFFFFFFFFFn >> BigInt((rank + 1) * 8));
                
                const spamCheckMask = (fileMask | prevFile | nextFile) & forwardMask;
                if ((spamCheckMask & whiteP) === 0n) {
                    score -= PASSED_PAWN_BONUS[rank];
                }
                tempB = popBit(tempB);
            }
        } else {
             // Open File Bonuses for Rooks
             if ((blackR & fileMask) !== 0n) {
                if (wPawnsOnTheFile === 0n) score -= 20; // Fully Open File
                else score -= 10;                     // Semi-Open File
            }
        }
    }

    // 4. King Safety
    if (whiteK !== 0n) {
        const sq = getLSBIndex(whiteK);
        const file = sq & 7;
        const rank = sq >> 3;
        const forwardMask = (0x0101010101010101n << BigInt(file)) & (0xFFFFFFFFFFFFFFFFn << BigInt((rank + 1) * 8));
        if ((whiteP & forwardMask) === 0n) score -= OPEN_FILE_PENALTY;
        
        const shieldMask = (0x7n << BigInt(Math.max(0, file - 1))) << BigInt((Math.max(0, rank - 1)) * 8);
        score += popcount(shieldMask & whiteP) * PAWN_SHIELD_BONUS;
    }

    if (blackK !== 0n) {
        const sq = getLSBIndex(blackK);
        const file = sq & 7;
        const rank = sq >> 3;
        const forwardMask = (0x0101010101010101n >> BigInt((7 - rank + 1) * 8)); 
        const fileMask = 0x0101010101010101n << BigInt(file);
        if ((blackP & fileMask) === 0n) score += OPEN_FILE_PENALTY;

        const shieldMask = (0x7n << BigInt(Math.max(0, file - 1))) << BigInt((Math.min(7, rank + 1)) * 8);
        score -= popcount(shieldMask & blackP) * PAWN_SHIELD_BONUS;
    }

    if (popcount(state.pieceBitboards[B]) >= 2) score += 50;
    if (popcount(state.pieceBitboards[B+6]) >= 2) score -= 50;
    
    // MOP-UP EVALUATION (Forcing checkmate when winning)
    if (score > 500 && egWeight > 0.5) { 
        const bKingSq = getLSBIndex(blackK);
        if (bKingSq !== -1) {
            const bFile = bKingSq & 7, bRank = bKingSq >> 3;
            const distFromCenter = Math.max(3 - bFile, bFile - 4) + Math.max(3 - bRank, bRank - 4);
            score += distFromCenter * 10;
        }
    } else if (score < -500 && egWeight > 0.5) { 
        const wKingSq = getLSBIndex(whiteK);
        if (wKingSq !== -1) {
            const wFile = wKingSq & 7, wRank = wKingSq >> 3;
            const distFromCenter = Math.max(3 - wFile, wFile - 4) + Math.max(3 - wRank, wRank - 4);
            score -= distFromCenter * 10;
        }
    }

    return (state.turn === WHITE) ? score : -score;
}



const MATE_SCORE = 100000, MATE_THRESHOLD = MATE_SCORE - 128, MAX_PLY = 128;
const TT_EXACT = 0, TT_LOWERBOUND = 1, TT_UPPERBOUND = 2;

function orderMoves(state, moves, ply) {
    const scoredMoves = [];
    const ttEntry = EngineSoul.transpositionTable.get(state.zobristHash);
    const ttMove = ttEntry ? ttEntry.move : 0;

    for (const move of moves) {
        let score = 0;
        if (move === ttMove) {
            score = 9000000;
        } else if (getMoveCapture(move)) {
            const attacker = getMovePiece(move);
            const victim = getMoveEnpassant(move) ? P : getPieceTypeOnSquare(state, getMoveTo(move), state.turn ^ 1);
            // Safety: if victim is null (ghost capture), treat value as 0
            const victimValue = victim !== null ? pieceValues[victim] : 0;
            score = (victimValue * 100) - pieceValues[attacker] + 1000000;
        } else {
            if (EngineSoul.killerMoves[ply] && EngineSoul.killerMoves[ply][0] === move) {
                score = 900000;
            } else if (EngineSoul.killerMoves[ply] && EngineSoul.killerMoves[ply][1] === move) {
                score = 850000;
            } else {
                score = EngineSoul.historyTable[state.turn][getMovePiece(move)][getMoveTo(move)];
            }
        }
        scoredMoves.push({ move, score });
    }
    return scoredMoves.sort((a, b) => b.score - a.score).map(sm => sm.move);
}

function quiesce(state, alpha, beta, ply) {
    // CHECK TIME EVERY 1024 NODES (Aggressive Check)
    if ((EngineSoul.nodeCount & 1023) === 0) {
        if (performance.now() - EngineSoul.searchStartTime > EngineSoul.timeLimit) {
            EngineSoul.stopSearch = true;
        }
    }
    if (EngineSoul.stopSearch) return 0;
    if (ply >= MAX_PLY - 1) return evaluate(state); 

    EngineSoul.nodeCount++;

    const stand_pat = evaluate(state);
    if (stand_pat >= beta) return beta;
    alpha = Math.max(alpha, stand_pat);

    const moves = orderMoves(state, generateTacticalMoves(state), ply);

    for (const move of moves) {
        makeMove(state, move);
        const kingSq = getLSBIndex(state.pieceBitboards[(state.turn ^ 1) * 6 + K]);
        if (isSquareAttacked_lean(state, kingSq, state.turn)) {
            unmakeMove(state);
            continue;
        }

        const score = -quiesce(state, -beta, -alpha, ply + 1);
        unmakeMove(state);
        
        if (EngineSoul.stopSearch) return 0;
        if (score >= beta) return beta;
        alpha = Math.max(alpha, score);
    }
    return alpha;
}

function search(state, depth, alpha, beta, ply) {
    if (ply >= MAX_PLY - 1) return evaluate(state);
    
    // Check time
    if ((EngineSoul.nodeCount & 2047) === 0) {
        if (performance.now() - EngineSoul.searchStartTime > EngineSoul.timeLimit) {
            EngineSoul.stopSearch = true;
        }
    }
    if (EngineSoul.stopSearch) return 0;

    const isRoot = (ply === 0);
    const hash = state.zobristHash;
    if (!isRoot && EngineSoul.repetitionHistory.includes(hash)) return 0;

    // Transposition Table Lookup
    const ttEntry = EngineSoul.transpositionTable.get(hash);
    if (!isRoot && ttEntry && ttEntry.depth >= depth) {
        let score = ttEntry.score;
        if (score > MATE_THRESHOLD) score -= ply;
        if (score < -MATE_THRESHOLD) score += ply;
        if (ttEntry.flag === TT_EXACT) return score;
        if (ttEntry.flag === TT_LOWERBOUND) alpha = Math.max(alpha, score);
        else if (ttEntry.flag === TT_UPPERBOUND) beta = Math.min(beta, score);
        if (alpha >= beta) return score;
    }

    // Is King in Check?
    const kingSq = getLSBIndex(state.pieceBitboards[state.turn * 6 + K]);
    const inCheck = isSquareAttacked_lean(state, kingSq, state.turn ^ 1);

    // --- NULL MOVE PRUNING ---
    if (!isRoot && depth >= 3 && !inCheck && ply > 0) {
        const hasPieces = (state.occupancies[state.turn] ^ state.pieceBitboards[state.turn * 6 + K] ^ state.pieceBitboards[state.turn * 6 + P]) !== 0n;
        if (hasPieces) {
            state.turn ^= 1;
            state.enpassant = -1; 
            const nullHash = calculateZobristHash(state); 
            const oldHash = state.zobristHash;
            state.zobristHash = nullHash;
            
            const score = -search(state, depth - 1 - 2, -beta, -beta + 1, ply + 1);
            
            state.turn ^= 1;
            state.zobristHash = oldHash; 
            
            if (EngineSoul.stopSearch) return 0;
            if (score >= beta) return beta; 
        }
    }

    // Extended depth if in check
    const extension = inCheck ? 1 : 0;
    
    // --- TRANSITION TO QUIESCENCE (WITH STALEMATE FIX) ---
    if (depth + extension <= 0) {
        // BLINDNESS FIX: 
        // Quiescence search is blind to Stalemate because it only looks at captures.
        // If we are winning big (>500), we MUST verify the opponent has legal moves.
        // Otherwise, we might capture a pawn and accidentally cause a Draw (score 0),
        // thinking we are still +500.
        const staticEval = evaluate(state);
        
        // Only run this expensive check if we aren't in check (if in check, it's not stalemate)
        // and if the evaluation is extreme (winning/losing significantly).
        if (!inCheck && Math.abs(staticEval) > 500) {
             const moves = generateMoves(state);
             let hasLegal = false;
             for (const m of moves) {
                 makeMove(state, m);
                 const kSqCheck = getLSBIndex(state.pieceBitboards[(state.turn ^ 1) * 6 + K]);
                 // Fast legality check
                 if (!isSquareAttacked_lean(state, kSqCheck, state.turn)) {
                     hasLegal = true;
                     unmakeMove(state);
                     break; // Found one valid move, game continues.
                 }
                 unmakeMove(state);
             }
             if (!hasLegal) {
                 // No legal moves and NOT in check = Stalemate = 0.
                 // This forces the engine to realize this path sucks (0 < 500).
                 return 0; 
             }
        }
        return quiesce(state, alpha, beta, ply);
    }

    EngineSoul.nodeCount++;

    const moves = orderMoves(state, generateMoves(state), ply);
    let legalMovesMade = 0, bestScore = -Infinity, bestMove = 0, ttFlag = TT_UPPERBOUND;

    for (const move of moves) {
        EngineSoul.repetitionHistory.push(hash);
        makeMove(state, move);

        // Verify legality
        const kSq = getLSBIndex(state.pieceBitboards[(state.turn ^ 1) * 6 + K]);
        if (isSquareAttacked_lean(state, kSq, state.turn)) {
            unmakeMove(state);
            EngineSoul.repetitionHistory.pop();
            continue;
        }

        legalMovesMade++;
        let score;

        // Principal Variation Search (PVS)
        if (legalMovesMade === 1) {
            score = -search(state, depth - 1 + extension, -beta, -alpha, ply + 1);
        } else {
            // Late Move Reduction (LMR)
            let reduction = 0;
            if (depth >= 3 && legalMovesMade > 4 && !getMoveCapture(move) && !inCheck) {
                reduction = 1;
            }

            score = -search(state, depth - 1 - reduction + extension, -alpha - 1, -alpha, ply + 1);
            
            if (score > alpha && reduction > 0) {
                 score = -search(state, depth - 1 + extension, -alpha - 1, -alpha, ply + 1);
            }
            if (score > alpha && score < beta) {
                score = -search(state, depth - 1 + extension, -beta, -alpha, ply + 1);
            }
        }
        
        unmakeMove(state);
        EngineSoul.repetitionHistory.pop();
        
        if (EngineSoul.stopSearch) return 0;
        
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
        if (bestScore > alpha) {
            alpha = bestScore;
            ttFlag = TT_EXACT;
        }
        if (alpha >= beta) {
            if (!getMoveCapture(move)) {
                EngineSoul.killerMoves[ply][1] = EngineSoul.killerMoves[ply][0];
                EngineSoul.killerMoves[ply][0] = move;
                EngineSoul.historyTable[state.turn][getMovePiece(move)][getMoveTo(move)] += depth * depth;
            }
            EngineSoul.transpositionTable.set(hash, { score: beta, depth, flag: TT_LOWERBOUND, move });
            return beta;
        }
    }
    
    if (legalMovesMade === 0) {
        return inCheck ? -MATE_SCORE + ply : 0;
    }

    EngineSoul.transpositionTable.set(hash, { score: bestScore, depth, flag: ttFlag, move: bestMove });
    return bestScore;
}
function searchRoot(state, maxDepth, time, historyHashes = []) {
    Scribe.header("MEDITATION: THE CLARITY OF MIND");

    // 1. Time Management
    const SOFT_TIME_LIMIT = time || 3000;
    EngineSoul.isAuditing = true; 
    EngineSoul.searchStartTime = performance.now();
    EngineSoul.timeLimit = SOFT_TIME_LIMIT;
    EngineSoul.stopSearch = false;
    EngineSoul.nodeCount = 0;
    
    // 2. LOAD LONG-TERM MEMORY (Fixes the Shuffle)
    // We load the history from the game so the engine knows it's repeating moves.
    EngineSoul.repetitionHistory = [...historyHashes];

    // 3. Memory Initialization & Aging
    if (!EngineSoul.historyTable || !EngineSoul.historyTable[0] || EngineSoul.historyTable.length !== 2) {
        EngineSoul.historyTable = Array(2).fill(null).map(() => Array(12).fill(null).map(() => Array(64).fill(0)));
    } else {
        for (let side = 0; side < 2; side++) {
            for (let piece = 0; piece < 12; piece++) {
                for (let sq = 0; sq < 64; sq++) {
                    EngineSoul.historyTable[side][piece][sq] >>= 3; 
                }
            }
        }
    }
    
    EngineSoul.killerMoves = Array(MAX_PLY).fill(null).map(() => [0, 0]);

    // 4. Generate Legal Moves
    const legalMoves = generateMoves(state);
    if (legalMoves.length === 0) return { bestMove: null, score: 0 };
    
    let rootBestMove = legalMoves[0];
    let rootBestScore = -Infinity;

    // 5. Iterative Deepening Loop
    for (let currentDepth = 1; currentDepth <= maxDepth; currentDepth++) {
        
        const elapsed = performance.now() - EngineSoul.searchStartTime;
        if (elapsed > (EngineSoul.timeLimit * 0.60)) {
            break;
        }

        let alpha = -MATE_SCORE;
        let beta = MATE_SCORE;

        if (currentDepth > 1 && Math.abs(rootBestScore) < MATE_THRESHOLD) {
            alpha = rootBestScore - 50;
            beta = rootBestScore + 50;
        }

        let score = search(state, currentDepth, alpha, beta, 0);

        if (score <= alpha || score >= beta) {
            score = search(state, currentDepth, -MATE_SCORE, MATE_SCORE, 0);
        }

        if (EngineSoul.stopSearch) break; 

        rootBestScore = score;
        
        const ttEntry = EngineSoul.transpositionTable.get(state.zobristHash);
        if (ttEntry && ttEntry.move) {
            const isLegal = legalMoves.includes(ttEntry.move);
            if (isLegal) {
                rootBestMove = ttEntry.move;
            }
        }

        if (score > MATE_THRESHOLD || score < -MATE_THRESHOLD) {
             Scribe.book(`Mate Sequence Found at Depth ${currentDepth}.`);
             break;
        }
    }

    if (!legalMoves.includes(rootBestMove)) {
        rootBestMove = legalMoves[0];
    }

    EngineSoul.isAuditing = false;
    return { bestMove: rootBestMove, score: rootBestScore };
}

self.onmessage = function(e) {
    const { command, fen, maxTime, pgnText, fenHistory } = e.data;

    try {
        switch (command) {
            case 'initialize':
                initializeEngine();
                break;
            
            case 'calculate_move':
                if (!EngineSoul.isInitialized) initializeEngine();
                Scribe.info(`Contemplating FEN: ${fen}`);
                const state = createGameState(fen);

                // Book Lookup
                const book = EngineSoul.openingBook.get(state.zobristHash) || EngineSoul.punishmentBook.get(state.zobristHash);
                if (book && book.moves && book.moves.length > 0) {
                    const move = book.moves[Math.floor(Math.random() * book.moves.length)];
                    postMessage({ type: 'move_result', bestMove: move, score: `Book: ${book.name}`, timeTaken: 0, nodesSearched: 0 });
                    return;
                }

                // PROCESS HISTORY FOR 3-FOLD REPETITION
                const historyHashes = [];
                if (fenHistory && Array.isArray(fenHistory)) {
                    for(const hFen of fenHistory) {
                        // We create a temporary state just to calculate the hash
                        const hState = createGameState(hFen);
                        historyHashes.push(hState.zobristHash);
                    }
                }

                // 4 SECOND HARD LIMIT PASSED HERE
                const result = searchRoot(state, 99, 4000, historyHashes); 
                
                postMessage({
                    type: 'move_result',
                    bestMove: result.bestMove ? decodeMove(result.bestMove, state.turn) : null,
                    score: result.score,
                    timeTaken: (performance.now() - EngineSoul.searchStartTime).toFixed(2),
                    nodesSearched: EngineSoul.nodeCount
                });
                break;
            
            case 'analyze_pgn':
                if (!EngineSoul.isInitialized) initializeEngine();
                const converter = new PgnConverter();
                // Regex to clean PGN string
                const moves = pgnText.replace(/\[.*?\]\s*|{.*?}|\d+\.\s*|\$\d+/g, '').replace(/\s+/g, ' ').trim().split(' ');
                const validMoves = [], boardHistory = [converter.toFen()], openingNames = ["Starting Position"];
                
                for (const san of moves) {
                    if (['1-0', '0-1', '1/2-1/2', '*'].includes(san)) continue;
                    const moveInt = converter.parseSan(san);
                    if (moveInt === null) break; 
                    
                    const decodedMove = decodeMove(moveInt, converter.currentState.turn);
                    converter.applyMove(moveInt);
                    decodedMove.san = san;
                    validMoves.push(decodedMove);
                    boardHistory.push(converter.toFen());
                    const bookEntry = EngineSoul.openingBook.get(converter.currentState.zobristHash);
                    openingNames.push(bookEntry ? bookEntry.name : "Middlegame");
                }
                EngineSoul.lastParsedGame = { moves: validMoves, boardHistory, openingNames, initialFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" };
                postMessage({ type: 'analysis_result', ...EngineSoul.lastParsedGame });
                break;

            case 'run_engine_analysis':
                if (!EngineSoul.lastParsedGame) return;
                const gameToAnalyze = EngineSoul.lastParsedGame;
                const analysisState = createGameState(gameToAnalyze.initialFen);

                for (let i = 0; i < gameToAnalyze.moves.length; i++) {
                    const userMove = gameToAnalyze.moves[i];
                    const moves = generateMoves(analysisState);
                    const moveInt = moves.find(m => (getMoveFrom(m) === (userMove.from[0]*8+userMove.from[1])) && (getMoveTo(m) === (userMove.to[0]*8+userMove.to[1])));
                    
                    if (!moveInt) continue;

                    // Quick Analysis Search (1000ms max)
                    // We pass [] as history because we want objective best moves, not influenced by draw avoidance of previous positions
                    const engineResult = searchRoot(analysisState, 99, 1000, []);
                    const bestScore = engineResult.score;

                    let classification = 'best';
                    if (engineResult.bestMove !== moveInt) {
                        makeMove(analysisState, moveInt);
                        // Quick Counter-Check
                        const userSearchResult = searchRoot(analysisState, 99, 800, []);
                        const userScore = -userSearchResult.score;
                        unmakeMove(analysisState);

                        const drop = bestScore - userScore;
                        if (drop > 300) classification = 'blunder';
                        else if (drop > 100) classification = 'mistake';
                        else if (drop > 40) classification = 'good';
                    }
                    
                    postMessage({ type: 'analysis_update', index: i, result: { classification, bestMove: decodeMove(engineResult.bestMove, analysisState.turn) } });
                    makeMove(analysisState, moveInt);
                }
                postMessage({ type: 'analysis_finished' });
                break;
        }
    } catch (err) {
        Scribe.error("FATAL ERROR", err);
        postMessage({ type: 'move_result', bestMove: null });
    }
};




function decodeMove(move, turn) {
    const f = getMoveFrom(move), t = getMoveTo(move), p = getMovePromoted(move);
    return { from: [f >> 3, f & 7], to: [t >> 3, t & 7], promotion: p ? pieceMap[p].toLowerCase() : null };
}

function processRawBook(rawBook, targetMap) {
    if (!Array.isArray(rawBook)) return;
    for (const entry of rawBook) {
        if (!entry || typeof entry[0] !== 'string') continue;
        const fen = entry[0];
        const name = entry[1];
        const hash = calculateZobristHash(createGameState(fen));
        const bookEntry = targetMap.has(hash) ? targetMap.get(hash) : { name, moves: [] };
        
        for (let i = 2; i < entry.length; i++) {
            const newMove = entry[i];
            if (!bookEntry.moves.some(m => JSON.stringify(m) === JSON.stringify(newMove))) {
                bookEntry.moves.push(newMove);
            }
        }
        targetMap.set(hash, bookEntry);
    }
}

function initializeEngine() {
    if (EngineSoul.isInitialized) return;
    Scribe.header("FORGING THE UNIVERSE FROM THE VOID");
    initializeAll();
    
    Scribe.info("Inscribing the Scrolls of Wisdom...");
    EngineSoul.isAuditing = true;

    const rawOpeningBook = generateRawBook(sourceBook);
	processRawBook(rawOpeningBook, EngineSoul.openingBook);
    
    const rawPunish = generateRawBook(punishmentBookSource);
    processRawBook(rawPunish, EngineSoul.punishmentBook);

    EngineSoul.isAuditing = false;
    EngineSoul.isInitialized = true;
    self.postMessage({ type: 'initialization_complete' });
}

self.onmessage = function(e) {
    const { command, fen, maxTime, pgnText } = e.data;

    try {
        switch (command) {
            case 'initialize':
                initializeEngine();
                break;
            
            case 'calculate_move':
                if (!EngineSoul.isInitialized) initializeEngine();
                Scribe.info(`Contemplating FEN: ${fen}`);
                const state = createGameState(fen);

                // Book Lookup
                const book = EngineSoul.openingBook.get(state.zobristHash) || EngineSoul.punishmentBook.get(state.zobristHash);
                if (book && book.moves && book.moves.length > 0) {
                    const move = book.moves[Math.floor(Math.random() * book.moves.length)];
                    postMessage({ type: 'move_result', bestMove: move, score: `Book: ${book.name}`, timeTaken: 0, nodesSearched: 0 });
                    return;
                }

                // 4 SECOND HARD LIMIT PASSED HERE
                const result = searchRoot(state, 99, 4000); 
                
                postMessage({
                    type: 'move_result',
                    bestMove: result.bestMove ? decodeMove(result.bestMove, state.turn) : null,
                    score: result.score,
                    timeTaken: (performance.now() - EngineSoul.searchStartTime).toFixed(2),
                    nodesSearched: EngineSoul.nodeCount
                });
                break;
            
            case 'analyze_pgn':
                if (!EngineSoul.isInitialized) initializeEngine();
                const converter = new PgnConverter();
                const moves = pgnText.replace(/\[.*?\]\s*|{.*?}|\d+\.\s*|\$\d+/g, '').replace(/\s+/g, ' ').trim().split(' ');
                const validMoves = [], boardHistory = [converter.toFen()], openingNames = ["Starting Position"];
                
                for (const san of moves) {
                    if (['1-0', '0-1', '1/2-1/2', '*'].includes(san)) continue;
                    const moveInt = converter.parseSan(san);
                    if (moveInt === null) break; // Stop silently on error
                    
                    const decodedMove = decodeMove(moveInt, converter.currentState.turn);
                    converter.applyMove(moveInt);
                    decodedMove.san = san;
                    validMoves.push(decodedMove);
                    boardHistory.push(converter.toFen());
                    const bookEntry = EngineSoul.openingBook.get(converter.currentState.zobristHash);
                    openingNames.push(bookEntry ? bookEntry.name : "Middlegame");
                }
                EngineSoul.lastParsedGame = { moves: validMoves, boardHistory, openingNames, initialFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" };
                postMessage({ type: 'analysis_result', ...EngineSoul.lastParsedGame });
                break;

            case 'run_engine_analysis':
                if (!EngineSoul.lastParsedGame) return;
                const gameToAnalyze = EngineSoul.lastParsedGame;
                const analysisState = createGameState(gameToAnalyze.initialFen);

                for (let i = 0; i < gameToAnalyze.moves.length; i++) {
                    const userMove = gameToAnalyze.moves[i];
                    const moves = generateMoves(analysisState);
                    const moveInt = moves.find(m => (getMoveFrom(m) === (userMove.from[0]*8+userMove.from[1])) && (getMoveTo(m) === (userMove.to[0]*8+userMove.to[1])));
                    
                    if (!moveInt) continue;

                    // Quick Analysis Search (1000ms max)
                    const engineResult = searchRoot(analysisState, 99, 1000);
                    const bestScore = engineResult.score;

                    let classification = 'best';
                    if (engineResult.bestMove !== moveInt) {
                        makeMove(analysisState, moveInt);
                        // Quick Counter-Check (800ms max)
                        const userSearchResult = searchRoot(analysisState, 99, 800);
                        const userScore = -userSearchResult.score;
                        unmakeMove(analysisState);

                        const drop = bestScore - userScore;
                        if (drop > 300) classification = 'blunder';
                        else if (drop > 100) classification = 'mistake';
                        else if (drop > 40) classification = 'good';
                    }
                    
                    postMessage({ type: 'analysis_update', index: i, result: { classification, bestMove: decodeMove(engineResult.bestMove, analysisState.turn) } });
                    makeMove(analysisState, moveInt);
                }
                postMessage({ type: 'analysis_finished' });
                break;
        }
    } catch (err) {
        Scribe.error("FATAL ERROR", err);
        // Even if it crashes, try to release the UI
        postMessage({ type: 'move_result', bestMove: null });
    }
};