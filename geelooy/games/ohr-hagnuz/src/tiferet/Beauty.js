
import { Understanding } from '../binah/Understanding.js';
import { PixelArchitect } from '../render/PixelArchitect.js';
import { HeroDownFrames } from '../data/sprites/human/HeroDownFrames.js';
import { TreeData } from '../data/sprites/nature/TreeData.js';
import { NPCSprites } from '../data/sprites/NPCSprites.js';

/**
 * B"H
 * Beauty: The Revealer of Form.
 * 
 * This module renders the world. It caches the images (the light-garments)
 * and paints them onto the canvas with Divine precision.
 */
export class Beauty {
    static cache = {
        hero: [],
        tree: null,
        sage: null
    };

    /**
     * Weave the garments of light once, to be used forever.
     */
    static prepare() {
        if (this.cache.hero.length > 0) return;

        this.cache.hero = Object.values(HeroDownFrames).map(f => PixelArchitect.weave(f));
        this.cache.tree = PixelArchitect.weave(TreeData.OAK_PRIMARY);
        this.cache.sage = PixelArchitect.weave(NPCSprites.NPC_SAGE);
    }

    /**
     * The main draw loop.
     * @param {CanvasRenderingContext2D} ctx 
     */
    static reveal(ctx) {
        this.prepare();
        const state = Understanding.getState();
        const cam = state.camera;

        ctx.save();
        ctx.translate(-cam.x, -cam.y);

        this.drawMap(ctx, state);
        this.drawEntities(ctx, state);
        this.drawPlayer(ctx, state.player);

        ctx.restore();
    }

    static drawMap(ctx, state) {
        const ts = state.tileSize;
        state.map.forEach((row, y) => {
            row.forEach((tile, x) => {
                const wx = x * ts;
                const wy = y * ts;
                
                // Draw Grass
                ctx.fillStyle = (tile === '2') ? '#1b4d3e' : '#2e7d32';
                ctx.fillRect(wx, wy, ts, ts);

                // Draw Trees
                if (tile === 'T') {
                    ctx.drawImage(this.cache.tree, wx, wy, ts, ts);
                }
            });
        });
    }

    static drawEntities(ctx, state) {
        state.entities.forEach(ent => {
            if (ent.type === 'NPC_SAGE') {
                ctx.drawImage(this.cache.sage, ent.x, ent.y, ent.width, ent.height);
            }
        });
    }

    static drawPlayer(ctx, p) {
        const img = this.cache.hero[p.frame] || this.cache.hero[0];
        ctx.drawImage(img, p.x, p.y, p.width, p.height);
        
        // Subtle aura of light (The Ohr HaMekif)
        ctx.beginPath();
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
        ctx.arc(p.x + p.width/2, p.y + p.height/2, p.width/2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
    }
}
