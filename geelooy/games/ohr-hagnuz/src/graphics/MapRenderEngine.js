
import { StateRegister } from '../binah/StateRegister.js';
import { PixelArchitect } from '../render/PixelArchitect.js';
import { WorldMapAssembler } from '../data/WorldMapAssembler.js';
import { AnimationDirector } from './AnimationDirector.js';
import { DialogueEngine } from './DialogueEngine.js';

/**
 * B"H
 * MapRenderEngine: Re-manifesting Asiyah per pulse with True Depth.
 * 
 * Chapter: The Illusion of Dimension.
 * When the Infinite Light contracted (Tzimtzum), it left a void where dimensions
 * could appear to exist. Time (frames), Space (X/Y), and Depth (Z-sorting) are
 * illusions maintained by the constant flow of calculations. By sorting our render 
 * queue based on the Y-axis, we replicate the physical reality where a tree obscures
 * a man standing behind it, and a man obscures a tree he stands in front of.
 * This is the ultimate Tikun (fixing) for the spatial visuals.
 * 
 * @class MapRenderEngine
 */
export class MapRenderEngine {
    
    /**
     * @param {Object} contexts - The Malchut canvases (BG, OBJ, OVER)
     */
    static draw(contexts) {
        const bg = contexts.BG; const obj = contexts.OBJ; const ov = contexts.OVER;
        const SCREEN_W = 460; const SCREEN_H = 500;
        const T = StateRegister.Resolution || 64; 

        bg.fillStyle = '#0a0a0d'; bg.fillRect(0,0,SCREEN_W,SCREEN_H);
        obj.clearRect(0,0,SCREEN_W,SCREEN_H);
        ov.clearRect(0,0,SCREEN_W,SCREEN_H); 

        const midX = SCREEN_W / 2;
        const midY = SCREEN_H / 2;

        // Camera Offset aligned to center the 64x64 Hero dynamically
        const offX = StateRegister.HeroPos.dx - midX + (T / 2);
        const offY = StateRegister.HeroPos.dy - midY + (T / 2);
        
        // 1. Gather all entities into a Render Queue for Y-Sorting
        const renderQueue = [];

        // Iterate the fabric of reality
        WorldMapAssembler.WorldRegistry.forEach(tile => {
            const sx = (tile.x * T) - offX; 
            const sy = (tile.y * T) - offY;
            
            // Frustum culling natively implemented
            if (sx > -T && sx < SCREEN_W + T && sy > -T && sy < SCREEN_H + T) {
                // Background is drawn immediately, no need to sort
                const bgImg = PixelArchitect.get(tile.t);
                if (bgImg) bg.drawImage(bgImg, sx, sy, T, T);
                
                // Objects are pushed to the queue
                if (tile.obj) {
                    renderQueue.push({
                        imgId: tile.obj,
                        x: sx,
                        y: sy,
                        sortY: sy // Base Y for sorting
                    });
                }
            }
        });

        // 2. Add the Hero to the Render Queue
        const fKey = AnimationDirector.resolveHeroFrame(
            StateRegister.HeroPos.dir, 
            StateRegister.HeroPos.moving, 
            StateRegister.HeroPos.stepTick
        );
        
        // Hero sits strictly in the center
        const heroScreenX = midX - (T / 2);
        const heroScreenY = midY - (T / 2);
        
        renderQueue.push({
            imgId: fKey,
            x: heroScreenX,
            y: heroScreenY,
            sortY: heroScreenY // Sorting aligned identically with world objects
        });

        // 3. Sort by Y coordinate (Depth Perception / True Realism)
        renderQueue.sort((a, b) => a.sortY - b.sortY);

        // 4. Draw the sorted Queue
        renderQueue.forEach(entity => {
            const img = PixelArchitect.get(entity.imgId);
            if (img) {
                obj.drawImage(img, entity.x, entity.y, T, T);
            }
        });

        // 5. Branching UI Manifestations
        if (StateRegister.ActiveRealm === 'DIALOGUE') {
            DialogueEngine.drawTextFrame(contexts, SCREEN_W, SCREEN_H);
        }
        
        // Render Settings Menu Overlay if invoked
        if (StateRegister.IsSettingsMenuOpen) {
            this.drawSettings(ov, SCREEN_W, SCREEN_H);
        }
    }

    /**
     * Overlays the spiritual limitations configuration directly onto the glass.
     */
    static drawSettings(ctx, W, H) {
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(0,0,W,H);
        ctx.fillStyle = '#fff';
        ctx.font = '12px "Press Start 2P", monospace';
        ctx.fillText("--- SPIRITUAL SETTINGS ---", 40, 100);
        
        const opt1 = `GAME SPEED: ${StateRegister.GameSpeedMultiplier}x`;
        const opt2 = `BACK TO WORLD`;
        
        ctx.fillStyle = StateRegister.SettingsSelectionIdx === 0 ? '#ff0' : '#fff';
        ctx.fillText((StateRegister.SettingsSelectionIdx === 0 ? "> " : "  ") + opt1, 60, 160);
        ctx.fillStyle = StateRegister.SettingsSelectionIdx === 1 ? '#ff0' : '#fff';
        ctx.fillText((StateRegister.SettingsSelectionIdx === 1 ? "> " : "  ") + opt2, 60, 200);
    }
}
