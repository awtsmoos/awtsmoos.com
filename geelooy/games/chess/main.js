/*B"H*/

// =================================================================
//         MAIN THREAD (UI/CANVAS/EVENTS - STABLE REWRITE)
// =================================================================

import { teachingsNovel } from './teachings.js';
document.addEventListener('DOMContentLoaded', () => {
	// --- DOM Element References ---
	const canvas = document.getElementById('chessCanvas');
	const canvasContext = canvas.getContext('2d');
	
	const declareDrawButton = document.getElementById('declareDrawButton');
	const runAnalysisButton = document.getElementById('runAnalysisButton');
	
	const capturedByBlackCanvas = document.getElementById('capturedByBlackCanvas');
	const capturedByWhiteCanvas = document.getElementById('capturedByWhiteCanvas');
	const capturedBlackCtx = capturedByBlackCanvas.getContext('2d');
	const capturedWhiteCtx = capturedByWhiteCanvas.getContext('2d');
	
	const messageDiv = document.getElementById('message');
	const mainMenu = document.getElementById('mainMenu');
	const gameContainer = document.getElementById('gameContainer');
	const chessContainer = document.getElementById('chessContainer');
	const gameOverOverlay = document.getElementById('gameOverOverlay');
	const gameOverText = document.getElementById('gameOverText');
	const replayButton = document.getElementById('replayButton');
	const downloadButton = document.getElementById('downloadButton');
	const colorSelectionMenu = document.getElementById('colorSelectionMenu');
	const capturedByBlackDiv = document.getElementById('capturedByBlack');
	const capturedByWhiteDiv = document.getElementById('capturedByWhite');
	const playVsAiButton = document.getElementById('playVsAiButton');
	const playVsPlayerButton = document.getElementById('playVsPlayerButton');
	const aiVsAiButton = document.getElementById('aiVsAiButton');
	const playAsWhiteButton = document.getElementById('playAsWhiteButton');
	const playAsBlackButton = document.getElementById('playAsBlackButton');
	
	
	/* B"H */
	// --- Add these with your other DOM element references ---
	const analysisButton = document.getElementById('analysisButton');
	const analysisScreen = document.getElementById('analysisScreen');
	const analysisCanvas = document.getElementById('analysisCanvas');
	const analysisContext = analysisCanvas.getContext('2d');
	const loadPgnButton = document.getElementById('loadPgnButton');
	const pgnFileInput = document.getElementById('pgnFileInput');
	const analysisBackToMenuButton = document.getElementById('analysisBackToMenuButton');
	const prevMoveButton = document.getElementById('prevMoveButton');
	const nextMoveButton = document.getElementById('nextMoveButton');
	const moveListContainer = document.getElementById('moveListContainer');
	const openingNameDisplay = document.getElementById('openingNameDisplay'); // New
	
	
	const teachingsButton = document.getElementById('teachingsButton');
	const teachingsScreen = document.getElementById('teachingsScreen');
	const backToMenuButton = document.getElementById('backToMenuButton');
	const teachingsText = document.getElementById('teachingsText');
	
	
	

	// --- Constants and State ---
	/* B"H */
	const SIZE = Math.min(window.innerWidth - 20, window.innerHeight - 350, 500);
	const BOARD_PADDING = 20; // The space around the board for coordinates
	const BOARD_SIZE = SIZE - (BOARD_PADDING * 2); // The size of the playable 8x8 area
	const SQUARE_SIZE = BOARD_SIZE / 8; // The size of each square is now based on the inner board size
	
	const ENDGAME_MIN_MOVES = 40; // Don't consider it an endgame before 20 full moves (40 ply).
	const ENDGAME_PERCENTAGE_THRESHOLD = 0.7; // The last 30% of a game can be considered the endgame phase.
	
	
	let board = [];
	let gameState = {};
	const PIECE_EMOJIS = {
		'K': '👑',
		'Q': '👸',
		'R': '🏰',
		'B': '🧔',
		'N': '🐴',
		'P': '♟️'
	};
	const pieceOrder = {
		'Q': 1,
		'R': 2,
		'B': 3,
		'N': 4,
		'P': 5
	};
	
	function scrollMsg() {
    // A threshold in pixels. If the user is within this distance from the
    // bottom, we'll auto-scroll. This prevents scrolling if they have
    // intentionally scrolled up to read previous messages. A value of 50
    // is a safe buffer for a couple of lines of text.
    const scrollThreshold = 50;

    // Check if the user is already close to the bottom.
    // (Total Height - Current Scroll Position - Visible Height) < Threshold
    const isNearBottom = messageDiv.scrollHeight - messageDiv.scrollTop - messageDiv.clientHeight < scrollThreshold;

    if (isNearBottom) {
        // If they are, then auto-scroll to the very bottom to show the new message.
        messageDiv.scrollTop = messageDiv.scrollHeight;
    }
    // If they are not near the bottom, we do nothing and respect their scroll position.
}

	function resetGameState() {
		gameState = {
			gameMode: null,
			turn: 'w',
			playerColor: 'w',
			selectedSquare: null,
			legalMoves: [],
			isAnimating: false,
			isAIMoving: false,
			gameOver: false,
			moveHistory: [],
			fenHistory: [],
			pgnResult: '*',
			fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
			castlingRights: {
				K: true,
				Q: true,
				k: true,
				q: true
			},
			enPassantTarget: null,
			halfmoveClock: 0,
			fullmoveNumber: 1,
			capturedByWhite: [],
			capturedByBlack: [],
		};
	}

	// --- AI Worker ---
	const aiWorker = new Worker('awtsmoos_chess_engine.js');
	
    




/*B"H*/

/**
 * Handles all messages from the engine worker. This is the fully corrected version
 * that restores the missing initialization logic, adds definitive console logging,
 * and robustly displays diagnostic info on screen.
 */
aiWorker.onmessage = function(e) {
    const { type } = e.data;

    // Use a switch to route messages to the correct logic
    switch (type) {

        // --- Initialization Messages ---
        case 'progress':
            const { percentage } = e.data;
            const loadingText = document.getElementById('loadingText');
            const progressBarFill = document.getElementById('progressBarFill');
            if (loadingText) loadingText.textContent = `Forging Universe... ${percentage}%`;
            if (progressBarFill) progressBarFill.style.width = `${percentage}%`;
            break;

        case 'initialization_complete':
            const loadingScreen = document.getElementById('loadingScreen');
            const mainMenu = document.getElementById('mainMenu');
            if (loadingScreen) loadingScreen.style.display = 'none';
            if (mainMenu) mainMenu.style.display = 'flex';
            break;

        // --- Game Play Messages ---
        case 'move_result':
            /**
             * @description VERIFICATION STEP: Log the entire raw data object received from the worker.
             */
            console.log("MAIN THREAD: Received move_result object:", e.data);

            gameState.isAIMoving = false;
            const { bestMove, timeTaken, nodesSearched, score, evalPercent } = e.data;
            
            if (bestMove) {
                let moveSource = `Searched ${nodesSearched} nodes in ${timeTaken}ms.`;
                
                // Robustly add the evaluation percentage to the on-screen log if it exists.
                if (typeof score !== 'string' && evalPercent) {
                    moveSource += ` (Eval: ${evalPercent}%)`;
                } else if (typeof score === 'string') {
                    moveSource = score; // Handle "Book Move" text
                }
                
                messageDiv.textContent += `\nAI moved. (${moveSource})`;
                scrollMsg();

                let fullMove = gameState.legalMoves.find(m =>
                    m.from[0] === bestMove.from[0] && m.from[1] === bestMove.from[1] &&
                    m.to[0] === bestMove.to[0] && m.to[1] === bestMove.to[1]
                );

                if (!fullMove) {
                    const piece = board[bestMove.from[0]][bestMove.from[1]];
                    fullMove = { ...bestMove, piece };
                }

                animateMove(fullMove, () => {
                    if (gameState.gameMode === 'ava') {
                        startAIMove();
                    }
                });
            } else {
                updateGameStatus();
            }
            break;
            
        // --- Analysis Messages ---
        case 'analysis_result':
            handleAnalysisResult(e.data);
            break;
        case 'analysis_error':
            alert(e.data.message);
            break;
        case 'analysis_update': {
            const { index, result } = e.data;
            analysisState.classifications[index] = result;
            updateSingleMoveWithAnalysis(index, result);
            break;
        }
        case 'analysis_finished': {
            openingNameDisplay.textContent = "Analysis Complete!";
            displayAnalysisPosition(analysisState.currentMoveIndex);
            break;
        }
    }
};

	
	// --- Full Chess Rules Logic (for UI) ---
	const chessLogic = {};
	(function(logic) {
		/* This block is self-contained and correct, no changes needed */
		logic.findKing = (b, color) => {
			const k = color === 'w' ? 'K' : 'k';
			for (let r = 0; r < 8; r++)
				for (let c = 0; c < 8; c++)
					if (b[r][c] === k) return {
						r,
						c
					};
			return null;
		};
		logic.getPseudoLegalMovesForPiece = (p, r, c, b, epTarget) => {
			const m = [];
			const pL = p.toLowerCase();
			const iW = p === p.toUpperCase();
			if (pL === 'p') {
				const d = iW ? -1 : 1;
				const sR = iW ? 6 : 1;
				if (r + d >= 0 && r + d < 8) {
					if (b[r + d][c] === '') {
						m.push({
							from: [r, c],
							to: [r + d, c]
						});
						if (r === sR && b[r + 2 * d][c] === '') m.push({
							from: [r, c],
							to: [r + 2 * d, c],
							isPawnDoubleMove: true
						});
					}
					for (let dc = -1; dc <= 1; dc += 2) {
						const nC = c + dc;
						if (nC >= 0 && nC < 8) {
							const t = b[r + d][nC];
							if (t && iW !== (t === t.toUpperCase())) m.push({
								from: [r, c],
								to: [r + d, nC]
							});
							if (epTarget && r + d === epTarget[0] && nC === epTarget[1]) m.push({
								from: [r, c],
								to: [r + d, nC],
								isEnPassant: true
							});
						}
					}
				}
				return m;
			}
			if (pL === 'k') {
				const o = [
					[-1, -1],
					[-1, 0],
					[-1, 1],
					[0, -1],
					[0, 1],
					[1, -1],
					[1, 0],
					[1, 1]
				];
				for (const [dr, dc] of o) {
					const nR = r + dr,
						nC = c + dc;
					if (nR >= 0 && nR < 8 && nC >= 0 && nC < 8) {
						const t = b[nR][nC];
						if (t === '' || iW !== (t === t.toUpperCase())) m.push({
							from: [r, c],
							to: [nR, nC]
						})
					}
				}
				return m;
			}
			const o = {
				n: [
					[-2, -1],
					[-2, 1],
					[-1, -2],
					[-1, 2],
					[1, -2],
					[1, 2],
					[2, -1],
					[2, 1]
				]
			} [pL];
			if (o) {
				for (const [dr, dc] of o) {
					const nR = r + dr,
						nC = c + dc;
					if (nR >= 0 && nR < 8 && nC >= 0 && nC < 8) {
						const t = b[nR][nC];
						if (t === '' || iW !== (t === t.toUpperCase())) m.push({
							from: [r, c],
							to: [nR, nC]
						})
					}
				}
				return m;
			}
			const d = {
				b: [
					[-1, -1],
					[-1, 1],
					[1, -1],
					[1, 1]
				],
				r: [
					[-1, 0],
					[1, 0],
					[0, -1],
					[0, 1]
				],
				q: [
					[-1, -1],
					[-1, 1],
					[1, -1],
					[1, 1],
					[-1, 0],
					[1, 0],
					[0, -1],
					[0, 1]
				]
			} [pL];
			if (d) {
				for (const [dr, dc] of d) {
					let nR = r + dr,
						nC = c + dc;
					while (nR >= 0 && nR < 8 && nC >= 0 && nC < 8) {
						const t = b[nR][nC];
						if (t === '') m.push({
							from: [r, c],
							to: [nR, nC]
						});
						else {
							if (iW !== (t === t.toUpperCase())) m.push({
								from: [r, c],
								to: [nR, nC]
							});
							break;
						}
						nR += dr;
						nC += dc;
					}
				}
			}
			return m;
		};
		logic.isSquareAttacked = (b, r, c, aC) => {
			for (let rA = 0; rA < 8; rA++)
				for (let cA = 0; cA < 8; cA++) {
					const p = b[rA][cA];
					if (p === '') continue;
					const iW = p === p.toUpperCase();
					if ((aC === 'w' && !iW) || (aC === 'b' && iW)) continue;
					const m = logic.getPseudoLegalMovesForPiece(p, rA, cA, b, null);
					for (const move of m)
						if (move.to[0] === r && move.to[1] === c) {
							if (p.toLowerCase() === 'p') {
								if (move.from[1] !== c) return true
							} else {
								return true
							}
						}
				}
			return false;
		};
		logic.generateAllLegalMoves = (b, color, cr, epTarget) => {
			const lM = [];
			const oC = color === 'w' ? 'b' : 'w';
			const kingPos = logic.findKing(b, color);
			for (let r = 0; r < 8; r++)
				for (let c = 0; c < 8; c++) {
					const p = b[r][c];
					if (p === '') continue;
					const iW = p === p.toUpperCase();
					if ((color === 'w' && !iW) || (color === 'b' && iW)) continue;
					const pM = logic.getPseudoLegalMovesForPiece(p, r, c, b, epTarget);
					for (const m of pM) {
						const nB = makeMove(b, m);
						const nKingPos = (p.toLowerCase() === 'k') ? {
							r: m.to[0],
							c: m.to[1]
						} : kingPos;
						if (nKingPos && !logic.isSquareAttacked(nB, nKingPos.r, nKingPos.c, oC)) {
							m.piece = p;
							lM.push(m);
						}
					}
				}
			if (kingPos && !logic.isSquareAttacked(b, kingPos.r, kingPos.c, oC)) {
				const r = color === 'w' ? 7 : 0;
				if (cr[color === 'w' ? 'K' : 'k'] && !b[r][5] && !b[r][6] && !logic.isSquareAttacked(b, r, 5, oC) && !logic.isSquareAttacked(b, r, 6, oC)) lM.push({
					from: [r, 4],
					to: [r, 6],
					piece: color === 'w' ? 'K' : 'k',
					isCastle: true
				});
				if (cr[color === 'w' ? 'Q' : 'q'] && !b[r][1] && !b[r][2] && !b[r][3] && !logic.isSquareAttacked(b, r, 2, oC) && !logic.isSquareAttacked(b, r, 3, oC)) lM.push({
					from: [r, 4],
					to: [r, 2],
					piece: color === 'w' ? 'K' : 'k',
					isCastle: true
				});
			}
			return lM;
		};
	})(chessLogic);

	// --- Game Flow & State Management ---
	function performMove(move) {
		// Determine captured piece and augment the move object for the SAN generator
		const capturedPiece = move.isEnPassant ? (gameState.turn === 'w' ? 'p' : 'P') : board[move.to[0]][move.to[1]];
		move.capturedPiece = capturedPiece;

		// Generate the base SAN notation *before* the board state changes
		let san = getSanForMove(move, gameState.legalMoves);

		// --- Execute the move and update the board state ---
		if (capturedPiece) {
			(gameState.turn === 'w' ? gameState.capturedByWhite : gameState.capturedByBlack).push(capturedPiece);
		}
		board = makeMove(board, move);
		updateStateAfterMove(move); // This flips the turn, updates clocks etc.

		// --- Check for check/checkmate to append symbol ---
		const opponentColor = gameState.turn;
		const opponentKingPos = chessLogic.findKing(board, opponentColor);
		if (opponentKingPos && chessLogic.isSquareAttacked(board, opponentKingPos.r, opponentKingPos.c, opponentColor === 'w' ? 'b' : 'w')) {
			// The opponent is in check. Check for checkmate.
			const opponentLegalMoves = chessLogic.generateAllLegalMoves(board, opponentColor, gameState.castlingRights, gameState.enPassantTarget);
			if (opponentLegalMoves.length === 0) {
				san += '#';
			} else {
				san += '+';
			}
		}

		// --- Store the complete record in history ---
		gameState.moveHistory.push({
			move,
			piece: move.piece,
			capturedPiece,
			san // The complete and unambiguous SAN string
		});

		// --- Update UI and continue game flow ---
		drawBoard();
		drawCapturedPieces();

		const isGameOver = updateGameStatus();
		if (!isGameOver) {
			const isItAIsTurn = (gameState.gameMode === 'pva' && gameState.turn !== gameState.playerColor) || gameState.gameMode === 'ava';
			if (isItAIsTurn) {
				startAIMove();
			} else {
				messageDiv.textContent += `\n\n${gameState.turn === 'w' ? 'White' : 'Black'}'s turn.`;
				
				scrollMsg()
			
			}
		}
	}
	
	
	// Add this new function in main.js
function updateMoveListWithAnalysis() {
    const moveElements = document.querySelectorAll('.move-text-item');
    const icons = {
        brilliant: '⭐',
        good: '', // No icon for good moves to keep it clean
        mistake: '⚠️',
        blunder: '❌'
    };

    moveElements.forEach((el, index) => {
        const result = analysisState.classifications[index];
        if (result && icons[result.classification]) {
            // Ensure we don't add icons multiple times
            if (!el.querySelector('.move-icon')) {
                const iconSpan = document.createElement('span');
                iconSpan.className = 'move-icon';
                iconSpan.textContent = icons[result.classification] + ' ';
                el.prepend(iconSpan);
            }
        }
    });
}



function drawHintArrow(from, to) {
    const fromX = BOARD_PADDING + from[1] * SQUARE_SIZE + SQUARE_SIZE / 2;
    const fromY = BOARD_PADDING + from[0] * SQUARE_SIZE + SQUARE_SIZE / 2;
    const toX = BOARD_PADDING + to[1] * SQUARE_SIZE + SQUARE_SIZE / 2;
    const toY = BOARD_PADDING + to[0] * SQUARE_SIZE + SQUARE_SIZE / 2;
    
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const headlen = 28; // A larger head
    const lineWidth = 14;

    // Calculate the point where the line shaft should end (shortened)
    const shaftEndX = toX - (headlen / 2) * Math.cos(angle);
    const shaftEndY = toY - (headlen / 2) * Math.sin(angle);

    analysisContext.save();
    analysisContext.strokeStyle = 'rgba(14, 204, 53, 0.8)';
    analysisContext.fillStyle = 'rgba(14, 204, 53, 0.8)';
    analysisContext.lineWidth = lineWidth;
    analysisContext.lineCap = 'round';

    // 1. Draw the shortened line shaft
    analysisContext.beginPath();
    analysisContext.moveTo(fromX, fromY);
    analysisContext.lineTo(shaftEndX, shaftEndY);
    analysisContext.stroke();

    // 2. Draw a wider arrowhead at the very end
    analysisContext.beginPath();
    analysisContext.moveTo(toX, toY);
    // Use a wider angle (PI/5) for a fatter arrowhead
    analysisContext.lineTo(toX - headlen * Math.cos(angle - Math.PI / 5), toY - headlen * Math.sin(angle - Math.PI / 5));
    analysisContext.lineTo(toX - headlen * Math.cos(angle + Math.PI / 5), toY - headlen * Math.sin(angle + Math.PI / 5));
    analysisContext.closePath();
    analysisContext.fill();
    
    analysisContext.restore();
}

// 
function drawAnalysisBoard() {
    analysisCanvas.width = SIZE;
    analysisCanvas.height = SIZE;
    const fen = analysisState.boardHistory[analysisState.currentMoveIndex + 1];
    if (!fen) return; 
    
    const boardData = getBoardFromFen(fen);

    // --- Draw Coordinates and Board (No changes here) ---
    analysisContext.fillStyle = '#c7c7c7';
    analysisContext.font = 'bold 14px Arial';
    analysisContext.textAlign = 'center';
    analysisContext.textBaseline = 'middle';
    
    for (let i = 0; i < 8; i++) {
        const file = String.fromCharCode('a'.charCodeAt(0) + i);
        const x = BOARD_PADDING + i * SQUARE_SIZE + SQUARE_SIZE / 2;
        analysisContext.fillText(file, x, BOARD_PADDING / 2);
        analysisContext.fillText(file, x, SIZE - BOARD_PADDING / 2);
        const rank = (8 - i).toString();
        const y = BOARD_PADDING + i * SQUARE_SIZE + SQUARE_SIZE / 2;
        analysisContext.fillText(rank, BOARD_PADDING / 2, y);
        analysisContext.fillText(rank, SIZE - BOARD_PADDING / 2, y);
    }
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const squareX = BOARD_PADDING + c * SQUARE_SIZE;
            const squareY = BOARD_PADDING + r * SQUARE_SIZE;
            analysisContext.fillStyle = (r + c) % 2 === 0 ? '#f0d9b5' : '#b58863';
            analysisContext.fillRect(squareX, squareY, SQUARE_SIZE, SQUARE_SIZE);
            const piece = boardData[r][c];
            if (piece) {
                renderPiece(analysisContext, piece, squareX + SQUARE_SIZE / 2, squareY + SQUARE_SIZE / 2, SQUARE_SIZE);
            }
        }
    }
    
    // --- FINAL, UNCONDITIONAL ARROW DRAWING LOGIC ---
    if (analysisState.currentMoveIndex > -1) {
        // Step 1: ALWAYS draw the blue arrow for the move that was played.
        const movePlayed = analysisState.moves[analysisState.currentMoveIndex];
        if (movePlayed) {
            drawMoveArrow(movePlayed.from, movePlayed.to);
        }

        // Step 2: Check the analysis result.
        const analysisResult = analysisState.classifications[analysisState.currentMoveIndex];
        
        // Step 3: If the move was a mistake or blunder, ALSO draw the green hint arrow.
        if (analysisResult && (analysisResult.classification === 'mistake' || analysisResult.classification === 'blunder')) {
            const bestMove = analysisResult.bestMove;
            
            // This extra check prevents an error if the engine somehow fails to find an alternative.
            if (bestMove && bestMove.from && bestMove.to) {
                drawHintArrow(bestMove.from, bestMove.to); 
            }
        }
    }
}


	/**
	 * Generates the Standard Algebraic Notation (SAN) for a move, resolving ambiguity.
	 * @param {object} move - The move object.
	 * @param {Array} allLegalMoves - All legal moves available in the current position.
	 * @returns {string} The SAN string for the move.
	 */
	function getSanForMove(move, allLegalMoves) {
		const files = 'abcdefgh';
		const piece = move.piece;
		const to = move.to;
		const from = move.from;

		// 1. Castling
		if (move.isCastle) {
			return to[1] > 4 ? 'O-O' : 'O-O-O';
		}

		const pieceLetter = piece.toUpperCase() === 'P' ? '' : piece.toUpperCase();
		const destSquare = files[to[1]] + (8 - to[0]);

		// 2. Pawn moves
		if (piece.toUpperCase() === 'P') {
			let notation = move.capturedPiece ? files[from[1]] + 'x' + destSquare : destSquare;
			if (to[0] === 0 || to[0] === 7) {
				notation += '=Q'; // Assumes auto-queen for simplicity
			}
			return notation;
		}

		// 3. Other pieces (with ambiguity check)
		let notation = pieceLetter;

		// Find other pieces of the same type that could also move to the destination
		const ambiguousMoves = allLegalMoves.filter(m =>
			m.piece === piece &&
			(m.to[0] === to[0] && m.to[1] === to[1]) &&
			!(m.from[0] === from[0] && m.from[1] === from[1])
		);

		if (ambiguousMoves.length > 0) {
			// Disambiguation is required. Add the minimum information to make it unique.
			const canUseFile = !ambiguousMoves.some(m => m.from[1] === from[1]);
			if (canUseFile) {
				notation += files[from[1]];
			} else {
				const canUseRank = !ambiguousMoves.some(m => m.from[0] === from[0]);
				if (canUseRank) {
					notation += (8 - from[0]);
				} else {
					// Need both file and rank
					notation += files[from[1]] + (8 - from[0]);
				}
			}
		}

		if (move.capturedPiece) {
			notation += 'x';
		}

		notation += destSquare;
		return notation;
	}

	function makeMove(b, move) {
		const nB = b.map(r => r.slice());
		const p = nB[move.from[0]][move.from[1]];
		nB[move.to[0]][move.to[1]] = p;
		nB[move.from[0]][move.from[1]] = '';
		if (move.isCastle) {
			const r = move.from[0];
			const rFrom = move.to[1] > 3 ? 7 : 0;
			const rTo = move.to[1] > 3 ? 5 : 3;
			nB[r][rTo] = nB[r][rFrom];
			nB[r][rFrom] = '';
		}
		if (move.isEnPassant) {
			nB[move.from[0]][move.to[1]] = '';
		}
		if (p.toLowerCase() === 'p' && (move.to[0] === 0 || move.to[0] === 7)) {
			nB[move.to[0]][move.to[1]] = p === 'P' ? 'Q' : 'q';
		}
		return nB;
	}

	function updateStateAfterMove(move) {
		const piece = move.piece;
		const from = move.from;
		if (piece === 'K') {
			gameState.castlingRights.K = false;
			gameState.castlingRights.Q = false;
		}
		if (piece === 'k') {
			gameState.castlingRights.k = false;
			gameState.castlingRights.q = false;
		}
		if (piece === 'R') {
			if (from[0] === 7 && from[1] === 7) gameState.castlingRights.K = false;
			if (from[0] === 7 && from[1] === 0) gameState.castlingRights.Q = false;
		}
		if (piece === 'r') {
			if (from[0] === 0 && from[1] === 7) gameState.castlingRights.k = false;
			if (from[0] === 0 && from[1] === 0) gameState.castlingRights.q = false;
		}
		gameState.enPassantTarget = move.isPawnDoubleMove ? [(move.from[0] + move.to[0]) / 2, move.from[1]] : null;
		gameState.turn = gameState.turn === 'w' ? 'b' : 'w';
		if (gameState.turn === 'w') gameState.fullmoveNumber++;
		gameState.halfmoveClock = (piece.toLowerCase() === 'p' || move.capturedPiece) ? 0 : gameState.halfmoveClock + 1;
		gameState.selectedSquare = null;
	}

	function updateGameStatus() {
		gameState.legalMoves = chessLogic.generateAllLegalMoves(board, gameState.turn, gameState.castlingRights, gameState.enPassantTarget);
		if (gameState.legalMoves.length === 0) {
			const kingPos = chessLogic.findKing(board, gameState.turn);
			const inCheck = kingPos && chessLogic.isSquareAttacked(board, kingPos.r, kingPos.c, gameState.turn === 'w' ? 'b' : 'w');
			if (inCheck) {
				const winner = gameState.turn === 'w' ? 'Black' : 'White';
				showGameOver(`Checkmate! ${winner} wins.`, winner === 'White' ? '1-0' : '0-1');
			} else {
				showGameOver("Stalemate! It's a draw.", "1/2-1/2");
			}
			return true;
		}
		return false;
	}

	function showGameOver(message, result) {
		gameState.gameOver = true;
		gameState.pgnResult = result;
		gameOverText.textContent = message;
		gameOverOverlay.classList.remove("hidden")
	}

	function generateFEN() {
		const boardPart = board.map(r => {
			let e = 0,
				fR = '';
			for (const c of r) {
				if (c === '') {
					e++
				} else {
					if (e > 0) {
						fR += e;
						e = 0
					}
					fR += c
				}
			}
			if (e > 0) fR += e;
			return fR
		}).join('/');
		const castlingString = (gameState.castlingRights.K ? 'K' : '') + (gameState.castlingRights.Q ? 'Q' : '') + (gameState.castlingRights.k ? 'k' : '') + (gameState.castlingRights.q ? 'q' : '') || '-';
		const enPassantString = gameState.enPassantTarget ? 'abcdefgh' [gameState.enPassantTarget[1]] + (8 - gameState.enPassantTarget[0]) : '-';
		return `${boardPart} ${gameState.turn} ${castlingString} ${enPassantString} ${gameState.halfmoveClock} ${gameState.fullmoveNumber}`;
	}

	function startAIMove() {
		if (gameState.gameOver || gameState.isAIMoving) return;
		gameState.isAIMoving = true;
		const fen = generateFEN();
		
		// Note: We now use the FEN from before the move, which is correct
		const fenForHistory = fen.split(' ').slice(0, 4).join(' ');
		gameState.fenHistory.push(fenForHistory);

		messageDiv.textContent += `\n\n${gameState.turn === 'w' ? 'White' : 'Black'} AI is thinking...`;
		scrollMsg()
		setTimeout(() => {
			aiWorker.postMessage({
				command: 'calculate_move',
				fen,
				maxDepth: 4,
				color: gameState.turn,
				fenHistory: gameState.fenHistory // Send the history to the worker
			});
		}, 100);
	}

	// --- Drawing and Rendering ---
	/* B"H */

	function drawBoard(isAnimating = false) {
	    canvas.width = SIZE;
	    canvas.height = SIZE;
	    const isWhiteView = gameState.gameMode !== 'pva' || gameState.playerColor === 'w';
	
	    // ---  Draw Coordinates ---
	    canvasContext.fillStyle = '#c7c7c7'; // A neutral, light grey for the text
	    canvasContext.font = 'bold 14px Arial';
	    canvasContext.textAlign = 'center';
	    canvasContext.textBaseline = 'middle';
	
	    const files = isWhiteView ? ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] : ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];
	    const ranks = isWhiteView ? ['8', '7', '6', '5', '4', '3', '2', '1'] : ['1', '2', '3', '4', '5', '6', '7', '8'];
	
	    for (let i = 0; i < 8; i++) {
	        // Draw file labels (a-h) at top and bottom
	        const x = BOARD_PADDING + i * SQUARE_SIZE + SQUARE_SIZE / 2;
	        canvasContext.fillText(files[i], x, BOARD_PADDING / 2);
	        canvasContext.fillText(files[i], x, SIZE - BOARD_PADDING / 2);
	
	        // Draw rank labels (1-8) at left and right
	        const y = BOARD_PADDING + i * SQUARE_SIZE + SQUARE_SIZE / 2;
	        canvasContext.fillText(ranks[i], BOARD_PADDING / 2, y);
	        canvasContext.fillText(ranks[i], SIZE - BOARD_PADDING / 2, y);
	    }
	
	    // --- REVISED: Draw Squares & Pieces with Padding Offset ---
	    for (let r_idx = 0; r_idx < 8; r_idx++) {
	        for (let c_idx = 0; c_idx < 8; c_idx++) {
	            const r = isWhiteView ? r_idx : 7 - r_idx;
	            const c = isWhiteView ? c_idx : 7 - c_idx;
	            
	            // Calculate square position with padding
	            const squareX = BOARD_PADDING + c_idx * SQUARE_SIZE;
	            const squareY = BOARD_PADDING + r_idx * SQUARE_SIZE;
	
	            canvasContext.fillStyle = (r_idx + c_idx) % 2 === 0 ? '#f0d9b5' : '#b58863';
	            canvasContext.fillRect(squareX, squareY, SQUARE_SIZE, SQUARE_SIZE);
	            
	            // Highlights and move dots (also offset)
	            if (!isAnimating && gameState.selectedSquare && gameState.selectedSquare[0] === r && gameState.selectedSquare[1] === c) {
	                canvasContext.fillStyle = 'rgba(255, 255, 0, 0.4)';
	                canvasContext.fillRect(squareX, squareY, SQUARE_SIZE, SQUARE_SIZE);
	            }
	            if (!isAnimating && gameState.selectedSquare) {
	                const legalMovesForPiece = gameState.legalMoves.filter(m => m.from[0] === gameState.selectedSquare[0] && m.from[1] === gameState.selectedSquare[1]);
	                if (legalMovesForPiece.some(m => m.to[0] === r && m.to[1] === c)) {
	                    canvasContext.fillStyle = 'rgba(0, 150, 0, 0.5)';
	                    canvasContext.beginPath();
	                    canvasContext.arc(squareX + SQUARE_SIZE / 2, squareY + SQUARE_SIZE / 2, SQUARE_SIZE / 5, 0, 2 * Math.PI);
	                    canvasContext.fill();
	                }
	            }
	
	            // Render piece (also offset)
	            const piece = board[r][c];
	            if (piece && !(isAnimating && animationState.pieceToAnimate[0] === r && animationState.pieceToAnimate[1] === c)) {
	                renderPiece(canvasContext, piece, squareX + SQUARE_SIZE / 2, squareY + SQUARE_SIZE / 2, SQUARE_SIZE);
	            }
	        }
	    }
	}

	function renderPiece(ctx, piece, x, y, size) {
	const isWhite = piece === piece.toUpperCase();
	const emoji = PIECE_EMOJIS[piece.toUpperCase()];
	const pieceType = piece.toLowerCase();

	ctx.save();

	let pieceFilter;

	// Check if the piece is a pawn
	if (pieceType === 'p') {
		// Pawns get the original, full grayscale effect
		if (isWhite) {
			pieceFilter = 'grayscale(1) brightness(2.8)';
		} else {
			pieceFilter = 'grayscale(1) brightness(0.55)';
		}
	} else {
		// All other pieces get a partial grayscale, retaining some color
		if (isWhite) {
			// 70% grayscale allows 50% of the color to show through
			pieceFilter = 'grayscale(0.5) brightness(1.5)'; 
		} else {
			// A slightly different brightness for black pieces looks better with color
			pieceFilter = 'grayscale(0.5) brightness(0.5)';
		}
	}
	
	ctx.filter = pieceFilter;

	ctx.font = `${size * 0.8}px serif`;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	
	ctx.fillText(emoji, x, y);
    
    // The outline helps with clarity, especially with the subtle color
	ctx.strokeStyle = isWhite ? 'black' : 'white';
	ctx.lineWidth = 4;
	ctx.strokeText(emoji, x, y);

	ctx.restore();

    // This code for the bishop's yamulka remains the same and will work as before
	if (piece.toLowerCase() === 'b') {
		const yamulkaRadius = size * 0.16;
		const yamulkaY = y - size * 0.28;
		ctx.save();
		ctx.translate(x, yamulkaY);
		ctx.scale(1.5, 1);
		ctx.fillStyle = isWhite ? '#87CEEB' : '#00008B';
		ctx.beginPath();
		ctx.arc(0, 0, yamulkaRadius, Math.PI, 0);
		ctx.fill();
		ctx.restore();
	}
}

	function drawCapturedPieces() {
	const sortPieces = (a, b) => pieceOrder[a.toUpperCase()] - pieceOrder[b.toUpperCase()];
	const capturedPieceSize = 40; // Slightly smaller to fit better
	const padding = 5;
    const rowHeight = 45; // The vertical space for each row

	// Clear the canvases before redrawing
	capturedWhiteCtx.clearRect(0, 0, capturedByWhiteCanvas.width, capturedByWhiteCanvas.height);
	capturedBlackCtx.clearRect(0, 0, capturedByBlackCanvas.width, capturedByBlackCanvas.height);

    // --- Logic for drawing pieces captured by White (black pieces) ---
    let currentXWhite = padding;
    let currentYWhite = rowHeight / 2;
	gameState.capturedByWhite.sort(sortPieces).forEach((p, i) => {
        // Check if adding the next piece would overflow the canvas width
        if (currentXWhite + capturedPieceSize > capturedByWhiteCanvas.width) {
            // Move to the next row
            currentXWhite = padding;
            currentYWhite += rowHeight;
        }
		// Center the piece in its "slot"
		const x = currentXWhite + (capturedPieceSize / 2);
		renderPiece(capturedWhiteCtx, p, x, currentYWhite, capturedPieceSize);
        // Advance the x-coordinate for the next piece
        currentXWhite += capturedPieceSize;
	});


    // --- Logic for drawing pieces captured by Black (white pieces) ---
    let currentXBlack = padding;
    let currentYBlack = rowHeight / 2;
	gameState.capturedByBlack.sort(sortPieces).forEach((p, i) => {
        // Check if adding the next piece would overflow the canvas width
		if (currentXBlack + capturedPieceSize > capturedByBlackCanvas.width) {
            // Move to the next row
            currentXBlack = padding;
            currentYBlack += rowHeight;
        }
		// Center the piece in its "slot"
        const x = currentXBlack + (capturedPieceSize / 2);
		renderPiece(capturedBlackCtx, p, x, currentYBlack, capturedPieceSize);
        // Advance the x-coordinate for the next piece
        currentXBlack += capturedPieceSize;
	});
}

	// --- Player Interaction ---
	function handleSquareClick(r, c) {
		if (gameState.gameOver || gameState.isAnimating || gameState.isAIMoving) return;
		const isPlayerTurn = (gameState.turn === gameState.playerColor) || gameState.gameMode === 'pvp';
		if (!isPlayerTurn) return;

		if (gameState.selectedSquare) {
			const move = gameState.legalMoves.find(m => m.from[0] === gameState.selectedSquare[0] && m.from[1] === gameState.selectedSquare[1] && m.to[0] === r && m.to[1] === c);
			if (move) {
				animateMove(move);
				return;
			}
		}

		const piece = board[r][c];
		if (piece && ((gameState.turn === 'w' && piece === piece.toUpperCase()) || (gameState.turn === 'b' && piece === piece.toLowerCase()))) {
			gameState.selectedSquare = [r, c];
		} else {
			gameState.selectedSquare = null;
		}
		drawBoard();
	}

	// --- Animation, PGN, and Setup ---
	let animationState = {};

	function animateMove(move, onComplete = () => {}) {
		gameState.isAnimating = true;
		const isWhiteView = gameState.gameMode !== 'pva' || gameState.playerColor === 'w';
		
		// FIXED: Changed '7 - from[1]' to '7 - move.from[1]'
		const startRow = isWhiteView ? move.from[0] : 7 - move.from[0],
			startCol = isWhiteView ? move.from[1] : 7 - move.from[1];
			
		const endRow = isWhiteView ? move.to[0] : 7 - move.to[0],
			endCol = isWhiteView ? move.to[1] : 7 - move.to[1];
			
		animationState = {
			piece: move.piece,
			pieceToAnimate: [move.from[0], move.from[1]],
			startX: BOARD_PADDING + startCol * SQUARE_SIZE + SQUARE_SIZE / 2,
			startY: BOARD_PADDING + startRow * SQUARE_SIZE + SQUARE_SIZE / 2,
			endX: BOARD_PADDING + endCol * SQUARE_SIZE + SQUARE_SIZE / 2,
			endY: BOARD_PADDING + endRow * SQUARE_SIZE + SQUARE_SIZE / 2,
			startTime: performance.now(),
			duration: 250,
			onComplete,
			finalMove: move
		};
		requestAnimationFrame(animationLoop);
	}

	function animationLoop(timestamp) {
		const elapsed = timestamp - animationState.startTime;
		const progress = Math.min(elapsed / animationState.duration, 1);
		drawBoard(true);
		const currentX = animationState.startX + (animationState.endX - animationState.startX) * progress;
		const currentY = animationState.startY + (animationState.endY - animationState.startY) * progress;
		
		renderPiece(canvasContext, animationState.piece, currentX, currentY, SQUARE_SIZE);
		
		if (progress < 1) {
			requestAnimationFrame(animationLoop);
		} else {
			gameState.isAnimating = false;
			performMove(animationState.finalMove);
			animationState.onComplete();
		}
	}

	function generatePGN() {
		const date = new Date();
		const pgnDate = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
		
		const pgnHeader = `[Event "Ultimate AI Chess Game"]
[Site "Browser"]
[Date "${pgnDate}"]
[White "${gameState.gameMode==='pva'&&gameState.playerColor==='w'?'Player':(gameState.gameMode==='pvp'?'Player 1':'AI White')}"]
[Black "${gameState.gameMode==='pva'&&gameState.playerColor==='b'?'Player':(gameState.gameMode==='pvp'?'Player 2':'AI Black')}"]
[Result "${gameState.pgnResult}"]

`;

		let moveText = '';
		gameState.moveHistory.forEach((record, index) => {
			if (index % 2 === 0) {
				moveText += `${Math.floor(index / 2) + 1}. `;
			}
			moveText += record.san + ' ';
		});

		return pgnHeader + moveText.trim() + ' ' + gameState.pgnResult;
	}

	/* B"H */

	function getSquareFromCoordinates(x, y) {
	    const rect = canvas.getBoundingClientRect();
	    // Adjust coordinates for the padding before calculating the square
	    const adjustedX = x - rect.left - BOARD_PADDING;
	    const adjustedY = y - rect.top - BOARD_PADDING;
	
	    let c = Math.floor(adjustedX / SQUARE_SIZE);
	    let r = Math.floor(adjustedY / SQUARE_SIZE);
	    
	    const isWhiteView = gameState.gameMode !== 'pva' || gameState.playerColor === 'w';
	    if (!isWhiteView) {
	        r = 7 - r;
	        c = 7 - c;
	    }
	    return { r, c };
	}

	function handleCanvasEvent(event) {
		try {
		
		event.preventDefault();
		} catch(e){console. log(e)}
		
		let clientX, clientY;
		if (event.changedTouches && event.changedTouches.length > 0) {
			clientX = event.changedTouches[0].clientX;
			clientY = event.changedTouches[0].clientY;
		} else {
			clientX = event.clientX;
			clientY = event.clientY;
		}
		if (clientX === undefined) return;
		const {
			r,
			c
		} = getSquareFromCoordinates(clientX, clientY);
		if (r >= 0 && r < 8 && c >= 0 && c < 8) handleSquareClick(r, c);
	}
	
	function canClaimThreefoldRepetition() {
		const currentFen = generateFEN().split(' ').slice(0, 4).join(' '); // Ignore clocks
		const count = gameState.fenHistory.reduce((acc, fen) => {
			return fen === currentFen ? acc + 1 : acc;
		}, 0);
		return count >= 2; // The current position plus 2 previous makes 3
	}
	
	function canClaim50MoveRule() {
		// The halfmoveClock is reset after a capture or pawn move.
		// 50 moves by each player is 100 half-moves.
		return gameState.halfmoveClock >= 100;
	}
	
	
	
	/* B"H */

// --- 
	let analysisState = {};
	
	function resetAnalysisState() {
	    analysisState = {
	        moves: [],
	        boardHistory: [],
	        openingNames: [],
	        currentMoveIndex: -1,
	        classifications: [] // To store results like { classification: 'blunder', bestMove: ... }
	    };
	    moveListContainer.innerHTML = '';
	    openingNameDisplay.textContent = '';
	}
	
	function handleAnalysisResult(data) {
	    resetAnalysisState();
	    analysisState.moves = data.moves;
	    analysisState.boardHistory = data.boardHistory;
	    analysisState.openingNames = data.openingNames;
	    
	    populateMoveList();
	    displayAnalysisPosition(-1); // Display the starting position
	}
	
	/* B"H */

	
	function displayAnalysisPosition(index) {
	    // Boundary check
	    if (index < -1 || index >= analysisState.moves.length) {
	        return;
	    }
	    
	    analysisState.currentMoveIndex = index;
	    drawAnalysisBoard();
	
	    
	    const positionIndex = index + 1;
	    const totalMoves = analysisState.moves.length;
	    const bookName = analysisState.openingNames[positionIndex];
	
	    const OPENING_PHASE_MOVE_LIMIT = 24; 
	    const isKnownOpening = bookName && bookName !== "Starting Position" && positionIndex < OPENING_PHASE_MOVE_LIMIT;
	
	    if (isKnownOpening) {
	        openingNameDisplay.textContent = bookName;
	    } else {
	        if (positionIndex === 0) {
	            openingNameDisplay.textContent = "Starting Position";
	        } else {
	            const currentFen = analysisState.boardHistory[positionIndex];
	            if (currentFen) {
	                const board = getBoardFromFen(currentFen);
	                const materialPhase = getGamePhase(board);
	
	                // --- NEW HYBRID ENDGAME LOGIC ---
	                // Condition 1: Is the game past our minimum move threshold?
	                const isPastMinMoves = positionIndex > ENDGAME_MIN_MOVES;
	                // Condition 2: Are we in the final percentage-based section of the game?
	                const isInFinalStage = positionIndex > (totalMoves * ENDGAME_PERCENTAGE_THRESHOLD);
	
	                // It's an endgame if:
	                // a) The material is very low (the old rule)
	                // OR
	                // b) It's a long game AND we are in its final section (your new rule)
	                if (materialPhase <= 0.25 || (isPastMinMoves && isInFinalStage)) {
	                    openingNameDisplay.textContent = "Endgame";
	                } else {
	                    openingNameDisplay.textContent = "Middlegame";
	                }
	            }
	        }
	    }
	    
	    // Update move list highlighting (no changes here)
	    document.querySelectorAll('.move-text-item').forEach(item => {
	        item.classList.remove('current-move');
	        if (parseInt(item.dataset.moveIndex) === index) {
	            item.classList.add('current-move');
	            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
	        }
	    });
	}
	
	/* B"H */
	
	function drawMoveArrow(from, to) {
    const fromX = BOARD_PADDING + from[1] * SQUARE_SIZE + SQUARE_SIZE / 2;
    const fromY = BOARD_PADDING + from[0] * SQUARE_SIZE + SQUARE_SIZE / 2;
    const toX = BOARD_PADDING + to[1] * SQUARE_SIZE + SQUARE_SIZE / 2;
    const toY = BOARD_PADDING + to[0] * SQUARE_SIZE + SQUARE_SIZE / 2;
    
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const headlen = 28; // A larger head
    const lineWidth = 14;

    // Calculate the point where the line shaft should end (shortened)
    const shaftEndX = toX - (headlen / 2) * Math.cos(angle);
    const shaftEndY = toY - (headlen / 2) * Math.sin(angle);

    analysisContext.save();
    analysisContext.strokeStyle = 'rgba(20, 150, 255, 0.7)';
    analysisContext.fillStyle = 'rgba(20, 150, 255, 0.7)';
    analysisContext.lineWidth = lineWidth;
    analysisContext.lineCap = 'round'; // Round cap looks good on the start of the line

    // 1. Draw the shortened line shaft
    analysisContext.beginPath();
    analysisContext.moveTo(fromX, fromY);
    analysisContext.lineTo(shaftEndX, shaftEndY);
    analysisContext.stroke();

    // 2. Draw a wider arrowhead at the very end
    analysisContext.beginPath();
    analysisContext.moveTo(toX, toY);
    // Use a wider angle (PI/5) for a fatter arrowhead
    analysisContext.lineTo(toX - headlen * Math.cos(angle - Math.PI / 5), toY - headlen * Math.sin(angle - Math.PI / 5));
    analysisContext.lineTo(toX - headlen * Math.cos(angle + Math.PI / 5), toY - headlen * Math.sin(angle + Math.PI / 5));
    analysisContext.closePath();
    analysisContext.fill();
    
    analysisContext.restore();
}
	
	function populateMoveList() {
	    moveListContainer.innerHTML = '';
	    analysisState.moves.forEach((move, index) => {
	        const moveSpan = document.createElement('span');
	        moveSpan.classList.add('move-text-item');
	        if (index % 2 === 0) {
	            moveSpan.textContent = `${Math.floor(index / 2) + 1}. ${move.san}`;
	        } else {
	            moveSpan.textContent = move.san;
	        }
	        moveSpan.dataset.moveIndex = index;
	        moveSpan.addEventListener('click', () => {
	            displayAnalysisPosition(index);
	        });
	        moveListContainer.appendChild(moveSpan);
	    });
	}


	function startGame(mode, playerColor = 'w') {
		mainMenu.style.display = 'none';
		colorSelectionMenu.style.display = 'none';
		chessContainer.style.display = 'block';
		
		
		gameContainer.classList.remove("hidden")
		
		
		
		resetGameState();
		gameState.gameMode = mode;
		gameState.playerColor = playerColor;
		const fenData = gameState.fen.split(' ');
		board = fenData[0].split('/').map(r => {
			let nR = [];
			for (const c of r)
				if (isNaN(parseInt(c))) nR.push(c);
				else
					for (let i = 0; i < parseInt(c); i++) nR.push('');
			return nR
		});
		gameState.fenHistory.push(fenData.slice(0, 4).join(' '));
		
		updateGameStatus();
		drawBoard();
		drawCapturedPieces();
		switch (mode) {
			case 'pva':
				messageDiv.textContent += `\n\nYou are ${playerColor === 'w' ? 'White' : 'Black'}. White to move.`;
				if (playerColor === 'b') startAIMove();
				scrollMsg()
				break;
			case 'pvp':
				messageDiv.textContent += "\n\nWhite's turn to move.";
				scrollMsg()
				break;
			case 'ava':
				messageDiv.textContent += "AI vs AI. White to move.";
				startAIMove();
				scrollMsg()
				break;
		}
		
		scrollMsg()
	}
	
	/* B"H */

	// --- Game Phase Calculation Helpers ---
	
	/**
	 * A simple helper to parse just the board array from a FEN string.
	 * @param {string} fen - The FEN string for the position.
	 * @returns {string[][]} A 2D array representing the board.
	 */
	function getBoardFromFen(fen) {
	    const board = [];
	    const boardPart = fen.split(' ')[0];
	    const rows = boardPart.split('/');
	    for (const row of rows) {
	        const newRow = [];
	        for (const char of row) {
	            if (isNaN(parseInt(char))) {
	                newRow.push(char);
	            } else {
	                for (let i = 0; i < parseInt(char); i++) {
	                    newRow.push('');
	                }
	            }
	        }
	        board.push(newRow);
	    }
	    return board;
	}
	
	function updateSingleMoveWithAnalysis(index, result) {
    const moveElements = document.querySelectorAll('.move-text-item');
    const targetElement = Array.from(moveElements).find(el => parseInt(el.dataset.moveIndex) === index);

    if (!targetElement) return;

    // Define all icons, including for good moves
    const icons = {
        brilliant: '⭐', // Star for brilliant
        best: '✅',      // Checkmark for best
        good: '✓',       // Smaller check for good
        mistake: '⚠️',    // Warning for mistake
        blunder: '❌'     // X for blunder
    };

    const icon = icons[result.classification];

    if (icon) {
        // Remove any existing icon before adding a new one
        const existingIcon = targetElement.querySelector('.move-icon');
        if (existingIcon) existingIcon.remove();

        const iconSpan = document.createElement('span');
        iconSpan.className = 'move-icon';
        iconSpan.textContent = icon + ' ';
        targetElement.prepend(iconSpan);
    }
}
	
	
	
	/**
	 * Calculates the game phase based on the pieces on the board.
	 * Returns a value from 1.0 (full opening) to 0.0 (late endgame).
	 * @param {string[][]} board - The 2D board array.
	 * @returns {number} The game phase value.
	 */
	function getGamePhase(board) {
	    const MAX_PHASE = 24; // Standard total phase value
	    let currentPhase = 0;
	    const phaseValues = { n: 1, b: 1, r: 2, q: 4 }; // Value of pieces for phase calculation
	    for (let r = 0; r < 8; r++) {
	        for (let c = 0; c < 8; c++) {
	            const p = board[r][c];
	            if (p && phaseValues[p.toLowerCase()]) {
	                currentPhase += phaseValues[p.toLowerCase()];
	            }
	        }
	    }
	    // Normalize the phase to a value between 0 and 1
	    return Math.min(currentPhase, MAX_PHASE) / MAX_PHASE;
	}
	

	// --- Event Listeners ---
	canvas.addEventListener('mouseup', handleCanvasEvent);
	canvas.addEventListener('touchend', handleCanvasEvent);
	replayButton.addEventListener('click', () => {
		gameOverOverlay.classList.add("hidden")
		chessContainer.style.display = 'none';
		mainMenu.style.display = 'flex';
		messageDiv.textContent = '';
		gameContainer.classList.add("hidden")
	});
	downloadButton.addEventListener('click', () => {
		const pgn = generatePGN();
		const blob = new Blob([pgn], {
			type: 'text/plain'
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'BH-' + Date.now() + 'chess-game.pgn.txt';
		a.click();
		URL.revokeObjectURL(url);
	});
	drawButton.addEventListener('click', () => {
		if (!gameState.gameOver) {
			showGameOver("Game Drawn by Agreement", "1/2-1/2");
		}
	});
	
	playVsAiButton.onclick = () => {
		mainMenu.style.display = 'none';
		colorSelectionMenu.style.display = 'flex';
	};
	playAsWhiteButton.onclick = () => startGame('pva', 'w');
	playAsBlackButton.onclick = () => startGame('pva', 'b');
	playVsPlayerButton.onclick = () => startGame('pvp');
	aiVsAiButton.onclick = () => startGame('ava');
	
	
	/* B"H */

// --- 
	analysisButton.onclick = () => {
	    mainMenu.style.display = 'none';
	    analysisScreen.style.display = 'flex';
	    resetAnalysisState();
	    // Initialize with the starting position FEN
	    analysisState.boardHistory.push("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
	    analysisState.openingNames.push("Starting Position");
	    displayAnalysisPosition(-1); 
	};
	
	analysisBackToMenuButton.onclick = () => {
	    analysisScreen.style.display = 'none';
	    mainMenu.style.display = 'flex';
	};
	
	loadPgnButton.onclick = () => {
	    pgnFileInput.click();
	};
	
	 

runAnalysisButton.onclick = () => {
    if (analysisState.moves.length === 0) {
        alert("Please load a PGN first.");
        return;
    }
    
    // Clear previous analysis icons and data
    analysisState.classifications = [];
    document.querySelectorAll('.move-icon').forEach(icon => icon.remove());
    
    openingNameDisplay.textContent = "Analyzing game, please wait...";

    aiWorker.postMessage({
        command: 'run_engine_analysis'
    });
};
    
    


pgnFileInput.onchange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const pgnText = e.target.result;
        analysisState.rawPgn = pgnText; // STORE THE RAW PGN
        aiWorker.postMessage({ command: 'analyze_pgn', pgnText: pgnText });
    };
    reader.readAsText(file);
    event.target.value = '';
};
	
	prevMoveButton.onclick = () => {
	    displayAnalysisPosition(analysisState.currentMoveIndex - 1);
	};
	
	nextMoveButton.onclick = () => {
	    displayAnalysisPosition(analysisState.currentMoveIndex + 1);
	};
	
	
	teachingsButton.onclick = () => {
	    mainMenu.style.display = 'none';
	    teachingsText.textContent = teachingsNovel; // Load the novel text
	    teachingsScreen.style.display = 'flex';
	    teachingsText.scrollTop = 0; // Ensure it starts at the top
	};
	
	backToMenuButton.onclick = () => {
	    teachingsScreen.style.display = 'none';
	    mainMenu.style.display = 'flex';
	};

	// --- INITIATE ENGINE LOADING ON STARTUP ---
	resetGameState();
	aiWorker.postMessage({ command: 'initialize' });
});