
//B"H
/**
 * ProceduralGenerators - The Chochmah of form.
 * Now routing through the newly expanded ModifierPipeline!
 */
import ModifierPipeline from "./modifiers/ModifierPipeline.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default class ProceduralGenerators {
    static applyModifiers(baseGeometry, modifiers) {
        if (!modifiers || modifiers.length === 0) return { geometry: baseGeometry };
        
        // B"H: The old static generator logic has ascended. 
        // We now delegate entirely to the dedicated, modular ModifierPipeline.
        const resultingGeometry = ModifierPipeline.apply(baseGeometry, modifiers);
        
        return { geometry: resultingGeometry };
    }
}
