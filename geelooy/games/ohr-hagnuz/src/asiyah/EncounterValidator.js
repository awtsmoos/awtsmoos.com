
import { StateRegister } from '../binah/StateRegister.js';
import { WorldMapAssembler } from '../data/WorldMapAssembler.js';
import { EncounterGenerator } from './logic/EncounterGenerator.js';

/**
 * B"H
 * @file EncounterValidator.js
 * @class EncounterValidator
 * @chapter The Sifting of the Sparks (Birur Nitzotzot)
 * @description
 * Sifts the dust of the earth for sparks of holiness!
 */
export class EncounterValidator {
    static check() {
        const HR = StateRegister.HeroPos;
        const currentTile = WorldMapAssembler.WorldRegistry.find(t => t.x === HR.cx && t.y === HR.cy);
        
        if (currentTile && currentTile.encounter) {
            const divineDecree = Math.random();
            if (divineDecree < 0.10) {
                console.log(`B"H - A holy spark cries out from the Klipot! Encounter Initiated.`);
                EncounterGenerator.manifestWildKlipah();
            }
        }
    }
}
