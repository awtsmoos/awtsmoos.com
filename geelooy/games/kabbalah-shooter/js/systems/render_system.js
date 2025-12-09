//B"H
import { WebGLRenderer } from '../graphics/renderer.js';
import { SPRITES, COLORS } from '../constants.js';

export class RenderSystem {
    constructor(canvas) {
        this.renderer = new WebGLRenderer(canvas);
        this.canvas = canvas;
    }
    
    resize(w, h) {
        this.renderer.resize(w, h);
    }
    
    render(game, timestamp) {
        const r = this.renderer;
        const t = timestamp * 0.001;
        
        r.setCamera((Math.random()-0.5)*game.shake, (Math.random()-0.5)*game.shake);
        
        const lum = game.luminosityManager ? game.luminosityManager.globalLuminosity : 0;
        
        r.setWorldState(game.worldLevel, t, game.shake * 0.01, game.aberration); 

        let underwater = 0;
        let lens = 0;
        if(game.pasachManager) {
            underwater = game.pasachManager.waterLevel;
            lens = game.pasachManager.lensActive ? 1.0 : 0.0;
        }
        r.setSpecialEffects(lum, underwater, lens);

        r.begin();
        r.clear();

        // Grid - Dimmed to compensate for Shader Boost
        const gridOffset = game.shake;
        for(let i=0; i<25; i++) {
            let y = (i * 60 + t * 100) % game.height;
            let alpha = 0.3 + (game.combo * 0.01); 
            // Use darker base color because shader will multiply it up
            r.drawSprite(SPRITES.GRID_LINE, game.width/2 + gridOffset, y, game.width * 2, 2, 0, [0.2, 0.2, 0.4, alpha]);
        }

        // Feature Managers
        game.extremeManager.render(r);
        game.redemptionManager.render(r);
        if(game.luminosityManager) game.luminosityManager.render(r);
        if(game.pasachManager) game.pasachManager.render(r);
        if(game.tachlitManager) game.tachlitManager.render(r);

        // Stars - Dimmed
        game.stars.forEach(s => {
            // Darker input color
            r.drawSprite(SPRITES.STAR, s.x, s.y, s.z*2, s.z*2, 0, [0.5, 0.5, 0.5, 0.8]); 
        });

        // Shadow
        if(game.shadowPos) {
            r.drawSprite(SPRITES.SHADOW_PLAYER, game.shadowPos.x, game.shadowPos.y, 64, 64, 0, [0.8, 0, 0, 0.6]);
        }
        
        // Trail
        game.player.trail.forEach(tr => {
            r.drawSprite(SPRITES.PARTICLE, tr.x, tr.y, 20, 20, 0, [0.3, 0.6, 0.8, tr.life * 0.5]);
        });
        
        // Gravity Wells
        game.gravityWells.forEach(w => {
            r.drawSprite(SPRITES.GRAVITY_WELL, w.pos.x, w.pos.y, w.radius*2, w.radius*2, t*2, [0.8, 0, 1, 0.7]);
        });
        
        // Shofar
        if(game.player.shofarActive) {
            r.drawSprite(SPRITES.SHOFAR_WAVE, game.player.pos.x, game.player.pos.y - 100, 200, 400, 0, [1, 0.8, 0.2, 0.8]);
        }

        // AIM LINE
        if(game.touchCount > 0 && !game.player.isBitul) {
            for(let i=1; i<8; i++) {
                r.drawSprite(SPRITES.PARTICLE, game.player.pos.x, game.player.pos.y - i * 50, 4, 4, 0, [1, 1, 1, 0.4]);
            }
        }

        // Bullets - PURE WHITE (Shader will make them glow)
        game.bullets.forEach(b => r.drawSprite(b.sprite, b.pos.x, b.pos.y, 16, 32, b.vel.x * 0.1, COLORS.WHITE));

        // Enemy Bullets - BRIGHT RED
        if(game.enemyBullets) {
            game.enemyBullets.forEach(b => r.drawSprite(SPRITES.ENEMY_BULLET, b.pos.x, b.pos.y, 20, 20, 0, [1, 0.2, 0.2, 1]));
        }

        // Player - BRIGHT CYAN
        const playerAlpha = game.player.isBitul ? 0.5 : 1.0;
        const playerColor = game.player.isBitul ? [0.6, 0.6, 1, playerAlpha] : [0.2, 1.0, 1.0, 1.0];
        
        if(game.player.bitachonLevel >= 1.0) {
            r.drawSprite(SPRITES.CIRCLE, game.player.pos.x, game.player.pos.y, 80, 80, t*2, COLORS.GOLD);
        }
        r.drawSprite(SPRITES.PLAYER, game.player.pos.x, game.player.pos.y, game.player.radius*2.5, game.player.radius*2.5, 0, playerColor);
        
        // Orbitals
        game.orbitals.forEach(o => {
             r.drawSprite(SPRITES.PLAYER, o.pos.x, o.pos.y, 20, 20, 0, COLORS.GOLD);
        });
        
        // Shield
        if(game.player.shieldActive) {
            game.player.getShieldOrbs().forEach(orb => {
                r.drawSprite(SPRITES.POWERUP_SHIELD, orb.x, orb.y, 20, 20, 0, COLORS.GOLD);
            });
        }

        // Enemies
        game.enemies.forEach(snake => {
            snake.segments.forEach(s => {
                // If Head or Merkabah, Bright Red. Else Bright White.
                const isSpecial = s.type === SPRITES.SNAKE_HEAD || s.type === SPRITES.MERKABAH || s.type === SPRITES.TURRET;
                const col = s.flash > 0 ? COLORS.WHITE : (isSpecial ? [1, 0.2, 0.2, 1] : [0.9, 0.9, 0.9, 1]);
                
                let rot = 0;
                if(s.type === SPRITES.MERKABAH) rot = t * 2;
                r.drawSprite(s.type, s.pos.x, s.pos.y, s.radius*2, s.radius*2, rot, col);
            });
        });
        
        // Metatron
        game.metatronShapes.forEach(m => {
            r.drawSprite(m.type, m.pos.x, m.pos.y, 60, 60, m.angle.x, COLORS.CYAN);
        });

        // Powerups / Letters
        game.powerups.forEach(p => {
            let s = p.type === 'RAPID' ? SPRITES.POWERUP_ORB : 
                    (p.type==='SHIELD'?SPRITES.POWERUP_SHIELD :
                    (p.type==='COIN'?SPRITES.COIN : SPRITES.POWERUP_GENERIC));
            r.drawSprite(s, p.pos.x, p.pos.y, 40, 40, p.rot, COLORS.WHITE);
        });
        game.letters.forEach(l => {
            r.drawSprite(SPRITES.LETTER_PICKUP, l.pos.x, l.pos.y, 40, 40, Math.sin(t*5)*0.2, COLORS.YELLOW);
        });

        // Particles
        game.particles.forEach(p => {
            r.drawSprite(SPRITES.PARTICLE, p.pos.x, p.pos.y, p.size, p.size, 0, [p.color[0], p.color[1], p.color[2], p.life]);
        });
        
        // Touch UI
        if(game.touchCount > 0) {
            r.drawSprite(SPRITES.TOUCH_RING, game.player.targetPos.x, game.player.targetPos.y + 50, 60, 60, t*5, COLORS.CYAN);
        }

        r.flush();
    }
}