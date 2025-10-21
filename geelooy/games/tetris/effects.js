// B"H
// effects.js - The Definitive High-Impact "Raw Shapes" Engine

// --- Constants ---
const HEBREW_CHARS = [
    'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ', 'ל', 'מ', 'נ', 
    'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת', 'ך', 'ם', 'ן', 'ף', 'ץ'
];
const PARTICLE_GRAVITY = 0.5; // Even faster gravity
// --- CHANGE: Added a hard cap to prevent crashes ---
const MAX_PARTICLES = 1200;

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
        this.width = width; this.life = 6; // Even faster fade
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

    addEffect(effect) {
        if (this.effects.length >= MAX_PARTICLES) {
            this.effects.shift(); // Remove the oldest particle to make room
        }
        this.effects.push(effect);
    }

    update() { for (let i = this.effects.length - 1; i >= 0; i--) { this.effects[i].update(); if (this.effects[i].life <= 0) { this.effects.splice(i, 1); } } }
    draw() { this.effects.forEach(effect => effect.draw(this.ctx, this.dpr)); }

    // --- CHANGE: Dramatically increased particle count to 50 ---
    triggerImpact(piece, blockSize, viewportTopY) {
        piece.matrix.forEach((row, y) => {
            row.forEach((val, x) => {
                if (val !== 0) {
                    const px = (piece.x + x + 0.5) * blockSize;
                    const py = (piece.y + y - viewportTopY + 0.9) * blockSize;
                    for (let i = 0; i < 50; i++) {
                        const isChar = Math.random() < 0.3; // 30% chance for a letter
                        if (isChar) {
                             this.addEffect(new Particle({
                                type: 'char', x: px, y: py, color: '#FFFFFF',
                                vx: (Math.random() - 0.5) * 30, vy: (Math.random() - 0.5) * 30 - 6,
                                life: Math.random() * 35 + 25,
                                fontSize: Math.random() * 22 + 18
                            }));
                        } else {
                            this.addEffect(new Particle({
                                type: 'pixel', x: px, y: py, color: COLORS[piece.typeId],
                                vx: (Math.random() - 0.5) * 25, vy: (Math.random() - 0.5) * 25 - 5,
                                life: Math.random() * 25 + 15
                            }));
                        }
                    }
                }
            });
        });
    }

    triggerWallSlide(piece, direction, blockSize, viewportTopY) {
        const side = direction > 0 ? piece.matrix[0].length - 1 : 0;
        piece.matrix.forEach((row, y) => {
            if (row[side] !== 0) {
                const px = (piece.x + side + (direction > 0 ? 1 : 0)) * blockSize;
                const py = (piece.y + y - viewportTopY + 0.5) * blockSize;
                for (let i = 0; i < 10; i++) {
                    this.addEffect(new Particle({
                        type: 'pixel', x: px, y: py, color: '#FFFFFF',
                        vx: -direction * (Math.random() * 8 + 5),
                        vy: (Math.random() - 0.5) * 8,
                        life: Math.random() * 20 + 10
                    }));
                }
            }
        });
    }

    // --- CHANGE: Dramatically increased particle count to 400 ---
    triggerLineClear(clearedLines, blockSize, viewportTopY, canvasWidth) {
        clearedLines.forEach(y => {
            const lineY = (y - viewportTopY + 0.5) * blockSize;
            for (let i = 0; i < 400; i++) {
                const isChar = Math.random() > 0.8; // More pixels, fewer letters for raw energy
                this.addEffect(new Particle({
                    type: isChar ? 'char' : 'pixel',
                    x: Math.random() * canvasWidth,
                    y: lineY + (Math.random() - 0.5) * 40 * this.dpr,
                    vx: (Math.random() - 0.5) * 45, vy: (Math.random() - 0.5) * 55, // EXTREME speed
                    life: Math.random() * 40 + 20, // Short life
                    color: `hsl(${Math.random() * 60}, 100%, 85%)`,
                    fontSize: Math.random() * 20 + 12
                }));
            }
            this.createProceduralBolt(lineY, canvasWidth, 70 * this.dpr, 7);
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
            this.addEffect(new LightningBolt(segments[i].x, segments[i].y, segments[i+1].x, segments[i+1].y, (Math.random() * 3 + 2)));
        }
    }
}


