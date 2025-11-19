/* B"H */

// =================================================================
//                 BITBOARD PGN CONVERTER (MK. VI - LEGALITY AWARE)
// =================================================================

class PgnConverter {
    constructor() {
        this.currentState = null;
        this.reset();
    }

    reset() {
        this.currentState = createGameState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
        moveStackPtr = 0;
    }

    toFen() {
        let fen = '';
        for (let r = 0; r < 8; r++) {
            let empty = 0;
            for (let c = 0; c < 8; c++) {
                const sq = r * 8 + c;
                let piece = -1;
                for (let p = 0; p < 12; p++) {
                    if ((this.currentState.pieceBitboards[p] & (1n << BigInt(sq))) !== 0n) { piece = p; break; }
                }
                if (piece !== -1) {
                    if (empty > 0) { fen += empty; empty = 0; }
                    fen += pieceMap[piece];
                } else { empty++; }
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
        fen += ' ' + (this.currentState.enpassant === -1 ? '-' : `${'abcdefgh'[this.currentState.enpassant % 8]}${8 - Math.floor(this.currentState.enpassant / 8)}`);
        fen += ' 0 1';
        return fen;
    }

    /**
     * Checks if a move is strictly legal (doesn't leave king in check).
     */
    isMoveLegal(move) {
        makeMove(this.currentState, move);
        const attacker = this.currentState.turn; // Turn flipped, so attacker is side who just moved
        const kingColor = attacker ^ 1;
        const kingSq = getLSBIndex(this.currentState.pieceBitboards[kingColor * 6 + K]);
        const inCheck = isSquareAttacked_lean(this.currentState, kingSq, attacker);
        unmakeMove(this.currentState);
        return !inCheck;
    }

    parseSan(san) {
        san = san.replace(/[+#?!]/g, '');
        if (['1-0', '0-1', '1/2-1/2', '*'].includes(san)) return null;

        const legalMoves = generateMoves(this.currentState); // Generates pseudo-legal
        
        // Filter: Match SAN text properties
        let candidates = legalMoves.filter(move => {
             // 1. Castling
            if (san === 'O-O') return getMoveCastling(move) && getMoveTo(move) > getMoveFrom(move);
            if (san === 'O-O-O') return getMoveCastling(move) && getMoveTo(move) < getMoveFrom(move);
            
            // 2. Normal Moves
            const isCapture = san.includes('x');
            let pieceChar = (san[0] >= 'A' && san[0] <= 'Z') ? san[0] : 'P';
            let promotionChar = san.includes('=') ? san.slice(san.indexOf('=') + 1).toUpperCase() : null;
            let targetSan = san.includes('=') ? san.split('=')[0] : san;
            
            const match = targetSan.match(/([a-h][1-8])$/);
            if (!match) return false;
            const toStr = match[0];
            const toSq = (8 - parseInt(toStr[1])) * 8 + (toStr.charCodeAt(0) - 'a'.charCodeAt(0));
            
            if (getMoveTo(move) !== toSq) return false;
            if (pieceMap[getMovePiece(move) + (this.currentState.turn * 6)].toUpperCase() !== pieceChar) return false;
            if (promotionChar) {
                const p = getMovePromoted(move);
                if (!p || pieceMap[p + (this.currentState.turn * 6)].toUpperCase() !== promotionChar) return false;
            }
            if (isCapture !== (getMoveCapture(move) === 1)) return false;

            // Disambiguation
            let hint = targetSan.replace('x', '').replace(toStr, '');
            if (pieceChar !== 'P') hint = hint.substring(1);
            if (hint) {
                const f = getMoveFrom(move);
                const file = String.fromCharCode('a'.charCodeAt(0) + (f % 8));
                const rank = (8 - Math.floor(f / 8)).toString();
                if (hint.length === 1 && hint !== file && hint !== rank) return false;
                if (hint.length === 2 && hint !== (file + rank)) return false;
            }
            return true;
        });

        // Filter: Strict Legality Check
        // This prevents the engine from following a book line that enters an illegal state due to a pinned piece
        candidates = candidates.filter(m => this.isMoveLegal(m));

        return candidates.length === 1 ? candidates[0] : null;
    }

    applyMove(move) {
        makeMove(this.currentState, move);
    }
}

function generateRawBook(source, onProgress) {
    const converter = new PgnConverter();
    const bookMap = new Map();

    for (const [index, opening] of source.entries()) {
        converter.reset();
        const moves = opening.pgn.replace(/(\d+\.)/g, '').trim().split(/\s+/).filter(Boolean);
        let isLineValid = true;
        const tempLineData = new Map();

        for (const san of moves) {
            const fen = converter.toFen();
            const move = converter.parseSan(san);
            if (move === null) {
                // Only log errors for actual moves, not end-of-game markers
                if (!['1-0', '0-1', '1/2-1/2', '*'].includes(san)) {
                   // console.log(`Skipping invalid line in "${opening.name}": ${san}`);
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

            // Deduplicate moves
            if (!entry.slice(2).some(m => 
                m.from[0] === thinMove.from[0] && m.from[1] === thinMove.from[1] &&
                m.to[0] === thinMove.to[0] && m.to[1] === thinMove.to[1] &&
                m.promotion === thinMove.promotion
            )) {
                entry.push(thinMove);
            }
            converter.applyMove(move);
        }

        if (isLineValid) {
            for (const [key, value] of tempLineData.entries()) {
                if (!bookMap.has(key)) {
                    bookMap.set(key, value);
                } else {
                    const existing = bookMap.get(key);
                    for(let i = 2; i < value.length; i++) {
                        const newM = value[i];
                        if (!existing.slice(2).some(m => 
                            m.from[0] === newM.from[0] && m.from[1] === newM.from[1] &&
                            m.to[0] === newM.to[0] && m.to[1] === newM.to[1] &&
                            m.promotion === newM.promotion
                        )) existing.push(newM);
                    }
                }
            }
        }
        if (onProgress) onProgress(index + 1);
    }
    return Array.from(bookMap.values());
}

if(typeof self !== 'undefined') self.PgnConverter = PgnConverter;