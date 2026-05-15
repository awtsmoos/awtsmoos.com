
// B"H
/**
 * @file modifierProcessor.js
 * @brief The Forge of Transformation. Applies the chain of modifiers to a raw mesh.
 * 
 * THE HYMN OF THE FORGE:
 * The primitive is born, a simple sphere or block,
 * But it is not yet the Golem, it is only uncarved rock.
 * The Processor takes the array, the list of divine commands,
 * And passes them to the Evaluator, who acts as the Creator's hands.
 */

import { ModifierContext } from '../../logic/context.js';
import { ModifierEvaluator } from '../../logic/evaluator.js';

export function processModifiers(mesh, modifiers, objectData) {
    if (!modifiers || !Array.isArray(modifiers)) return mesh;
    
    const context = new ModifierContext(objectData);
    const evaluator = new ModifierEvaluator();
    
    // Embed objectData to allow deep semantic queries
    mesh.__objectData = objectData;

    let currentMesh = mesh;
    let stepCount = 0;

    for (const mod of modifiers) {
        stepCount++;
        const modType = mod.type ? mod.type.toUpperCase() : 'UNKNOWN';
        const startFaces = currentMesh.faces ? currentMesh.faces.length : 0;
        
        console.log(`B"H - ⚙️ [${objectData.id}] Step ${stepCount}/${modifiers.length}: Casting [${modType}]`);
        
        // B"H - Execute the spell
        currentMesh = evaluator.evaluate(currentMesh, mod, context);
        
        const endFaces = currentMesh.faces ? currentMesh.faces.length : 0;
        const faceDiff = endFaces - startFaces;
        
        if (faceDiff > 0) {
            console.log(`      -> 📈 Faces increased by ${faceDiff}. Total: ${endFaces}`);
        } else if (faceDiff < 0) {
            console.log(`      -> 📉 Faces decreased by ${Math.abs(faceDiff)}. Total: ${endFaces}`);
        }
    }
    
    if (!objectData.exportedPoints) {
        objectData.exportedPoints = {};
    }
    Object.assign(objectData.exportedPoints, context.exports);
    
    delete currentMesh.__objectData;
    
    return currentMesh;
}
