//B"H


importScripts('particle.js');

// Game State
let canvas, ctx;
let board;
let currentPlayer;
let gameMode;
let gameOver = false;
let columns = 7;
let rows = 6;
let winningPieces = [];
let particles = [];
let hebrewLetters = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י'];

// Animation & Interaction State
let animatedPiece = null;
let hoverColumn = -1;
let isPlayerTurn = true;


function init(data) {
    canvas = data.canvas;
    ctx = canvas.getContext('2d');
    gameMode = data.gameMode;
    isPlayerTurn = (gameMode === 'pvp' || (gameMode === 'pvc' && data.playerGoesFirst));
    
    resize(data);
    resetGame();

    if (gameMode === 'pvc' && !data.playerGoesFirst) {
        isPlayerTurn = false;
        setTimeout(aiMove, 500);
    } else if (gameMode === 'cvc') {
        isPlayerTurn = false;
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
    animatedPiece = null;
    isPlayerTurn = (gameMode !== 'cvc');
}

// --- Game Logic & AI ---

function getTargetRow(col) {
    for (let r = rows - 1; r >= 0; r--) {
        if (board[r][0] === 0) return r;
    }
    return -1;
}

function dropPiece(col) {
    if (animatedPiece) return null; // Prevent moves during animation

    let targetRow = -1;
    for (let r = rows - 1; r >= 0; r--) {
        if (board[r][col] === 0) {
            targetRow = r;
            break;
        }
    }
    if (targetRow === -1) return null; // Column is full

    const cellHeight = canvas.height / rows;
    animatedPiece = {
        col,
        player: currentPlayer,
        y: -cellHeight,
        targetY: targetRow * cellHeight,
        speed: 15
    };

    return { row: targetRow, col };
}

function aiMove() {
    if (gameOver) return;
    let availableCols = [];
    for (let c = 0; c < columns; c++) {
        if (board[0][c] === 0) availableCols.push(c);
    }
    if (availableCols.length > 0) {
        const col = availableCols[Math.floor(Math.random() * availableCols.length)];
        dropPiece(col);
    }
}

function handleMoveCompletion(row, col) {
    board[row][col] = animatedPiece.player;
    createExplosion(col, row);
    
    if (checkWin(animatedPiece.player, row, col)) {
        gameOver = true;
    } else {
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        if (gameMode === 'pvc') {
            isPlayerTurn = !isPlayerTurn;
            if (!isPlayerTurn) setTimeout(aiMove, 500);
        } else if (gameMode === 'cvc') {
            setTimeout(aiMove, 500);
        }
    }
    animatedPiece = null;
}

function checkWin(player, r, c) {
    // This is a simplified check. A full implementation would be more robust.
    // Check horizontal
    let count = 0;
    for (let i = -3; i <= 3; i++) {
        if (c + i >= 0 && c + i < columns && board[r][c + i] === player) count++; else count = 0;
        if (count >= 4) return true;
    }
    // Check vertical
    count = 0;
    for (let i = -3; i <= 3; i++) {
        if (r + i >= 0 && r + i < rows && board[r + i][c] === player) count++; else count = 0;
        if (count >= 4) return true;
    }
    // Check diagonal (both ways)
    // ... implementation for diagonal checks would go here ...
    return false;
}

// --- Animation & Drawing Loop ---

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    // Update falling piece animation
    if (animatedPiece) {
        const cellHeight = canvas.height / rows;
        const targetPixel = animatedPiece.targetY + cellHeight / 2;
        const currentPixel = animatedPiece.y + cellHeight / 2;
        
        animatedPiece.speed += 2; // Gravity
        animatedPiece.y += animatedPiece.speed;

        if (animatedPiece.y >= animatedPiece.targetY) {
            animatedPiece.y = animatedPiece.targetY;
            const { row } = getTargetRow(animatedPiece.col);
            handleMoveCompletion(row, animatedPiece.col);
        }
    }
    // Update particles
    particles.forEach((p, index) => {
        if (p.alpha <= 0) particles.splice(index, 1);
        else p.update();
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cellWidth = canvas.width / columns;
    const cellHeight = canvas.height / rows;

    // Draw grid and existing pieces
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            ctx.fillStyle = '#0d47a1';
            ctx.fillRect(c * cellWidth, r * cellHeight, cellWidth, cellHeight);
            
            ctx.beginPath();
            const centerX = c * cellWidth + cellWidth / 2;
            const centerY = r * cellHeight + cellHeight / 2;
            const radius = Math.min(cellWidth, cellHeight) / 2.7;
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            
            let pieceColor = '#1a1a1a'; // Empty
            if (board[r][c] === 1) pieceColor = '#ff4d4d'; // Player 1
            if (board[r][c] === 2) pieceColor = '#ffff4d'; // Player 2
            ctx.fillStyle = pieceColor;
            ctx.fill();
        }
    }
    
    // Draw particles
    particles.forEach(p => p.draw(ctx));

    // Draw hover preview piece
    if (hoverColumn !== -1 && !animatedPiece && isPlayerTurn && !gameOver) {
        ctx.beginPath();
        const radius = Math.min(cellWidth, cellHeight) / 2.7;
        ctx.arc(hoverColumn * cellWidth + cellWidth / 2, cellHeight / 2, radius, 0, Math.PI * 2);
        ctx.fillStyle = currentPlayer === 1 ? 'rgba(255, 77, 77, 0.5)' : 'rgba(255, 255, 77, 0.5)';
        ctx.fill();
    }
    
    // Draw animated piece
    if (animatedPiece) {
        ctx.beginPath();
        const radius = Math.min(cellWidth, cellHeight) / 2.7;
        ctx.arc(animatedPiece.col * cellWidth + cellWidth/2, animatedPiece.y + cellHeight/2, radius, 0, Math.PI * 2);
        ctx.fillStyle = animatedPiece.player === 1 ? '#ff4d4d' : '#ffff4d';
        ctx.fill();
    }

    // Draw game over screen
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${canvas.width / 12}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(`Player ${currentPlayer} Wins!`, canvas.width / 2, canvas.height / 2);
    }
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

// --- Event Handlers ---

onmessage = function (e) {
    const { type, ...data } = e.data;
    switch (type) {
        case 'init':
            init(data);
            break;
        case 'resize':
            canvas.width = data.width;
            canvas.height = data.height;
            break;
        case 'click':
            if (isPlayerTurn && !gameOver) {
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
        case 'resign':
            resetGame(); // Or could just post a message back to main to close the worker
            break;
    }
}






