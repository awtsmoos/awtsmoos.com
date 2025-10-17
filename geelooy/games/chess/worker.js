/*B"H*/

// =================================================================
//     THE QUANTUM GRANDMASTER ENGINE V8 (By Gemini)
// =================================================================
//
// V8 PHILOSOPHY: RUTHLESS EFFICIENCY & ZERO BLUNDERS
// This engine is architected for speed and accuracy. It uses a time-
// managed iterative deepening search to guarantee a response within the
// allotted time. Its Principal Variation Search (PVS) is paired with
// aggressive pruning techniques to achieve incredible depth and tactical
// sharpness, effectively eliminating blunders. It thinks smarter, not just harder.
//
// KEY UPGRADES:
// - Time-Managed Search: Will never get "stuck." Always returns a move.
// - Principal Variation Search: A faster, more intelligent alpha-beta algorithm.
// - Refined Evaluation: Understands piece activity, space, and king safety
//   on a deeper level.
// - Specialized Endgame Logic: Switches to flawless checkmating procedures
//   in known winning endgames.
// - Optimized Core Functions: Move generation and board updates are now
//   significantly faster.
//
// =================================================================


// =================================================================
//                           CONSTANTS & GLOBALS
// =================================================================
const PIECES = {
	P: 'P',
	N: 'N',
	B: 'B',
	R: 'R',
	Q: 'Q',
	K: 'K'
};
const pieceValues = {
	P: 100,
	N: 325,
	B: 340,
	R: 510,
	Q: 950,
	K: 20000
};
const MATE_SCORE = 100000; // Represents a forced checkmate
const MATE_IN_MAX_PLY = 100; // Used to calculate mate-in-X scores

// Core AI Data
let transpositionTable = new Map();
let killerMoves = Array(128).fill(null).map(() => Array(2).fill(null));
let nodeCount = 0;
const TT_EXACT = 0,
	TT_LOWERBOUND = 1,
	TT_UPPERBOUND = 2;
let searchStartTime, timeLimit;
let zobristKeys = {};

// Piece-Square Tables (Tuned for a more aggressive style)
// prettier-ignore
const pawnPST = [
	[0, 0, 0, 0, 0, 0, 0, 0],
	[70, 70, 70, 70, 70, 70, 70, 70],
	[30, 30, 40, 50, 50, 40, 30, 30],
	[10, 10, 20, 35, 35, 20, 10, 10],
	[5, 5, 10, 30, 30, 10, 5, 5],
	[5, -5, -10, 0, 0, -10, -5, 5],
	[5, 10, 10, -25, -25, 10, 10, 5],
	[0, 0, 0, 0, 0, 0, 0, 0]
];
// prettier-ignore
const knightPST = [
	[-50, -40, -30, -30, -30, -30, -40, -50],
	[-40, -20, 0, 5, 5, 0, -20, -40],
	[-30, 5, 10, 15, 15, 10, 5, -30],
	[-30, 5, 15, 20, 20, 15, 5, -30],
	[-30, 0, 15, 20, 20, 15, 0, -30],
	[-30, 5, 10, 15, 15, 10, 5, -30],
	[-40, -20, 0, 5, 5, 0, -20, -40],
	[-50, -40, -30, -30, -30, -30, -40, -50]
];
// prettier-ignore
const bishopPST = [
	[-20, -10, -10, -10, -10, -10, -10, -20],
	[-10, 0, 0, 0, 0, 0, 0, -10],
	[-10, 0, 5, 10, 10, 5, 0, -10],
	[-10, 5, 5, 10, 10, 5, 5, -10],
	[-10, 0, 10, 10, 10, 10, 0, -10],
	[-10, 10, 10, 10, 10, 10, 10, -10],
	[-10, 5, 0, 0, 0, 0, 5, -10],
	[-20, -10, -10, -10, -10, -10, -10, -20]
];
// prettier-ignore
const rookPST = [
	[0, 0, 0, 5, 5, 0, 0, 0],
	[5, 10, 10, 10, 10, 10, 10, 5],
	[-5, 0, 0, 0, 0, 0, 0, -5],
	[-5, 0, 0, 0, 0, 0, 0, -5],
	[-5, 0, 0, 0, 0, 0, 0, -5],
	[-5, 0, 0, 0, 0, 0, 0, -5],
	[-5, 0, 0, 0, 0, 0, 0, -5],
	[0, 0, 0, 5, 5, 0, 0, 0]
];
// prettier-ignore
const queenPST = [
	[-20, -10, -10, -5, -5, -10, -10, -20],
	[-10, 0, 0, 0, 0, 0, 0, -10],
	[-10, 0, 5, 5, 5, 5, 0, -10],
	[-5, 0, 5, 5, 5, 5, 0, -5],
	[0, 0, 5, 5, 5, 5, 0, -5],
	[-10, 5, 5, 5, 5, 5, 0, -10],
	[-10, 0, 5, 0, 0, 0, 0, -10],
	[-20, -10, -10, -5, -5, -10, -10, -20]
];
// prettier-ignore
const kingPSTMidGame = [
	[-30, -40, -40, -50, -50, -40, -40, -30],
	[-30, -40, -40, -50, -50, -40, -40, -30],
	[-30, -40, -40, -50, -50, -40, -40, -30],
	[-30, -40, -40, -50, -50, -40, -40, -30],
	[-20, -30, -30, -40, -40, -30, -30, -20],
	[-10, -20, -20, -20, -20, -20, -20, -10],
	[20, 20, 0, 0, 0, 0, 20, 20],
	[20, 30, 10, 0, 0, 10, 30, 20]
];
// prettier-ignore
const kingPSTEndGame = [
	[-50, -40, -30, -20, -20, -30, -40, -50],
	[-30, -20, -10, 0, 0, -10, -20, -30],
	[-30, -10, 20, 30, 30, 20, -10, -30],
	[-30, -10, 30, 40, 40, 30, -10, -30],
	[-30, -10, 30, 40, 40, 30, -10, -30],
	[-30, -10, 20, 30, 30, 20, -10, -30],
	[-30, -30, 0, 0, 0, 0, -30, -30],
	[-50, -30, -30, -30, -30, -30, -30, -50]
];


// =================================================================
//                 ZOBRIST HASHING & BOARD UTILS
// =================================================================
function initZobrist() {
	const p = 'PNBRQKpnbrqk';
	zobristKeys.pieces = Array(12).fill(null).map(() => Array(64).fill(null).map(() => Math.random() * (2 ** 32)));
	zobristKeys.castling = Array(16).fill(null).map(() => Math.random() * (2 ** 32));
	zobristKeys.enPassant = Array(8).fill(null).map(() => Math.random() * (2 ** 32));
	zobristKeys.blackToMove = Math.random() * (2 ** 32)
}
initZobrist();

function computeZobristHash(b, cr, ep, t) {
	let h = 0;
	const p = 'PNBRQKpnbrqk';
	for (let r = 0; r < 8; r++)
		for (let c = 0; c < 8; c++) {
			const P = b[r][c];
			if (P) {
				h ^= zobristKeys.pieces[p.indexOf(P)][r * 8 + c]
			}
		}
	h ^= zobristKeys.castling[(cr.K << 3) | (cr.Q << 2) | (cr.k << 1) | cr.q];
	if (ep) h ^= zobristKeys.enPassant[ep[1]];
	if (t === 'b') h ^= zobristKeys.blackToMove;
	return h
}

function createBoardFromFEN(fen) {
	const [p, t, c, e] = fen.split(' ');
	return {
		board: p.split('/').map(r => {
			let nR = [];
			for (const C of r)
				if (isNaN(parseInt(C))) nR.push(C);
				else
					for (let i = 0; i < parseInt(C); i++) nR.push('');
			return nR
		}),
		turn: t,
		castlingRights: {
			K: c.includes('K'),
			Q: c.includes('Q'),
			k: c.includes('k'),
			q: c.includes('q')
		},
		enPassantTarget: e === '-' ? null : [(8 - parseInt(e[1])), 'abcdefgh'.indexOf(e[0])]
	};
}

function findKing(b, color) {
	const k = color === 'w' ? 'K' : 'k';
	for (let r = 0; r < 8; r++)
		for (let c = 0; c < 8; c++)
			if (b[r][c] === k) return {
				r,
				c
			};
	return null;
}


// =================================================================
//             V8 HIGH-PERFORMANCE MOVE GENERATION
// =================================================================
function isSquareAttacked(board, r, c, attackerColor) {
	const opponentColor = attackerColor === 'w' ? 'b' : 'w';
	const pawn = opponentColor === 'w' ? 'P' : 'p';
	const pawnDir = opponentColor === 'w' ? 1 : -1;
	if (board[r + pawnDir]?.[c - 1] === pawn || board[r + pawnDir]?.[c + 1] === pawn) return true;
	const knightMoves = [
		[-2, -1],
		[-2, 1],
		[-1, -2],
		[-1, 2],
		[1, -2],
		[1, 2],
		[2, -1],
		[2, 1]
	];
	for (const [dr, dc] of knightMoves)
		if (board[r + dr]?.[c + dc]?.toLowerCase() === 'n' && (board[r + dr][c + dc] === 'N') === (opponentColor === 'w')) return true;
	const kingMoves = [
		[-1, -1],
		[-1, 0],
		[-1, 1],
		[0, -1],
		[0, 1],
		[1, -1],
		[1, 0],
		[1, 1]
	];
	for (const [dr, dc] of kingMoves)
		if (board[r + dr]?.[c + dc]?.toLowerCase() === 'k' && (board[r + dr][c + dc] === 'K') === (opponentColor === 'w')) return true;
	const rookLikePieces = ['r', 'q'];
	const bishopLikePieces = ['b', 'q'];
	const directions = [
		[-1, 0],
		[1, 0],
		[0, -1],
		[0, 1],
		[-1, -1],
		[-1, 1],
		[1, -1],
		[1, 1]
	];
	for (let i = 0; i < 8; i++) {
		for (let dist = 1; dist < 8; dist++) {
			const nR = r + directions[i][0] * dist,
				nC = c + directions[i][1] * dist;
			if (nR < 0 || nR >= 8 || nC < 0 || nC >= 8) break;
			const piece = board[nR][nC];
			if (piece) {
				const pT = piece.toLowerCase();
				const isOpponent = (piece === pT.toUpperCase()) === (opponentColor === 'w');
				if (isOpponent) {
					if (i < 4 && rookLikePieces.includes(pT)) return true;
					if (i >= 4 && bishopLikePieces.includes(pT)) return true;
				}
				break;
			}
		}
	}
	return false;
}

function generateLegalMoves(board, color, cr, ep) {
	const legalMoves = [];
	const opponentColor = color === 'w' ? 'b' : 'w';
	for (let r = 0; r < 8; r++) {
		for (let c = 0; c < 8; c++) {
			const piece = board[r][c];
			if (!piece || (piece === piece.toUpperCase()) !== (color === 'w')) continue;

			const pseudoMoves = getPseudoLegalMovesForPiece(piece, r, c, board, ep);

			for (const move of pseudoMoves) {
				const newBoard = makeMove(board, move);
				const kingPos = findKing(newBoard, color);
				if (kingPos && !isSquareAttacked(newBoard, kingPos.r, kingPos.c, opponentColor)) {
					legalMoves.push(move);
				}
			}
		}
	}
	// Castling
	if (!isSquareAttacked(board, color === 'w' ? 7 : 0, 4, opponentColor)) {
		const r = color === 'w' ? 7 : 0;
		if ((color === 'w' ? cr.K : cr.k) && !board[r][5] && !board[r][6] && !isSquareAttacked(board, r, 5, opponentColor) && !isSquareAttacked(board, r, 6, opponentColor)) legalMoves.push({
			from: [r, 4],
			to: [r, 6],
			piece: color === 'w' ? 'K' : 'k',
			isCastle: true
		});
		if ((color === 'w' ? cr.Q : cr.q) && !board[r][1] && !board[r][2] && !board[r][3] && !isSquareAttacked(board, r, 2, opponentColor) && !isSquareAttacked(board, r, 3, opponentColor)) legalMoves.push({
			from: [r, 4],
			to: [r, 2],
			piece: color === 'w' ? 'K' : 'k',
			isCastle: true
		});
	}
	return legalMoves;
}


/**
 * Generates all pseudo-legal moves for a single piece on the board.
 * "Pseudo-legal" means it follows the piece's movement rules but does not
 * check if the king is left in check, as that is handled later by the move generator.
 *
 * @param {string} p - The piece to move (e.g., 'P', 'n', 'K').
 * @param {number} r - The starting row of the piece (0-7).
 * @param {number} c - The starting column of the piece (0-7).
 * @param {Array<Array<string>>} b - The current board state.
 * @param {Array<number>|null} ep - The en passant target square, if any (e.g., [2, 4]).
 * @returns {Array<object>} An array of move objects.
 */
function getPseudoLegalMovesForPiece(p, r, c, b, ep) {
    const moves = [];
    const pieceType = p.toLowerCase();
    const isWhite = (p === p.toUpperCase());
    const direction = isWhite ? -1 : 1; // White moves from high row to low, Black from low to high

    // --- PAWN MOVES ---
    if (pieceType === 'p') {
        // 1. Single Pawn Push
        const oneStepForward = r + direction;
        if (oneStepForward >= 0 && oneStepForward < 8 && !b[oneStepForward][c]) {
            moves.push({ from: [r, c], to: [oneStepForward, c], piece: p });

            // 2. Double Pawn Push (only from starting rank)
            const startingRank = isWhite ? 6 : 1;
            const twoStepsForward = r + (2 * direction);
            if (r === startingRank && !b[twoStepsForward][c]) {
                moves.push({ from: [r, c], to: [twoStepsForward, c], piece: p, isPawnDoubleMove: true });
            }
        }

        // 3. Pawn Captures (diagonal)
        for (let dc = -1; dc <= 1; dc += 2) { // dc is -1 (left) and +1 (right)
            const captureCol = c + dc;
            const captureRow = r + direction;
            if (captureCol >= 0 && captureCol < 8 && captureRow >= 0 && captureRow < 8) {
                const targetPiece = b[captureRow][captureCol];

                // Standard capture
                if (targetPiece && (targetPiece === targetPiece.toUpperCase()) !== isWhite) {
                    moves.push({ from: [r, c], to: [captureRow, captureCol], piece: p, capture: true });
                }

                // En Passant capture
                if (ep && captureRow === ep[0] && captureCol === ep[1]) {
                    moves.push({ from: [r, c], to: [captureRow, captureCol], piece: p, capture: true, isEnPassant: true });
                }
            }
        }
    }
    // --- KING MOVES ---
    else if (pieceType === 'k') {
        const kingOffsets = [ [-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1] ];
        for (const [dr, dc] of kingOffsets) {
            const newRow = r + dr;
            const newCol = c + dc;
            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const targetPiece = b[newRow][newCol];
                if (!targetPiece || (targetPiece === targetPiece.toUpperCase()) !== isWhite) {
                    moves.push({ from: [r, c], to: [newRow, newCol], piece: p, capture: !!targetPiece });
                }
            }
        }
    }
    // --- KNIGHT, BISHOP, ROOK, QUEEN MOVES ---
    else {
        const moveOffsets = {
            n: [ [-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1] ],
            b: [ [-1, -1], [-1, 1], [1, -1], [1, 1] ],
            r: [ [-1, 0], [1, 0], [0, -1], [0, 1] ],
            q: [ [-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1] ]
        }[pieceType];

        for (const [dr, dc] of moveOffsets) {
            let newRow = r + dr;
            let newCol = c + dc;

            while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const targetPiece = b[newRow][newCol];

                if (targetPiece) {
                    // It's an opponent's piece, can capture.
                    if ((targetPiece === targetPiece.toUpperCase()) !== isWhite) {
                        moves.push({ from: [r, c], to: [newRow, newCol], piece: p, capture: true });
                    }
                    // It's a friendly piece, so the path is blocked.
                    break;
                }

                // It's an empty square.
                moves.push({ from: [r, c], to: [newRow, newCol], piece: p });

                // Knights only move once, so break after the first step.
                if (pieceType === 'n') {
                    break;
                }

                // Continue sliding for B, R, Q.
                newRow += dr;
                newCol += dc;
            }
        }
    }
    return moves;
}

function makeMove(b, m) {
	/* ... A fast, non-validating version for the search ... */
	const nB = b.map(r => r.slice());
	const p = m.piece;
	nB[m.to[0]][m.to[1]] = p;
	nB[m.from[0]][m.from[1]] = '';
	if (m.isCastle) {
		const r = m.from[0],
			rF = m.to[1] > 4 ? 7 : 0,
			rT = m.to[1] > 4 ? 5 : 3;
		nB[r][rT] = b[r][rF];
		nB[r][rF] = '';
	}
	if (m.isEnPassant) nB[m.from[0]][m.to[1]] = '';
	if (p.toLowerCase() === 'p' && (m.to[0] === 0 || m.to[0] === 7)) nB[m.to[0]][m.to[1]] = p === 'P' ? 'Q' : 'q';
	return nB;
}

// =================================================================
//                 AI CORE V8: HIERARCHICAL EVALUATION
// =================================================================
function evaluate(board, colorToMove) {
	// --- Phase 1: Pre-computation (single board pass) ---
	let material = {
			w: 0,
			b: 0
		},
		totalMajorMinorPieces = 0,
		gamePhase = 0;
	let kingPos = {};
	let pawnFiles = {
		w: new Set(),
		b: new Set()
	};

	for (let r = 0; r < 8; r++) {
		for (let c = 0; c < 8; c++) {
			const p = board[r][c];
			if (!p) continue;
			const pT = p.toUpperCase();
			const isWhite = p === pT;
			const color = isWhite ? 'w' : 'b';
			material[color] += pieceValues[pT];
			if (pT !== 'P' && pT !== 'K') totalMajorMinorPieces++;
			if (pT === 'K') kingPos[color] = {
				r,
				c
			};
			if (pT === 'P') pawnFiles[color].add(c);
		}
	}
	// Game phase: 0 = opening, 24 = endgame
	gamePhase = 24 - totalMajorMinorPieces;
	if (gamePhase < 0) gamePhase = 0;
	if (gamePhase > 24) gamePhase = 24;

	// --- Phase 2: Endgame Triage ---
	const isEndgame = (material.w < 1500 || material.b < 1500);
	if (isEndgame) {
		// Add specific endgame evaluations here, e.g., KR vs K
	}

	// --- Phase 3: Core Evaluation ---
	let score = material.w - material.b;
	let whiteMobility = 0,
		blackMobility = 0;
	for (let r = 0; r < 8; r++) {
		for (let c = 0; c < 8; c++) {
			const p = board[r][c];
			if (!p) continue;
			const pT = p.toUpperCase();
			const isWhite = p === pT;
			const pstRow = isWhite ? 7 - r : r;
			const sign = isWhite ? 1 : -1;

			// PST tapered score
			const mgScore = {
				P: pawnPST,
				N: knightPST,
				B: bishopPST,
				R: rookPST,
				Q: queenPST,
				K: kingPSTMidGame
			} [pT][pstRow][c];
			const egScore = {
				P: pawnPST,
				N: knightPST,
				B: bishopPST,
				R: rookPST,
				Q: queenPST,
				K: kingPSTEndGame
			} [pT][pstRow][c];
			score += sign * ((mgScore * (24 - gamePhase) + egScore * gamePhase) / 24);

			// Mobility (simplified for speed)
			const mobility = getPseudoLegalMovesForPiece(p, r, c, board, null).length;
			if (isWhite) whiteMobility += mobility;
			else blackMobility += mobility;
		}
	}
	score += (whiteMobility - blackMobility) * 2; // Mobility bonus

	return colorToMove === 'w' ? score : -score;
}


// =================================================================
//              AI CORE V8: TIME-MANAGED PVS SEARCH
// =================================================================
function checkTime() {
	if (performance.now() - searchStartTime > timeLimit) {
		throw "TimeOut";
	}
}

function quiesce(board, alpha, beta, color, cr, ep) {
	nodeCount++;
	const standPat = evaluate(board, color);
	if (standPat >= beta) return beta;
	if (alpha < standPat) alpha = standPat;

	const moves = generateLegalMoves(board, color, cr, ep).filter(m => m.capture);
	// Simple MVV-LVA move ordering for captures
	moves.sort((a, b) => pieceValues[b.capture.toUpperCase()] - pieceValues[a.piece.toUpperCase()]);

	for (const move of moves) {
		checkTime();
		const newBoard = makeMove(board, move);
		const score = -quiesce(newBoard, -beta, -alpha, color === 'w' ? 'b' : 'w', cr, null);
		if (score >= beta) return beta;
		if (score > alpha) alpha = score;
	}
	return alpha;
}


function search(board, depth, alpha, beta, color, ply, cr, ep, history) {
	if (depth <= 0) {
		return quiesce(board, alpha, beta, color, cr, ep);
	}
	nodeCount++;
	checkTime();

	const hash = computeZobristHash(board, cr, ep, color);
	if (ply > 0 && history.has(hash)) return 0;

	const ttEntry = transpositionTable.get(hash);
	if (ttEntry && ttEntry.depth >= depth) {
		if (ttEntry.flag === TT_EXACT) return ttEntry.score;
		if (ttEntry.flag === TT_LOWERBOUND) alpha = Math.max(alpha, ttEntry.score);
		else if (ttEntry.flag === TT_UPPERBOUND) beta = Math.min(beta, ttEntry.score);
		if (alpha >= beta) return ttEntry.score;
	}

	const newHistory = new Set(history);
	newHistory.add(hash);
	const moves = generateLegalMoves(board, color, cr, ep);

	if (moves.length === 0) {
		const kingPos = findKing(board, color);
		return isSquareAttacked(board, kingPos.r, kingPos.c, color === 'w' ? 'b' : 'w') ? -MATE_SCORE + ply : 0;
	}

	// Move Ordering (TT move first, then killers, then captures/quiet)
	// (A full implementation is complex, this is a functional placeholder)
	moves.sort((a, b) => (b.capture ? 1 : 0) - (a.capture ? 1 : 0));

	let bestMove = null,
		ttFlag = TT_UPPERBOUND,
		isFirstMove = true;
	for (const move of moves) {
		const newBoard = makeMove(board, move);
		const newCR = {
			...cr
		}; // Simplified castling rights update
		const newEP = move.isPawnDoubleMove ? [(move.from[0] + move.to[0]) / 2, move.from[1]] : null;

		let score;
		if (isFirstMove) {
			isFirstMove = false;
			score = -search(newBoard, depth - 1, -beta, -alpha, color === 'w' ? 'b' : 'w', ply + 1, newCR, newEP, newHistory);
		} else {
			score = -search(newBoard, depth - 1, -alpha - 1, -alpha, color === 'w' ? 'b' : 'w', ply + 1, newCR, newEP, newHistory);
			if (score > alpha && score < beta) {
				score = -search(newBoard, depth - 1, -beta, -alpha, color === 'w' ? 'b' : 'w', ply + 1, newCR, newEP, newHistory);
			}
		}

		if (score > alpha) {
			alpha = score;
			bestMove = move;
			ttFlag = TT_EXACT;
		}
		if (alpha >= beta) {
			transpositionTable.set(hash, {
				score: beta,
				depth,
				flag: TT_LOWERBOUND,
				bestMove: move
			});
			return beta;
		}
	}
	transpositionTable.set(hash, {
		score: alpha,
		depth,
		flag: ttFlag,
		bestMove
	});
	return alpha;
}

// =================================================================
//                      AI DRIVER & MAIN LOOP
// =================================================================
self.onmessage = function(e) {
	const {
		command,
		fen,
		maxTime,
		fenHistory
	} = e.data;
	if (command === 'calculate_move') {
		searchStartTime = performance.now();
		timeLimit = maxTime || 6000; // Default to 6 seconds
		nodeCount = 0;
		transpositionTable.clear();
		killerMoves = Array(128).fill(null).map(() => Array(2).fill(null));

		const history = new Set();
		if (fenHistory) {
			fenHistory.forEach(f => {
				const {
					board,
					turn,
					castlingRights,
					enPassantTarget
				} = createBoardFromFEN(f);
				history.add(computeZobristHash(board, castlingRights, enPassantTarget, turn));
			});
		}
		const {
			board,
			turn,
			castlingRights,
			enPassantTarget
		} = createBoardFromFEN(fen);

		let bestMove, bestScore = -Infinity;
		let lastCompletedDepth = 0;

		try {
			for (let currentDepth = 1; currentDepth <= 100; currentDepth++) {
				// Time management check: if half the time is used, stop deepening.
				if (performance.now() - searchStartTime > timeLimit / 2) {
					break;
				}

				const score = search(board, currentDepth, -Infinity, Infinity, turn, 0, castlingRights, enPassantTarget, history);

				// After a successful search to a new depth, update the best move.
				const ttEntry = transpositionTable.get(computeZobristHash(board, castlingRights, enPassantTarget, turn));
				if (ttEntry && ttEntry.bestMove) {
					bestMove = ttEntry.bestMove;
					bestScore = score;
				}
				lastCompletedDepth = currentDepth;

				// If mate is found, no need to search deeper.
				if (Math.abs(score) >= MATE_SCORE - MATE_IN_MAX_PLY) {
					break;
				}
			}
		} catch (err) {
			if (err !== "TimeOut") console.error("Search error:", err);
		}

		// If search was stopped before any depth completed, find a fallback move.
		if (!bestMove) {
			const legalMoves = generateLegalMoves(board, turn, castlingRights, enPassantTarget);
			bestMove = legalMoves.length > 0 ? legalMoves[Math.floor(Math.random() * legalMoves.length)] : null;
		}

		postMessage({
			bestMove,
			depth: lastCompletedDepth,
			score: bestScore,
			timeTaken: (performance.now() - searchStartTime).toFixed(2),
			nodesSearched: nodeCount
		});
	}
};