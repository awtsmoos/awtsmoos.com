//B"H
let zobristKeys, zobristTurnKey, zobristCastlingKeys, zobristEnPassantKeys;

function initializeZobristKeys() {
    if (zobristKeys) return;
    
    const pseudoRandom = (() => {
        let seed = 19880128;
        return () => seed = (seed * 16807) % 2147483647;
    })();

    const random64 = () => (BigInt(pseudoRandom()) << 32n) | BigInt(pseudoRandom());

    zobristKeys = Array(12).fill(null).map(() => Array(64).fill(0n).map(random64));
    zobristTurnKey = random64();
    zobristCastlingKeys = Array(16).fill(0n).map(random64);
    zobristEnPassantKeys = Array(8).fill(0n).map(random64);
}


function createGameState(fen) {
    initializeZobristKeys();
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
            newHash ^= zobristEnPassantKeys[state.enPassantTarget[1]];
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
    if (move.isEnPassant) {
        const capturedPawnRow = turn === 'w' ? toR + 1 : toR - 1;
        const capturedPiece = newBoard[capturedPawnRow][toC];
        newBoard[capturedPawnRow][toC] = '';
        newHash ^= zobristKeys[pieceMap.indexOf(capturedPiece)][capturedPawnRow * 8 + toC];
    } else if (move.capture) {
        // The captured piece is already on the 'to' square before our move
        // Note: For promotions that capture, the piece hash is already handled.
        // We only need to account for non-promoting captures here.
        if (!move.promotion) {
            newHash ^= zobristKeys[pieceMap.indexOf(move.capture)][toR * 8 + toC];
        }
    }

    // 4. Set new en-passant target
    let newEnPassantTarget = null;
    if (move.isPawnDoubleMove) {
        newEnPassantTarget = [turn === 'w' ? fromR - 1 : fromR + 1, fromC];
        newHash ^= zobristEnPassantKeys[fromC]; // Hash using the column index
    }

    // 5. Update castling rights
    let newCastlingRights = castlingRights;
    if (newCastlingRights !== 0) {
        newHash ^= zobristCastlingKeys[newCastlingRights]; // XOR out the old castling key
        newCastlingRights &= castlingUpdateMask[fromR * 8 + fromC];
        newCastlingRights &= castlingUpdateMask[toR * 8 + toC];
        newHash ^= zobristCastlingKeys[newCastlingRights]; // XOR in the new one
    }

    // 6. Handle castling move itself
    if (move.isCastle) {
        const rookFromC = toC === 6 ? 7 : 0;
        const rookToC = toC === 6 ? 5 : 3;
        const rook = newBoard[fromR][rookFromC];
        newBoard[fromR][rookFromC] = '';
        newBoard[fromR][rookToC] = rook;
        newHash ^= zobristKeys[pieceMap.indexOf(rook)][fromR * 8 + rookFromC];
        newHash ^= zobristKeys[pieceMap.indexOf(rook)][fromR * 8 + rookToC];
    }
    
    const newKingPos = { ...kingPos };
    if (piece.toLowerCase() === 'k') {
        newKingPos[turn] = { r: toR, c: toC };
    }
    
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