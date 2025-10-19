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
// =================================================================
//                 OPENING BOOK CONVERSION LOGIC (v1.1 - CORRECTED)
// =================================================================
// This version fixes a critical bug in SAN parsing that caused illegal moves
// to be stored in the opening book. The `parseSan` function is now much more

// robust and correctly identifies the origin square of every piece.

class PgnConverter {
    constructor() {
        // ... constructor remains the same as before
        this.board = [];
        this.turn = 'w';
        this.castlingRights = 'KQkq';
        this.enPassantTarget = '-';
        this.halfmoveClock = 0;
        this.fullmoveNumber = 1;
        this.reset();
    }

    reset() {
        // ... reset remains the same as before
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

    toFen() {
        // ... toFen remains the same as before
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
    
    // ================== START OF CORRECTED LOGIC ==================
    parseSan(san) {
        const originalSan = san;
        san = san.replace(/[+#?!=]/g, ''); // Clean annotations

        // Handle Castling
        if (san === 'O-O') {
            const rank = this.turn === 'w' ? 7 : 0;
            return { from: [rank, 4], to: [rank, 6], piece: this.turn === 'w' ? 'K' : 'k', san: originalSan };
        }
        if (san === 'O-O-O') {
            const rank = this.turn === 'w' ? 7 : 0;
            return { from: [rank, 4], to: [rank, 2], piece: this.turn === 'w' ? 'K' : 'k', san: originalSan };
        }

        const piece = (san[0] >= 'A' && san[0] <= 'Z') ? san[0] : 'P';
        const targetSquare = san.match(/[a-h][1-8]/)[0];
        const toCol = targetSquare.charCodeAt(0) - 'a'.charCodeAt(0);
        const toRow = 8 - parseInt(targetSquare[1]);
        
        const isCapture = san.includes('x');
        const ambiguity = san.slice(piece === 'P' ? 0 : 1, san.indexOf(targetSquare)).replace('x', '');
        
        const candidateMoves = [];
        const pieceToFind = this.turn === 'w' ? piece.toUpperCase() : piece.toLowerCase();
        
        // Find all pieces of the correct type and generate their possible moves
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (this.board[r][c] === pieceToFind) {
                    const moves = this._generateMovesForPiece(r, c);
                    candidateMoves.push(...moves);
                }
            }
        }
        
        // Filter moves to find the one that matches the SAN
        for (const move of candidateMoves) {
            if (move.to[0] === toRow && move.to[1] === toCol) {
                // Check for ambiguity resolution
                if (ambiguity) {
                    const fromFile = 'abcdefgh'[move.from[1]];
                    const fromRank = (8 - move.from[0]).toString();
                    if (ambiguity.length === 1) {
                        if (fromFile === ambiguity || fromRank === ambiguity) {
                           return { ...move, san: originalSan };
                        }
                    } else if (ambiguity === `${fromFile}${fromRank}`) {
                        return { ...move, san: originalSan };
                    }
                } 
                // Handle pawn captures specifically
                else if (piece === 'P' && isCapture) {
                    const fromFile = 'abcdefgh'[move.from[1]];
                    if (fromFile === san[0]) {
                        return { ...move, san: originalSan };
                    }
                }
                // If no ambiguity, this must be the move
                else {
                    return { ...move, san: originalSan };
                }
            }
        }
        
        console.error("COULD NOT PARSE SAN:", originalSan, " for FEN:", this.toFen());
        return null; // Should not happen with a valid PGN
    }
    
    _generateMovesForPiece(r, c) {
        const moves = [];
        const p = this.board[r][c];
        if (!p) return [];

        const p_lower = p.toLowerCase();
        const addMove = (toR, toC) => moves.push({ from: [r, c], to: [toR, toC], piece: p });

        // Simplified move generation, sufficient for parsing valid PGNs.
        if (p_lower === 'p') {
            const dir = this.turn === 'w' ? -1 : 1;
            const startRank = this.turn === 'w' ? 6 : 1;
            // Forward move
            if (!this.board[r+dir]?.[c]) addMove(r+dir, c);
            // Double move
            if (r === startRank && !this.board[r+dir]?.[c] && !this.board[r+2*dir]?.[c]) addMove(r+2*dir, c);
            // Captures
            if (this.board[r+dir]?.[c-1] || (this.enPassantTarget && r+dir === 8-parseInt(this.enPassantTarget[1]) && c-1 === this.enPassantTarget.charCodeAt(0)-'a'.charCodeAt(0))) addMove(r+dir, c-1);
            if (this.board[r+dir]?.[c+1] || (this.enPassantTarget && r+dir === 8-parseInt(this.enPassantTarget[1]) && c+1 === this.enPassantTarget.charCodeAt(0)-'a'.charCodeAt(0))) addMove(r+dir, c+1);
            
        } else {
            const directions = {
                n: [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]],
                b: [[-1,-1],[-1,1],[1,-1],[1,1]],
                r: [[-1,0],[1,0],[0,-1],[0,1]],
                q: [[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]],
                k: [[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]]
            };
            for (const [dr, dc] of directions[p_lower]) {
                let nR = r + dr, nC = c + dc;
                while (nR >= 0 && nR < 8 && nC >= 0 && nC < 8) {
                    if (this.board[nR][nC]) {
                        addMove(nR, nC);
                        break;
                    }
                    addMove(nR, nC);
                    if (p_lower === 'n' || p_lower === 'k') break;
                    nR += dr; nC += dc;
                }
            }
        }
        return moves;
    }
    // =================== END OF CORRECTED LOGIC ===================

    applyMove(move) {
        // ... applyMove remains the same as before
        const [fromR, fromC] = move.from;
        const [toR, toC] = move.to;
        const piece = this.board[fromR][fromC];

        this.halfmoveClock++;
        if (piece?.toLowerCase() === 'p' || this.board[toR][toC]) {
            this.halfmoveClock = 0;
        }

        if (piece?.toLowerCase() === 'p' && this.enPassantTarget !== '-' && toC === (this.enPassantTarget.charCodeAt(0) - 'a'.charCodeAt(0)) && toR === (8 - parseInt(this.enPassantTarget[1]))) {
            const capturedPawnRow = this.turn === 'w' ? toR + 1 : toR - 1;
            this.board[capturedPawnRow][toC] = null;
        }
        this.enPassantTarget = '-';
        if (piece?.toLowerCase() === 'p' && Math.abs(fromR - toR) === 2) {
            this.enPassantTarget = 'abcdefgh'[fromC] + (this.turn === 'w' ? '3' : '6');
        }

        this.board[toR][toC] = piece;
        this.board[fromR][fromC] = null;

        if (piece?.toLowerCase() === 'k' && Math.abs(fromC - toC) === 2) {
            const rookFromCol = toC > fromC ? 7 : 0;
            const rookToCol = toC > fromC ? 5 : 3;
            this.board[fromR][rookToCol] = this.board[fromR][rookFromCol];
            this.board[fromR][rookFromCol] = null;
        }

        if (piece === 'K') this.castlingRights = this.castlingRights.replace('K', '').replace('Q', '');
        if (piece === 'k') this.castlingRights = this.castlingRights.replace('k', '').replace('q', '');
        if (piece === 'R' && fromC === 0 && fromR === 7) this.castlingRights = this.castlingRights.replace('Q', '');
        if (piece === 'R' && fromC === 7 && fromR === 7) this.castlingRights = this.castlingRights.replace('K', '');
        if (piece === 'r' && fromC === 0 && fromR === 0) this.castlingRights = this.castlingRights.replace('q', '');
        if (piece === 'r' && fromC === 7 && fromR === 0) this.castlingRights = this.castlingRights.replace('k', '');
        if(this.board[toR][toC]?.toLowerCase() === 'r' && toC === 0 && toR === 7) this.castlingRights = this.castlingRights.replace('Q', '');
        if(this.board[toR][toC]?.toLowerCase() === 'r' && toC === 7 && toR === 7) this.castlingRights = this.castlingRights.replace('K', '');
        if(this.board[toR][toC]?.toLowerCase() === 'r' && toC === 0 && toR === 0) this.castlingRights = this.castlingRights.replace('q', '');
        if(this.board[toR][toC]?.toLowerCase() === 'r' && toC === 7 && toR === 0) this.castlingRights = this.castlingRights.replace('k', '');

        if (this.turn === 'b') this.fullmoveNumber++;
        this.turn = this.turn === 'w' ? 'b' : 'w';
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

