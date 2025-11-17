/* B"H */

// =================================================================
//                 BITBOARD PGN CONVERTER (v4.0 - FINAL & CORRECT)
// =================================================================
// This version faithfully translates the original, working parser logic
// to the new bitboard architecture, as requested.

class PgnConverter {
    constructor() { this.currentState = null; this.reset(); }

    reset() {
        this.currentState = createGameState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
        moveStackPtr = 0;
    }
    
    toFen() {
        let fen = '';
        for (let r = 0; r < 8; r++) {
            let empty = 0;
            for (let c = 0; c < 8; c++) {
                const sq = r * 8 + c; let piece = -1;
                for (let p = 0; p < 12; p++) { if ((this.currentState.pieceBitboards[p] & (1n << BigInt(sq))) !== 0n) { piece = p; break; } }
                if (piece !== -1) { if (empty > 0) { fen += empty; empty = 0; } fen += pieceMap[piece]; } else { empty++; }
            }
            if (empty > 0) fen += empty; if (r < 7) fen += '/';
        }
        fen += this.currentState.turn === WHITE ? ' w ' : ' b ';
        let castlingStr = '';
        if (this.currentState.castling & WKCA) castlingStr += 'K'; if (this.currentState.castling & WQCA) castlingStr += 'Q';
        if (this.currentState.castling & BKCA) castlingStr += 'k'; if (this.currentState.castling & BQCA) castlingStr += 'q';
        fen += castlingStr || '-';
        fen += ' ' + (this.currentState.enpassant === -1 ? '-' : `${'abcdefgh'[this.currentState.enpassant % 8]}${8 - Math.floor(this.currentState.enpassant / 8)}`);
        fen += ' 0 1'; return fen;
    }

// REPLACE this function in generateFromPgn.js
parseSan(san) {
    const originalSan = san;
    san = san.replace(/[+#?!]/g, '');
    if (['1-0', '0-1', '1/2-1/2', '*'].includes(san)) return null;

    const legalMoves = generateMoves(this.currentState);

    // 1. Handle Castling explicitly
    if (san === 'O-O') {
        return legalMoves.find(m => getMoveCastling(m) && getMoveTo(m) > getMoveFrom(m)) || null;
    }
    if (san === 'O-O-O') {
        return legalMoves.find(m => getMoveCastling(m) && getMoveTo(m) < getMoveFrom(m)) || null;
    }

    // 2. Determine move properties from the SAN string
    const isCapture = san.includes('x');
    let pieceChar = (san[0] >= 'A' && san[0] <= 'Z') ? san[0] : 'P';
    
    let promotionChar = null;
    if (san.includes('=')) {
        promotionChar = san.slice(san.indexOf('=') + 1);
        san = san.slice(0, san.indexOf('='));
    }

    const toMatch = san.match(/([a-h][1-8])$/);
    if (!toMatch) return null; // Should not happen with valid PGN
    const toSquareStr = toMatch[0];
    const toSq = (8 - parseInt(toSquareStr[1])) * 8 + (toSquareStr.charCodeAt(0) - 'a'.charCodeAt(0));

    // Isolate the disambiguation part of the string (e.g., the 'f' in "Rfe1")
    let fromHint = san.replace('x', '').replace(toSquareStr, '');
    if (pieceChar !== 'P') {
        fromHint = fromHint.substring(1);
    }
    
    // 3. Filter legal moves to find the one that matches
    const candidateMoves = legalMoves.filter(move => {
        const pieceType = getMovePiece(move);
        
        // Match piece type
        if (pieceMap[pieceType].toUpperCase() !== pieceChar) return false;
        
        // Match destination square
        if (getMoveTo(move) !== toSq) return false;

        // Match promotion piece
        if (promotionChar) {
            const promotedType = getMovePromoted(move);
            if (!promotedType || pieceMap[promotedType].toUpperCase() !== promotionChar) return false;
        }

        // Match capture flag (important for pawn moves like "e4" vs "exd5")
        if (isCapture !== (getMoveCapture(move) === 1)) return false;

        // Apply disambiguation rules
        if (fromHint) {
            const fromSq = getMoveFrom(move);
            const fromFile = String.fromCharCode('a'.charCodeAt(0) + (fromSq % 8));
            const fromRank = (8 - Math.floor(fromSq / 8)).toString();
            
            // If the hint is just one character (e.g., 'Rfe1' -> 'f' or 'R1e2' -> '1')
            if (fromHint.length === 1) {
                if (fromHint !== fromFile && fromHint !== fromRank) return false;
            }
            // If the hint is two characters (e.g., 'Ra1e1')
            else if (fromHint.length === 2) {
                if (fromHint !== (fromFile + fromRank)) return false;
            }
        }
        
        return true;
    });

    // 4. Return the unique match or null
    if (candidateMoves.length === 1) {
        return candidateMoves[0];
    }
    
    // If there's still ambiguity or no match, the PGN is invalid or the move generator is wrong.
    // Given our prior debugging, it points to an invalid PGN string.
    return null;
}

    applyMove(move) { makeMove(this.currentState, move); }
}

function generateRawBook(source, onProgress) {
    const converter = new PgnConverter();
    const bookMap = new Map();

    for (const [index, opening] of source.entries()) {
        converter.reset();
        const moves = opening.pgn.replace(/(\d+\.)/g, '').trim().split(/\s+/).filter(Boolean);
        let isValidLine = true;
        
        // This temporary map stores the data for this line only if it's valid
        const tempLineData = new Map();

        for (const san of moves) {
            const fenBeforeMove = converter.toFen();
            const hash = "placeholder"; // Hash is not critical for parsing/validation
            const move = converter.parseSan(san);

            if (move == null) {
                // If any move is invalid, mark the entire PGN line as bad and stop processing it.
                if (!['1-0', '0-1', '1/2-1/2', '*'].includes(san)) {
                    console.error(`Validation Error: Could not parse SAN "${san}" in opening "${opening.name}" from FEN "${fenBeforeMove}". This opening line will be skipped.`);
                }
                isValidLine = false;
                break; // Stop processing this invalid line
            }

            const hashString = fenBeforeMove; // Use FEN as a temporary key
            if (!tempLineData.has(hashString)) {
                tempLineData.set(hashString, [fenBeforeMove, opening.name]);
            }
            
            const entry = tempLineData.get(hashString);
            const fromSq = getMoveFrom(move), toSq = getMoveTo(move), promotedPiece = getMovePromoted(move);
            const thinMove = {
                from: [Math.floor(fromSq/8), fromSq%8], to: [Math.floor(toSq/8), toSq%8],
                promotion: promotedPiece ? pieceMap[promotedPiece].toLowerCase() : undefined
            };

            // This check prevents duplicate moves if different lines converge on the same position
            if (!entry.slice(2).some(m => 
                m.from[0] === thinMove.from[0] && m.from[1] === thinMove.from[1] &&
                m.to[0] === thinMove.to[0] && m.to[1] === thinMove.to[1] &&
                m.promotion === thinMove.promotion)) {
                entry.push(thinMove);
            }
            converter.applyMove(move);
        }

        
        // Only if the entire line was processed successfully, merge its data into the main bookMap.
        if (isValidLine) {
            for (const [key, value] of tempLineData.entries()) {
                if (!bookMap.has(key)) {
                    bookMap.set(key, value);
                } else {
                    // If the position already exists, merge moves to prevent duplicates
                    const existingEntry = bookMap.get(key);
                    for(let i = 2; i < value.length; i++) {
                        const newMove = value[i];
                         if (!existingEntry.slice(2).some(m => 
                            m.from[0] === newMove.from[0] && m.from[1] === newMove.from[1] &&
                            m.to[0] === newMove.to[0] && m.to[1] === newMove.to[1] &&
                            m.promotion === newMove.promotion)) {
                            existingEntry.push(newMove);
                        }
                    }
                }
            }
        }
        
        if (onProgress) onProgress(index + 1);
    }
    return Array.from(bookMap.values());
}