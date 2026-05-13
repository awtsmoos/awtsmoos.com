/**
 * B"H
 * @file BattleHUD.js
 * @description The Heads-Up Display for the Arena of Clarification
 */
import { PARDES_COLORS, PARDES_ICONS, PARDES_LEVELS } from '../../../../systems/PassageLevel.js';

export class BattleHUD {
    draw(ctx, W, H, state) {
        this._drawHealthBar(ctx, 20,         H - 180, 300, state.playerHp,   state.playerMaxHp,  state.player?.name || 'Chossid', false);
        this._drawHealthBar(ctx, W - 320,    60,      300, state.opponentHp, state.opponentMaxHp,state.opponent?.name || 'Kelipa', true);
        this._drawMessageBox(ctx, W, H, state.message);
        this._drawMadreigaBar(ctx, W, H, state.madreiga);
    }

    _drawHealthBar(ctx, x, y, w, hp, maxHp, name, isEnemy) {
        const ratio = Math.max(0, hp / maxHp);
        const barH  = 18;

        // Name
        ctx.fillStyle    = '#ffffff';
        ctx.font         = 'bold 16px Outfit, sans-serif';
        ctx.shadowColor  = '#000';
        ctx.shadowBlur   = 4;
        ctx.fillText(name, x, y - 8);

        // Bar background
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        this._roundRect(ctx, x, y, w, barH, 8);
        ctx.fill();

        // HP gradient
        const hpColor = ratio > 0.5 ? '#4caf50' : ratio > 0.25 ? '#ffc107' : '#f44336';
        const grad = ctx.createLinearGradient(x, y, x + w * ratio, y);
        grad.addColorStop(0, hpColor);
        grad.addColorStop(1, this._lighten(hpColor));
        ctx.fillStyle = grad;
        ctx.shadowColor = hpColor;
        ctx.shadowBlur  = 8;
        this._roundRect(ctx, x, y, w * ratio, barH, 8);
        ctx.fill();

        // HP text
        ctx.shadowBlur  = 0;
        ctx.fillStyle   = '#fff';
        ctx.font        = '13px Outfit, sans-serif';
        ctx.fillText(`${Math.ceil(hp)}/${maxHp}`, x + 8, y + 13);
    }

    _drawMessageBox(ctx, W, H, msg) {
        const bx = W * 0.1, by = H - 120, bw = W * 0.8, bh = 90;
        ctx.fillStyle = 'rgba(0,0,20,0.85)';
        ctx.strokeStyle = 'rgba(100,100,255,0.8)';
        ctx.lineWidth = 2;
        this._roundRect(ctx, bx, by, bw, bh, 12);
        ctx.fill(); ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font      = '18px Outfit, sans-serif';
        ctx.shadowColor = '#4444ff';
        ctx.shadowBlur  = 6;
        ctx.fillText(msg, bx + 20, by + 40);
    }

    _drawMadreigaBar(ctx, W, H, madreiga) {
        const label = `Madreiga: ${madreiga}`;
        ctx.fillStyle = '#ffd700';
        ctx.font      = 'bold 14px Outfit, sans-serif';
        ctx.shadowColor = '#ffaa00';
        ctx.shadowBlur  = 8;
        ctx.fillText(`✨ ${label}`, 20, 40);

        // PaRDeS unlock display
        const levels = ['Pshat', 'Remez', 'Drush', 'Sod'];
        const thresholds = [0, 5, 10, 20];
        levels.forEach((l, i) => {
            const unlocked = madreiga >= thresholds[i];
            ctx.fillStyle = unlocked ? PARDES_COLORS[l.toLowerCase()] : '#333';
            ctx.shadowColor = unlocked ? PARDES_COLORS[l.toLowerCase()] : 'transparent';
            ctx.shadowBlur  = unlocked ? 8 : 0;
            ctx.font = `bold ${unlocked ? 14 : 12}px Outfit, sans-serif`;
            ctx.fillText(PARDES_ICONS[l.toLowerCase()] || l[0], 20 + i * 35, 65);
        });
    }

    _roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    _lighten(hex) {
        return hex; // Could implement lightening here
    }
}
