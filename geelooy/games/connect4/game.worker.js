//B"H

importScripts('particle.js');

let canvas, ctx;
let board;
let currentPlayer;
let gameMode;
let gameOver;
let columns = 7;
let rows = 6;
let particles = [];
let hebrewLetters = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י'];

function init(data) {
    canvas = data.canvas;
    ctx = canvas.getContext('2d');
    resize({ width: data.width, height: data.height });
    gameMode = data.gameMode;
    board = Array(rows).fill(null).map(() => Array(columns).fill(0));
    currentPlayer = 1;
    gameOver = false;
    drawBoard();

    if (gameMode === 'pvc' && !data.playerGoesFirst) {
        setTimeout(aiMove, 500);
    } else if (gameMode === 'cvc') {
        setTimeout(aiMove, 500);
    }
}

function resize(data) {
    canvas.width = data.width;
    canvas.height = data.height;
    drawBoard();
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cellWidth = canvas.width / columns;
    const cellHeight = canvas.height / rows;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            ctx.fillStyle = '#00008B';
            ctx.fillRect(col * cellWidth, row * cellHeight, cellWidth, cellHeight);
            ctx.strokeStyle = '#000000';
            ctx.strokeRect(col * cellWidth, row * cellHeight, cellWidth, cellHeight);

            ctx.beginPath();
            ctx.arc(col * cellWidth + cellWidth / 2, row * cellHeight + cellHeight / 2, cellWidth / 2.5, 0, Math.PI * 2);
            ctx.fillStyle = board[row][col] === 1 ? 'red' : board[row][col] === 2 ? 'yellow' : 'white';
            ctx.fill();
        }
    }
}

function dropPiece(col) {
    for (let row = rows - 1; row >= 0; row--) {
        if (board[row][col] === 0) {
            board[row][col] = currentPlayer;
            createExplosion(col, row);
            return true;
        }
    }
    return false;
}

function handleClick(data) {
    if (gameOver) return;
    if (gameMode === 'pvc' && currentPlayer === 2) return;

    const col = Math.floor(data.x / (data.canvasWidth / columns));
    if (dropPiece(col)) {
        drawBoard();
        if (checkWin()) {
            endGame();
        } else {
            currentPlayer = currentPlayer === 1 ? 2 : 1;
            if (gameMode === 'pvc' || gameMode === 'cvc') {
                setTimeout(aiMove, 500);
            }
        }
    }
}

function aiMove() {
    if (gameOver) return;
    let col;
    do {
        col = Math.floor(Math.random() * columns);
    } while (!dropPiece(col));

    drawBoard();
    if (checkWin()) {
        endGame();
    } else {
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        if (gameMode === 'cvc') {
            setTimeout(aiMove, 500);
        }
    }
}

function checkWin() {
    // Check horizontal, vertical and diagonal wins
    const that = this;
    function checkDirection(row, col, dRow, dCol) {
        let count = 0;
        for (let i = 0; i < 4; i++) {
            const r = row + i * dRow;
            const c = col + i * dCol;
            if (r >= 0 && r < rows && c >= 0 && c < columns && board[r][c] === currentPlayer) {
                count++;
            }
        }
        return count === 4;
    }

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (checkDirection(r, c, 0, 1) || checkDirection(r, c, 1, 0) ||
                checkDirection(r, c, 1, 1) || checkDirection(r, c, 1, -1)) {
                return true;
            }
        }
    }
    return false;
}


function endGame() {
    gameOver = true;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '50px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Player ${currentPlayer} Wins!`, canvas.width / 2, canvas.height / 2);
    // Draw connecting line would be complex, requires storing winning pieces
}

function createExplosion(col, row) {
    const cellWidth = canvas.width / columns;
    const cellHeight = canvas.height / rows;
    const x = col * cellWidth + cellWidth / 2;
    const y = row * cellHeight + cellHeight / 2;
    for (let i = 0; i < 50; i++) {
        particles.push(new Particle(x, y, hebrewLetters[Math.floor(Math.random() * hebrewLetters.length)]));
    }
}

function animate() {
    drawBoard();
    particles.forEach((p, index) => {
        p.update();
        p.draw(ctx);
        if (p.alpha <= 0) {
            particles.splice(index, 1);
        }
    });
    requestAnimationFrame(animate);
}

onmessage = function (e) {
    switch (e.data.type) {
        case 'init':
            init(e.data);
            animate();
            break;
        case 'resize':
            resize(e.data);
            break;
        case 'click':
            handleClick(e.data);
            break;
        case 'resign':
            gameOver = true;
            break;
    }
}