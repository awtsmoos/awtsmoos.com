// B"H
// effects.js - The Definitive High-Impact "Raw Shapes" Engine

// --- Constants ---
const HEBREW_CHARS = [
    'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ', 'ל', 'מ', 'נ', 
    'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת', 'ך', 'ם', 'ן', 'ף', 'ץ'
];
// --- CHANGE: Increased gravity for a snappier feel ---
const PARTICLE_GRAVITY = 0.45;

// --- Flexible Particle Class ---
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
            ctx.fillRect(this.x, this.y, 3 * dpr, 3 * dpr);
        }
    }
}

// --- LightningBolt Class ---
class LightningBolt {
    constructor(x1, y1, x2, y2, width) {
        this.x1 = x1; this.y1 = y1; this.x2 = x2; this.y2 = y2;
        this.width = width; this.life = 8; // Faster fade
    }
    update() { this.life--; }
    draw(ctx, dpr) {
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = this.width * dpr;
        ctx.beginPath(); ctx.moveTo(this.x1, this.y1); ctx.lineTo(this.x2, this.y2); ctx.stroke();
    }
}

// --- EffectsEngine Class ---
class EffectsEngine {
    constructor(ctx, dpr) {
        this.ctx = ctx; this.dpr = dpr; this.effects = [];
    }
    update() { for (let i = this.effects.length - 1; i >= 0; i--) { this.effects[i].update(); if (this.effects[i].life <= 0) { this.effects.splice(i, 1); } } }
    draw() { this.effects.forEach(effect => effect.draw(this.ctx, this.dpr)); }

    // --- CHANGE: Complete overhaul for a high-energy impact with Hebrew letters ---
    triggerImpact(piece, blockSize, viewportTopY) {
        piece.matrix.forEach((row, y) => {
            row.forEach((val, x) => {
                if (val !== 0) {
                    const px = (piece.x + x + 0.5) * blockSize;
                    const py = (piece.y + y - viewportTopY + 0.9) * blockSize;
                    // Create a bigger, faster, mixed blast of particles
                    for (let i = 0; i < 30; i++) {
                        const isChar = Math.random() < 0.25; // 25% chance to be a Hebrew letter
                        if (isChar) {
                             this.effects.push(new Particle({
                                type: 'char', x: px, y: py, color: '#FFFFFF', // Bright white letters
                                vx: (Math.random() - 0.5) * 22, vy: (Math.random() - 0.5) * 22 - 5,
                                life: Math.random() * 40 + 30,
                                fontSize: Math.random() * 20 + 15
                            }));
                        } else {
                            this.effects.push(new Particle({
                                type: 'pixel', x: px, y: py, color: COLORS[piece.typeId],
                                vx: (Math.random() - 0.5) * 18, vy: (Math.random() - 0.5) * 18 - 4,
                                life: Math.random() * 30 + 20
                            }));
                        }
                    }
                }
            });
        });
    }

    // --- CHANGE: More numerous and faster wall slide particles ---
    triggerWallSlide(piece, direction, blockSize, viewportTopY) {
        const side = direction > 0 ? piece.matrix[0].length - 1 : 0;
        piece.matrix.forEach((row, y) => {
            if (row[side] !== 0) {
                const px = (piece.x + side + (direction > 0 ? 1 : 0)) * blockSize;
                const py = (piece.y + y - viewportTopY + 0.5) * blockSize;
                // Increased particle count and velocity
                for (let i = 0; i < 8; i++) {
                    this.effects.push(new Particle({
                        type: 'pixel', x: px, y: py, color: '#FFFFFF',
                        vx: -direction * (Math.random() * 6 + 4),
                        vy: (Math.random() - 0.5) * 6,
                        life: Math.random() * 20 + 10
                    }));
                }
            }
        });
    }

    // --- CHANGE: Overhauled to be a "supernova" with a fiery color palette ---
    triggerLineClear(clearedLines, blockSize, viewportTopY, canvasWidth) {
        clearedLines.forEach(y => {
            const lineY = (y - viewportTopY + 0.5) * blockSize;
            // More particles, much higher velocity
            for (let i = 0; i < 250; i++) {
                const isChar = Math.random() > 0.6;
                this.effects.push(new Particle({
                    type: isChar ? 'char' : 'pixel',
                    x: Math.random() * canvasWidth,
                    y: lineY + (Math.random() - 0.5) * 30 * this.dpr,
                    vx: (Math.random() - 0.5) * 30, vy: (Math.random() - 0.5) * 40,
                    life: Math.random() * 50 + 30, // Shorter life for a faster "flash"
                    // Fiery color palette (orange, yellow, white)
                    color: `hsl(${Math.random() * 60}, 100%, 85%)`,
                    fontSize: Math.random() * 20 + 12
                }));
            }
            this.createProceduralBolt(lineY, canvasWidth, 60 * this.dpr, 7);
        });
    }

    createProceduralBolt(y, width, maxOffset, iterations) {
        let segments = [{ x: 0, y: y }, { x: width, y: y }];
        for (let i = 0; i < iterations; i++) {
            let newSegments = [segments[0]];
            for (let j = 0; j < segments.length - 1; j++) {
                const p1 = segments[j], p2 = segments[j + 1];
                const midX = (p1.x + p2.x) / 2, midY = (p1.y + p2.y) / 2;
                const offset = (Math.random() - 0.5) * maxOffset;
                newSegments.push({ x: midX, y: midY + offset }, p2);
            }
            segments = newSegments;
        }
        for (let i = 0; i < segments.length - 1; i++) {
            // Thicker lightning
            this.effects.push(new LightningBolt(segments[i].x, segments[i].y, segments[i+1].x, segments[i+1].y, (Math.random() * 3 + 2)));
        }
    }
}