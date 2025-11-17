/* B"H */

// =================================================================
//                 OPENING BOOK CONVERSION LOGIC (UNIFIED v9.0 - FINAL)
// =================================================================
// This final version includes a grandmaster-level SAN parser capable of
// resolving all forms of ambiguity (file, rank, and full coordinate).
// This ensures the maximum possible opening lines are parsed correctly.

class PgnConverter {
    constructor() {
        this.currentState = null;
        this.reset();
    }

    reset() {
        this.currentState = createGameState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    }

    toFen() {
        const { board, turn, castlingRights, enPassantTarget, moveCount } = this.currentState;
        let fen = '';
        for (let r = 0; r < 8; r++) {
            let empty = 0;
            for (let c = 0; c < 8; c++) {
                const piece = board[r][c];
                if (piece) {
                    if (empty > 0) { fen += empty; empty = 0; }
                    fen += piece;
                } else { empty++; }
            }
            if (empty > 0) fen += empty;
            if (r < 7) fen += '/';
        }

        let castlingStr = '';
        if (castlingRights & 8) castlingStr += 'K';
        if (castlingRights & 4) castlingStr += 'Q';
        if (castlingRights & 2) castlingStr += 'k';
        if (castlingRights & 1) castlingStr += 'q';

        const enPassantStr = enPassantTarget ? `${'abcdefgh'[enPassantTarget[1]]}${8 - enPassantTarget[0]}` : '-';
        const halfmoveClock = 0; // Simplified for book generation
        const fullmoveNumber = Math.floor(moveCount / 2) + 1;
        return `${fen} ${turn} ${castlingStr || '-'} ${enPassantStr} ${halfmoveClock} ${fullmoveNumber}`;
    }

    parseSan(san) {
        const legalMoves = generateLegalMoves(this.currentState);
        const originalSan = san;
        san = san.replace(/[+#?!=]/g, '');

        if (san === 'O-O') {
            const move = legalMoves.find(m => m.isCastle && m.to[1] === 6);
            if (move) move.san = originalSan;
            return move || null;
        }
        if (san === 'O-O-O') {
            const move = legalMoves.find(m => m.isCastle && m.to[1] === 2);
            if (move) move.san = originalSan;
            return move || null;
        }

        let promotionPiece = null;
        if (san.includes('=')) {
            promotionPiece = san.slice(-1);
            san = san.slice(0, -2);
        }

        const toMatch = san.match(/[a-h][1-8]$/);
        if (!toMatch) return null;
        const toSquareStr = toMatch[0];
        const toC = toSquareStr.charCodeAt(0) - 'a'.charCodeAt(0);
        const toR = 8 - parseInt(toSquareStr[1]);

        const sanNoDest = san.substring(0, san.length - 2).replace('x', '');
        const pieceChar = (sanNoDest.length > 0 && sanNoDest[0] >= 'A' && sanNoDest[0] <= 'Z') ? sanNoDest[0] : 'P';
        const pieceToFind = this.currentState.turn === 'w' ? pieceChar.toUpperCase() : pieceChar.toLowerCase();

        const disambiguationStr = (pieceChar === 'P') ? sanNoDest : sanNoDest.substring(1);

        const candidateMoves = legalMoves.filter(move => {
            if (move.piece !== pieceToFind || move.to[0] !== toR || move.to[1] !== toC) {
                return false;
            }

            if (promotionPiece && (!move.promotion || move.promotion.toLowerCase() !== promotionPiece.toLowerCase())) {
                return false;
            }

            if (disambiguationStr) {
                const fromFile = 'abcdefgh'[move.from[1]];
                const fromRank = (8 - move.from[0]).toString();

                if (disambiguationStr.length === 1) {
                    if (!fromFile.includes(disambiguationStr) && !fromRank.includes(disambiguationStr)) {
                        return false;
                    }
                } else if (disambiguationStr.length === 2) {
                    if (fromFile !== disambiguationStr[0] || fromRank !== disambiguationStr[1]) {
                        return false;
                    }
                }
            }
            return true;
        });

        if (candidateMoves.length === 1) {
            candidateMoves[0].san = originalSan;
            return candidateMoves[0];
        }

        return null;
    }

    applyMove(move) {
        const { newState } = makeMoveImmutable(this.currentState, move);
        this.currentState = newState;
    }
}


function generateRawBook(source, onProgress) {
    const converter = new PgnConverter();
    const bookMap = new Map();
    const startFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

    for (const [index, opening] of source.entries()) {
        converter.reset();

        const moves = opening.pgn.replace(/(\d+\.)/g, '').trim().split(/\s+/).filter(Boolean);

        for (const san of moves) {
            const fenBeforeMove = converter.toFen();
            const move = converter.parseSan(san);

            if (!move) {
                console.error(`Could not parse SAN "${san}" in opening "${opening.name}" from FEN "${fenBeforeMove}". Skipping line.`);
                break;
            }

            if (!bookMap.has(fenBeforeMove)) {
                bookMap.set(fenBeforeMove, [fenBeforeMove, opening.name]);
            }
            const entry = bookMap.get(fenBeforeMove);

            const thinMove = { from: move.from, to: move.to, san: move.san };
            if (move.promotion) thinMove.promotion = move.promotion;

            const moveExists = entry.slice(2).some(m =>
                m.from[0] === thinMove.from[0] && m.from[1] === thinMove.from[1] &&
                m.to[0] === thinMove.to[0] && m.to[1] === thinMove.to[1] &&
                m.promotion === thinMove.promotion
            );

            if (!moveExists) {
                entry.push(thinMove);
            }

            converter.applyMove(move);
        }
        
        
        if (onProgress) {
            onProgress(index + 1);
        }
    }

    return Array.from(bookMap.values());
}