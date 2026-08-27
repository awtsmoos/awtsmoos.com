
// B"H
/**
 * @file materialRegistry.js
 * @brief The Warehouse of Divine Garments.
 */
import { SkinMaterial } from '../../materials/skinMaterial.js';
import { HairMaterial } from '../../materials/hairMaterial.js';
import { LeafMaterial } from '../../materials/leafMaterial.js'; 
import { LambertMaterial } from '../../materials/lambert/index.js'; 
import { WireframeMaterial } from '../../materials/wireframe/index.js'; 
import { GrassMaterial } from '../../materials/grassMaterial.js';
import { WaterMaterial } from '../../materials/waterMaterial.js';
import { ReflectiveMaterial } from '../../materials/reflective/index.js'; // B"H - CORRECTED PATH
import { SkinnedMaterial } from '../../materials/skinnedMaterial.js';
import { OceanMaterial } from '../../materials/ocean/index.js';

export class MaterialRegistry {
    constructor(gl) {
        this.gl = gl;
        this.instances = new Map();
        
        this.definitions = {
            'skin': { Class: SkinMaterial, programKey: 'skinProgramInfo' },
            'hair': { Class: HairMaterial, programKey: 'hairProgramInfo' },
            'leaf': { Class: LeafMaterial, programKey: 'leafProgramInfo' },
            'lambert': { Class: LambertMaterial, programKey: 'lambertProgramInfo' },
            'wireframe': { Class: WireframeMaterial, programKey: 'wireframeProgramInfo' },
            'grass': { Class: GrassMaterial, programKey: 'grassProgramInfo' },
            'water': { Class: WaterMaterial, programKey: 'waterProgramInfo' },
            'reflective': { Class: ReflectiveMaterial, programKey: 'reflectiveProgramInfo' },
            'skinned': { Class: SkinnedMaterial, programKey: 'skinnedProgramInfo' },
            'ocean': { Class: OceanMaterial, programKey: 'oceanProgramInfo' }
        };
    }

    /**
     * B"H - Returns the singleton instance of a material class.
     */
    get(type, programManager) {
        if (this.instances.has(type)) {
            return this.instances.get(type);
        }

        const def = this.definitions[type];
        if (!def) {
            console.warn(`B"H - MaterialRegistry: Unknown type '${type}'. Fallback to lambert.`);
            return this.get('lambert', programManager);
        }

        const programInfo = programManager[def.programKey];
        if (!programInfo) {
            console.error(`B"H - MaterialRegistry: Program '${def.programKey}' not found for type '${type}'.`);
            return null;
        }

        const instance = new def.Class(this.gl);
        instance.setProgram(programInfo);
        
        this.instances.set(type, instance);
        return instance;
    }
}
