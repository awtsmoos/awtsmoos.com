
/**
 * B"H
 * @module BrickGenerator
 * @description
 * Forges the pattern of Bricks (Levainim) required to build a dwelling place in the lower realms.
 * Highly detailed canvas drawing simulating mortar and baked clay.
 */
import CanvasHelper from "../CanvasHelper.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default class BrickGenerator {
    static generate(width = 512, height = 512) {
        const canvas = CanvasHelper.create(width, height);
        const ctx = canvas.getContext('2d');
        
        // Mortar base (Light Grey)
        ctx.fillStyle = '#cccccc';
        ctx.fillRect(0, 0, width, height);

        const rows = 16;
        const brickH = height / rows;
        const brickW = width / 4;
        const mortarGap = 8;

        for (let row = 0; row < rows; row++) {
            const y = row * brickH;
            const offset = (row % 2 === 0) ? 0 : brickW / 2;

            // Go slightly out of bounds to allow looping without seams
            for (let col = -2; col <= 5; col++) {
                const x = col * brickW + offset;
                
                // Rich clay red variation for each individual brick
                const r = 160 + Math.random() * 40;
                const g = 60 + Math.random() * 20;
                const b = 40 + Math.random() * 20;
                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`; 
                
                ctx.fillRect(
                    x + mortarGap / 2, 
                    y + mortarGap / 2, 
                    brickW - mortarGap, 
                    brickH - mortarGap
                );

                // Add slight internal grit to the brick
                ctx.fillStyle = 'rgba(0,0,0,0.15)';
                for(let i=0; i<20; i++) {
                    ctx.fillRect(
                        x + mortarGap/2 + Math.random() * (brickW - mortarGap),
                        y + mortarGap/2 + Math.random() * (brickH - mortarGap),
                        3, 3
                    );
                }
            }
        }

        return canvas;
    }
}
