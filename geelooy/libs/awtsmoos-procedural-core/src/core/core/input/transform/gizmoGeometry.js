
// B"H
/**
 * @file gizmoGeometry.js
 * @brief Generates Blender-style arrow handles for the Transform Gizmo.
 */

import { generateProceduralGeometry } from '../../geometry/geometryGenerator.js';
import { setupObjectBuffers } from '../../webgl/renderer/bufferCreator.js';

export class GizmoGeometry {
    static build(gl) {
        const cyl = { radiusTop: 0.04, radiusBottom: 0.04, height: 2.0, radialSegments: 8 };
        const cone = { radiusTop: 0.0, radiusBottom: 0.15, height: 0.5, radialSegments: 12 };
        
        const buildAxis = (id, axis, color) => {
            const modifiers = [
                { type: 'setFaceColor', color: [...color, 1.0] }
            ];
            
            const rotation = axis === 'x' ? { axis: 'z', angle: -Math.PI/2 } : 
                             axis === 'z' ? { axis: 'x', angle: Math.PI/2 } : null;

            const axisGroup = {
                primitive: 'cylinder',
                parameters: cyl,
                modifiers: rotation ? [{ type: 'rotateMesh', ...rotation }, { type: 'translateMesh', translation: axis === 'x' ? [1,0,0] : axis === 'y' ? [0,1,0] : [0,0,1] }, ...modifiers] : [{ type: 'translateMesh', translation: [0, 1, 0] }, ...modifiers]
            };

            const tip = {
                primitive: 'cylinder', // Cylinder with top 0 is a cone
                parameters: cone,
                modifiers: rotation ? [{ type: 'rotateMesh', ...rotation }, { type: 'translateMesh', translation: axis === 'x' ? [2,0,0] : axis === 'y' ? [0,2,0] : [0,0,2] }, ...modifiers] : [{ type: 'translateMesh', translation: [0, 2, 0] }, ...modifiers]
            };

            const dataCyl = generateProceduralGeometry(axisGroup.primitive, axisGroup.parameters, axisGroup.modifiers);
            const dataTip = generateProceduralGeometry(tip.primitive, tip.parameters, tip.modifiers);
            
            // Return buffers for both parts of the arrow
            return {
                shaft: setupObjectBuffers(gl, dataCyl, `gizmo_${axis}_shaft`),
                head: setupObjectBuffers(gl, dataTip, `gizmo_${axis}_head`),
                counts: { shaft: dataCyl.indices.length, head: dataTip.indices.length }
            };
        };

        const x = buildAxis('x', 'x', [1, 0.2, 0.2]);
        const y = buildAxis('y', 'y', [0.2, 1, 0.2]);
        const z = buildAxis('z', 'z', [0.2, 0.2, 1]);
        
        const centerData = generateProceduralGeometry('cube', { size: 0.35 }, [{ type: 'setFaceColor', color: [1,1,1,1] }]);

        return {
            x, y, z,
            center: setupObjectBuffers(gl, centerData, 'gizmo_center'),
            centerCount: centerData.indices.length
        };
    }
}
