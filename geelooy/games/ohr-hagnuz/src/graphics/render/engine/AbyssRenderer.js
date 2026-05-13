
import { StateRegister } from '../../../binah/StateRegister.js';
import { GroundPainter } from '../GroundPainter.js';

/**
 * B"H
 * @class AbyssRenderer
 * @chapter The Infinite Borders
 * @description
 * When the Tzaddik looks beyond the explicitly mapped 25x14 grid, they do not see emptiness.
 * They see the endless repetition of the realm's fundamental element. 
 * The Awtsmoos sustains the infinite just as easily as the finite.
 */
export class AbyssRenderer {
    /**
     * @description Paints the infinite edges of the current world.
     */
    static draw(bgCtx, queue, camX, camY, W, H, RES) {
        const startX = Math.floor(camX / RES);
        const endX = Math.ceil((camX + W) / RES);
        const startY = Math.floor(camY / RES);
        const endY = Math.ceil((camY + H) / RES);

        const mapW = 25; 
        const mapH = 14;
        const map = StateRegister.CurrentMapId;
        
        let abyssTree = 'OAK'; 
        let abyssChar = '1';
        
        // Determine the root element of the current dimension
        if (map.includes('Atzilut')) { abyssTree = 'NONE'; abyssChar = '☼'; }
        else if (map.includes('Beriah')) { abyssTree = 'NONE'; abyssChar = '☰'; }
        else if (map.includes('Yetzirah')) { abyssTree = 'CRYSTAL'; abyssChar = '✧'; }
        else if (map.includes('Tehom')) { abyssTree = 'NONE'; abyssChar = '⬣'; }
        else if (map.includes('Gimmel')) { abyssTree = 'CACTUS'; abyssChar = '.'; }
        else if (map.includes('YudDalet')) { abyssTree = 'SNOW'; abyssChar = '*'; }
        else if (map.includes('YudHey')) { abyssTree = 'OAK'; abyssChar = '^'; }
        else if (map.includes('YudVav')) { abyssTree = 'OAK'; abyssChar = '~'; }

        for (let gy = startY; gy <= endY; gy++) {
            for (let gx = startX; gx <= endX; gx++) {
                // If the coordinate falls outside the physical bounds of the sector...
                if (gx < 0 || gx >= mapW || gy < 0 || gy >= mapH) {
                    const screenX = (gx * RES) - camX;
                    const screenY = (gy * RES) - camY;
                    
                    // Render the ground tile natively into the BG context
                    GroundPainter.draw(bgCtx, screenX, screenY, RES, { x: gx, y: gy, char: abyssChar });
                    
                    // Enqueue the flora/structure for depth sorting (unless it's an impassable fluid or pure light)
                    if (abyssChar !== '~' && abyssChar !== '⬣' && abyssTree !== 'NONE') {
                        queue.push({ 
                            type: 'TREE', 
                            treeType: abyssTree, 
                            x: screenX, 
                            y: screenY, 
                            sortY: screenY + RES 
                        });
                    }
                }
            }
        }
    }
}
