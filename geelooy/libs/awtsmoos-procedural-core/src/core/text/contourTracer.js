
// B"H
/**
 * @file contourTracer.js
 * @brief Moore-Neighbor tracing. Now detects both Outer (Matter) and Inner (Hole) contours.
 */

const DIRECTIONS = [
    [0, -1], [1, -1], [1, 0], [1, 1], // N, NE, E, SE
    [0, 1], [-1, 1], [-1, 0], [-1, -1] // S, SW, W, NW
];

function isSolid(data, width, height, x, y) {
    if (x < 0 || y < 0 || x >= width || y >= height) return false;
    const idx = (y * width + x) * 4;
    return data[idx] > 128; // White text
}

export function traceContours(bitmap) {
    const { data, width, height } = bitmap;
    const visited = new Set(); 
    const contours = [];

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const solid = isSolid(data, width, height, x, y);
            const leftSolid = isSolid(data, width, height, x - 1, y);
            
            // 1. Outer Boundary Start (Empty -> Solid)
            // We are on a solid pixel, left is empty.
            if (solid && !leftSolid) {
                const key = `${x},${y}:OUTER`;
                if (!visited.has(key)) {
                    // Trace Outer: Enter from West (6), Search starts NW (7)
                    const points = traceIsland(data, width, height, x, y, 7, visited, "OUTER");
                    if (points.length > 3) contours.push({ points, isHole: false });
                }
            }
            
            // 2. Inner Boundary Start (Solid -> Empty)
            // We are on an empty pixel (hole), left is solid.
            // This finds the "Right" edge of the hole, which is a boundary.
            // We start tracing from the Solid pixel to the Left.
            else if (!solid && leftSolid) {
                // The actual boundary pixel is (x-1, y)
                const bx = x - 1;
                const by = y;
                const key = `${bx},${by}:INNER`;
                
                // If we haven't traced this hole edge yet
                if (!visited.has(key)) {
                    // Trace Inner: Enter from East (2), Search starts SE (3)
                    const points = traceIsland(data, width, height, bx, by, 3, visited, "INNER");
                    if (points.length > 3) contours.push({ points, isHole: true });
                }
            }
        }
    }
    return contours;
}

function traceIsland(data, width, height, startX, startY, initialCheckDir, visited, type) {
    const contour = [];
    let x = startX;
    let y = startY;
    
    // Mark start
    visited.add(`${x},${y}:${type}`);
    contour.push([x, y]);

    let checkDirIndex = initialCheckDir; 
    let loops = 0;
    const maxLoops = width * height; 

    while (loops < maxLoops) {
        let foundNext = false;
        
        // Scan 8 neighbors clockwise
        for (let i = 0; i < 8; i++) {
            const dirIdx = (checkDirIndex + i) % 8;
            const dir = DIRECTIONS[dirIdx];
            const nx = x + dir[0];
            const ny = y + dir[1];
            
            if (isSolid(data, width, height, nx, ny)) {
                x = nx;
                y = ny;
                contour.push([x, y]);
                visited.add(`${x},${y}:${type}`);
                
                // Backtrack logic for Moore Neighbor
                // Enter from opposite of dirIdx.
                // New search starts "Left" (CCW) of where we came from? 
                // Standard: (dirIdx + 4 + 2) % 8 = (dirIdx + 6) % 8?
                // Or simply: (dirIdx + 4 + 1) % 8?
                // Let's use (dirIdx + 4 + 2) % 8 for CCW scan? No, we scan CW.
                // We back up to the "Black" pixel we just passed.
                // The standard heuristic is (dirIdx + 4 + 2) % 8 if we want 8-connected
                checkDirIndex = (dirIdx + 4 + 1) % 8; 
                
                foundNext = true;
                break;
            }
        }
        
        if (!foundNext) break;
        if (x === startX && y === startY) break;
        loops++;
    }
    
    return contour;
}
