
// B"H
/**
 * @file csgSubtract.js
 * @chapter THE CLEAVING OF THE CLAY
 * 
 * THE HYMN OF THE CARVED VESSEL:
 * The Master strikes the rock, and the void appears,
 * A space for the breath, a space for the tears!
 * We take the mirror of the form, and subtract the light,
 * Leaving behind the emptiness of the holy night.
 * The topology is healed, the fractures made whole,
 * Revealing the underlying structure of the Golem's soul!
 * 
 * @module CSGSubtract
 */

import { CSG } from '../../csg/index.js';
import { healTopologyModifier } from '../heal.js';
import { cloneMesh } from './cloneMesh.js';
import { executeCondition } from '../../../logic/pureConditionals.js';

const _executeSafeCut = (workMesh, cutterMesh, insideTag, targetMesh) => {
    try {
        const csgA = CSG.fromMesh(workMesh);
        const csgB = CSG.fromMesh(cutterMesh);
        const resultCSG = csgA.subtract(csgB, insideTag);
        const resultMesh = resultCSG.toMesh();
        
        return executeCondition(resultMesh.faces && resultMesh.faces.length > 0, 
            () => healTopologyModifier(resultMesh, { tolerance: 0.0001 }),
            () => targetMesh
        );
    } catch (e) {
        console.error('B"H - The Boolean Blade shattered:', e);
        return targetMesh;
    }
};

/**
 * @brief Subtracts the cutter from the target, preserving the original mesh on failure.
 */
export const performSafeCSGSubtract = (targetMesh, cutterMesh, insideTag = null) => {
    const isValid = targetMesh && targetMesh.faces && targetMesh.faces.length > 0 && cutterMesh;
    
    return executeCondition(isValid, () => {
        const workMesh = cloneMesh(targetMesh);
        return executeCondition(workMesh, 
            () => _executeSafeCut(workMesh, cutterMesh, insideTag, targetMesh), 
            () => targetMesh
        );
    }, () => targetMesh);
};
