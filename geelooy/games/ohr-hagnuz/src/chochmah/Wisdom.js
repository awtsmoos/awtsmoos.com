
import { Understanding } from '../binah/Understanding.js';

/**
 * B"H
 * Wisdom: The Logic of Interaction.
 * 
 * "Who is wise? He who learns from every person."
 * And he who respects the boundaries of the physical world.
 * This module handles the movement and collisions.
 */
export class Wisdom {
    static keys = {};

    static initialize() {
        window.addEventListener('keydown', (e) => this.keys[e.key] = true);
        window.addEventListener('keyup', (e) => this.keys[e.key] = false);
    }

    /**
     * Process logic.
     * @param {number} dt Delta time.
     */
    static process(dt) {
        const state = Understanding.getState();
        const p = state.player;

        let dx = 0;
        let dy = 0;

        if (this.keys['ArrowUp'] || this.keys['w']) dy -= p.speed;
        if (this.keys['ArrowDown'] || this.keys['s']) dy += p.speed;
        if (this.keys['ArrowLeft'] || this.keys['a']) dx -= p.speed;
        if (this.keys['ArrowRight'] || this.keys['d']) dx += p.speed;

        // Collision logic (The limits of Gevurah)
        if (dx !== 0 || dy !== 0) {
            this.moveAndCollide(p, state, dx, dy);
            
            // Animation logic
            p.animTimer += dt;
            if (p.animTimer > 100) {
                p.frame = (p.frame + 1) % 6;
                p.animTimer = 0;
            }
        } else {
            p.frame = 0; // Idle
        }

        // Camera follow
        state.camera.x += (p.x - window.innerWidth / 2 - state.camera.x) * state.camera.lerp;
        state.camera.y += (p.y - window.innerHeight / 2 - state.camera.y) * state.camera.lerp;
    }

    /**
     * Move the player and check for collisions with solid tiles ('T').
     */
    static moveAndCollide(p, state, dx, dy) {
        const ts = state.tileSize;
        
        // Horizontal check
        const nextX = p.x + dx;
        if (!this.isSolid(nextX, p.y, p.width, p.height, state)) {
            p.x = nextX;
        }

        // Vertical check
        const nextY = p.y + dy;
        if (!this.isSolid(p.x, nextY, p.width, p.height, state)) {
            p.y = nextY;
        }
    }

    /**
     * Checks if a rectangular area collides with a solid tile.
     */
    static isSolid(x, y, w, h, state) {
        const ts = state.tileSize;
        const left = Math.floor(x / ts);
        const right = Math.floor((x + w) / ts);
        const top = Math.floor(y / ts);
        const bottom = Math.floor((y + h) / ts);

        for (let r = top; r <= bottom; r++) {
            for (let c = left; c <= right; c++) {
                const tile = state.map[r]?.[c];
                if (tile === 'T') return true;
            }
        }
        return false;
    }
}
