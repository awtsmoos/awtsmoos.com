
import { StateRegister } from '../../binah/StateRegister.js';
import { PortalValidator } from '../PortalValidator.js';
import { EncounterValidator } from '../EncounterValidator.js';
import { ParticlePhysics } from '../../graphics/render/fx/ParticlePhysics.js';
import { WorldMapAssembler } from '../../data/WorldMapAssembler.js';

/**
 * B"H
 * @class MovementLogic
 * @chapter The Kinetic Breath
 * @description
 * Processes the progression of the physical body.
 * Now expanded to reveal the Divine Speech through particle physics upon stepping.
 */
export class MovementLogic {
    static processKineticShift() {
        const HR = StateRegister.HeroPos;
        const baseSpeed = 4; 
        const speed = baseSpeed * (StateRegister.GameSpeedMultiplier || 1);
        const RES = StateRegister.Resolution || 64;

        if (HR.dir === 'u') HR.dy -= speed; 
        if (HR.dir === 'd') HR.dy += speed;
        if (HR.dir === 'l') HR.dx -= speed; 
        if (HR.dir === 'r') HR.dx += speed;
        
        HR.stepTick += speed;

        // Particle Trigger at the height of the step (mid-way)
        if (Math.abs(HR.stepTick - (RES / 2)) < speed) {
            this._triggerStepParticles(HR.dx, HR.dy, RES);
        }
        
        if (HR.dx % RES === 0 && HR.dy % RES === 0) {
            HR.moving = false;
            HR.stepTick = 0;
            HR.cx = Math.round(HR.dx / RES);
            HR.cy = Math.round(HR.dy / RES);
            
            // 1. Check for Unique Portals (Doors AND Sector Edges)
            if (PortalValidator.check()) {
                StateRegister.HeroPath =[];
                StateRegister.PathTarget = null;
                return true; 
            }

            // 2. Check for wild Klipot
            EncounterValidator.check();
            return true;
        }
        return false;
    }

    static _triggerStepParticles(dx, dy, RES) {
        // Find what terrain type we are walking on
        const cx = Math.round(dx / RES);
        const cy = Math.round(dy / RES);
        const tile = WorldMapAssembler.WorldRegistry.find(t => t.x === cx && t.y === cy);
        
        let terrain = 'GRASS';
        if (tile) {
            if (tile.char === '.') terrain = 'SAND';
            else if (tile.char === '*') terrain = 'SNOW';
            else if (tile.char === '✧') terrain = 'LIGHT';
        } else {
            // Default based on sector if walking on abyss edge
            const mapId = StateRegister.CurrentMapId;
            if (mapId.includes('YudDalet')) terrain = 'SNOW';
            else if (mapId.includes('Gimmel')) terrain = 'SAND';
        }

        // Spawn absolute world particles at the feet
        ParticlePhysics.spawnStepDust(dx + (RES/2), dy + RES, terrain);
    }
}
