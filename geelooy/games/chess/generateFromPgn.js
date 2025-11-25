/* B"H */

// =================================================================
//                 BITBOARD PGN CONVERTER (MK. XI - TOLERANT SCRIBE)
// =================================================================
// This version swallows errors during parsing instead of crashing the app.
// It logs the error but returns null, allowing the engine to skip invalid lines.
// =================================================================

const STARTING_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

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
        const style = isMatch ? "background: #103810; color: #99ff99; padding: 2px 4px; border-radius: 3px;" : "color: #888;";
        console.log(`%c[SCRIBE TRACE] ${moveCoords}`, style, {
            "Target SAN": targetSan,
            "Generated SAN": generatedSan,
            "Result": isMatch ? "✅ MATCH" : "❌ No Match",
            "Reasoning": reason
        });
    }
};

if (typeof self !== 'undefined') self.ScribeLogger = ScribeLogger;


class PgnConverter {
    constructor() { this.currentState = null; }
    setState(state) { this.currentState = state; }

    parseSan(san) {
        try {
            if (!this.currentState) return null;
            const legalMoves = generateMoves(this.currentState);
            
            for (const move of legalMoves) {
                if (this.isMoveSan(move, san, legalMoves)) {
                    return move;
                }
            }
            
            // If we are auditing, throw to debug. If not, return null to skip.
            if (ScribeLogger.isAuditing()) {
                console.warn(`Scribe could not understand "${san}". Skipping.`);
            }
            return null; // Soft failure
        } catch (e) {
            console.error("CRITICAL SCRIBE ERROR:", e);
            return null;
        }
    }

    isMoveSan(move, san, legalMoves) {
        const sanClean = san.replace(/[+#?!]/g, '');
        const from = getMoveFrom(move), to = getMoveTo(move), piece = getMovePiece(move);
        const isCapture = getMoveCapture(move), isCastle = getMoveCastling(move);
        const promotedPiece = getMovePromoted(move);
        
        const files = 'abcdefgh', ranks = '87654321';
        // =================================================================
        // THE CRITICAL BUG FIX: Use (piece % 6) to handle black pieces.
        const pieceLetter = 'PNBRQK'[piece % 6];
        // =================================================================
        
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
                generatedSan += '=' + 'PNBRQK'[promotedPiece % 6];
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
        const state = this.currentState;
        const boardPart = [...Array(8)].map((_, r) => {
            let empty = 0, rowStr = '';
            for (let c = 0; c < 8; c++) {
                const sq = r * 8 + c;
                const pieceChar = pieceMap.split('').find((p, i) => (state.pieceBitboards[i] >> BigInt(sq)) & 1n);
                if (pieceChar) { if (empty > 0) { rowStr += empty; empty = 0; } rowStr += pieceChar; } else { empty++; }
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
            // If we can't understand a move, stop processing this line but don't crash.
            if (move === null) { 
                break; 
            }
            if (!bookMap.has(fen)) { bookMap.set(fen, [fen, opening.name]); }
            const entry = bookMap.get(fen);
            const from = getMoveFrom(move), to = getMoveTo(move), prom = getMovePromoted(move);
            const thinMove = {
                from: [Math.floor(from / 8), from % 8],
                to: [Math.floor(to / 8), to % 8],
                promotion: prom ? pieceMap[prom % 6].toLowerCase() : undefined
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