
import { StateRegistry } from '../binah/StateRegistry.js';
import { WorldMapAssembler } from '../asiyah/WorldMapAssembler.js';
import { TextureGenerator } from '../yesod/TextureGenerator.js';
import { HumanGenerator } from '../render/HumanGenerator.js';
import { ArchitecturalManifest } from '../render/ArchitecturalManifest.js';

/**
 * B"H
 * @class RealityProjector
 * @chapter The Master Projection
 */
export class RealityProjector {
    static Caches = {};

    static warmupCanvases() {
        ['layer-bg', 'layer-obj', 'layer-over'].forEach(id => {
            const canvas = document.getElementById(id);
            if (canvas) {
                this.Caches[id] = canvas.getContext('2d');
            }
        });
    }

    static project() {
        const bg = this.Caches['layer-bg'];
        const obj = this.Caches['layer-obj'];
        if (!bg || !obj) return;

        const W = bg.canvas.width; const H = bg.canvas.height;
        const RES = StateRegistry.Resolution;

        bg.fillStyle = '#1b5e20'; // Base green
        bg.fillRect(0, 0, W, H);
        obj.clearRect(0, 0, W, H);

        const midX = W / 2; const midY = H / 2;
        const camX = Math.floor(StateRegistry.HeroPos.dx - midX + (RES / 2));
        const camY = Math.floor(StateRegistry.HeroPos.dy - midY + (RES / 2));

        const registry = WorldMapAssembler.WorldRegistry;
        const renderQueue = [];

        // 1. TERRAIN (Paints immediately to background)
        this._projectAbyss(bg, camX, camY, W, H, RES, registry);

        registry.forEach(tile => {
            const sx = (tile.x * RES) - camX;
            const sy = (tile.y * RES) - camY;

            if (sx > -RES * 2 && sx < W + RES * 2 && sy > -RES * 2 && sy < H + RES * 2) {
                this._paintTerrain(bg, sx, sy, RES, tile);
                this._enqueueTile(renderQueue, tile, sx, sy, RES);
            }
        });

        // 2. HERO (Enqueued for Y-Sorting)
        renderQueue.push({
            type: 'HERO',
            x: midX - RES/2,
            y: midY - RES/2,
            sortY: midY + RES/2,
            progress: StateRegistry.HeroPos.moving ? (StateRegistry.HeroPos.stepTick / RES) : 0,
            dir: StateRegistry.HeroPos.dir
        });

        // 3. DEPTH SORT & DRAW
        renderQueue.sort((a, b) => a.sortY - b.sortY).forEach(item => {
            if (item.type === 'HERO') {
                HumanGenerator.draw(obj, item.x, item.y, RES, item.progress, item.dir);
            } else if (item.type === 'WALL') {
                ArchitecturalManifest.drawWall(obj, item.x, item.y, RES);
            }
        });
    }

    static _projectAbyss(ctx, camX, camY, W, H, RES, registry) {
        const startX = Math.floor(camX / RES);
        const endX = Math.ceil((camX + W) / RES);
        const startY = Math.floor(camY / RES);
        const endY = Math.ceil((camY + H) / RES);

        const mapW = StateRegistry.GridWidth;
        const mapH = StateRegistry.GridHeight;

        for (let gy = startY; gy <= endY; gy++) {
            for (let gx = startX; gx <= endX; gx++) {
                const sx = (gx * RES) - camX;
                const sy = (gy * RES) - camY;
                if (gx < 0 || gx >= mapW || gy < 0 || gy >= mapH) {
                    ctx.fillStyle = '#0a2b1f'; 
                    ctx.fillRect(Math.floor(sx), Math.floor(sy), RES + 1, RES + 1);
                }
            }
        }
    }

    static _paintTerrain(ctx, x, y, size, tile) {
        const seed = tile.x * 13 + tile.y * 7;
        if (tile.t === 'G_DIRT_PATH') {
            const fx = Math.floor(x); const fy = Math.floor(y);
            ctx.fillStyle = '#8d6e63';
            ctx.fillRect(fx, fy, size + 1, size + 1);
        } else {
            TextureGenerator.drawGrass(ctx, x, y, size, seed, tile.encounter);
        }
    }

    static _enqueueTile(queue, tile, sx, sy, RES) {
        if (tile.char === 'W') {
            queue.push({ type: 'WALL', x: sx, y: sy, sortY: sy + RES });
        }
    }
}
