// B"H
// effects.js - The Definitive High-Impact "Raw Shapes" Engine

// --- Constants ---
const HEBREW_CHARS = [
    'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ', 'ל', 'מ', 'נ', 
    'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת', 'ך', 'ם', 'ן', 'ף', 'ץ'
];
const PARTICLE_GRAVITY = 0.35; // A satisfying, weighty gravity

// --- Flexible Particle Class ---
// Can be a character or a pixel. Designed for maximum speed.
class Particle {
    constructor(config) {
        this.x = config.x; this.y = config.y; this.type = config.type;
        this.vx = config.vx; this.vy = config.vy;
        this.life = config.life; this.gravity = PARTICLE_GRAVITY;
        this.color = config.color; this.char = this.type === 'char' ? HEBREW_CHARS[Math.floor(Math.random() * HEBREW_CHARS.length)] : null;
        this.fontSize = config.fontSize;
    }
    update() {
        this.x += this.vx; this.y += this.vy; this.vy += this.gravity; this.life--;
    }
    draw(ctx, dpr) {
        ctx.fillStyle = this.color;
        if (this.type === 'char') {
            ctx.font = `${this.fontSize * dpr}px Cinzel`;
            ctx.fillText(this.char, this.x, this.y);
        } else { // Pixel
            ctx.fillRect(this.x, this.y, 2 * dpr, 2 * dpr);
        }
    }
}

// --- LightningBolt Class ---
// A raw, solid line. No fading.
class LightningBolt {
    constructor(x1, y1, x2, y2, width) {
        this.x1 = x1; this.y1 = y1; this.x2 = x2; this.y2 = y2;
        this.width = width; this.life = 9; // Snappy
    }
    update() { this.life--; }
    draw(ctx, dpr) {
        ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = this.width;
        ctx.beginPath(); ctx.moveTo(this.x1, this.y1); ctx.lineTo(this.x2, this.y2); ctx.stroke();
    }
}

// --- EffectsEngine ---
class EffectsEngine {
    constructor(ctx, dpr) {
        this.ctx = ctx; this.dpr = dpr; this.effects = [];
    }
    update() { for (let i = this.effects.length - 1; i >= 0; i--) { this.effects[i].update(); if (this.effects[i].life <= 0) { this.effects.splice(i, 1); } } }
    draw() { this.effects.forEach(effect => effect.draw(this.ctx, this.dpr)); }

    /**
     * GUARANTEED IMPACT: Triggers on piece lock. Unmissable.
     */
    triggerImpact(piece, blockSize, viewportTopY) {
        piece.matrix.forEach((row, y) => {
            row.forEach((val, x) => {
                if (val !== 0) {
                    const px = ((piece.x + x + 0.5) * blockSize) * this.dpr;
                    const py = ((piece.y + y - viewportTopY + 0.9) * blockSize) * this.dpr;
                    for (let i = 0; i < 12; i++) { // A strong burst of 12 particles
                        this.effects.push(new Particle({
                            type: 'pixel', x: px, y: py, color: COLORS[piece.typeId],
                            vx: (Math.random() - 0.5) * 11, vy: (Math.random() - 0.5) * 11,
                            life: Math.random() * 20 + 10
                        }));
                    }
                }
            });
        });
    }

    /**
     * NEW WALL SLIDE EFFECT: Triggers on failed horizontal movement.
     */
    triggerWallSlide(piece, direction, blockSize, viewportTopY) {
        const side = direction > 0 ? piece.matrix[0].length -1 : 0; // Right or left edge
        piece.matrix.forEach((row, y) => {
            if (row[side] !== 0) {
                const px = ((piece.x + side + (direction > 0 ? 1 : 0)) * blockSize) * this.dpr;
                const py = ((piece.y + y - viewportTopY + 0.5) * blockSize) * this.dpr;
                for (let i = 0; i < 3; i++) { // A small jet of 3 sparks
                    this.effects.push(new Particle({
                        type: 'pixel', x: px, y: py, color: '#FFFFFF',
                        vx: -direction * (Math.random() * 4 + 2), // Shoots away from the wall
                        vy: (Math.random() - 0.5) * 4,
                        life: Math.random() * 15 + 5
                    }));
                }
            }
        });
    }

    /**
     * INSANE LINE CLEAR: A massive, satisfying, and performant explosion.
     */
    triggerLineClear(clearedLines, blockSize, viewportTopY, canvasWidth) {
        clearedLines.forEach(y => {
            const lineY = ((y - viewportTopY + 0.5) * blockSize) * this.dpr;
            // 1. Massive Hebrew Letter & Pixel Explosion
            for (let i = 0; i < 150; i++) {
                const isChar = Math.random() > 0.6;
                this.effects.push(new Particle({
                    type: isChar ? 'char' : 'pixel',
                    x: Math.random() * canvasWidth * this.dpr,
                    y: lineY + (Math.random() - 0.5) * 30 * this.dpr,
                    vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 20,
                    life: Math.random() * 70 + 40,
                    color: `hsl(${Math.random() * 60 + 180}, 100%, 85%)`,
                    fontSize: Math.random() * 16 + 10
                }));
            }
            // 2. Powerful Lightning Storm
            this.createProceduralBolt(lineY, canvasWidth * this.dpr, 50 * this.dpr, 6);
        });
    }

    // Generator for lightning
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
}