
import { StateRegister } from '../binah/StateRegister.js';
import { WisdomStrings } from '../data/WisdomStrings.js';

/**
 * B"H
 * DialogueEngine: Visual manifestation of sacred communication.
 * Moved to the top coordinates (Y: 20) to ensure clarity against bottom controls.
 */
export class DialogueEngine {
    
    /** 
     * Draws the text frame directly onto the Over canvas.
     * @param {Object} contexts - Canvas contexts map.
     * @param {number} W - Screen Width
     * @param {number} H - Screen Height
     */
    static drawTextFrame(cxs, W, H) {
        const ov = cxs.OVER;
        const boxH = 130;
        const boxW = W - 40;
        const boxX = 20;
        const boxY = 20; // Top Placement

        // Background of the box
        ov.fillStyle = 'rgba(255, 255, 255, 0.98)';
        ov.fillRect(boxX, boxY, boxW, boxH);
        
        // Sacred frame boundaries (Tikun)
        ov.lineWidth = 6; ov.strokeStyle = '#050508';
        ov.strokeRect(boxX, boxY, boxW, boxH);
        
        ov.fillStyle = '#000';
        ov.font = '14px "Press Start 2P", monospace';
        ov.textBaseline = 'top';

        const bId = StateRegister.DialogBankId;
        const dialogueArray = WisdomStrings[bId] || ["..."];
        const lineIdx = StateRegister.DialogLineIdx;
        const currentString = dialogueArray[lineIdx] || "";
        
        let startY = boxY + 25;
        // Automatic wrap logic mapping the infinite to finite pixel lines
        const wrappedLines = currentString.match(/.{1,28}(\s|$)/g) || [currentString]; 
        
        wrappedLines.forEach(line => { 
            ov.fillText(line.trim(), boxX + 25, startY); 
            startY += 24; 
        });

        // Blinking indicator (pulse of existence)
        if (Math.floor(Date.now() / 350) % 2 === 0) {
            ov.fillStyle = '#b00';
            ov.fillText("▼", boxX + boxW - 35, boxY + boxH - 30);
        }
    }
}
