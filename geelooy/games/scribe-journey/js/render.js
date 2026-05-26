
// B"H
// js/render.js

import { TILE_SIZE } from './data/database.js';
import { resolveTileVisual } from './rendering/tileVisualResolver.js';

// --- VISUAL SETTINGS (EXTREME OPTIMIZED) ---
const SETTINGS = {
    fontSize: TILE_SIZE * 0.9,
    trailLength: 5, 
    particleLimit: 200 
};

const HUMAN_EMOJIS = new Set(['🧑','👨','👩','👴','👵','👶','🧔','👨‍🔧','👩‍🔧','🤱','🧙','👲','👳','🕵️','👮','👷','🧕','👤']);

function isHumanLike(entity) {
    const glyph = entity?.emoji || entity?.visual || '';
    return HUMAN_EMOJIS.has(glyph) || /(?:rabbi|rebbe|mother|builder|digger|guard|merchant|scribe|elder|teacher|student|maccabee|levi|person|human|father|woman|man)/i.test(`${entity?.id || ''} ${entity?.name || ''}`);
}

function avatarPalette(seed = '') {
    let hash = 0;
    for (const ch of seed) hash = ((hash << 5) - hash + ch.charCodeAt(0)) | 0;
    const clothes = ['#1c7ed6', '#9c36b5', '#2f9e44', '#e67700', '#5f3dc4', '#0b7285'];
    const skin = ['#f2c078', '#d99a5b', '#8d5524', '#f1b889'];
    const hair = ['#2b1d13', '#4a2f1b', '#d4a373', '#1f1f1f', '#6f4e37'];
    return {
        clothes: clothes[Math.abs(hash) % clothes.length],
        skin: skin[Math.abs(hash >> 3) % skin.length],
        hair: hair[Math.abs(hash >> 6) % hair.length]
    };
}

function drawHumanAvatar(ctx, entity, x, y, scale = 1) {
    const palette = avatarPalette(`${entity?.id || ''}${entity?.name || ''}${entity?.emoji || ''}`);
    const questGlow = entity?.questGiver ? 'rgba(255,215,0,0.72)' : entity?.shop ? 'rgba(0,243,255,0.48)' : 'rgba(0,0,0,0)';
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    ctx.fillStyle = 'rgba(0,0,0,0.34)';
    ctx.beginPath();
    ctx.ellipse(0, 17, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    if (questGlow !== 'rgba(0,0,0,0)') {
        ctx.strokeStyle = questGlow;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, -2, 20, 0, Math.PI * 2);
        ctx.stroke();
    }

    ctx.fillStyle = palette.clothes;
    roundRect(ctx, -9, 0, 18, 19, 7);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.lineTo(0, 17);
    ctx.stroke();

    ctx.fillStyle = palette.skin;
    ctx.beginPath();
    ctx.arc(0, -9, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = palette.hair;
    ctx.beginPath();
    ctx.arc(0, -13, 9, Math.PI, 0);
    ctx.fill();

    if ((entity?.emoji || '').includes('🧔') || /rabbi|rebbe|elder|levi/i.test(`${entity?.id || ''} ${entity?.name || ''}`)) {
        ctx.fillStyle = palette.hair;
        ctx.beginPath();
        ctx.ellipse(0, -4, 6, 6, 0, 0, Math.PI);
        ctx.fill();
    }

    ctx.fillStyle = '#101820';
    ctx.beginPath();
    ctx.arc(-3, -10, 1.2, 0, Math.PI * 2);
    ctx.arc(3, -10, 1.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(20,24,30,0.65)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, -7, 3, 0.15, Math.PI - 0.15);
    ctx.stroke();

    ctx.strokeStyle = palette.skin;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-8, 5);
    ctx.lineTo(-13, 13);
    ctx.moveTo(8, 5);
    ctx.lineTo(13, 13);
    ctx.stroke();

    ctx.strokeStyle = '#151515';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-4, 17);
    ctx.lineTo(-6, 23);
    ctx.moveTo(4, 17);
    ctx.lineTo(6, 23);
    ctx.stroke();
    ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
}

function drawEntityGlyph(ctx, entity, x, y, fontFace, bounce = 0) {
    if (isHumanLike(entity)) {
        drawHumanAvatar(ctx, entity, x, y + bounce, 1);
        return;
    }
    ctx.fillStyle = '#fff';
    ctx.fillText(entity.emoji, x, y + bounce);
}

// --- PARTICLE SYSTEM ---
class Particle {
    constructor(x, y, type, color, life, velocity) {
        this.x = x;
        this.y = y;
        this.type = type; 
        this.color = color;
        this.life = life;
        this.maxLife = life;
        this.velocity = velocity || {x: (Math.random()-0.5)*100, y: (Math.random()-0.5)*100};
        this.size = Math.random() * 4 + 2;
        this.gravity = type === 'rain' ? 500 : (type === 'spark' ? 200 : 0);
        this.friction = type === 'spark' ? 0.95 : 1;
        
        if (type === 'letter') {
            const chars = ['א','ב','ג','ד','ה','ו','ז','ח','ט','י','כ','ל','מ','נ','ס','ע','פ','צ','ק','r','ש','ת'];
            this.char = chars[Math.floor(Math.random() * chars.length)];
            this.size = 14;
        }
    }

    update(dt) {
        this.velocity.y += this.gravity * dt;
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
        
        this.x += this.velocity.x * dt;
        this.y += this.velocity.y * dt;
        this.life -= dt * 1000;
        
        if (this.type === 'smoke') this.size += dt * 10;
    }

    draw(ctx, cameraX, cameraY) {
        if (this.life <= 0) return;
        const screenX = this.x + cameraX;
        const screenY = this.y + cameraY;
        
        if (screenX < -20 || screenX > ctx.canvas.width + 20 || screenY < -20 || screenY > ctx.canvas.height + 20) return;

        ctx.globalAlpha = Math.max(0, this.life / this.maxLife);
        ctx.fillStyle = this.color;

        if (this.type === 'letter') {
            ctx.font = `${this.size}px monospace`;
            ctx.fillText(this.char, screenX, screenY);
        } else if (this.type === 'rain') {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(screenX, screenY);
            ctx.lineTo(screenX - this.velocity.x * 0.1, screenY + this.velocity.y * 0.1);
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.arc(screenX, screenY, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }
}

let particles = [];
let matrixDrops = [];
let playerTrail = []; 

export function addParticle(type, x, y, color = '#fff', count = 1) {
    for(let i=0; i<count; i++) {
        let vx = (Math.random() - 0.5) * 200;
        let vy = (Math.random() - 0.5) * 200;
        let life = 1000;

        if (type === 'rain') { vx = -50; vy = 500; life = 500; }
        if (type === 'fire') { vy = -100 - Math.random()*100; life = 600; }
        if (type === 'spark') { life = 800; }
        if (type === 'explosion') { vx *= 3; vy *= 3; life = 1200; }

        particles.push(new Particle(x, y, type, color, life, {x: vx, y: vy}));
    }
    if (particles.length > SETTINGS.particleLimit) {
        particles.splice(0, particles.length - SETTINGS.particleLimit);
    }
}

export function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update(dt);
        if (particles[i].life <= 0) particles.splice(i, 1);
    }
}

// --- RENDER PIPELINE ---

let currentOverlayColor = 'rgba(0, 0, 20, 0)';
let currentLightLevel = 1000;
let globalShake = 0;

export function updateTimeVisuals(ctx, timeOfDay = 720, weather = 'clear', moonPhase, isShabbat, lightLevel = 1000, maxLightLevel = 1000) {
    currentLightLevel = lightLevel;
    
    let opacity = 0;
    if (timeOfDay >= 360 && timeOfDay < 1080) {
        opacity = 0; // Day
    } else {
        // Night - significantly lighter max darkness
        opacity = 0.45; 
        if (timeOfDay < 360) opacity = 0.45 * (1 - (timeOfDay / 360));
        else if (timeOfDay >= 1080) opacity = 0.45 * ((timeOfDay - 1080) / 360);
    }
    
    if (isShabbat) currentOverlayColor = `rgba(100, 100, 255, ${opacity * 0.6})`; 
    else currentOverlayColor = `rgba(5, 5, 30, ${opacity})`;
}

export function renderGameState(ctx, renderState) {
    if (!ctx || !renderState || !renderState.player || renderState.mode === 'battle') return;

    const p = renderState.player;
    const map = renderState.map;
    
    if (!map) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        return;
    }
    
    // 1. Setup Camera
    let shakeX = (Math.random() - 0.5) * globalShake;
    let shakeY = (Math.random() - 0.5) * globalShake;
    if(globalShake > 0) globalShake *= 0.9;

    const cameraOffsetX = (ctx.canvas.width / 2) - (p.pixelX + TILE_SIZE / 2) + shakeX;
    const cameraOffsetY = (ctx.canvas.height / 2) - (p.pixelY + TILE_SIZE / 2) + shakeY;

    // 2. Clear & Background
    ctx.fillStyle = '#080808'; 
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // 3. Render World Layers 
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const fontFace = "'Segoe UI Emoji', 'Apple Color Emoji', sans-serif";
    ctx.font = `${SETTINGS.fontSize}px ${fontFace}`;

    const renderGrid = (layer) => {
        if(!layer) return;
        
        const startCol = Math.max(0, Math.floor((-cameraOffsetX - TILE_SIZE) / TILE_SIZE));
        const endCol = Math.min(map.width - 1, startCol + Math.ceil(ctx.canvas.width / TILE_SIZE) + 2);
        const startRow = Math.max(0, Math.floor((-cameraOffsetY - TILE_SIZE) / TILE_SIZE));
        const endRow = Math.min(layer.length - 1, startRow + Math.ceil(ctx.canvas.height / TILE_SIZE) + 2);

        for (let y = startRow; y <= endRow; y++) {
            if (!layer[y]) continue;
            for (let x = startCol; x <= endCol; x++) {
                const tile = resolveTileVisual(map, layer[y][x]);
                if (tile) {
                    const posX = Math.floor(x * TILE_SIZE + TILE_SIZE / 2 + cameraOffsetX);
                    const posY = Math.floor(y * TILE_SIZE + TILE_SIZE / 2 + cameraOffsetY);
                    
                    ctx.fillStyle = 'rgba(0,0,0,0.5)';
                    ctx.fillText(tile, posX + 2, posY + 2);
                    ctx.fillStyle = '#fff';
                    ctx.fillText(tile, posX, posY);
                }
            }
        }
    };

    renderGrid(map.baseLayer);
    renderGrid(map.overlayLayer);

    // 4. Render Entities
    const renderEntity = (e) => {
        // Guard against absent or literal invalid emoji data.
        if (!e.emoji || e.emoji === 'undefined') return; 

        const posX = e.pixelX !== undefined ? e.pixelX : e.x * TILE_SIZE;
        const posY = e.pixelY !== undefined ? e.pixelY : e.y * TILE_SIZE;
        const screenX = Math.floor(posX + TILE_SIZE / 2 + cameraOffsetX);
        const screenY = Math.floor(posY + TILE_SIZE / 2 + cameraOffsetY);

        if(screenX < -20 || screenX > ctx.canvas.width+20 || screenY < -20 || screenY > ctx.canvas.height+20) return;

        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(screenX, screenY + 15, 10, 5, 0, 0, Math.PI*2);
        ctx.fill();

        const bounce = (e.questGiver || e.shop) ? Math.sin(Date.now() / 200) * 3 : 0;
        drawEntityGlyph(ctx, e, screenX, screenY, fontFace, bounce);
        
        if (e.name) {
            ctx.font = '10px monospace';
            ctx.fillStyle = '#0f0';
            ctx.fillText(e.name, screenX, screenY - 25);
            ctx.font = `${SETTINGS.fontSize}px ${fontFace}`;
        }
    };

    if(renderState.bots) renderState.bots.forEach(renderEntity);
    if(map.interactables) Object.values(map.interactables).forEach(renderEntity);

    // 5. Render Player Trail
    if (p.isMoving) {
        playerTrail.push({x: p.pixelX, y: p.pixelY, alpha: 0.6});
        if(playerTrail.length > SETTINGS.trailLength) playerTrail.shift();
    } else {
        if(playerTrail.length > 0) playerTrail.shift();
    }

    playerTrail.forEach((pt, i) => {
        const tX = Math.floor(pt.x + TILE_SIZE / 2 + cameraOffsetX);
        const tY = Math.floor(pt.y + TILE_SIZE / 2 + cameraOffsetY);
        ctx.globalAlpha = (i / SETTINGS.trailLength) * 0.5;
        ctx.fillStyle = '#00f3ff';
        ctx.font = `${SETTINGS.fontSize}px ${fontFace}`;
        
        // Trail doesn't rotate for simplicity/style
        if(p.emoji && p.emoji !== 'undefined') {
            ctx.fillText(p.emoji, tX, tY);
        }
    });
    ctx.globalAlpha = 1;

    // 6. Render Player
    const pX = ctx.canvas.width / 2;
    const pY = ctx.canvas.height / 2;
    
    // Player Glow
    const glowGrad = ctx.createRadialGradient(pX, pY, 15, pX, pY, 70);
    glowGrad.addColorStop(0, 'rgba(0, 243, 255, 0.5)');
    glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(pX - 70, pY - 70, 140, 140);

    ctx.save();
    ctx.translate(pX, pY);
    
    // Directional Rotation
    if(p.direction === 'right') {
        ctx.scale(-1, 1); 
    } else if(p.direction === 'up') {
        ctx.rotate(Math.PI / 2); // 90 deg (Clockwise relative to Left-facing sprite = Up)
    } else if(p.direction === 'down') {
        ctx.rotate(-Math.PI / 2); // -90 deg (Counter-Clockwise relative to Left-facing sprite = Down)
    }
    
    if (p.isMoving || Math.random() < 0.05) {
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = 'red';
        if(p.emoji && p.emoji !== 'undefined') ctx.fillText(p.emoji, -2, 0); 
        ctx.fillStyle = 'blue';
        if(p.emoji && p.emoji !== 'undefined') ctx.fillText(p.emoji, 2, 0);
    }
    
    ctx.globalAlpha = 1;
    if(p.emoji && p.emoji !== 'undefined') {
        if (isHumanLike(p)) drawHumanAvatar(ctx, p, 0, 0, 1.08);
        else {
            ctx.fillStyle = '#fff';
            ctx.fillText(p.emoji, 0, 0);
        }
    }
    ctx.restore();

    // 7. Particles
    updateParticles(0.016);
    if (renderState.weather === 'rain' || map.isInsane) {
        if(Math.random() < 0.5) addParticle(map.isInsane ? 'letter' : 'rain', Math.random()*ctx.canvas.width - cameraOffsetX, Math.random()*ctx.canvas.height - cameraOffsetY - 300, map.isInsane ? '#0f0' : '#88f');
    }
    particles.forEach(pt => pt.draw(ctx, cameraOffsetX, cameraOffsetY));

    // 8. Darkness Overlay (IMPROVED)
    if (currentOverlayColor !== 'rgba(0, 0, 20, 0)') {
        // Base light radius + breathing effect + consumable boost
        const lightRadius = 180 + (Math.sin(Date.now() / 300) * 10) + (currentLightLevel / 4);
        
        const maxDim = Math.max(ctx.canvas.width, ctx.canvas.height);
        const grad = ctx.createRadialGradient(pX, pY, lightRadius * 0.4, pX, pY, maxDim * 0.8);
        
        grad.addColorStop(0, 'rgba(0,0,0,0)'); // Perfectly clear center
        grad.addColorStop(0.2, 'rgba(0,0,0,0.05)'); // Very subtle fade start
        grad.addColorStop(1, currentOverlayColor); // Dark edges

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    // 9. Matrix
    if(renderState.gateEffects?.overlay === 'matrix' || map.isInsane) drawMatrixEffect(ctx);
    
    // 10. HUD
    ctx.font = "12px monospace";
    ctx.fillStyle = "rgba(0, 255, 0, 0.9)";
    ctx.textAlign = "right";
    const xVal = p.x * 10 + p.y; 
    ctx.fillText(`RAM: OK | SHEFA: ${xVal}`, ctx.canvas.width - 10, 20);
}

function drawMatrixEffect(ctx) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; 
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = '#0F0';
    ctx.font = '14px monospace';
    
    if(matrixDrops.length < ctx.canvas.width/14) {
        for(let i=0; i<ctx.canvas.width/14; i++) matrixDrops[i] = Math.random() * ctx.canvas.height;
    }
    
    for(let i=0; i<matrixDrops.length; i++) {
        const text = String.fromCharCode(0x30A0 + Math.random() * 96);
        ctx.fillText(text, i*14, matrixDrops[i]*14);
        if(matrixDrops[i]*14 > ctx.canvas.height && Math.random() > 0.975) matrixDrops[i] = 0;
        matrixDrops[i]++;
    }
}

export function triggerShake(amount = 20) {
    globalShake = amount;
}
