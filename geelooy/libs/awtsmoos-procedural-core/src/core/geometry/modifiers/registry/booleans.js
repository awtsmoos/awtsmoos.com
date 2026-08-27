
/* B"H
*/
/**
 * @file booleans.js
 * @chapter THE BOOK OF THE VOID
 */

import { performSafeCSGSubtract } from '../booleans/csgSubtract.js';
import { performPrimitiveCSGSubtract } from '../booleans/csgPrimitiveSubtract.js';
import { route } from '../../../utils/router.js';
import { CSG } from '../../csg/index.js';
import { healTopologyModifier } from '../heal.js';

export const BOOLEAN_MODIFIERS = Object.freeze({
    /**
     * B"H - Standard Subtraction.
     */
    'csgSubtract': (mesh, mod, params) => performSafeCSGSubtract(mesh, params.cutterMesh, params.insideTag),
    
    /**
     * B"H - Dynamic Primitive Cut.
     */
    'csgPrimitiveSubtract': (mesh, mod, params) => performPrimitiveCSGSubtract(mesh, params),

    /**
     * B"H - Boolean Union (Welding).
     * Combines two meshes and removes internal hidden geometry.
     */
    'csgUnion': (mesh, mod, params) => {
        return route(mesh && mesh.faces && params.otherMesh, {
            'false': () => mesh,
            'true': () => {
                try {
                    const csgA = CSG.fromMesh(mesh);
                    const csgB = CSG.fromMesh(params.otherMesh);
                    const result = csgA.union(csgB).toMesh();
                    return healTopologyModifier(result, { tolerance: 0.0001 });
                } catch(e) {
                    console.error("B\"H - Boolean Union failed:", e);
                    return mesh;
                }
            }
        });
    },

    /**
     * B"H - Intersection (Shatter Mask).
     * Keeps only the parts where two meshes overlap.
     */
    'csgIntersection': (mesh, mod, params) => {
        return route(mesh && mesh.faces && params.otherMesh, {
            'false': () => mesh,
            'true': () => {
                try {
                    const csgA = CSG.fromMesh(mesh);
                    const csgB = CSG.fromMesh(params.otherMesh);
                    const result = csgA.intersect(csgB).toMesh();
                    return healTopologyModifier(result, { tolerance: 0.0001 });
                } catch(e) {
                    console.error("B\"H - Boolean Intersection failed:", e);
                    return mesh;
                }
            }
        });
    }
});
