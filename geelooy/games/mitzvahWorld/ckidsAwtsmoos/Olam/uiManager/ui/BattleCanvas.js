/**
 * B"H
 * @file BattleCanvas.js
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  THE ARENA OF CLARIFICATION — Epic Battle Canvas Overlay               ║
 * ║                                                                          ║
 * ║  A second canvas floated ABOVE the 3D world canvas.                      ║
 * ║  Renders:                                                                ║
 * ║    - Two characters on floating platforms                                ║
 * ║    - Elemental particle effects per move (Fire/Water/Ground/Air)         ║
 * ║    - Health bars, PaRDeS level indicator, dramatic camera shake          ║
 * ║    - Animated Torah text explosions                                       ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { PARDES_COLORS } from '../systems/PassageLevel.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { BattleParticles } from './battle/BattleParticles.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { BattleCharacterRenderer } from './battle/BattleCharacterRenderer.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { BattleHUD } from './battle/BattleHUD.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { BattleTextRenderer } from './battle/BattleTextRenderer.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default class BattleCanvas {
    /** @param {HTMLElement} container - The game container to append the canvas to */
    constructor(container) {
        this.container = container;
        this.canvas    = null;
        this.ctx       = null;
        this.active    = false;
        this.animFrame = null;

        this._shake      = { x: 0, y: 0, dur: 0 };
        this._flashAlpha = 0;
        this._flashColor = '#ffffff';

        this._state = {
            player:   null,
            opponent: null,
            playerHp: 100, playerMaxHp: 100,
            opponentHp: 100, opponentMaxHp: 100,
            message:  'Choose your Torah passage...',
            madreiga: 1,
            turn:     'player'
        };

        this.particles        = new BattleParticles();
        this.characterRender  = new BattleCharacterRenderer();
        this.hud              = new BattleHUD();
        this.textRenderer     = new BattleTextRenderer();
    }

    /** @function mount — Create and inject the battle canvas into the DOM */
    mount() {
        if (this.canvas) return;
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'battle-canvas-overlay';
        Object.assign(this.canvas.style, {
            position: 'absolute', top: '0', left: '0',
            width: '100%', height: '100%',
            zIndex: '500', pointerEvents: 'none',
            display: 'none'
        });
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this._resize();
        window.addEventListener('resize', () => this._resize());
    }

    _resize() {
        this.canvas.width  = this.container.clientWidth;
        this.canvas.height = this.container.clientHeight;
    }

    /** @function startBattle — Fade in and begin the battle loop */
    startBattle(player, opponent) {
        this._state.player      = player;
        this._state.opponent    = opponent;
        this._state.playerHp    = player.currentStats?.health ?? 100;
        this._state.playerMaxHp = player.currentStats?.health ?? 100;
        this._state.opponentHp  = opponent.maxHp ?? 100;
        this._state.opponentMaxHp = opponent.maxHp ?? 100;
        this._state.madreiga    = player.madreiga ?? 1;

        this.canvas.style.display = 'block';
        this.canvas.style.pointerEvents = 'all';
        this.active = true;
        this._fadeIn();
        this._loop();
    }

    /** @function endBattle — Fade out and hide */
    endBattle() {
        this.active = false;
        this._fadeOut(() => {
            this.canvas.style.display = 'none';
            this.canvas.style.pointerEvents = 'none';
        });
        cancelAnimationFrame(this.animFrame);
    }

    /** @function playMoveEffect — Triggers visual effect for a move */
    playMoveEffect(move, isPlayer) {
        // 1. Screen flash
        this._flashColor = this._typeToColor(move.damageType);
        this._flashAlpha = 0.6;

        // 2. Camera shake
        const intensity = Math.min(move.power / 20, 15);
        this._shake = { x: intensity, y: intensity, dur: 400 };

        // 3. Particles
        const W = this.canvas.width, H = this.canvas.height;
        const srcX = isPlayer ? W * 0.25 : W * 0.75;
        const dstX = isPlayer ? W * 0.75 : W * 0.25;
        this.particles.burst({
            type:   move.damageType,
            startX: srcX, startY: H * 0.55,
            endX:   dstX, endY:   H * 0.45,
            count:  Math.floor(move.power / 5),
            color:  this._flashColor
        });

        // 4. Torah text explosion
        this.textRenderer.explode(move.name, move.level, this._flashColor,
            isPlayer ? W * 0.75 : W * 0.25, H * 0.35);
    }

    /** @function _loop — Main 2D render loop */
    _loop() {
        if (!this.active) return;
        this.animFrame = requestAnimationFrame(() => this._loop());
        this._draw();
    }

    _draw() {
        const ctx = this.ctx;
        const W = this.canvas.width, H = this.canvas.height;
        ctx.clearRect(0, 0, W, H);

        // Shake transform
        let sx = 0, sy = 0;
        if (this._shake.dur > 0) {
            sx = (Math.random() - 0.5) * this._shake.x;
            sy = (Math.random() - 0.5) * this._shake.y;
            this._shake.dur -= 16;
        }
        ctx.save();
        ctx.translate(sx, sy);

        // ── BACKGROUND ──────────────────────────────────────────────────────
        this._drawBackground(ctx, W, H);

        // ── PLATFORMS ───────────────────────────────────────────────────────
        this._drawPlatform(ctx, W * 0.22, H * 0.68, 220, 40, '#3d2b1f', '#c8a96e');
        this._drawPlatform(ctx, W * 0.78, H * 0.48, 220, 40, '#1a1a2e', '#4a4a8a');

        // ── CHARACTERS ──────────────────────────────────────────────────────
        this.characterRender.draw(ctx, 'chossid', W * 0.22, H * 0.68 - 10, false);
        this.characterRender.draw(ctx, 'kelipa',  W * 0.78, H * 0.48 - 10, true, this._state.opponent);

        // ── PARTICLES ───────────────────────────────────────────────────────
        this.particles.update(ctx);

        // ── HUD ─────────────────────────────────────────────────────────────
        this.hud.draw(ctx, W, H, this._state);

        // ── TEXT EXPLOSIONS ──────────────────────────────────────────────────
        this.textRenderer.update(ctx);

        // ── FLASH OVERLAY ───────────────────────────────────────────────────
        if (this._flashAlpha > 0) {
            ctx.globalAlpha = this._flashAlpha;
            ctx.fillStyle = this._flashColor;
            ctx.fillRect(0, 0, W, H);
            ctx.globalAlpha = 1;
            this._flashAlpha = Math.max(0, this._flashAlpha - 0.05);
        }

        ctx.restore();
    }

    _drawBackground(ctx, W, H) {
        // Deep cosmic gradient
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0,   '#0a0015');
        grad.addColorStop(0.5, '#001122');
        grad.addColorStop(1,   '#0a1a0a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // Stars
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        for (let i = 0; i < 80; i++) {
            const x = ((i * 137.5) % W);
            const y = ((i * 73.1)  % (H * 0.65));
            const r = 0.5 + (i % 3) * 0.5;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }

        // Ground line
        const groundGrad = ctx.createLinearGradient(0, H * 0.72, 0, H);
        groundGrad.addColorStop(0, '#1a3a0a');
        groundGrad.addColorStop(1, '#0a1a05');
        ctx.fillStyle = groundGrad;
        ctx.fillRect(0, H * 0.72, W, H * 0.28);
    }

    _drawPlatform(ctx, cx, cy, w, h, dark, light) {
        ctx.save();
        const grad = ctx.createLinearGradient(cx - w/2, cy, cx + w/2, cy + h);
        grad.addColorStop(0, light);
        grad.addColorStop(1, dark);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(cx, cy, w/2, h/2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Glow
        ctx.shadowColor = light;
        ctx.shadowBlur  = 20;
        ctx.strokeStyle = light;
        ctx.lineWidth   = 2;
        ctx.stroke();
        ctx.restore();
    }

    _typeToColor(type) {
        const map = { Ground: '#c8a96e', Water: '#00bfff', Fire: '#ff4500', Air: '#9400d3' };
        return map[type] || '#ffffff';
    }

    _fadeIn(dur = 400) {
        this.canvas.style.opacity = '0';
        this.canvas.style.transition = `opacity ${dur}ms`;
        requestAnimationFrame(() => { this.canvas.style.opacity = '1'; });
    }

    _fadeOut(cb, dur = 400) {
        this.canvas.style.transition = `opacity ${dur}ms`;
        this.canvas.style.opacity = '0';
        setTimeout(cb, dur);
    }
}
