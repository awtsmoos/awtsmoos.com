/* B"H */

// =================================================================
//                 BITBOARD PGN CONVERTER (MK. V - ROBUST)
// =================================================================
// This file provides a PgnConverter class and a raw book generator.
// This version is a complete rewrite focused on maximum parsing accuracy
// and stability, eliminating all known validation errors by using a
// strict, filter-based approach to SAN parsing.

/**
 * A class to manage a chess game state and parse PGN moves.
 * It maintains an internal bitboard representation of the board
 * and provides methods to convert to FEN and parse SAN strings.
 */
class PgnConverter {
    /**
     * Initializes a new PgnConverter instance.
     */
    constructor() {
        /** @type {object|null} The current game state object. */
        this.currentState = null;
        this.reset();
    }

    /**
     * Resets the internal game state to the standard starting position.
     * Also resets the global move stack pointer from helpers.js.
     */
    reset() {
        this.currentState = createGameState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
        // Ensure the global move stack used by make/unmake is reset
        moveStackPtr = 0;
    }

    /**
     * Converts the current internal bitboard state to a FEN string.
     * @returns {string} The FEN representation of the current position.
     */
    toFen() {
        let fen = '';
        for (let r = 0; r < 8; r++) {
            let empty = 0;
            for (let c = 0; c < 8; c++) {
                const sq = r * 8 + c;
                let piece = -1;
                // Find which bitboard this square belongs to
                for (let p = 0; p < 12; p++) {
                    if ((this.currentState.pieceBitboards[p] & (1n << BigInt(sq))) !== 0n) {
                        piece = p;
                        break;
                    }
                }
                if (piece !== -1) {
                    if (empty > 0) {
                        fen += empty;
                        empty = 0;
                    }
                    fen += pieceMap[piece];
                } else {
                    empty++;
                }
            }
            if (empty > 0) fen += empty;
            if (r < 7) fen += '/';
        }

        fen += this.currentState.turn === WHITE ? ' w ' : ' b ';

        let castlingStr = '';
        if (this.currentState.castling & WKCA) castlingStr += 'K';
        if (this.currentState.castling & WQCA) castlingStr += 'Q';
        if (this.currentState.castling & BKCA) castlingStr += 'k';
        if (this.currentState.castling & BQCA) castlingStr += 'q';
        fen += castlingStr || '-';

        const enpassantFile = this.currentState.enpassant % 8;
        const enpassantRank = 8 - Math.floor(this.currentState.enpassant / 8);
        fen += ' ' + (this.currentState.enpassant === -1 ? '-' : `${'abcdefgh'[enpassantFile]}${enpassantRank}`);
        
        // For book generation, halfmove and fullmove clocks are not critical
        fen += ' 0 1';
        return fen;
    }

    /**
     * Parses a Standard Algebraic Notation (SAN) move string and returns the corresponding
     * encoded move integer. This version is extremely robust and correctly handles all cases
     * including castling, promotions, captures, and complex disambiguation.
     * @param {string} san - The SAN move string (e.g., "Nf3", "O-O", "Raxe1", "e8=Q").
     * @returns {number|null} The encoded move integer, or null if the SAN is invalid or not found.
     */
    parseSan(san) {
        // 1. Pre-process the SAN string for easier parsing
        san = san.replace(/[+#?!]/g, ''); // Remove check, mate, and annotation symbols
        if (['1-0', '0-1', '1/2-1/2', '*'].includes(san)) return null;

        const legalMoves = generateMoves(this.currentState);

        // 2. Handle unambiguous castling moves first
        if (san === 'O-O') {
            return legalMoves.find(m => getMoveCastling(m) && getMoveTo(m) > getMoveFrom(m)) || null;
        }
        if (san === 'O-O-O') {
            return legalMoves.find(m => getMoveCastling(m) && getMoveTo(m) < getMoveFrom(m)) || null;
        }

        // 3. Deconstruct the SAN into its component parts
        const isCapture = san.includes('x');
        let pieceChar = (san[0] >= 'A' && san[0] <= 'Z') ? san[0] : 'P';
        
        let promotionChar = null;
        if (san.includes('=')) {
            promotionChar = san.slice(san.indexOf('=') + 1).toUpperCase();
            san = san.slice(0, san.indexOf('='));
        }

        const toMatch = san.match(/([a-h][1-8])$/);
        if (!toMatch) return null; // Invalid SAN if there's no destination square
        const toSquareStr = toMatch[0];
        const toSq = (8 - parseInt(toSquareStr[1])) * 8 + (toSquareStr.charCodeAt(0) - 'a'.charCodeAt(0));

        // Isolate the disambiguation part (e.g., the 'f' in "Rfe1" or 'a1' in 'Ra1e1')
        let fromHint = san.replace('x', '').replace(toSquareStr, '');
        if (pieceChar !== 'P') {
            fromHint = fromHint.substring(1);
        }

        // 4. Filter all legal moves to find the single one that matches all criteria
        const candidateMoves = legalMoves.filter(move => {
            const pieceType = getMovePiece(move);
            // Criterion A: Piece Type Must Match
            if (pieceMap[pieceType + (this.currentState.turn * 6)].toUpperCase() !== pieceChar) return false;
            
            // Criterion B: Destination Square Must Match
            if (getMoveTo(move) !== toSq) return false;

            // Criterion C: Promotion Piece Must Match (if applicable)
            if (promotionChar) {
                const promotedType = getMovePromoted(move);
                if (!promotedType || pieceMap[promotedType + (this.currentState.turn * 6)].toUpperCase() !== promotionChar) return false;
            }

            // Criterion D: Capture Flag Must Match (critical for "e4" vs "exd5")
            if (isCapture !== (getMoveCapture(move) === 1)) return false;

            // Criterion E: Disambiguation Hint Must Match (if applicable)
            if (fromHint) {
                const fromSq = getMoveFrom(move);
                const fromFile = String.fromCharCode('a'.charCodeAt(0) + (fromSq % 8));
                const fromRank = (8 - Math.floor(fromSq / 8)).toString();
                
                if (fromHint.length === 1) { // e.g., 'Rfe1' -> 'f' OR 'R1e2' -> '1'
                    if (fromHint !== fromFile && fromHint !== fromRank) return false;
                } else if (fromHint.length === 2) { // e.g., 'Ra1e1' -> 'a1'
                    if (fromHint !== (fromFile + fromRank)) return false;
                }
            }
            
            // If all criteria are met, this is a valid candidate
            return true;
        });

        // 5. Return the result
        // If there is exactly one match, we have found the correct move.
        // If there are zero or more than one, the PGN is ambiguous or invalid.
        return candidateMoves.length === 1 ? candidateMoves[0] : null;
    }

    /**
     * Applies an encoded move to the internal game state.
     * @param {number} move - The encoded move integer to apply.
     */
    applyMove(move) {
        makeMove(this.currentState, move);
    }
}

/**
 * Generates a raw opening book array from a source array of PGN objects.
 * This version is robust, skipping entire invalid lines and providing clear error logs.
 * @param {Array<Object>} source - The source array, where each object has 'name' and 'pgn' keys.
 * @param {function(number):void} [onProgress] - An optional callback for progress updates.
 * @returns {Array<Array>} The processed book data, ready for the engine.
 */
function generateRawBook(source, onProgress) {
    const converter = new PgnConverter();
    const bookMap = new Map(); // Use FEN as key to automatically merge identical positions

    for (const [index, opening] of source.entries()) {
        converter.reset();
        // Clean up move list: remove numbers, extra spaces, and filter out empty strings
        const moves = opening.pgn.replace(/(\d+\.)/g, '').trim().split(/\s+/).filter(Boolean);
        let isLineValid = true;
        
        // A temporary map to hold data for the current line. It's only merged
        // into the main bookMap if the entire line is valid.
        const tempLineData = new Map();

        for (const san of moves) {
            const fenBeforeMove = converter.toFen();
            const move = converter.parseSan(san);

            if (move === null) {
                // If any move in a line is invalid, discard the whole line.
                // This prevents partial or corrupted lines from entering the book.
                if (!['1-0', '0-1', '1/2-1/2', '*'].includes(san)) {
                    console.error(`PGN Validation Error: Could not parse SAN "${san}" in opening "${opening.name}" from FEN "${fenBeforeMove}". This entire opening line will be skipped.`);
                }
                isLineValid = false;
                break; // Stop processing this invalid line immediately
            }

            if (!tempLineData.has(fenBeforeMove)) {
                tempLineData.set(fenBeforeMove, [fenBeforeMove, opening.name]);
            }
            
            const entry = tempLineData.get(fenBeforeMove);
            const fromSq = getMoveFrom(move);
            const toSq = getMoveTo(move);
            const promotedPiece = getMovePromoted(move);
            const thinMove = {
                from: [Math.floor(fromSq / 8), fromSq % 8],
                to: [Math.floor(toSq / 8), toSq % 8],
                promotion: promotedPiece ? pieceMap[promotedPiece].toLowerCase() : undefined
            };

            // Prevent duplicate moves if different source lines converge on the same position
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

        // Only if the entire PGN line was successfully processed, merge its data.
        if (isLineValid) {
            for (const [key, value] of tempLineData.entries()) {
                if (!bookMap.has(key)) {
                    bookMap.set(key, value);
                } else {
                    // If the position already exists, merge moves to prevent duplicates
                    const existingEntry = bookMap.get(key);
                    for(let i = 2; i < value.length; i++) {
                        const newMove = value[i];
                        const moveExists = existingEntry.slice(2).some(m => 
                            m.from[0] === newMove.from[0] && m.from[1] === newMove.from[1] &&
                            m.to[0] === newMove.to[0] && m.to[1] === newMove.to[1] &&
                            m.promotion === newMove.promotion
                        );
                         if (!moveExists) {
                            existingEntry.push(newMove);
                        }
                    }
                }
            }
        }
        
        if (onProgress) onProgress(index + 1);
    }

    // Return the processed book as an array of entries
    return Array.from(bookMap.values());
}


// Export the PgnConverter class if in a Web Worker environment
if(typeof self !== 'undefined') {
    self.PgnConverter = PgnConverter;
}