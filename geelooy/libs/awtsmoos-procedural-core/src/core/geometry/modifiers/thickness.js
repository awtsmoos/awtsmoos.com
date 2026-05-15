// B"H
import { Vec3 } from '../../math/vec3.js';

/**
 * @brief Adds thickness to a mesh by extruding it along vertex normals.
 *        Creates a solid volume with Front, Back, and Side faces.
 * @param {object} mesh - Input mesh.
 * @param {number} amount - Thickness amount.
 */
export function addThicknessModifier(mesh, amount) {
    if (!amount || amount === 0) return mesh;
    
    // Ensure we have faces to process
    if (!mesh.faces || mesh.faces.length === 0) return mesh;

    // 1. Flatten vertices to identify unique positions and compute smooth normals
    // This is necessary because `mesh.faces` might share vertex objects or have distinct objects for same pos.
    // For a generic approach, we'll traverse faces.
    
    // Deep copy original faces to serve as "Front" (or "Inner" depending on normal direction)
    // We assume input normals point OUT.
    // So:
    // Layer 1: Original Position (Inner surface if extruding out, or Outer if extruding in)
    // Let's assume we extrude along Normal. So Original is Bottom, New is Top.
    // Bottom faces need to be flipped (Normal points down).
    // Top faces keep winding (Normal points up).
    
    // Wait, usually existing mesh is "Front". We want to extrude "Back".
    // Let's extrude in direction of -Normal to create thickness "behind" the surface.
    
    const extrusionDir = -1.0; 
    const thickness = amount * extrusionDir;

    const newFaces = [];
    const allEdges = {}; // key: "v1_v2" -> count

    // Helper to get vertex ID (naive position based hashing for welding)
    const getVid = (v) => {
        const x = Math.round(v.pos[0] * 1000);
        const y = Math.round(v.pos[1] * 1000);
        const z = Math.round(v.pos[2] * 1000);
        return `${x}_${y}_${z}`;
    };

    // We need a map of Original Vertex -> Extruded Vertex
    // Since faces might share vertex *instances* or just positions, we map by ID.
    const extrudedVertsMap = {}; 

    // Pass 1: Collect unique vertices and create extruded counterparts
    mesh.faces.forEach(face => {
        face.vertices.forEach(v => {
            const vid = getVid(v);
            if (!extrudedVertsMap[vid]) {
                // Create extruded vertex
                // Use vertex normal if available, else standard up
                const n = v.norm ? [...v.norm] : [0, 1, 0]; 
                const newPos = Vec3.add(v.pos, Vec3.scale(n, thickness));
                
                extrudedVertsMap[vid] = {
                    pos: newPos,
                    col: v.col ? [...v.col] : [1,1,1,1],
                    norm: n // Will be flipped for back face later? Or recalculated.
                };
            }
        });
    });

    // Pass 2: Build Geometry
    // A. Front Faces (Original) - Keep as is.
    // B. Back Faces (Extruded) - Flip winding.
    // C. Side Faces (Along boundary edges).

    mesh.faces.forEach(face => {
        // A. Keep Original (Front)
        // Deep copy to be safe
        const frontVerts = face.vertices.map(v => ({...v, pos: [...v.pos], col: [...v.col]}));
        newFaces.push({ vertices: frontVerts });

        // B. Create Back (Extruded) - Flip Winding
        const backVerts = [];
        // Walk backwards
        for (let i = face.vertices.length - 1; i >= 0; i--) {
            const v = face.vertices[i];
            const vid = getVid(v);
            const extV = extrudedVertsMap[vid];
            // Back face normal should point opposite to original
            const backN = extV.norm.map(c => -c);
            backVerts.push({ pos: [...extV.pos], col: extV.col, norm: backN });
        }
        newFaces.push({ vertices: backVerts });

        // C. Track Edges for Sides
        for (let i = 0; i < face.vertices.length; i++) {
            const v1 = face.vertices[i];
            const v2 = face.vertices[(i + 1) % face.vertices.length];
            const vid1 = getVid(v1);
            const vid2 = getVid(v2);
            
            // Edge Key (Sort IDs to identify shared edges regardless of direction)
            const key = vid1 < vid2 ? `${vid1}|${vid2}` : `${vid2}|${vid1}`;
            
            if (!allEdges[key]) allEdges[key] = { count: 0, v1, v2, vid1, vid2 };
            allEdges[key].count++;
        }
    });

    // D. Create Side Faces for Boundary Edges (count === 1)
    Object.values(allEdges).forEach(edge => {
        if (edge.count === 1) {
            // This is a boundary edge. Extrude a quad.
            // We need to determine winding. 
            // The edge was traversed v1 -> v2 in the Front Face.
            // So the Quad should be v1 -> v2 -> v2_ext -> v1_ext to face Outwards?
            // Let's check:
            // Front: v1 -> v2
            // Side: v2 -> v2_ext (down) -> v1_ext (left) -> v1 (up) ??
            // Normal = Cross(v2-v1, v1_ext-v1).
            // v2-v1 is along edge. v1_ext-v1 is along -Normal.
            // This usually points OUT from the volume.
            
            const v1 = edge.v1;
            const v2 = edge.v2;
            const v1ext = extrudedVertsMap[edge.vid1];
            const v2ext = extrudedVertsMap[edge.vid2];

            // Calculate side normal
            const dir = Vec3.sub(v2.pos, v1.pos);
            const extDir = Vec3.sub(v1ext.pos, v1.pos); // Thickness direction
            let sideNormal = Vec3.normalize(Vec3.cross(dir, extDir));
            // Check if thickness was negative (it was). 
            // If thickness is negative (into screen), extDir is -N.
            // Cross(Edge, -N) points to the Right of Edge. Which is Outwards for a CCW loop. Correct.

            // Quad: v1 -> v2 -> v2_ext -> v1_ext
            newFaces.push({
                vertices: [
                    { pos: [...v1.pos], col: v1.col, norm: sideNormal },
                    { pos: [...v2.pos], col: v2.col, norm: sideNormal },
                    { pos: [...v2ext.pos], col: v2ext.col, norm: sideNormal },
                    { pos: [...v1ext.pos], col: v1ext.col, norm: sideNormal }
                ]
            });
        }
    });

    return { faces: newFaces, drawMode: mesh.drawMode };
}