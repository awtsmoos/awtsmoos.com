/**
 * B"H
 * @file BattleTextRenderer.js
 * @description Torah text explosions — words of wisdom burst onto the canvas like holy fire
 */

export class BattleTextRenderer {
    constructor() { this._texts = []; }

    /**
     * @function explode — Launches a text explosion at position (x,y)
     */
    explode(name, level, color, x, y) {
        this._texts.push({
            text: name, level: (level || 'pshat').toUpperCase(),
            x, y, vy: -3, alpha: 1, scale: 0.1,
            targetScale: 2.5, color, age: 0, maxAge: 1200
        });
    }

    update(ctx) {
        const dt = 16;
        this._texts = this._texts.filter(t => t.alpha > 0.01);
        this._texts.forEach(t => {
            t.age += dt;
            const progress = t.age / t.maxAge;

            // Scale up fast, then hold, then fade
            if (t.scale < t.targetScale) t.scale += (t.targetScale - t.scale) * 0.15;
            if (progress > 0.4) t.alpha = 1 - ((progress - 0.4) / 0.6);
            t.y += t.vy;
            t.vy *= 0.96; // Decelerate

            ctx.save();
            ctx.globalAlpha = t.alpha;
            ctx.translate(t.x, t.y);
            ctx.scale(t.scale, t.scale);

            // Glow
            ctx.shadowColor = t.color;
            ctx.shadowBlur  = 20;

            // Level badge
            ctx.fillStyle = t.color;
            ctx.font = 'bold 11px Outfit, sans-serif';
            ctx.fillText(`[${t.level}]`, -30, -18);

            // Main text
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 18px Outfit, sans-serif';
            ctx.fillText(t.text, -60, 0);

            // Decorative lines
            ctx.strokeStyle = t.color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(-70, 6); ctx.lineTo(70, 6);
            ctx.stroke();

            ctx.restore();
        });
    }
}
