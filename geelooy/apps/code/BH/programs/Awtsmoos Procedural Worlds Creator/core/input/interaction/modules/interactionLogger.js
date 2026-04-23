
// B"H
/**
 * @file interactionLogger.js
 * @brief The Scribe of the Heavens! Records every dimensional detail of the Raycast.
 */

import { Vec3 } from '../../../math/vec3.js';

export class InteractionLogger {
    static logManifestation(canvas, e, ray, result, camera) {
        let cx = e.clientX, cy = e.clientY;
        if (e.touches && e.touches.length > 0) { 
            cx = e.touches[0].clientX; cy = e.touches[0].clientY; 
        }

        console.log(`\nB"H - 🌌 EXTREME RAYCAST MANIFESTATION LOG 🌌`);
        console.log(`  -> 🖱️ Intent (Click): Screen(X:${cx}, Y:${cy})`);
        console.log(`  -> 🏹 Ray Origin: [${ray.origin.map(n=>n.toFixed(4)).join(', ')}]`);
        console.log(`  -> ➡️ Ray Direction: [${ray.direction.map(n=>n.toFixed(4)).join(', ')}]`);

        if (result && result.object) {
            console.log(`  -> 💥 COLLISION DECREED!`);
            console.log(`  -> 🎯 Vessel Struck: ${result.object.id}`);
            console.log(`  -> 📏 Distance Bridged: ${result.distance.toFixed(4)}`);
            console.log(`  -> 📍 World Coordinate: [${result.point.map(n=>n.toFixed(4)).join(', ')}]`);
        } else {
            console.log(`  -> 💨 The Ray pierced the Void, returning to Infinity.`);
        }
    }
}
