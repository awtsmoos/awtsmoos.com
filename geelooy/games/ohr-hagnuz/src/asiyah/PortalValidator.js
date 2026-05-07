
import { StateRegistry } from '../binah/StateRegistry.js';
import { PortalLedger } from '../chochmah/PortalLedger.js';
import { DimensionalIndexer } from '../binah/DimensionalIndexer.js';
import { WorldMapAssembler } from './WorldMapAssembler.js';

/**
 * B"H
 * @class PortalValidator
 * @chapter The Folding of Space (Kfitzat HaDerech)
 * @description
 * Portals are not mathematical offsets; they are unique letters. 
 * This class identifies the current letter the soul stands upon and 
 * looks up its unique partner in the entire universe.
 */
export class PortalValidator {
    /**
     * @description Checks the current coordinate for a unique portal character.
     * @returns {boolean} True if a jump occurred.
     */
    static check() {
        const HR = StateRegistry.HeroPos;
        const currentTile = WorldMapAssembler.WorldRegistry.find(t => t.x === HR.cx && t.y === HR.cy);
        
        if (currentTile && currentTile.isPortal) {
            const bond = PortalLedger[currentTile.char];
            if (bond) {
                // Find the globally unique partner ID
                const destination = DimensionalIndexer.locate(bond.partner);
                if (destination) {
                    console.log(`B"H - Folding space: [${currentTile.char}] -> [${bond.partner}]`);
                    
                    // 1. Enter the new sector
                    StateRegistry.CurrentMapId = destination.mapId;

                    // 2. Re-materialize the Tzaddik at the new location (plus offsets)
                    HR.cx = destination.x + (bond.ox || 0);
                    HR.cy = destination.y + (bond.oy || 0);

                    // 3. Sync physical pixels
                    const RES = StateRegistry.Resolution;
                    HR.dx = HR.cx * RES;
                    HR.dy = HR.cy * RES;
                    
                    // 4. Reset kinetic arousal
                    HR.moving = false;
                    HR.stepTick = 0;

                    // 5. Rebuild the local world matrix
                    WorldMapAssembler.rebuild();
                    return true;
                }
            }
        }
        return false;
    }
}
