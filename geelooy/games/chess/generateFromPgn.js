/* B"H */

// =================================================================
//                 BITBOARD PGN CONVERTER (MK. VI - LEGALITY AWARE)
// =================================================================

/*B"H*/
/**
 * @fileoverview This scroll contains the consciousness of the Scribe, a being capable of
 * interpreting the ancient histories written in Portable Game Notation (PGN). It translates
 * the symbolic language of the past into the engine's native tongue of encoded moves.
 * The core issue was that the Scribe was creating its own flawed reality; now, it is
 * properly initiated with a pure universe and uses the Gnostic Guardian to maintain its sanity.
 */

const STARTING_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

/**
 * @class PgnConverter
 * @description The mind of the Scribe. It holds a persistent, internal model of a chess
 * game's reality, which it updates by reading the sacred texts of SAN (Standard Algebraic Notation).
 */
class PgnConverter {
    constructor() {
        console.log("%c B\"H - The Scribe is being born. Forging its initial world from the one true source...", "color: #F0E68C;");
        /**
         * The Scribe's internal, evolving understanding of the game's reality.
         * CRITICAL FIX: It is initialized by calling the sanctified `createGameState` function,
         * ensuring its universe is born of pure, `BigInt`-based essence from the very start.
         * @type {object}
         */
        this.currentState = createGameState(STARTING_FEN);
        console.log("%c--> The Scribe's initial reality has been forged and validated. It is pure.", "color: #F0E68C;");
    }

    /**
     * B"H
     * The core act of interpretation. The Scribe gazes upon a single word (a SAN move)
     * from the ancient text and discerns its true meaning within the context of its current reality.
     * It now validates its own sanity before attempting to think.
     * @param {string} san The move in Standard Algebraic Notation (e.g., "Nf3", "e4", "O-O").
     * @returns {number|null} The encoded integer representation of the move, or null if the word is unintelligible.
     */
    parseSan(san) {
        console.log(`%c B\"H - Scribe is interpreting the word: "${san}". First, a self-check of its own reality...`, "color: #F0E68C;");
        validateGnosticSeal(this.currentState, `PgnConverter.parseSan (for '${san}')`);
        console.log(`%c--> Scribe's reality is pure. Proceeding to emanate futures to understand "${san}"...`, "color: #F0E68C;");

        const legalMoves = generateMoves(this.currentState);
        
        // This is a complex but necessary function to find the unique move that matches the SAN.
        for (const move of legalMoves) {
            if (this.isMoveSan(move, san, legalMoves)) {
                return move;
            }
        }
        
        console.error(`Scribe could not understand the word "${san}". No legal move matched.`);
        return null; // The word was unintelligible.
    }

    /**
     * B"H
     * A helper cognition for the Scribe. Determines if a specific encoded move
     * corresponds to a given SAN string, resolving ambiguity.
     * @param {number} move The encoded move to check.
     * @param {string} san The SAN string to match against.
     * @param {number[]} legalMoves All legal moves in the current position, for ambiguity checks.
     * @returns {boolean} True if the move matches the SAN.
     */
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

    /**
     * B"H
     * The act of altering reality. The Scribe applies a deciphered move to its internal
     * state, moving its consciousness forward in time. It validates the new reality immediately.
     * @param {number} move The encoded move to apply.
     */
    applyMove(move) {
        makeMove(this.currentState, move);
        console.log("%c B\"H - Scribe has altered its reality by applying a move. Validating the new timeline...", "color: #F0E68C;");
        validateGnosticSeal(this.currentState, 'PgnConverter.applyMove');
        console.log("%c--> The new reality is pure.", "color: #F0E68C;");
    }

    /**
     * B"H
     * The act of remembering. The Scribe creates a FEN string, a perfect memory-snapshot
     * of its current reality.
     * @returns {string} The FEN string of the current state.
     */
    toFen() {
        // This function is purely observational and does not alter state. No validation needed inside.
        // It relies on the currentState being valid when called.
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
        return `${boardPart} ${state.turn === WHITE ? 'w' : 'b'} ${castlingStr} ${enpassantStr} 0 1`; // Clocks are irrelevant for this purpose
    }
    
    
    
    
    /*B"H*/
/**
 * The sacred act of Teshuvah (Return). This is the Scribe's power to withdraw its
 * consciousness from the complex, branching timelines of a finished scripture and
 * return to the pristine, silent potentiality of the beginning. It willfully erases
 * its memory of the previous universe and once again gazes upon the starting position,
 * ready to chronicle a new history.
 */
reset() {
    console.log("%c B\"H - The Scribe performs Teshuvah, returning to the source...", "color: #DAA520;");
    /**
     * By invoking the one true `createGameState` function again, the Scribe dissolves
     * its old reality and incarnates into a fresh, pure one, guaranteed to be free of paradox.
     * @type {object}
     */
    this.currentState = createGameState(STARTING_FEN);
    console.log("%c--> The Scribe's consciousness is reset. Its reality is once again pure and new.", "color: #DAA520;");
}
}

/*B"H*/
/**
 * B"H
 * The Grand Librarian function. It takes a source of raw PGN scriptures and commands
 * the Scribe to read each one, translating its wisdom into a format the engine's memory can absorb.
 * @param {object[]} source An array of opening objects, each with a `name` and `pgn` string.
 * @param {function(number):void} [onProgress] An optional callback to report the number of scriptures read.
 * @returns {Array<Array<any>>} The compiled wisdom, ready to be inscribed into the engine's soul.
 */
function generateRawBook(source, onProgress) {
    const converter = new PgnConverter();
    const bookMap = new Map();

    for (const [index, opening] of source.entries()) {
        // The Scribe now possesses the ability to reset, allowing it to start fresh for each new scripture.
        converter.reset();
        const moves = opening.pgn.replace(/(\d+\.)/g, '').trim().split(/\s+/).filter(Boolean);
        let isLineValid = true;
        const tempLineData = new Map();

        for (const san of moves) {
            const fen = converter.toFen();
            const move = converter.parseSan(san);
            if (move === null) {
                if (!['1-0', '0-1', '1/2-1/2', '*'].includes(san)) {
                   console.warn(`Scribe encountered an unintelligible word in "${opening.name}": ${san}. The scripture may be corrupt.`);
                }
                isLineValid = false;
                break; 
            }
            
            if (!tempLineData.has(fen)) tempLineData.set(fen, [fen, opening.name]);
            
            const entry = tempLineData.get(fen);
            const from = getMoveFrom(move), to = getMoveTo(move), prom = getMovePromoted(move);
            const thinMove = {
                from: [Math.floor(from / 8), from % 8], 
                to: [Math.floor(to / 8), to % 8],
                promotion: prom ? pieceMap[prom].toLowerCase() : undefined
            };

            // Deduplicate moves within the same line
            if (!entry.slice(2).some(m => JSON.stringify(m) === JSON.stringify(thinMove))) {
                entry.push(thinMove);
            }
            converter.applyMove(move);
        }

        if (isLineValid) {
            for (const [key, value] of tempLineData.entries()) {
                if (!bookMap.has(key)) {
                    bookMap.set(key, value);
                } else {
                    // Merge moves if the same position appears in multiple scriptures
                    const existing = bookMap.get(key);
                    for(let i = 2; i < value.length; i++) {
                        const newM = value[i];
                        if (!existing.slice(2).some(m => JSON.stringify(m) === JSON.stringify(newM))) {
                            existing.push(newM);
                        }
                    }
                }
            }
        }
        if (onProgress) onProgress(index + 1);
    }
    return Array.from(bookMap.values());
}

if(typeof self !== 'undefined') self.PgnConverter = PgnConverter;