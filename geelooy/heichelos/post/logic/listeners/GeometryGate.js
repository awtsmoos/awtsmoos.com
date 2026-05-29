// B"H
/**
 * @module GeometryGate
 * @description
 * Chapter 4: The Awtsmoos lets geometry wait for the browser's spare breath.
 * This gate prevents frantic layout checks from becoming thunder under glass.
 */

import { performGeometricCheck } from "../visuals/observer.js";

let geometryRaf = 0;

/**
 * Schedules one geometric inspection after the current visual breath.
 * @returns {void}
 */
export function scheduleGeometryCheck() {
    if (geometryRaf) return;
    const run = () => {
        geometryRaf = 0;
        if (typeof requestIdleCallback === "function") requestIdleCallback(() => performGeometricCheck(), { timeout: 180 });
        else performGeometricCheck();
    };
    if (typeof requestAnimationFrame === "function") geometryRaf = requestAnimationFrame(run);
    else setTimeout(run, 0);
}
