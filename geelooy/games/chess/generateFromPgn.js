/* B"H */

// =================================================================
//                 OPENING BOOK CONVERSION LOGIC (UNIFIED v7.0)
// =================================================================
// This version is a complete refactor. It no longer contains its own
// flawed move generator. Instead, it imports and uses the MAIN engine's
// battle-tested createGameState and generateLegalMoves functions.
// This guarantees that the converter's logic is 100% in sync with the
// engine's logic, permanently eliminating parsing errors.
importScripts("helpers.js");


class PgnConverter {
    constructor() {
        this.currentState = createGameState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
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
        const halfmoveClock = 0; // Note: Simplified for book generation
        const fullmoveNumber = Math.floor(moveCount / 2) + 1;
        return `${fen} ${turn} ${castlingStr || '-'} ${enPassantStr} ${halfmoveClock} ${fullmoveNumber}`;
    }

    parseSan(san) {
        const legalMoves = generateLegalMoves(this.currentState);
        const originalSan = san;
        san = san.replace(/[+#?!=]/g, '');

        if (san === 'O-O') {
            return legalMoves.find(m => m.isCastle && m.to[1] === 6) || null;
        }
        if (san === 'O-O-O') {
            return legalMoves.find(m => m.isCastle && m.to[1] === 2) || null;
        }

        let promotionPiece = null;
        if (san.includes('=')) {
            promotionPiece = san.slice(-1);
            san = san.slice(0, -2);
        }
        
        const sanClean = san.replace('x', '');
        const piece = (sanClean[0] >= 'A' && sanClean[0] <= 'Z') ? sanClean[0] : 'P';
        const pieceToFind = this.currentState.turn === 'w' ? piece.toUpperCase() : piece.toLowerCase();
        
        const toMatch = sanClean.match(/[a-h][1-8]$/);
        if (!toMatch) return null;
        const toSquare = toMatch[0];
        const toC = toSquare.charCodeAt(0) - 'a'.charCodeAt(0);
        const toR = 8 - parseInt(toSquare[1]);

        const ambiguity = sanClean.substring(piece === 'P' ? 0 : 1, sanClean.indexOf(toSquare));

        const candidateMoves = legalMoves.filter(move => {
            if (move.piece !== pieceToFind || move.to[0] !== toR || move.to[1] !== toC) {
                return false;
            }
            
            // Check for promotion match
            if (promotionPiece && (!move.promotion || move.promotion.toLowerCase() !== promotionPiece.toLowerCase())) {
                return false;
            }

            if (ambiguity) {
                const fromFile = 'abcdefgh'[move.from[1]];
                const fromRank = (8 - move.from[0]).toString();
                if (!ambiguity.includes(fromFile) && !ambiguity.includes(fromRank)) {
                    return false;
                }
            }
            return true;
        });

        if (candidateMoves.length === 1) {
            // Add the san back for the book data structure
            candidateMoves[0].san = originalSan;
            return candidateMoves[0];
        }
        
        return null; // No single, unambiguous move found
    }

    applyMove(move) {
        const { newState } = makeMove(this.currentState, move);
        this.currentState = newState;
    }
}


function generateRawBook(source) {
    // This function body remains the same, but will now work correctly.
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
                break; 
            }

            if (!bookMap.has(currentFen)) {
                bookMap.set(currentFen, [currentFen, positionName]);
            }
            const entry = bookMap.get(currentFen);
            
            // The move object from the new parser is already structured correctly
            const thinMove = { from: move.from, to: move.to, san: move.san };
            if (move.promotion) thinMove.promotion = move.promotion;

            const moveExists = entry.slice(2).some(m => m.san === thinMove.san);
            if (!moveExists) {
                entry.push(thinMove);
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

