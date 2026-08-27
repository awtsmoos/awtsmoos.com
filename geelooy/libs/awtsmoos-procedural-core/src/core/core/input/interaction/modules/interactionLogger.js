
// B"H
/**
 * @file interactionLogger.js
 * @brief INSANE VERBOSE RAYCAST LOGGER - EVERY CLICK NOW DUMPS EVERYTHING
 */

export class InteractionLogger {
    static logManifestation(canvas, e, ray, result, camera, renderer = null) {
        let cx = e.clientX, cy = e.clientY;
        if (e.touches && e.touches.length > 0) { 
            cx = e.touches[0].clientX; 
            cy = e.touches[0].clientY; 
        }

        console.log(`\nB"H - 🔥🔥🔥 AWTSMOOS RAYCAST MANIFESTATION LOG - FULL INSANE MODE 🔥🔥🔥`);
        console.log(`  🖱️ SCREEN CLICK: (${cx}, ${cy})`);
        console.log(`  📍 CAMERA ORIGIN: [${ray.origin.map(n=>n.toFixed(4)).join(', ')}]`);
        console.log(`  ➡️ RAY DIRECTION: [${ray.direction.map(n=>n.toFixed(4)).join(', ')}]`);

        if (renderer && renderer.objectMap) {
            console.log(`\n📦 ALL BOUNDING BOXES IN SCENE (${renderer.objectMap.size} objects):`);
            renderer.objectMap.forEach((obj, id) => {
                if (obj.bounds) {
                    const b = obj.bounds;
                    console.log(`  🔲 ${id} → MIN: [${b.min.map(n=>n.toFixed(3)).join(', ')}]  MAX: [${b.max.map(n=>n.toFixed(3)).join(', ')}]`);
                } else {
                    console.log(`  ⚠️ ${id} → NO BOUNDS COMPUTED YET`);
                }
            });
        }

        if (result && result.object) {
            console.log(`\n💥 COLLISION DECREED!`);
            console.log(`  🎯 HIT OBJECT: ${result.object.id}`);
            console.log(`  📏 DISTANCE: ${result.distance.toFixed(4)}`);
            console.log(`  📍 WORLD HIT POINT: [${result.point.map(n=>n.toFixed(4)).join(', ')}]`);
            if (result.logs) console.log(`  📜 INTERNAL LOGS:`, result.logs);
        } else {
            console.log(`\n💨 RAY MISSED EVERYTHING - RETURNED TO INFINITY`);
        }
        console.log(`B"H - END OF INSANE RAYCAST LOG\n`);
    }
}
