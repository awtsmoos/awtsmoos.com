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

/**
 * Correctly resizes the canvas properties. This is called from init and onmessage.
 * This is defined before init to prevent the ReferenceError.
 */
function resize(data) {
    if (!canvas) return; // Guard clause to prevent error if called before init
    canvas.width = data.width;
    canvas.height = data.height;
}

/**
 * Initializes the game state, canvas, and starts the game loop.
 */
function init(data) {
    canvas = data.canvas;
    ctx = canvas.getContext('2d');
    gameMode = data.gameMode;
    isPlayerTurn = (gameMode === 'pvp' || (gameMode === 'pvc' && data.playerGoesFirst));
    
    // The initial resize is now safely called after canvas is assigned.
    resize({ width: data.width, height: data.height });
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

/**
 * Resets the game to its initial state.
 */
function resetGame() {
    board = Array(rows).fill(null).map(() => Array(columns).fill(0));
    currentPlayer = 1;
    gameOver = false;
    particles = [];
    winningPieces = [];
    animatedPiece = null;
    isPlayerTurn = (gameMode !== 'cvc'); // Player's turn unless it's Golem vs Golem
}

// --- Game Logic, Animation, and Drawing functions would go here ---
// (The rest of the file is the same as the previous correct version)

// --- The rest of the game.worker.js file ---
function getTargetRow(col) {
    for (let r = rows - 1; r >= 0; r--) {
        if (board[r][col] === 0) return r;
    }
    return -1;
}

function dropPiece(col) {
    if (animatedPiece || col < 0 || col >= columns) return null;

    const targetRow = getTargetRow(col);
    if (targetRow === -1) return null;

    const cellHeight = canvas.height / rows;
    animatedPiece = {
        col,
        player: currentPlayer,
        y: -cellHeight,
        targetY: targetRow * cellHeight,
        speed: 0,
        bounce: 0
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
        } else {
             isPlayerTurn = true;
        }
    }
    animatedPiece = null;
}

function checkWin(player, r, c) {
    // This is a more robust win check
    const directions = [[0,1], [1,0], [1,1], [1,-1]]; // H, V, D-R, D-L
    for (const [dr, dc] of directions) {
        let count = 1;
        for (let i = 1; i < 4; i++) {
            const nr = r + i * dr, nc = c + i * dc;
            if (nr < 0 || nr >= rows || nc < 0 || nc >= columns || board[nr][nc] !== player) break;
            count++;
        }
        for (let i = 1; i < 4; i++) {
            const nr = r - i * dr, nc = c - i * dc;
            if (nr < 0 || nr >= rows || nc < 0 || nc >= columns || board[nr][nc] !== player) break;
            count++;
        }
        if (count >= 4) return true;
    }
    return false;
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    if (animatedPiece) {
        const gravity = 0.8;
        animatedPiece.speed += gravity;
        animatedPiece.y += animatedPiece.speed;

        if (animatedPiece.y >= animatedPiece.targetY) {
            animatedPiece.y = animatedPiece.targetY;
            handleMoveCompletion(getTargetRow(animatedPiece.col), animatedPiece.col);
        }
    }
    particles.forEach((p, index) => {
        if (p.alpha <= 0) particles.splice(index, 1);
        else p.update();
    });
}

function draw() {
    if (!ctx) return;
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

onmessage = function (e) {
    const { type, ...data } = e.data;
    switch (type) {
        case 'init':
            init(data);
            break;
        case 'resize':
            // The resize function now has a guard clause making this safe
            resize(data);
            break;
        case 'click':
            if (isPlayerTurn && !gameOver) {
                const col = Math.floor(data.x / (data.canvasWidth / columns));
                if(dropPiece(col)) {
                    isPlayerTurn = false; // Prevent spam clicking
                }
            }
            break;
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



