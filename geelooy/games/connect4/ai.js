//B"H

/**
 * Golem AI Logic.
 * Decides which column to drop a piece in.
 *
 * @param {Array<Array<number>>} board The current game board state.
 * @param {number} columns The number of columns on the board.
 * @returns {number} The column number for the AI to move in.
 */
function getGolemMove(board, columns) {
    let availableCols = [];
    for (let c = 0; c < columns; c++) {
        // Check if the top row of the column is empty
        if (board[0][c] === 0) {
            availableCols.push(c);
        }
    }

    if (availableCols.length > 0) {
        // Return a random available column
        return availableCols[Math.floor(Math.random() * availableCols.length)];
    }

    return -1; // Should not happen in a normal game
}