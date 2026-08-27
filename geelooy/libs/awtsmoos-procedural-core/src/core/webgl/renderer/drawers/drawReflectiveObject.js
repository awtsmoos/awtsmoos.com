
// B"H
/**
 * @file drawReflectiveObject.js
 * @brief Individual ritual for drawing a PBR-lite reflective vessel.
 */
import { mat4_core } from '../../../math/mat4/core.js';

/**
 * B"H - Executes the draw call for reflective objects.
 */
export function drawReflectiveObject(context, obj, reflectiveMaterialInstance) {
    if (!reflectiveMaterialInstance) return;

    // Use the Material's own draw method which encapsulates the bind/draw logic.
    // This maintains the Seder Hishtalshelus (order of unfolding).
    reflectiveMaterialInstance.draw(obj, context);
}
