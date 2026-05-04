
import { Understanding } from '../binah/Understanding.js';
import { HumanGenerator } from '../render/HumanGenerator.js';
import { ArchitecturalManifest } from '../render/ArchitecturalManifest.js';
import { DialogueEngine } from '../graphics/DialogueEngine.js';

/**
 * B"H
 * Beauty: The Harmonious Reveal.
 * 
 * Chapter: The Order of Appearance.
 * In this world, objects that are lower in the visual field are closer to the 
 * observer's soul. We sort the entities and buildings by their Y-coordinate
 * to ensure that the garments of light do not overlap in chaotic ways.
 */
export class Beauty {
    /**
     * The reveal pulse of the universe.
     * @param {CanvasRenderingContext2D} ctx 
     */
    static reveal(ctx) {
        const state = Understanding.getState();
        const cam = state.camera;

        ctx.save();
        ctx.translate(-cam.x, -cam.y);

        this.drawGround(ctx, state);
        
        // Prepare a collection of all "Depth Objects"
        const depthObjects = [];

        // 1. Static Tiles with depth (Trees, Houses)
        state.map.forEach((row, y) => {
            row.forEach((tile, x) => {
                const wx = x * state.tileSize;
                const wy = y * state.tileSize;
                if (tile === 'T' || tile === 'H') {
                    depthObjects.push({ 
                        type: tile, x: wx, y: wy, 
                        priority: wy + (tile === 'H' ? state.tileSize * 1.5 : state.tileSize) 
                    });
                }
            });
        });

        // 2. Entities (Player, NPCs)
        depthObjects.push({ 
            type: 'PLAYER', 
            x: state.player.x, y: state.player.y, 
            priority: state.player.y + state.player.height,
            data: state.player 
        });

        state.entities.forEach(ent => {
            depthObjects.push({ 
                type: 'NPC', 
                x: ent.x, y: ent.y, 
                priority: ent.y + ent.height,
                data: ent 
            });
        });

        // 3. SORT BY PRIORITY (The Y-Sort)
        depthObjects.sort((a, b) => a.priority - b.priority);

        // 4. DRAW IN ORDER
        depthObjects.forEach(obj => {
            if (obj.type === 'T') this.drawTree(ctx, obj.x, obj.y, state.tileSize);
            else if (obj.type === 'H') ArchitecturalManifest.drawHouse(ctx, obj.x, obj.y, state.tileSize);
            else if (obj.type === 'PLAYER') HumanGenerator.draw(ctx, obj.data.x, obj.data.y, obj.data.width, obj.data.height, obj.data.isMoving ? obj.data.moveProgress : 0, obj.data.dir);
            else if (obj.type === 'NPC') HumanGenerator.draw(ctx, obj.data.x, obj.data.y, obj.data.width, obj.data.height, 0, obj.data.dir);
        });

        this.drawBorders(ctx, state);

        ctx.restore();
        DialogueEngine.draw(ctx);
    }

    static drawGround(ctx, state) {
        const ts = state.tileSize;
        const mapW = state.map[0].length * ts;
        const mapH = state.map.length * ts;

        if (state.realm === 'HOUSE') {
            ArchitecturalManifest.drawInterior(ctx, mapW, mapH, ts);
        } else {
            ctx.fillStyle = '#1b4d3e';
            ctx.fillRect(0, 0, mapW, mapH);
            state.map.forEach((row, y) => {
                row.forEach((tile, x) => {
                    if (tile === '1' || tile === '2') {
                        this.drawGrass(ctx, x * ts, y * ts, ts, tile === '2');
                    }
                });
            });
        }
    }

    static drawGrass(ctx, x, y, size, detailed) {
        ctx.fillStyle = '#2e7d32';
        ctx.fillRect(x, y, size, size);
        if (detailed) {
            ctx.strokeStyle = '#388e3c';
            ctx.lineWidth = 2;
            for(let i=0; i<4; i++) {
                const ox = x + 5 + Math.random() * (size-10);
                const oy = y + size - 5;
                ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + (Math.random()-0.5)*10, oy - 10 - Math.random()*10); ctx.stroke();
            }
        }
    }

    static drawTree(ctx, x, y, size) {
        ctx.save();
        ctx.translate(x + size/2, y + size/2);
        // Trunk
        ctx.fillStyle = '#4e342e';
        ctx.fillRect(-size/6, size/10, size/3, size/2);
        // Layers of life
        const layers = [
            { r: size * 0.6, c: '#1b5e20', oy: -size/4 },
            { r: size * 0.5, c: '#2e7d32', oy: -size/2 },
            { r: size * 0.3, c: '#388e3c', oy: -size * 0.7 }
        ];
        layers.forEach(l => {
            ctx.fillStyle = l.c;
            ctx.beginPath(); ctx.arc(0, l.oy, l.r, 0, Math.PI * 2); ctx.fill();
        });
        ctx.restore();
    }

    /**
     * Borders as far as the soul can perceive.
     */
    static drawBorders(ctx, state) {
        if (state.realm !== 'OVERWORLD') return;
        const ts = state.tileSize;
        const mW = state.map[0].length;
        const mH = state.map.length;
        
        // Simple infinite border effect: draw trees outside the grid
        const buffer = 10; 
        ctx.fillStyle = '#0a2b1f';
        // Left & Right
        for (let y = -buffer; y < mH + buffer; y++) {
            for (let x = -buffer; x < 0; x++) this.drawTree(ctx, x * ts, y * ts, ts);
            for (let x = mW; x < mW + buffer; x++) this.drawTree(ctx, x * ts, y * ts, ts);
        }
        // Top & Bottom
        for (let x = 0; x < mW; x++) {
            for (let y = -buffer; y < 0; y++) this.drawTree(ctx, x * ts, y * ts, ts);
            for (let y = mH; y < mH + buffer; y++) this.drawTree(ctx, x * ts, y * ts, ts);
        }
    }
}
