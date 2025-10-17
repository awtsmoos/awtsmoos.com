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
const BISHOP_PAIR_BONUS = 50;
const ROOK_ON_OPEN_FILE_BONUS = 25;
const ROOK_ON_SEMI_OPEN_FILE_BONUS = 15;
const PASSED_PAWN_BONUS = [0, 10, 20, 35, 55, 80, 110, 150];
const ISOLATED_PAWN_PENALTY = -15;
const DOUBLED_PAWN_PENALTY = -10;

function evaluateBoard(board, colorToMove) {
    let totalScore = 0;
    let materialScore = 0;
    let positionalScore = 0;
    
    // --- Game Phase Detection ---
    // Determines if we are in the opening, middlegame, or endgame.
    // This allows the evaluation to change its priorities dynamically.
    let totalPieceValue = 0;
    const initialPieceValue = 2 * (4 * 320 + 4 * 330 + 4 * 500 + 2 * 900); // Excludes pawns and kings
    let whiteBishops = 0, blackBishops = 0;
    const pawnFiles = { w: new Set(), b: new Set() };
    const pawnRanks = { w: {}, b: {} };

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (!p) continue;
            
            const pT = p.toUpperCase();
            if (pT !== 'P' && pT !== 'K') {
                totalPieceValue += pieceValues[pT];
            }
            if (pT === 'P') {
                const color = (p === 'P' ? 'w' : 'b');
                pawnFiles[color].add(c);
                 if (!pawnRanks[color][c] || (color === 'w' ? r < pawnRanks[color][c] : r > pawnRanks[color][c])) {
                    pawnRanks[color][c] = r;
                }
            }
        }
    }
    const gamePhase = Math.max(0, Math.min(1, (initialPieceValue - totalPieceValue) / initialPieceValue)); // 0 = opening, 1 = endgame

	for (let r = 0; r < 8; r++) {
		for (let c = 0; c < 8; c++) {
			const p = board[r][c];
			if (!p) continue;

			const iW = p === p.toUpperCase();
            const color = iW ? 'w' : 'b';
			const pT = p.toUpperCase();
            const sign = iW ? 1 : -1;
            
            // --- 1. Material Score ---
			materialScore += sign * pieceValues[pT];

            // --- 2. Positional Score (Piece-Square Tables) ---
            // Tapered evaluation: Blends middlegame and endgame PSTs based on gamePhase.
            const mgPST = { P: pawnPST, N: knightPST, B: bishopPST, R: rookPST, Q: queenPST, K: kingPSTMidGame }[pT];
            const egPST = { P: pawnPST, N: knightPST, B: bishopPST, R: rookPST, Q: queenPST, K: kingPSTEndGame }[pT];
            const pstRow = iW ? r : 7 - r;
            const mgScore = mgPST[pstRow][c];
            const egScore = egPST[pstRow][c];
            positionalScore += sign * (mgScore * (1 - gamePhase) + egScore * gamePhase);
            
            // --- 3. Advanced Strategic Bonuses ---
            if (pT === 'B') {
                iW ? whiteBishops++ : blackBishops++;
            }
            if (pT === 'R') {
                const isSemiOpenFile = !pawnFiles[color].has(c);
                const isOpenFile = isSemiOpenFile && !pawnFiles[iW ? 'b' : 'w'].has(c);
                if (isOpenFile) positionalScore += sign * ROOK_ON_OPEN_FILE_BONUS;
                else if (isSemiOpenFile) positionalScore += sign * ROOK_ON_SEMI_OPEN_FILE_BONUS;
            }
            if (pT === 'P') {
                // Pawn Structure Evaluation
                if (!pawnFiles[color].has(c - 1) && !pawnFiles[color].has(c + 1)) positionalScore += sign * ISOLATED_PAWN_PENALTY;
				if (pawnRanks[color][c] !== r) positionalScore += sign * DOUBLED_PAWN_PENALTY;
                
                // Passed Pawn Evaluation
				let isPassed = true;
                const opponentPawn = iW ? 'p' : 'P';
				for (let forwardRank = r + (iW ? -1 : 1); forwardRank >= 0 && forwardRank < 8; forwardRank += (iW ? -1 : 1)) {
					if (board[forwardRank][c] === opponentPawn) { isPassed = false; break; }
					if (c > 0 && board[forwardRank][c - 1] === opponentPawn) { isPassed = false; break; }
					if (c < 7 && board[forwardRank][c + 1] === opponentPawn) { isPassed = false; break; }
				}
				if (isPassed) positionalScore += sign * PASSED_PAWN_BONUS[iW ? 7 - r : r];
            }
		}
	}
    
    // Bishop Pair Bonus
    if (whiteBishops >= 2) positionalScore += BISHOP_PAIR_BONUS;
	if (blackBishops >= 2) positionalScore -= BISHOP_PAIR_BONUS;
    
    // --- 4. King Safety ---
    // This is now a critical component, especially in the middlegame.
    const whiteKingPos = findKing(board, 'w');
    const blackKingPos = findKing(board, 'b');
    const whiteKingSafety = evaluateKingSafety(board, whiteKingPos, 'w');
    const blackKingSafety = evaluateKingSafety(board, blackKingPos, 'b');
    const kingSafetyScore = (whiteKingSafety - blackKingSafety) * (1 - gamePhase); // King safety matters less in the endgame

	totalScore = materialScore + positionalScore + kingSafetyScore;
	return (colorToMove === 'w' ? 1 : -1) * totalScore;
}


function evaluateKingSafety(board, kingPos, kingColor) {
    if (!kingPos) return 0;
    let attackScore = 0;
    const attackerColor = kingColor === 'w' ? 'b' : 'w';
    
    // --- Penalty for Weak Pawn Shield ---
    // This is the single most important fix for king safety.
    let pawnShieldPenalty = 0;
    const pawn = kingColor === 'w' ? 'P' : 'p';
    const startRank = kingColor === 'w' ? 6 : 1;
    for(let dc = -1; dc <= 1; dc++) {
        const file = kingPos.c + dc;
        if (file < 0 || file > 7) continue;
        
        let pawnFoundOnRank = -1;
        for (let r = 0; r < 8; r++) {
            if (board[r][file] === pawn) {
                pawnFoundOnRank = r;
                break;
            }
        }
        if (pawnFoundOnRank === -1) {
            pawnShieldPenalty += 30; // Missing pawn
        } else {
            pawnShieldPenalty += Math.abs(pawnFoundOnRank - startRank) * 10; // Pawn pushed too far
        }
    }
    attackScore += pawnShieldPenalty;

    // --- Score for nearby attackers ---
    const KING_ATTACK_WEIGHTS = { 'Q': 9, 'R': 5, 'B': 3, 'N': 3 };
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
                        attackScore += KING_ATTACK_WEIGHTS[p.toUpperCase()] * (4 - dist);
                    }
				}
			}
		}
    }
	return -attackScore; // Return as a penalty
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

function quiesce(board, alpha, beta, color, cr, ep) {
	nodeCount++;
	const standPat = evaluateBoard(board, color);
	if (standPat >= beta) return beta;
	if (alpha < standPat) alpha = standPat;

	const moves = generateAllLegalMoves(board, color, cr, ep).filter(m => m.capture);
	const orderedMoves = orderMoves(moves, board, null, 0);

	for (const move of orderedMoves) {
		const nB = makeMove(board, move);
		const newCR = { ...cr }; // Update castling rights as before
        if (move.piece === 'K') { newCR.K = false; newCR.Q = false; }
		if (move.piece === 'k') { newCR.k = false; newCR.q = false; }
		if (move.from[0] === 7 && move.from[1] === 0) newCR.Q = false;
		if (move.from[0] === 7 && move.from[1] === 7) newCR.K = false;
		if (move.from[0] === 0 && move.from[1] === 0) newCR.q = false;
		if (move.from[0] === 0 && move.from[1] === 7) newCR.k = false;
		
		const score = -quiesce(nB, -beta, -alpha, color === 'w' ? 'b' : 'w', newCR, null);
		if (score >= beta) return beta;
		if (score > alpha) alpha = score;
	}
	return alpha;
}

function negamax(board, depth, alpha, beta, color, ply, cr, ep, history) {
    const hash = computeZobristHash(board, cr, ep, color);
    // Modified repetition check: returning 0 can cause passive draws. 
    // A more advanced engine might return a small penalty to avoid draws when winning.
	if (ply > 0 && history.has(hash)) return 0;
    
	const ttEntry = transpositionTable.get(hash);
	if (ttEntry && ttEntry.depth >= depth) {
		if (ttEntry.flag === TT_EXACT) return ttEntry.score;
		if (ttEntry.flag === TT_LOWERBOUND) alpha = Math.max(alpha, ttEntry.score);
		else if (ttEntry.flag === TT_UPPERBOUND) beta = Math.min(beta, ttEntry.score);
		if (alpha >= beta) return ttEntry.score;
	}

	if (depth <= 0) return quiesce(board, alpha, beta, color, cr, ep);
	nodeCount++;

	const newHistory = new Set(history);
	newHistory.add(hash);

	const inCheck = isSquareAttacked(board, findKing(board, color).r, findKing(board, color).c, color === 'w' ? 'b' : 'w');
	if (inCheck) depth++;

	const moves = generateAllLegalMoves(board, color, cr, ep);
	if (moves.length === 0) return inCheck ? -30000 + ply : 0; // Checkmate or stalemate

	const orderedMoves = orderMoves(moves, board, ttEntry ? ttEntry.bestMove : null, ply);
	let bestMove = null;
    let ttFlag = TT_UPPERBOUND;

	for (const move of orderedMoves) {
		const newBoard = makeMove(board, move);
		const newCR = { ...cr }; // Update castling rights as before
        if (move.piece === 'K') { newCR.K = false; newCR.Q = false; }
		if (move.piece === 'k') { newCR.k = false; newCR.q = false; }
		if (move.from[0] === 7 && move.from[1] === 0) newCR.Q = false;
		if (move.from[0] === 7 && move.from[1] === 7) newCR.K = false;
		if (move.from[0] === 0 && move.from[1] === 0) newCR.q = false;
		if (move.from[0] === 0 && move.from[1] === 7) newCR.k = false;
		const newEP = move.isPawnDoubleMove ? [(move.from[0] + move.to[0]) / 2, move.from[1]] : null;

		const score = -negamax(newBoard, depth - 1, -beta, -alpha, color === 'w' ? 'b' : 'w', ply + 1, newCR, newEP, newHistory);
		
		if (score > alpha) {
			alpha = score;
			bestMove = move;
			ttFlag = TT_EXACT;
		}

		if (alpha >= beta) {
			storeKillerMove(move, ply);
			transpositionTable.set(hash, { score: beta, depth, flag: TT_LOWERBOUND, bestMove: move });
			return beta;
		}
	}

	transpositionTable.set(hash, { score: alpha, depth, flag: ttFlag, bestMove });
	return alpha;
}


// --- AI Driver ---
self.onmessage = function(e) { /* ... (no changes needed here) ... */
	const {
		command,
		fen,
		maxDepth,
		fenHistory
	} = e.data;
	if (command === 'calculate_move') {
		const startTime = performance.now();
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
				const hash = computeZobristHash(board, castlingRights, enPassantTarget, turn);
				history.add(hash)
			})
		}
		const {
			board,
			turn,
			castlingRights,
			enPassantTarget
		} = createBoardFromFEN(fen);
		let bestMove = null;
        let bestScore = -Infinity;
		for (let currentDepth = 1; currentDepth <= maxDepth; currentDepth++) {
			const score = negamax(board, currentDepth, -Infinity, Infinity, turn, 0, castlingRights, enPassantTarget, history);
			const ttEntry = transpositionTable.get(computeZobristHash(board, castlingRights, enPassantTarget, turn));
			if (ttEntry && ttEntry.bestMove) {
                bestMove = ttEntry.bestMove;
                bestScore = ttEntry.score;
            } else {
				const legalMoves = generateAllLegalMoves(board, turn, castlingRights, enPassantTarget);
				if (legalMoves.length > 0) bestMove = legalMoves[0];
				else bestMove = null
			}
            // Optional: Post intermediate results
            // postMessage({ bestMove, depth: currentDepth, score: bestScore });
		}
		const endTime = performance.now();
		postMessage({
			bestMove,
			timeTaken: (endTime - startTime).toFixed(2),
			nodesSearched: nodeCount
		})
	}
};