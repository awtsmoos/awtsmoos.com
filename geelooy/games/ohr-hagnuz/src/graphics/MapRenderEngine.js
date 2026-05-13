
import { StateRegister } from '../binah/StateRegister.js';
import { WorldMapAssembler } from '../data/WorldMapAssembler.js';

// Modular Rendering Engines
import { SkyGradientWeaver } from './render/engine/SkyGradientWeaver.js';
import { TimeFilterWeaver } from './render/engine/TimeFilterWeaver.js';
import { AbyssRenderer } from './render/engine/AbyssRenderer.js';
import { RenderQueueBuilder } from './render/engine/RenderQueueBuilder.js';

// Specific Painters & Weavers
import { ProceduralEnvironment } from '../render/ProceduralEnvironment.js';
import { ArchitecturalManifest } from '../render/ArchitecturalManifest.js';
import { HumanGenerator } from '../render/HumanGenerator.js';
import { PathRenderer } from '../render/PathRenderer.js';
import { RoadPainter } from './render/RoadPainter.js';
import { GroundPainter } from './render/GroundPainter.js';
import { ParticleRenderer } from './render/fx/ParticleRenderer.js';
import { WeatherRenderer } from './render/fx/WeatherRenderer.js';
import { ReflectionWeaver } from './render/fx/ReflectionWeaver.js';
import { ScrollWeaver } from '../render/architecture/parts/ScrollWeaver.js';

/**
 * B"H
 * @class MapRenderEngine
 * @chapter The Orchestration of the Countenance
 * @description
 * This is the Malkhut of the visual system. It takes the abstract coordinates of Binah 
 * and routes them through the highly modular drawing sub-systems.
 * Every frame is drawn from nothingness, proving continuous creation.
 */
export class MapRenderEngine {
    static draw(contexts) {
        const bg = contexts.BG;
        const obj = contexts.OBJ;
        const over = contexts.OVER;
        if (!bg || !obj || !over) return;

        const W = bg.canvas.width;
        const H = bg.canvas.height;
        const RES = StateRegister.Resolution || 64;
        const isHouse = StateRegister.CurrentMapId.includes('House') || StateRegister.CurrentMapId === 'HOUSE';

        // 1. SKY & FOUNDATION PURGE
        SkyGradientWeaver.apply(bg, W, H, isHouse);
        obj.clearRect(0, 0, W, H);
        over.clearRect(0, 0, W, H);

        const midX = W / 2;
        const midY = H / 2;
        const camX = Math.floor(StateRegister.HeroPos.dx - midX + (RES / 2));
        const camY = Math.floor(StateRegister.HeroPos.dy - midY + (RES / 2));

        const registry = WorldMapAssembler.WorldRegistry;
        const renderQueue =[];

        // 2. INFINITE ABYSS RENDERING
        if (!isHouse) {
            AbyssRenderer.draw(bg, renderQueue, camX, camY, W, H, RES);
        }

        // 3. TERRAIN MATRIX & QUEUE BUILDING
        registry.forEach(tile => {
            const sx = (tile.x * RES) - camX;
            const sy = (tile.y * RES) - camY;

            // Frustum Culling (Only draw what the eye can see)
            if (sx > -RES * 2 && sx < W + RES * 2 && sy > -RES * 2 && sy < H + RES * 2) {
                if (isHouse) {
                    ArchitecturalManifest.drawWoodFloor(bg, sx, sy, RES);
                    if (tile.t === 'G_STAIRS') {
                        ArchitecturalManifest.drawStairs(bg, sx, sy, RES);
                    }
                } else if (tile.t === 'G_DIRT_PATH') {
                    RoadPainter.draw(bg, sx, sy, RES, tile);
                } else {
                    GroundPainter.draw(bg, sx, sy, RES, tile);
                }
                
                // Add vertical elements to the Y-Sort queue
                RenderQueueBuilder.enqueueTile(renderQueue, tile, sx, sy, RES);
            }
        });

        // 4. THE PATH OF PROVIDENCE
        PathRenderer.draw(obj, camX, camY, RES);

        // 5. THE TZADDIK
        RenderQueueBuilder.enqueueHero(renderQueue, midX, midY, RES);
        
        // 6. AS ABOVE, SO BELOW (Water Reflections)
        ReflectionWeaver.draw(obj, renderQueue, camX, camY, RES);

        // 7. Y-SORT & PROJECTION
        RenderQueueBuilder.sort(renderQueue).forEach(item => {
            this._drawEntity(obj, item, RES);
        });

        // 8. OTIOT PARTICLES
        ParticleRenderer.draw(obj, camX, camY);

        // 9. WEATHER & CELESTIAL FILTERS
        WeatherRenderer.draw(over, W, H);
        TimeFilterWeaver.apply(over, W, H);
    }

    /**
     * @description Materializes an object from the queue.
     */
    static _drawEntity(ctx, item, RES) {
        if (item.type === 'TREE') {
            ProceduralEnvironment.drawTree(ctx, item.x, item.y, RES, item.treeType);
        }
        else if (item.type === 'WALL') {
            ArchitecturalManifest.drawWall(ctx, item.x, item.y, RES, item.tile);
        }
        else if (item.type === 'SCROLL_WALL') {
            ScrollWeaver.draw(ctx, RES, item.seed);
        }
        else if (item.type === 'NPC') {
            HumanGenerator.draw(ctx, item.x, item.y, RES, 0, item.dir, item.color);
        }
        else if (item.type === 'HERO') {
            // Hero receives the garment color dynamically
            const activeGarmentId = StateRegister.Equipment.garment;
            let forceColor = null;
            if (activeGarmentId === 'DARK_ROBE') forceColor = '#1e2430';
            else if (activeGarmentId === 'GOLD_ROBE') forceColor = '#ffb300';
            else if (activeGarmentId === 'TZITZIT_LIGHT') forceColor = '#e0f7fa';
            
            HumanGenerator.draw(ctx, item.x, item.y, RES, item.progress, item.dir, forceColor);
        }
        else if (item.type === 'DOOR') {
            ArchitecturalManifest.drawDoor(ctx, item.x, item.y, RES, false);
        }
        else if (item.type === 'TALL_GRASS') {
            ProceduralEnvironment.drawTallGrass(ctx, item.x, item.y, RES);
        }
        else if (item.type === 'ANIMAL') {
            // Simplified Behemoth/Animal proxy representation
            ctx.fillStyle = item.color;
            ctx.beginPath(); 
            ctx.roundRect(item.x + 10, item.y + RES/2.5, RES-20, RES/2.5, 8); 
            ctx.fill();
            
            // Eye
            ctx.fillStyle = '#ffdbac'; 
            ctx.beginPath(); 
            ctx.arc(item.dir === 'l' ? item.x + 10 : item.x + RES - 10, item.y + RES/2.5, 12, 0, Math.PI*2); 
            ctx.fill();
        }
    }
}
