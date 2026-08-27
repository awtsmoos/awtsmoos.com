// B"H
export function createCylinderMesh(params) {
    const radiusTop = params.radiusTop !== undefined ? params.radiusTop : 0.5;
    const radiusBottom = params.radiusBottom !== undefined ? params.radiusBottom : 0.5;
    const height = params.height || 1.0;
    const radialSegments = Math.floor(params.radialSegments) || 16;
    const heightSegments = Math.floor(params.heightSegments) || 1;
    const openEnded = params.openEnded || false;
    const color = params.color || [1, 1, 1, 1];
    const smooth = params.smooth || false;

    const faces = [];
    const halfH = height / 2;

    for (let y = 0; y < heightSegments; y++) {
        const v1 = y / heightSegments;
        const v2 = (y + 1) / heightSegments;
        const r1 = radiusBottom + (radiusTop - radiusBottom) * v1;
        const r2 = radiusBottom + (radiusTop - radiusBottom) * v2;
        
        const y1Pos = -halfH + v1 * height;
        const y2Pos = -halfH + v2 * height;

        for (let x = 0; x < radialSegments; x++) {
            const u1 = x / radialSegments;
            const u2 = (x + 1) / radialSegments;
            const theta1 = u1 * Math.PI * 2;
            const theta2 = u2 * Math.PI * 2;

            const genVert = (theta, yPos, radius) => {
                const px = radius * Math.sin(theta);
                const pz = radius * Math.cos(theta);
                const vert = { pos: [px, yPos, pz], col: color };
                if (smooth) {
                    const len = Math.sqrt(px*px + pz*pz);
                    vert.norm = len > 0 ? [px/len, 0, pz/len] : [0, 1, 0];
                }
                return vert;
            };

            const bl = genVert(theta1, y1Pos, r1);
            const br = genVert(theta2, y1Pos, r1);
            const tr = genVert(theta2, y2Pos, r2);
            const tl = genVert(theta1, y2Pos, r2);
            faces.push({ vertices: [bl, br, tr, tl] });
        }
    }

    if (!openEnded) {
        if (radiusTop > 0) {
            const yPos = halfH;
            for (let x = 0; x < radialSegments; x++) {
                const u1 = x / radialSegments;
                const u2 = (x + 1) / radialSegments;
                const theta1 = u1 * Math.PI * 2;
                const theta2 = u2 * Math.PI * 2;
                const center = { pos: [0, yPos, 0], col: color };
                const v1 = { pos: [radiusTop*Math.sin(theta1), yPos, radiusTop*Math.cos(theta1)], col: color };
                const v2 = { pos: [radiusTop*Math.sin(theta2), yPos, radiusTop*Math.cos(theta2)], col: color };
                if (smooth) { center.norm = [0, 1, 0]; v1.norm = [0, 1, 0]; v2.norm = [0, 1, 0]; }
                faces.push({ vertices: [v1, v2, center] }); 
            }
        }
        if (radiusBottom > 0) {
            const yPos = -halfH;
            for (let x = 0; x < radialSegments; x++) {
                const u1 = x / radialSegments;
                const u2 = (x + 1) / radialSegments;
                const theta1 = u1 * Math.PI * 2;
                const theta2 = u2 * Math.PI * 2;
                const center = { pos: [0, yPos, 0], col: color };
                const v1 = { pos: [radiusBottom*Math.sin(theta1), yPos, radiusBottom*Math.cos(theta1)], col: color };
                const v2 = { pos: [radiusBottom*Math.sin(theta2), yPos, radiusBottom*Math.cos(theta2)], col: color };
                if (smooth) { center.norm = [0, -1, 0]; v1.norm = [0, -1, 0]; v2.norm = [0, -1, 0]; }
                faces.push({ vertices: [center, v2, v1] });
            }
        }
    }
    return { faces };
}