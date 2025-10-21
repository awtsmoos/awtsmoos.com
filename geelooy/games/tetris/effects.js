// B"H
// effects.js - The ULTIMATE High-Impact "Raw Shapes" Engine

const HEBREW_CHARS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת', 'ך', 'ם', 'ן', 'ף', 'ץ'];
const PARTICLE_GRAVITY = 0.5; // Faster gravity
// --- CHANGE: A lot fewer max particles ---
const MAX_PARTICLES = 450;

class Effect {
    constructor(config) { this.x = config.x; this.y = config.y; this.vx = config.vx; this.vy = config.vy; this.life = config.life; this.gravity = PARTICLE_GRAVITY; }
    update() { this.x += this.vx; this.y += this.vy; this.vy += this.gravity; this.life--; }
}

class Shard extends Effect {
    constructor(config) { super(config); this.color = config.color; this.size = config.size; this.angle = Math.random() * Math.PI * 2; this.rotationSpeed = (Math.random() - 0.5) * 0.6; }
    draw(ctx, dpr, scale = 1) { ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.angle); ctx.fillStyle = this.color; const s = this.size * scale; ctx.beginPath(); ctx.moveTo(0, -s * dpr); ctx.lineTo(s * 0.866 * dpr, s * 0.5 * dpr); ctx.lineTo(-s * 0.866 * dpr, s * 0.5 * dpr); ctx.closePath(); ctx.fill(); ctx.restore(); this.angle += this.rotationSpeed; }
}

class CharacterParticle extends Effect {
    constructor(config) { super(config); this.type = config.type; this.color = config.color; this.char = this.type === 'char' ? HEBREW_CHARS[Math.floor(Math.random() * HEBREW_CHARS.length)] : null; this.fontSize = config.fontSize; }
    draw(ctx, dpr, scale = 1) { const s = this.fontSize * scale; if (this.type === 'char') { ctx.font = `bold ${s * dpr}px Cinzel`; ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 3 * dpr * scale; ctx.strokeText(this.char, this.x, this.y); ctx.fillStyle = this.color; ctx.fillText(this.char, this.x, this.y); } else { ctx.fillStyle = this.color; ctx.fillRect(this.x, this.y, 3 * dpr * scale, 3 * dpr * scale); } }
}

class LightningBolt extends Effect {
    constructor(x1, y1, x2, y2, width) { super({x:0, y:0, vx:0, vy:0, life: 6}); this.x1 = x1; this.y1 = y1; this.x2 = x2; this.y2 = y2; this.width = width; }
    update() { this.life--; }
    draw(ctx, dpr) { ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = this.width * dpr; ctx.beginPath(); ctx.moveTo(this.x1, this.y1); ctx.lineTo(this.x2, this.y2); ctx.stroke(); }
}

class EffectsEngine {
    constructor(ctx, dpr) { this.ctx = ctx; this.dpr = dpr; this.effects = []; }
    addEffect(effect) { if (this.effects.length >= MAX_PARTICLES) { this.effects.shift(); } this.effects.push(effect); }
    update() { for (let i = this.effects.length - 1; i >= 0; i--) { this.effects[i].update(); if (this.effects[i].life <= 0) { this.effects.splice(i, 1); } } }
    draw() { const p = this.effects.length / MAX_PARTICLES; const s = p > 0.5 ? 1 - (p - 0.5) * 0.8 : 1; this.effects.forEach(e => e.draw(this.ctx, this.dpr, s)); }

    // --- CHANGE: All particles are faster with shorter lifespans ---
    triggerImpact(piece, blockSize, viewportTopY) {
        piece.matrix.forEach((row, y) => {
            row.forEach((val, x) => {
                if (val !== 0) {
                    const px = (piece.x + x + 0.5) * blockSize; const py = (piece.y + y - viewportTopY + 0.9) * blockSize;
                    for (let i = 0; i < 15; i++) { this.addEffect(new Shard({ x: px, y: py, color: COLORS[piece.typeId], vx: (Math.random() - 0.5) * 45, vy: (Math.random() - 0.5) * 45 - 10, life: Math.random() * 20 + 15, size: Math.random() * 8 + 5 })); }
                    for (let i = 0; i < 6; i++) { this.addEffect(new CharacterParticle({ type: 'char', x: px, y: py, color: Object.values(COLORS)[Math.floor(Math.random() * 7)], vx: (Math.random() - 0.5) * 35, vy: (Math.random() - 0.5) * 35 - 12, life: Math.random() * 25 + 20, fontSize: Math.random() * 20 + 20 })); }
                    for (let i = 0; i < 10; i++) { this.addEffect(new CharacterParticle({ type: 'spark', x: px, y: py, color: '#FFFFFF', vx: (Math.random() - 0.5) * 30, vy: (Math.random() - 0.5) * 30 - 8, life: Math.random() * 15 + 10 })); }
                }
            });
        });
    }

    triggerWallSlide(piece, direction, blockSize, viewportTopY) {
        const side = direction > 0 ? piece.matrix[0].length - 1 : 0;
        piece.matrix.forEach((row, y) => {
            if (row[side] !== 0) {
                const px = (piece.x + side + (direction > 0 ? 1 : 0)) * blockSize; const py = (piece.y + y - viewportTopY + 0.5) * blockSize;
                for (let i = 0; i < 4; i++) { this.addEffect(new Shard({ x: px, y: py, color: '#FFFFFF', vx: -direction * (Math.random() * 8 + 7), vy: (Math.random() - 0.5) * 12, life: Math.random() * 15 + 10, size: Math.random() * 5 + 3 })); }
                for (let i = 0; i < 4; i++) { this.addEffect(new CharacterParticle({ type: 'spark', x: px, y: py, color: '#FFFFFF', vx: -direction * (Math.random() * 10 + 7), vy: (Math.random() - 0.5) * 10, life: Math.random() * 12 + 8 })); }
            }
        });
    }

    triggerLineClear(clearedLines, blockSize, viewportTopY, canvasWidth) {
        clearedLines.forEach(y => {
            const lineY = (y - viewportTopY + 0.5) * blockSize;
            for (let i = 0; i < 200; i++) {
                const randomChoice = Math.random(); const randomColor = Object.values(COLORS)[Math.floor(Math.random() * 7)];
                if (randomChoice < 0.7) { this.addEffect(new Shard({ x: Math.random() * canvasWidth, y: lineY, color: randomColor, vx: (Math.random() - 0.5) * 70, vy: (Math.random() - 0.5) * 70, life: Math.random() * 25 + 20, size: Math.random() * 10 + 6 }));
                } else if (randomChoice < 0.9) { this.addEffect(new CharacterParticle({ type: 'char', x: Math.random() * canvasWidth, y: lineY, color: randomColor, vx: (Math.random() - 0.5) * 50, vy: (Math.random() - 0.5) * 50, life: Math.random() * 30 + 20, fontSize: Math.random() * 22 + 18 }));
                } else { this.addEffect(new CharacterParticle({ type: 'spark', x: Math.random() * canvasWidth, y: lineY, color: '#FFFFFF', vx: (Math.random() - 0.5) * 60, vy: (Math.random() - 0.5) * 60, life: Math.random() * 20 + 15 })); }
            }
            this.createProceduralBolt(lineY, canvasWidth, 80 * this.dpr, 8);
        });
    }
    
    createProceduralBolt(y, width, maxOffset, iterations) { let s = [{ x: 0, y: y }, { x: width, y: y }]; for (let i = 0; i < iterations; i++) { let n = [s[0]]; for (let j = 0; j < s.length - 1; j++) { const p1 = s[j], p2 = s[j + 1]; const mX = (p1.x + p2.x) / 2, mY = (p1.y + p2.y) / 2; const o = (Math.random() - 0.5) * maxOffset; n.push({ x: mX, y: mY + o }, p2); } s = n; } for (let i = 0; i < s.length - 1; i++) { this.addEffect(new LightningBolt(s[i].x, s[i].y, s[i+1].x, s[i+1].y, (Math.random() * 4 + 3))); } }
}