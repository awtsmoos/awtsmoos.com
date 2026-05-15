
// B"H
/**
 * @file pickingSystem.js
 * @brief Logic for identifying and selecting objects within the 3D void.
 * 
 * THE PSALM OF THE DISCERNING EYE (Revised):
 * The Ray of Will searches the Book of Life!
 * It does not only look at those who dance and move,
 * But also those who stand still in their divine groove.
 * We fetch the position from the heart of the vessel,
 * So that the intent and the matter may wrestle!
 */

import { Vec3 } from '../../math/vec3.js';

export class PickingSystem {
    /**
     * B"H - Ray-Sphere intersection logic.
     */
    static raycastSphere(ray, center, radius) {
        const oc = Vec3.sub(ray.origin, center);
        const b = 2.0 * Vec3.dot(oc, ray.direction);
        const c = Vec3.dot(oc, oc) - radius * radius;
        const discriminant = b * b - 4.0 * c; 

        if (discriminant > 0) {
            const t = (-b - Math.sqrt(discriminant)) / 2.0;
            if (t > 0) return t;
            const t2 = (-b + Math.sqrt(discriminant)) / 2.0;
            if (t2 > 0) return 0.001; 
        }
        return Infinity;
    }

    /**
     * B"H - Identifies the closest interactable object under the ray.
     */
    static pickObject(ray, objectMap, renderer) {
        let closestDist = Infinity;
        let selected = null;

        console.log(`B"H - PickingSystem: Investigating ${objectMap.size} potential vessels...`);

        objectMap.forEach(obj => {
            if (!obj.selectable && !obj.draggable) return;
            if (obj.visible === false) return;

            // B"H - THE TIKKUN: Get the REAL current world position!
            let pos = [0,0,0];
            const am = renderer.animationManager;
            
            // If the object has animations registered, use the interpolated position
            if (am && am.objectAnimations[obj.id] && am.objectAnimations[obj.id].length > 0) {
                const currentTime = (performance.now() - renderer.startTime) / 1000;
                const mat = am.getInterpolatedTransform(obj.id, currentTime);
                pos = [mat[12], mat[13], mat[14]];
            } 
            // Otherwise, fetch directly from the static keyframe placement
            else if (obj.keyframes && obj.keyframes[0]) {
                pos = [...obj.keyframes[0].position];
            }

            // Diagnostic: Testify to the object's presence
            console.log(`      -> Vessel [${obj.id}] stands at [${pos.map(v=>v.toFixed(2)).join(',')}]`);
            
            let r = 1.0;
            if (obj.parameters) {
                r = (obj.parameters.radius || (obj.parameters.size ? obj.parameters.size * 0.8 : 1.0)) * 1.5;
            }

            const t = this.raycastSphere(ray, pos, r);
            
            if (t < closestDist) {
                closestDist = t;
                selected = obj;
            }
        });

        if (selected) {
            console.log(`B"H - PickingSystem: SUCCESS! Hit [${selected.id}] at dist ${closestDist.toFixed(3)}.`);
        } else {
            console.log(`B"H - PickingSystem: The Ray vanished into the empty void.`);
        }

        return selected;
    }
}
