//B"H
function drawNet(context, canvas) {
    context.beginPath();
    context.setLineDash([5, 15]);
    context.moveTo(canvas.width / 2, 0);
    context.lineTo(canvas.width / 2, canvas.height);
    context.strokeStyle = '#fff';
    context.stroke();
    context.setLineDash([]); // Reset to solid line
}

function drawScore(context, x, y, score) {
    context.fillStyle = '#fff';
    context.font = '32px Arial';
    context.fillText(score, x, y);
}

function displayWinner(context, canvas, winner) {
    context.fillStyle = '#fff';
    context.font = '48px Arial';
    context.textAlign = 'center';
    context.fillText(winner + " Wins!", canvas.width / 2, canvas.height / 2);
}

// New function to draw the game timer
function drawTimer(context, canvas, time) {
    context.fillStyle = '#fff';
    context.font = '24px Arial';
    context.textAlign = 'center';
    context.fillText(time, canvas.width / 2, 30);
}


