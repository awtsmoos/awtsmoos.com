
import { Director } from './architecture/Director.js';

/**
 * B"H
 * @class ArchitecturalManifest
 * @chapter The House of Beginning (Beis)
 */
export class ArchitecturalManifest {
    
    /**
     * @description Delegates wall rendering to the Architectural Director.
     */
    static drawWall(ctx, x, y, size, tile) {
        Director.render(ctx, x, y, size, tile);
    }

    /**
     * @description Materializes the Gate. 
     * Now renders a facade background behind the door for perfect integration.
     */
    static drawDoor(ctx, x, y, size, isHouse) {
        ctx.save();
        const fx = Math.floor(x);
        const fy = Math.floor(y);
        const fSize = Math.ceil(size) + 1;
        ctx.translate(fx, fy);
        
        ctx.beginPath(); ctx.rect(0, 0, fSize, fSize); ctx.clip();

        // 1. Facade Foundation
        ctx.fillStyle = '#d7ccc8';
        ctx.fillRect(0, 0, fSize, fSize);

        // 2. The Recess
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(size * 0.15, size * 0.25, size * 0.7, size * 0.75);
        
        // 3. The Door Wood
        ctx.fillStyle = isHouse ? '#5d4037' : '#3e2723';
        ctx.fillRect(size * 0.2, size * 0.3, size * 0.6, size * 0.7);

        // 4. Details
        ctx.strokeStyle = 'rgba(0,0,0,0.4)';
        ctx.lineWidth = 2;
        ctx.strokeRect(size * 0.3, size * 0.4, size * 0.4, size * 0.2);
        ctx.strokeRect(size * 0.3, size * 0.7, size * 0.4, size * 0.2);

        // Golden Handle
        ctx.fillStyle = '#ffb300';
        ctx.beginPath(); ctx.arc(size * 0.7, size * 0.65, 3, 0, Math.PI * 2); ctx.fill();

        ctx.restore();
    }

    static drawWoodFloor(ctx, x, y, size) {
        const fx = Math.floor(x);
        const fy = Math.floor(y);
        const fSize = Math.ceil(size) + 1;
        ctx.fillStyle = '#4e342e'; 
        ctx.fillRect(fx, fy, fSize, fSize);
        ctx.strokeStyle = '#3e2723';
        ctx.lineWidth = 2;
        for (let i = 1; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(fx + (i * size / 4), fy);
            ctx.lineTo(fx + (i * size / 4), fy + fSize);
            ctx.stroke();
        }
    }
}
