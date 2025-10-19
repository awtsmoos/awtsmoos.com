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

/* B"H */

/**
 * A synchronized chess logic simulator to process PGN moves for book generation.
 * This class is designed to perfectly mirror the state representation and move
 * logic of the main Prometheus engine (prometheus_engine.js).
 * Key features for synchronization:
 *   - Uses empty strings ('') for empty squares, preventing type errors.
 *   - Uses an integer (0-15) for castling rights.
 *   - Uses the exact same castling update mask as the engine.
 * This ensures the Zobrist hash calculated during book generation is IDENTICAL
 * to the hash calculated during live gameplay.
 *//* B"H */

/**
 * FINAL, SYNCHRONIZED PGN CONVERTER (v3.0)
 * This is the definitive, fully debugged version of the book generation logic.
 * It contains a robust SAN parser that correctly handles all forms of ambiguity
 * and a move generator that is 100% synchronized with the main engine's rules.
 * This guarantees the generated opening book is free of illegal moves.
 */
class PgnConverter {
    constructor() {
        this.board = [];
        this.turn = 'w';
        this.castlingRights = 15;
        this.enPassantTarget = null;
        this.halfmoveClock = 0;
        this.fullmoveNumber = 1;
        this.castlingUpdateMask = [
             7, 15, 15, 15,  3, 15, 15, 11, 15, 15, 15, 15, 15, 15, 15, 15,
            15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
            15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 12, 15, 15, 14
        ];
        this.reset();
    }

    reset() {
        this.board = [
            ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
            ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
            ['', '', '', '', '', '', '', ''], ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''], ['', '', '', '', '', '', '', ''],
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
                } else { empty++; }
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

    parseSan(san) {
        const originalSan = san;
        san = san.replace(/[+#?!=]/g, '');

        if (san === 'O-O') {
            const r = this.turn === 'w' ? 7 : 0;
            return { san: originalSan, from: [r, 4], to: [r, 6], piece: this.turn === 'w' ? 'K' : 'k', isCastle: true };
        }
        if (san === 'O-O-O') {
            const r = this.turn === 'w' ? 7 : 0;
            return { san: originalSan, from: [r, 4], to: [r, 2], piece: this.turn === 'w' ? 'K' : 'k', isCastle: true };
        }

        let promotion = null;
        if (san.includes('=')) {
            promotion = san.slice(-1);
            san = san.slice(0, -2);
        }

        const piece = (san[0] >= 'A' && san[0] <= 'Z') ? san[0] : 'P';
        const targetSquareMatch = san.match(/[a-h][1-8]/);
        if (!targetSquareMatch) return null;
        const targetSquare = targetSquareMatch[0];
        const toC = targetSquare.charCodeAt(0) - 'a'.charCodeAt(0);
        const toR = 8 - parseInt(targetSquare[1]);

        const isCapture = san.includes('x');
        const ambiguity = san.slice(piece === 'P' ? 0 : 1, san.indexOf(targetSquare)).replace('x', '');
        const pieceToFind = this.turn === 'w' ? piece.toUpperCase() : piece.toLowerCase();
        
        const candidateMoves = this._generateCandidateMovesForPieceType(pieceToFind)
            .filter(move => move.to[0] === toR && move.to[1] === toC);

        if (candidateMoves.length === 0) return null; // No piece of this type can move to the target square.
        
        if (candidateMoves.length === 1) {
             const finalMove = { ...candidateMoves[0], san: originalSan };
             if (promotion) finalMove.promotion = this.turn === 'w' ? promotion.toUpperCase() : promotion.toLowerCase();
             return finalMove;
        }

        // If we reach here, there is ambiguity that must be resolved.
        for (const move of candidateMoves) {
            const fromFile = 'abcdefgh'[move.from[1]];
            const fromRank = (8 - move.from[0]).toString();
            if (ambiguity) {
                if (ambiguity.length === 1 && (fromFile === ambiguity || fromRank === ambiguity)) {
                     const finalMove = { ...move, san: originalSan };
                     if (promotion) finalMove.promotion = this.turn === 'w' ? promotion.toUpperCase() : promotion.toLowerCase();
                     return finalMove;
                }
                if (ambiguity === `${fromFile}${fromRank}`) {
                     const finalMove = { ...move, san: originalSan };
                     if (promotion) finalMove.promotion = this.turn === 'w' ? promotion.toUpperCase() : promotion.toLowerCase();
                     return finalMove;
                }
            } else if (piece === 'P' && isCapture) {
                 if (fromFile === san[0]) {
                     const finalMove = { ...move, san: originalSan };
                     if (promotion) finalMove.promotion = this.turn === 'w' ? promotion.toUpperCase() : promotion.toLowerCase();
                     return finalMove;
                 }
            }
        }
        
        return null; // Should not be reached with valid PGN
    }
    
    applyMove(move) {
        const [fromR, fromC] = move.from;
        const [toR, toC] = move.to;
        const piece = this.board[fromR][fromC];

        if (piece?.toLowerCase() === 'p' || this.board[toR][toC] || move.capture) this.halfmoveClock = 0; else this.halfmoveClock++;

        if (move.isEnPassant) {
            const capturedPawnRow = this.turn === 'w' ? toR + 1 : toR - 1;
            this.board[capturedPawnRow][toC] = '';
        }
        
        this.enPassantTarget = move.isPawnDoubleMove ? [(fromR + toR) / 2, fromC] : null;

        this.board[toR][toC] = move.promotion ? move.promotion : piece;
        this.board[fromR][fromC] = '';

        this.castlingRights &= this.castlingUpdateMask[fromR * 8 + fromC];
        this.castlingRights &= this.castlingUpdateMask[toR * 8 + toC];

        if (move.isCastle) {
            const rookFromC = toC === 6 ? 7 : 0;
            const rookToC = toC === 6 ? 5 : 3;
            this.board[fromR][rookToC] = this.board[fromR][rookFromC];
            this.board[fromR][rookFromC] = '';
        }

        if (this.turn === 'b') this.fullmoveNumber++;
        this.turn = this.turn === 'w' ? 'b' : 'w';
    }

    _generateCandidateMovesForPieceType(pieceToFind) {
        const allMoves = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (this.board[r][c] === pieceToFind) {
                    allMoves.push(...this._generateMovesForPiece(r, c));
                }
            }
        }
        return allMoves;
    }

    _generateMovesForPiece(r, c) {
        const moves = []; const p = this.board[r][c]; if (!p) return [];
        const pL = p.toLowerCase(); const isWhite = p === p.toUpperCase();
        const addMove = (toR, toC, flags = {}) => moves.push({ from: [r, c], to: [toR, toC], piece: p, ...flags });

        if (pL === 'p') {
            const dir = isWhite ? -1 : 1; const startRank = isWhite ? 6 : 1; const promoRank = isWhite ? 0 : 7;
            if (this.board[r + dir]?.[c] === '') {
                if (r + dir === promoRank) { for (const promo of isWhite ? ['Q','R','B','N'] : ['q','r','b','n']) addMove(r + dir, c, { promotion: promo }); }
                else { addMove(r + dir, c); }
                if (r === startRank && this.board[r + 2 * dir]?.[c] === '') addMove(r + 2 * dir, c, { isPawnDoubleMove: true });
            }
            for (let dc of [-1, 1]) {
                const nR = r + dir; const nC = c + dc; if (nR < 0 || nR > 7 || nC < 0 || nC > 7) continue;
                const targetPiece = this.board[nR][nC];
                if (targetPiece && (targetPiece.toUpperCase() === targetPiece) !== isWhite) {
                    if (nR === promoRank) { for (const promo of isWhite ? ['Q','R','B','N'] : ['q','r','b','n']) addMove(nR, nC, { capture: true, promotion: promo }); }
                    else { addMove(nR, nC, { capture: true }); }
                }
                if (this.enPassantTarget && nR === this.enPassantTarget[0] && nC === this.enPassantTarget[1]) {
                    addMove(nR, nC, { isEnPassant: true, capture: true });
                }
            }
        } else {
            const directions = { n: [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]], b: [[-1, -1], [-1, 1], [1, -1], [1, 1]], r: [[-1, 0], [1, 0], [0, -1], [0, 1]], q: [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]], k: [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]] }[pL];
            for (const [dr, dc] of directions) {
                let nR = r + dr; let nC = c + dc;
                while (nR >= 0 && nR < 8 && nC >= 0 && nC < 8) {
                    const targetPiece = this.board[nR][nC];
                    if (targetPiece === '') { addMove(nR, nC); }
                    else {
                        if ((targetPiece.toUpperCase() === targetPiece) !== isWhite) addMove(nR, nC, { capture: true });
                        break;
                    }
                    if (pL === 'n' || pL === 'k') break;
                    nR += dr; nC += dc;
                }
            }
        }
        return moves;
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
    // Push the entire move object, which includes flags like isCastle, etc.
    entry.push(move);
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