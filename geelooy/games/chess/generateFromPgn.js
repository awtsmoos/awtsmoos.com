/* B"H */

// =================================================================
//                 BITBOARD PGN CONVERTER (v2.0 - VERIFIED)
// =================================================================

class PgnConverter {
    constructor() {
        this.currentState = null;
        this.reset();
    }

    reset() {
        this.currentState = createGameState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    }
    
    toFen() {
        let fen = '';
        for (let r = 0; r < 8; r++) {
            let empty = 0;
            for (let c = 0; c < 8; c++) {
                const sq = r * 8 + c;
                let piece = -1;
                for (let p = 0; p < 12; p++) {
                    if ((this.currentState.pieceBitboards[p] & (1n << BigInt(sq))) !== 0n) {
                        piece = p;
                        break;
                    }
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
        
        // FEN clocks are not essential for book generation
        fen += ' 0 1';
        
        return fen;
    }

    // IN generateFromPgn.js, REPLACE THE parseSan and generateRawBook functions:

    parseSan(san) {
        const legalMoves = generateMoves(this.currentState);
        san = san.replace(/[+#?!]/g, '');

        if (san === 'O-O') return legalMoves.find(m => getMoveCastling(m) && getMoveTo(m) > getMoveFrom(m));
        if (san === 'O-O-O') return legalMoves.find(m => getMoveCastling(m) && getMoveTo(m) < getMoveFrom(m));
        if (['1-0', '0-1', '1/2-1/2', '*'].includes(san)) return null;

        const toMatch = san.match(/([a-h][1-8])/);
        if(!toMatch) return null;
        const toSq = (8 - parseInt(toMatch[1][1])) * 8 + (toMatch[1][0].charCodeAt(0) - 'a'.charCodeAt(0));

        let pieceType = (san[0] >= 'A' && san[0] <= 'Z') ? 'PNBRQK'.indexOf(san[0]) : P;

        const disambiguation = san.match(/^([a-h]?[1-8]?)[x]?([a-h][1-8])/);
        const fromHint = disambiguation ? disambiguation[1] : '';

        const candidateMoves = legalMoves.filter(move => {
            if (getMovePiece(move) !== pieceType || getMoveTo(move) !== toSq) return false;
            
            if (fromHint) {
                const fromSq = getMoveFrom(move);
                const fromFile = 'abcdefgh'[fromSq % 8];
                const fromRank = (8 - Math.floor(fromSq/8)).toString();
                if (fromHint.length === 1 && !fromFile.includes(fromHint) && !fromRank.includes(fromHint)) return false;
                if (fromHint.length === 2 && (fromFile !== fromHint[0] || fromRank !== fromHint[1])) return false;
            }
            return true;
        });
        
        return candidateMoves.length > 0 ? candidateMoves[0] : null;
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

        for (const san of moves) {
            const fenBeforeMove = converter.toFen();
            const hash = calculateZobristHash(converter.currentState); // Hash BEFORE the move
            const move = converter.parseSan(san);

            if (move == null) {
                if (!['1-0', '0-1', '1/2-1/2', '*'].includes(san)) {
                    console.error(`Could not parse SAN "${san}" in opening "${opening.name}" from FEN "${fenBeforeMove}".`);
                }
                break;
            }

            if (!bookMap.has(hash)) {
                bookMap.set(hash, [fenBeforeMove, opening.name]);
            }
            
            const entry = bookMap.get(hash);
            const fromSq = getMoveFrom(move);
            const toSq = getMoveTo(move);
            const thinMove = {
                from: [Math.floor(fromSq/8), fromSq%8],
                to: [Math.floor(toSq/8), toSq%8],
                promotion: getMovePromoted(move) ? pieceMap[getMovePromoted(move)].toLowerCase() : undefined
            };

            entry.push(thinMove);
            converter.applyMove(move);
        }
        if (onProgress) onProgress(index + 1);
    }
    return Array.from(bookMap.values());
}