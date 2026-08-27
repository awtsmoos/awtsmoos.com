
// B"H
/**
 * @file meshUtils.js
 * @brief Translates between CSG Polygons and Structured Mesh Faces.
 *        Infused with Aggressive Quantization and Forced Triangulation to heal the cracks of division.
 */
import { Vector3D } from '../math/vector3.js';
import { Vertex } from '../core/vertex.js';
import { Polygon } from '../core/polygon.js';

export function meshToPolygons(mesh) {
    const polygons =[];
    
    if (mesh.faces) {
        mesh.faces.forEach(face => {
            const mkV = (v) => {
                const vert = new Vertex(new Vector3D(v.pos[0], v.pos[1], v.pos[2]));
                if (v.col) vert.col =[...v.col];
                return vert;
            };

            const v = face.vertices;
            
            if (v.length === 3) {
                const poly = new Polygon([mkV(v[0]), mkV(v[1]), mkV(v[2])]);
                if (face.tags) poly.shared = [...face.tags];
                polygons.push(poly);
            } else if (v.length === 4) {
                const poly1 = new Polygon([mkV(v[0]), mkV(v[1]), mkV(v[2])]);
                const poly2 = new Polygon([mkV(v[0]), mkV(v[2]), mkV(v[3])]);
                if (face.tags) {
                    poly1.shared = [...face.tags];
                    poly2.shared = [...face.tags];
                }
                polygons.push(poly1);
                polygons.push(poly2);
            } else if (v.length > 4) {
                for (let i = 2; i < v.length; i++) {
                    const poly = new Polygon([mkV(v[0]), mkV(v[i-1]), mkV(v[i])]);
                    if (face.tags) poly.shared = [...face.tags];
                    polygons.push(poly);
                }
            }
        });
        return polygons;
    }

    const p = mesh.positions;
    const idx = mesh.indices;
    const c = mesh.colors; 
    if (!p || !idx) return[];
    
    for (let i = 0; i < idx.length; i += 3) {
        const verts =[];
        for (let j = 0; j < 3; j++) {
            const id = idx[i + j];
            const vert = new Vertex(new Vector3D(p[id * 3], p[id * 3 + 1], p[id * 3 + 2]));
            if (c && c.length >= id * 4 + 3) {
                vert.col = [c[id * 4], c[id * 4 + 1], c[id * 4 + 2], c[id * 4 + 3] || 1.0];
            }
            verts.push(vert);
        }
        polygons.push(new Polygon(verts));
    }
    return polygons;
}

export function polygonsToMesh(polygons) {
    const faces =[];
    
    // B"H - AGGRESSIVE QUANTIZATION (1mm precision)
    // This forcibly welds vertices that were split by a hair's breadth during CSG.
    const PRECISION = 1000;
    const quantize = (val) => Math.round(val * PRECISION) / PRECISION;

    polygons.forEach(poly => {
        if (!poly.vertices || poly.vertices.length < 3) return;

        const tags = poly.shared ||[];

        const faceVerts = poly.vertices.map(v => ({
            pos:[quantize(v.pos.x), quantize(v.pos.y), quantize(v.pos.z)],
            col: v.col ? [...v.col] :[1, 1, 1, 1],
            norm:[poly.plane.normal.x, poly.plane.normal.y, poly.plane.normal.z] 
        }));

        // B"H - FORCED TRIANGULATION
        // Quads with T-Junctions will tear during skinning. 
        // By forcing everything into triangles here, the topology remains rigid.
        for (let j = 2; j < faceVerts.length; j++) {
            faces.push({
                vertices: [faceVerts[0], faceVerts[j - 1], faceVerts[j]],
                tags: [...tags]
            });
        }
    });
    
    return { faces };
}
