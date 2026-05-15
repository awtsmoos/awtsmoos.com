// B"H
/**
 * @file field.js
 * @brief Mathematical energy field logic for Marching Cubes, optimized with correct grid layout.
 */

export function updateScalarField(gridValues, metaballs, res, size, center = [0, 0, 0]) {
    const halfSize = size / 2.0;
    const cellSize = size / (res - 1);
    gridValues.fill(0.0);

    const YM = res;
    const ZM = res * res;

    for (let b = 0; b < metaballs.length; b++) {
        const ball = metaballs[b];
        const r = ball.radius * 6.0; // B"H - Balanced for substance and splitting
        const r2 = r * r;

        const xMin = Math.max(0, Math.floor((ball.pos[0] - center[0] - r + halfSize) / cellSize));
        const xMax = Math.min(res - 1, Math.ceil((ball.pos[0] - center[0] + r + halfSize) / cellSize));
        const yMin = Math.max(0, Math.floor((ball.pos[1] - center[1] - r + halfSize) / cellSize));
        const yMax = Math.min(res - 1, Math.ceil((ball.pos[1] - center[1] + r + halfSize) / cellSize));
        const zMin = Math.max(0, Math.floor((ball.pos[2] - center[2] - r + halfSize) / cellSize));
        const zMax = Math.min(res - 1, Math.ceil((ball.pos[2] - center[2] + r + halfSize) / cellSize));

        for (let z = zMin; z <= zMax; z++) {
            const zOff = z * ZM;
            const pz = z * cellSize - halfSize + center[2];
            const dz = pz - ball.pos[2];
            const dz2 = dz * dz;
            for (let y = yMin; y <= yMax; y++) {
                const yOff = y * YM;
                const py = y * cellSize - halfSize + center[1];
                const dy = py - ball.pos[1];
                const dy2 = dy * dy;
                for (let x = xMin; x <= xMax; x++) {
                    const dx = x * cellSize - halfSize + center[0] - ball.pos[0];
                    const d2 = dx * dx + dy2 + dz2;
                    
                    if (d2 < r2) {
                        const t = 1.0 - d2 / r2;
                        gridValues[x + yOff + zOff] += t * t * t; 
                    }
                }
            }
        }
    }
}

export function getAnalyticalNormal(p, metaballs) {
    let nx = 0, ny = 0, nz = 0;
    for (let i = 0; i < metaballs.length; i++) {
        const b = metaballs[i];
        const r = b.radius * 6.0; // B"H - Balanced for substance and splitting
        const r2 = r * r;
        const dx = p[0] - b.pos[0];
        const dy = p[1] - b.pos[1];
        const dz = p[2] - b.pos[2];
        const d2 = dx * dx + dy * dy + dz * dz;
        
        if (d2 < r2 && d2 > 1e-8) {
            const t = 1.0 - d2 / r2;
            // B"H - Corrected sign. Gradient requires a negative factor.
            const factor = (-6.0 / r2) * t * t; 
            nx += dx * factor;
            ny += dy * factor;
            nz += dz * factor;
        }
    }
    const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
    // B"H - Return negated gradient for outward-facing normal
    return len > 1e-6 ? [-nx / len, -ny / len, -nz / len] : [0, 1, 0];
}