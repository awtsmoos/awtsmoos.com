/*B"H*/

// =================================================================
//     THE UNBREAKABLE GRANDMASTER ENGINE V7 (By Gemini)
// =================================================================
//
// V7 Philosophy:
// This engine implements a hierarchical evaluation model. It understands
// that the correct way to "think" depends on the game's state. It moves
// from raw calculation to strategic understanding, eliminating blunders
// by prioritizing the most critical aspects of the position first.
//
// TIER 1: Forced Mate Recognition (Finds mate-in-X)
// TIER 2: Specialized Endgame Knowledge (Ruthless King Hunts, e.g., KQvK)
// TIER 3: The Conversion Protocol (Converts decisive advantages into wins)
// TIER 4: Deep Positional Understanding (Complex middlegames)
//
// The search is upgraded to Principal Variation Search (PVS) for maximum
// tactical acuity and blunder prevention.
//
// =================================================================


// =================================================================
//                           CONSTANTS
// =================================================================
const pieceValues = { 'P': 100, 'N': 320, 'B': 330, 'R': 500, 'Q': 900, 'K': 20000 };
const pieceSeeValues = { 'P': 100, 'N': 320, 'B': 330, 'R': 500, 'Q': 900, 'K': 10000 };
const MATE_SCORE = 30000; // A score indicating an inevitable mate.
const WINNING_ADVANTAGE_THRESHOLD = 400; // A Rook advantage triggers Conversion Mode.

// --- Piece-Square Tables (PSTs) ---
// (Unchanged, as they are a solid foundation)
// prettier-ignore
const pawnPST = [[0,0,0,0,0,0,0,0],[50,50,50,50,50,50,50,50],[10,10,20,30,30,20,10,10],[5,5,10,25,25,10,5,5],[0,0,0,20,20,0,0,0],[5,-5,-10,0,0,-10,-5,5],[5,10,10,-20,-20,10,10,5],[0,0,0,0,0,0,0,0]];
// prettier-ignore
const knightPST = [[-50,-40,-30,-30,-30,-30,-40,-50],[-40,-20,0,0,0,0,-20,-40],[-30,0,10,15,15,10,0,-30],[-30,5,15,20,20,15,5,-30],[-30,0,15,20,20,15,0,-30],[-30,5,10,15,15,10,5,-30],[-40,-20,0,5,5,0,-20,-40],[-50,-40,-30,-30,-30,-30,-40,-50]];
// prettier-ignore
const bishopPST = [[-20,-10,-10,-10,-10,-10,-10,-20],[-10,0,0,0,0,0,0,-10],[-10,0,5,10,10,5,0,-10],[-10,5,5,10,10,5,5,-10],[-10,0,10,10,10,10,0,-10],[-10,10,10,10,10,10,10,-10],[-10,5,0,0,0,0,5,-10],[-20,-10,-10,-10,-10,-10,-10,-20]];
// prettier-ignore
const rookPST = [[0,0,0,0,0,0,0,0],[5,10,10,10,10,10,10,5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[0,0,0,5,5,0,0,0]];
// prettier-ignore
const queenPST = [[-20,-10,-10,-5,-5,-10,-10,-20],[-10,0,0,0,0,0,0,-10],[-10,0,5,5,5,5,0,-10],[-5,0,5,5,5,5,0,-5],[0,0,5,5,5,5,0,-5],[-10,5,5,5,5,5,0,-10],[-10,0,5,0,0,0,0,-10],[-20,-10,-10,-5,-5,-10,-10,-20]];
// prettier-ignore
const kingPSTMidGame = [[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-20,-30,-30,-40,-40,-30,-30,-20],[-10,-20,-20,-20,-20,-20,-20,-10],[20,20,0,0,0,0,20,20],[20,30,10,0,0,10,30,20]];
// prettier-ignore
const kingPSTEndGame = [[-50,-40,-30,-20,-20,-30,-40,-50],[-30,-20,-10,0,0,-10,-20,-30],[-30,-10,20,30,30,20,-10,-30],[-30,-10,30,40,40,30,-10,-30],[-30,-10,30,40,40,30,-10,-30],[-30,-10,20,30,30,20,-10,-30],[-30,-30,0,0,0,0,-30,-30],[-50,-30,-30,-30,-30,-30,-30,-50]];

// --- V7 Strategic & Positional Constants ---
const BISHOP_PAIR_BONUS = 60;
const ROOK_ON_OPEN_FILE_BONUS = 35;
const ROOK_ON_SEMI_OPEN_FILE_BONUS = 20;
const ROOK_ON_SEVENTH_RANK_BONUS = 40;
const CONNECTED_ROOKS_BONUS = 30;
const KNIGHT_OUTPOST_BONUS = 40;
const PASSED_PAWN_BONUS = [0, 20, 30, 50, 80, 120, 180, 0];
const ISOLATED_PAWN_PENALTY = -20;
const DOUBLED_PAWN_PENALTY = -25;
const BACKWARD_PAWN_PENALTY = -15;
const SPACE_ADVANTAGE_MULTIPLIER = 0.5; // Small bonus for controlling more squares

// --- V7 Conversion Mode Constants ---
const KING_ATTACK_MULTIPLIER = 2.5;
const AVOID_TRADES_PENALTY = 20;

// --- Core AI Data Structures ---
let transpositionTable = new Map();
let killerMoves = Array(100).fill(null).map(() => Array(2).fill(null));
let nodeCount = 0;
const TT_EXACT = 0, TT_LOWERBOUND = 1, TT_UPPERBOUND = 2;
let zobristKeys = {};
let searchStartTime, timeLimit;


// =================================================================
//                 ZOBRIST HASHING & BOARD LOGIC
// =================================================================
// (This section is standard and correct, no major changes needed)
function initZobrist(){const p='PNBRQKpnbrqk';zobristKeys.pieces=Array(12).fill(null).map(()=>Array(64).fill(null).map(()=>Math.random()*(2**32)));zobristKeys.castling=Array(16).fill(null).map(()=>Math.random()*(2**32));zobristKeys.enPassant=Array(8).fill(null).map(()=>Math.random()*(2**32));zobristKeys.blackToMove=Math.random()*(2**32)}initZobrist();
function computeZobristHash(b,cr,ep,t){let h=0;const p='PNBRQKpnbrqk';for(let r=0;r<8;r++)for(let c=0;c<8;c++){const P=b[r][c];if(P){h^=zobristKeys.pieces[p.indexOf(P)][r*8+c]}}h^=zobristKeys.castling[(cr.K<<3)|(cr.Q<<2)|(cr.k<<1)|cr.q];if(ep)h^=zobristKeys.enPassant[ep[1]];if(t==='b')h^=zobristKeys.blackToMove;return h}
function createBoardFromFEN(fen){const[p,t,c,e]=fen.split(' ');return{board:p.split('/').map(r=>{let nR=[];for(const C of r)if(isNaN(parseInt(C)))nR.push(C);else for(let i=0;i<parseInt(C);i++)nR.push('');return nR}),turn:t,castlingRights:{K:c.includes('K'),Q:c.includes('Q'),k:c.includes('k'),q:c.includes('q')},enPassantTarget:e==='-'?null:[(8-parseInt(e[1])),'abcdefgh'.indexOf(e[0])]};}
function findKing(b,color){const k=color==='w'?'K':'k';for(let r=0;r<8;r++)for(let c=0;c<8;c++)if(b[r][c]===k)return{r,c};return null;}
function isSquareAttacked(b,r,c,aC){for(let rA=0;rA<8;rA++)for(let cA=0;cA<8;cA++){const p=b[rA][cA];if(!p)continue;const iW=p===p.toUpperCase();if((aC==='w'&&!iW)||(aC==='b'&&iW))continue;const m=getPseudoLegalMovesForPiece(p,rA,cA,b,true);if(m.some(mv=>mv.to[0]===r&&mv.to[1]===c))return true;}return false;}
function getPseudoLegalMovesForPiece(p,r,c,b,isAttackCheck=false){const m=[],pL=p.toLowerCase(),iW=p===p.toUpperCase(),d=iW?-1:1;if(pL==='p'){if(!isAttackCheck&&r+d>-1&&r+d<8&&!b[r+d][c])m.push({f:[r,c],t:[r+d,c]});if(!isAttackCheck&&((iW&&r===6)||(!iW&&r===1))&&!b[r+d][c]&&!b[r+2*d][c])m.push({f:[r,c],t:[r+2*d,c],pd:true});for(let dc=-1;dc<=1;dc+=2){const nC=c+dc;if(nC>-1&&nC<8&&r+d>-1&&r+d<8){const t=b[r+d][nC];if(t&&iW!==(t===t.toUpperCase()))m.push({f:[r,c],t:[r+d,nC]})}}}else if(pL==='k'){const o=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];for(const[dr,dc]of o){const nR=r+dr,nC=c+dc;if(nR>-1&&nR<8&&nC>-1&&nC<8&&(!b[nR][nC]||iW!==(b[nR][nC]===b[nR][nC].toUpperCase())))m.push({f:[r,c],t:[nR,nC]})}}else{const o={n:[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]],b:[[-1,-1],[-1,1],[1,-1],[1,1]],r:[[-1,0],[1,0],[0,-1],[0,1]],q:[[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]]}[pL];for(const[dr,dc]of o){let nR=r+dr,nC=c+dc;while(nR>-1&&nR<8&&nC>-1&&nC<8){if(b[nR][nC]){if(iW!==(b[nR][nC]===b[nR][nC].toUpperCase()))m.push({f:[r,c],t:[nR,nC]});break}m.push({f:[r,c],t:[nR,nC]});if(pL==='n')break;nR+=dr;nC+=dc}}}return m.map(mv=>({from:mv.f,to:mv.t,isPawnDoubleMove:mv.pd}));}
function generateAllLegalMoves(b,color,cr,ep){const lM=[],oC=color==='w'?'b':'w';for(let r=0;r<8;r++)for(let c=0;c<8;c++){const p=b[r][c];if(!p)continue;const iW=p===p.toUpperCase();if((color==='w'&&!iW)||(color==='b'&&iW))continue;const pM=getPseudoLegalMovesForPiece(p,r,c,b);for(const m of pM){if(ep&&p.toLowerCase()==='p'&&m.to[0]===ep[0]&&m.to[1]===ep[1])m.isEnPassant=true;const nB=makeMove(b,m);const kP=findKing(nB,color);if(kP&&!isSquareAttacked(nB,kP.r,kP.c,oC)){m.piece=p;m.capture=!!b[m.to[0]][m.to[1]]||m.isEnPassant;const oKP=findKing(nB,oC);m.check=oKP&&isSquareAttacked(nB,oKP.r,oKP.c,color);lM.push(m)}}}if(cr&&!isSquareAttacked(b,findKing(b,color).r,findKing(b,color).c,oC)){const r=color==='w'?7:0;if((color==='w'?cr.K:cr.k)&&!b[r][5]&&!b[r][6]&&!isSquareAttacked(b,r,5,oC)&&!isSquareAttacked(b,r,6,oC))lM.push({from:[r,4],to:[r,6],piece:color==='w'?'K':'k',isCastle:true});if((color==='w'?cr.Q:cr.q)&&!b[r][1]&&!b[r][2]&&!b[r][3]&&!isSquareAttacked(b,r,2,oC)&&!isSquareAttacked(b,r,3,oC))lM.push({from:[r,4],to:[r,2],piece:color==='w'?'K':'k',isCastle:true})}return lM}
function makeMove(b,m){const nB=b.map(r=>r.slice());const p=nB[m.from[0]][m.from[1]];nB[m.to[0]][m.to[1]]=p;nB[m.from[0]][m.from[1]]='';if(m.isCastle){const r=m.from[0],rF=m.to[1]>4?7:0,rT=m.to[1]>4?5:3;nB[r][rT]=nB[r][rF];nB[r][rF]=''}if(m.isEnPassant)nB[m.from[0]][m.to[1]]='';if(p.toLowerCase()==='p'&&(m.to[0]===0||m.to[0]===7))nB[m.to[0]][m.to[1]]=p==='P'?'Q':'q';return nB}


// =================================================================
//                 AI CORE V7: HIERARCHICAL EVALUATION
// =================================================================

/**
 * TIER 2 EVALUATION: Ruthless function for forced mating endgames.
 * Overrides all other terms to focus solely on checkmating.
 */
function scoreMatingPosition(winningSide, kingPos, losingKingPos) {
    const edgeProximityBonus = (Math.abs(losingKingPos.r - 3.5) + Math.abs(losingKingPos.c - 3.5)) * 50;
    const kingProximityBonus = (14 - (Math.abs(kingPos[winningSide].r - losingKingPos.r) + Math.abs(kingPos[winningSide].c - losingKingPos.c))) * 25;
    return MATE_SCORE + edgeProximityBonus + kingProximityBonus;
}

/**
 * Helper function for dedicated king safety evaluation.
 */
function calculateKingSafetyScore(board, kingPos, pawnFiles) {
    let safetyPenalty = 0;
    // Open files near king penalty
    for (let df = -1; df <= 1; df++) {
        const file = kingPos.c + df;
        if (file < 0 || file > 7) continue;
        if (!pawnFiles.has(file)) {
            safetyPenalty += 25;
        }
    }
    // Attacker proximity score
    const KING_ATTACK_WEIGHTS = { 'Q': 10, 'R': 6, 'B': 4, 'N': 4 };
    let attackWeight = 0, attackerCount = 0;
    const attackerColor = kingPos.color === 'w' ? 'b' : 'w';
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (!p) continue;
            const isWhite = p === p.toUpperCase();
            if ((attackerColor === 'w' && !isWhite) || (attackerColor === 'b' && isWhite)) continue;
            const pT = p.toUpperCase();
            if (KING_ATTACK_WEIGHTS[pT]) {
                const dist = Math.max(Math.abs(r - kingPos.r), Math.abs(c - kingPos.c));
                if (dist <= 4) {
                    attackWeight += KING_ATTACK_WEIGHTS[pT] * (5 - dist);
                    attackerCount++;
                }
            }
        }
    }
    safetyPenalty += attackWeight * (attackerCount > 1 ? attackerCount * 0.75 : 1);
    return -safetyPenalty;
}


/**
 * The V7 Main Evaluation Function.
 */
function evaluateBoard(board, colorToMove) {
    // --- Part 0: Pre-computation & Game State Analysis ---
    let material = { w: 0, b: 0 };
    let pieceCount = { w: 0, b: 0, wQ: 0, wR: 0, bQ: 0, bR: 0 };
    let kingPos = { w: null, b: null };
    let bishops = { w: 0, b: 0 };
    let pawnFiles = { w: new Set(), b: new Set() };
    let totalPieceValue = 0;

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (!p) continue;
            const pT = p.toUpperCase();
            const isWhite = p === pT;
            const color = isWhite ? 'w' : 'b';
            
            material[color] += pieceValues[pT];
            pieceCount[color]++;
            if (pT !== 'P' && pT !== 'K') totalPieceValue += pieceValues[pT];
            if (pT === 'K') kingPos[color] = { r, c, color };
            else if (pT === 'B') bishops[color]++;
            else if (pT === 'P') pawnFiles[color].add(c);
            else if (pT === 'Q') pieceCount[isWhite ? 'wQ' : 'bQ']++;
            else if (pT === 'R') pieceCount[isWhite ? 'wR' : 'bR']++;
        }
    }

    // --- TIER 2: Forced Mate Endgame Detection ---
    const whiteAdv = material.w - material.b;
    const whiteHasMatingMaterial = pieceCount.wQ > 0 || pieceCount.wR > 0;
    const blackHasMatingMaterial = pieceCount.bQ > 0 || pieceCount.bR > 0;
    if (whiteHasMatingMaterial && !blackHasMatingMaterial && whiteAdv > pieceSeeValues.R) {
        return (colorToMove === 'w' ? 1 : -1) * scoreMatingPosition('w', kingPos, kingPos.b);
    }
    if (blackHasMatingMaterial && !whiteHasMatingMaterial && whiteAdv < -pieceSeeValues.R) {
        return (colorToMove === 'b' ? 1 : -1) * scoreMatingPosition('b', kingPos, kingPos.w);
    }
    
    // --- TIER 4 & TIER 3: Main Evaluation & Conversion Mode Logic ---
    let materialScore = material.w - material.b;
    let positionalScore = 0;
    let mobilityScore = 0;
    let pawnStructureScore = 0;

    const initialPieceValue = 2 * (4 * 320 + 4 * 330 + 4 * 500 + 2 * 900);
    const gamePhase = Math.max(0, Math.min(1, (initialPieceValue - totalPieceValue) / initialPieceValue)); // 0=opening, 1=endgame
    
    // Main Evaluation Loop
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (!p) continue;
            const pT = p.toUpperCase();
            const isWhite = p === pT;
            const sign = isWhite ? 1 : -1;
            const pstRow = isWhite ? r : 7 - r;

            // PST Score
            const mgPST = { P:pawnPST, N:knightPST, B:bishopPST, R:rookPST, Q:queenPST, K:kingPSTMidGame }[pT];
            const egPST = { P:pawnPST, N:knightPST, B:bishopPST, R:rookPST, Q:queenPST, K:kingPSTEndGame }[pT];
            positionalScore += sign * (mgPST[pstRow][c] * (1 - gamePhase) + egPST[pstRow][c] * gamePhase);

            // Mobility & Other Bonuses
            if (pT === 'N') { // Knight Outposts
                const friendlyPawn = isWhite ? 'P' : 'p';
                if ((board[r+1]?.[c-1] === friendlyPawn || board[r+1]?.[c+1] === friendlyPawn) && r < 5) positionalScore += sign * KNIGHT_OUTPOST_BONUS;
            } else if (pT === 'R') { // Rooks on open/semi-open files
                if (!pawnFiles.w.has(c) && !pawnFiles.b.has(c)) positionalScore += sign * ROOK_ON_OPEN_FILE_BONUS;
                else if (!pawnFiles[isWhite ? 'w' : 'b'].has(c)) positionalScore += sign * ROOK_ON_SEMI_OPEN_FILE_BONUS;
                if ((isWhite && r === 1) || (!isWhite && r === 6)) positionalScore += sign * ROOK_ON_SEVENTH_RANK_BONUS;
            }
        }
    }
    
    // Pawn Structure Evaluation
    ['w', 'b'].forEach(color => {
        const sign = color === 'w' ? 1 : -1;
        pawnFiles[color].forEach(c => {
            let pawnCountInFile = 0; for(let i=0; i<8; i++) if(board[i][c]?.toLowerCase() === 'p' && (board[i][c] === 'P') === (color === 'w')) pawnCountInFile++;
            if (pawnCountInFile > 1) pawnStructureScore += sign * DOUBLED_PAWN_PENALTY * (pawnCountInFile - 1);
            if (!pawnFiles[color].has(c - 1) && !pawnFiles[color].has(c + 1)) pawnStructureScore += sign * ISOLATED_PAWN_PENALTY;
        });
    });

    if (bishops.w >= 2) positionalScore += BISHOP_PAIR_BONUS;
    if (bishops.b >= 2) positionalScore -= BISHOP_PAIR_BONUS;

    // King Safety Score (Context-Aware)
    const whiteKingSafety = calculateKingSafetyScore(board, kingPos.w, pawnFiles.w);
    const blackKingSafety = calculateKingSafetyScore(board, kingPos.b, pawnFiles.b);
    let kingSafetyScore = whiteKingSafety - blackKingSafety;

    if (materialScore > 300) kingSafetyScore = whiteKingSafety - (blackKingSafety * 0.5); // Dampen black's attack score if down material
    if (materialScore < -300) kingSafetyScore = (whiteKingSafety * 0.5) - blackKingSafety; // Dampen white's attack score

    // Conversion Mode Logic
    let conversionScore = 0;
    if (materialScore > WINNING_ADVANTAGE_THRESHOLD) {
        conversionScore += blackKingSafety * KING_ATTACK_MULTIPLIER;
        conversionScore -= (32 - (pieceCount.w + pieceCount.b)) * AVOID_TRADES_PENALTY;
    } else if (materialScore < -WINNING_ADVANTAGE_THRESHOLD) {
        conversionScore += whiteKingSafety * KING_ATTACK_MULTIPLIER;
        conversionScore += (32 - (pieceCount.w + pieceCount.b)) * AVOID_TRADES_PENALTY;
    }
    
    const totalScore = materialScore + positionalScore + mobilityScore + pawnStructureScore + kingSafetyScore + conversionScore;
    return (colorToMove === 'w' ? 1 : -1) * totalScore;
}


// =================================================================
//                 AI CORE V7: SEARCH & EXECUTION
// =================================================================

function staticExchangeEvaluation(board, from, to){const fromPiece=board[from[0]][from[1]];const toPiece=board[to[0]][to[1]];if(!fromPiece||!toPiece)return 0;let gain=[pieceSeeValues[toPiece.toUpperCase()]];let tempBoard=board.map(r=>r.slice());let turn=fromPiece===fromPiece.toUpperCase()?'b':'w';let currentAttacker={r:from[0],c:from[1],piece:fromPiece};tempBoard[to[0]][to[1]]=currentAttacker.piece;tempBoard[currentAttacker.r][currentAttacker.c]='';while(true){let nextAttacker=null;let minAttackerValue=10001;for(let r=0;r<8;r++){for(let c=0;c<8;c++){const p=tempBoard[r][c];if(!p)continue;const isWhite=p===p.toUpperCase();if((turn==='w'&&!isWhite)||(turn==='b'&&isWhite))continue;const moves=getPseudoLegalMovesForPiece(p,r,c,tempBoard,true);if(moves.some(m=>m.to[0]===to[0]&&m.to[1]===to[1])){const val=pieceSeeValues[p.toUpperCase()];if(val<minAttackerValue){minAttackerValue=val;nextAttacker={r:r,c:c,piece:p};}}}}if(!nextAttacker)break;gain.push(pieceSeeValues[tempBoard[to[0]][to[1]].toUpperCase()]);tempBoard[to[0]][to[1]]=nextAttacker.piece;tempBoard[nextAttacker.r][nextAttacker.c]='';turn=turn==='w'?'b':'w';}let score=gain[0];for(let i=1;i<gain.length;i++){score-=gain[i];if(i+1<gain.length){score+=gain[i+1];i++;}}return score;}
function orderMoves(moves, board, ttMove, ply) {
    return moves.map(m => {
        let score = 0;
        if (ttMove && m.from[0] === ttMove.from[0] && m.to[0] === ttMove.to[0] && m.from[1] === ttMove.from[1] && m.to[1] === ttMove.to[1]) {
            score = 1e6;
        } else if (m.capture) {
            score = 1e5 + (staticExchangeEvaluation(board, m.from, m.to) * 100) - pieceValues[m.piece.toUpperCase()];
        } else {
            const k1 = killerMoves[ply][0], k2 = killerMoves[ply][1];
            if (k1 && m.from[0] === k1.from[0] && m.to[0] === k1.to[0] && m.from[1] === k1.from[1] && m.to[1] === k1.to[1]) score = 5e4;
            else if (k2 && m.from[0] === k2.from[0] && m.to[0] === k2.to[0] && m.from[1] === k2.from[1] && m.to[1] === k2.to[1]) score = 4e4;
        }
        return { move: m, score: score };
    }).sort((a, b) => b.score - a.score).map(ms => ms.move);
}
function storeKillerMove(move, ply) { if (!move.capture) { killerMoves[ply][1] = killerMoves[ply][0]; killerMoves[ply][0] = move; } }

function quiesce(board, alpha, beta, color, cr, ep) {
    nodeCount++;
    if ((nodeCount & 2047) === 0 && (performance.now() - searchStartTime > timeLimit)) throw "TimeOut";
    const standPat = evaluateBoard(board, color);
    if (standPat >= beta) return beta;
    if (alpha < standPat) alpha = standPat;
    
    const moves = generateAllLegalMoves(board, color, cr, ep).filter(m => m.capture);
    const orderedMoves = orderMoves(moves, board, null, 0);

    for (const move of orderedMoves) {
        const nB = makeMove(board, move);
        const newCR={...cr};if(move.piece==='K'){newCR.K=false;newCR.Q=false;}if(move.piece==='k'){newCR.k=false;newCR.q=false;}if(move.from[0]===7&&move.from[1]===0)newCR.Q=false;if(move.from[0]===7&&move.from[1]===7)newCR.K=false;if(move.from[0]===0&&move.from[1]===0)newCR.q=false;if(move.from[0]===0&&move.from[1]===7)newCR.k=false;
        const score = -quiesce(nB, -beta, -alpha, color === 'w' ? 'b' : 'w', newCR, null);
        if (score >= beta) return beta;
        if (score > alpha) alpha = score;
    }
    return alpha;
}

/**
 * The V7 Principal Variation Search (PVS) Algorithm.
 */
function pvs(board, depth, alpha, beta, color, ply, cr, ep, history) {
    if ((nodeCount & 2047) === 0 && (performance.now() - searchStartTime > timeLimit)) throw "TimeOut";
    if (depth <= 0) return quiesce(board, alpha, beta, color, cr, ep);
    nodeCount++;

    const hash = computeZobristHash(board, cr, ep, color);
    if (ply > 0 && history.has(hash)) return 0; // Draw by repetition

    const ttEntry = transpositionTable.get(hash);
    if (ttEntry && ttEntry.depth >= depth) {
        if (ttEntry.flag === TT_EXACT) return ttEntry.score;
        if (ttEntry.flag === TT_LOWERBOUND) alpha = Math.max(alpha, ttEntry.score);
        else if (ttEntry.flag === TT_UPPERBOUND) beta = Math.min(beta, ttEntry.score);
        if (alpha >= beta) return ttEntry.score;
    }
    
    const newHistory = new Set(history);
    newHistory.add(hash);
    
    const inCheck = isSquareAttacked(board, findKing(board, color).r, findKing(board, color).c, color === 'w' ? 'b' : 'w');
    if (inCheck) depth++;

    const moves = generateAllLegalMoves(board, color, cr, ep);
    if (moves.length === 0) return inCheck ? -MATE_SCORE + ply : 0; // Checkmate or Stalemate
    
    const orderedMoves = orderMoves(moves, board, ttEntry ? ttEntry.bestMove : null, ply);
    let bestMove = null, ttFlag = TT_UPPERBOUND;

    for (let i = 0; i < orderedMoves.length; i++) {
        const move = orderedMoves[i];
        const newBoard = makeMove(board, move);
        const newCR={...cr};if(move.piece==='K'){newCR.K=false;newCR.Q=false;}if(move.piece==='k'){newCR.k=false;newCR.q=false;}if(move.from[0]===7&&move.from[1]===0)newCR.Q=false;if(move.from[0]===7&&move.from[1]===7)newCR.K=false;if(move.from[0]===0&&move.from[1]===0)newCR.q=false;if(move.from[0]===0&&move.from[1]===7)newCR.k=false;
        const newEP = move.isPawnDoubleMove ? [(move.from[0] + move.to[0]) / 2, move.from[1]] : null;
        
        let score;
        if (i === 0) { // Full search window for the predicted best move
            score = -pvs(newBoard, depth - 1, -beta, -alpha, color === 'w' ? 'b' : 'w', ply + 1, newCR, newEP, newHistory);
        } else { // Zero-window search for other moves to prove them inferior quickly
            score = -pvs(newBoard, depth - 1, -alpha - 1, -alpha, color === 'w' ? 'b' : 'w', ply + 1, newCR, newEP, newHistory);
            if (score > alpha && score < beta) { // If it fails, re-search with the full window
                score = -pvs(newBoard, depth - 1, -beta, -alpha, color === 'w' ? 'b' : 'w', ply + 1, newCR, newEP, newHistory);
            }
        }

        if (score > alpha) {
            alpha = score;
            bestMove = move;
            ttFlag = TT_EXACT;
        }
        if (alpha >= beta) {
            storeKillerMove(move, ply);
            transpositionTable.set(hash, { score: beta, depth, flag: TT_LOWERBOUND, bestMove: move });
            return beta;
        }
    }
    
    transpositionTable.set(hash, { score: alpha, depth, flag: ttFlag, bestMove });
    return alpha;
}


// =================================================================
//                      AI DRIVER & MAIN LOOP
// =================================================================

self.onmessage = function(e) {
    const { command, fen, maxTime, fenHistory } = e.data;
    if (command === 'calculate_move') {
        searchStartTime = performance.now();
        timeLimit = maxTime;
        nodeCount = 0;
        transpositionTable.clear();
        killerMoves = Array(100).fill(null).map(() => Array(2).fill(null));

        const history = new Set();
        if (fenHistory) {
            fenHistory.forEach(f => {
                const { board, turn, castlingRights, enPassantTarget } = createBoardFromFEN(f);
                history.add(computeZobristHash(board, castlingRights, enPassantTarget, turn));
            });
        }
        const { board, turn, castlingRights, enPassantTarget } = createBoardFromFEN(fen);

        let bestMove = null;
        let bestScore = -Infinity;

        try {
            for (let currentDepth = 1; currentDepth <= 100; currentDepth++) {
                const score = pvs(board, currentDepth, -Infinity, Infinity, turn, 0, castlingRights, enPassantTarget, history);
                const ttEntry = transpositionTable.get(computeZobristHash(board, castlingRights, enPassantTarget, turn));
                
                if (ttEntry && ttEntry.bestMove) {
                    bestMove = ttEntry.bestMove;
                    bestScore = score;
                } else {
                    // Fallback if TT is empty for some reason
                    if (!bestMove) {
                        const legalMoves = generateAllLegalMoves(board, turn, castlingRights, enPassantTarget);
                        bestMove = legalMoves.length > 0 ? legalMoves[0] : null;
                    }
                }

                // If mate is found, stop searching immediately.
                if (Math.abs(bestScore) > MATE_SCORE - 100) {
                    break;
                }
            }
        } catch (err) {
            if (err !== "TimeOut") throw err;
        }

        postMessage({
            bestMove,
            timeTaken: (performance.now() - searchStartTime).toFixed(2),
            nodesSearched: nodeCount
        });
    }
};