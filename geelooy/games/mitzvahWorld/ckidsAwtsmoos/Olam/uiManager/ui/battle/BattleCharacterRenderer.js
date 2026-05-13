/**
 * B"H
 * @file BattleCharacterRenderer.js
 * @description Draws stylized Chossid and Kelipa characters on the battle canvas
 */
import { PARDES_COLORS } from '../../../../systems/PassageLevel.js';

export class BattleCharacterRenderer {
    constructor() {
        this._animTime = 0;
        this._hitFlash = { chossid: 0, kelipa: 0 };
    }

    /**
     * @function draw — Renders a character with idle animation and hit effects
     * @param {CanvasRenderingContext2D} ctx
     * @param {'chossid'|'kelipa'} type
     * @param {number} cx — center x
     * @param {number} cy — bottom y (feet)
     * @param {boolean} flip — mirror horizontally
     * @param {Object} [opponentData] — for Kelipa type variant
     */
    draw(ctx, type, cx, cy, flip = false, opponentData = null) {
        this._animTime += 0.016;
        const bob = Math.sin(this._animTime * 2) * 3;

        ctx.save();
        if (flip) { ctx.scale(-1, 1); cx = -cx; }

        ctx.translate(cx, cy + bob);

        if (type === 'chossid') {
            this._drawChossid(ctx, this._hitFlash.chossid > 0);
        } else {
            this._drawKelipa(ctx, opponentData, this._hitFlash.kelipa > 0);
        }

        ctx.restore();

        if (this._hitFlash.chossid > 0) this._hitFlash.chossid--;
        if (this._hitFlash.kelipa  > 0) this._hitFlash.kelipa--;
    }

    flashHit(type) { this._hitFlash[type] = 8; }

    _drawChossid(ctx, flashing) {
        ctx.shadowColor = flashing ? '#ffffff' : '#4444ff';
        ctx.shadowBlur  = flashing ? 30 : 15;

        const scale = 2.2;
        ctx.scale(scale, scale);

        // Legs
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(-8, -15, 6, 20);
        ctx.fillRect(2, -15, 6, 20);

        // Body / Kapota
        ctx.fillStyle = flashing ? '#ffffff' : '#111111';
        ctx.fillRect(-12, -45, 24, 32);

        // Shirt collar
        ctx.fillStyle = '#eeeeee';
        ctx.fillRect(-6, -45, 12, 8);

        // Arms
        ctx.fillStyle = '#111111';
        ctx.fillRect(-20, -45, 10, 22);
        ctx.fillRect(10, -45, 10, 22);

        // Head
        ctx.fillStyle = '#f5d6b0';
        ctx.beginPath();
        ctx.arc(0, -58, 14, 0, Math.PI * 2);
        ctx.fill();

        // Beard
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.arc(0, -50, 10, 0, Math.PI);
        ctx.fill();

        // Hat (Fedora)
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(-18, -76, 36, 6); // Brim
        ctx.fillRect(-12, -90, 24, 18); // Crown

        // Eyes
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(-5, -60, 2.5, 0, Math.PI*2); ctx.fill();
        ctx.beginPath();
        ctx.arc(5, -60, 2.5, 0, Math.PI*2);  ctx.fill();

        // Glow aura
        if (!flashing) {
            const aura = ctx.createRadialGradient(0, -45, 10, 0, -45, 60);
            aura.addColorStop(0, 'rgba(100,150,255,0.15)');
            aura.addColorStop(1, 'rgba(100,150,255,0)');
            ctx.fillStyle = aura;
            ctx.beginPath();
            ctx.arc(0, -45, 60, 0, Math.PI*2);
            ctx.fill();
        }
    }

    _drawKelipa(ctx, opponentData, flashing) {
        const elementColor = this._elementColor(opponentData?.elementalType);
        ctx.shadowColor = flashing ? '#ffffff' : elementColor;
        ctx.shadowBlur  = flashing ? 40 : 25;

        const scale = 2.4;
        ctx.scale(scale, scale);

        // Pulsating tentacle body
        const t = this._animTime;
        ctx.fillStyle = flashing ? '#ffffff' : elementColor;

        // Core body
        ctx.beginPath();
        ctx.arc(0, -35, 22, 0, Math.PI * 2);
        ctx.fill();

        // Tendrils
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 + t;
            const len = 20 + Math.sin(t * 3 + i) * 8;
            ctx.strokeStyle = elementColor;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, -35);
            ctx.lineTo(Math.cos(angle) * len, -35 + Math.sin(angle) * len);
            ctx.stroke();
        }

        // Eyes (menacing)
        ctx.fillStyle = '#ff0000';
        ctx.beginPath(); ctx.arc(-8, -38, 5, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(8,  -38, 5, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(-8, -38, 2, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(8,  -38, 2, 0, Math.PI*2); ctx.fill();
    }

    _elementColor(type) {
        const m = { dust: '#c8a96e', water: '#00bfff', fire: '#ff4500', air: '#cc00ff', void: '#440044' };
        return m[type] || '#888888';
    }
}
