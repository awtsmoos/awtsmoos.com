/* B"H */

// =================================================================
//                 OPENING BOOK CONVERSION LOGIC (UNIFIED v8.0 - ROBUST)
// =================================================================
// This version uses the main engine's functions and has a corrected
// parsing and state management loop to prevent desynchronization. It is
// designed to be 100% in sync with the main engine's logic.
importScripts("helpers.js");


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

        // 1. Handle Castling
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

        // 2. Identify target square and potential promotion
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

        // 3. Handle disambiguation string (e.g., the 'b' in 'Nbd2')
        const ambiguity = sanClean.substring(piece === 'P' ? 0 : 1, sanClean.indexOf(toSquare));

        const candidateMoves = legalMoves.filter(move => {
            // Must match piece type, target square, and promotion piece
            if (move.piece !== pieceToFind || move.to[0] !== toR || move.to[1] !== toC) {
                return false;
            }
            
            if (promotionPiece && (!move.promotion || move.promotion.toLowerCase() !== promotionPiece.toLowerCase())) {
                return false;
            }

            // Filter by ambiguity if present
            if (ambiguity) {
                const fromFile = 'abcdefgh'[move.from[1]];
                const fromRank = (8 - move.from[0]).toString();
                if (ambiguity.length === 1) { // e.g. "Nbd2" or "N1d2"
                     if (ambiguity !== fromFile && ambiguity !== fromRank) return false;
                } else if (ambiguity.length === 2) { // e.g. "Nb1d2"
                     if (ambiguity !== (fromFile + fromRank)) return false;
                }
            }
            return true;
        });

        // 4. Return the single, unambiguous move
        if (candidateMoves.length === 1) {
            candidateMoves[0].san = originalSan; // Attach original notation for the book
            return candidateMoves[0];
        } else if (candidateMoves.length > 1) {
             // This log helps debug tricky PGNs if they are ever added
             console.warn(`SAN parse remained ambiguous: "${originalSan}" for FEN ${this.toFen()}`);
        }
        
        return null; // Return null if no single legal move matches
    }

    applyMove(move) {
        const { newState } = makeMove(this.currentState, move);
        this.currentState = newState;
    }
}


function generateRawBook(source) {
    const converter = new PgnConverter();
    const bookMap = new Map();
    const startFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

    for (const opening of source) {
        converter.reset(); // CRITICAL: Reset state for each new opening line

        // Correctly split PGN into individual moves
        const moves = opening.pgn.replace(/(\d+\.)/g, '').trim().split(/\s+/).filter(Boolean);

        for (const san of moves) {
            const fenBeforeMove = converter.toFen();
            const move = converter.parseSan(san);
            
            if (!move) {
                console.error(`Could not parse SAN "${san}" in opening "${opening.name}" from FEN "${fenBeforeMove}". Skipping line.`);
                break; // Stop processing this invalid PGN line
            }

            if (!bookMap.has(fenBeforeMove)) {
                bookMap.set(fenBeforeMove, [fenBeforeMove, opening.name]);
            }
            const entry = bookMap.get(fenBeforeMove);
            
            const thinMove = { from: move.from, to: move.to, san: move.san };
            if (move.promotion) thinMove.promotion = move.promotion;

            // Check if this exact move is already in the book for this position to avoid duplicates
            const moveExists = entry.slice(2).some(m => 
                m.from[0] === thinMove.from[0] && m.from[1] === thinMove.from[1] &&
                m.to[0] === thinMove.to[0] && m.to[1] === thinMove.to[1] &&
                m.promotion === thinMove.promotion
            );

            if (!moveExists) {
                entry.push(thinMove);
            }

            // Apply the move to update the converter's internal state for the next move
            converter.applyMove(move);
        }
    }
    
    return Array.from(bookMap.values());
}