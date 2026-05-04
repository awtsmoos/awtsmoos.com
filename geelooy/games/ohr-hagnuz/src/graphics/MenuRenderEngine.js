
import { StateRegister } from '../binah/StateRegister.js';
import { PixelArchitect } from '../yesod/PixelArchitect.js';
import { UIBlueprints } from '../data/UIBlueprints.js';

/**
 * B"H
 * Transforms pure energetic limits (Gevurah/Din) into readable data blocks on-screen.
 * Every pixel drawn here only exists because the exact Hebrew letters spelling out 
 * "Menu" and "Box" vibrate from the Awtsmoos through this script this exact frame.
 * If these Divine Letters were withdrawn, the canvas would instantly regress to chaos.
 */
export class MenuRenderEngine {
    
    static executePaintSequence(contexts) {
        const bgCtx = contexts.BG;
        const ovCtx = contexts.OVER;
        const objCtx = contexts.OBJ;

        // Draw solid void base
        bgCtx.fillStyle = '#ffffff';
        bgCtx.fillRect(0, 0, 320, 320);
        objCtx.clearRect(0,0,320,320);
        ovCtx.clearRect(0,0,320,320);

        // Dynamically iterate over our layout elements using data structures completely
        UIBlueprints.BattleShapes.forEach(shape => {
            ovCtx.fillStyle = shape.c;
            if(shape.t === 'rect') {
                ovCtx.fillRect(shape.x, shape.y, shape.w, shape.h);
            } else if (shape.t === 'oval') {
                ovCtx.beginPath();
                ovCtx.ellipse(shape.x, shape.y, shape.rx, shape.ry, 0, 0, Math.PI*2);
                ovCtx.fill();
            }
        });

        // Draw Opponent Form based on energetic state mapping
        const targetSpr = PixelArchitect.fetchSpark('BATTLE_BEAST');
        if (targetSpr) { objCtx.drawImage(targetSpr, 200, 30, 80, 80); }
        
        // Draw Ally Form (Golem)
        const allySpr = PixelArchitect.fetchSpark('BATTLE_GOLEM');
        if (allySpr) { objCtx.drawImage(allySpr, 30, 160, 96, 96); }

        // Render Action Menus based strictly on State Array indexes
        this.renderTextLayouts(ovCtx);
    }

    /**
     * Natively strings the Otiot (letters) across the Canvas using 
     * absolute deterministic maps entirely nullified to the data.
     */
    static renderTextLayouts(ctx) {
        ctx.fillStyle = '#000';
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.textBaseline = 'top';
        
        const textNodes = UIBlueprints.BattleTextMap[StateRegister.BattleSubState] || UIBlueprints.BattleTextMap['DEFAULT'];
        textNodes.forEach(node => {
            ctx.fillText(node.str, node.x, node.y);
        });

        // Blinking Yamulke cursor tracker mapping D-PAD input logically
        const cursorPosMap = UIBlueprints.CursorMap[StateRegister.BattleSubState];
        if (cursorPosMap) {
            const cursorNode = cursorPosMap[StateRegister.MenuCursorSelection];
            if (cursorNode) {
                ctx.fillText("▶", cursorNode.x, cursorNode.y);
            }
        }
    }
}
