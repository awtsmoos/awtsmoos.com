
import { State } from '../binah/State.js';
import { WorldData } from '../data/WorldData.js';
import { Ground } from './render/Ground.js';
import { Human } from './render/Human.js';
import { Architecture } from './render/Architecture.js';

/**
 * B"H
 * @class Projector
 */
export class Projector {
    static Caches = {};

    static warmup() {
        ['layer-bg', 'layer-obj'].forEach(id => {
            const canvas = document.getElementById(id);
            if (canvas) {
                this.Caches[id] = canvas.getContext('2d');
                this.Caches[id].imageSmoothingEnabled = false;
            }
        });
    }

    static project() {
        const bg = this.Caches['layer-bg'];
        const obj = this.Caches['layer-obj'];
        if (!bg || !obj) return;

        const res = State.Resolution;
        const w = bg.canvas.width; const h = bg.canvas.height;
        
        bg.fillStyle = '#050505'; bg.fillRect(0, 0, w, h);
        obj.clearRect(0, 0, w, h);

        const midX = w / 2; const midY = h / 2;
        const camX = Math.floor(State.Hero.dx - midX + res / 2);
        const camY = Math.floor(State.Hero.dy - midY + res / 2);

        const map = WorldData[State.MapId];
        const renderQueue = [];

        map.forEach((row, ry) => {
            const characters = [...row];
            characters.forEach((char, rx) => {
                const sx = (rx * res) - camX;
                const sy = (ry * res) - camY;

                // Frustum Culling
                if (sx > -res * 2 && sx < w + res * 2 && sy > -res * 2 && sy < h + res * 2) {
                    
                    // 1. BACKGROUND LAYER
                    Ground.draw(bg, sx, sy, res, char, rx * 13 + ry * 7);

                    // 2. OBJECT LAYER (Enqueued for depth sorting)
                    if (char === 'W') {
                        renderQueue.push({ type: 'WALL', x: sx, y: sy, sortY: sy + res, rx, ry });
                    } else if (['☗', '★', '♜'].includes(char)) {
                        renderQueue.push({ type: 'DOOR', x: sx, y: sy, sortY: sy + res });
                    } else if (char === 'T') {
                        renderQueue.push({ type: 'TREE', x: sx, y: sy, sortY: sy + res, seed: rx * 7 + ry * 31 });
                    }
                }
            });
        });

        // Add Hero to Queue
        const prog = State.Hero.moving ? (State.Hero.stepTick / res) : 0;
        renderQueue.push({ 
            type: 'HERO', 
            x: midX - res / 2, 
            y: midY - res / 2, 
            sortY: midY + res / 2, 
            progress: prog, 
            dir: State.Hero.dir 
        });

        // DEPTH SORT & RENDER
        renderQueue.sort((a, b) => a.sortY - b.sortY).forEach(item => {
            if (item.type === 'WALL') Architecture.draw(obj, item.x, item.y, res, item.rx, item.ry);
            else if (item.type === 'DOOR') Architecture.drawDoor(obj, item.x, item.y, res);
            else if (item.type === 'TREE') this._drawTree(obj, item.x, item.y, res, item.seed);
            else if (item.type === 'HERO') Human.draw(obj, item.x, item.y, res, item.progress, item.dir);
        });
    }

    static _drawTree(ctx, x, y, size, s) {
        ctx.save();
        ctx.translate(x + size / 2, y + size / 2);
        // Trunk
        ctx.fillStyle = '#3e2723';
        ctx.fillRect(-size / 6, 0, size / 3, size / 2);
        // Foliage
        const colors = ['#1b5e20', '#2e7d32', '#388e3c'];
        for (let i = 0; i < 5; i++) {
            ctx.fillStyle = colors[i % colors.length];
            const ox = Math.sin(i * 1.5) * (size / 3);
            const oy = -size / 3 + Math.cos(i * 2) * (size / 4);
            const r = size / 2.5 + (s % 5);
            ctx.beginPath(); ctx.arc(ox, oy, r, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    }
}
