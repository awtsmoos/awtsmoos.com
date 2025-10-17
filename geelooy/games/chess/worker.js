/*B"H*/

// =================================================================
//     THE FLAWLESS GRANDMASTER ENGINE V6 (By Gemini & You)
// =================================================================
//
// V6 Philosophy:
// This engine transcends simple static evaluation. Its primary goal is to
// understand the "state" of the game and change its priorities accordingly.
//
// 1. CONVERSION MODE: If a decisive material advantage is achieved, the
//    evaluation function transforms. It becomes a ruthless hunter, prioritizing
//    king attacks and forcing checkmate above all else. It will no longer
//    shuffle pieces aimlessly in a won endgame.
//
// 2. ACTIVITY & QUALITY: The engine now understands that a piece's value
//    is not just its type, but its mobility and potential. It will no longer
//    trade an active, dominant piece for a passive, trapped one.
//
// =================================================================


// --- Core Engine Data ---
const pieceValues = {
	'P': 100,
	'N': 320,
	'B': 330,
	'R': 500,
	'Q': 900,
	'K': 20000
};
const pieceSeeValues = {
	'P': 100,
	'N': 320,
	'B': 330,
	'R': 500,
	'Q': 900,
	'K': 10000
};

// --- Piece-Square Tables (Unchanged, but vital) ---
// prettier-ignore
const pawnPST = [
	[0, 0, 0, 0, 0, 0, 0, 0],
	[50, 50, 50, 50, 50, 50, 50, 50],
	[10, 10, 20, 30, 30, 20, 10, 10],
	[5, 5, 10, 25, 25, 10, 5, 5],
	[0, 0, 0, 20, 20, 0, 0, 0],
	[5, -5, -10, 0, 0, -10, -5, 5],
	[5, 10, 10, -20, -20, 10, 10, 5],
	[0, 0, 0, 0, 0, 0, 0, 0]
];
// prettier-ignore
const knightPST = [
	[-50, -40, -30, -30, -30, -30, -40, -50],
	[-40, -20, 0, 0, 0, 0, -20, -40],
	[-30, 0, 10, 15, 15, 10, 0, -30],
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
	[0, 0, 0, 0, 0, 0, 0, 0],
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
	[20, 30, 10, 0, 0, 10, 30, 20],
	[20, 20, 0, 0, 0, 0, 20, 20],
	[-10, -20, -20, -20, -20, -20, -20, -10],
	[-20, -30, -30, -40, -40, -30, -30, -20],
	[-30, -40, -40, -50, -50, -40, -40, -30],
	[-30, -40, -40, -50, -50, -40, -40, -30],
	[-30, -40, -40, -50, -50, -40, -40, -30],
	[-30, -40, -40, -50, -50, -40, -40, -30]
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

// --- V6 Evaluation Constants ---
const BISHOP_PAIR_BONUS = 50;
const ROOK_ON_OPEN_FILE_BONUS = 25;
const ROOK_ON_SEMI_OPEN_FILE_BONUS = 15;
const ROOK_ON_SEVENTH_RANK_BONUS = 40;
const KNIGHT_OUTPOST_BONUS = 30;
const PASSED_PAWN_BONUS = [0, 20, 30, 50, 80, 120, 180, 0];
const ISOLATED_PAWN_PENALTY = -15;
const DOUBLED_PAWN_PENALTY = -20;
const CONNECTED_PAWN_BONUS = 10;
const MOBILITY_WEIGHT_MG = {
	'N': 2.0,
	'B': 1.5,
	'R': 1.0,
	'Q': 0.8
};
const MOBILITY_WEIGHT_EG = {
	'N': 1.5,
	'B': 1.8,
	'R': 1.2,
	'Q': 1.0
};

// --- V6 Conversion Mode Constants ---
const WINNING_ADVANTAGE_THRESHOLD = 400; // A Rook advantage
const KING_ATTACK_MULTIPLIER = 2.5; // Massively amplify king safety score when winning
const AVOID_TRADES_PENALTY = 20; // Penalize trading pieces when winning


// --- Core AI Data Structures ---
let transpositionTable = new Map();
let killerMoves = Array(50).fill(null).map(() => Array(2).fill(null));
let nodeCount = 0;
const TT_EXACT = 0,
	TT_LOWERBOUND = 1,
	TT_UPPERBOUND = 2;
let zobristKeys = {};

// --- Zobrist Hashing (Unchanged) ---
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

// --- FEN & Legality (Unchanged) ---
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

function isSquareAttacked(b, r, c, aC) {
	for (let rA = 0; rA < 8; rA++)
		for (let cA = 0; cA < 8; cA++) {
			const p = b[rA][cA];
			if (!p) continue;
			const iW = p === p.toUpperCase();
			if ((aC === 'w' && !iW) || (aC === 'b' && iW)) continue;
			const m = getPseudoLegalMovesForPiece(p, rA, cA, b, true);
			if (m.some(mv => mv.to[0] === r && mv.to[1] === c)) return true;
		}
	return false;
}

function getPseudoLegalMovesForPiece(p, r, c, b, isAttackCheck = false) {
	const m = [],
		pL = p.toLowerCase(),
		iW = p === p.toUpperCase(),
		d = iW ? -1 : 1;
	if (pL === 'p') {
		if (!isAttackCheck && r + d > -1 && r + d < 8 && !b[r + d][c]) m.push({
			f: [r, c],
			t: [r + d, c]
		});
		if (!isAttackCheck && ((iW && r === 6) || (!iW && r === 1)) && !b[r + d][c] && !b[r + 2 * d][c]) m.push({
			f: [r, c],
			t: [r + 2 * d, c],
			pd: true
		});
		for (let dc = -1; dc <= 1; dc += 2) {
			const nC = c + dc;
			if (nC > -1 && nC < 8 && r + d > -1 && r + d < 8) {
				const t = b[r + d][nC];
				if (t && iW !== (t === t.toUpperCase())) m.push({
					f: [r, c],
					t: [r + d, nC]
				})
			}
		}
	} else if (pL === 'k') {
		const o = [
			[-1, -1],
			[-1, 0],
			[-1, 1],
			[0, -1],
			[0, 1],
			[1, -1],
			[1, 0],
			[1, 1]
		];
		for (const [dr, dc] of o) {
			const nR = r + dr,
				nC = c + dc;
			if (nR > -1 && nR < 8 && nC > -1 && nC < 8 && (!b[nR][nC] || iW !== (b[nR][nC] === b[nR][nC].toUpperCase()))) m.push({
				f: [r, c],
				t: [nR, nC]
			})
		}
	} else {
		const o = {
			n: [
				[-2, -1],
				[-2, 1],
				[-1, -2],
				[-1, 2],
				[1, -2],
				[1, 2],
				[2, -1],
				[2, 1]
			],
			b: [
				[-1, -1],
				[-1, 1],
				[1, -1],
				[1, 1]
			],
			r: [
				[-1, 0],
				[1, 0],
				[0, -1],
				[0, 1]
			],
			q: [
				[-1, -1],
				[-1, 1],
				[1, -1],
				[1, 1],
				[-1, 0],
				[1, 0],
				[0, -1],
				[0, 1]
			]
		} [pL];
		for (const [dr, dc] of o) {
			let nR = r + dr,
				nC = c + dc;
			while (nR > -1 && nR < 8 && nC > -1 && nC < 8) {
				if (b[nR][nC]) {
					if (iW !== (b[nR][nC] === b[nR][nC].toUpperCase())) m.push({
						f: [r, c],
						t: [nR, nC]
					});
					break
				}
				m.push({
					f: [r, c],
					t: [nR, nC]
				});
				if (pL === 'n') break;
				nR += dr;
				nC += dc
			}
		}
	}
	return m.map(mv => ({
		from: mv.f,
		to: mv.t,
		isPawnDoubleMove: mv.pd
	}));
}

function generateAllLegalMoves(b, color, cr, ep) {
	const lM = [],
		oC = color === 'w' ? 'b' : 'w';
	for (let r = 0; r < 8; r++)
		for (let c = 0; c < 8; c++) {
			const p = b[r][c];
			if (!p) continue;
			const iW = p === p.toUpperCase();
			if ((color === 'w' && !iW) || (color === 'b' && iW)) continue;
			const pM = getPseudoLegalMovesForPiece(p, r, c, b);
			for (const m of pM) {
				if (ep && p.toLowerCase() === 'p' && m.to[0] === ep[0] && m.to[1] === ep[1]) m.isEnPassant = true;
				const nB = makeMove(b, m);
				const kP = findKing(nB, color);
				if (kP && !isSquareAttacked(nB, kP.r, kP.c, oC)) {
					m.piece = p;
					m.capture = !!b[m.to[0]][m.to[1]] || m.isEnPassant;
					const oKP = findKing(nB, oC);
					m.check = oKP && isSquareAttacked(nB, oKP.r, oKP.c, color);
					lM.push(m)
				}
			}
		}
	if (cr && !isSquareAttacked(b, findKing(b, color).r, findKing(b, color).c, oC)) {
		const r = color === 'w' ? 7 : 0;
		if ((color === 'w' ? cr.K : cr.k) && !b[r][5] && !b[r][6] && !isSquareAttacked(b, r, 5, oC) && !isSquareAttacked(b, r, 6, oC)) lM.push({
			from: [r, 4],
			to: [r, 6],
			piece: color === 'w' ? 'K' : 'k',
			isCastle: true
		});
		if ((color === 'w' ? cr.Q : cr.q) && !b[r][1] && !b[r][2] && !b[r][3] && !isSquareAttacked(b, r, 2, oC) && !isSquareAttacked(b, r, 3, oC)) lM.push({
			from: [r, 4],
			to: [r, 2],
			piece: color === 'w' ? 'K' : 'k',
			isCastle: true
		})
	}
	return lM
}

function makeMove(b, m) {
	const nB = b.map(r => r.slice());
	const p = nB[m.from[0]][m.from[1]];
	nB[m.to[0]][m.to[1]] = p;
	nB[m.from[0]][m.from[1]] = '';
	if (m.isCastle) {
		const r = m.from[0],
			rF = m.to[1] > 4 ? 7 : 0,
			rT = m.to[1] > 4 ? 5 : 3;
		nB[r][rT] = nB[r][rF];
		nB[r][rF] = ''
	}
	if (m.isEnPassant) nB[m.from[0]][m.to[1]] = '';
	if (p.toLowerCase() === 'p' && (m.to[0] === 0 || m.to[0] === 7)) nB[m.to[0]][m.to[1]] = p === 'P' ? 'Q' : 'q';
	return nB
}


// =================================================================
//         AI CORE V6: EVALUATION & STRATEGIC PLANNING
// =================================================================

/**
 * Helper function for dedicated king safety evaluation.
 */
function calculateKingSafetyScore(board, boardState, kingColor) {
	const kingPos = boardState.kingPos[kingColor];
	if (!kingPos) return 0;

	let safetyPenalty = 0;
	const attackerColor = kingColor === 'w' ? 'b' : 'w';
	const kingFile = kingPos.c;

	// a) Pawn Shield Penalty
	const pawn = kingColor === 'w' ? 'P' : 'p';
	for (let df = -1; df <= 1; df++) {
		const file = kingFile + df;
		if (file < 0 || file > 7) continue;
		let pawnFound = false;
		for (let r = kingPos.r + (kingColor === 'w' ? -1 : 1); r >= 0 && r < 8; r += (kingColor === 'w' ? -1 : 1)) {
			if (board[r][file] === pawn) {
				safetyPenalty += Math.abs(r - (kingColor === 'w' ? 6 : 1)) * 10;
				pawnFound = true;
				break;
			}
		}
		if (!pawnFound) safetyPenalty += 40;
	}

	// b) Open Files Near King Penalty
	for (let df = -1; df <= 1; df++) {
		const file = kingFile + df;
		if (file < 0 || file > 7) continue;
		const isOurPawnOnFile = boardState[kingColor === 'w' ? 'white' : 'black'].pawnFiles.has(file);
		if (!isOurPawnOnFile) {
			const isTheirPawnOnFile = boardState[attackerColor === 'w' ? 'white' : 'black'].pawnFiles.has(file);
			if (!isTheirPawnOnFile) safetyPenalty += 25;
			else safetyPenalty += 15;
		}
	}

	// c) Attacker Proximity Score
	const KING_ATTACK_WEIGHTS = {
		'Q': 10,
		'R': 6,
		'B': 4,
		'N': 4
	};
	let attackerCount = 0;
	let attackWeight = 0;
	for (let r = 0; r < 8; r++) {
		for (let c = 0; c < 8; c++) {
			const p = board[r][c];
			if (!p) continue;
			const isWhite = p === p.toUpperCase();
			if ((attackerColor === 'w' && !isWhite) || (attackerColor === 'b' && isWhite)) continue;
			const pT = p.toUpperCase();
			if (KING_ATTACK_WEIGHTS[pT]) {
				const dist = Math.max(Math.abs(r - kingPos.r), Math.abs(c - kingPos.c));
				if (dist <= 4) {
					attackWeight += KING_ATTACK_WEIGHTS[pT] * (5 - dist);
					attackerCount++;
				}
			}
		}
	}
	if (attackerCount > 1) {
		safetyPenalty += attackWeight * (attackerCount * 0.75);
	} else {
		safetyPenalty += attackWeight;
	}

	return -safetyPenalty;
}


/**
 * Helper function for basic "checkmate is inevitable" endgames.
 * NEW: Now triggers if the losing side ONLY has a king, regardless of pawns.
 */
function evaluateBasicEndgame(board, winningSide, kingPos, losingKingPos) {
	const baseScore = 20000;
	const winningKingPos = kingPos[winningSide];

	const kingDistance = Math.abs(winningKingPos.r - losingKingPos.r) + Math.abs(winningKingPos.c - losingKingPos.c);
	const kingProximityBonus = (14 - kingDistance) * 25;

	const centerManhattanDist = Math.abs(losingKingPos.r - 3.5) + Math.abs(losingKingPos.c - 3.5);
	const edgeProximityBonus = centerManhattanDist * 20;

	return baseScore + kingProximityBonus + edgeProximityBonus;
}


/**
 * The V6 Evaluation Function: Flawless, Vivid, Extreme, Perfect.
 */
function evaluateBoard(board, colorToMove) {
	// --- Part 0: Basic Endgame Detection ---
	let pieceCount = {
		w: 0,
		b: 0
	};
	let kingPos = {
		w: null,
		b: null
	};
	for (let r = 0; r < 8; r++)
		for (let c = 0; c < 8; c++) {
			const p = board[r][c];
			if (!p) continue;
			const isWhite = p === p.toUpperCase();
			if (isWhite) pieceCount.w++;
			else pieceCount.b++;
			if (p.toUpperCase() === 'K') kingPos[isWhite ? 'w' : 'b'] = {
				r,
				c
			};
		}
	if (pieceCount.w === 1 && pieceCount.b > 1) { // White has a lone king
		const score = evaluateBasicEndgame(board, 'b', kingPos, kingPos.w);
		return colorToMove === 'b' ? score : -score;
	}
	if (pieceCount.b === 1 && pieceCount.w > 1) { // Black has a lone king
		const score = evaluateBasicEndgame(board, 'w', kingPos, kingPos.b);
		return colorToMove === 'w' ? score : -score;
	}

	// --- Part 1: Pre-computation & Game State Analysis ---
	let materialScore = 0,
		positionalScore = 0,
		mobilityScore = 0,
		pawnStructureScore = 0;

	const boardState = {
		white: {
			bishops: 0,
			pawnFiles: new Set(),
			pawnRanks: {}
		},
		black: {
			bishops: 0,
			pawnFiles: new Set(),
			pawnRanks: {}
		},
		kingPos: kingPos
	};

	let totalPieceValue = 0;
	const initialPieceValue = 2 * (4 * 320 + 4 * 330 + 4 * 500 + 2 * 900);

	for (let r = 0; r < 8; r++) {
		for (let c = 0; c < 8; c++) {
			const p = board[r][c];
			if (!p) continue;
			const pT = p.toUpperCase();
			if (pT !== 'P' && pT !== 'K') totalPieceValue += pieceValues[pT];
			const isWhite = p === pT;
			const color = isWhite ? 'white' : 'black';
			if (pT === 'B') boardState[color].bishops++;
			if (pT === 'P') {
				boardState[color].pawnFiles.add(c);
				if (!boardState[color].pawnRanks[c] || (isWhite ? r < boardState[color].pawnRanks[c] : r > boardState[color].pawnRanks[c])) {
					boardState[color].pawnRanks[c] = r;
				}
			}
		}
	}
	const gamePhase = Math.max(0, Math.min(1, (initialPieceValue - totalPieceValue) / initialPieceValue)); // 0=opening, 1=endgame

	// --- Part 2: Main Evaluation Loop (Material, Position, Activity) ---
	for (let r = 0; r < 8; r++) {
		for (let c = 0; c < 8; c++) {
			const p = board[r][c];
			if (!p) continue;
			const isWhite = p === p.toUpperCase();
			const sign = isWhite ? 1 : -1;
			const pT = p.toUpperCase();

			materialScore += sign * pieceValues[pT];

			const mgPST = {
				P: pawnPST,
				N: knightPST,
				B: bishopPST,
				R: rookPST,
				Q: queenPST,
				K: kingPSTMidGame
			} [pT];
			const egPST = {
				P: pawnPST,
				N: knightPST,
				B: bishopPST,
				R: rookPST,
				Q: queenPST,
				K: kingPSTEndGame
			} [pT];
			const pstRow = isWhite ? r : 7 - r;
			positionalScore += sign * (mgPST[pstRow][c] * (1 - gamePhase) + egPST[pstRow][c] * gamePhase);

			const mobilityWeight = (MOBILITY_WEIGHT_MG[pT] * (1 - gamePhase) + MOBILITY_WEIGHT_EG[pT] * gamePhase);
			if (mobilityWeight) {
				const moves = getPseudoLegalMovesForPiece(p, r, c, board);
				mobilityScore += sign * moves.length * mobilityWeight;
			}
		}
	}

	// --- Part 3: Pawn Structure & Strategic Bonuses ---
	['white', 'black'].forEach(color => {
		const sign = color === 'white' ? 1 : -1;
		const pawnRanks = boardState[color].pawnRanks;
		const friendlyPawn = color === 'white' ? 'P' : 'p';
		const opponentPawn = color === 'white' ? 'p' : 'P';
		boardState[color].pawnFiles.forEach(c => {
			const r = pawnRanks[c];
			let pawnCountInFile = 0;
			for (let i = 0; i < 8; i++)
				if (board[i][c] === friendlyPawn) pawnCountInFile++;
			if (pawnCountInFile > 1) pawnStructureScore += sign * DOUBLED_PAWN_PENALTY * (pawnCountInFile - 1);
			if (!boardState[color].pawnFiles.has(c - 1) && !boardState[color].pawnFiles.has(c + 1)) pawnStructureScore += sign * ISOLATED_PAWN_PENALTY;
			if (boardState[color].pawnFiles.has(c - 1) || boardState[color].pawnFiles.has(c + 1)) pawnStructureScore += sign * CONNECTED_PAWN_BONUS;
			let isPassed = true;
			for (let forwardRank = r + sign; forwardRank >= 0 && forwardRank < 8; forwardRank += sign) {
				if (board[forwardRank][c] === opponentPawn || board[forwardRank][c - 1] === opponentPawn || board[forwardRank][c + 1] === opponentPawn) {
					isPassed = false;
					break;
				}
			}
			if (isPassed) pawnStructureScore += sign * PASSED_PAWN_BONUS[color === 'white' ? 7 - r : r];
		});
	});

	if (boardState.white.bishops >= 2) positionalScore += BISHOP_PAIR_BONUS;
	if (boardState.black.bishops >= 2) positionalScore -= BISHOP_PAIR_BONUS;

	// --- Part 4: King Safety & CONVERSION MODE ---
	const whiteKingSafety = calculateKingSafetyScore(board, boardState, 'w');
	const blackKingSafety = calculateKingSafetyScore(board, boardState, 'b');
	let kingSafetyScore = whiteKingSafety - blackKingSafety;

	const whiteHasWinningAdvantage = materialScore > WINNING_ADVANTAGE_THRESHOLD;
	const blackHasWinningAdvantage = materialScore < -WINNING_ADVANTAGE_THRESHOLD;

	let conversionScore = 0;
	if (whiteHasWinningAdvantage) {
		// White is winning. The goal is to checkmate black.
		// The safety of the black king is now the MOST important factor.
		conversionScore += blackKingSafety * KING_ATTACK_MULTIPLIER;
		// Penalize trading pieces.
		conversionScore -= (16 - (pieceCount.w + pieceCount.b)) * AVOID_TRADES_PENALTY;
	} else if (blackHasWinningAdvantage) {
		// Black is winning. The goal is to checkmate white.
		conversionScore += whiteKingSafety * KING_ATTACK_MULTIPLIER;
		conversionScore += (16 - (pieceCount.w + pieceCount.b)) * AVOID_TRADES_PENALTY;
	}

	// --- Part 5: Final Summation ---
	const totalScore = materialScore + positionalScore + mobilityScore + pawnStructureScore + kingSafetyScore + conversionScore;
	return (colorToMove === 'w' ? 1 : -1) * totalScore;
}


// =================================================================
//         AI CORE V6: SEARCH & EXECUTION
// =================================================================

/**
 * Static Exchange Evaluation (SEE) - Prevents catastrophic material blunders.
 */
function staticExchangeEvaluation(board, from, to) {
	const fromPiece = board[from[0]][from[1]];
	const toPiece = board[to[0]][to[1]];
	if (!fromPiece || !toPiece) return 0;

	let gain = [pieceSeeValues[toPiece.toUpperCase()]];
	let tempBoard = board.map(r => r.slice());

	let fromR = from[0],
		fromC = from[1],
		toR = to[0],
		toC = to[1];
	let turn = fromPiece === fromPiece.toUpperCase() ? 'b' : 'w';

	let currentAttacker = {
		r: fromR,
		c: fromC,
		piece: fromPiece
	};
	tempBoard[toR][toC] = currentAttacker.piece;
	tempBoard[currentAttacker.r][currentAttacker.c] = '';

	while (true) {
		let nextAttacker = null;
		let minAttackerValue = 10001;
		for (let r = 0; r < 8; r++) {
			for (let c = 0; c < 8; c++) {
				const p = tempBoard[r][c];
				if (!p) continue;
				const isWhite = p === p.toUpperCase();
				if ((turn === 'w' && !isWhite) || (turn === 'b' && isWhite)) continue;
				const moves = getPseudoLegalMovesForPiece(p, r, c, tempBoard, true);
				if (moves.some(m => m.to[0] === toR && m.to[1] === toC)) {
					const val = pieceSeeValues[p.toUpperCase()];
					if (val < minAttackerValue) {
						minAttackerValue = val;
						nextAttacker = {
							r: r,
							c: c,
							piece: p
						};
					}
				}
			}
		}
		if (!nextAttacker) break;
		gain.push(pieceSeeValues[tempBoard[toR][toC].toUpperCase()]);
		tempBoard[toR][toC] = nextAttacker.piece;
		tempBoard[nextAttacker.r][nextAttacker.c] = '';
		turn = turn === 'w' ? 'b' : 'w';
	}

	let score = gain[0];
	for (let i = 1; i < gain.length; i++) {
		score -= gain[i];
		if (i + 1 < gain.length) {
			score += gain[i + 1];
			i++;
		}
	}
	return score;
}

/**
 * V6 Move Ordering: Prioritizes winning captures and prunes losing ones early.
 */
function orderMoves(moves, board, ttMove, ply) {
	const moveScores = [];
	for (const m of moves) {
		let score = 0;
		if (ttMove && m.from[0] === ttMove.from[0] && m.to[0] === ttMove.to[0] && m.from[1] === ttMove.from[1] && m.to[1] === ttMove.to[1]) {
			score = 3e5;
		} else if (m.capture) {
			const seeScore = staticExchangeEvaluation(board, m.from, m.to);
			if (seeScore >= 0) {
				score = 2e5 + seeScore; // Good captures
			} else {
				score = 1e4 + seeScore; // Losing captures (searched after quiet moves)
			}
		} else {
			const k1 = killerMoves[ply][0],
				k2 = killerMoves[ply][1];
			if (k1 && m.from[0] === k1.from[0] && m.to[0] === k1.to[0] && m.from[1] === k1.from[1] && m.to[1] === k1.to[1]) score = 5e4;
			else if (k2 && m.from[0] === k2.from[0] && m.to[0] === k2.to[0] && m.from[1] === k2.from[1] && m.to[1] === k2.to[1]) score = 4e4;
		}
		moveScores.push({
			move: m,
			score: score
		});
	}
	return moveScores.sort((a, b) => b.score - a.score).map(ms => ms.move);
}


function storeKillerMove(move, ply) {
	if (!move.capture) {
		killerMoves[ply][1] = killerMoves[ply][0];
		killerMoves[ply][0] = move
	}
}


function quiesce(board, alpha, beta, color, cr, ep) {
	nodeCount++;
	if ((nodeCount & 2047) === 0 && (performance.now() - searchStartTime > timeLimit)) {
		throw "TimeOut";
	}
	const standPat = evaluateBoard(board, color);
	if (standPat >= beta) {
		return beta;
	}
	if (alpha < standPat) {
		alpha = standPat;
	}
	const allMoves = generateAllLegalMoves(board, color, cr, ep);
	const forcingMoves = allMoves.filter(m => m.capture);
	const orderedMoves = orderMoves(forcingMoves, board, null, 0);
	for (const move of orderedMoves) {
		const nB = makeMove(board, move);
		const newCR = {
			...cr
		};
		if (move.piece === 'K') {
			newCR.K = false;
			newCR.Q = false;
		}
		if (move.piece === 'k') {
			newCR.k = false;
			newCR.q = false;
		}
		if (move.from[0] === 7 && move.from[1] === 0) newCR.Q = false;
		if (move.from[0] === 7 && move.from[1] === 7) newCR.K = false;
		if (move.from[0] === 0 && move.from[1] === 0) newCR.q = false;
		if (move.from[0] === 0 && move.from[1] === 7) newCR.k = false;
		const score = -quiesce(nB, -beta, -alpha, color === 'w' ? 'b' : 'w', newCR, null);
		if (score >= beta) {
			return beta;
		}
		if (score > alpha) {
			alpha = score;
		}
	}
	return alpha;
}

let searchStartTime;
let timeLimit;

function negamax(board, depth, alpha, beta, color, ply, cr, ep, history) {
	if ((nodeCount & 2047) === 0 && (performance.now() - searchStartTime > timeLimit)) {
		throw "TimeOut";
	}
	const hash = computeZobristHash(board, cr, ep, color);
	if (ply > 0 && history.has(hash)) {
		return 0;
	}
	const ttEntry = transpositionTable.get(hash);
	if (ttEntry && ttEntry.depth >= depth) {
		if (ttEntry.flag === TT_EXACT) return ttEntry.score;
		if (ttEntry.flag === TT_LOWERBOUND) alpha = Math.max(alpha, ttEntry.score);
		else if (ttEntry.flag === TT_UPPERBOUND) beta = Math.min(beta, ttEntry.score);
		if (alpha >= beta) return ttEntry.score;
	}
	if (depth <= 0) {
		return quiesce(board, alpha, beta, color, cr, ep);
	}
	nodeCount++;
	const newHistory = new Set(history);
	newHistory.add(hash);
	const inCheck = isSquareAttacked(board, findKing(board, color).r, findKing(board, color).c, color === 'w' ? 'b' : 'w');
	if (inCheck) {
		depth++;
	}
	const canNullMove = !inCheck && ply > 0 && depth >= 3;
	if (canNullMove) {
		const nullMoveReduction = 3;
		const score = -negamax(board, depth - 1 - nullMoveReduction, -beta, -beta + 1, color === 'w' ? 'b' : 'w', ply + 1, cr, null, newHistory);
		if (score >= beta) {
			return beta;
		}
	}
	const moves = generateAllLegalMoves(board, color, cr, ep);
	if (moves.length === 0) {
		return inCheck ? -30000 + ply : 0;
	}
	const orderedMoves = orderMoves(moves, board, ttEntry ? ttEntry.bestMove : null, ply);
	let bestMove = null;
	let ttFlag = TT_UPPERBOUND;
	let moveIndex = 0;
	for (const move of orderedMoves) {
		const newBoard = makeMove(board, move);
		const newCR = {
			...cr
		};
		if (move.piece === 'K') {
			newCR.K = false;
			newCR.Q = false;
		}
		if (move.piece === 'k') {
			newCR.k = false;
			newCR.q = false;
		}
		if (move.from[0] === 7 && move.from[1] === 0) newCR.Q = false;
		if (move.from[0] === 7 && move.from[1] === 7) newCR.K = false;
		if (move.from[0] === 0 && move.from[1] === 0) newCR.q = false;
		if (move.from[0] === 0 && move.from[1] === 7) newCR.k = false;
		const newEP = move.isPawnDoubleMove ? [(move.from[0] + move.to[0]) / 2, move.from[1]] : null;
		let score;
		if (moveIndex === 0) {
			score = -negamax(newBoard, depth - 1, -beta, -alpha, color === 'w' ? 'b' : 'w', ply + 1, newCR, newEP, newHistory);
		} else {
			const canReduce = depth >= 3 && !move.capture && !move.check;
			if (canReduce) {
				score = -negamax(newBoard, depth - 2, -alpha - 1, -alpha, color === 'w' ? 'b' : 'w', ply + 1, newCR, newEP, newHistory);
			} else {
				score = alpha + 1;
			}
			if (score > alpha) {
				score = -negamax(newBoard, depth - 1, -beta, -alpha, color === 'w' ? 'b' : 'w', ply + 1, newCR, newEP, newHistory);
			}
		}
		moveIndex++;
		if (score > alpha) {
			alpha = score;
			bestMove = move;
			ttFlag = TT_EXACT;
		}
		if (alpha >= beta) {
			storeKillerMove(move, ply);
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
//                 AI DRIVER (ITERATIVE DEEPENING)
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
		timeLimit = maxTime;
		nodeCount = 0;
		transpositionTable.clear();
		killerMoves = Array(50).fill(null).map(() => Array(2).fill(null));

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

		let bestMove = null;

		try {
			for (let currentDepth = 1; currentDepth <= 50; currentDepth++) {
				negamax(board, currentDepth, -Infinity, Infinity, turn, 0, castlingRights, enPassantTarget, history);
				const ttEntry = transpositionTable.get(computeZobristHash(board, castlingRights, enPassantTarget, turn));
				if (ttEntry && ttEntry.bestMove) {
					bestMove = ttEntry.bestMove;
				} else {
					if (!bestMove) {
						const legalMoves = generateAllLegalMoves(board, turn, castlingRights, enPassantTarget);
						bestMove = legalMoves.length > 0 ? legalMoves[0] : null;
					}
				}
			}
		} catch (e) {
			if (e !== "TimeOut") throw e;
		}

		const endTime = performance.now();
		postMessage({
			bestMove,
			timeTaken: (endTime - searchStartTime).toFixed(2),
			nodesSearched: nodeCount
		});
	}
};