
// B"H
/**
 * @file uvSphere.js
 * @brief Creates a UV Sphere grid mesh. 
 *        Latitude: Rings (Parallel to XZ plane). 
 *        Longitude: Segments (Running pole to pole).
 */
import { Vec3 } from '../../math/vec3.js';

export function createUvSphereMesh(params) {
    const radius = params.radius || 1.0;
    const rings = Math.floor(params.rings) || 24; // Latitude
    const segments = Math.floor(params.segments) || 32; // Longitude
    const color = params.color || [1, 1, 1, 1];

    const vertices = [];
    // Generate Vertex Grid
    for (let r = 0; r <= rings; r++) {
        const phi = (r / rings) * Math.PI; // 0 to PI
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);

        for (let s = 0; s <= segments; s++) {
            const theta = (s / segments) * Math.PI * 2; // 0 to 2PI
            const px = radius * sinPhi * Math.sin(theta);
            const py = radius * cosPhi; // Y is vertical (top to bottom)
            const pz = radius * sinPhi * Math.cos(theta);

            vertices.push({
                pos: [px, py, pz],
                col: [...color],
                norm: [px / radius, py / radius, pz / radius],
                uv: [s / segments, r / rings],
                ringIdx: r,
                segIdx: s
            });
        }
    }

    const faces = [];
    const stride = segments + 1;
    for (let r = 0; r < rings; r++) {
        for (let s = 0; s < segments; s++) {
            const i0 = r * stride + s;
            const i1 = (r + 1) * stride + s;
            const i2 = (r + 1) * stride + (s + 1);
            const i3 = r * stride + (s + 1);

            // Quad CCW: i0 -> i1 -> i2 -> i3
            // In UV sphere, top/bottom are tris, but quads are safer for indexing.
            faces.push({ vertices: [vertices[i0], vertices[i1], vertices[i2], vertices[i3]] });
        }
    }

    return { faces, rings, segments, vertexGrid: vertices };
}
