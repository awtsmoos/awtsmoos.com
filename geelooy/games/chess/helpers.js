
//B"H
let zobristKeys, zobristTurnKey, zobristCastlingKeys, zobristEnPassantKeys;


function initializeZobristKeys() {
    if (zobristKeys) return;
    
    // This pseudo-random generator is guaranteed to produce Numbers.
    const pseudoRandom = (() => {
        let seed = 19880128;
        return () => seed = (seed * 16807) % 2147483647;
    })();

    // This function MUST return a BigInt.
    const random64 = () => (BigInt(pseudoRandom()) << 32n) | BigInt(pseudoRandom());

    // Initialize all key arrays using the BigInt generator.
    zobristKeys = Array(12).fill(null).map(() => Array(64).fill(0n).map(random64));
    zobristTurnKey = random64();
    zobristCastlingKeys = Array(16).fill(0n).map(random64); // For indices 0-15
    zobristEnPassantKeys = Array(8).fill(0n).map(random64); // For indices 0-7 (files a-h)
}


function createGameState(fen) {
    initializeZobristKeys(); // Ensure keys are ready
    const [pieces, turn, castling, enPassant, half, full] = fen.split(' ');
    const board = Array(8).fill(null).map(() => Array(8).fill(''));
    pieces.split('/').forEach((row, r) => {
        let c = 0;
        for (const char of row) {
            if (isNaN(parseInt(char))) {
                board[r][c] = char;
                c++;
            } else {
                c += parseInt(char);
            }
        }
    });

    let castlingRights = 0;
    if (castling.includes('K')) castlingRights |= 8;
    if (castling.includes('Q')) castlingRights |= 4;
    if (castling.includes('k')) castlingRights |= 2;
    if (castling.includes('q')) castlingRights |= 1;
    
    const enPassantTarget = enPassant === '-' 
        ? null 
        : [8 - parseInt(enPassant[1]), 'abcdefgh'.indexOf(enPassant[0])];

    const state = {
        board,
        turn,
        castlingRights,
        enPassantTarget,
        kingPos: { w: findKing(board, 'w'), b: findKing(board, 'b') },
        moveCount: ((parseInt(full) || 1) - 1) * 2 + (turn === 'b' ? 1 : 0)
    };
    state.zobristHash = calculateZobristHash(state);
    return state;
}

// This is the new, correct makeMove function.
function makeMove(state, move) {

	if (move.isNullMove) {
        let newHash = state.zobristHash ^ zobristTurnKey;
        if (state.enPassantTarget) {
            newHash ^= zobristEnPassantKeys['abcdefgh'.indexOf(state.enPassantTarget[0])];
        }
        return {
            newState: {
                ...state,
                turn: state.turn === 'w' ? 'b' : 'w',
                enPassantTarget: null,
                zobristHash: newHash,
                moveCount: state.moveCount + 1
            }
        };
    }


    const { board, turn, castlingRights, enPassantTarget, zobristHash, kingPos } = state;
    const newBoard = board.map(row => row.slice());
    let newHash = zobristHash;
    let newCastlingRights = castlingRights;
    const [fromR, fromC] = move.from;
    const [toR, toC] = move.to;

    const piece = newBoard[fromR][fromC];
    const finalPiece = move.promotion ? move.promotion : piece;
    
    
    // 1. Update board and piece hashes
    newBoard[fromR][fromC] = '';
    newBoard[toR][toC] = finalPiece;
    newHash ^= zobristKeys[pieceMap.indexOf(piece)][fromR * 8 + fromC];
    newHash ^= zobristKeys[pieceMap.indexOf(finalPiece)][toR * 8 + toC];
    
    
    
    // 2. Update hashes for turn and previous en-passant state
    newHash ^= zobristTurnKey;
    
    if (enPassantTarget) {
        newHash ^= zobristEnPassantKeys[enPassantTarget[1]];
     }
    
    // 3. Handle captures
    let capturedPiece = move.capture;
    if (move.isEnPassant) {
        const capturedPawnPos = turn === 'w' ? [toR + 1, toC] : [toR - 1, toC];
        newBoard[capturedPawnPos[0]][capturedPawnPos[1]] = '';
        capturedPiece = turn === 'w' ? 'p' : 'P';
        newHash ^= zobristKeys[pieceMap.indexOf(capturedPiece)][capturedPawnPos[0] * 8 + capturedPawnPos[1]];
    }

    // 4. Set new en-passant target
    let newEnPassantTarget = null;
    if (move.isPawnDoubleMove) {
        newEnPassantTarget = [turn === 'w' ? fromR - 1 : fromR + 1, fromC];
        // Hash using the column index
        newHash ^= zobristEnPassantKeys[fromC];
    }

    // 5. Update castling rights (The core of the fix)
    newHash ^= zobristCastlingKeys[newCastlingRights]; // XOR out the old castling key
    newCastlingRights &= castlingUpdateMask[fromR * 8 + fromC];
    newCastlingRights &= castlingUpdateMask[toR * 8 + toC];
    newHash ^= zobristCastlingKeys[newCastlingRights]; // XOR in the new one

    // 6. Handle castling move itself
    if (move.isCastle) {
        const rookFrom = toC === 6 ? [fromR, 7] : [fromR, 0];
        const rookTo = toC === 6 ? [fromR, 5] : [fromR, 3];
        const rook = newBoard[rookFrom[0]][rookFrom[1]];
        newBoard[rookFrom[0]][rookFrom[1]] = '';
        newBoard[rookTo[0]][rookTo[1]] = rook;
        newHash ^= zobristKeys[pieceMap.indexOf(rook)][rookFrom[0] * 8 + rookFrom[1]];
        newHash ^= zobristKeys[pieceMap.indexOf(rook)][rookTo[0] * 8 + rookTo[1]];
    }
    
    const newKingPos = { ...kingPos };
    if (piece.toLowerCase() === 'k') newKingPos[turn] = { r: toR, c: toC };
    
    return {
        newState: {
            board: newBoard,
            turn: turn === 'w' ? 'b' : 'w',
            castlingRights: newCastlingRights,
            enPassantTarget: newEnPassantTarget,
            kingPos: newKingPos,
            zobristHash: newHash,
            moveCount: state.moveCount + 1
        }
    };
}