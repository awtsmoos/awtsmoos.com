// B"H
export function createSphereMesh(params) {
    const radius = params.radius || 0.5;
    const widthSegments = Math.max(3, Math.floor(params.widthSegments) || 16);
    const heightSegments = Math.max(2, Math.floor(params.heightSegments) || 12);
    const color = params.color || [1, 1, 1, 1];
    const smooth = params.smooth || false;

    const faces = [];

    for (let y = 0; y < heightSegments; y++) {
        for (let x = 0; x < widthSegments; x++) {
            const u1 = x / widthSegments;
            const u2 = (x + 1) / widthSegments;
            const v1 = y / heightSegments;
            const v2 = (y + 1) / heightSegments;

            const verts = [];
            // B"H - Vertex order: tl, tr, br, bl
            const steps = [[u1, v1], [u2, v1], [u2, v2], [u1, v2]];

            for (let s = 0; s < 4; s++) {
                const u = steps[s][0];
                const v = steps[s][1];
                const theta = u * Math.PI * 2;
                const phi = v * Math.PI;

                const px = -radius * Math.cos(theta) * Math.sin(phi);
                const py = radius * Math.cos(phi);
                const pz = radius * Math.sin(theta) * Math.sin(phi);

                const vert = { pos: [px, py, pz], col: color };
                if (smooth) {
                    const len = Math.sqrt(px*px + py*py + pz*pz);
                    vert.norm = [px/len, py/len, pz/len];
                }
                verts.push(vert);
            }
            
            // B"H - Corrected Winding Order: From CW (0,1,2,3) to CCW (0,3,2,1)
            // This ensures normals point outwards.
            // tl, bl, br, tr
            faces.push({ vertices: [verts[0], verts[3], verts[2], verts[1]] });
        }
    }
    return { faces };
}