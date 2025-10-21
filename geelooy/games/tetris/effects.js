// B"H
// effects.js - The ULTIMATE High-Impact "Raw Shapes" Engine

// --- Constants ---
const HEBREW_CHARS = [
    'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ', 'ל', 'מ', 'נ', 
    'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת', 'ך', 'ם', 'ן', 'ף', 'ץ'
];
const PARTICLE_GRAVITY = 0.4;
const MAX_PARTICLES = 1500; // Increased cap for more chaos

// --- Base Particle Class ---
class Effect {
    constructor(config) {
        this.x = config.x; this.y = config.y;
        this.vx = config.vx; this.vy = config.vy;
        this.life = config.life; this.gravity = PARTICLE_GRAVITY;
    }
    update() {
        this.x += this.vx; this.y += this.vy; this.vy += this.gravity; this.life--;
    }
}

// --- NEW: Shard Particle ---
class Shard extends Effect {
    constructor(config) {
        super(config);
        this.color = config.color;
        this.size = config.size;
        this.angle = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.5;
    }
    draw(ctx, dpr) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(0, -this.size * dpr);
        ctx.lineTo(this.size * 0.866 * dpr, this.size * 0.5 * dpr);
        ctx.lineTo(-this.size * 0.866 * dpr, this.size * 0.5 * dpr);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        this.angle += this.rotationSpeed;
    }
}

// --- OVERHAULED: Hebrew Letter and Spark Particle ---
class CharacterParticle extends Effect {
    constructor(config) {
        super(config);
        this.type = config.type;
        this.color = config.color;
        this.char = this.type === 'char' ? HEBREW_CHARS[Math.floor(Math.random() * HEBREW_CHARS.length)] : null;
        this.fontSize = config.fontSize;
    }
    draw(ctx, dpr) {
        if (this.type === 'char') {
            const font = `bold ${this.fontSize * dpr}px Cinzel`;
            ctx.font = font;
            // Draw white border by stroking the text
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 3 * dpr;
            ctx.strokeText(this.char, this.x, this.y);
            // Draw the colored text on top
            ctx.fillStyle = this.color;
            ctx.fillText(this.char, this.x, this.y);
        } else { // Spark
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, 3 * dpr, 3 * dpr);
        }
    }
}

class LightningBolt extends Effect {
    constructor(x1, y1, x2, y2, width) {
        super({x:0, y:0, vx:0, vy:0, life: 7}); // Use base class props
        this.x1 = x1; this.y1 = y1; this.x2 = x2; this.y2 = y2;
        this.width = width;
    }
    update() { this.life--; } // Don't apply gravity to lightning
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
            this.effects.shift();
        }
        this.effects.push(effect);
    }
    update() { for (let i = this.effects.length - 1; i >= 0; i--) { this.effects[i].update(); if (this.effects[i].life <= 0) { this.effects.splice(i, 1); } } }
    draw() { this.effects.forEach(effect => effect.draw(this.ctx, this.dpr)); }

    // --- OVERHAUL: Multi-layered explosion of Shards, Letters, and Sparks ---
    triggerImpact(piece, blockSize, viewportTopY) {
        piece.matrix.forEach((row, y) => {
            row.forEach((val, x) => {
                if (val !== 0) {
                    const px = (piece.x + x + 0.5) * blockSize;
                    const py = (piece.y + y - viewportTopY + 0.9) * blockSize;
                    // 1. Colored Shards
                    for (let i = 0; i < 20; i++) {
                        this.addEffect(new Shard({
                            x: px, y: py, color: COLORS[piece.typeId],
                            vx: (Math.random() - 0.5) * 35, vy: (Math.random() - 0.5) * 35 - 8,
                            life: Math.random() * 40 + 30, size: Math.random() * 8 + 5
                        }));
                    }
                    // 2. Bordered Hebrew Letters
                    for (let i = 0; i < 8; i++) {
                        const randomColor = Object.values(COLORS)[Math.floor(Math.random() * 7)];
                        this.addEffect(new CharacterParticle({
                            type: 'char', x: px, y: py, color: randomColor,
                            vx: (Math.random() - 0.5) * 25, vy: (Math.random() - 0.5) * 25 - 10,
                            life: Math.random() * 40 + 35, fontSize: Math.random() * 20 + 20
                        }));
                    }
                    // 3. White Sparks
                    for (let i = 0; i < 15; i++) {
                         this.addEffect(new CharacterParticle({
                            type: 'spark', x: px, y: py, color: '#FFFFFF',
                            vx: (Math.random() - 0.5) * 20, vy: (Math.random() - 0.5) * 20 - 6,
                            life: Math.random() * 25 + 20
                        }));
                    }
                }
            });
        });
    }

    // --- OVERHAUL: Grinding stream of Shards and Sparks ---
    triggerWallSlide(piece, direction, blockSize, viewportTopY) {
        const side = direction > 0 ? piece.matrix[0].length - 1 : 0;
        piece.matrix.forEach((row, y) => {
            if (row[side] !== 0) {
                const px = (piece.x + side + (direction > 0 ? 1 : 0)) * blockSize;
                const py = (piece.y + y - viewportTopY + 0.5) * blockSize;
                // 1. Shards
                for (let i = 0; i < 5; i++) {
                    this.addEffect(new Shard({
                        x: px, y: py, color: '#FFFFFF',
                        vx: -direction * (Math.random() * 6 + 5), vy: (Math.random() - 0.5) * 10,
                        life: Math.random() * 25 + 15, size: Math.random() * 5 + 3
                    }));
                }
                 // 2. Sparks
                for (let i = 0; i < 5; i++) {
                    this.addEffect(new CharacterParticle({
                        type: 'spark', x: px, y: py, color: '#FFFFFF',
                        vx: -direction * (Math.random() * 8 + 5), vy: (Math.random() - 0.5) * 8,
                        life: Math.random() * 20 + 10
                    }));
                }
            }
        });
    }

    // --- OVERHAUL: Two-stage "Nova" explosion ---
    triggerLineClear(clearedLines, blockSize, viewportTopY, canvasWidth) {
        clearedLines.forEach(y => {
            const lineY = (y - viewportTopY + 0.5) * blockSize;
            // Stage 1: Implosion effect (brief inward rush) - subtle
            for (let i = 0; i < 50; i++) {
                const startX = Math.random() > 0.5 ? -10 : canvasWidth + 10;
                this.addEffect(new CharacterParticle({
                    type: 'spark', x: startX, y: lineY, color: '#FFFFFF',
                    vx: (canvasWidth/2 - startX) / 10, vy: 0, life: 10
                }));
            }
            // Stage 2: The Main Detonation
            for (let i = 0; i < 400; i++) {
                const randomChoice = Math.random();
                const randomColor = Object.values(COLORS)[Math.floor(Math.random() * 7)];
                if (randomChoice < 0.7) { // 70% Shards
                    this.addEffect(new Shard({
                        x: Math.random() * canvasWidth, y: lineY, color: randomColor,
                        vx: (Math.random() - 0.5) * 60, vy: (Math.random() - 0.5) * 60,
                        life: Math.random() * 50 + 30, size: Math.random() * 10 + 6
                    }));
                } else if (randomChoice < 0.9) { // 20% Letters
                    this.addEffect(new CharacterParticle({
                        type: 'char', x: Math.random() * canvasWidth, y: lineY, color: randomColor,
                        vx: (Math.random() - 0.5) * 40, vy: (Math.random() - 0.5) * 40,
                        life: Math.random() * 50 + 35, fontSize: Math.random() * 22 + 18
                    }));
                } else { // 10% Sparks
                    this.addEffect(new CharacterParticle({
                        type: 'spark', x: Math.random() * canvasWidth, y: lineY, color: '#FFFFFF',
                        vx: (Math.random() - 0.5) * 50, vy: (Math.random() - 0.5) * 50,
                        life: Math.random() * 40 + 20
                    }));
                }
            }
            this.createProceduralBolt(lineY, canvasWidth, 80 * this.dpr, 8);
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
            this.addEffect(new LightningBolt(segments[i].x, segments[i].y, segments[i+1].x, segments[i+1].y, (Math.random() * 4 + 3)));
        }
    }
}