
/**
 * B"H
 * ArchitecturalManifest: The Builder of Sanctuaries.
 * 
 * Chapter: The Walls of Jerusalem.
 * This class now manifests intricate brickwork (Avanim).
 * Each brick is a vessel holding its own spark of light.
 */
export class ArchitecturalManifest {
    /**
     * Draw a procedurally generated brick house.
     * @param {CanvasRenderingContext2D} ctx 
     * @param {number} x 
     * @param {number} y 
     * @param {number} tileSize 
     */
    static drawHouse(ctx, x, y, tileSize) {
        // Visual size is larger than the logical tile
        const size = tileSize * 2.5; 
        const offsetX = - (size - tileSize) / 2;
        const offsetY = - (size - tileSize); // Sit on top of the tile

        ctx.save();
        ctx.translate(x + offsetX, y + offsetY);

        const wallColor = '#d7ccc8';
        const brickColor = '#bcaaa4';
        const roofColor = '#5d4037';
        const doorColor = '#3e2723';
        const windowColor = '#e1f5fe';

        // 1. WALLS with BRICKS
        ctx.fillStyle = wallColor;
        const wallX = size * 0.1;
        const wallY = size * 0.35;
        const wallW = size * 0.8;
        const wallH = size * 0.6;
        ctx.fillRect(wallX, wallY, wallW, wallH);

        // Procedural Bricks
        ctx.strokeStyle = brickColor;
        ctx.lineWidth = 1;
        const brickW = size / 8;
        const brickH = size / 16;
        for (let row = 0; row < wallH / brickH; row++) {
            const shift = (row % 2) * (brickW / 2);
            for (let col = -1; col < wallW / brickW; col++) {
                const bx = wallX + col * brickW + shift;
                const by = wallY + row * brickH;
                if (bx >= wallX && bx + brickW <= wallX + wallW) {
                    ctx.strokeRect(bx, by, brickW, brickH);
                }
            }
        }
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(wallX, wallY, wallW, wallH);

        // 2. ROOF (Tiled appearance)
        ctx.fillStyle = roofColor;
        ctx.beginPath();
        ctx.moveTo(0, wallY + 5);
        ctx.lineTo(size / 2, 0);
        ctx.lineTo(size, wallY + 5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 3. DOOR (Still fits the logical tile entry)
        const doorW = tileSize * 0.6;
        const doorH = tileSize * 0.8;
        const doorX = (size - doorW) / 2;
        const doorY = size - doorH;
        
        ctx.fillStyle = doorColor;
        ctx.fillRect(doorX, doorY, doorW, doorH);
        ctx.strokeRect(doorX, doorY, doorW, doorH);
        
        // Door knob
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(doorX + doorW * 0.8, doorY + doorH * 0.5, 3, 0, Math.PI * 2);
        ctx.fill();

        // 4. WINDOWS
        this.drawWindow(ctx, wallX + 15, wallY + 20, size * 0.15, windowColor);
        this.drawWindow(ctx, wallX + wallW - 15 - size * 0.15, wallY + 20, size * 0.15, windowColor);

        ctx.restore();
    }

    static drawWindow(ctx, x, y, size, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, size, size);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, size, size);
        // Window Cross
        ctx.beginPath();
        ctx.moveTo(x + size/2, y); ctx.lineTo(x + size/2, y + size);
        ctx.moveTo(x, y + size/2); ctx.lineTo(x + size, y + size/2);
        ctx.stroke();
    }

    /**
     * Draw the interior of a holy place.
     */
    static drawInterior(ctx, w, h, ts) {
        // Floor (Wood Planks)
        ctx.fillStyle = '#8d6e63';
        ctx.fillRect(0, 0, w, h);
        
        ctx.strokeStyle = '#5d4037';
        ctx.lineWidth = 1;
        for (let i = 0; i < h; i += ts / 3) {
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke();
        }

        // Walls (Thick stone)
        ctx.fillStyle = '#efebe9';
        ctx.fillRect(0, 0, w, ts); // Top
        ctx.fillRect(0, h - ts/4, w, ts/4); // Bottom
        ctx.fillRect(0, 0, ts, h); // Left
        ctx.fillRect(w - ts, 0, ts, h); // Right
    }
}
