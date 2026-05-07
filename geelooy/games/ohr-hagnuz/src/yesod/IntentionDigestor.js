
import { StateRegistry } from '../binah/StateRegistry.js';
import { WorldMapAssembler } from '../asiyah/WorldMapAssembler.js';

/**
 * B"H
 * @class IntentionDigestor
 * @chapter The Arousal from Below
 * @description
 * The human will (intents) must be filtered through the existing 
 * reality before becoming action. This class checks if a intended 
 * step is physically possible.
 */
export class IntentionDigestor {
    
    /**
     * @description Digests the current input buffer into hero movement.
     */
    static digest() {
        const HR = StateRegistry.HeroPos;
        if (HR.moving) return; // Kinetic energy must be spent first

        const i = window.AwtsmoosIntents;
        let dx = 0, dy = 0, dir = HR.dir;

        if (i.U) { dy = -1; dir = 'u'; }
        else if (i.D) { dy = 1; dir = 'd'; }
        else if (i.L) { dx = -1; dir = 'l'; }
        else if (i.R) { dx = 1; dir = 'r'; }

        if (dx !== 0 || dy !== 0) {
            HR.dir = dir;
            if (this._canOccupy(HR.cx + dx, HR.cy + dy)) {
                HR.moving = true;
                HR.cx += dx;
                HR.cy += dy;
            }
        }
    }

    /**
     * @description Checks if a target grid tile is traversable.
     * @private
     */
    static _canOccupy(tx, ty) {
        const tile = WorldMapAssembler.WorldRegistry.find(t => t.x === tx && t.y === ty);
        
        // If tile doesn't exist (edge of world), we check for portals
        if (!tile) return false;

        // Solid walls and trees block the way
        if (tile.solid) return false;

        return true;
    }
}
