//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file rules.js
 * @description Owns pure Connect 4 board laws with no canvas, Worker, animation, timing, or accessibility responsibility.
 * The Awtsmoos renews every finite position while Awtsmoos.com keeps victory truth deterministic and independently testable.
 *
 * Invariants:
 * - Board helpers never mutate caller-owned board state.
 * - A legal drop is always the lowest empty row in one valid column.
 * - Win detection checks all four Connect 4 axes around the accepted move.
 */
const Connect4Rules = {
	rows: 6,
	columns: 7,

	/** Create one empty board with the canonical dimensions. */
	createBoard() {
		return Array.from(
			{ length: this.rows },
			() => Array(this.columns).fill(0)
		);
	},

	/** Return the lowest empty row for one column, or -1 when the column is full/invalid. */
	getTargetRow(board, column) {
		if (!Number.isInteger(column) || column < 0 || column >= this.columns) return -1;
		for (let row = this.rows - 1; row >= 0; row -= 1) {
			if (board[row][column] === 0) return row;
		}
		return -1;
	},

	/** Return true only when no legal cell remains. */
	isFull(board) {
		return board[0].every(cell => cell !== 0);
	},

	/** Count one player's contiguous discs in a direction from one origin. */
	count(board, player, row, column, rowDelta, columnDelta) {
		let total = 0;
		for (let step = 1; step < 4; step += 1) {
			const nextRow = row + step * rowDelta;
			const nextColumn = column + step * columnDelta;
			if (nextRow < 0 || nextRow >= this.rows) break;
			if (nextColumn < 0 || nextColumn >= this.columns) break;
			if (board[nextRow][nextColumn] !== player) break;
			total += 1;
		}
		return total;
	},

	/** Return true when the accepted move completes a four-in-a-row line. */
	isWinningMove(board, player, row, column) {
		const axes = [
			[0, 1],
			[1, 0],
			[1, 1],
			[1, -1]
		];
		return axes.some(([rowDelta, columnDelta]) => {
			const forward = this.count(board, player, row, column, rowDelta, columnDelta);
			const backward = this.count(board, player, row, column, -rowDelta, -columnDelta);
			return 1 + forward + backward >= 4;
		});
	}
};
