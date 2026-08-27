
// B"H
/**
 * @file torus.js
 * @brief Manifests the sacred ring, the Torus.
 * 
 * THE TIKKUN OF THE INSIDE-OUT VESSEL:
 * The torus was born with its skin facing the void,
 * Causing the light of the sun to be utterly destroyed!
 * We reach into the generative loop and flip the winding,
 * So the normals point outward, the reality binding.
 */

export function createTorusMesh(params) {
    const radius = params.radius || 0.5;
    const tube = params.tube || 0.2;
    const radialSegments = Math.floor(params.radialSegments) || 16;
    const tubularSegments = Math.floor(params.tubularSegments) || 32;
    const color = params.color || [1, 1, 1, 1];
    const smooth = params.smooth || false;
    
    const faces = [];

    for (let j = 0; j < radialSegments; j++) {
        for (let i = 0; i < tubularSegments; i++) {
            const u1 = i / tubularSegments * Math.PI * 2;
            const u2 = (i + 1) / tubularSegments * Math.PI * 2;
            const v1 = j / radialSegments * Math.PI * 2;
            const v2 = (j + 1) / radialSegments * Math.PI * 2;

            const genVert = (u, v) => {
                const centerX = radius * Math.cos(u);
                const centerZ = radius * Math.sin(u);
                const px = (radius + tube * Math.cos(v)) * Math.cos(u);
                const pz = (radius + tube * Math.cos(v)) * Math.sin(u);
                const py = tube * Math.sin(v);
                const vert = { pos: [px, py, pz], col: color };
                if (smooth) {
                    const nx = px - centerX;
                    const nz = pz - centerZ;
                    const ny = py - 0;
                    const len = Math.sqrt(nx*nx + ny*ny + nz*nz);
                    vert.norm = [nx/len, ny/len, nz/len];
                }
                return vert;
            };

            const bl = genVert(u1, v1);
            const br = genVert(u2, v1);
            const tr = genVert(u2, v2);
            const tl = genVert(u1, v2);

            // B"H - Correct Counter-Clockwise Winding to face normals OUTWARD
            // The order bl -> tl -> tr -> br seals the volume perfectly.
            faces.push({ vertices: [bl, tl, tr, br] });
        }
    }
    return { faces };
}
