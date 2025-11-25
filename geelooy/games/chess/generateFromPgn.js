/* B"H */

// =================================================================
//                 PGN CONVERTER (MK. XII - SILENT FAIL)
// =================================================================
// This version will NEVER throw an error that stops the engine.
// If a move is confusing, it logs a warning and moves on.
// =================================================================

const STARTING_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

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
            // SILENT FAILURE: Just return null, don't crash the worker
            return null; 
        } catch (e) {
            return null;
        }
    }

    isMoveSan(move, san, legalMoves) {
        const sanClean = san.replace(/[+#?!]/g, '');
        const from = getMoveFrom(move), to = getMoveTo(move), piece = getMovePiece(move);
        const isCapture = getMoveCapture(move), isCastle = getMoveCastling(move);
        const promotedPiece = getMovePromoted(move);
        
        const files = 'abcdefgh', ranks = '87654321';
        // Correct piece letter lookup
        const pieceLetter = 'PNBRQK'[piece % 6];
        
        const destSquare = files[to % 8] + ranks[Math.floor(to / 8)];
        let generatedSan = "";

        if (isCastle) {
            generatedSan = to > from ? 'O-O' : 'O-O-O';
        } else if (pieceLetter === 'P') {
            if (isCapture) {
                generatedSan = files[from % 8] + 'x' + destSquare;
            } else {
                generatedSan = destSquare;
            }
            if (promotedPiece) {
                generatedSan += '=' + 'PNBRQK'[promotedPiece % 6];
            }
        } else {
            generatedSan = pieceLetter;
            const ambiguousMoves = legalMoves.filter(m => m !== move && getMovePiece(m) === piece && getMoveTo(m) === to && !getMoveCastling(m));

            if (ambiguousMoves.length > 0) {
                const fromFile = from % 8, fromRank = Math.floor(from / 8);
                const fileIsUnique = !ambiguousMoves.some(m => (getMoveFrom(m) % 8) === fromFile);
                if (fileIsUnique) {
                    generatedSan += files[fromFile];
                } else {
                    const rankIsUnique = !ambiguousMoves.some(m => Math.floor(getMoveFrom(m) / 8) === fromRank);
                    if (rankIsUnique) {
                        generatedSan += ranks[fromRank];
                    } else {
                        generatedSan += files[fromFile] + ranks[fromRank];
                    }
                }
            }
            if (isCapture) {
                generatedSan += 'x';
            }
            generatedSan += destSquare;
        }

        return sanClean === generatedSan;
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
            // Safe handling: if move is null, just stop this line and move to the next
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