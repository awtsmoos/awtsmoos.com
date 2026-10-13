//B"H
//Boruch Hashem
//Blessed be He
import { WebGLRenderer } from '../graphics/renderer.js';
import { SPRITES, COLORS } from '../constants.js';

/**
 * @file render_system.js
 * @description Draws one Kabbalah Shooter frame with an instantly readable visual language.
 *
 * VISUAL LANGUAGE (revamp 2026-10-13 — "a new player understands in 5 seconds"):
 *   YOU (player vessel) = GOLD ringed vessel, white-hot core, breathing halo.
 *                          Biggest readable shape on the field. Nothing else is gold.
 *   YOUR LIGHT (bullets) = CYAN capsules. Nothing else is cyan.
 *   ENEMIES              = RED family only — angular silhouettes (arrowheads, hexagons,
 *                          darts, diamonds). Never white, never cyan, never round-soft.
 *   ENEMY FIRE           = RED orbs with warning rings. Slower, spaced, telegraphed.
 *   HIT FEEDBACK         = white flash + size pop on struck enemies (seg.flash);
 *                          red vignette + shake on player damage (game.hurtFlash,
 *                          drawn by the UI system).
 *
 * The atlas sprites are white/neutral; every hue here comes from tint, so the
 * language stays consistent even as sprites are redrawn.
 */
const GOLD = [1, 0.78, 0.22, 1];
const GOLD_HALO = [1, 0.82, 0.35, 0.5];
const CORE_WHITE = [1, 1, 1, 1];
const CYAN_BULLET = [0.5, 1, 1, 1];
const ENEMY_HEAD = [1, 0.14, 0.14, 1];
const ENEMY_BODY = [0.82, 0.24, 0.1, 1];
const ENEMY_BULLET = [1, 0.2, 0.2, 1];
const TELEGRAPH = [1, 0.3, 0.3, 0.85];
const HIT_FLASH = [1, 1, 1, 1];

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

        // Grid - dim backdrop so actors pop.
        const gridOffset = game.shake;
        for(let i=0; i<25; i++) {
            let y = (i * 60 + t * 100) % game.height;
            let alpha = 0.22 + (game.combo * 0.005);
            r.drawSprite(SPRITES.GRID_LINE, game.width/2 + gridOffset, y, game.width * 2, 2, 0, [0.16, 0.16, 0.32, alpha]);
        }

        // Feature Managers
        game.extremeManager.render(r);
        game.redemptionManager.render(r);
        if(game.luminosityManager) game.luminosityManager.render(r);
        if(game.pasachManager) game.pasachManager.render(r);
        if(game.tachlitManager) game.tachlitManager.render(r);

        // Stars - dim.
        game.stars.forEach(s => {
            r.drawSprite(SPRITES.STAR, s.x, s.y, s.z*2, s.z*2, 0, [0.45, 0.45, 0.5, 0.7]);
        });

        // Shadow of the player's past - kept subtle and dark so it never reads as an actor.
        if(game.shadowPos) {
            r.drawSprite(SPRITES.SHADOW_PLAYER, game.shadowPos.x, game.shadowPos.y, 56, 56, 0, [0.5, 0.08, 0.08, 0.35]);
        }

        // Player trail - faint gold, never cyan-bright.
        game.player.trail.forEach(tr => {
            r.drawSprite(SPRITES.PARTICLE, tr.x, tr.y, 16, 16, 0, [0.9, 0.7, 0.3, tr.life * 0.35]);
        });

        // Gravity Wells
        game.gravityWells.forEach(w => {
            r.drawSprite(SPRITES.GRAVITY_WELL, w.pos.x, w.pos.y, w.radius*2, w.radius*2, t*2, [0.8, 0, 1, 0.7]);
        });

        // Shofar
        if(game.player.shofarActive) {
            r.drawSprite(SPRITES.SHOFAR_WAVE, game.player.pos.x, game.player.pos.y - 100, 200, 400, 0, [1, 0.8, 0.2, 0.8]);
        }

        // Aim line - soft gold dots while dragging.
        if(game.touchCount > 0 && !game.player.isBitul) {
            for(let i=1; i<8; i++) {
                r.drawSprite(SPRITES.PARTICLE, game.player.pos.x, game.player.pos.y - i * 50, 4, 4, 0, [1, 0.85, 0.4, 0.35]);
            }
        }

        // YOUR LIGHT - cyan capsules. The only cyan on the field.
        game.bullets.forEach(b => r.drawSprite(b.sprite, b.pos.x, b.pos.y, 18, 36, b.vel.x * 0.08, CYAN_BULLET));

        // ENEMY FIRE - red orbs with warning rings. Slower, spaced, telegraphed.
        if(game.enemyBullets) {
            game.enemyBullets.forEach(b => {
                const pulse = 1 + Math.sin(t * 10) * 0.08;
                r.drawSprite(SPRITES.ENEMY_BULLET, b.pos.x, b.pos.y, 26 * pulse, 26 * pulse, 0, ENEMY_BULLET);
            });
        }

        // YOU - the golden vessel. Biggest readable shape; nothing else is gold.
        // Brief blink while post-hit invulnerability is active (fair + readable).
        const invuln = game.player.invulnTimer > 0;
        const blinkOff = invuln && Math.floor(t * 14) % 2 === 0;
        if (!blinkOff) {
            const pr = game.player.radius;
            const haloR = pr * 3.4 * (1 + Math.sin(t * 3) * 0.06);
            r.drawSprite(SPRITES.CIRCLE, game.player.pos.x, game.player.pos.y, haloR * 2, haloR * 2, 0, GOLD_HALO);
            const playerAlpha = game.player.isBitul ? 0.55 : 1.0;
            const vessel = game.player.isBitul ? [0.75, 0.75, 1, playerAlpha] : [GOLD[0], GOLD[1], GOLD[2], playerAlpha];
            r.drawSprite(SPRITES.PLAYER, game.player.pos.x, game.player.pos.y, pr * 3, pr * 3, 0, vessel);
            // White-hot core: the "soul" of the vessel.
            r.drawSprite(SPRITES.CIRCLE, game.player.pos.x, game.player.pos.y, pr * 1.1, pr * 1.1, 0, CORE_WHITE);
        }

        // Orbitals - small gold guardians of the vessel.
        game.orbitals.forEach(o => {
             r.drawSprite(SPRITES.PLAYER, o.pos.x, o.pos.y, 22, 22, 0, GOLD);
        });

        // Shield
        if(game.player.shieldActive) {
            game.player.getShieldOrbs().forEach(orb => {
                r.drawSprite(SPRITES.POWERUP_SHIELD, orb.x, orb.y, 22, 22, 0, GOLD);
            });
        }

        // ENEMIES - red family only, angular silhouettes. Never white, never cyan.
        game.enemies.forEach(snake => {
            snake.segments.forEach(s => {
                const isHead = s.type === SPRITES.SNAKE_HEAD || s.type === SPRITES.MERKABAH
                    || s.type === SPRITES.TURRET || s.type === SPRITES.SWARMER || s.type === SPRITES.SERAPH;
                const col = s.flash > 0 ? HIT_FLASH : (isHead ? ENEMY_HEAD : ENEMY_BODY);
                let rot = 0;
                if(s.type === SPRITES.MERKABAH) rot = t * 2;
                const size = s.radius * 2 * (s.flash > 0 ? 1.12 : 1); // hit pop
                r.drawSprite(s.type, s.pos.x, s.pos.y, size, size, rot, col);
                // Telegraph ring: this enemy is about to fire — the fair warning.
                if (s.telegraph > 0) {
                    const k = s.telegraph / 40;
                    const ringR = (s.radius * 2 + 26) * (0.7 + 0.3 * k);
                    r.drawSprite(SPRITES.CIRCLE, s.pos.x, s.pos.y, ringR * 2, ringR * 2, 0,
                        [TELEGRAPH[0], TELEGRAPH[1], TELEGRAPH[2], 0.25 + 0.65 * (1 - k)]);
                }
            });
        });

        // Metatron - soft cyan geometry (neutral holy shapes, not actors).
        game.metatronShapes.forEach(m => {
            r.drawSprite(m.type, m.pos.x, m.pos.y, 60, 60, m.angle.x, [0.5, 0.9, 1, 0.9]);
        });

        // Powerups / Letters - pickups read as treasure: gold and white.
        game.powerups.forEach(p => {
            let s = p.type === 'RAPID' ? SPRITES.POWERUP_ORB :
                    (p.type==='SHIELD'?SPRITES.POWERUP_SHIELD :
                    (p.type==='COIN'?SPRITES.COIN : SPRITES.POWERUP_GENERIC));
            r.drawSprite(s, p.pos.x, p.pos.y, 40, 40, p.rot, CORE_WHITE);
        });
        game.letters.forEach(l => {
            r.drawSprite(SPRITES.LETTER_PICKUP, l.pos.x, l.pos.y, 44, 44, Math.sin(t*5)*0.2, [1, 0.9, 0.45, 1]);
        });

        // Particles
        game.particles.forEach(p => {
            r.drawSprite(SPRITES.PARTICLE, p.pos.x, p.pos.y, p.size, p.size, 0, [p.color[0], p.color[1], p.color[2], p.life]);
        });

        // Touch UI - gold ring at the drag target.
        if(game.touchCount > 0) {
            r.drawSprite(SPRITES.TOUCH_RING, game.player.targetPos.x, game.player.targetPos.y + 50, 60, 60, t*5, [1, 0.82, 0.35, 0.9]);
        }

        r.flush();
    }
}
