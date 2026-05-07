
import { StateRegister } from '../binah/StateRegister.js';
import { WorldMapAssembler } from '../data/WorldMapAssembler.js';
import { ProceduralEnvironment } from '../render/ProceduralEnvironment.js';
import { ArchitecturalManifest } from '../render/ArchitecturalManifest.js';
import { HumanGenerator } from '../render/HumanGenerator.js';
import { PathRenderer } from '../render/PathRenderer.js';
import { RoadPainter } from './render/RoadPainter.js';
import { GroundPainter } from './render/GroundPainter.js';

/**
 * B"H
 * @class MapRenderEngine
 * @chapter The Master Weaver of Dimensions
 */
export class MapRenderEngine {
    static draw(contexts) {
        const bg = contexts.BG;
        const obj = contexts.OBJ;
        if (!bg || !obj) return;

        const W = bg.canvas.width, H = bg.canvas.height;
        const RES = StateRegister.Resolution || 64;
        const isHouse = StateRegister.CurrentMapId.includes('House') || StateRegister.CurrentMapId === 'HOUSE';

        // Base Region Background Colors (The endless firmament beneath)
        const regionColors = {
            'Gimmel': '#e6c280',    // Desert
            'YudDalet': '#f5f5f5',  // Snow
            'YudHey': '#5d4037',    // Mountain
            'YudVav': '#0288d1'     // Ocean
        };
        
        bg.fillStyle = isHouse ? '#2d1e16' : '#1b5e20'; 
        Object.entries(regionColors).forEach(([key, color]) => {
            if (StateRegister.CurrentMapId.includes(key)) bg.fillStyle = color;
        });

        bg.fillRect(0, 0, W, H);
        obj.clearRect(0, 0, W, H);

        const midX = W / 2, midY = H / 2;
        
        // CRITICAL: Floor the camera coordinates to prevent sub-pixel artifacting/seams!
        const camX = Math.floor(StateRegister.HeroPos.dx - midX + (RES / 2));
        const camY = Math.floor(StateRegister.HeroPos.dy - midY + (RES / 2));

        const registry = WorldMapAssembler.WorldRegistry;
        const renderQueue = [];

        if (!isHouse) this._drawAbyss(bg, renderQueue, camX, camY, W, H, RES, registry);

        registry.forEach(tile => {
            const sx = (tile.x * RES) - camX;
            const sy = (tile.y * RES) - camY;

            // Frustum Culling
            if (sx > -RES * 2 && sx < W + RES * 2 && sy > -RES * 2 && sy < H + RES * 2) {
                if (isHouse) {
                    ArchitecturalManifest.drawWoodFloor(bg, sx, sy, RES);
                } else if (tile.t === 'G_DIRT_PATH') {
                    RoadPainter.draw(bg, sx, sy, RES, tile);
                } else {
                    GroundPainter.draw(bg, sx, sy, RES, tile);
                }
                this._enqueue(renderQueue, tile, sx, sy, RES);
            }
        });

        PathRenderer.draw(obj, camX, camY, RES);
        this._enqueueHero(renderQueue, midX, midY, RES);
        
        // Final depth sort (Y-Sort) to ensure entities overlap correctly
        renderQueue.sort((a, b) => a.sortY - b.sortY).forEach(item => {
            this._draw(obj, item, RES);
        });
    }

    /**
     * @description Paints the infinite void. The terrain is painted immediately to BG, 
     * but trees/flora are passed to the OBJ queue to ensure proper Y-Sorting!
     */
    static _drawAbyss(bgCtx, queue, camX, camY, W, H, RES, registry) {
        const startX = Math.floor(camX / RES);
        const endX = Math.ceil((camX + W) / RES);
        const startY = Math.floor(camY / RES);
        const endY = Math.ceil((camY + H) / RES);

        const mapW = 25; const mapH = 14;

        let abyssTreeType = 'OAK';
        let abyssTerrainChar = '1';
        
        if (StateRegister.CurrentMapId.includes('Gimmel')) { abyssTreeType = 'CACTUS'; abyssTerrainChar = '.'; }
        else if (StateRegister.CurrentMapId.includes('YudDalet')) { abyssTreeType = 'SNOW'; abyssTerrainChar = '*'; }
        else if (StateRegister.CurrentMapId.includes('YudHey')) { abyssTreeType = 'OAK'; abyssTerrainChar = '^'; }
        else if (StateRegister.CurrentMapId.includes('YudVav')) { abyssTreeType = 'OAK'; abyssTerrainChar = '~'; }

        for (let gy = startY; gy <= endY; gy++) {
            for (let gx = startX; gx <= endX; gx++) {
                if (gx < 0 || gx >= mapW || gy < 0 || gy >= mapH) {
                    const edgeX = Math.max(0, Math.min(gx, mapW - 1));
                    const edgeY = Math.max(0, Math.min(gy, mapH - 1));
                    const edgeTile = registry.find(t => t.x === edgeX && t.y === edgeY);
                    
                    const screenX = (gx * RES) - camX;
                    const screenY = (gy * RES) - camY;

                    let isRoad = false;
                    let mockNeighbors = { u: false, d: false, l: false, r: false };

                    if (edgeTile && edgeTile.t === 'G_DIRT_PATH') {
                        if (gx < 0) { isRoad = true; mockNeighbors.l = true; mockNeighbors.r = true; }
                        else if (gx >= mapW) { isRoad = true; mockNeighbors.l = true; mockNeighbors.r = true; }
                        else if (gy < 0) { isRoad = true; mockNeighbors.u = true; mockNeighbors.d = true; }
                        else if (gy >= mapH) { isRoad = true; mockNeighbors.u = true; mockNeighbors.d = true; }
                    }

                    if (isRoad) {
                        RoadPainter.draw(bgCtx, screenX, screenY, RES, { x: gx, y: gy, isPortal: true }, mockNeighbors);
                    } else {
                        // Paint the terrain directly to the background
                        GroundPainter.draw(bgCtx, screenX, screenY, RES, { x: gx, y: gy, char: abyssTerrainChar });
                        
                        // Push the flora into the object queue so it sorts correctly over the sand!
                        if (abyssTerrainChar !== '~') {
                            queue.push({ type: 'TREE', treeType: abyssTreeType, x: screenX, y: screenY, sortY: screenY + RES });
                        }
                    }
                }
            }
        }
    }

    static _enqueue(queue, tile, sx, sy, RES) {
        if (tile.t.startsWith('G_TREE')) {
            let treeType = 'OAK';
            if (tile.char === '🌵') treeType = 'CACTUS';
            else if (tile.char === '🌲') treeType = 'PINE';
            else if (tile.char === '🌳') treeType = 'GOLD';
            else if (tile.char === '🌴') treeType = 'PALM';
            else if (tile.char === '🎄') treeType = 'SNOW';
            
            queue.push({ type: 'TREE', treeType: treeType, x: sx, y: sy, sortY: sy + RES });
        }
        else if (tile.t.startsWith('G_WALL')) queue.push({ type: 'WALL', x: sx, y: sy, sortY: sy + RES, tile: tile });
        else if (tile.isPortal && tile.t === 'G_DOOR_WOOD') queue.push({ type: 'DOOR', x: sx, y: sy, sortY: sy + RES + 0.1 });
        else if (tile.encounter) queue.push({ type: 'TALL_GRASS', x: sx, y: sy, sortY: sy + RES + 10 });
        else if (tile.isSoul) {
            queue.push({ type: (tile.isEnemy ? 'ANIMAL' : 'NPC'), x: sx, y: sy, sortY: sy + RES, dir: tile.dir, color: tile.color });
        }
    }

    static _enqueueHero(queue, midX, midY, RES) {
        queue.push({ type: 'HERO', x: midX - RES/2, y: midY - RES/2, sortY: midY + RES/2, progress: StateRegister.HeroPos.moving ? (StateRegister.HeroPos.stepTick / RES) : 0, dir: StateRegister.HeroPos.dir });
    }

    static _draw(ctx, item, RES) {
        if (item.type === 'TREE') ProceduralEnvironment.drawTree(ctx, item.x, item.y, RES, item.treeType);
        else if (item.type === 'WALL') ArchitecturalManifest.drawWall(ctx, item.x, item.y, RES, item.tile);
        else if (item.type === 'NPC') HumanGenerator.draw(ctx, item.x, item.y, RES, 0, item.dir, item.color);
        else if (item.type === 'HERO') HumanGenerator.draw(ctx, item.x, item.y, RES, item.progress, item.dir);
        else if (item.type === 'DOOR') ArchitecturalManifest.drawDoor(ctx, item.x, item.y, RES, false);
        else if (item.type === 'TALL_GRASS') ProceduralEnvironment.drawTallGrass(ctx, item.x, item.y, RES);
        else if (item.type === 'ANIMAL') {
            ctx.fillStyle = item.color;
            ctx.beginPath(); ctx.roundRect(item.x + 10, item.y + RES/2.5, RES-20, RES/2.5, 8); ctx.fill();
            ctx.fillStyle = '#ffdbac'; ctx.beginPath(); ctx.arc(item.dir === 'l' ? item.x + 10 : item.x + RES - 10, item.y + RES/2.5, 12, 0, Math.PI*2); ctx.fill();
        }
    }
}
