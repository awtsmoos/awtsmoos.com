
/**
 * B"H
 * @class CactusWeaver
 * @chapter Surviving the Desert
 * @description
 * Draws the thick, resilient skin of the cactus, ensuring arms map inward 
 * securely to prevent disjointed geometry.
 */
export class CactusWeaver {
    static draw(ctx, size) {
        const w = size / 3.5; // Slightly thinner core
        
        // Left Arm (Shorter, deeper connect)
        ctx.beginPath();
        ctx.moveTo(-w*0.8, size*0.1); 
        ctx.quadraticCurveTo(-size*0.5, size*0.1, -size*0.5, -size*0.15);
        ctx.lineWidth = w * 0.8;
        ctx.strokeStyle = '#2e7d32';
        ctx.lineCap = 'round';
        ctx.stroke();

        // Right Arm (Taller, deeper connect)
        ctx.beginPath();
        ctx.moveTo(w*0.8, 0);
        ctx.quadraticCurveTo(size*0.5, 0, size*0.5, -size*0.3);
        ctx.stroke();

        // Main Body (Drawn LAST so it overlaps the arm roots!)
        ctx.fillStyle = '#2e7d32';
        ctx.beginPath();
        ctx.roundRect(-w/2, -size*0.35, w, size*0.85, 12);
        ctx.fill();

        // Needles (Spikes of Din)
        ctx.fillStyle = '#c8e6c9';
        for(let i=0; i<6; i++) {
            ctx.fillRect(-w/3, -size*0.25 + (i*10), 2, 2);
            ctx.fillRect(w/4, -size*0.25 + (i*10) + 5, 2, 2);
        }
    }
}
