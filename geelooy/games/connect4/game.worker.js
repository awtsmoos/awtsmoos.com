//B"H


importScripts('particle.js');

let canvas, ctx;
let board;
let currentPlayer;
let gameMode;
let gameOver = false;
let columns = 7;
let rows = 6;
let particles = [];
let hebrewLetters = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י'];
let winningPieces = [];

// --- Game Logic ---

function init(data) {
    canvas = data.canvas;
    ctx = canvas.getContext('2d');
    gameMode = data.gameMode;
    resetGame();
    resize({ width: data.width, height: data.height });

    if (gameMode === 'pvc' && !data.playerGoesFirst) {
        setTimeout(aiMove, 500);
    } else if (gameMode === 'cvc') {
        setTimeout(aiMove, 500);
    }
    gameLoop();
}

function resetGame() {
    board = Array(rows).fill(null).map(() => Array(columns).fill(0));
    currentPlayer = 1;
    gameOver = false;
    particles = [];
    winningPieces = [];
}

function dropPiece(col) {
    for (let row = rows - 1; row >= 0; row--) {
        if (board[row][col] === 0) {
            board[row][col] = currentPlayer;
            createExplosion(col, row);
            return { row, col };
        }
    }
    return null;
}

function checkWin() {
    // Check horizontal
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c <= columns - 4; c++) {
            if (board[r][c] === currentPlayer && board[r][c+1] === currentPlayer && board[r][c+2] === currentPlayer && board[r][c+3] === currentPlayer) {
                winningPieces = [{r,c}, {r,c:c+1}, {r,c:c+2}, {r,c:c+3}];
                return true;
            }
        }
    }
    // Check vertical
    for (let r = 0; r <= rows - 4; r++) {
        for (let c = 0; c < columns; c++) {
            if (board[r][c] === currentPlayer && board[r+1][c] === currentPlayer && board[r+2][c] === currentPlayer && board[r+3][c] === currentPlayer) {
                winningPieces = [{r,c}, {r:r+1,c}, {r:r+2,c}, {r:r+3,c}];
                return true;
            }
        }
    }
    // Check diagonal (down-right)
    for (let r = 0; r <= rows - 4; r++) {
        for (let c = 0; c <= columns - 4; c++) {
            if (board[r][c] === currentPlayer && board[r+1][c+1] === currentPlayer && board[r+2][c+2] === currentPlayer && board[r+3][c+3] === currentPlayer) {
                winningPieces = [{r,c}, {r:r+1,c:c+1}, {r:r+2,c:c+2}, {r:r+3,c:c+3}];
                return true;
            }
        }
    }
    // Check diagonal (up-right)
    for (let r = 3; r < rows; r++) {
        for (let c = 0; c <= columns - 4; c++) {
            if (board[r][c] === currentPlayer && board[r-1][c+1] === currentPlayer && board[r-2][c+2] === currentPlayer && board[r-3][c+3] === currentPlayer) {
                winningPieces = [{r,c}, {r:r-1,c:c+1}, {r:r-2,c:c+2}, {r:r-3,c:c+3}];
                return true;
            }
        }
    }
    return false;
}


// --- AI Logic ---

function aiMove() {
    if (gameOver) return;
    let availableCols = [];
    for (let c = 0; c < columns; c++) {
        if (board[0][c] === 0) availableCols.push(c);
    }
    
    if (availableCols.length > 0) {
        const col = availableCols[Math.floor(Math.random() * availableCols.length)];
        const move = dropPiece(col);
        if(move) handleMoveResult();
    }
}

// --- Drawing & Animation ---

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cellWidth = canvas.width / columns;
    const cellHeight = canvas.height / rows;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            // Draw the grid
            ctx.fillStyle = '#0d47a1';
            ctx.fillRect(c * cellWidth, r * cellHeight, cellWidth, cellHeight);
            
            // Draw the circle
            ctx.beginPath();
            const centerX = c * cellWidth + cellWidth / 2;
            const centerY = r * cellHeight + cellHeight / 2;
            const radius = Math.min(cellWidth, cellHeight) / 2.5;
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, false);
            
            if (board[r][c] === 1) {
                ctx.fillStyle = '#ff4d4d';
            } else if (board[r][c] === 2) {
                ctx.fillStyle = '#ffff4d';
            } else {
                ctx.fillStyle = '#1a1a1a';
            }
            ctx.fill();
        }
    }
}

function drawWinningLine() {
    if (winningPieces.length < 4) return;
    const cellWidth = canvas.width / columns;
    const cellHeight = canvas.height / rows;

    const start = winningPieces[0];
    const end = winningPieces[3];

    const startX = start.c * cellWidth + cellWidth / 2;
    const startY = start.r * cellHeight + cellHeight / 2;
    const endX = end.c * cellWidth + cellWidth / 2;
    const endY = end.r * cellHeight + cellHeight / 2;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = '#39ff14';
    ctx.lineWidth = 15;
    ctx.lineCap = 'round';
    ctx.stroke();
}

function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Player ${currentPlayer} Wins!`, canvas.width / 2, canvas.height / 2);
    ctx.font = '30px Arial';
    ctx.fillText('Click to Play Again', canvas.width / 2, canvas.height / 2 + 60);
}

function createExplosion(col, row) {
    const cellWidth = canvas.width / columns;
    const cellHeight = canvas.height / rows;
    const x = col * cellWidth + cellWidth / 2;
    const y = row * cellHeight + cellHeight / 2;
    for (let i = 0; i < 70; i++) {
        particles.push(new Particle(x, y, hebrewLetters[Math.floor(Math.random() * hebrewLetters.length)]));
    }
}

function gameLoop() {
    drawBoard();
    particles.forEach((p, index) => {
        if (p.alpha <= 0) {
            particles.splice(index, 1);
        } else {
            p.update();
            p.draw(ctx);
        }
    });

    if (gameOver) {
        drawWinningLine();
        drawGameOver();
    }
    
    requestAnimationFrame(gameLoop);
}

// --- Event Handling ---

function handleMoveResult() {
    if (checkWin()) {
        gameOver = true;
    } else {
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        if ((gameMode === 'pvc' && currentPlayer === 2) || gameMode === 'cvc') {
            setTimeout(aiMove, 500);
        }
    }
}

function handleClick(data) {
    if (gameOver) {
        resetGame();
        return;
    }

    // Prevent player from clicking during AI's turn
    if (gameMode === 'pvc' && currentPlayer === 2) return;
    if (gameMode === 'cvc') return;

    const col = Math.floor(data.x / (data.canvasWidth / columns));
    const move = dropPiece(col);
    if (move) {
        handleMoveResult();
    }
}

function resize(data) {
    canvas.width = data.width;
    canvas.height = data.height;
}

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
            handleClick(data);
            break;
        case 'resign':
            // In a real scenario, you'd post a message back to the main thread
            // For now, we can just treat it as a game over.
            gameOver = true;
            break;
    }
}




