// B"H
// Handles all canvas drawing operations.

import * as State from './state.js';

function drawButton(ctx, button, text) {
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(button.x, button.y, button.w, button.h);
    
    ctx.fillStyle = '#FFF';
    ctx.font = '3vh "Courier New"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, button.x + button.w / 2, button.y + button.h / 2);
}

function drawMainMenu(ctx, canvasWidth, canvasHeight) {
    const { menuButtons } = State.getUIState();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    ctx.fillStyle = '#FFF';
    ctx.font = '5vh "Times New Roman"';
    ctx.fillText("KAVANAH", canvasWidth / 2, canvasHeight * 0.25);
    
    drawButton(ctx, menuButtons.start, "Begin Ascent");
    drawButton(ctx, menuButtons.teachings, "Teachings");
}

function drawGameUI(ctx, canvasWidth, canvasHeight) {
    const { player, ascension, bestAscension, time } = State;
    const btnSize = Math.min(100, canvasWidth * 0.12);
    const btnX = canvasWidth / 2 - btnSize / 2;
    const btnY = canvasHeight - btnSize - 10;

    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(btnX, btnY, btnSize, btnSize);
    ctx.fillStyle = '#111';
    ctx.fillRect(btnX, btnY, btnSize, btnSize);

    if (player.tikkun > 0) {
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = '#FFF';
        const meterHeight = (player.tikkun / player.maxTikkun) * btnSize;
        ctx.fillRect(btnX, btnY + (btnSize - meterHeight), btnSize, meterHeight);
    }
    if (player.tikkun >= player.maxTikkun) {
        ctx.globalAlpha = 1;
        ctx.fillStyle = `hsl(${time*2 % 360}, 100%, 70%)`;
        ctx.fillRect(btnX, btnY, btnSize, btnSize);
        ctx.fillStyle = '#000';
        ctx.font = '2.5vh "Courier New"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('TIKKUN', canvasWidth / 2, btnY + btnSize / 2);
    }
    ctx.globalAlpha = 1;

    ctx.font = '3.5vh "Courier New", monospace'; 
    ctx.fillStyle = '#FFF';
    ctx.textAlign = 'left'; ctx.fillText(`ASCENSION: ${Math.floor(ascension)}`, 20, 40);
    ctx.textAlign = 'right'; ctx.fillText(`PEAK: ${Math.floor(bestAscension)}`, canvasWidth - 20, 40);
    ctx.textAlign = 'center'; ctx.font = '2.5vh "Times New Roman"'; ctx.fillText('ב״ה', canvasWidth / 2, 40);
    
    if (player.combo > 2) {
        const cameraY = State.getCameraY();
        ctx.font = `${Math.min(18, 5 + player.combo * 0.6)}vh "Courier New"`;
        ctx.fillStyle = `hsla(${45 + player.combo*5}, 100%, 70%, 0.9)`;
        ctx.fillText(`x${player.combo}`, player.x, player.y - cameraY - 70);
    }
}

function drawGround(ctx, canvasWidth) {
    const groundY = State.getGroundY();
    const gradient = ctx.createLinearGradient(0, groundY, 0, groundY + 80);
    gradient.addColorStop(0, '#0F3D0C');
    gradient.addColorStop(1, '#051404');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, groundY, canvasWidth, 200);
}

export function draw(ctx, canvasWidth, canvasHeight) {
    const { player, entities, particles, cameraY, time, gameState } = State;
    
    ctx.fillStyle = '#010002';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Only draw the main menu if the state is 'waiting'
    if (gameState === 'waiting') {
        drawMainMenu(ctx, canvasWidth, canvasHeight);
        return;
    }
    
    // Don't draw anything else if teachings are active
    if (gameState === 'teachings') {
        return;
    }

    ctx.save();
    ctx.translate(0, -cameraY);
    
    drawGround(ctx, canvasWidth);

    entities.forEach(e => e.draw(ctx));
    particles.forEach(p => p.draw(ctx));

    if (gameState === 'playing') {
        const finalColor = player.isTikkun ? `hsl(${time*2 % 360}, 100%, 70%)` : '#FFF';
        ctx.fillStyle = finalColor;
        ctx.beginPath(); ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2); ctx.fill();
        
        if(player.isTikkun) {
            ctx.fillStyle = `hsla(${time*2 % 360}, 100%, 70%, 0.25)`;
            ctx.beginPath(); ctx.arc(player.x, player.y, player.radius * 4, 0, Math.PI*2); ctx.fill();
        }
    }
    ctx.restore();
    
    drawGameUI(ctx, canvasWidth, canvasHeight);
}