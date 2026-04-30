
import SederHishtalshelusNode from '../../core/SederHishtalshelusNode.js';

/**
 * B"H
 * @file WorldRenderer.js
 * 
 * Chapter: The Master Painter of Asiyah.
 * We banish the abstract Tohu (Blue Screen) and manifest Tikun (Order)!
 * This renderer draws the physical floor tiles, offsets the world via the 
 * Camera, and draws the glowing Player and wandering NPCs. 
 * This creates a 100% playable universe entirely within a Canvas.
 */

/**
 * @class WorldRenderer
 * @extends SederHishtalshelusNode
 * @description The intense, optimized canvas drawing engine for the playable world.
 */
export default class WorldRenderer extends SederHishtalshelusNode {
    /**
     * @param {CanvasRenderingContext2D} ctx 
     * @param {HTMLCanvasElement} canvas 
     */
    constructor(ctx, canvas) {
        super({ worldName: "Asiyah_World_Painter" });
        this.ctx = ctx;
        this.canvas = canvas;
    }

    /**
     * @method renderWorld
     * @description Executes the supreme drawing routine every frame.
     * @param {Object} level - LevelMatrix instance.
     * @param {Object} camera - CameraVessel instance.
     * @param {Object} hero - HeroSoul instance.
     * @param {Array<Object>} npcs - Array of NPCEntity instances.
     */
    renderWorld(level, camera, hero, npcs) {
        const ctx = this.ctx;
        
        // 1. Wipe the screen clean (Nullification)
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 2. Save pure state and apply Camera Offset (Tzimtzum manipulation)
        ctx.save();
        ctx.translate(-camera.offsetX, -camera.offsetY);

        // 3. Draw Terrain Vessels
        const grid = level.getGrid();
        const tileSize = level.tileSize;
        
        // Optimization: Only draw tiles within the camera's view
        for (let y = 0; y < grid.length; y++) {
            for (let x = 0; x < grid[y].length; x++) {
                const tile = grid[y][x];
                
                // Culling unseen realms
                if (
                    tile.worldX + tileSize < camera.offsetX || 
                    tile.worldX > camera.offsetX + this.canvas.width ||
                    tile.worldY + tileSize < camera.offsetY || 
                    tile.worldY > camera.offsetY + this.canvas.height
                ) {
                    continue;
                }

                ctx.fillStyle = tile.color;
                ctx.fillRect(tile.worldX, tile.worldY, tileSize + 1, tileSize + 1); // +1 fixes antialiasing seams
            }
        }

        // 4. Draw Wandering NPCs (Golden Sparks)
        npcs.forEach(npc => {
            const data = npc.getManifest();
            ctx.beginPath();
            ctx.arc(data.x, data.y, data.radius, 0, Math.PI * 2);
            ctx.fillStyle = data.color;
            ctx.fill();
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#fff';
            ctx.stroke();

            // Draw Thought Bubbles!
            if (data.thought) {
                ctx.fillStyle = 'rgba(255,255,255,0.9)';
                ctx.fillRect(data.x - 50, data.y - 60, 100, 30);
                ctx.fillStyle = 'black';
                ctx.font = '10px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(data.thought.substring(0,15)+"...", data.x, data.y - 40);
            }
        });

        // 5. Draw the Player (HeroSoul - The Divine Cyan Core)
        const pData = hero.getManifest();
        ctx.beginPath();
        ctx.arc(pData.x, pData.y, pData.radius, 0, Math.PI * 2);
        ctx.fillStyle = pData.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00ffff';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
        ctx.shadowBlur = 0; // Restore shadow

        // 6. Restore original un-translated matrix for HUD elements
        ctx.restore();
    }
}
