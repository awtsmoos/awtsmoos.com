
import { StateRegister } from '../../../binah/StateRegister.js';

/**
 * B"H
 * @class RenderQueueBuilder
 * @chapter The Seder of Projection
 * @description
 * Gathers all entities, walls, trees, and the Tzaddik into a single array, 
 * calculating their `sortY` to ensure objects closer to the bottom of the screen 
 * are drawn last, perfectly occluding objects behind them.
 */
export class RenderQueueBuilder {
    
    /**
     * @description Evaluates a physical tile and adds it to the queue if it has vertical presence.
     */
    static enqueueTile(queue, tile, sx, sy, RES) {
        if (tile.t.startsWith('G_TREE')) {
            let tType = 'OAK';
            if (tile.char === '🌵') tType = 'CACTUS';
            else if (tile.char === '🌲') tType = 'PINE';
            else if (tile.char === '🌳') tType = 'GOLD';
            else if (tile.char === '🌴') tType = 'PALM';
            else if (tile.char === '🎄') tType = 'SNOW';
            else if (tile.char === '💎') tType = 'CRYSTAL';
            
            queue.push({ type: 'TREE', treeType: tType, x: sx, y: sy, sortY: sy + RES });
        }
        else if (tile.t.startsWith('G_WALL')) {
            queue.push({ type: 'WALL', x: sx, y: sy, sortY: sy + RES, tile: tile });
        }
        else if (tile.t === 'G_SCROLL') {
            queue.push({ type: 'SCROLL_WALL', x: sx, y: sy, sortY: sy + RES, seed: tile.x * 17 + tile.y * 31 });
        }
        else if (tile.isPortal && tile.t === 'G_DOOR_WOOD') {
            // Doors are slightly offset so they don't fight with walls
            queue.push({ type: 'DOOR', x: sx, y: sy, sortY: sy + RES + 0.1 });
        }
        else if (tile.encounter) {
            queue.push({ type: 'TALL_GRASS', x: sx, y: sy, sortY: sy + RES + 10 });
        }
        else if (tile.isSoul) {
            queue.push({ 
                type: (tile.isEnemy ? 'ANIMAL' : 'NPC'), 
                x: sx, 
                y: sy, 
                sortY: sy + RES, 
                dir: tile.dir, 
                color: tile.color 
            });
        }
    }

    /**
     * @description Inserts the Tzaddik into the spatial matrix.
     */
    static enqueueHero(queue, midX, midY, RES) {
        const HR = StateRegister.HeroPos;
        queue.push({ 
            type: 'HERO', 
            x: midX - RES / 2, 
            y: midY - RES / 2, 
            sortY: midY + RES / 2, 
            progress: HR.moving ? (HR.stepTick / RES) : 0, 
            dir: HR.dir 
        });
    }

    /**
     * @description Resolves the queue based on Y-coordinate.
     * @returns {Array} Sorted queue.
     */
    static sort(queue) {
        return queue.sort((a, b) => a.sortY - b.sortY);
    }
}
