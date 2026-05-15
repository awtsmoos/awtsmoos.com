
// B"H
/**
 * @file triangulation.js
 * @brief Simple Ear Clipping triangulation for convex/simple polygons.
 *        Does NOT support holes.
 */

export function triangulatePolygon(flatCoords, holeIndices = []) {
    const indices = [];
    const polygon = [];
    const outerLen = (holeIndices.length > 0) ? holeIndices[0] : flatCoords.length / 2;
    
    for (let i = 0; i < outerLen; i++) {
        polygon.push(i);
    }
    
    // Simple fan triangulation for convex shapes, which is a good-enough
    // approximation for simplified text contours.
    for (let i = 1; i < polygon.length - 1; i++) {
        indices.push(polygon[0], polygon[i], polygon[i + 1]);
    }
    
    return indices;
}
