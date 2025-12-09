//B"H
import { STANCE } from '../entities/player.js';

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
        
        // World Texts
        ctx.save();
        ctx.translate(renderer.cameraX, renderer.cameraY);
        
        game.enemies.forEach(snake => {
            snake.segments.forEach(s => {
                 if(s.type === 4 || s.type === 17 || s.type === 42) {
                     ctx.font = 'bold 16px Courier New';
                     ctx.fillStyle = '#fff';
                     ctx.fillText(Math.floor(s.hp), s.pos.x + 10, s.pos.y - 10);
                 }
            });
        });
        
        game.texts.forEach(tx => {
            ctx.font = 'bold 20px Courier New';
            ctx.fillStyle = typeof tx.color === 'string' ? tx.color : `rgba(${tx.color[0]*255},${tx.color[1]*255},${tx.color[2]*255},1)`;
            ctx.globalAlpha = Math.max(0, tx.life);
            ctx.fillText(tx.text, tx.pos.x, tx.pos.y);
        });
        ctx.restore();

        // HUD
        if(game.isPlaying) {
            ctx.textAlign = 'left';
            ctx.font = '20px Courier New';
            ctx.fillStyle = '#fff';
            ctx.fillText(`SCORE: ${Math.floor(game.score)}`, 20, 30);
            ctx.font = '14px Courier New';
            ctx.fillStyle = '#aaa';
            ctx.fillText(`WAVE: ${game.wave}`, 20, 50);
            
            // Bars
            this.drawBar(ctx, 20, 80, game.player.energy / game.player.maxEnergy, '#0ff', 'OHR (HP)');
            this.drawBar(ctx, 20, 120, game.player.bitachonLevel, '#fd0', 'BITACHON (TRUST)');
            this.drawBalance(ctx, 20, 160, game.player.tanyaBalance);
            
            // Ben/Eved Balance
            if(game.tachlitManager) {
                this.drawBenEved(ctx, 20, 200, game.tachlitManager.benLevel);
            }
            
            ctx.textAlign = 'right';
            ctx.fillStyle = '#fff';
            ctx.font = '20px Courier New';
            ctx.fillText(`COMBO: x${game.combo}`, game.width-20, 30);
            
            // Stance Indicator
            ctx.font = 'bold 16px Courier New';
            const stance = game.player.stance;
            ctx.fillStyle = stance === STANCE.WAR ? '#f55' : '#5f5';
            ctx.fillText(`MODE: ${stance}`, game.width-20, 60);

            if(game.player.isBitul) {
                ctx.textAlign = 'center';
                ctx.font = 'bold 24px Courier New';
                ctx.fillStyle = '#aaf';
                ctx.fillText("- BITUL MODE -", game.width/2, game.height - 100);
            }
            if(game.redemptionManager && game.redemptionManager.isFullMoon) {
                ctx.textAlign = 'center';
                ctx.fillStyle = '#ff0';
                ctx.font = 'bold 16px Courier New';
                ctx.fillText("FULL MOON - MENUCHA", game.width/2, 80);
            }
        }
    }
    
    drawBar(ctx, x, y, pct, color, label) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(x, y, 200, 8);
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 200 * Math.max(0, pct), 8);
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = '10px Courier New';
        ctx.textAlign = 'left';
        ctx.fillText(label, x, y + 20);
    }
    
    drawBalance(ctx, x, y, balance) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(x, y, 200, 8);
        const center = x + 100;
        ctx.fillStyle = '#555';
        ctx.fillRect(center-1, y-2, 2, 12);
        
        if(balance < 0) {
            ctx.fillStyle = '#f55';
            const w = Math.min(100, Math.abs(balance)*2);
            ctx.fillRect(center - w, y, w, 8);
        } else {
            ctx.fillStyle = '#55f';
            const w = Math.min(100, balance*2);
            ctx.fillRect(center, y, w, 8);
        }
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = '10px Courier New';
        ctx.textAlign = 'left';
        ctx.fillText("TANYA (SOUL)", x, y + 20);
    }
    
    drawBenEved(ctx, x, y, level) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(x, y, 200, 8);
        
        const grad = ctx.createLinearGradient(x, y, x+200, y);
        grad.addColorStop(0, '#d0f'); // Eved
        grad.addColorStop(0.5, '#fff'); // Yechida
        grad.addColorStop(1, '#0ff'); // Ben
        
        ctx.fillStyle = grad;
        const px = x + (Math.min(Math.max(level, 0), 1) * 200);
        ctx.fillRect(px - 2, y - 4, 4, 16);
        
        ctx.fillStyle = '#aaa';
        ctx.font = '10px Courier New';
        ctx.textAlign = 'left';
        ctx.fillText("EVED", x, y + 20);
        ctx.textAlign = 'center';
        ctx.fillText("YECHIDA", x + 100, y + 20);
        ctx.textAlign = 'right';
        ctx.fillText("BEN", x + 200, y + 20);
    }
}