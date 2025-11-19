/* B"H */

// =================================================================
//                 BITBOARD PGN CONVERTER (MK. VII - SANITY RESTORED)
// =================================================================
// The Scribe no longer maintains its own fragile reality. It is now a pure
// vessel for interpretation. The Grand Librarian function (`generateRawBook`)
// is now responsible for creating a fresh, sanctified universe (a `gameState` object)
// for each scripture, ensuring no corruption can bleed from one timeline to the next.
// =================================================================


const STARTING_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

/**
 * @class PgnConverter
 * @description A stateless Scribe. It no longer holds a persistent reality,
 * preventing corruption. It operates only on the state it is given for each task.
 */
class PgnConverter {
    constructor() {
        // The constructor is now empty. The Scribe is born without a world.
        this.currentState = null;
    }

    /**
     * B"H
     * Injects a pure, validated reality into the Scribe for a single interpretation task.
     * @param {object} state The sanctified gameState object from the main engine context.
     */
    setState(state) {
        this.currentState = state;
    }
    
    parseSan(san) {
        // The self-check is still important, ensuring the state it was given is pure.
        validateGnosticSeal(this.currentState, `PgnConverter.parseSan (for '${san}')`);

        const legalMoves = generateMoves(this.currentState);
        
        for (const move of legalMoves) {
            if (this.isMoveSan(move, san, legalMoves)) {
                return move;
            }
        }
        
        // This is a warning, not a fatal error, so book generation can continue with other lines.
        console.warn(`Scribe could not understand the word "${san}". No legal move matched. The scripture may be corrupt.`);
        return null;
    }

    isMoveSan(move, san, legalMoves) {
        const from = getMoveFrom(move);
        const to = getMoveTo(move);
        const piece = getMovePiece(move);

        if (getMoveCastling(move)) {
            if (to > from) return san === 'O-O'; // Kingside
            return san === 'O-O-O'; // Queenside
        }
        
        const files = 'abcdefgh';
        const pieceLetter = 'PNBRQK'[piece];
        const destSquare = files[to % 8] + (8 - Math.floor(to / 8));
        
        let moveSan;

        if (pieceLetter === 'P') {
            moveSan = getMoveCapture(move) ? files[from % 8] + 'x' + destSquare : destSquare;
            if (getMovePromoted(move)) {
                moveSan += '=' + 'PNBRQK'[getMovePromoted(move)];
            }
        } else {
            moveSan = pieceLetter;
            const ambiguousMoves = legalMoves.filter(m => getMovePiece(m) === piece && getMoveTo(m) === to && m !== move);
            if (ambiguousMoves.length > 0) {
                const fromFile = from % 8;
                const fromRank = Math.floor(from / 8);
                const fileIsUnique = !ambiguousMoves.some(m => (getMoveFrom(m) % 8) === fromFile);
                const rankIsUnique = !ambiguousMoves.some(m => Math.floor(getMoveFrom(m) / 8) === fromRank);
                if (fileIsUnique) {
                    moveSan += files[fromFile];
                } else if (rankIsUnique) {
                    moveSan += (8 - fromRank);
                } else {
                    moveSan += files[fromFile] + (8 - fromRank);
                }
            }
            if (getMoveCapture(move)) moveSan += 'x';
            moveSan += destSquare;
        }

        return san.replace(/[+#?!]/g, '') === moveSan;
    }

    applyMove(move) {
        // It alters the state it was given, which is temporary to this PGN line.
        makeMove(this.currentState, move);
        validateGnosticSeal(this.currentState, 'PgnConverter.applyMove');
    }

    toFen() {
        const state = this.currentState;
        const boardPart = [...Array(8)].map((_, r) => {
            let empty = 0, rowStr = '';
            for (let c = 0; c < 8; c++) {
                const sq = r * 8 + c;
                const pieceChar = pieceMap.split('').find((p, i) => (state.pieceBitboards[i] >> BigInt(sq)) & 1n);
                if (pieceChar) {
                    if (empty > 0) { rowStr += empty; empty = 0; }
                    rowStr += pieceChar;
                } else {
                    empty++;
                }
            }
            if (empty > 0) rowStr += empty;
            return rowStr;
        }).join('/');
        
        const castlingStr = ((state.castling & WKCA) ? 'K' : '') + ((state.castling & WQCA) ? 'Q' : '') + ((state.castling & BKCA) ? 'k' : '') + ((state.castling & BQCA) ? 'q' : '') || '-';
        const enpassantStr = state.enpassant === -1 ? '-' : 'abcdefgh'[state.enpassant % 8] + (8 - Math.floor(state.enpassant / 8));
        return `${boardPart} ${state.turn === WHITE ? 'w' : 'b'} ${castlingStr} ${enpassantStr} 0 1`;
    }
}


/**
 * B"H
 * The Grand Librarian function. It now creates a fresh universe for each scripture,
 * ensuring absolute purity in the book generation process.
 * @param {object[]} source An array of opening objects.
 * @returns {Array<Array<any>>} The compiled wisdom for the engine.
 */
function generateRawBook(source) {
    const converter = new PgnConverter(); // Create one stateless Scribe.
    const bookMap = new Map();

    for (const opening of source) {
        // Create a new, pure reality for this specific opening line.
        const lineState = createGameState(STARTING_FEN);
        converter.setState(lineState); // Inject the pure reality into the Scribe.

        const moves = opening.pgn.replace(/(\d+\.)/g, '').trim().split(/\s+/).filter(Boolean);
        let isLineValid = true;
        
        for (const san of moves) {
            if (['1-0', '0-1', '1/2-1/2', '*'].includes(san)) continue;

            const fen = converter.toFen(); // Get FEN for the current position.
            const move = converter.parseSan(san);

            if (move === null) {
                isLineValid = false;
                break; 
            }
            
            // If we've never seen this FEN before, create its entry.
            if (!bookMap.has(fen)) {
                bookMap.set(fen, [fen, opening.name]);
            }
            
            const entry = bookMap.get(fen);
            const from = getMoveFrom(move), to = getMoveTo(move), prom = getMovePromoted(move);
            const thinMove = {
                from: [Math.floor(from / 8), from % 8], 
                to: [Math.floor(to / 8), to % 8],
                promotion: prom ? pieceMap[prom].toLowerCase() : undefined
            };

            // Add the move to the book entry if it's not already there.
            if (!entry.slice(2).some(m => JSON.stringify(m) === JSON.stringify(thinMove))) {
                entry.push(thinMove);
            }
            
            // Apply the move to the temporary state to process the next move in the line.
            converter.applyMove(move);
        }
    }
    return Array.from(bookMap.values());
}

if(typeof self !== 'undefined') self.PgnConverter = PgnConverter;