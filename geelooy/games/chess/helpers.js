/*B"H*/
importScripts("bitboard-helpers.js");

/*B"H*/
const GNOSIS_UNIVERSE_MASK = 0xffffffffffffffffn;

/*B"H*/
function validateGnosticSeal(state, location) {
    if (!state || !state.pieceBitboards || !state.occupancies) {
        console.error(`%c[FATAL SEAL BREACH] The Gnostic Guardian was asked to validate a NON-EXISTENT or MALFORMED REALITY at [${location}].`, "color: #ff0000; font-weight: bold; font-size: 1.2em;");
        throw new TypeError(`Gnostic Seal Breach: State object is null, undefined, or malformed at ${location}.`);
    }
    for (let i = 0; i < state.pieceBitboards.length; i++) {
        if (typeof state.pieceBitboards[i] !== 'bigint') {
            console.error(`%c[FATAL SEAL BREACH] A SCHISM IN REALITY! At [${location}], the bitboard for piece index ${i} (${pieceMap[i] || 'unknown'}) was found to be a [${typeof state.pieceBitboards[i]}] instead of the sacred 'bigint'.`, "color: #ff0000; font-weight: bold; font-size: 1.2em;");
            throw new TypeError(`Gnostic Seal Breach at ${location}: Bitboard for piece ${pieceMap[i] || 'unknown'} is not a BigInt.`);
        }
    }
    for (let i = 0; i < state.occupancies.length; i++) {
        const occName = i === 0 ? 'WHITE' : i === 1 ? 'BLACK' : 'COMBINED';
        if (typeof state.occupancies[i] !== 'bigint') {
            console.error(`%c[FATAL SEAL BREACH] A SCHISM IN REALITY! At [${location}], the occupancy bitboard for [${occName}] was found to be a [${typeof state.occupancies[i]}] instead of the sacred 'bigint'.`, "color: #ff0000; font-weight: bold; font-size: 1.2em;");
            throw new TypeError(`Gnostic Seal Breach at ${location}: Occupancy bitboard ${occName} is not a BigInt.`);
        }
    }
}

function calculateZobristHash(state) {
    let hash = 0n;
    for (let p = 0; p < 12; p++) {
        let piece_bb = state.pieceBitboards[p];
        while (piece_bb > 0n) {
            const sq = getLSBIndex(piece_bb);
            hash ^= zobristPieceKeys[p][sq];
            piece_bb = popBit(piece_bb);
        }
    }
    if (state.enpassant !== -1) {
        hash ^= zobristEnpassantKeys[state.enpassant];
    }
    hash ^= zobristCastlingKeys[state.castling];
    if (state.turn === BLACK) {
        hash ^= zobristTurnKey;
    }
    return hash;
}

const castling_rights = [
    7, 15, 15, 15,  3, 15, 15, 11, 15, 15, 15, 15, 15, 15, 15, 15,
   15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
   15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
   15, 15, 15, 15, 15, 15, 15, 15, 13, 15, 15, 15, 12, 15, 15, 14
];
let moveStack = Array(1024).fill(0), moveStackPtr = 0;

function createGameState(fen) {
    const state = {
        pieceBitboards: Array(12).fill(0n),
        occupancies: Array(3).fill(0n),
        turn: WHITE, enpassant: -1, castling: 0, zobristHash: 0n
    };
    if (!fen || typeof fen !== 'string') return state;
    
    const parts = fen.split(' ');
    let r = 0, f = 0;
    for (const c of parts[0]) {
        if (c === '/') { r++; f = 0; }
        else if (/\d/.test(c)) f += parseInt(c);
        else { state.pieceBitboards[pieceMap.indexOf(c)] |= (1n << BigInt(r * 8 + f)); f++; }
    }
    for(let p = P; p <= K; p++) {
        state.occupancies[WHITE] |= state.pieceBitboards[p];
        state.occupancies[BLACK] |= state.pieceBitboards[p + 6];
    }
    state.occupancies[2] = state.occupancies[WHITE] | state.occupancies[BLACK];
    state.turn = (parts[1] === 'w') ? WHITE : BLACK;
    if (parts[2].includes('K')) state.castling |= WKCA; if (parts[2].includes('Q')) state.castling |= WQCA;
    if (parts[2].includes('k')) state.castling |= BKCA; if (parts[2].includes('q')) state.castling |= BQCA;
    if (parts[3] !== '-') state.enpassant = (8 - parseInt(parts[3][1])) * 8 + (parts[3].charCodeAt(0) - 'a'.charCodeAt(0));
    
    if (zobristTurnKey !== 0n) state.zobristHash = calculateZobristHash(state);
    
    validateGnosticSeal(state, 'createGameState');
    return state;
}

function getPieceTypeOnSquare(state, sq, side) {
    const t = 1n << BigInt(sq);
    const b_offset = side * 6;
    if (state.pieceBitboards[b_offset + P] & t) return P;
    if (state.pieceBitboards[b_offset + N] & t) return N;
    if (state.pieceBitboards[b_offset + B] & t) return B;
    if (state.pieceBitboards[b_offset + R] & t) return R;
    if (state.pieceBitboards[b_offset + Q] & t) return Q;
    if (state.pieceBitboards[b_offset + K] & t) return K;
    return null;
}

const encodeMove=(f,t,p,pr,c,d,ep,ca)=>(f)|(t<<6)|(p<<12)|(pr<<16)|(c<<20)|(d<<21)|(ep<<22)|(ca<<23);
const getMoveFrom=(m)=>(m&0x3f);
const getMoveTo=(m)=>((m>>6)&0x3f);
const getMovePiece=(m)=>((m>>12)&0xf);
const getMovePromoted=(m)=>((m>>16)&0xf);
const getMoveCapture=(m)=>((m>>20)&1);
const getMoveDouble=(m)=>((m>>21)&1);
const getMoveEnpassant=(m)=>((m>>22)&1);
const getMoveCastling=(m)=>((m>>23)&1);

function makeMove(state, move) {
    validateGnosticSeal(state, 'makeMove (start)');
    
    const from = getMoveFrom(move), to = getMoveTo(move), piece = getMovePiece(move), promoted = getMovePromoted(move);
    const side = state.turn, enemy = side ^ 1, from_bb = 1n << BigInt(from), to_bb = 1n << BigInt(to);
    
    // Push the state onto the stack for unmaking the move later.
    moveStack[moveStackPtr++] = { move, castling: state.castling, enpassant: state.enpassant, capturedPiece: null, zobristHash: state.zobristHash };
    
    // --- SANCTIFIED ORDER OF OPERATIONS ---

    // 1. Remove the attacking piece from its original square.
    state.pieceBitboards[side * 6 + piece] ^= from_bb;
    state.occupancies[side] ^= from_bb;

    // 2. Handle captures BEFORE placing the attacking piece.
    if (getMoveCapture(move)) {
        if (getMoveEnpassant(move)) {
            const capSq = (side === WHITE) ? to + 8 : to - 8;
            const cap_bb = 1n << BigInt(capSq);
            moveStack[moveStackPtr - 1].capturedPiece = P; // En passant always captures a pawn.
            
            state.pieceBitboards[enemy * 6 + P] ^= cap_bb;
            state.occupancies[enemy] ^= cap_bb;
        } else {
            const capturedPieceType = getPieceTypeOnSquare(state, to, enemy);
            if (capturedPieceType === null) {
                // This is the CRITICAL paradox check.
                throw new Error(`CRITICAL PARADOX in makeMove: Capture flag is set but no piece found at square ${to}`);
            }
            moveStack[moveStackPtr - 1].capturedPiece = capturedPieceType;
            
            state.pieceBitboards[enemy * 6 + capturedPieceType] ^= to_bb;
            state.occupancies[enemy] ^= to_bb;
        }
    }

    // 3. Place the attacking piece on its new square.
    state.pieceBitboards[side * 6 + piece] ^= to_bb;
    state.occupancies[side] ^= to_bb;

    // 4. Handle promotions.
    if (promoted) {
        state.pieceBitboards[side * 6 + P] ^= to_bb; // Remove the pawn from the promotion square.
        state.pieceBitboards[side * 6 + promoted] ^= to_bb; // Add the promoted piece.
    }

    // 5. Handle castling rook moves.
    if (getMoveCastling(move)) {
        let rf, rt;
        if(to===62){rf=63;rt=61;}else if(to===58){rf=56;rt=59;}
        else if(to===6){rf=7;rt=5;}else{rf=0;rt=3;}
        const rook_move_mask = (1n << BigInt(rf)) | (1n << BigInt(rt));
        state.pieceBitboards[side*6+R] ^= rook_move_mask;
        state.occupancies[side] ^= rook_move_mask;
    }
    
    // 6. Update remaining game state variables.
    state.occupancies[2] = state.occupancies[WHITE] | state.occupancies[BLACK];
    state.castling &= castling_rights[from] & castling_rights[to];
    state.enpassant = getMoveDouble(move) ? (side === WHITE ? from - 8 : from + 8) : -1;
    state.turn ^= 1;
    state.zobristHash = calculateZobristHash(state);
    
    validateGnosticSeal(state, 'makeMove (end)');
}

function unmakeMove(state) {
    validateGnosticSeal(state, 'unmakeMove (start)');
    const info = moveStack[--moveStackPtr];
    const { move } = info;
    
    // Immediately revert to the previous player's turn.
    state.turn ^= 1;

    const from = getMoveFrom(move), to = getMoveTo(move), piece = getMovePiece(move), promoted = getMovePromoted(move);
    const side = state.turn, enemy = side ^ 1, from_bb = 1n << BigInt(from), to_bb = 1n << BigInt(to);

    // --- REVERSE ORDER OF OPERATIONS ---
    
    // 1. Handle castling rook moves.
    if (getMoveCastling(move)) {
        let rf, rt;
        if(to===62){rf=63;rt=61;}else if(to===58){rf=56;rt=59;}
        else if(to===6){rf=7;rt=5;}else{rf=0;rt=3;}
        const rook_move_mask = (1n << BigInt(rf)) | (1n << BigInt(rt));
        state.pieceBitboards[side*6+R] ^= rook_move_mask;
        state.occupancies[side] ^= rook_move_mask;
    }

    // 2. Handle promotions.
    if (promoted) {
        state.pieceBitboards[side * 6 + promoted] ^= to_bb; // Remove the promoted piece.
        state.pieceBitboards[side * 6 + P] ^= to_bb; // Restore the pawn.
    }
    
    // 3. Move the attacking piece back to its original square.
    state.pieceBitboards[side * 6 + piece] ^= (from_bb | to_bb);
    state.occupancies[side] ^= (from_bb | to_bb);

    // 4. Restore captured piece.
    if (getMoveCapture(move)) {
        if (getMoveEnpassant(move)) {
            const capSq = (side === WHITE) ? to + 8 : to - 8;
            const cap_bb = 1n << BigInt(capSq);
            state.pieceBitboards[enemy * 6 + P] ^= cap_bb;
            state.occupancies[enemy] ^= cap_bb;
        } else {
            state.pieceBitboards[enemy * 6 + info.capturedPiece] ^= to_bb;
            state.occupancies[enemy] ^= to_bb;
        }
    }
    
    // 5. Restore all other state variables from the stack.
    state.occupancies[2] = state.occupancies[WHITE] | state.occupancies[BLACK];
    state.castling = info.castling;
    state.enpassant = info.enpassant;
    state.zobristHash = info.zobristHash;

    validateGnosticSeal(state, 'unmakeMove (end)');
}

function generateMoves(state) {
    validateGnosticSeal(state, 'generateMoves');
    const moves = [];
    const side = state.turn, enemy = side ^ 1, blockers = state.occupancies[2];
    const friendly = state.occupancies[side];
    const validTargetSquares = GNOSIS_UNIVERSE_MASK ^ friendly;
    const validCaptureSquares = state.occupancies[enemy];

    let pawns = state.pieceBitboards[side*6+P];
    while (pawns > 0n) {
        const from=getLSBIndex(pawns); const rank=Math.floor(from/8);
        const promRank=(side===WHITE)?1:6; const startRank=(side===WHITE)?6:1;
        const one=(side===WHITE)?from-8:from+8;
        if (!((blockers>>BigInt(one))&1n)) {
            if (rank===promRank) { for(const p_type of [Q,R,B,N]) moves.push(encodeMove(from,one,P,p_type,0,0,0,0)); }
            else {
                moves.push(encodeMove(from,one,P,0,0,0,0,0));
                const two=(side===WHITE)?from-16:from+16;
                if(rank===startRank&&!((blockers>>BigInt(two))&1n)) moves.push(encodeMove(from,two,P,0,0,1,0,0));
            }
        }
        let attacks=PAWN_ATTACKS[side][from]&validCaptureSquares;
        while(attacks>0n){
            const to=getLSBIndex(attacks);
            if(rank===promRank){for(const p_type of [Q,R,B,N])moves.push(encodeMove(from,to,P,p_type,1,0,0,0));}
            else{moves.push(encodeMove(from,to,P,0,1,0,0,0));}
            attacks=popBit(attacks);
        }
        if(state.enpassant!==-1&&(PAWN_ATTACKS[side][from]&(1n<<BigInt(state.enpassant)))) moves.push(encodeMove(from,state.enpassant,P,0,1,0,1,0));
        pawns=popBit(pawns);
    }
    
    if (side === WHITE) {
        if((state.castling&WKCA)&&!((blockers>>61n)&3n)&&!isSquareAttacked_lean(state,60,BLACK)&&!isSquareAttacked_lean(state,61,BLACK)) moves.push(encodeMove(60,62,K,0,0,0,0,1));
        if((state.castling&WQCA)&&!((blockers>>57n)&7n)&&!isSquareAttacked_lean(state,60,BLACK)&&!isSquareAttacked_lean(state,59,BLACK)) moves.push(encodeMove(60,58,K,0,0,0,0,1));
    } else {
        if((state.castling&BKCA)&&!((blockers>>5n)&3n)&&!isSquareAttacked_lean(state,4,WHITE)&&!isSquareAttacked_lean(state,5,WHITE)) moves.push(encodeMove(4,6,K,0,0,0,0,1));
        if((state.castling&BQCA)&&!((blockers>>1n)&7n)&&!isSquareAttacked_lean(state,4,WHITE)&&!isSquareAttacked_lean(state,3,WHITE)) moves.push(encodeMove(4,2,K,0,0,0,0,1));
    }

    for (let p = N; p <= K; p++) {
        let bb = state.pieceBitboards[side*6+p];
        while (bb > 0n) {
            const from=getLSBIndex(bb);
            let attacks=0n;
            if (p===N) attacks=KNIGHT_ATTACKS[from]; else if (p===K) attacks=KING_ATTACKS[from];
            else if (p===B) attacks=getBishopAttacks(from,blockers); else if (p===R) attacks=getRookAttacks(from,blockers);
            else if (p===Q) attacks=getQueenAttacks(from,blockers);
            attacks &= validTargetSquares;
            while (attacks>0n){
                const to=getLSBIndex(attacks);
                const isCapture=((1n<<BigInt(to))&validCaptureSquares)?1:0;
                moves.push(encodeMove(from,to,p,0,isCapture,0,0,0));
                attacks=popBit(attacks);
            }
            bb=popBit(bb);
        }
    }
    return moves;
}

function isSquareAttacked_lean(state, sq, attackerColor) {
    if (sq < 0 || sq > 63) return false; // Failsafe for invalid square index
    const enemyColor=attackerColor^1;
    const blockers=state.occupancies[2];
    const b_offset=attackerColor*6;
    if((PAWN_ATTACKS[enemyColor][sq]&state.pieceBitboards[b_offset+P])!==0n)return true;
    if((KNIGHT_ATTACKS[sq]&state.pieceBitboards[b_offset+N])!==0n)return true;
    if((KING_ATTACKS[sq]&state.pieceBitboards[b_offset+K])!==0n)return true;
    if((getBishopAttacks(sq,blockers)&(state.pieceBitboards[b_offset+B]|state.pieceBitboards[b_offset+Q]))!==0n)return true;
    if((getRookAttacks(sq,blockers)&(state.pieceBitboards[b_offset+R]|state.pieceBitboards[b_offset+Q]))!==0n)return true;
    return false;
}

function generateTacticalMoves(state) {
    const moves = [];
    const side = state.turn, enemy = side ^ 1, blockers = state.occupancies[2];
    const captureTargets = state.occupancies[enemy];
    
    let pawns = state.pieceBitboards[side*6+P];
    while (pawns > 0n) {
        const from=getLSBIndex(pawns); const rank=Math.floor(from/8); const promRank=(side===WHITE)?1:6;
        const one=(side===WHITE)?from-8:from+8;
        if (rank===promRank&&!((blockers>>BigInt(one))&1n)) moves.push(encodeMove(from,one,P,Q,0,0,0,0));
        let attacks=PAWN_ATTACKS[side][from]&captureTargets;
        while(attacks>0n){
            const to=getLSBIndex(attacks);
            if(rank===promRank) moves.push(encodeMove(from,to,P,Q,1,0,0,0));
            else moves.push(encodeMove(from,to,P,0,1,0,0,0));
            attacks=popBit(attacks);
        }
        if(state.enpassant!==-1&&(PAWN_ATTACKS[side][from]&(1n<<BigInt(state.enpassant)))) moves.push(encodeMove(from,state.enpassant,P,0,1,0,1,0));
        pawns=popBit(pawns);
    }
    for (let p=N;p<=K;p++) {
        let bb=state.pieceBitboards[side*6+p];
        while(bb>0n){
            const from=getLSBIndex(bb);
            let attacks = (p===N)?KNIGHT_ATTACKS[from]:(p===B)?getBishopAttacks(from,blockers):(p===R)?getRookAttacks(from,blockers):(p===Q)?getQueenAttacks(from,blockers):KING_ATTACKS[from];
            attacks&=captureTargets;
            while(attacks>0n){
                moves.push(encodeMove(from,getLSBIndex(attacks),p,0,1,0,0,0));
                attacks=popBit(attacks);
            }
            bb=popBit(bb);
        }
    }
    return moves;
}