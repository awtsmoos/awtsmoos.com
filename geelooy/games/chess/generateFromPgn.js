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
    // Keep a reference to the FEN *before* the move for logging purposes
    const fenForErrorLogging = this.toFen();
    
    san = san.replace(/[+#?!]/g, '');
    if (['1-0', '0-1', '1/2-1/2', '*'].includes(san)) return null;

    const legalMoves = generateMoves(this.currentState);

    if (san === 'O-O') {
        const move = legalMoves.find(m => getMoveCastling(m) && getMoveTo(m) > getMoveFrom(m));
        if (move) return move;
    }
    if (san === 'O-O-O') {
        const move = legalMoves.find(m => getMoveCastling(m) && getMoveTo(m) < getMoveFrom(m));
        if (move) return move;
    }
    
    let promotionType = null;
    if (san.includes('=')) {
        promotionType = 'PNBRQ'.indexOf(san.slice(-1).toUpperCase());
        san = san.slice(0, -2);
    }

    const toMatch = san.match(/([a-h][1-8])$/);
    if (!toMatch) {
        // --- NEW DEBUG LOGGING ---
        console.groupCollapsed(`%cDEBUG: Could not find destination square in SAN: "${san}"`, 'color: orange; font-weight: bold;');
        console.log("FEN:", fenForErrorLogging);
        console.log("All Legal Moves Generated:", legalMoves.map(m => `from: ${getMoveFrom(m)}, to: ${getMoveTo(m)}`));
        console.groupEnd();
        return null;
    }
    const toSq = (8 - parseInt(toMatch[0][1])) * 8 + (toMatch[0].charCodeAt(0) - 'a'.charCodeAt(0));

    const isCapture = san.includes('x');
    const pieceChar = (san[0] >= 'A' && san[0] <= 'Z') ? san[0] : 'P';
    const pieceType = 'PNBRQK'.indexOf(pieceChar);
    
    const fromHint = san.replace('x', '').replace(toMatch[0], '').substring(pieceType === P ? 0 : 1);

    const candidateMoves = [];
    for(const move of legalMoves) {
        if (getMovePiece(move) !== pieceType || getMoveTo(move) !== toSq) continue;
        if (promotionType !== null && getMovePromoted(move) !== promotionType) continue;
        if (isCapture && !getMoveCapture(move)) continue;

        if (fromHint) {
            const fromSq = getMoveFrom(move);
            const fromFile = 'abcdefgh'[fromSq % 8];
            const fromRank = (8 - Math.floor(fromSq / 8)).toString();
            let hintMatch = true;
            for (const char of fromHint) {
                if (char !== fromFile && char !== fromRank) {
                    hintMatch = false;
                    break;
                }
            }
            if (!hintMatch) continue;
        }
        candidateMoves.push(move);
    }
    
    if (candidateMoves.length === 1) return candidateMoves[0];
    
    // If we're here, we either found 0 or multiple candidates.
    if (candidateMoves.length === 0) {
        // --- NEW DEBUG LOGGING ---
        console.groupCollapsed(`%cDEBUG: No matching legal move found for SAN: "${san}"`, 'color: orange; font-weight: bold;');
        console.log("FEN:", fenForErrorLogging);
        console.log("All Legal Moves Generated:", legalMoves.map(m => {
            return {
                from: getMoveFrom(m), to: getMoveTo(m), piece: pieceMap[getMovePiece(m) + (this.currentState.turn === BLACK ? 6 : 0)], 
                promo: getMovePromoted(m), capture: getMoveCapture(m), castle: getMoveCastling(m)
            };
        }));
        console.groupEnd();
        return null; // This will trigger the original error log
    }

    // If still ambiguous, it means multiple pieces of the same type can move to the square.
    // This is rare in valid PGNs but we return the first match for robustness.
    if (candidateMoves.length > 1) return candidateMoves[0];

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
        for (const san of moves) {
            const fenBeforeMove = converter.toFen();
            const hash = calculateZobristHash(converter.currentState);
            const move = converter.parseSan(san);
            if (move == null) {
                if (!['1-0', '0-1', '1/2-1/2', '*'].includes(san)) { console.error(`Could not parse SAN "${san}" in opening "${opening.name}" from FEN "${fenBeforeMove}".`); }
                break;
            }
            const hashString = hash.toString();
            if (!bookMap.has(hashString)) { bookMap.set(hashString, [fenBeforeMove, opening.name]); }
            const entry = bookMap.get(hashString);
            const fromSq = getMoveFrom(move), toSq = getMoveTo(move), promotedPiece = getMovePromoted(move);
            const thinMove = {
                from: [Math.floor(fromSq/8), fromSq%8], to: [Math.floor(toSq/8), toSq%8],
                promotion: promotedPiece ? pieceMap[promotedPiece].toLowerCase() : undefined
            };
            if (!entry.slice(2).some(m => m.from[0] === thinMove.from[0] && m.from[1] === thinMove.from[1] && m.to[0] === thinMove.to[0] && m.to[1] === thinMove.to[1] && m.promotion === thinMove.promotion)) {
                entry.push(thinMove);
            }
            converter.applyMove(move);
        }
        if (onProgress) onProgress(index + 1);
    }
    return Array.from(bookMap.values());
}