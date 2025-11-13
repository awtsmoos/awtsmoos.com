// B"H
// Handles all canvas drawing operations.

import * as State from './state.js';

function drawUI(ctx, canvasWidth, canvasHeight) {
    const { player, gameState, ascension, bestAscension, time } = State;

    const btnSize = Math.min(100, canvasWidth * 0.12);
    if (player.tikkun >= player.maxTikkun) {
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = `hsl(${time*2 % 360}, 100%, 70%)`; 
        ctx.fillRect(canvasWidth/2 - btnSize/2, canvasHeight - btnSize, btnSize, btnSize);
    } else { 
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#FFF';
        const meterWidth = (player.tikkun / player.maxTikkun) * btnSize;
        ctx.fillRect(canvasWidth/2 - btnSize/2, canvasHeight - btnSize, meterWidth, btnSize);
    }
    ctx.globalAlpha = 1;

    ctx.font = '3vh "Courier New", monospace'; ctx.fillStyle = '#FFF';
    if (gameState === 'waiting') {
        ctx.textAlign = 'center';
        ctx.fillText("B\"H", canvasWidth/2, canvasHeight/2 - 40);
        ctx.fillText("Collect the glowing letters. Begin the ascent.", canvasWidth/2, canvasHeight/2);
    }
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

export function draw(ctx, canvasWidth, canvasHeight) {
    const { player, entities, particles, cameraY, time, gameState } = State;
    
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#010002';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.save();
    ctx.translate(0, -cameraY);
    
    entities.forEach(e => {
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        if (e.type === 'otiot') {
            if (e.isSacred) {
                // --- MORE INTENSE GLOW ---
                const glow = 35 + Math.sin(time/5)*15;
                ctx.shadowBlur = glow;
                ctx.shadowColor = '#FFD700';
                ctx.fillStyle = '#FFFFFF';
            } else {
                // --- MORE AMBIENT NON-SACRED LETTERS ---
                ctx.shadowBlur = 0;
                ctx.globalAlpha = 0.3;
                ctx.fillStyle = '#300842';
            }
            ctx.font = `${e.size}px "Times New Roman"`;
            ctx.fillText(e.letter, e.x, e.y);
            ctx.globalAlpha = 1.0; 
        } else {
            ctx.shadowBlur = 10; ctx.shadowColor = '#000';
            ctx.font = `${e.size}px Arial`;
            ctx.fillText(e.emoji, e.x, e.y);
        }
        ctx.shadowBlur = 0;
    });
    
    particles.forEach(p => p.draw(ctx, cameraY));

    if (gameState === 'playing') {
        const finalColor = player.isTikkun ? `hsl(${time*2 % 360}, 100%, 70%)` : '#FFF';
        ctx.fillStyle = finalColor; ctx.shadowColor = finalColor; ctx.shadowBlur = 50;
        ctx.beginPath(); ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2); ctx.fill();
        if(player.isTikkun) {
            ctx.fillStyle = `rgba(255, 255, 255, 0.2)`;
            ctx.beginPath(); ctx.arc(player.x, player.y, player.radius * (8 + Math.sin(time/5)*3), 0, Math.PI*2); ctx.fill();
        }
    }
    ctx.restore();
    
    drawUI(ctx, canvasWidth, canvasHeight);
}