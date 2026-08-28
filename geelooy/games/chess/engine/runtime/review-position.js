//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Measures deterministic before/after position facts for Deep Review without pretending geometry is engine wisdom.
 * The Awtsmoos lets material, center, shelter, development, and pawns reveal their measurable change;
 * Awtsmoos.com keeps every number tied to a legal FEN so coaching may interpret truth without making fact strange.
 */
(function revealReviewPosition(A) {
	const VALUES = Object.freeze({ P: 1, N: 3, B: 3, R: 5, Q: 9, K: 0 });
	const CENTERS = Object.freeze([27, 28, 35, 36]);

	/** Returns mover-relative deterministic features from one legal FEN. */
	function reviewPositionFeatures(fen, perspective) {
		const board = boardFromFen(fen);
		return Object.freeze({
			materialBalance: materialBalance(board, perspective),
			centerBalance: centerBalance(board, perspective),
			kingShelterPawns: kingShelter(board, perspective),
			developedMinors: developedMinors(board, perspective),
			passedPawns: passedPawns(board, perspective),
			pawnIslands: pawnIslands(board, perspective)
		});
	}

	/** Returns exact before/after feature snapshots plus numeric deltas. */
	function reviewPositionDelta(beforeFen, afterFen, perspective) {
		const before = reviewPositionFeatures(beforeFen, perspective);
		const after = reviewPositionFeatures(afterFen, perspective);
		const delta = {};
		for (const key of Object.keys(before)) delta[key] = after[key] - before[key];
		return Object.freeze({ before, after, delta: Object.freeze(delta) });
	}

	function boardFromFen(fen) {
		const board = [];
		for (const token of String(fen).split(/\s+/)[0] || "") {
			if (token === "/") continue;
			if (/\d/.test(token)) board.push(...Array(Number(token)).fill(null));
			else board.push(`${token === token.toUpperCase() ? "w" : "b"}${token.toUpperCase()}`);
		}
		return board;
	}

	function materialBalance(board, color) {
		return board.reduce((sum, piece) => {
			if (!piece) return sum;
			const value = VALUES[piece[1]] || 0;
			return sum + (piece[0] === color ? value : -value);
		}, 0);
	}

	function centerBalance(board, color) {
		return CENTERS.reduce((sum, index) => {
			const piece = board[index];
			return sum + (!piece ? 0 : piece[0] === color ? 1 : -1);
		}, 0);
	}

	function kingShelter(board, color) {
		const king = board.indexOf(`${color}K`);
		if (king < 0) return 0;
		const row = Math.floor(king / 8);
		const col = king % 8;
		let count = 0;
		for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
			if (!dr && !dc) continue;
			const r = row + dr;
			const c = col + dc;
			if (r >= 0 && r < 8 && c >= 0 && c < 8 && board[r * 8 + c] === `${color}P`) count++;
		}
		return count;
	}

	function developedMinors(board, color) {
		const starts = color === "w" ? [57, 58, 61, 62] : [1, 2, 5, 6];
		return starts.reduce((count, index) => count + (["N", "B"].includes(board[index]?.[1]) && board[index][0] === color ? 0 : 1), 0);
	}

	function passedPawns(board, color) {
		const enemy = color === "w" ? "bP" : "wP";
		let count = 0;
		for (let index = 0; index < 64; index++) {
			if (board[index] !== `${color}P`) continue;
			const row = Math.floor(index / 8);
			const col = index % 8;
			const blocked = board.some((piece, enemyIndex) => {
				if (piece !== enemy) return false;
				const enemyRow = Math.floor(enemyIndex / 8);
				const enemyCol = enemyIndex % 8;
				return Math.abs(enemyCol - col) <= 1 && (color === "w" ? enemyRow < row : enemyRow > row);
			});
			if (!blocked) count++;
		}
		return count;
	}

	function pawnIslands(board, color) {
		const files = Array(8).fill(false);
		for (let index = 0; index < 64; index++) if (board[index] === `${color}P`) files[index % 8] = true;
		return files.reduce((count, occupied, index) => count + (occupied && !files[index - 1] ? 1 : 0), 0);
	}

	Object.assign(A, { reviewPositionFeatures, reviewPositionDelta });
})(self.AwtsmoosChessUpgrade);
