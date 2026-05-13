/**
 * B"H
 * @file BattleParticles.js
 * @description ELEMENTAL PARTICLE ENGINE — Fire, Water, Ground, Air effects
 */

export class BattleParticles {
    constructor() { this._particles = []; }

    /**
     * @function burst — Emits a burst of elemental particles from src to dst
     */
    burst({ type, startX, startY, endX, endY, count = 30, color = '#ffffff' }) {
        for (let i = 0; i < count; i++) {
            const t = i / count;
            const delay = i * 15;
            this._particles.push({
                x: startX, y: startY,
                vx: (endX - startX) / 40 + (Math.random()-0.5) * 8,
                vy: (endY - startY) / 40 + (Math.random()-0.5) * 8,
                alpha: 1, size: 3 + Math.random() * 8,
                color, type, delay, age: -delay,
                maxAge: 800 + Math.random() * 400,
                trail: []
            });
        }
    }

    update(ctx) {
        const dt = 16;
        this._particles = this._particles.filter(p => p.alpha > 0.01);
        this._particles.forEach(p => {
            p.age += dt;
            if (p.age < 0) return;
            const progress = p.age / p.maxAge;

            // Store trail
            p.trail.push({ x: p.x, y: p.y, alpha: p.alpha });
            if (p.trail.length > 8) p.trail.shift();

            // Draw trail
            p.trail.forEach((pt, i) => {
                ctx.globalAlpha = pt.alpha * (i / p.trail.length) * 0.4;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, p.size * 0.5, 0, Math.PI*2);
                ctx.fill();
            });

            // Draw particle
            ctx.globalAlpha = p.alpha;
            this._drawParticleShape(ctx, p);
            ctx.globalAlpha = 1;

            p.x += p.vx;
            p.y += p.vy;
            p.alpha = 1 - progress;

            // Type physics
            if (p.type === 'Fire')   { p.vy -= 0.3; p.vx += (Math.random()-0.5) * 0.5; }
            if (p.type === 'Water')  { p.vy += 0.4; }
            if (p.type === 'Ground') { p.vy += 0.2; p.size += 0.05; }
            if (p.type === 'Air')    { p.vx += Math.sin(p.age * 0.05) * 0.3; p.vy -= 0.1; }
        });
    }

    _drawParticleShape(ctx, p) {
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        if (p.type === 'Fire') {
            // Teardrop flame shape
            ctx.beginPath();
            ctx.moveTo(p.x, p.y - p.size);
            ctx.bezierCurveTo(p.x + p.size, p.y, p.x + p.size*0.5, p.y + p.size, p.x, p.y + p.size*0.5);
            ctx.bezierCurveTo(p.x - p.size*0.5, p.y + p.size, p.x - p.size, p.y, p.x, p.y - p.size);
            ctx.fill();
        } else if (p.type === 'Water') {
            // Circle droplet
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        } else if (p.type === 'Ground') {
            // Square chunk
            ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
        } else if (p.type === 'Air') {
            // Star / sparkle
            this._drawStar(ctx, p.x, p.y, 5, p.size, p.size * 0.4);
        }
        ctx.restore();
    }

    _drawStar(ctx, cx, cy, spikes, outerR, innerR) {
        let rot = (Math.PI / 2) * 3;
        const step = Math.PI / spikes;
        ctx.beginPath();
        ctx.moveTo(cx, cy - outerR);
        for (let i = 0; i < spikes; i++) {
            ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
            rot += step;
            ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);
            rot += step;
        }
        ctx.lineTo(cx, cy - outerR);
        ctx.closePath();
        ctx.fill();
    }
}
