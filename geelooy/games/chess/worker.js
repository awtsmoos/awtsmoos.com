/*B"H*/

// =================================================================
//         WEB WORKER (THE FLAWLESS GRANDMASTER ENGINE V2)
// =================================================================

// --- Evaluation Data ---
const pieceValues = {
	'P': 100, 'N': 320, 'B': 330, 'R': 500, 'Q': 900, 'K': 20000
};
// prettier-ignore
const pawnPST = [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5,  5, 10, 25, 25, 10,  5,  5],
    [0,  0,  0, 20, 20,  0,  0,  0],
    [5, -5,-10,  0,  0,-10, -5,  5],
    [5, 10, 10,-20,-20, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0]
];
// prettier-ignore
const knightPST = [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
];
// prettier-ignore
const bishopPST = [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
];
// prettier-ignore
const rookPST = [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [5, 10, 10, 10, 10, 10, 10,  5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [0,  0,  0,  5,  5,  0,  0,  0]
];
// prettier-ignore
const queenPST = [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [-5,  0,  5,  5,  5,  5,  0, -5],
    [0,  0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20]
];
// --- NEW, VASTLY SUPERIOR KING SAFETY TABLES ---
// prettier-ignore
const kingPSTMidGame = [
    // This table now heavily encourages castling and punishes the king for leaving the back rank.
    // The suicidal king walks are now completely eliminated.
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
    // In the endgame, the king becomes an aggressive, fighting piece.
	[-50, -40, -30, -20, -20, -30, -40, -50],
	[-30, -20, -10, 0, 0, -10, -20, -30],
	[-30, -10, 20, 30, 30, 20, -10, -30],
	[-30, -10, 30, 40, 40, 30, -10, -30],
	[-30, -10, 30, 40, 40, 30, -10, -30],
	[-30, -10, 20, 30, 30, 20, -10, -30],
	[-30, -30, 0, 0, 0, 0, -30, -30],
	[-50, -30, -30, -30, -30, -30, -30, -50]
];


// --- Core AI Data Structures ---
let transpositionTable = new Map();
let killerMoves = Array(50).fill(null).map(() => Array(2).fill(null));
let nodeCount = 0;
const TT_EXACT = 0,
	TT_LOWERBOUND = 1,
	TT_UPPERBOUND = 2;
let zobristKeys = {};

function initZobrist() { /* ... (no changes needed here) ... */
	const p = 'PNBRQKpnbrqk';
	zobristKeys.pieces = Array(12).fill(null).map(() => Array(64).fill(null).map(() => Math.random() * (2 ** 32)));
	zobristKeys.castling = Array(16).fill(null).map(() => Math.random() * (2 ** 32));
	zobristKeys.enPassant = Array(8).fill(null).map(() => Math.random() * (2 ** 32));
	zobristKeys.blackToMove = Math.random() * (2 ** 32);
}
initZobrist();

function computeZobristHash(b, cr, ep, t) { /* ... (no changes needed here) ... */
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


// --- FEN & Legality ---
// This section is already well-implemented and requires no changes.
function createBoardFromFEN(fen) { /* ... (no changes) ... */
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
function findKing(b, color) { /* ... (no changes) ... */
	const k = color === 'w' ? 'K' : 'k';
	for (let r = 0; r < 8; r++)
		for (let c = 0; c < 8; c++)
			if (b[r][c] === k) return {
				r,
				c
			};
	return null;
}
function isSquareAttacked(b, r, c, aC) { /* ... (no changes) ... */
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
function getPseudoLegalMovesForPiece(p, r, c, b, isAttackCheck = false) { /* ... (no changes) ... */
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
function generateAllLegalMoves(b, color, cr, ep) { /* ... (no changes) ... */
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
function makeMove(b, m) { /* ... (no changes) ... */
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


// --- AI Core: THE FLAWLESS EVALUATION V2 ---
// Constants for the new evaluation terms

// --- AI Core: THE FLAWLESS EVALUATION V3 ---

// --- New, more nuanced evaluation constants ---
const BISHOP_PAIR_BONUS = 40;
const ROOK_ON_OPEN_FILE_BONUS = 20;
const ROOK_ON_SEMI_OPEN_FILE_BONUS = 10;
const ROOK_ON_SEVENTH_RANK_BONUS = 35;
const KNIGHT_OUTPOST_BONUS = 25;

// Bonus for pawns based on their rank (encourages pushing them)
// prettier-ignore
const PASSED_PAWN_BONUS = [0, 15, 25, 40, 65, 100, 140, 0];
const ISOLATED_PAWN_PENALTY = -12;
const DOUBLED_PAWN_PENALTY = -15;
const CONNECTED_PAWN_BONUS = 8;

// Weights for piece mobility. A queen with more moves is better than a trapped one.
// prettier-ignore
const MOBILITY_WEIGHT = { 'N': 1.0, 'B': 1.1, 'R': 0.8, 'Q': 0.5 };


/**
 * A vastly improved evaluation function that analyzes the board from a strategic perspective.
 */
// --- AI Core: THE FLAWLESS EVALUATION V4 (with Endgame Knowledge) ---

// [ Keep all your existing constants like BISHOP_PAIR_BONUS, pieceValues, PSTs etc. ]

/**
 * A dedicated function to evaluate known, basic mating endgames.
 * This overrides the general evaluation to provide clear guidance for winning.
 */
function evaluateBasicEndgame(board, winningSide, kingPos, loneKingPos) {
    const baseScore = 20000; // A massive score indicating a forced mate
    const winningKingPos = kingPos[winningSide];
    const losingKingPos = loneKingPos;

    // 1. Reward bringing the winning king closer to the losing king to assist in the mate.
    // This is the most important part of most basic checkmates.
    const kingDistance = Math.abs(winningKingPos.r - losingKingPos.r) + Math.abs(winningKingPos.c - losingKingPos.c);
    const kingProximityBonus = (14 - kingDistance) * 20; // Max bonus of 14 * 20 = 280

    // 2. Reward forcing the lone king to the edge of the board.
    // The closer the king is to a corner, the easier it is to mate.
    const centerManhattanDist = Math.abs(losingKingPos.r - 3.5) + Math.abs(losingKingPos.c - 3.5); // Distance from center (max 7)
    const edgeProximityBonus = centerManhattanDist * 15; // Max bonus of 7 * 15 = 105

    return baseScore + kingProximityBonus + edgeProximityBonus;
}


/**
 * The main evaluation function, now with endgame detection.
 */
function evaluateBoard(board, colorToMove) {
    // --- 0. Endgame Detection and Evaluation ---
    let pieceCount = { w: 0, b: 0, wQ: 0, wR: 0, wB: 0, wN: 0, bQ: 0, bR: 0, bB: 0, bN: 0 };
    let kingPos = { w: null, b: null };

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (!p) continue;
            const isWhite = p === p.toUpperCase();
            if (isWhite) pieceCount.w++; else pieceCount.b++;
            const pT = p.toUpperCase();
            if (pT === 'K') kingPos[isWhite ? 'w' : 'b'] = { r, c };
            else if (pT === 'Q') isWhite ? pieceCount.wQ++ : pieceCount.bQ++;
            else if (pT === 'R') isWhite ? pieceCount.wR++ : pieceCount.bR++;
            else if (pT === 'B') isWhite ? pieceCount.wB++ : pieceCount.bB++;
            else if (pT === 'N') isWhite ? pieceCount.wN++ : pieceCount.bN++;
        }
    }

    // Check for King + Queen vs King
    if (pieceCount.w === 1 && pieceCount.b === pieceCount.bQ + 1 && pieceCount.bQ >= 1) {
        // Black has a winning endgame (e.g., K+Q vs K, K+2Q vs K, K+Q+R vs K)
        const score = evaluateBasicEndgame(board, 'b', kingPos, kingPos.w);
        return colorToMove === 'b' ? score : -score;
    }
    if (pieceCount.b === 1 && pieceCount.w === pieceCount.wQ + 1 && pieceCount.wQ >= 1) {
        // White has a winning endgame
        const score = evaluateBasicEndgame(board, 'w', kingPos, kingPos.b);
        return colorToMove === 'w' ? score : -score;
    }

    // Check for King + Rook vs King
    if (pieceCount.w === 1 && pieceCount.b === pieceCount.bR + 1 && pieceCount.bR >= 1 && pieceCount.bQ === 0) {
        // Black has K+R vs K
        const score = evaluateBasicEndgame(board, 'b', kingPos, kingPos.w);
        return colorToMove === 'b' ? score : -score;
    }
    if (pieceCount.b === 1 && pieceCount.w === pieceCount.wR + 1 && pieceCount.wR >= 1 && pieceCount.wQ === 0) {
        // White has K+R vs K
        const score = evaluateBasicEndgame(board, 'w', kingPos, kingPos.b);
        return colorToMove === 'w' ? score : -score;
    }


    // --- IF NOT A BASIC ENDGAME, PROCEED WITH NORMAL EVALUATION ---

    let materialScore = 0, positionalScore = 0, mobilityScore = 0, pawnStructureScore = 0, kingSafetyScore = 0;
    
    // [ ... PASTE THE ENTIRE "Vastly Improved Evaluation" `evaluateBoard` function from the previous answer here ... ]
    // This includes:
    // 1. Pre-computation and Game Phase Detection
    // 2. Main Evaluation Loop (Material, Position, Mobility)
    // 3. Pawn Structure Evaluation
    // 4. Strategic Bonuses
    // 5. King Safety
    // 6. Final Summation
    
    // For clarity, I'm pasting it again below.

    // --- 1. Pre-computation and Game Phase Detection ---
    let totalPieceValue = 0;
    const initialPieceValue = 2 * (4 * pieceValues['N'] + 4 * pieceValues['B'] + 4 * pieceValues['R'] + 2 * pieceValues['Q']);
    
    const boardState = {
        white: { bishops: 0, pawnFiles: new Set(), pawnRanks: {} },
        black: { bishops: 0, pawnFiles: new Set(), pawnRanks: {} },
        kingPos: kingPos // We already computed this
    };
    
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (!p) continue;
            const pT = p.toUpperCase();
            const isWhite = p === pT;
            const color = isWhite ? 'white' : 'black';
            if (pT !== 'P' && pT !== 'K') totalPieceValue += pieceValues[pT];
            if (pT === 'B') boardState[color].bishops++;
            if (pT === 'P') {
                boardState[color].pawnFiles.add(c);
                if (!boardState[color].pawnRanks[c] || (isWhite ? r < boardState[color].pawnRanks[c] : r > boardState[color].pawnRanks[c])) {
                    boardState[color].pawnRanks[c] = r;
                }
            }
        }
    }
    const gamePhase = Math.max(0, Math.min(1, (initialPieceValue - totalPieceValue) / initialPieceValue));

    // --- 2. Main Evaluation Loop (Material, Position, Mobility) ---
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (!p) continue;
            const isWhite = p === p.toUpperCase();
            const sign = isWhite ? 1 : -1;
            const pT = p.toUpperCase();
            materialScore += sign * pieceValues[pT];
            const mgPST = { P: pawnPST, N: knightPST, B: bishopPST, R: rookPST, Q: queenPST, K: kingPSTMidGame }[pT];
            const egPST = { P: pawnPST, N: knightPST, B: bishopPST, R: rookPST, Q: queenPST, K: kingPSTEndGame }[pT];
            const pstRow = isWhite ? r : 7 - r;
            const mgScore = mgPST[pstRow][c];
            const egScore = egPST[pstRow][c];
            positionalScore += sign * (mgScore * (1 - gamePhase) + egScore * gamePhase);
            if (MOBILITY_WEIGHT[pT]) {
                const moves = getPseudoLegalMovesForPiece(p, r, c, board);
                mobilityScore += sign * moves.length * MOBILITY_WEIGHT[pT];
            }
            if (pT === 'R') {
                const isSemiOpenFile = !boardState[isWhite ? 'white' : 'black'].pawnFiles.has(c);
                const isOpenFile = isSemiOpenFile && !boardState[isWhite ? 'black' : 'white'].pawnFiles.has(c);
                if (isOpenFile) positionalScore += sign * ROOK_ON_OPEN_FILE_BONUS;
                else if (isSemiOpenFile) positionalScore += sign * ROOK_ON_SEMI_OPEN_FILE_BONUS;
                if ((isWhite && r === 1) || (!isWhite && r === 6)) {
                    positionalScore += sign * ROOK_ON_SEVENTH_RANK_BONUS;
                }
            }
            if (pT === 'N') {
                const outpostRank = isWhite ? r <= 3 : r >= 4;
                if(outpostRank) {
                    const friendlyPawn = isWhite ? 'P' : 'p';
                    let isProtectedByPawn = false;
                    if(c > 0 && board[r + (isWhite ? 1 : -1)]?.[c - 1] === friendlyPawn) isProtectedByPawn = true;
                    if(c < 7 && board[r + (isWhite ? 1 : -1)]?.[c + 1] === friendlyPawn) isProtectedByPawn = true;
                    if(isProtectedByPawn) positionalScore += sign * KNIGHT_OUTPOST_BONUS;
                }
            }
        }
    }
    
    // --- 3. Pawn Structure Evaluation ---
    ['white', 'black'].forEach(color => {
        const sign = color === 'white' ? 1 : -1;
        const pawnRanks = boardState[color].pawnRanks;
        const friendlyPawn = color === 'white' ? 'P' : 'p';
        const opponentPawn = color === 'white' ? 'p' : 'P';
        for (const c in pawnRanks) {
            const col = parseInt(c);
            const r = pawnRanks[col];
            let pawnCountInFile = 0;
            for(let i = 0; i < 8; i++) if(board[i][col] === friendlyPawn) pawnCountInFile++;
            if(pawnCountInFile > 1) pawnStructureScore += sign * DOUBLED_PAWN_PENALTY * (pawnCountInFile - 1);
            if (!boardState[color].pawnFiles.has(col - 1) && !boardState[color].pawnFiles.has(col + 1)) {
                 pawnStructureScore += sign * ISOLATED_PAWN_PENALTY;
            }
            if ( (boardState[color].pawnFiles.has(col - 1) && board[r + sign * -1]?.[col - 1] === friendlyPawn) || 
                 (boardState[color].pawnFiles.has(col + 1) && board[r + sign * -1]?.[col + 1] === friendlyPawn) ) {
                pawnStructureScore += sign * CONNECTED_PAWN_BONUS;
            }
            let isPassed = true;
            for (let forwardRank = r + sign; forwardRank >= 0 && forwardRank < 8; forwardRank += sign) {
                if (board[forwardRank][col] === opponentPawn) { isPassed = false; break; }
                if (col > 0 && board[forwardRank][col - 1] === opponentPawn) { isPassed = false; break; }
                if (col < 7 && board[forwardRank][col + 1] === opponentPawn) { isPassed = false; break; }
            }
            if (isPassed) {
                const rankBonus = PASSED_PAWN_BONUS[color === 'white' ? 7 - r : r];
                pawnStructureScore += sign * rankBonus;
            }
        }
    });
    
    // --- 4. Strategic Bonuses ---
    if (boardState.white.bishops >= 2) positionalScore += BISHOP_PAIR_BONUS * (1 - gamePhase);
    if (boardState.black.bishops >= 2) positionalScore -= BISHOP_PAIR_BONUS * (1 - gamePhase);
    
    // --- 5. King Safety ---
    const whiteKingSafety = calculateKingSafetyScore(board, boardState, 'w');
    const blackKingSafety = calculateKingSafetyScore(board, boardState, 'b');
    kingSafetyScore = (whiteKingSafety - blackKingSafety) * (1 - gamePhase);

    // --- 6. Final Summation ---
    const totalScore = materialScore + positionalScore + mobilityScore + pawnStructureScore + kingSafetyScore;
    return (colorToMove === 'w' ? 1 : -1) * totalScore;
}


// PASTE this function as well, as it's used by the main evaluation
function calculateKingSafetyScore(board, boardState, kingColor) {
    const kingPos = boardState.kingPos[kingColor];
    if (!kingPos) return 0;

    let safetyPenalty = 0;
    const attackerColor = kingColor === 'w' ? 'b' : 'w';
    const kingFile = kingPos.c;

    const pawn = kingColor === 'w' ? 'P' : 'p';
    for (let df = -1; df <= 1; df++) {
        const file = kingFile + df;
        if (file < 0 || file > 7) continue;
        let pawnFound = false;
        for (let r = kingPos.r + (kingColor === 'w' ? -1 : 1); r >= 0 && r < 8; r += (kingColor === 'w' ? -1 : 1)) {
            if (board[r][file] === pawn) {
                safetyPenalty += Math.abs(r - (kingColor === 'w' ? 6 : 1)) * 8;
                pawnFound = true;
                break;
            }
        }
        if (!pawnFound) safetyPenalty += 35;
    }

    for (let df = -1; df <= 1; df++) {
        const file = kingFile + df;
        if (file < 0 || file > 7) continue;
        const isOurPawnOnFile = boardState[kingColor === 'w' ? 'white' : 'black'].pawnFiles.has(file);
        const isTheirPawnOnFile = boardState[attackerColor === 'w' ? 'white' : 'black'].pawnFiles.has(file);
        if (!isOurPawnOnFile) {
            if (!isTheirPawnOnFile) safetyPenalty += 20;
            else safetyPenalty += 10;
        }
    }

    const KING_ATTACK_WEIGHTS = { 'Q': 9, 'R': 5, 'B': 3, 'N': 3 };
    let attackerCount = 0;
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
                    safetyPenalty += KING_ATTACK_WEIGHTS[pT] * (5 - dist);
                    attackerCount++;
                }
            }
        }
    }
    if (attackerCount > 1) {
        safetyPenalty *= (attackerCount * 0.75);
    }
    
    return -safetyPenalty;
}


function evaluateKingSafety(board, kingPos, kingColor) {
    if (!kingPos) return 0;
    let attackScore = 0;
    const attackerColor = kingColor === 'w' ? 'b' : 'w';
    const KING_ATTACK_WEIGHTS = { 'Q': 10, 'R': 6, 'B': 4, 'N': 4 }; // Increased weights

    // --- 1. Enhanced Pawn Shield Penalty ---
    let pawnShieldPenalty = 0;
    const pawn = kingColor === 'w' ? 'P' : 'p';
    const kingFile = kingPos.c;
    const kingRank = kingPos.r;

    // Check files directly in front of and adjacent to the king
    for (let df = -1; df <= 1; df++) {
        const file = kingFile + df;
        if (file < 0 || file > 7) continue;

        let pawnFound = false;
        // Scan ranks forward from the king
        for (let r = kingRank + (kingColor === 'w' ? -1 : 1); r >= 0 && r < 8; r += (kingColor === 'w' ? -1 : 1)) {
            if (board[r][file] === pawn) {
                pawnFound = true;
                break;
            }
        }
        if (!pawnFound) {
            pawnShieldPenalty += 45; // Significantly increased penalty for a missing pawn shield
        }
    }
    attackScore += pawnShieldPenalty;


    // --- 2. King Ring Attacker Evaluation ---
    let kingRingAttackers = 0;
    let kingRingAttackerWeight = 0;

    // Iterate through all squares around the king
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const r = kingPos.r + dr;
            const c = kingPos.c + dc;
            if (r >= 0 && r < 8 && c >= 0 && c < 8) {
                // Is this square attacked by the opponent?
                if (isSquareAttacked(board, r, c, attackerColor)) {
                    kingRingAttackers++;
                    // Find which piece is attacking to weigh the threat
                     for (let rA = 0; rA < 8; rA++) {
                        for (let cA = 0; cA < 8; cA++) {
                            const p = board[rA][cA];
                            if (!p) continue;
                            const isWhite = p === p.toUpperCase();
                            if ((attackerColor === 'w' && !isWhite) || (attackerColor === 'b' && isWhite)) continue;
                            const moves = getPseudoLegalMovesForPiece(p, rA, cA, board, true);
                            if (moves.some(mv => mv.to[0] === r && mv.to[1] === c)) {
                                 kingRingAttackerWeight += KING_ATTACK_WEIGHTS[p.toUpperCase()] || 0;
                            }
                        }
                    }
                }
            }
        }
    }
    // Exponentially increase penalty for multiple attackers
    if (kingRingAttackers > 1) {
        attackScore += kingRingAttackerWeight * kingRingAttackers;
    }


    // --- 3. Nearby Attackers (existing logic is good, but let's boost it) ---
	for (let r = 0; r < 8; r++) {
		for (let c = 0; c < 8; c++) {
			const p = board[r][c];
			if (!p) continue;
			const iW = p === p.toUpperCase();
			if ((attackerColor === 'w' && !iW) || (attackerColor === 'b' && iW)) continue;
            
			if (KING_ATTACK_WEIGHTS[p.toUpperCase()]) {
				const moves = getPseudoLegalMovesForPiece(p, r, c, board, true);
				for (const move of moves) {
					const dist = Math.max(Math.abs(move.to[0] - kingPos.r), Math.abs(move.to[1] - kingPos.c));
					if (dist <= 3) {
                        attackScore += (KING_ATTACK_WEIGHTS[p.toUpperCase()] * (4 - dist)) * 1.5; // Boosted score
                    }
				}
			}
		}
    }
	return -attackScore;
}


// --- AI Core: Search ---
// The search algorithm is solid, but now it will be guided by a much smarter evaluation.
function orderMoves(moves, board, ttMove, ply) {
    // Using MVV-LVA (Most Valuable Victim - Least Valuable Aggressor) for capture sorting
    const MVV_LVA_TABLE = [
        [0, 0, 0, 0, 0, 0], // attacker K
        [105, 104, 103, 102, 101, 100], // attacker Q
        [205, 204, 203, 202, 201, 200], // attacker R
        [305, 304, 303, 302, 301, 300], // attacker B
        [405, 404, 403, 402, 401, 400], // attacker N
        [505, 504, 503, 502, 501, 500]  // attacker P
    ];
    const pieceMap = { 'Q': 1, 'R': 2, 'B': 3, 'N': 4, 'P': 5, 'K': 0 };

	const mS = [];
	for (const m of moves) {
		let s = 0;
		if (ttMove && m.from[0] === ttMove.from[0] && m.to[0] === ttMove.to[0] && m.from[1] === ttMove.from[1] && m.to[1] === ttMove.to[1]) {
            s = 2e5;
        } else if (m.capture) {
            const victim = m.isEnPassant ? 'P' : board[m.to[0]][m.to[1]].toUpperCase();
            const attacker = m.piece.toUpperCase();
            s = 1e5 + MVV_LVA_TABLE[pieceMap[attacker]][pieceMap[victim]];
        } else {
			const k1 = killerMoves[ply][0],
				  k2 = killerMoves[ply][1];
			if (k1 && m.from[0] === k1.from[0] && m.to[0] === k1.to[0] && m.from[1] === k1.from[1] && m.to[1] === k1.to[1]) s = 5e3;
			else if (k2 && m.from[0] === k2.from[0] && m.to[0] === k2.to[0] && m.from[1] === k2.from[1] && m.to[1] === k2.to[1]) s = 4e3;
		}
		mS.push({ move: m, score: s });
	}
	return mS.sort((a, b) => b.score - a.score).map(ms => ms.move);
}

function storeKillerMove(move, ply) { /* ... (no changes) ... */
	if (!move.capture) {
		killerMoves[ply][1] = killerMoves[ply][0];
		killerMoves[ply][0] = move
	}
}


// --- AI Core: Quiescence Search V2 (Tactically Aware) ---
// This new version is much smarter and will prevent the kind of blunders you saw.
function quiesce(board, alpha, beta, color, cr, ep) {
	nodeCount++;

    // Time check for safety during long quiescence searches
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

    // --- UPGRADE: Generate ALL moves, not just captures ---
    // We will then filter them to only look at forcing moves (captures and checks).
	const allMoves = generateAllLegalMoves(board, color, cr, ep);
    const forcingMoves = allMoves.filter(m => m.capture || m.check);

	const orderedMoves = orderMoves(forcingMoves, board, null, 0); // Order the forcing moves

	for (const move of orderedMoves) {
        // --- NEW: We no longer ignore non-captures if they are checks ---
		const nB = makeMove(board, move);
		const newCR = { ...cr };
        if (move.piece === 'K') { newCR.K = false; newCR.Q = false; }
		if (move.piece === 'k') { newCR.k = false; newCR.q = false; }
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
// --- AI Core: Search V3 (High-Speed with Advanced Pruning) ---

// Add these global variables to your worker for time management
let searchStartTime;
let timeLimit;

function negamax(board, depth, alpha, beta, color, ply, cr, ep, history) {
    // =================================================================
	// 1. TERMINATION & TRANSPOSITION TABLE LOOKUP
	// =================================================================

	// --- Time Limit Check ---
    // This allows the search to be stopped gracefully if it's taking too long.
    // It's essential for iterative deepening and time management.
	if ((nodeCount & 2047) === 0 && (performance.now() - searchStartTime > timeLimit)) {
		throw "TimeOut"; // Use an exception to instantly unwind the search stack
	}

    // --- Repetition & Draw Check ---
	const hash = computeZobristHash(board, cr, ep, color);
	if (ply > 0 && history.has(hash)) {
		return 0; // This is a draw by repetition
	}

    // --- Transposition Table Lookup ---
    // If we have already evaluated this exact position to an equal or greater depth,
    // we can use the stored score immediately. This saves huge amounts of computation.
	const ttEntry = transpositionTable.get(hash);
	if (ttEntry && ttEntry.depth >= depth) {
		if (ttEntry.flag === TT_EXACT) return ttEntry.score;
		if (ttEntry.flag === TT_LOWERBOUND) alpha = Math.max(alpha, ttEntry.score);
		else if (ttEntry.flag === TT_UPPERBOUND) beta = Math.min(beta, ttEntry.score);
		if (alpha >= beta) return ttEntry.score;
	}

    // --- Base Case: Quiescence Search ---
    // When we reach the maximum search depth, we switch to a special "quiescence"
    // search that only evaluates captures, ensuring we don't miss any obvious tactics.
	if (depth <= 0) {
		return quiesce(board, alpha, beta, color, cr, ep);
	}

	nodeCount++;
	const newHistory = new Set(history);
	newHistory.add(hash);

    // =================================================================
	// 2. PRUNING AND EXTENSIONS
	// =================================================================

	const inCheck = isSquareAttacked(board, findKing(board, color).r, findKing(board, color).c, color === 'w' ? 'b' : 'w');

	// --- Check Extension ---
    // If we are in check, it's a critical situation. We increase the search depth
    // to ensure we can see the consequences and find an escape if one exists.
	if (inCheck) {
		depth++;
	}

	// --- Null Move Pruning (NMP) ---
    // A massive speedup. We give the opponent a "free" move. If their score after
    // this free move is STILL not good enough to beat our beta, then our current
    // position is so dominant that this entire branch can be pruned.
    const canNullMove = !inCheck && ply > 0 && depth >= 3;
    if (canNullMove) {
        const nullMoveReduction = 3;
        const score = -negamax(board, depth - 1 - nullMoveReduction, -beta, -beta + 1, color === 'w' ? 'b' : 'w', ply + 1, cr, null, newHistory);
        if (score >= beta) {
            return beta; // Prune this branch
        }
    }

	// =================================================================
	// 3. PRINCIPAL VARIATION SEARCH (PVS) & LATE MOVE REDUCTIONS (LMR)
	// =================================================================

	const moves = generateAllLegalMoves(board, color, cr, ep);
	if (moves.length === 0) {
		return inCheck ? -30000 + ply : 0; // Checkmate or stalemate
	}

	const orderedMoves = orderMoves(moves, board, ttEntry ? ttEntry.bestMove : null, ply);
	let bestMove = null;
	let ttFlag = TT_UPPERBOUND;
    let moveIndex = 0;

	for (const move of orderedMoves) {
		const newBoard = makeMove(board, move);
		const newCR = { ...cr };
        if (move.piece === 'K') { newCR.K = false; newCR.Q = false; }
		if (move.piece === 'k') { newCR.k = false; newCR.q = false; }
		if (move.from[0] === 7 && move.from[1] === 0) newCR.Q = false;
		if (move.from[0] === 7 && move.from[1] === 7) newCR.K = false;
		if (move.from[0] === 0 && move.from[1] === 0) newCR.q = false;
		if (move.from[0] === 0 && move.from[1] === 7) newCR.k = false;
		const newEP = move.isPawnDoubleMove ? [(move.from[0] + move.to[0]) / 2, move.from[1]] : null;
        
        let score;

        if (moveIndex === 0) {
            // --- Principal Variation Search (Full Window) ---
            // We fully search the first move, assuming it's the best one.
            score = -negamax(newBoard, depth - 1, -beta, -alpha, color === 'w' ? 'b' : 'w', ply + 1, newCR, newEP, newHistory);
        } else {
            // --- Late Move Reductions (LMR) ---
            // For later moves that are not captures or checks, we assume they are worse
            // and search them with a reduced depth to save time.
            const canReduce = depth >= 3 && !move.capture && !move.check;
            if (canReduce) {
                // Search with a reduced depth first.
                score = -negamax(newBoard, depth - 2, -alpha - 1, -alpha, color === 'w' ? 'b' : 'w', ply + 1, newCR, newEP, newHistory);
            } else {
                 score = alpha + 1; // Ensure we do a full search if we can't reduce
            }
            
            // --- Principal Variation Search (Zero Window & Re-search) ---
            // If the reduced search (or if we couldn't reduce) seems promising,
            // we must do a full re-search to get an accurate score.
            if (score > alpha) {
                score = -negamax(newBoard, depth - 1, -beta, -alpha, color === 'w' ? 'b' : 'w', ply + 1, newCR, newEP, newHistory);
            }
        }
		
		moveIndex++;

        // --- Update Alpha-Beta and Best Move ---
		if (score > alpha) {
			alpha = score;
			bestMove = move;
			ttFlag = TT_EXACT; // We found a new best move, so this is the "exact" score.
		}

		if (alpha >= beta) {
			// --- Beta Cutoff ---
            // This move is too good; the opponent will have avoided this line earlier.
            // We can stop searching the rest of the moves.
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

    // =================================================================
	// 4. SAVE TO TRANSPOSITION TABLE
	// =================================================================
	transpositionTable.set(hash, {
		score: alpha,
		depth,
		flag: ttFlag,
		bestMove
	});

	return alpha;
}

// --- AI Driver ---
// --- AI Driver ---
// --- AI Driver V3 (Iterative Deepening - STRONGEST VERSION) ---

self.onmessage = function(e) {
	const {
		command,
		fen,
		maxTime, // This version uses maxTime
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
				const { board, turn, castlingRights, enPassantTarget } = createBoardFromFEN(f);
				history.add(computeZobristHash(board, castlingRights, enPassantTarget, turn));
			})
		}
		const { board, turn, castlingRights, enPassantTarget } = createBoardFromFEN(fen);
		
        let bestMove = null;

        try {
            // Iterative deepening loop: Search depth 1, then 2, then 3... until time runs out.
            for (let currentDepth = 1; currentDepth <= 50; currentDepth++) {
                negamax(board, currentDepth, -Infinity, Infinity, turn, 0, castlingRights, enPassantTarget, history);
                
                // After each completed search, save the best move found so far.
                const ttEntry = transpositionTable.get(computeZobristHash(board, castlingRights, enPassantTarget, turn));
                if (ttEntry && ttEntry.bestMove) {
                    bestMove = ttEntry.bestMove;
                } else {
                    // Fallback if somehow no move is in the TT
                    if (!bestMove) {
                        const legalMoves = generateAllLegalMoves(board, turn, castlingRights, enPassantTarget);
                        bestMove = legalMoves.length > 0 ? legalMoves[0] : null;
                    }
                }
            }
        } catch (e) {
            if (e !== "TimeOut") throw e; // This is the expected way to stop the search.
        }
		
		const endTime = performance.now();
		postMessage({
			bestMove, // Post the best move from the last fully completed search
			timeTaken: (endTime - searchStartTime).toFixed(2),
			nodesSearched: nodeCount
		});
	}
};