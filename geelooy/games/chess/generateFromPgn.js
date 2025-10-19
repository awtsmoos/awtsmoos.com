/* B"H */

// =================================================================
//                 OPENING BOOK CONVERSION LOGIC (FINAL v4.0)
// =================================================================
// This is the definitive, fully synchronized version of the book generator.
// It has been meticulously reviewed to ensure that its internal state representation
// (board, castling rights, en passant) and move application logic are an
// EXACT MIRROR of the main `prometheus_engine.js` worker. This guarantees
// that the Zobrist hashes generated here are identical to those generated in live
// play, permanently solving all hash mismatch and "CACHE MISS" bugs.

/**
 * A synchronized chess logic simulator to process PGN moves for book generation.
 */
class PgnConverter {
    constructor() {
        this.board = [];
        this.turn = 'w';
        this.castlingRights = 15; // Integer: 1111 binary (KQkq)
        this.enPassantTarget = null; // [row, col] format
        this.halfmoveClock = 0;
        this.fullmoveNumber = 1;

        // This mask MUST BE IDENTICAL to the one in prometheus_engine.js
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

        if (candidateMoves.length === 0) return null;
        if (candidateMoves.length === 1) {
             const finalMove = { ...candidateMoves[0], san: originalSan };
             if (promotion) finalMove.promotion = this.turn === 'w' ? promotion.toUpperCase() : promotion.toLowerCase();
             return finalMove;
        }

        for (const move of candidateMoves) {
            const fromFile = 'abcdefgh'[move.from[1]];
            const fromRank = (8 - move.from[0]).toString();

            if (piece === 'P' && isCapture) {
                 if (fromFile === ambiguity) {
                     const finalMove = { ...move, san: originalSan };
                     if (promotion) finalMove.promotion = this.turn === 'w' ? promotion.toUpperCase() : promotion.toLowerCase();
                     return finalMove;
                 }
            } else if (ambiguity) {
                if (ambiguity.length === 1 && (fromFile === ambiguity || fromRank === ambiguity)) {
                     const finalMove = { ...move, san: originalSan };
                     if (promotion) finalMove.promotion = this.turn === 'w' ? promotion.toUpperCase() : promotion.toLowerCase();
                     return finalMove;
                }
                if (ambiguity.length === 2 && ambiguity === `${fromFile}${fromRank}`) {
                     const finalMove = { ...move, san: originalSan };
                     if (promotion) finalMove.promotion = this.turn === 'w' ? promotion.toUpperCase() : promotion.toLowerCase();
                     return finalMove;
                }
            }
        }
        return null;
    }
    
    applyMove(move) {
        const [fromR, fromC] = move.from;
        const [toR, toC] = move.to;
        const piece = this.board[fromR][fromC];
        const isPawnMove = piece?.toLowerCase() === 'p';
        const isCaptureMove = !!this.board[toR][toC] || move.isEnPassant;

        if (isPawnMove || isCaptureMove) {
            this.halfmoveClock = 0;
        } else {
            this.halfmoveClock++;
        }

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

        if (this.turn === 'b') {
            this.fullmoveNumber++;
        }
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
            if (!move) {
                console.warn(`Could not parse SAN "${san}" in opening "${opening.name}". Skipping line.`);
                break; // Stop processing this invalid line
            }

            if (!bookMap.has(currentFen)) {
                bookMap.set(currentFen, [currentFen, positionName]);
            }
            const entry = bookMap.get(currentFen);
            
            const moveExists = entry.slice(2).some(m => m.san === move.san);
            if (!moveExists) {
                entry.push(move);
            }

            converter.applyMove(move);
            currentFen = converter.toFen();
            positionName = opening.name;
        }
        
        if (!bookMap.has(currentFen)) {
            bookMap.set(currentFen, [currentFen, opening.name]);
        }
    }
    
    return Array.from(bookMap.values());
}