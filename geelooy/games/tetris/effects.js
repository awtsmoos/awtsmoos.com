// B"H
// effects.js - The ULTIMATE High-Impact "Raw Shapes" Engine

// --- Constants ---
const HEBREW_CHARS = [
    'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ', 'ל', 'מ', 'נ', 
    'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת', 'ך', 'ם', 'ן', 'ף', 'ץ'
];
const PARTICLE_GRAVITY = 0.4;
// --- CHANGE: Reduced cap for better performance in AI vs AI ---
const MAX_PARTICLES = 800;

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

class Shard extends Effect {
    constructor(config) {
        super(config);
        this.color = config.color;
        this.size = config.size;
        this.angle = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.5;
    }
    // --- CHANGE: Added scale parameter for dynamic sizing ---
    draw(ctx, dpr, scale = 1) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = this.color;
        
        const scaledSize = this.size * scale; // Apply dynamic scale
        
        ctx.beginPath();
        ctx.moveTo(0, -scaledSize * dpr);
        ctx.lineTo(scaledSize * 0.866 * dpr, scaledSize * 0.5 * dpr);
        ctx.lineTo(-scaledSize * 0.866 * dpr, scaledSize * 0.5 * dpr);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        this.angle += this.rotationSpeed;
    }
}

class CharacterParticle extends Effect {
    constructor(config) {
        super(config);
        this.type = config.type;
        this.color = config.color;
        this.char = this.type === 'char' ? HEBREW_CHARS[Math.floor(Math.random() * HEBREW_CHARS.length)] : null;
        this.fontSize = config.fontSize;
    }
    // --- CHANGE: Added scale parameter for dynamic sizing ---
    draw(ctx, dpr, scale = 1) {
        const scaledFontSize = this.fontSize * scale; // Apply dynamic scale

        if (this.type === 'char') {
            const font = `bold ${scaledFontSize * dpr}px Cinzel`;
            ctx.font = font;
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 3 * dpr * scale; // Also scale the border
            ctx.strokeText(this.char, this.x, this.y);
            ctx.fillStyle = this.color;
            ctx.fillText(this.char, this.x, this.y);
        } else { // Spark
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, 3 * dpr * scale, 3 * dpr * scale);
        }
    }
}

class LightningBolt extends Effect {
    constructor(x1, y1, x2, y2, width) {
        super({x:0, y:0, vx:0, vy:0, life: 7});
        this.x1 = x1; this.y1 = y1; this.x2 = x2; this.y2 = y2;
        this.width = width;
    }
    update() { this.life--; }
    draw(ctx, dpr) { // No scaling needed for lightning
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = this.width * dpr;
        ctx.beginPath(); ctx.moveTo(this.x1, this.y1); ctx.lineTo(this.x2, this.y2); ctx.stroke();
    }
}

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
    
    // --- CHANGE: The main draw loop now calculates pressure and passes down a scale factor ---
    draw() {
        const pressure = this.effects.length / MAX_PARTICLES;
        // Start shrinking particles when the screen is 50% full of particles, down to 60% of original size at max capacity
        const scale = pressure > 0.5 ? 1 - (pressure - 0.5) * 0.8 : 1;

        this.effects.forEach(effect => effect.draw(this.ctx, this.dpr, scale));
    }

    triggerImpact(piece, blockSize, viewportTopY) {
        piece.matrix.forEach((row, y) => {
            row.forEach((val, x) => {
                if (val !== 0) {
                    const px = (piece.x + x + 0.5) * blockSize;
                    const py = (piece.y + y - viewportTopY + 0.9) * blockSize;
                    for (let i = 0; i < 20; i++) { this.addEffect(new Shard({ x: px, y: py, color: COLORS[piece.typeId], vx: (Math.random() - 0.5) * 35, vy: (Math.random() - 0.5) * 35 - 8, life: Math.random() * 40 + 30, size: Math.random() * 8 + 5 })); }
                    for (let i = 0; i < 8; i++) { this.addEffect(new CharacterParticle({ type: 'char', x: px, y: py, color: Object.values(COLORS)[Math.floor(Math.random() * 7)], vx: (Math.random() - 0.5) * 25, vy: (Math.random() - 0.5) * 25 - 10, life: Math.random() * 40 + 35, fontSize: Math.random() * 20 + 20 })); }
                    for (let i = 0; i < 15; i++) { this.addEffect(new CharacterParticle({ type: 'spark', x: px, y: py, color: '#FFFFFF', vx: (Math.random() - 0.5) * 20, vy: (Math.random() - 0.5) * 20 - 6, life: Math.random() * 25 + 20 })); }
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
                for (let i = 0; i < 5; i++) { this.addEffect(new Shard({ x: px, y: py, color: '#FFFFFF', vx: -direction * (Math.random() * 6 + 5), vy: (Math.random() - 0.5) * 10, life: Math.random() * 25 + 15, size: Math.random() * 5 + 3 })); }
                for (let i = 0; i < 5; i++) { this.addEffect(new CharacterParticle({ type: 'spark', x: px, y: py, color: '#FFFFFF', vx: -direction * (Math.random() * 8 + 5), vy: (Math.random() - 0.5) * 8, life: Math.random() * 20 + 10 })); }
            }
        });
    }

    triggerLineClear(clearedLines, blockSize, viewportTopY, canvasWidth) {
        clearedLines.forEach(y => {
            const lineY = (y - viewportTopY + 0.5) * blockSize;
            for (let i = 0; i < 50; i++) { const startX = Math.random() > 0.5 ? -10 : canvasWidth + 10; this.addEffect(new CharacterParticle({ type: 'spark', x: startX, y: lineY, color: '#FFFFFF', vx: (canvasWidth/2 - startX) / 10, vy: 0, life: 10 })); }
            for (let i = 0; i < 250; i++) { // Reduced count for performance
                const randomChoice = Math.random(); const randomColor = Object.values(COLORS)[Math.floor(Math.random() * 7)];
                if (randomChoice < 0.7) { this.addEffect(new Shard({ x: Math.random() * canvasWidth, y: lineY, color: randomColor, vx: (Math.random() - 0.5) * 60, vy: (Math.random() - 0.5) * 60, life: Math.random() * 50 + 30, size: Math.random() * 10 + 6 }));
                } else if (randomChoice < 0.9) { this.addEffect(new CharacterParticle({ type: 'char', x: Math.random() * canvasWidth, y: lineY, color: randomColor, vx: (Math.random() - 0.5) * 40, vy: (Math.random() - 0.5) * 40, life: Math.random() * 50 + 35, fontSize: Math.random() * 22 + 18 }));
                } else { this.addEffect(new CharacterParticle({ type: 'spark', x: Math.random() * canvasWidth, y: lineY, color: '#FFFFFF', vx: (Math.random() - 0.5) * 50, vy: (Math.random() - 0.5) * 50, life: Math.random() * 40 + 20 })); }
            }
            this.createProceduralBolt(lineY, canvasWidth, 80 * this.dpr, 8);
        });
    }
    
    createProceduralBolt(y, width, maxOffset, iterations) {
        let segments = [{ x: 0, y: y }, { x: width, y: y }];
        for (let i = 0; i < iterations; i++) { let newSegments = [segments[0]]; for (let j = 0; j < segments.length - 1; j++) { const p1 = segments[j], p2 = segments[j + 1]; const midX = (p1.x + p2.x) / 2, midY = (p1.y + p2.y) / 2; const offset = (Math.random() - 0.5) * maxOffset; newSegments.push({ x: midX, y: midY + offset }, p2); } segments = newSegments; }
        for (let i = 0; i < segments.length - 1; i++) { this.addEffect(new LightningBolt(segments[i].x, segments[i].y, segments[i+1].x, segments[i+1].y, (Math.random() * 4 + 3))); }
    }
}