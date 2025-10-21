// B"H
// effects.js - The Complete and Corrected Effects Engine

// --- Constants ---
const HEBREW_CHARS = [
    'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 
    'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת'
];
const PARTICLE_GRAVITY = 0.2;

// --- Particle Class ---
class Particle {
    constructor(config) {
        this.x = config.x; this.y = config.y; this.type = config.type || 'pixel';
        this.vx = config.vx || (Math.random() - 0.5) * 5;
        this.vy = config.vy || (Math.random() * -8) - 2;
        this.life = config.life || Math.random() * 60 + 30;
        this.gravity = config.gravity || PARTICLE_GRAVITY;
        this.color = config.color || '#FFFFFF';
        this.char = config.char || HEBREW_CHARS[Math.floor(Math.random() * HEBREW_CHARS.length)];
        this.fontSize = config.fontSize || 16;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    }
    update() {
        this.x += this.vx; this.y += this.vy; this.vy += this.gravity;
        this.rotation += this.rotationSpeed; this.life--;
    }
    draw(ctx, dpr) {
        const alpha = this.life / 60; ctx.globalAlpha = Math.max(0, alpha);
        if (this.type === 'char') {
            ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.rotation);
            ctx.font = `${this.fontSize * dpr}px Cinzel`; ctx.fillStyle = this.color;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(this.char, 0, 0); ctx.restore();
        } else {
            ctx.fillStyle = this.color; ctx.fillRect(this.x, this.y, 2 * dpr, 2 * dpr);
        }
        ctx.globalAlpha = 1.0;
    }
}

// --- LightningBolt Class (THIS WAS THE MISSING PART) ---
class LightningBolt {
    constructor(x1, y1, x2, y2, width) {
        this.x1 = x1; this.y1 = y1; this.x2 = x2; this.y2 = y2;
        this.width = width; this.life = 12; // Short lifespan for a quick flash
    }
    update() {
        this.life--;
    }
    draw(ctx, dpr) {
        // The lightning fades out as it dies.
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.life / 12})`;
        ctx.lineWidth = this.width;
        ctx.beginPath(); ctx.moveTo(this.x1, this.y1); ctx.lineTo(this.x2, this.y2);
        ctx.stroke();
    }
}

// --- EffectsEngine Class ---
class EffectsEngine {
    constructor(ctx, dpr) {
        this.ctx = ctx; this.dpr = dpr; this.effects = [];
    }
    update() {
        for (let i = this.effects.length - 1; i >= 0; i--) {
            this.effects[i].update();
            if (this.effects[i].life <= 0) {
                this.effects.splice(i, 1);
            }
        }
    }
    draw() {
        this.effects.forEach(effect => effect.draw(this.ctx, this.dpr));
    }
    triggerImpact(piece, blockSize, viewportTopY) {
        piece.matrix.forEach((row, y) => {
            row.forEach((val, x) => {
                if (val !== 0) {
                    const px = ((piece.x + x + 0.5) * blockSize) * this.dpr;
                    const py = ((piece.y + y - viewportTopY + 0.8) * blockSize) * this.dpr;
                    for (let i = 0; i < 2; i++) {
                        this.effects.push(new Particle({
                            x: px, y: py, color: COLORS[piece.typeId],
                            vx: (Math.random() - 0.5) * 3, vy: Math.random() * -3, life: 20
                        }));
                    }
                }
            });
        });
    }
    triggerHardDropTrail(x, y, width, color, blockSize, viewportTopY) {
        const startY = ((y - viewportTopY) * blockSize) * this.dpr;
        const startX = (x * blockSize) * this.dpr;
        const trailWidth = (width * blockSize) * this.dpr;
        for (let i = 0; i < 5; i++) {
            this.effects.push(new Particle({
                x: startX + Math.random() * trailWidth, y: startY,
                vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2,
                life: 15, gravity: 0.05, color: color
            }));
        }
    }
    triggerLineClear(clearedLines, blockSize, viewportTopY, canvasWidth) {
        clearedLines.forEach(y => {
            const lineY = ((y - viewportTopY + 0.5) * blockSize) * this.dpr;
            for (let i = 0; i < 30; i++) {
                this.effects.push(new Particle({
                    type: 'char', x: Math.random() * canvasWidth * this.dpr, y: lineY,
                    fontSize: Math.random() * 12 + 8,
                    color: `hsl(${Math.random() * 360}, 100%, 75%)`
                }));
            }
            this.createProceduralBolt(lineY, canvasWidth * this.dpr);
        });
    }
    createProceduralBolt(y, width) {
        const startX = 0, endX = width;
        let segments = [{ x: startX, y: y }, { x: endX, y: y }];
        const iterations = 5, maxOffset = 30 * this.dpr;
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
            // This is the line that was causing the error
            this.effects.push(new LightningBolt(
                segments[i].x, segments[i].y, segments[i+1].x, segments[i+1].y,
                (Math.random() * 1.5 + 0.5) * this.dpr
            ));
        }
    }
}