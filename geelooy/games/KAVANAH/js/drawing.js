// B"H
// Handles all canvas drawing operations.

import * as State from './state.js';

function drawButton(ctx, button, text, isActive = false) {
    ctx.strokeStyle = isActive ? '#FFFF00' : '#FFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(button.x, button.y, button.w, button.h);
    ctx.fillStyle = '#FFF';
    ctx.fillText(text, button.x + button.w / 2, button.y + button.h / 2);
}

function drawMainMenu(ctx, canvasWidth, canvasHeight) {
    const { menuButtons } = State.getUIState();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    ctx.font = '5vh "Times New Roman"';
    ctx.fillText("KAVANAH", canvasWidth / 2, canvasHeight * 0.25);
    
    ctx.font = '3vh "Courier New"';
    drawButton(ctx, menuButtons.start, "Begin Ascent");
    drawButton(ctx, menuButtons.teachings, "Teachings");
}

function drawTeachings(ctx, canvasWidth, canvasHeight) {
    const { menuButtons } = State.getUIState();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = '4vh "Times New Roman"';
    ctx.fillText("The Four Worlds", canvasWidth / 2, canvasHeight * 0.15);

    ctx.font = '2.2vh "Courier New"';
    ctx.textAlign = 'left';
    const textX = canvasWidth * 0.1;
    const textWidth = canvasWidth * 0.8;
    let textY = canvasHeight * 0.25;

    const lines = [
        "This game is based on the four levels of creation:",
        "",
        "DOMEM (Inanimate): The letters. The fundamental,",
        "silent potential of reality.",
        "",
        "TZOMEACH (Vegetative): The plants which grow",
        "upwards, representing emotions and attributes.",
        "",
        "CHAI (Living): The animals, representing the",
        "more complex life force.",
        "",
        "MEDABER (Speaking): The human soul. You.",
        "Your purpose is to descend and find the holiness",
        "within the letters to achieve TIKKUN (Rectification)."
    ];

    lines.forEach(line => {
        ctx.fillText(line, textX, textY);
        textY += 30;
    });
    
    ctx.textAlign = 'center';
    drawButton(ctx, menuButtons.back, "Back");
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

    ctx.font = '3vh "Courier New", monospace'; ctx.fillStyle = '#FFF';
    ctx.textAlign = 'left'; ctx.fillText(`ASCENSION: ${Math.floor(ascension)}`, 20, 40);
    ctx.textAlign = 'right'; ctx.fillText(`PEAK: ${Math.floor(bestAscension)}`, canvasWidth - 20, 40);
    ctx.textAlign = 'center'; ctx.font = '2.5vh "Times New Roman"'; ctx.fillText('ב״ה', canvasWidth / 2, 40);
    
    if (player.combo > 2) {
        const cameraY = State.getCameraY();
        ctx.font = `${Math.min(15, 3 + player.combo * 0.5)}vh "Courier New"`;
        ctx.fillStyle = `hsla(${45 + player.combo*5}, 100%, 70%, 0.9)`;
        ctx.fillText(`x${player.combo}`, player.x, player.y - cameraY - 60);
    }
}

function drawGround(ctx, canvasWidth) {
    const groundY = State.getGroundY();
    const gradient = ctx.createLinearGradient(0, groundY, 0, groundY + 80);
    gradient.addColorStop(0, '#0F3D0C'); // Dark green
    gradient.addColorStop(1, '#051404'); // Deeper green
    ctx.fillStyle = gradient;
    ctx.fillRect(0, groundY, canvasWidth, 200);
}


export function draw(ctx, canvasWidth, canvasHeight) {
    const { player, entities, particles, cameraY, time, gameState, ascension } = State;
    
    ctx.fillStyle = '#010002';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    if (gameState === 'waiting') {
        drawMainMenu(ctx, canvasWidth, canvasHeight);
        return;
    }
    if (gameState === 'teachings') {
        drawTeachings(ctx, canvasWidth, canvasHeight);
        return;
    }

    ctx.save();
    ctx.translate(0, -cameraY);
    
    // --- NEW: Draw the ground if ascension is high enough ---
    if (ascension > 500) {
        drawGround(ctx, canvasWidth);
    }

    entities.forEach(e => e.draw(ctx));
    particles.forEach(p => p.draw(ctx));

    if (gameState === 'playing') {
        const finalColor = player.isTikkun ? `hsl(${time*2 % 360}, 100%, 70%)` : '#FFF';
        ctx.fillStyle = finalColor;
        ctx.beginPath(); ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2); ctx.fill();
        if(player.isTikkun) {
            ctx.fillStyle = `rgba(255, 255, 255, 0.2)`;
            ctx.beginPath(); ctx.arc(player.x, player.y, player.radius * (8 + Math.sin(time/5)*3), 0, Math.PI*2); ctx.fill();
        }
    }
    ctx.restore();
    
    drawGameUI(ctx, canvasWidth, canvasHeight);
}