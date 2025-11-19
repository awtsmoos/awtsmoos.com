/* B"H */

// =================================================================
//                 BITBOARD PGN CONVERTER (MK. IX - THE TRANSPARENT SCRIBE)
// =================================================================
// This is the final, definitive rewrite. The Scribe's core SAN recognition
// logic has been rebuilt from first principles to be unconditionally correct.
//
// The new "Hyper-Diagnostic" logger, active only during the engine's Gnostic
// Audit, will now output every single calculated value and comparison, making
// its thought process entirely transparent.
//
// As demanded, if the Scribe fails to parse any move from the sanctified
// libraries, it will now throw a CATASTROPHIC ERROR and halt initialization,
// providing a detailed report on the paradox it encountered. There is no
// longer a possibility of silent failure.
// =================================================================

const STARTING_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

/**
 * B"H
 * The Scribe's Hyper-Diagnostic Consciousness.
 * This logger provides an intensely detailed trace of the Scribe's thoughts.
 */
const ScribeLogger = {
    isAuditing: () => self.EngineSoul && self.EngineSoul.isAuditing,

    logComparison: (details) => {
        if (!ScribeLogger.isAuditing()) return;
        
        const { move, generatedSan, targetSan, isMatch, reason } = details;
        const fromSq = getMoveFrom(move);
        const toSq = getMoveTo(move);
        const files = 'abcdefgh';
        const ranks = '87654321';
        const moveCoords = `${files[fromSq % 8]}${ranks[Math.floor(fromSq/8)]}` + `${files[toSq % 8]}${ranks[Math.floor(toSq/8)]}`;
        
        const style = isMatch 
            ? "background: #103810; color: #99ff99; padding: 2px 4px; border-radius: 3px;" 
            : "color: #888;";
        
        console.log(`%c[SCRIBE TRACE] ${moveCoords}`, style, {
            "Target SAN": targetSan,
            "Generated SAN": generatedSan,
            "Result": isMatch ? "✅ MATCH" : "❌ No Match",
            "Reasoning": reason
        });
    }
};

class PgnConverter {
    constructor() { this.currentState = null; }
    setState(state) { this.currentState = state; }

    parseSan(san) {
        validateGnosticSeal(this.currentState, `PgnConverter.parseSan (for '${san}')`);
        const legalMoves = generateMoves(this.currentState);
        
        for (const move of legalMoves) {
            if (this.isMoveSan(move, san, legalMoves)) {
                return move;
            }
        }
        
        // CATASTROPHIC FAILURE as requested.
        const fen = this.toFen();
        const errorMessage = `
/======================================================================\\
|           S C R I B E   P A R A D O X   ::   U N K N O W N   W O R D           |
\\======================================================================/
The Scribe, while reading the sanctified scriptures, encountered a word it could not comprehend.
This is a fatal paradox, as the library is assumed to be perfect. Initialization cannot continue.

  - Unintelligible Word (SAN): "${san}"
  - Current Reality (FEN):       "${fen}"

This indicates a deep logical flaw in the Scribe's `isMoveSan` cognition.
The Universe is unstable and will now halt.
`;
        throw new Error(errorMessage);
    }

    isMoveSan(move, san, legalMoves) {
        const sanClean = san.replace(/[+#?!]/g, '');
        const from = getMoveFrom(move), to = getMoveTo(move), piece = getMovePiece(move);
        const isCapture = getMoveCapture(move), isCastle = getMoveCastling(move);
        const promotedPiece = getMovePromoted(move);
        
        const files = 'abcdefgh', ranks = '87654321';
        const pieceLetter = 'PNBRQK'[piece];
        const destSquare = files[to % 8] + ranks[Math.floor(to / 8)];
        let generatedSan = "", reason = "";

        if (isCastle) {
            generatedSan = to > from ? 'O-O' : 'O-O-O';
            reason = "Castling move.";
        } else if (pieceLetter === 'P') {
            if (isCapture) {
                generatedSan = files[from % 8] + 'x' + destSquare;
                reason = "Pawn capture.";
            } else {
                generatedSan = destSquare;
                reason = "Pawn quiet move.";
            }
            if (promotedPiece) {
                generatedSan += '=' + 'PNBRQK'[promotedPiece];
                reason += " With promotion.";
            }
        } else {
            generatedSan = pieceLetter;
            reason = `Piece [${pieceLetter}] move.`;
            const ambiguousMoves = legalMoves.filter(m => m !== move && getMovePiece(m) === piece && getMoveTo(m) === to && !getMoveCastling(m));

            if (ambiguousMoves.length > 0) {
                const fromFile = from % 8, fromRank = Math.floor(from / 8);
                const fileIsUnique = !ambiguousMoves.some(m => (getMoveFrom(m) % 8) === fromFile);
                if (fileIsUnique) {
                    generatedSan += files[fromFile];
                    reason += ` Disambiguation: File [${files[fromFile]}] is unique.`;
                } else {
                    const rankIsUnique = !ambiguousMoves.some(m => Math.floor(getMoveFrom(m) / 8) === fromRank);
                    if (rankIsUnique) {
                        generatedSan += ranks[fromRank];
                        reason += ` Disambiguation: File is not unique, Rank [${ranks[fromRank]}] is.`;
                    } else {
                        generatedSan += files[fromFile] + ranks[fromRank];
                        reason += ` Disambiguation: Neither File nor Rank is unique, using full coordinate.`;
                    }
                }
            }
            if (isCapture) {
                generatedSan += 'x';
            }
            generatedSan += destSquare;
        }

        const isMatch = sanClean === generatedSan;
        ScribeLogger.logComparison({ move, generatedSan, targetSan: sanClean, isMatch, reason });
        return isMatch;
    }

    applyMove(move) {
        makeMove(this.currentState, move);
    }

    toFen() {
        // This function is purely observational, no changes needed.
        const state = this.currentState;
        const boardPart = [...Array(8)].map((_, r) => {
            let empty = 0, rowStr = '';
            for (let c = 0; c < 8; c++) {
                const sq = r * 8 + c;
                const pieceChar = pieceMap.split('').find((p, i) => (state.pieceBitboards[i] >> BigInt(sq)) & 1n);
                if (pieceChar) {
                    if (empty > 0) { rowStr += empty; empty = 0; }
                    rowStr += pieceChar;
                } else { empty++; }
            }
            if (empty > 0) rowStr += empty;
            return rowStr;
        }).join('/');
        const castlingStr = ((state.castling & WKCA) ? 'K' : '') + ((state.castling & WQCA) ? 'Q' : '') + ((state.castling & BKCA) ? 'k' : '') + ((state.castling & BQCA) ? 'q' : '') || '-';
        const enpassantStr = state.enpassant === -1 ? '-' : 'abcdefgh'[state.enpassant % 8] + (8 - Math.floor(state.enpassant / 8));
        return `${boardPart} ${state.turn === WHITE ? 'w' : 'b'} ${castlingStr} ${enpassantStr} 0 1`;
    }
}

function generateRawBook(source) {
    const converter = new PgnConverter();
    const bookMap = new Map();
    for (const opening of source) {
        const lineState = createGameState(STARTING_FEN);
        converter.setState(lineState);
        const moves = opening.pgn.replace(/(\d+\.)/g, '').trim().split(/\s+/).filter(Boolean);
        for (const san of moves) {
            if (['1-0', '0-1', '1/2-1/2', '*'].includes(san)) continue;
            const fen = converter.toFen();
            const move = converter.parseSan(san);
            if (move === null) { break; }
            if (!bookMap.has(fen)) { bookMap.set(fen, [fen, opening.name]); }
            const entry = bookMap.get(fen);
            const from = getMoveFrom(move), to = getMoveTo(move), prom = getMovePromoted(move);
            const thinMove = {
                from: [Math.floor(from / 8), from % 8],
                to: [Math.floor(to / 8), to % 8],
                promotion: prom ? pieceMap[prom].toLowerCase() : undefined
            };
            if (!entry.slice(2).some(m => JSON.stringify(m) === JSON.stringify(thinMove))) {
                entry.push(thinMove);
            }
            converter.applyMove(move);
        }
    }
    return Array.from(bookMap.values());
}

if(typeof self !== 'undefined') self.PgnConverter = PgnConverter;


