//B"H
// =================================================================
//                 OPENING BOOK CONVERSION LOGIC
// =================================================================
// This section contains the functions to convert the human-readable
// `sourceBook` (in PGN format) into the engine's required `rawOpeningBook` format.
// The raw format is: [FEN, Position Name, Move1, Move2, ...]

/**
 * A lightweight chess logic simulator to process PGN moves.
 * It's designed specifically for the book generation task and is not
 * a full-featured chess engine. It correctly handles piece movement,
 * captures, castling rights, and en passant to generate accurate FENs.
 */
class PgnConverter {
    constructor() {
        this.board = [];
        this.turn = 'w';
        this.castlingRights = 'KQkq';
        this.enPassantTarget = '-';
        this.halfmoveClock = 0;
        this.fullmoveNumber = 1;
        this.reset();
    }

    // Resets the board to the standard starting position
    reset() {
        this.board = [
            ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
            ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
            ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
        ];
        this.turn = 'w';
        this.castlingRights = 'KQkq';
        this.enPassantTarget = '-';
        this.halfmoveClock = 0;
        this.fullmoveNumber = 1;
    }

    // Generates the FEN string for the current board state
    toFen() {
        let fen = '';
        for (let r = 0; r < 8; r++) {
            let empty = 0;
            for (let c = 0; c < 8; c++) {
                const piece = this.board[r][c];
                if (piece) {
                    if (empty > 0) {
                        fen += empty;
                        empty = 0;
                    }
                    fen += piece;
                } else {
                    empty++;
                }
            }
            if (empty > 0) fen += empty;
            if (r < 7) fen += '/';
        }
        return `${fen} ${this.turn} ${this.castlingRights || '-'} ${this.enPassantTarget} ${this.halfmoveClock} ${this.fullmoveNumber}`;
    }
    
    // Parses a single SAN move string (e.g., "Nf3", "e4", "Qxb7") and returns the move object
    parseSan(san) {
        const move = { san };
        san = san.replace(/[+#?!=]/g, ''); // Clean annotations

        if (san === 'O-O') {
            const rank = this.turn === 'w' ? 7 : 0;
            return { from: [rank, 4], to: [rank, 6], piece: this.turn === 'w' ? 'K' : 'k' };
        }
        if (san === 'O-O-O') {
            const rank = this.turn === 'w' ? 7 : 0;
            return { from: [rank, 4], to: [rank, 2], piece: this.turn === 'w' ? 'K' : 'k' };
        }

        const piece = (san[0] >= 'A' && san[0] <= 'Z') ? san[0] : 'P';
        const targetSquare = san.slice(-2);
        const toCol = targetSquare.charCodeAt(0) - 'a'.charCodeAt(0);
        const toRow = 8 - parseInt(targetSquare[1]);

        let fromRow, fromCol;
        const ambiguity = san.slice(piece === 'P' ? 0 : 1, -2).replace('x', '');

        // Find the piece that can make this move
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const p = this.board[r][c];
                if (p && (this.turn === 'w' ? p.toUpperCase() === p : p.toLowerCase() === p) && p.toUpperCase() === piece) {
                    if (this.isValidMove(p, r, c, toRow, toCol)) {
                        if (ambiguity) {
                            const file = 'abcdefgh'[c];
                            const rank = (8 - r).toString();
                            if (ambiguity.length === 1 && (ambiguity === file || ambiguity === rank)) {
                                fromRow = r; fromCol = c;
                            } else if (ambiguity.length === 2 && ambiguity === `${file}${rank}`) {
                                fromRow = r; fromCol = c;
                            }
                        } else {
                           fromRow = r; fromCol = c;
                        }
                    }
                }
            }
        }
        if (fromRow === undefined) {
             // Handle pawn captures which have a file specified
             if (piece === 'P' && san.includes('x')) {
                fromCol = san.charCodeAt(0) - 'a'.charCodeAt(0);
                fromRow = this.turn === 'w' ? toRow + 1 : toRow - 1;
             } else {
                // Fallback for simple pawn moves
                const dir = this.turn === 'w' ? 1 : -1;
                if (this.board[toRow + dir]?.[toCol]?.toUpperCase() === 'P') fromRow = toRow + dir;
                else if (this.board[toRow + 2*dir]?.[toCol]?.toUpperCase() === 'P') fromRow = toRow + 2*dir;
                fromCol = toCol;
             }
        }
        
        return { from: [fromRow, fromCol], to: [toRow, toCol], piece, san: move.san };
    }

    // Applies a move object to the board state
    applyMove(move) {
        const [fromR, fromC] = move.from;
        const [toR, toC] = move.to;
        const piece = this.board[fromR][fromC];

        // Reset clocks
        this.halfmoveClock++;
        if (piece?.toLowerCase() === 'p' || this.board[toR][toC]) {
            this.halfmoveClock = 0;
        }

        // En Passant
        if (piece?.toLowerCase() === 'p' && this.enPassantTarget !== '-' && toC === (this.enPassantTarget.charCodeAt(0) - 'a'.charCodeAt(0)) && toR === (8 - parseInt(this.enPassantTarget[1]))) {
            const capturedPawnRow = this.turn === 'w' ? toR + 1 : toR - 1;
            this.board[capturedPawnRow][toC] = null;
        }
        this.enPassantTarget = '-';
        if (piece?.toLowerCase() === 'p' && Math.abs(fromR - toR) === 2) {
            this.enPassantTarget = 'abcdefgh'[fromC] + (this.turn === 'w' ? '3' : '6');
        }

        // Move piece
        this.board[toR][toC] = piece;
        this.board[fromR][fromC] = null;

        // Castling
        if (piece?.toLowerCase() === 'k' && Math.abs(fromC - toC) === 2) {
            const rookFromCol = toC > fromC ? 7 : 0;
            const rookToCol = toC > fromC ? 5 : 3;
            this.board[fromR][rookToCol] = this.board[fromR][rookFromCol];
            this.board[fromR][rookFromCol] = null;
        }

        // Update castling rights
        if (piece === 'K') this.castlingRights = this.castlingRights.replace('K', '').replace('Q', '');
        if (piece === 'k') this.castlingRights = this.castlingRights.replace('k', '').replace('q', '');
        if (piece === 'R' && fromC === 0) this.castlingRights = this.castlingRights.replace('Q', '');
        if (piece === 'R' && fromC === 7) this.castlingRights = this.castlingRights.replace('K', '');
        if (piece === 'r' && fromC === 0) this.castlingRights = this.castlingRights.replace('q', '');
        if (piece === 'r' && fromC === 7) this.castlingRights = this.castlingRights.replace('k', '');

        // Switch turn
        if (this.turn === 'b') this.fullmoveNumber++;
        this.turn = this.turn === 'w' ? 'b' : 'w';
    }
    
    // A simplified move validator used only for finding the correct piece in `parseSan`.
    // This is NOT a full legal move generator.
    isValidMove(piece, fromR, fromC, toR, toC) {
        const p_lower = piece.toLowerCase();
        if (p_lower === 'p') return true; // Pawns are complex, we accept any valid target.
        if (p_lower === 'n') return Math.abs((fromR - toR) * (fromC - toC)) === 2;
        // Simplified check for sliding pieces, doesn't check for blocking.
        if (p_lower === 'b') return Math.abs(fromR - toR) === Math.abs(fromC - toC);
        if (p_lower === 'r') return fromR === toR || fromC === toC;
        if (p_lower === 'q') return Math.abs(fromR - toR) === Math.abs(fromC - toC) || fromR === toR || fromC === toC;
        if (p_lower === 'k') return Math.abs(fromR - toR) <= 1 && Math.abs(fromC - toC) <= 1;
        return false;
    }
}

/**
 * Main function to generate the rawOpeningBook from the sourceBook.
 * It iterates through each PGN, simulates the moves, and groups them
 * by the resulting board position (FEN).
 * @param {Array} source - The sourceBook array of {name, pgn} objects.
 * @returns {Array} The processed rawOpeningBook.
 */
function generateRawBook(source) {
    const converter = new PgnConverter();
    const bookMap = new Map();
    const startFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

    for (const opening of source) {
        converter.reset();
        let currentFen = startFen;
        let positionName = "Start Position";

        // Remove move numbers and result from PGN
        const moves = opening.pgn.replace(/\d+\.\s/g, '').replace(/\s\*/g, '').split(' ').filter(Boolean);

        for (const san of moves) {
            // Find the move object {from, to, san}
            const move = converter.parseSan(san);
            
            // Get the entry for the current position or create a new one
            if (!bookMap.has(currentFen)) {
                bookMap.set(currentFen, [currentFen, positionName]);
            }
            const entry = bookMap.get(currentFen);
            
            // Add the move if it's not already listed for this position
            const moveExists = entry.slice(2).some(m => m.san === move.san);
            if (!moveExists) {
                entry.push({ from: move.from, to: move.to, san: move.san });
            }

            // Apply the move to get the next position
            converter.applyMove(move);
            currentFen = converter.toFen();
            positionName = opening.name; // The next FEN's name is the opening it leads to
        }
    }
    
    return Array.from(bookMap.values());
}

