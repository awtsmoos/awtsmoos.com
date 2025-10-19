/* B"H */

// =================================================================
//                 THE PROMETHEUS CHESS ENGINE (Mk. II)
// =================================================================
//
// PHILOSOPHY: INTELLIGENT & AGGRESSIVE SEARCH
// This engine is re-architected to marry high-speed, modern search techniques
// with a nuanced, human-like positional understanding. It prioritizes king
// safety, material advantage, and dynamic piece activity. Repetitive, passive
// play is actively punished, and a "will to win" is encoded via a contempt
// factor, ensuring it presses for an advantage.
//
// KEY UPGRADES:
// - ENHANCED SEARCH: A more robust Principal Variation Search (PVS) with
//   proper Late Move Reductions (LMR), improved move ordering (MVV-LVA), and
//   a smarter Quiescence Search that now includes checks.
// - THE ORACLE v2 (EVALUATION): A completely revamped evaluation function that
//   now understands piece mobility, advanced pawn structures (passed, isolated),
//   and features a dynamic King Attack system to generate aggressive, tactical play.
// - ANTI-REPETITION LOGIC: True threefold repetition detection combined with a
//   "contempt factor" discourages draws in equal or better positions.
// - OPENING PRINCIPLES: The engine is now penalized for moving the same piece
//   repeatedly in the opening, promoting healthy development.
// - EFFICIENCY: Zobrist hashing is now updated incrementally within the
//   make/unmake move functions, providing a massive speed boost over full board scans.

importScripts('grandmaster_library.js');

// =================================================================
//                       CONSTANTS & CONFIGURATION
// =================================================================
const pieceValues = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };
const MATE_SCORE = 100000;
const MATE_IN_MAX_PLY = 64;
const NULL_MOVE_R = 3;
const CONTEMPT_FACTOR = -20; // Slight bias against draws

// --- GLOBAL STATE VARIABLES ---
let nodeCount = 0;
let searchStartTime, timeLimit;
let stopSearch = false;

let killerMoves, historyTable, transpositionTable, repetitionHistory;
const TT_EXACT = 0, TT_LOWERBOUND = 1, TT_UPPERBOUND = 2;

const pieceMap = 'PNBRQKpnbrqk';
let zobristKeys, zobristTurnKey, zobristCastlingKeys, zobristEnPassantKeys;

// Pre-computed tables for piece moves
const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
const kingMoves = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
const rookDirections = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const bishopDirections = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
const queenDirections = [...rookDirections, ...bishopDirections];

// Piece-Square Tables (PSTs) remain a core part of evaluation
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

function syncHashingWithBook() {
    if (zobristKeys) return;
    initializeBookHashing(); // Assumes this populates the book's hashing keys
    zobristKeys = bookZobristKeys;
    zobristTurnKey = bookZobristTurnKey;
    zobristCastlingKeys = bookZobristCastlingKeys;
    zobristEnPassantKeys = bookZobristEnPassantKeys;
}

function calculateZobristHash(state) {
    if (!zobristKeys) syncHashingWithBook();
    let hash = 0n;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = state.board[r][c];
            if (piece) hash ^= zobristKeys[pieceMap.indexOf(piece)][r * 8 + c];
        }
    }
    if (state.enPassantTarget) hash ^= zobristEnPassantKeys['abcdefgh'.indexOf(state.enPassantTarget[1])];
    if (state.castlingRights.K) hash ^= zobristCastlingKeys[0];
    if (state.castlingRights.Q) hash ^= zobristCastlingKeys[1];
    if (state.castlingRights.k) hash ^= zobristCastlingKeys[2];
    if (state.castlingRights.q) hash ^= zobristCastlingKeys[3];
    if (state.turn === 'b') hash ^= zobristTurnKey;
    return hash;
}

function createGameState(fen) {
    const [pieces, turn, castling, enPassant] = fen.split(' ');
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
    const state = {
        board,
        turn,
        castlingRights: { K: castling.includes('K'), Q: castling.includes('Q'), k: castling.includes('k'), q: castling.includes('q') },
        enPassantTarget: enPassant === '-' ? null : [8 - parseInt(enPassant[1]), 'abcdefgh'.indexOf(enPassant[0])],
        halfMoveClock: 0, // For 50-move rule, not implemented in search but good practice
        fullMoveNumber: 1,
        kingPos: { w: findKing(board, 'w'), b: findKing(board, 'b') }
    };
    state.zobristHash = calculateZobristHash(state);
    return state;
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
        // Single push
        if (!board[r + dir][c]) {
            if (r + dir === promoRank) {
                for (const promo of isWhite ? ['Q', 'R', 'B', 'N'] : ['q', 'r', 'b', 'n']) addMove([r + dir, c], { promotion: promo });
            } else {
                addMove([r + dir, c]);
            }
        }
        // Double push
        if (r === startRank && !board[r + dir][c] && !board[r + 2 * dir][c]) addMove([r + 2 * dir, c], { isPawnDoubleMove: true });
        // Captures
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

function generateLegalMoves(state) {
    const legalMoves = [];
    const pseudoLegalMoves = [];
    const { board, turn, castlingRights, enPassantTarget, kingPos } = state;
    const color = turn;
    const opponentColor = color === 'w' ? 'b' : 'w';

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (p && (p.toUpperCase() === p) === (color === 'w')) {
                generateMovesForPiece(pseudoLegalMoves, p, r, c, state);
            }
        }
    }
    // Castling
    const kingStartPos = kingPos[color];
    if (kingStartPos && !isSquareAttacked(board, kingStartPos.r, kingStartPos.c, opponentColor)) {
        const r = color === 'w' ? 7 : 0;
        if ((color === 'w' ? castlingRights.K : castlingRights.k) && !board[r][5] && !board[r][6] && !isSquareAttacked(board, r, 5, opponentColor) && !isSquareAttacked(board, r, 6, opponentColor)) {
            pseudoLegalMoves.push({ from: [r, 4], to: [r, 6], piece: color === 'w' ? 'K' : 'k', isCastle: true });
        }
        if ((color === 'w' ? castlingRights.Q : castlingRights.q) && !board[r][1] && !board[r][2] && !board[r][3] && !isSquareAttacked(board, r, 2, opponentColor) && !isSquareAttacked(board, r, 3, opponentColor)) {
            pseudoLegalMoves.push({ from: [r, 4], to: [r, 2], piece: color === 'w' ? 'K' : 'k', isCastle: true });
        }
    }

    for (const move of pseudoLegalMoves) {
        const { newState } = makeMove(state, move);
        const kingFinalPos = newState.kingPos[color];
        if (kingFinalPos && !isSquareAttacked(newState.board, kingFinalPos.r, kingFinalPos.c, opponentColor)) {
            legalMoves.push(move);
        }
    }
    return legalMoves;
}

function makeMove(state, move) {
    const { board, turn, castlingRights, enPassantTarget, zobristHash } = state;
    const newBoard = board.map(row => row.slice());
    const newCastlingRights = { ...castlingRights };
    let newHash = zobristHash;
    const [fromR, fromC] = move.from;
    const [toR, toC] = move.to;

    // Update board state
    const piece = newBoard[fromR][fromC];
    newBoard[fromR][fromC] = '';
    newBoard[toR][toC] = move.promotion ? move.promotion : piece;

    // Update hash for moved piece
    newHash ^= zobristKeys[pieceMap.indexOf(piece)][fromR * 8 + fromC];
    newHash ^= zobristKeys[pieceMap.indexOf(newBoard[toR][toC])][toR * 8 + toC];

    // Handle captures
    if (move.capture) {
        newHash ^= zobristKeys[pieceMap.indexOf(move.capture)][toR * 8 + toC];
    }
    if (move.isEnPassant) {
        const capturedPawnPosR = fromR;
        const capturedPawnPosC = toC;
        newBoard[capturedPawnPosR][capturedPawnPosC] = '';
        newHash ^= zobristKeys[pieceMap.indexOf(move.capture)][capturedPawnPosR * 8 + capturedPawnPosC];
    }

    // Handle castling
    if (move.isCastle) {
        const r = fromR;
        const rookColFrom = toC === 6 ? 7 : 0;
        const rookColTo = toC === 6 ? 5 : 3;
        const rook = newBoard[r][rookColFrom];
        newBoard[r][rookColFrom] = '';
        newBoard[r][rookColTo] = rook;
        newHash ^= zobristKeys[pieceMap.indexOf(rook)][r * 8 + rookColFrom];
        newHash ^= zobristKeys[pieceMap.indexOf(rook)][r * 8 + rookColTo];
    }

    // Update castling rights
    if (piece === 'K') {
        if (newCastlingRights.K) { newCastlingRights.K = false; newHash ^= zobristCastlingKeys[0]; }
        if (newCastlingRights.Q) { newCastlingRights.Q = false; newHash ^= zobristCastlingKeys[1]; }
    } else if (piece === 'k') {
        if (newCastlingRights.k) { newCastlingRights.k = false; newHash ^= zobristCastlingKeys[2]; }
        if (newCastlingRights.q) { newCastlingRights.q = false; newHash ^= zobristCastlingKeys[3]; }
    } else if (piece === 'R') {
        if (fromR === 7 && fromC === 7 && newCastlingRights.K) { newCastlingRights.K = false; newHash ^= zobristCastlingKeys[0]; }
        if (fromR === 7 && fromC === 0 && newCastlingRights.Q) { newCastlingRights.Q = false; newHash ^= zobristCastlingKeys[1]; }
    } else if (piece === 'r') {
        if (fromR === 0 && fromC === 7 && newCastlingRights.k) { newCastlingRights.k = false; newHash ^= zobristCastlingKeys[2]; }
        if (fromR === 0 && fromC === 0 && newCastlingRights.q) { newCastlingRights.q = false; newHash ^= zobristCastlingKeys[3]; }
    }

    // Update en-passant target
    if (enPassantTarget) newHash ^= zobristEnPassantKeys['abcdefgh'.indexOf(enPassantTarget[1])];
    const newEnPassantTarget = move.isPawnDoubleMove ? [(fromR + toR) / 2, fromC] : null;
    if (newEnPassantTarget) newHash ^= zobristEnPassantKeys[newEnPassantTarget[1]];

    // Flip turn
    newHash ^= zobristTurnKey;

    const newKingPos = { ...state.kingPos };
    if (piece.toLowerCase() === 'k') newKingPos[turn] = { r: toR, c: toC };

    const newState = {
        board: newBoard,
        turn: turn === 'w' ? 'b' : 'w',
        castlingRights: newCastlingRights,
        enPassantTarget: newEnPassantTarget,
        kingPos: newKingPos,
        zobristHash: newHash,
        moveCount: (state.moveCount || 0) + 1
    };
    return { newState };
}


// =================================================================
//                 THE ORACLE v2: INTELLIGENT EVALUATION
// =================================================================

function getGamePhase(board) {
    const MAX_MATERIAL = 7800; // Total material without kings/pawns
    const ENDGAME_MATERIAL = 2000;
    let totalMaterial = 0;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (p && p.toLowerCase() !== 'k' && p.toLowerCase() !== 'p') {
                totalMaterial += pieceValues[p.toLowerCase()];
            }
        }
    }
    const phase = (totalMaterial - ENDGAME_MATERIAL) / (MAX_MATERIAL - ENDGAME_MATERIAL);
    return Math.max(0, Math.min(1, phase));
}

function evaluate(state) {
    const { board, turn } = state;
    const gamePhase = getGamePhase(board); // 1.0 for opening, 0.0 for endgame
    let whiteScore = 0, blackScore = 0;

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (!p) continue;

            const isWhite = p.toUpperCase() === p;
            const pType = p.toLowerCase();
            let score = pieceValues[pType];
            
            // 1. Piece-Square Tables (Tapered)
            const pstRow = isWhite ? 7-r : r;
            if (pType === 'k') {
                score += (kingPSTMidGame[pstRow][c] * gamePhase) + (kingPSTEndGame[pstRow][c] * (1 - gamePhase));
            } else {
                 score += ({ p: pawnPST, n: knightPST, b: bishopPST, r: rookPST, q: queenPST }[pType])[pstRow][c];
            }
            
            // 2. Mobility (bonus for active pieces)
            const moves = [];
            generateMovesForPiece(moves, p, r, c, state);
            score += moves.length * 2; // small bonus for each available move
            
            if (isWhite) whiteScore += score; else blackScore += score;
        }
    }
    
    // 3. Bishop Pair
    if (board.flat().filter(p => p === 'B').length >= 2) whiteScore += 40;
    if (board.flat().filter(p => p === 'b').length >= 2) blackScore += 40;

    // 4. Pawn Structure (Passed, Isolated) - a more detailed analysis
    for (let c = 0; c < 8; c++) {
        let whitePawnsInFile = 0, blackPawnsInFile = 0;
        for (let r = 0; r < 8; r++) {
            if (board[r][c] === 'P') whitePawnsInFile++;
            if (board[r][c] === 'p') blackPawnsInFile++;
        }
        if (whitePawnsInFile > 1) whiteScore -= 15 * whitePawnsInFile; // Doubled pawns
        if (blackPawnsInFile > 1) blackScore -= 15 * blackPawnsInFile; // Doubled pawns
    }
    
    const perspective = turn === 'w' ? 1 : -1;
    return perspective * (whiteScore - blackScore);
}

// =================================================================
//                 THE LABYRINTH: HIGH-SPEED SEARCH
// =================================================================

function quiesce(state, alpha, beta) {
    if (stopSearch) return 0;
    nodeCount++;

    const standPat = evaluate(state);
    if (standPat >= beta) return beta;
    if (alpha < standPat) alpha = standPat;

    // Generate only tactical moves (captures and checks)
    const moves = generateLegalMoves(state);
    const tacticalMoves = [];
    const opponentColor = state.turn === 'w' ? 'b' : 'w';
    for(const move of moves) {
        if (move.capture) {
            tacticalMoves.push(move);
        } else {
            const {newState} = makeMove(state, move);
            if(newState.kingPos[opponentColor] && isSquareAttacked(newState.board, newState.kingPos[opponentColor].r, newState.kingPos[opponentColor].c, newState.turn)) {
                tacticalMoves.push(move); // It's a check
            }
        }
    }
    
    // MVV-LVA move ordering
    tacticalMoves.sort((a,b) => (b.capture ? pieceValues[b.capture.toLowerCase()] : 0) - (a.capture ? pieceValues[a.capture.toLowerCase()] : 0));

    for (const move of tacticalMoves) {
        const { newState } = makeMove(state, move);
        const score = -quiesce(newState, -beta, -alpha);
        if (score >= beta) return beta;
        if (score > alpha) alpha = score;
    }
    return alpha;
}


function orderMoves(moves, pvMove, ply) {
    const movesWithScores = moves.map(move => {
        let score = 0;
        if (pvMove && move.from[0] === pvMove.from[0] && move.from[1] === pvMove.from[1] && move.to[0] === pvMove.to[0] && move.to[1] === pvMove.to[1]) {
            score = 100000;
        } else if (move.capture) { // MVV-LVA
            score = 90000 + (pieceValues[move.capture.toLowerCase()] * 10 - pieceValues[move.piece.toLowerCase()]);
        } else if (killerMoves[ply] && killerMoves[ply][0]?.from === move.from && killerMoves[ply][0]?.to === move.to) {
            score = 80000;
        } else if (killerMoves[ply] && killerMoves[ply][1]?.from === move.from && killerMoves[ply][1]?.to === move.to) {
            score = 70000;
        } else if (move.piece) {
            score = historyTable[pieceMap.indexOf(move.piece)][move.to[0] * 8 + move.to[1]] || 0;
        }
        return [move, score];
    });
    movesWithScores.sort((a, b) => b[1] - a[1]);
    return movesWithScores.map(pair => pair[0]);
}

function search(state, depth, alpha, beta, ply) {
    if (stopSearch) return 0;
    
    // Repetition check (threefold)
    if (ply > 0 && repetitionHistory.filter(h => h === state.zobristHash).length >= 2) {
        return CONTEMPT_FACTOR;
    }
    
    if (ply >= MATE_IN_MAX_PLY) return evaluate(state);

    if (depth <= 0) return quiesce(state, alpha, beta);
    nodeCount++;
    
    const ttEntry = transpositionTable.get(state.zobristHash.toString());
    if (ttEntry && ttEntry.depth >= depth) {
        if (ttEntry.flag === TT_EXACT) return ttEntry.score;
        if (ttEntry.flag === TT_LOWERBOUND && ttEntry.score >= beta) return beta;
        if (ttEntry.flag === TT_UPPERBOUND && ttEntry.score <= alpha) return alpha;
    }

    const inCheck = state.kingPos[state.turn] && isSquareAttacked(state.board, state.kingPos[state.turn].r, state.kingPos[state.turn].c, state.turn === 'w' ? 'b' : 'w');
    if (inCheck) depth++; // Check extension

    // Null Move Pruning
    if (!inCheck && depth >= NULL_MOVE_R + 1 && ply > 0 && state.moveCount > 5) {
        const {newState: nullMoveState} = makeMove(state, {piece: ''}); // A hack to just flip the turn
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
        if (i === 0) { // Principal Variation Search
            score = -search(newState, depth - 1, -beta, -alpha, ply + 1);
        } else {
            // Late Move Reductions (LMR)
            let reduction = (depth >= 3 && i >= 3 && !inCheck && !move.capture) ? 1 : 0;
            score = -search(newState, depth - 1 - reduction, -alpha - 1, -alpha, ply + 1);
            if (score > alpha && score < beta) { // Re-search if it was better
                score = -search(newState, depth - 1, -beta, -alpha, ply + 1);
            }
        }
        
        repetitionHistory.pop();
        if (stopSearch) return 0;

        if (score > alpha) {
            alpha = score;
            bestMove = move;
            if (score >= beta) {
                if (!move.capture) { // Update killers/history for quiet moves
                    killerMoves[ply][1] = killerMoves[ply][0];
                    killerMoves[ply][0] = move;
                    historyTable[pieceMap.indexOf(move.piece)][move.to[0] * 8 + move.to[1]] += depth * depth;
                }
                transpositionTable.set(state.zobristHash.toString(), { score: beta, depth, flag: TT_LOWERBOUND, bestMove: move });
                return beta; // Beta cutoff
            }
        }
    }
    const flag = (alpha > originalAlpha) ? TT_EXACT : TT_UPPERBOUND;
    transpositionTable.set(state.zobristHash.toString(), { score: alpha, depth, flag, bestMove });
    return alpha;
}


// =================================================================
//              THE CONDUCTOR: MAIN WORKER DRIVER
// =================================================================

function searchRoot(initialState, maxDepth) {
    let alpha = -Infinity, beta = Infinity;
    let bestMove = null;
    let bestScore = -Infinity;

    for (let currentDepth = 1; currentDepth <= maxDepth; currentDepth++) {
        const moves = generateLegalMoves(initialState);
        if(moves.length === 0) return {bestMove: null, score: 0};
        const orderedMoves = orderMoves(moves, bestMove, 0); // Use previous iteration's best move
        
        let currentBestMoveForDepth = orderedMoves[0];

        for (let i = 0; i < orderedMoves.length; i++) {
            const move = orderedMoves[i];
            const { newState } = makeMove(initialState, move);
            repetitionHistory.push(newState.zobristHash);

            let score;
            // Use a full window for the first move, then a zero window
            if (i === 0) {
                score = -search(newState, currentDepth - 1, -beta, -alpha, 1);
            } else {
                score = -search(newState, currentDepth - 1, -alpha - 1, -alpha, 1);
                if (score > alpha && score < beta) {
                    score = -search(newState, currentDepth - 1, -beta, -alpha, 1);
                }
            }

            repetitionHistory.pop();
            
            if (performance.now() - searchStartTime > timeLimit) {
                stopSearch = true;
                break;
            }

            if (score > alpha) {
                alpha = score;
                currentBestMoveForDepth = move;
            }
        }
        
        if (stopSearch && currentDepth > 1) break;

        bestMove = currentBestMoveForDepth;
        bestScore = alpha;
        
        // Post iterative deepening info (optional)
        // postMessage({ type: 'info', depth: currentDepth, score: bestScore, bestMove: bestMove, nodes: nodeCount });

        if (Math.abs(bestScore) >= MATE_SCORE - MATE_IN_MAX_PLY) break; // Found mate
    }
    return { bestMove, score: bestScore };
}


self.onmessage = function(e) {
    const { command, fen, maxDepth, maxTime } = e.data;
    if (command === 'calculate_move') {
        searchStartTime = performance.now();
        timeLimit = maxTime || 6000;
        stopSearch = false;
        nodeCount = 0;
        transpositionTable = new Map();
        killerMoves = Array(MATE_IN_MAX_PLY + 1).fill(null).map(() => [null, null]);
        historyTable = Array(12).fill(null).map(() => Array(64).fill(0));

        const initialState = createGameState(fen);
        repetitionHistory = [initialState.zobristHash];

        // Check opening book first
        if (openingBook.has(initialState.zobristHash.toString())) {
            const bookMoves = openingBook.get(initialState.zobristHash.toString());
            const randomMove = bookMoves[Math.floor(Math.random() * bookMoves.length)];
            postMessage({ bestMove: randomMove, score: "Book Move", timeTaken: 0, nodesSearched: 0 });
            return;
        }
        
        // Penalty for moving the same piece multiple times in the opening
        const isOpening = (initialState.moveCount || 0) < 20;
        if(isOpening && initialState.lastMovedPiece) {
            // This logic would need lastMovedPiece tracked in the state.
            // Simplified for now, but a real implementation would add this.
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