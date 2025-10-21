//B"H

importScripts('particle.js');

// Game State & Constants
let canvas, ctx;
let board;
let currentPlayer;
let gameMode;
let gameOver = false;
const columns = 7;
const rows = 6;
let winningPieces = [];
let particles = [];
const hebrewLetters = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י'];

// Animation & Interaction State
let animatedPiece = null;
let hoverColumn = -1;
let isPlayerTurn = true;
let winScreenButtons = {};

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
    resetGame();

    isPlayerTurn = (gameMode === 'pvp' || (gameMode === 'pvc' && data.playerGoesFirst));

    if (gameMode === 'pvc' && !data.playerGoesFirst) {
        isPlayerTurn = false;
        setTimeout(aiMove, 500);
    } else if (gameMode === 'cvc') {
        isPlayerTurn = false;
        setTimeout(aiMove, 500);
    }
    
    if (!self.isLoopRunning) {
        self.isLoopRunning = true;
        gameLoop();
    }
}

function resetGame() {
    board = Array(rows).fill(null).map(() => Array(columns).fill(0));
    currentPlayer = 1;
    gameOver = false;
    particles = [];
    winningPieces = [];
    animatedPiece = null;
    isPlayerTurn = (gameMode === 'pvc' ? (currentPlayer === 1) : true);
    if (gameMode === 'cvc') isPlayerTurn = false;
}

// --- Logic, Animation, Drawing ---

function handleMoveCompletion(row, col) {
    board[row][col] = animatedPiece.player;
    createExplosion(col, row);
    
    if (checkWin(animatedPiece.player, row, col)) {
        gameOver = true;
    } else {
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        // CORRECTED: This is the core logic fix for Player vs Golem
        if (gameMode === 'pvc') {
            isPlayerTurn = !isPlayerTurn; // Flip turns
            if (!isPlayerTurn) {
                setTimeout(aiMove, 500); // If it's now AI's turn, move
            }
        } else if (gameMode === 'cvc') {
            setTimeout(aiMove, 500); // Always AI's turn
        } else {
            isPlayerTurn = true; // In PvP, it's always a player's turn
        }
    }
    animatedPiece = null;
}

function draw() {
    if (!ctx) return;
    // ... (previous drawing code for board, pieces, particles, etc.)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cellWidth = canvas.width / columns;
    const cellHeight = canvas.height / rows;
    const radius = Math.min(cellWidth, cellHeight) / 2.7;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            ctx.fillStyle = '#0d47a1';
            ctx.fillRect(c * cellWidth, r * cellHeight, cellWidth, cellHeight);
            ctx.beginPath();
            const centerX = c * cellWidth + cellWidth / 2;
            const centerY = r * cellHeight + cellHeight / 2;
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            let pieceColor = '#1a1a1a';
            if (board[r][c] === 1) pieceColor = '#ff4d4d';
            if (board[r][c] === 2) pieceColor = '#ffff4d';
            ctx.fillStyle = pieceColor;
            ctx.fill();
        }
    }
    particles.forEach(p => p.draw(ctx));
    if (hoverColumn !== -1 && !animatedPiece && isPlayerTurn && !gameOver) {
        ctx.beginPath();
        ctx.arc(hoverColumn * cellWidth + cellWidth / 2, cellHeight / 2, radius, 0, Math.PI * 2);
        ctx.fillStyle = currentPlayer === 1 ? 'rgba(255, 77, 77, 0.5)' : 'rgba(255, 255, 77, 0.5)';
        ctx.fill();
    }
    if (animatedPiece) {
        ctx.beginPath();
        ctx.arc(animatedPiece.col * cellWidth + cellWidth/2, animatedPiece.y + cellHeight/2, radius, 0, Math.PI * 2);
        ctx.fillStyle = animatedPiece.player === 1 ? '#ff4d4d' : '#ffff4d';
        ctx.fill();
    }

    // --- NEW: Draw Game Over Screen with Buttons ---
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${canvas.width / 12}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`Player ${currentPlayer} Wins!`, canvas.width / 2, canvas.height / 2 - 80);

        // Define button properties
        const btnWidth = canvas.width * 0.4;
        const btnHeight = canvas.height * 0.1;
        const btnY = canvas.height / 2 + 20;
        const btnFontSize = canvas.width / 25;

        winScreenButtons.playAgain = { x: canvas.width/2 - btnWidth/2, y: btnY, w: btnWidth, h: btnHeight };
        winScreenButtons.mainMenu = { x: canvas.width/2 - btnWidth/2, y: btnY + btnHeight + 20, w: btnWidth, h: btnHeight };

        // Draw Play Again button
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(winScreenButtons.playAgain.x, winScreenButtons.playAgain.y, winScreenButtons.playAgain.w, winScreenButtons.playAgain.h);
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${btnFontSize}px Arial`;
        ctx.fillText('Play Again', canvas.width / 2, btnY + btnHeight / 2);

        // Draw Main Menu button
        ctx.fillStyle = '#f44336';
        ctx.fillRect(winScreenButtons.mainMenu.x, winScreenButtons.mainMenu.y, winScreenButtons.mainMenu.w, winScreenButtons.mainMenu.h);
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Main Menu', canvas.width / 2, btnY + btnHeight + 20 + btnHeight / 2);
    }
}

function gameLoop() {
    // ... update function remains the same
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// --- Worker Message Handler ---
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
                // Scale click coordinates to canvas resolution
                const clickX = data.x * (canvas.width / data.canvasWidth);
                const clickY = data.y * (canvas.height / data.canvasHeight);

                const pa = winScreenButtons.playAgain;
                if (clickX > pa.x && clickX < pa.x + pa.w && clickY > pa.y && clickY < pa.y + pa.h) {
                    resetGame();
                    // If it was PVC and player went second, AI should start
                    if (gameMode === 'pvc' && !isPlayerTurn) setTimeout(aiMove, 500);
                }

                const mm = winScreenButtons.mainMenu;
                if (clickX > mm.x && clickX < mm.x + mm.w && clickY > mm.y && clickY < mm.y + mm.h) {
                    postMessage({ type: 'goToMainMenu' });
                }
            } else if (isPlayerTurn) {
                const col = Math.floor(data.x / (data.canvasWidth / columns));
                if (dropPiece(col)) {
                    isPlayerTurn = false; // Prevent player from making another move while piece is falling
                }
            }
            break;
        // ... other cases (mousemove, mouseleave, resign) are the same
        case 'mousemove':
            hoverColumn = Math.floor(data.x / (data.canvasWidth / columns));
            break;
        case 'mouseleave':
            hoverColumn = -1;
            break;
        case 'resign':
            resetGame();
            break;
    }
}

// Dummy definitions for other functions to keep it runnable
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
function getTargetRow(col) { for (let r = rows - 1; r >= 0; r--) { if (board[r][col] === 0) return r; } return -1; }
function dropPiece(col) { if (animatedPiece || col < 0 || col >= columns) return null; const targetRow = getTargetRow(col); if (targetRow === -1) return null; animatedPiece = { col, player: currentPlayer, y: -(canvas.height/rows), targetY: targetRow * (canvas.height/rows), speed: 0 }; return { row: targetRow, col }; }
function aiMove() { if (gameOver) return; let availableCols = []; for (let c = 0; c < columns; c++) { if (board[0][c] === 0) availableCols.push(c); } if (availableCols.length > 0) { const col = availableCols[Math.floor(Math.random() * availableCols.length)]; dropPiece(col); } }
function checkWin(player, r, c) { const dirs = [[0,1], [1,0], [1,1], [1,-1]]; for (const [dr, dc] of dirs) { let count = 1; for (let i = 1; i < 4; i++) { const nr = r + i * dr, nc = c + i * dc; if (nr < 0 || nr >= rows || nc < 0 || nc >= columns || board[nr][nc] !== player) break; count++; } for (let i = 1; i < 4; i++) { const nr = r - i * dr, nc = c - i * dc; if (nr < 0 || nr >= rows || nc < 0 || nc >= columns || board[nr][nc] !== player) break; count++; } if (count >= 4) return true; } return false; }
function createExplosion(col, row) { const x = col * (canvas.width/columns) + (canvas.width/columns)/2; const y = row * (canvas.height/rows) + (canvas.height/rows)/2; for (let i = 0; i < 70; i++) { particles.push(new Particle(x, y, hebrewLetters[Math.floor(Math.random() * hebrewLetters.length)])); } }


