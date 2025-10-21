// B"H
// effects.js - FINAL High-Intensity Effects Engine

// --- Constants ---
const HEBREW_CHARS = [
    'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ', 'ל', 'מ', 'נ', 
    'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת', 'ך', 'ם', 'ן', 'ף', 'ץ'
];
const PARTICLE_GRAVITY = 0.25;

// --- Particle Class (Unchanged but will be used more) ---
class Particle {
    constructor(config) {
        this.x = config.x; this.y = config.y; this.type = config.type || 'pixel';
        this.vx = config.vx || (Math.random() - 0.5) * 5; this.vy = config.vy || (Math.random() * -8) - 2;
        this.life = config.life || Math.random() * 60 + 30; this.gravity = config.gravity || PARTICLE_GRAVITY;
        this.color = config.color || '#FFFFFF'; this.char = config.char || HEBREW_CHARS[Math.floor(Math.random() * HEBREW_CHARS.length)];
        this.fontSize = config.fontSize || 16; this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    }
    update() { this.x += this.vx; this.y += this.vy; this.vy += this.gravity; this.rotation += this.rotationSpeed; this.life--; }
    draw(ctx, dpr) {
        const alpha = this.life / 60; ctx.globalAlpha = Math.max(0, alpha);
        if (this.type === 'char') {
            ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.rotation);
            ctx.font = `${this.fontSize * dpr}px Cinzel`; ctx.fillStyle = this.color;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(this.char, 0, 0);
            ctx.restore();
        } else { ctx.fillStyle = this.color; ctx.fillRect(this.x, this.y, 2 * dpr, 2 * dpr); }
        ctx.globalAlpha = 1.0;
    }
}

// --- LightningBolt Class (Unchanged) ---
class LightningBolt {
    constructor(x1, y1, x2, y2, width) {
        this.x1 = x1; this.y1 = y1; this.x2 = x2; this.y2 = y2;
        this.width = width; this.life = 12;
    }
    update() { this.life--; }
    draw(ctx, dpr) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.life / 12})`; ctx.lineWidth = this.width;
        ctx.beginPath(); ctx.moveTo(this.x1, this.y1); ctx.lineTo(this.x2, this.y2); ctx.stroke();
    }
}

// --- EffectsEngine Class (Completely Overhauled Logic) ---
class EffectsEngine {
    constructor(ctx, dpr) {
        this.ctx = ctx; this.dpr = dpr; this.effects = [];
    }
    update() { for (let i = this.effects.length - 1; i >= 0; i--) { this.effects[i].update(); if (this.effects[i].life <= 0) { this.effects.splice(i, 1); } } }
    draw() { this.effects.forEach(effect => effect.draw(this.ctx, this.dpr)); }

    /**
     * OVERHAULED: Triggers on EVERY piece lock. More intense.
     */
    triggerImpact(piece, blockSize, viewportTopY) {
        piece.matrix.forEach((row, y) => {
            row.forEach((val, x) => {
                if (val !== 0) {
                    const px = ((piece.x + x + 0.5) * blockSize) * this.dpr;
                    const py = ((piece.y + y - viewportTopY + 0.8) * blockSize) * this.dpr;
                    
                    // 1. Mini Particle Explosion
                    for (let i = 0; i < 10; i++) {
                        this.effects.push(new Particle({
                            x: px, y: py, color: COLORS[piece.typeId],
                            vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6 - 2,
                            life: Math.random() * 20 + 10, gravity: 0.15
                        }));
                    }

                    // 2. Basic Lightning Crackle
                    for (let i = 0; i < 2; i++) {
                        const endX = px + (Math.random() - 0.5) * 50 * this.dpr;
                        const endY = py + (Math.random() - 0.5) * 50 * this.dpr;
                        this.effects.push(new LightningBolt(px, py, endX, endY, (Math.random() * 1 + 1) * this.dpr));
                    }
                }
            });
        });
    }

    /**
     * OVERHAULED: Triggers when lines are cleared. Way more insane.
     */
    triggerLineClear(clearedLines, blockSize, viewportTopY, canvasWidth) {
        clearedLines.forEach(y => {
            const lineY = ((y - viewportTopY + 0.5) * blockSize) * this.dpr;

            // 1. MASSIVE Hebrew Letter & Particle Explosion
            for (let i = 0; i < 200; i++) { // From 30 to 200!
                const isChar = Math.random() > 0.5;
                this.effects.push(new Particle({
                    type: isChar ? 'char' : 'pixel',
                    x: Math.random() * canvasWidth * this.dpr,
                    y: lineY + (Math.random() - 0.5) * 20,
                    vx: (Math.random() - 0.5) * (isChar ? 8 : 12), // Pixels move faster
                    vy: (Math.random() - 0.5) * 15, // Explode in all directions
                    fontSize: Math.random() * 15 + 10,
                    color: `hsl(${Math.random() * 50 + 180}, 100%, 80%)`, // Icy blue/white/cyan palette
                    life: Math.random() * 80 + 40 // Longer lifespan
                }));
            }

            // 2. INSANE Lightning Storm
            // Main horizontal bolt is now thicker and more jagged
            this.createProceduralBolt(lineY, canvasWidth * this.dpr, 50 * this.dpr, 6); 
            
            // Add vertical "shattering" bolts across the whole line
            for (let i = 0; i < COLS; i++) {
                const shatterX = ((i + 0.5) * blockSize) * this.dpr;
                const topY = ((y - viewportTopY) * blockSize) * this.dpr;
                const bottomY = ((y - viewportTopY + 1) * blockSize) * this.dpr;
                this.createVerticalBolt(shatterX, topY, bottomY);
            }
        });
    }
    
    // Unchanged from previous version
    triggerHardDropTrail(x, y, width, color, blockSize, viewportTopY) {
        const startY = ((y - viewportTopY) * blockSize) * this.dpr; const startX = (x * blockSize) * this.dpr;
        const trailWidth = (width * blockSize) * this.dpr;
        for (let i = 0; i < 5; i++) {
            this.effects.push(new Particle({
                x: startX + Math.random() * trailWidth, y: startY,
                vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2,
                life: 15, gravity: 0.05, color: color
            }));
        }
    }

    // Generator for the main horizontal lightning on line clear
    createProceduralBolt(y, width, maxOffset, iterations) {
        let segments = [{ x: 0, y: y }, { x: width, y: y }];
        for (let i = 0; i < iterations; i++) {
            let newSegments = [segments[0]];
            for (let j = 0; j < segments.length - 1; j++) {
                const p1 = segments[j], p2 = segments[j + 1];
                const midX = (p1.x + p2.x) / 2, midY = (p1.y + p2.y) / 2;
                const offset = (Math.random() - 0.5) * maxOffset * (1 - i / iterations);
                newSegments.push({ x: midX, y: midY + offset }, p2);
            }
            segments = newSegments;
        }
        for (let i = 0; i < segments.length - 1; i++) {
            this.effects.push(new LightningBolt(segments[i].x, segments[i].y, segments[i+1].x, segments[i+1].y, (Math.random() * 2 + 1) * this.dpr));
        }
    }

    // NEW Generator for the vertical "shatter" bolts on line clear
    createVerticalBolt(x, topY, bottomY) {
        let segments = [{ x: x, y: topY }, { x: x, y: bottomY }];
        const iterations = 4;
        const maxOffset = 15 * this.dpr;
        for (let i = 0; i < iterations; i++) {
            let newSegments = [segments[0]];
            for (let j = 0; j < segments.length - 1; j++) {
                const p1 = segments[j], p2 = segments[j + 1];
                const midX = (p1.x + p2.x) / 2, midY = (p1.y + p2.y) / 2;
                const offset = (Math.random() - 0.5) * maxOffset;
                newSegments.push({ x: midX + offset, y: midY }, p2);
            }
            segments = newSegments;
        }
        for (let i = 0; i < segments.length - 1; i++) {
            this.effects.push(new LightningBolt(segments[i].x, segments[i].y, segments[i+1].x, segments[i+1].y, 1 * this.dpr));
        }
    }
}