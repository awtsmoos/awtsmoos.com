// B"H
// Handles all canvas drawing operations.

import * as State from './state.js';
import { getTouchAnchor, getControlVector } from './controls.js';

function drawUI(ctx, canvasWidth, canvasHeight) {
    const { player, gameState, ascension, bestAscension, time } = {
        player: State.getPlayer(),
        gameState: State.getGameState(),
        ascension: State.getAscension(),
        bestAscension: State.getBestAscension(),
        time: State.getTime()
    };

    const btnSize = Math.min(100, canvasWidth * 0.12);
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = '#F30'; ctx.fillRect(0, canvasHeight - btnSize, btnSize, btnSize);
    ctx.fillStyle = '#0AF'; ctx.fillRect(canvasWidth - btnSize, canvasHeight - btnSize, btnSize, btnSize);
    if (player.tikkun >= player.maxTikkun) {
        ctx.fillStyle = `hsl(${time*2 % 360}, 100%, 70%)`; 
        ctx.fillRect(canvasWidth/2 - btnSize/2, canvasHeight - btnSize, btnSize, btnSize);
    }
    ctx.globalAlpha = 1;

    ctx.font = '3vh "Courier New", monospace'; ctx.fillStyle = '#FFF';
    if (gameState === 'waiting') {
        ctx.textAlign = 'center';
        ctx.fillText("B\"H", canvasWidth/2, canvasHeight/2 - 40);
        ctx.fillText("Focus your KAVANAH. Begin the ascent.", canvasWidth/2, canvasHeight/2);
    }
    ctx.textAlign = 'left'; ctx.fillText(`ASCENSION: ${Math.floor(ascension)}`, 20, 40);
    ctx.textAlign = 'right'; ctx.fillText(`PEAK: ${Math.floor(bestAscension)}`, canvasWidth - 20, 40);
    ctx.textAlign = 'center'; ctx.font = '2.5vh "Times New Roman"'; ctx.fillText('ב״ה', canvasWidth / 2, 40);
    
    if (player.combo > 2) {
        const cameraY = State.getCameraY();
        ctx.font = `${Math.min(15, 3 + player.combo * 0.5)}vh "Courier New"`;
        ctx.fillStyle = `hsla(${180 + player.combo*5}, 100%, 70%, 0.8)`;
        ctx.fillText(`x${player.combo}`, player.x, player.y - cameraY - 60);
    }
}

export function draw(ctx, canvasWidth, canvasHeight) {
    const player = State.getPlayer();
    const entities = State.getEntities();
    const particles = State.getParticles();
    const cameraY = State.getCameraY();
    const time = State.getTime();
    const gameState = State.getGameState();
    const touchAnchor = getTouchAnchor();
    const controlVector = getControlVector();

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#010002';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.save();
    ctx.translate(0, -cameraY);
    
    const groundY = cameraY + canvasHeight;
    ctx.fillStyle = '#4A3B2A';
    ctx.fillRect(0, groundY - 20, canvasWidth, 20);

    entities.forEach(e => {
        ctx.shadowBlur = 30; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        if (e.type === 'otiot') {
            const color = e.class === 'chesed' ? '#0AF' : '#F30';
            ctx.fillStyle = color; ctx.shadowColor = color;
            ctx.font = `${e.size}px "Times New Roman"`;
            ctx.fillText(e.letter, e.x, e.y);
        } else {
            ctx.font = `${e.size}px Arial`; ctx.shadowColor = '#000';
            ctx.fillText(e.emoji, e.x, e.y);
        }
    });
    
    particles.forEach(p => p.draw(ctx, cameraY));

    if (gameState === 'playing') {
        const attuneColor = player.attunement === 'chesed' ? '#0CF' : '#F50';
        const finalColor = player.isTikkun ? '#FFF' : attuneColor;
        ctx.fillStyle = finalColor; ctx.shadowColor = finalColor; ctx.shadowBlur = 50;
        ctx.beginPath(); ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2); ctx.fill();
        if(player.isTikkun) {
            ctx.fillStyle = `rgba(255, 255, 255, 0.2)`;
            ctx.beginPath(); ctx.arc(player.x, player.y, player.radius * (8 + Math.sin(time/5)*3), 0, Math.PI*2); ctx.fill();
        }
    }
    ctx.restore();
    
    if (touchAnchor) {
        ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(touchAnchor.x, touchAnchor.y, 20, 0, Math.PI*2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(touchAnchor.x, touchAnchor.y); ctx.lineTo(touchAnchor.x + controlVector.x, touchAnchor.y + controlVector.y); ctx.stroke();
    }

    drawUI(ctx, canvasWidth, canvasHeight);
}