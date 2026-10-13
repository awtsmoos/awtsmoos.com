//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file ui_system.js
 * @description Decluttered Kabbalah Shooter HUD (revamp 2026-10-13).
 *
 * Exactly three readouts, each instantly legible:
 *   1. SCORE + wave (top-left)
 *   2. VESSEL hearts (top-right) — one health readout derived from player energy
 *   3. OBJECTIVE line (top-center) — the one thing to do right now
 * Everything else (combo, sefirot bars, stance, bitul/moon banners) was removed
 * from the play surface; the pause screen carries the run summary instead.
 * Also draws the red hurt vignette while game.hurtFlash > 0.
 */
const GOLD = '#ffd34d';
const HEART_N = 5;

export class UISystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
    }

    resize(w, h) {
        this.canvas.width = w;
        this.canvas.height = h;
    }

    render(game, renderer) {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, game.width, game.height);

        // World-space floating texts (wave banners, pickups) + enemy HP pips.
        ctx.save();
        ctx.translate(renderer.cameraX, renderer.cameraY);

        game.enemies.forEach(snake => {
            snake.segments.forEach(s => {
                 if(s.type === 4 || s.type === 17 || s.type === 42) {
                     ctx.font = 'bold 15px "Courier New", monospace';
                     ctx.fillStyle = '#ffd9d9';
                     ctx.textAlign = 'left';
                     ctx.fillText(Math.floor(s.hp), s.pos.x + 12, s.pos.y - 12);
                 }
            });
        });

        game.texts.forEach(tx => {
            ctx.font = 'bold 22px "Courier New", monospace';
            ctx.fillStyle = typeof tx.color === 'string' ? tx.color : `rgba(${tx.color[0]*255},${tx.color[1]*255},${tx.color[2]*255},1)`;
            ctx.globalAlpha = Math.max(0, tx.life);
            ctx.textAlign = 'center';
            ctx.fillText(tx.text, tx.pos.x, tx.pos.y);
        });
        ctx.restore();

        // Hurt vignette — unmistakable "you were hit" feedback.
        if (game.hurtFlash > 0) {
            const a = Math.min(0.45, game.hurtFlash / 18 * 0.45);
            const g = ctx.createRadialGradient(
                game.width / 2, game.height / 2, Math.min(game.width, game.height) * 0.35,
                game.width / 2, game.height / 2, Math.max(game.width, game.height) * 0.7);
            g.addColorStop(0, 'rgba(255,30,30,0)');
            g.addColorStop(1, `rgba(255,30,30,${a})`);
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, game.width, game.height);
        }

        // ---- The three readouts ----
        if(game.isPlaying) {
            // 1. Score + wave, top-left.
            ctx.textAlign = 'left';
            ctx.font = 'bold 24px "Courier New", monospace';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(`${Math.floor(game.score)}`, 20, 34);
            ctx.font = '14px "Courier New", monospace';
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.fillText(`WAVE ${game.wave}`, 20, 56);

            // 2. Vessel hearts, top-right — one health readout.
            this.drawHearts(ctx, game);

            // 3. Objective line, top-center — the one thing to do.
            ctx.textAlign = 'center';
            ctx.font = 'bold 15px "Courier New", monospace';
            ctx.fillStyle = GOLD;
            ctx.fillText('✦ SHATTER THE RED VESSELS ✦', game.width / 2, 30);
        }
    }

    /** Five hearts; filled count tracks player energy. No font glyphs — drawn paths. */
    drawHearts(ctx, game) {
        const p = game.player;
        const frac = Math.max(0, Math.min(1, p.energy / (p.maxEnergy || 100)));
        const filled = Math.round(frac * HEART_N);
        const r = 9;
        const gap = 26;
        const totalW = HEART_N * gap;
        let x = game.width - 20 - totalW + gap / 2;
        const y = 26;
        for (let i = 0; i < HEART_N; i++) {
            this.heartPath(ctx, x, y, r);
            if (i < filled) {
                ctx.fillStyle = '#ff4d4d';
                ctx.fill();
            } else {
                ctx.strokeStyle = 'rgba(255,77,77,0.45)';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
            x += gap;
        }
    }

    heartPath(ctx, cx, cy, r) {
        ctx.beginPath();
        ctx.moveTo(cx, cy + r * 0.9);
        ctx.bezierCurveTo(cx - r * 1.4, cy - r * 0.1, cx - r * 0.7, cy - r * 1.1, cx, cy - r * 0.35);
        ctx.bezierCurveTo(cx + r * 0.7, cy - r * 1.1, cx + r * 1.4, cy - r * 0.1, cx, cy + r * 0.9);
        ctx.closePath();
    }
}
