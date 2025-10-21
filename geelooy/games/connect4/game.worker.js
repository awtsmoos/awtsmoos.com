//B"H

// Import external scripts for AI and Particles
importScripts('particle.js');
importScripts('ai.js');

// Game State & Constants
let canvas, ctx;
let board;
let currentPlayer;
let gameMode;
let gameOver = false;
const columns = 7;
const rows = 6;
const hebrewLetters = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י'];
let particles = [];

// Interaction State
let animatedPiece = null;
let hoverColumn = -1;
let isPlayerTurn = true;
let winScreenButtons = {};
let gameLoopId = null; // To ensure only one loop is running

function resize(data) {
    if (!canvas) return;
    canvas.width = data.width;
    canvas.height = data.height;
}

function init(data) {
    canvas = data.canvas;
    ctx = canvas.getContext('2d');
    gameMode = data.gameMode;
    resize({ width: data.width, height: data.height });
    resetGame(data.playerGoesFirst);

    // Initial AI move if necessary
    if (gameMode === 'pvc' && !isPlayerTurn) {
        setTimeout(aiMove, 500);
    } else if (gameMode === 'cvc') {
        setTimeout(aiMove, 500);
    }
    
    // Start the game loop if it's not already running
    if (!gameLoopId) {
        gameLoop();
    }
}

function resetGame(playerGoesFirst = true) {
    board = Array(rows).fill(null).map(() => Array(columns).fill(0));
    currentPlayer = 1;
    gameOver = false;
    particles = [];
    animatedPiece = null;

    if (gameMode === 'pvp') {
        isPlayerTurn = true;
    } else if (gameMode === 'pvc') {
        isPlayerTurn = playerGoesFirst;
    } else if (gameMode === 'cvc') {
        isPlayerTurn = false;
    }
}

function aiMove() {
    if (gameOver) return;
    const col = getGolemMove(board, columns);
    if (col !== -1) {
        dropPiece(col);
    }
}

function handleMoveCompletion(row, col) {
    board[row][col] = animatedPiece.player;
    createExplosion(col, row);
    animatedPiece = null;
    
    if (checkWin(currentPlayer, row, col)) {
        gameOver = true;
        return; // End turn sequence
    }
    
    currentPlayer = (currentPlayer === 1) ? 2 : 1;

    // --- CRITICAL FIX: Correctly manage turns for all modes ---
    if (gameMode === 'pvp') {
        isPlayerTurn = true; // Give control to the next human player
    } else if (gameMode === 'pvc') {
        isPlayerTurn = !isPlayerTurn; // Flip control between human and AI
        if (!isPlayerTurn) {
            setTimeout(aiMove, 500); // Trigger AI if it's its turn now
        }
    } else if (gameMode === 'cvc') {
        isPlayerTurn = false; // Always AI's turn
        setTimeout(aiMove, 500); // Trigger next AI move
    }
}

function gameLoop() {
    update();
    draw();
    gameLoopId = requestAnimationFrame(gameLoop);
}

// --- Event Handler ---
onmessage = function (e) {
    const { type, ...data } = e.data;
    switch (type) {
        case 'init':
            init(data);
            break;
        case 'resize':
            resize(data);
            break;
        case 'click':
            if (gameOver) {
                const clickX = data.x * (canvas.width / data.canvasWidth);
                const clickY = data.y * (canvas.height / data.canvasHeight);

                const pa = winScreenButtons.playAgain;
                if (clickX > pa.x && clickX < pa.x + pa.w && clickY > pa.y && clickY < pa.y + pa.h) {
                    resetGame(isPlayerTurn); // Reset with original starting choice
                    if (gameMode === 'pvc' && !isPlayerTurn) setTimeout(aiMove, 500);
                    if (gameMode === 'cvc') setTimeout(aiMove, 500);
                }

                const mm = winScreenButtons.mainMenu;
                if (clickX > mm.x && clickX < mm.x + mm.w && clickY > mm.y && clickY < mm.y + mm.h) {
                    postMessage({ type: 'goToMainMenu' });
                }
            } else if (isPlayerTurn && !animatedPiece) {
                const col = Math.floor(data.x / (data.canvasWidth / columns));
                dropPiece(col);
            }
            break;
        case 'mousemove':
            hoverColumn = Math.floor(data.x / (data.canvasWidth / columns));
            break;
        case 'mouseleave':
            hoverColumn = -1;
            break;
    }
};

// --- (All other helper functions: dropPiece, checkWin, draw, update, etc. remain the same) ---
function update() {
    if (animatedPiece) {
        const gravity = 0.8;
        animatedPiece.speed += gravity;
        animatedPiece.y += animatedPiece.speed;
        const targetRow = getTargetRow(animatedPiece.col);
        if (targetRow !== -1 && animatedPiece.y >= targetRow * (canvas.height / rows)) {
            animatedPiece.y = targetRow * (canvas.height / rows);
            handleMoveCompletion(targetRow, animatedPiece.col);
        }
    }
    particles.forEach((p, index) => { if (p.alpha <= 0) particles.splice(index, 1); else p.update(); });
}
function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cellWidth = canvas.width / columns; const cellHeight = canvas.height / rows; const radius = Math.min(cellWidth, cellHeight) / 2.7;
    for (let r = 0; r < rows; r++) { for (let c = 0; c < columns; c++) {
        ctx.fillStyle = '#0d47a1'; ctx.fillRect(c * cellWidth, r * cellHeight, cellWidth, cellHeight);
        ctx.beginPath(); ctx.arc(c * cellWidth + cellWidth / 2, r * cellHeight + cellHeight / 2, radius, 0, Math.PI * 2);
        let pieceColor = '#1a1a1a'; if (board[r][c] === 1) pieceColor = '#ff4d4d'; if (board[r][c] === 2) pieceColor = '#ffff4d';
        ctx.fillStyle = pieceColor; ctx.fill();
    }}
    particles.forEach(p => p.draw(ctx));
    if (hoverColumn !== -1 && !animatedPiece && isPlayerTurn && !gameOver) {
        ctx.beginPath(); ctx.arc(hoverColumn * cellWidth + cellWidth / 2, cellHeight / 2, radius, 0, Math.PI * 2);
        ctx.fillStyle = currentPlayer === 1 ? 'rgba(255, 77, 77, 0.5)' : 'rgba(255, 255, 77, 0.5)'; ctx.fill();
    }
    if (animatedPiece) {
        ctx.beginPath(); ctx.arc(animatedPiece.col * cellWidth + cellWidth/2, animatedPiece.y + cellHeight/2, radius, 0, Math.PI * 2);
        ctx.fillStyle = animatedPiece.player === 1 ? '#ff4d4d' : '#ffff4d'; ctx.fill();
    }
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff'; ctx.font = `bold ${canvas.width / 12}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(`Player ${currentPlayer} Wins!`, canvas.width / 2, canvas.height / 2 - 80);
        const btnWidth = canvas.width * 0.4; const btnHeight = canvas.height * 0.1; const btnY = canvas.height / 2 + 20; const btnFontSize = canvas.width / 25;
        winScreenButtons.playAgain = { x: canvas.width/2 - btnWidth/2, y: btnY, w: btnWidth, h: btnHeight };
        winScreenButtons.mainMenu = { x: canvas.width/2 - btnWidth/2, y: btnY + btnHeight + 20, w: btnWidth, h: btnHeight };
        ctx.fillStyle = '#4CAF50'; ctx.fillRect(winScreenButtons.playAgain.x, winScreenButtons.playAgain.y, winScreenButtons.playAgain.w, winScreenButtons.playAgain.h);
        ctx.fillStyle = '#ffffff'; ctx.font = `bold ${btnFontSize}px Arial`; ctx.fillText('Play Again', canvas.width / 2, btnY + btnHeight / 2);
        ctx.fillStyle = '#f44336'; ctx.fillRect(winScreenButtons.mainMenu.x, winScreenButtons.mainMenu.y, winScreenButtons.mainMenu.w, winScreenButtons.mainMenu.h);
        ctx.fillStyle = '#ffffff'; ctx.fillText('Main Menu', canvas.width / 2, btnY + btnHeight + 20 + btnHeight / 2);
    }
}
function getTargetRow(col) { for (let r = rows - 1; r >= 0; r--) { if (board[r][col] === 0) return r; } return -1; }
function dropPiece(col) { if (animatedPiece || col < 0 || col >= columns) return null; const targetRow = getTargetRow(col); if (targetRow === -1) return null; animatedPiece = { col, player: currentPlayer, y: -(canvas.height/rows), speed: 0 }; return { row: targetRow, col }; }
function checkWin(player, r, c) { const dirs = [[0,1], [1,0], [1,1], [1,-1]]; for (const [dr, dc] of dirs) { let count = 1; for (let i = 1; i < 4; i++) { const nr = r + i * dr, nc = c + i * dc; if (nr < 0 || nr >= rows || nc < 0 || nc >= columns || board[nr][nc] !== player) break; count++; } for (let i = 1; i < 4; i++) { const nr = r - i * dr, nc = c - i * dc; if (nr < 0 || nr >= rows || nc < 0 || nc >= columns || board[nr][nc] !== player) break; count++; } if (count >= 4) return true; } return false; }
function createExplosion(col, row) { const x = col * (canvas.width/columns) + (canvas.width/columns)/2; const y = row * (canvas.height/rows) + (canvas.height/rows)/2; for (let i = 0; i < 70; i++) { particles.push(new Particle(x, y, hebrewLetters[Math.floor(Math.random() * hebrewLetters.length)])); } }
