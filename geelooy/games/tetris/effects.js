// B"H
// effects.js - Advanced Procedural Effects Engine

// --- Constants ---
const HEBREW_CHARS = [
    'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 
    'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת'
];
const PARTICLE_GRAVITY = 0.2;

// --- Particle Class ---
// A flexible particle that can be a pixel, a character, or other shapes.
class Particle {
    constructor(config) {
        this.x = config.x;
        this.y = config.y;
        this.type = config.type || 'pixel'; // 'pixel', 'char'

        // Physics
        this.vx = config.vx || (Math.random() - 0.5) * 5;
        this.vy = config.vy || (Math.random() * -8) - 2;
        this.life = config.life || Math.random() * 60 + 30;
        this.gravity = config.gravity || PARTICLE_GRAVITY;

        // Visuals
        this.color = config.color || '#FFFFFF';
        this.char = config.char || HEBREW_CHARS[Math.floor(Math.random() * HEBREW_CHARS.length)];
        this.fontSize = config.fontSize || 16;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.rotation += this.rotationSpeed;
        this.life--;
    }

    draw(ctx, dpr) {
        const alpha = this.life / 60; // Fade out
        ctx.globalAlpha = Math.max(0, alpha);

        if (this.type === 'char') {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.font = `${this.fontSize * dpr}px Cinzel`;
            ctx.fillStyle = this.color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.char, 0, 0);
            ctx.restore();
        } else { // Default to 'pixel'
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, 2 * dpr, 2 * dpr);
        }
        ctx.globalAlpha = 1.0;
    }
}

// --- EffectsEngine Class ---
// This is the main controller that GameInstance will use.
class EffectsEngine {
    constructor(ctx, dpr) {
        this.ctx = ctx;
        this.dpr = dpr;
        this.effects = [];
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

    // --- EFFECT TRIGGERS ---

    // Effect for a piece landing
    triggerImpact(piece, blockSize, viewportTopY) {
        piece.matrix.forEach((row, y) => {
            row.forEach((val, x) => {
                if (val !== 0) {
                    const px = ((piece.x + x + 0.5) * blockSize) * this.dpr;
                    const py = ((piece.y + y - viewportTopY + 0.8) * blockSize) * this.dpr;
                    for (let i = 0; i < 2; i++) {
                        this.effects.push(new Particle({
                            x: px, y: py,
                            color: COLORS[piece.typeId],
                            vx: (Math.random() - 0.5) * 3,
                            vy: Math.random() * -3,
                            life: 20
                        }));
                    }
                }
            });
        });
    }

    // A trail of particles for hard drops
    triggerHardDropTrail(x, y, width, color, blockSize, viewportTopY) {
        const startY = ((y - viewportTopY) * blockSize) * this.dpr;
        const startX = (x * blockSize) * this.dpr;
        const trailWidth = (width * blockSize) * this.dpr;

        for (let i = 0; i < 5; i++) {
            this.effects.push(new Particle({
                x: startX + Math.random() * trailWidth,
                y: startY,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                life: 15,
                gravity: 0.05,
                color: color
            }));
        }
    }

    // The main explosion for clearing lines
    triggerLineClear(clearedLines, blockSize, viewportTopY, canvasWidth) {
        clearedLines.forEach(y => {
            const lineY = ((y - viewportTopY + 0.5) * blockSize) * this.dpr;

            // 1. Hebrew Letter Particle Explosion
            for (let i = 0; i < 30; i++) { // More letters!
                this.effects.push(new Particle({
                    type: 'char',
                    x: Math.random() * canvasWidth * this.dpr,
                    y: lineY,
                    fontSize: Math.random() * 12 + 8,
                    color: `hsl(${Math.random() * 360}, 100%, 75%)` // Rainbow colors
                }));
            }

            // 2. Procedural Lightning
            this.createProceduralBolt(lineY, canvasWidth * this.dpr);
        });
    }

    // Advanced procedural lightning generator
    createProceduralBolt(y, width) {
        const startX = 0;
        const endX = width;
        let segments = [{ x: startX, y: y }, { x: endX, y: y }];
        const iterations = 5; // More iterations = more jagged
        const maxOffset = 30 * this.dpr;

        for (let i = 0; i < iterations; i++) {
            let newSegments = [segments[0]];
            for (let j = 0; j < segments.length - 1; j++) {
                const p1 = segments[j];
                const p2 = segments[j + 1];
                const midX = (p1.x + p2.x) / 2;
                const midY = (p1.y + p2.y) / 2;
                const offset = (Math.random() - 0.5) * maxOffset * (1 - i / iterations);
                newSegments.push({ x: midX, y: midY + offset }, p2);
            }
            segments = newSegments;
        }

        // Create visible line segments from the points
        for (let i = 0; i < segments.length - 1; i++) {
            this.effects.push(new LightningBolt(
                segments[i].x, segments[i].y,
                segments[i+1].x, segments[i+1].y,
                (Math.random() * 1.5 + 0.5) * this.dpr
            ));
        }
    }
}