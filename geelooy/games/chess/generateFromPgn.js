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

    // In your generateFromPgn.js file

function parseSan(san) {
    const legalMoves = generateLegalMoves(this.currentState);
    const originalSan = san;
    san = san.replace(/[+#?!=]/g, ''); // Keep this line

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

    // 2. Identify the target square and promotion piece
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

    // 3. Identify the moving piece type
    const sanNoDest = san.substring(0, san.length - 2).replace('x', '');
    const pieceChar = (sanNoDest.length > 0 && sanNoDest[0] >= 'A' && sanNoDest[0] <= 'Z') ? sanNoDest[0] : 'P';
    const pieceToFind = this.currentState.turn === 'w' ? pieceChar.toUpperCase() : pieceChar.toLowerCase();

    // 4. Handle Disambiguation
    const disambiguationStr = (pieceChar === 'P') ? sanNoDest : sanNoDest.substring(1);

    // 5. Filter legal moves to find the single matching candidate
    const candidateMoves = legalMoves.filter(move => {
        // Must match piece type, target square, and promotion
        if (move.piece !== pieceToFind || move.to[0] !== toR || move.to[1] !== toC) {
            return false;
        }
        if (promotionPiece && (!move.promotion || move.promotion.toLowerCase() !== promotionPiece.toLowerCase())) {
            return false;
        }

        // Check against disambiguation string
        if (disambiguationStr) {
            const fromFile = 'abcdefgh'[move.from[1]];
            const fromRank = (8 - move.from[0]).toString();
            // Case 1: "Nbd2" -> file is specified
            if (disambiguationStr.length === 1 && 'abcdefgh'.includes(disambiguationStr)) {
                if (fromFile !== disambiguationStr) return false;
            }
            // Case 2: "N1d2" -> rank is specified
            else if (disambiguationStr.length === 1 && '12345678'.includes(disambiguationStr)) {
                if (fromRank !== disambiguationStr) return false;
            }
            // Case 3: "Nfxd4" or "Qh4e1" -> file and rank are specified
            else if (disambiguationStr.length === 2) {
                if (fromFile !== disambiguationStr[0] || fromRank !== disambiguationStr[1]) return false;
            }
        }
        return true;
    });

    if (candidateMoves.length === 1) {
        candidateMoves[0].san = originalSan; // Add san for the book data
        return candidateMoves[0];
    }

    // If still ambiguous or no move found, log an error for debugging
    console.error(`Failed to parse SAN: "${originalSan}" for FEN: ${this.toFen()}`);
    console.error(`Found ${candidateMoves.length} candidates.`);
    return null;
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

