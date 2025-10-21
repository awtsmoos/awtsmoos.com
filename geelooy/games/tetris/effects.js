// B"H
// effects.js - FINAL, High-Performance "Raw Shapes" Engine

// --- Particle Class (Heavily Optimized) ---
// This particle is ONLY a solid square. It is the fastest possible thing to draw.
class Particle {
    constructor(config) {
        this.x = config.x;
        this.y = config.y;
        // Physics
        this.vx = config.vx;
        this.vy = config.vy;
        this.life = config.life;
        this.gravity = 0.3; // A slightly heavier, more impactful gravity
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.life--;
    }
    draw(ctx, dpr) {
        // The core of the performance gain: NO alpha, NO complex shapes.
        // This is the fastest drawing command.
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, 2 * dpr, 2 * dpr);
    }
}

// --- LightningBolt Class (Heavily Optimized) ---
// This bolt is ONLY a solid line. No fading.
class LightningBolt {
    constructor(x1, y1, x2, y2, width) {
        this.x1 = x1; this.y1 = y1;
        this.x2 = x2; this.y2 = y2;
        this.width = width;
        this.life = 8; // Shorter, snappier lifespan
    }
    update() {
        this.life--;
    }
    draw(ctx, dpr) {
        // NO alpha blending. It's either visible or it's not.
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = this.width;
        ctx.beginPath();
        ctx.moveTo(this.x1, this.y1);
        ctx.lineTo(this.x2, this.y2);
        ctx.stroke();
    }
}

// --- EffectsEngine Class (Re-tuned for Impact and Speed) ---
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

    /**
     * RE-TUNED: Now triggers a powerful, guaranteed burst on EVERY piece lock.
     */
    triggerImpact(piece, blockSize, viewportTopY) {
        piece.matrix.forEach((row, y) => {
            row.forEach((val, x) => {
                if (val !== 0) {
                    const px = ((piece.x + x + 0.5) * blockSize) * this.dpr;
                    const py = ((piece.y + y - viewportTopY + 0.9) * blockSize) * this.dpr;

                    // 1. A bigger, faster particle burst.
                    for (let i = 0; i < 15; i++) { // More particles, but they are cheap now.
                        let p = new Particle({
                            x: px, y: py,
                            vx: (Math.random() - 0.5) * 12, // More horizontal energy
                            vy: (Math.random() - 0.5) * 12, // Explodes in all directions
                            life: Math.random() * 25 + 15
                        });
                        p.color = COLORS[piece.typeId]; // Use the piece's color
                        this.effects.push(p);
                    }

                    // 2. A snappy lightning crackle.
                    for (let i = 0; i < 2; i++) {
                        const endX = px + (Math.random() - 0.5) * 60 * this.dpr;
                        const endY = py + (Math.random() - 0.5) * 60 * this.dpr;
                        this.effects.push(new LightningBolt(px, py, endX, endY, 1 * this.dpr));
                    }
                }
            });
        });
    }

    /**
     * RE-TUNED: A truly insane, screen-filling, but still performant explosion.
     */
    triggerLineClear(clearedLines, blockSize, viewportTopY, canvasWidth) {
        clearedLines.forEach(y => {
            const lineY = ((y - viewportTopY + 0.5) * blockSize) * this.dpr;

            // 1. A massive but FAST particle shockwave.
            for (let i = 0; i < 150; i++) { // Fewer objects than before, but much faster to render.
                let p = new Particle({
                    x: Math.random() * canvasWidth * this.dpr,
                    y: lineY + (Math.random() - 0.5) * 40 * this.dpr,
                    vx: (Math.random() - 0.5) * 3,
                    vy: (Math.random() - 0.5) * 20, // Strong vertical blast
                    life: Math.random() * 60 + 50
                });
                p.color = '#FFFFFF';
                this.effects.push(p);
            }

            // 2. A powerful lightning storm that is fast to draw.
            this.createProceduralBolt(lineY, canvasWidth * this.dpr, 40 * this.dpr, 5);
            for (let i = 0; i < COLS; i+=2) { // Vertical bolts are more sparse but still present
                const shatterX = ((i + 0.5) * blockSize) * this.dpr;
                this.createVerticalBolt(shatterX, lineY - (blockSize/2 * this.dpr), lineY + (blockSize/2 * this.dpr));
            }
        });
    }

    // This effect is fine, it uses the fast particles already.
    triggerHardDropTrail(x, y, width, color, blockSize, viewportTopY) {
        const startY = ((y - viewportTopY) * blockSize) * this.dpr;
        const startX = (x * blockSize) * this.dpr;
        const trailWidth = (width * blockSize) * this.dpr;
        for (let i = 0; i < 5; i++) {
            let p = new Particle({
                x: startX + Math.random() * trailWidth, y: startY,
                vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2,
                life: 15
            });
            p.gravity = 0.05; p.color = color;
            this.effects.push(p);
        }
    }

    // --- Lightning Generators (Unchanged logic, but now create fast "raw" bolts) ---
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
    createVerticalBolt(x, topY, bottomY) {
        let segments = [{ x: x, y: topY }, { x: x, y: bottomY }];
        const iterations = 4, maxOffset = 15 * this.dpr;
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