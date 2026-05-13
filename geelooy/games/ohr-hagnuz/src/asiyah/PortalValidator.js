
import { StateRegister } from '../binah/StateRegister.js';
import { PortalLedger } from '../chochmah/PortalLedger.js';
import { DimensionalIndexer } from '../binah/DimensionalIndexer.js';
import { WorldMapAssembler } from '../data/WorldMapAssembler.js';

/**
 * B"H
 * @class PortalValidator
 * @chapter The Folding of Space and the Purity of Soul
 * @description
 * Validates portals. Now explicitly intercepts the Mikvah tiles to perform a
 * purification ritual instead of teleporting.
 */
export class PortalValidator {
    static check() {
        const HR = StateRegister.HeroPos;
        const currentTile = WorldMapAssembler.WorldRegistry.find(t => t.x === HR.cx && t.y === HR.cy);
        
        if (currentTile && currentTile.isPortal) {
            
            // MIKVAH PURIFICATION RITUAL
            if (currentTile.char === '≈') {
                if (StateRegister.Purity.level === 0 || StateRegister.HeroStats.light < StateRegister.HeroStats.maxLight) {
                    console.log("B\"H - The soul immerses in the Mayim Chayim (Living Waters).");
                    StateRegister.HeroStats.light = StateRegister.HeroStats.maxLight;
                    StateRegister.Purity.level = 1;
                    StateRegister.Purity.stepsRemaining = 100; // Purity lasts for 100 steps
                    
                    window.dispatchEvent(new CustomEvent('awtsmoos-battle-log', { detail: "Purified in the Mikvah! Light restored." }));
                }
                return false; // Don't interrupt movement
            }

            // STANDARD SPATIAL FOLDING
            const bond = PortalLedger[currentTile.char];
            if (bond) {
                const destination = DimensionalIndexer.locate(bond.partner);
                if (destination) {
                    console.log(`B"H - Folding space: [${currentTile.char}] -> [${bond.partner}]`);
                    
                    StateRegister.CurrentMapId = destination.mapId;
                    HR.cx = destination.x + (bond.ox || 0);
                    HR.cy = destination.y + (bond.oy || 0);

                    const RES = StateRegister.Resolution;
                    HR.dx = HR.cx * RES;
                    HR.dy = HR.cy * RES;
                    HR.moving = false;
                    HR.stepTick = 0;

                    WorldMapAssembler.rebuild();
                    return true;
                }
            }
        }
        return false;
    }
}
