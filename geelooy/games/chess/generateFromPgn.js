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
    const fenForErrorLogging = this.toFen();
    const originalSan = san;
    san = san.replace(/[+#?!]/g, '');
    if (['1-0', '0-1', '1/2-1/2', '*'].includes(san)) return null;

    const legalMoves = generateMoves(this.currentState);

    // 1. Handle Castling first, as it has unique notation
    if (san === 'O-O') {
        const move = legalMoves.find(m => getMoveCastling(m) && getMoveTo(m) > getMoveFrom(m));
        if (move) return move;
    }
    if (san === 'O-O-O') {
        const move = legalMoves.find(m => getMoveCastling(m) && getMoveTo(m) < getMoveFrom(m));
        if (move) return move;
    }

    // 2. Use a robust regex to parse the move notation into named parts
    // This handles piece moves like "Nxd5", "Rfe1", "Qh4", etc.
    const sanRegex = /^(?<piece>[NBRQK])?(?<from_file>[a-h])?(?<from_rank>[1-8])?x?(?<to_sq>[a-h][1-8])(=(?<promo>[NBRQ]))?/;
    let match = san.match(sanRegex);
    
    // If the main regex fails, it's likely a pawn move (e.g., "e4", "dxc5")
    if (!match) {
        const pawnRegex = /^(?<from_file>[a-h])?x?(?<to_sq>[a-h][1-8])(=(?<promo>[NBRQ]))?/;
        const pawnMatch = san.match(pawnRegex);
        if (pawnMatch) {
            // Reconstruct the match object with 'P' as the piece
             match = { groups: { ...pawnMatch.groups, piece: 'P' } };
        } else {
            // The SAN is malformed or unparsable
            return null; 
        }
    }

    const groups = match.groups;
    const pieceType = 'PNBRQK'.indexOf(groups.piece || 'P');
    const toSq = (8 - parseInt(groups.to_sq[1])) * 8 + (groups.to_sq.charCodeAt(0) - 'a'.charCodeAt(0));
    const isCapture = san.includes('x');
    const promotionType = groups.promo ? 'PNBRQ'.indexOf(groups.promo) : null;

    // 3. Filter candidate moves from the legal moves list
    const candidateMoves = legalMoves.filter(move => {
        // Basic checks: piece type, destination square, capture flag, promotion
        if (getMovePiece(move) !== pieceType) return false;
        if (getMoveTo(move) !== toSq) return false;
        if (isCapture && !getMoveCapture(move)) return false;
        // This is a special case for pawn moves: if SAN doesn't have 'x', it cannot be a capture.
        if (!isCapture && getMoveCapture(move) && pieceType === P) return false; 
        if (promotionType !== null && getMovePromoted(move) !== promotionType) return false;

        // Disambiguation checks using 'from' hints
        const fromSq = getMoveFrom(move);
        const fromFile = String.fromCharCode('a'.charCodeAt(0) + (fromSq % 8));
        const fromRank = (8 - Math.floor(fromSq / 8)).toString();

        if (groups.from_file && groups.from_file !== fromFile) return false;
        if (groups.from_rank && groups.from_rank !== fromRank) return false;

        return true;
    });

    // 4. Return the result
    if (candidateMoves.length === 1) {
        return candidateMoves[0];
    }
    
    // If there are multiple candidates, the PGN was ambiguous (e.g., "Nd5" when two knights can go there).
    // For robustness, we'll just return the first one found.
    if (candidateMoves.length > 1) {
        return candidateMoves[0];
    }

    // If we found no candidates after all that, log the error with the new detailed info.
    // (This part is for debugging and should no longer be hit after this fix)
    console.groupCollapsed(`%cDEBUG: No matching legal move found for SAN: "${originalSan}"`, 'color: red; font-weight: bold;');
    console.log("FEN:", fenForErrorLogging);
    console.log("Parsed Info:", { pieceType, toSq, isCapture, promotionType, from_file: groups.from_file, from_rank: groups.from_rank });
    console.log("All Legal Moves Generated:", legalMoves);
    console.groupEnd();
    
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

if (typeof self !== 'undefined') {
    self.PgnConverter = PgnConverter;
}

