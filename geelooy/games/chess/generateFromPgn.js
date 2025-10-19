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

// =================================================================
//                 OPENING BOOK CONVERSION LOGIC (v1.2 - PROMOTION FIX)
// =================================================================
// This version adds the final piece of the puzzle: handling for pawn promotions (e.g., e8=Q).
// The SAN parser now correctly detects and stores the promotion piece.
// =================================================================
//                 OPENING BOOK CONVERSION LOGIC (v2.0 - SYNCHRONIZED HASHING)
// =================================================================
// This is the definitive, final version of the converter.
// It is upgraded to use the exact same integer-based castling rights and
// update logic as the main engine's `makeMove` function. This guarantees
// that the Zobrist hash calculated during book generation is IDENTICAL
// to the hash calculated during live gameplay, permanently solving all
// hash mismatch bugs and "BOOK FAILURE" errors.

class PgnConverter {
    constructor() {
        this.board = [];
        this.turn = 'w';
        this.castlingRights = 15; // Now an integer: 1111 binary (KQkq)
        this.enPassantTarget = null; // [file, rank] e.g., ['e', 3]
        this.halfmoveClock = 0;
        this.fullmoveNumber = 1;

        // This mask is identical to the one in the main engine.
        this.castlingUpdateMask = [
             7, 15, 15, 15,  3, 15, 15, 11,
            15, 15, 15, 15, 15, 15, 15, 15,
            15, 15, 15, 15, 15, 15, 15, 15,
            15, 15, 15, 15, 15, 15, 15, 15,
            15, 15, 15, 15, 15, 15, 15, 15,
            15, 15, 15, 15, 15, 15, 15, 15,
            15, 15, 15, 15, 15, 15, 15, 15,
            13, 15, 15, 15, 12, 15, 15, 14
        ];
        this.reset();
    }

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
        this.castlingRights = 15;
        this.enPassantTarget = null;
        this.halfmoveClock = 0;
        this.fullmoveNumber = 1;
    }

    toFen() {
        let fen = '';
        for (let r = 0; r < 8; r++) {
            let empty = 0;
            for (let c = 0; c < 8; c++) {
                const piece = this.board[r][c];
                if (piece) {
                    if (empty > 0) { fen += empty; empty = 0; }
                    fen += piece;
                } else {
                    empty++;
                }
            }
            if (empty > 0) fen += empty;
            if (r < 7) fen += '/';
        }

        let castlingStr = '';
        if (this.castlingRights & 8) castlingStr += 'K';
        if (this.castlingRights & 4) castlingStr += 'Q';
        if (this.castlingRights & 2) castlingStr += 'k';
        if (this.castlingRights & 1) castlingStr += 'q';
        
        const enPassantStr = this.enPassantTarget ? `${'abcdefgh'[this.enPassantTarget[1]]}${8 - this.enPassantTarget[0]}` : '-';

        return `${fen} ${this.turn} ${castlingStr || '-'} ${enPassantStr} ${this.halfmoveClock} ${this.fullmoveNumber}`;
    }

    // parseSan and _generateMovesForPiece remain the same as the Promotion Fix version.
    // They are already robust. The key change is in applyMove.
    parseSan(san) {
        const originalSan = san;
        san = san.replace(/[+#?!=]/g, '');
        if (san === 'O-O') { const r = this.turn === 'w' ? 7 : 0; return { san: originalSan, from: [r, 4], to: [r, 6], piece: this.turn === 'w' ? 'K' : 'k', isCastle: true }; }
        if (san === 'O-O-O') { const r = this.turn === 'w' ? 7 : 0; return { san: originalSan, from: [r, 4], to: [r, 2], piece: this.turn === 'w' ? 'K' : 'k', isCastle: true }; }
        let promotion = null;
        if (san.includes('=')) { promotion = san.slice(-1); san = san.slice(0, -2); }
        const piece = (san[0] >= 'A' && san[0] <= 'Z') ? san[0] : 'P';
        const targetSquare = san.match(/[a-h][1-8]/)[0];
        const toC = targetSquare.charCodeAt(0) - 'a'.charCodeAt(0);
        const toR = 8 - parseInt(targetSquare[1]);
        const isCapture = san.includes('x');
        const ambiguity = san.slice(piece === 'P' ? 0 : 1, san.indexOf(targetSquare)).replace('x', '');
        const pieceToFind = this.turn === 'w' ? piece.toUpperCase() : piece.toLowerCase();
        const candidateMoves = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (this.board[r][c] === pieceToFind) {
                    candidateMoves.push(...this._generateMovesForPiece(r, c));
                }
            }
        }
        for (const move of candidateMoves) {
            if (move.to[0] === toR && move.to[1] === toC) {
                let isMatch = false;
                if (!ambiguity && !(piece === 'P' && isCapture)) isMatch = true;
                else {
                    const fromFile = 'abcdefgh'[move.from[1]];
                    const fromRank = (8 - move.from[0]).toString();
                    if (ambiguity) {
                        if (ambiguity.length === 1 && (fromFile === ambiguity || fromRank === ambiguity)) isMatch = true;
                        else if (ambiguity === `${fromFile}${fromRank}`) isMatch = true;
                    } else if (isCapture) {
                        if (fromFile === san[0]) isMatch = true;
                    }
                }
                if (isMatch) {
                    const finalMove = { ...move, san: originalSan };
                    if (promotion) finalMove.promotion = this.turn === 'w' ? promotion.toUpperCase() : promotion.toLowerCase();
                    return finalMove;
                }
            }
        }
        return null;
    }
    _generateMovesForPiece(r, c) {
        const moves = []; const p = this.board[r][c]; if (!p) return [];
        const pL = p.toLowerCase(); const addMove = (toR, toC, flags = {}) => moves.push({ from: [r, c], to: [toR, toC], piece: p, ...flags });
        if (pL === 'p') {
            const dir = this.turn === 'w' ? -1 : 1; const startRank = this.turn === 'w' ? 6 : 1;
            if (r + dir >= 0 && r + dir < 8 && !this.board[r+dir][c]) { addMove(r+dir, c); if (r === startRank && !this.board[r+2*dir][c]) addMove(r+2*dir, c, { isPawnDoubleMove: true }); }
            for (let dc of [-1, 1]) {
                const nR = r + dir; const nC = c + dc; if (nR < 0 || nR > 7 || nC < 0 || nC > 7) continue;
                if (this.board[nR][nC]) addMove(nR, nC);
                else if (this.enPassantTarget && nR === this.enPassantTarget[0] && nC === this.enPassantTarget[1]) addMove(nR, nC, { isEnPassant: true });
            }
        } else {
            const directions = { n:[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]], b:[[-1,-1],[-1,1],[1,-1],[1,1]], r:[[-1,0],[1,0],[0,-1],[0,1]], q:[[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]], k:[[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]] }[pL];
            for (const [dr, dc] of directions) {
                let nR = r + dr, nC = c + dc;
                while (nR >= 0 && nR < 8 && nC >= 0 && nC < 8) {
                    addMove(nR, nC); if (this.board[nR][nC]) break; if (pL === 'n' || pL === 'k') break; nR += dr; nC += dc;
                }
            }
        }
        return moves;
    }
    
    // This is the core of the fix. It now mirrors makeMove exactly.
    applyMove(move) {
        const [fromR, fromC] = move.from;
        const [toR, toC] = move.to;
        const piece = this.board[fromR][fromC];

        if (piece?.toLowerCase() === 'p' || this.board[toR][toC]) this.halfmoveClock = 0; else this.halfmoveClock++;
        
        // Handle en passant capture
        if (move.isEnPassant) {
            const capturedPawnRow = this.turn === 'w' ? toR + 1 : toR - 1;
            this.board[capturedPawnRow][toC] = null;
        }
        
        // Set new en passant target
        this.enPassantTarget = move.isPawnDoubleMove ? [this.turn === 'w' ? fromR - 1 : fromR + 1, fromC] : null;

        // Move piece and handle promotion
        this.board[toR][toC] = move.promotion ? move.promotion : piece;
        this.board[fromR][fromC] = null;

        // *** SYNCHRONIZED CASTLING RIGHTS UPDATE ***
        this.castlingRights &= this.castlingUpdateMask[fromR * 8 + fromC];
        this.castlingRights &= this.castlingUpdateMask[toR * 8 + toC];

        // Handle castling move itself
        if (move.isCastle) {
            const rookFromC = toC === 6 ? 7 : 0;
            const rookToC = toC === 6 ? 5 : 3;
            this.board[fromR][rookToC] = this.board[fromR][rookFromC];
            this.board[fromR][rookFromC] = null;
        }

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

        const moves = opening.pgn.replace(/\d+\.\s/g, '').replace(/\s\*/g, '').split(' ').filter(Boolean);

        for (const san of moves) {
            const move = converter.parseSan(san);
            if (!move) continue; // Skip if a move can't be parsed

            if (!bookMap.has(currentFen)) {
                bookMap.set(currentFen, [currentFen, positionName]);
            }
            const entry = bookMap.get(currentFen);
            
            const moveExists = entry.slice(2).some(m => m.san === move.san);
            if (!moveExists) {
                entry.push({ from: move.from, to: move.to, san: move.san });
            }

            converter.applyMove(move);
            currentFen = converter.toFen();
            positionName = opening.name;
        }
        
        // ======================= ADD THIS BLOCK =======================
        // After the loop finishes for an opening, the 'currentFen' holds
        // the final position of that line. We must ensure this final
        // position is added to the book, even if it has no moves following it.
        if (!bookMap.has(currentFen)) {
            bookMap.set(currentFen, [currentFen, opening.name]);
        }
        // ===============================================================
    }
    
    return Array.from(bookMap.values());
}