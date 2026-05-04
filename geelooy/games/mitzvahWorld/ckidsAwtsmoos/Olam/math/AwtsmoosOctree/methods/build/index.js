
// B"H
/**
 * @module AwtsmoosOctree/methods/build/index
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════════════╗
 * ║  THE GRAND UNIFICATION OF BUILD METHODS — YICHUD ELYON                        ║
 * ║                                                                                  ║
 * ║  "And He unified all the forces into a single, holy Name."                     ║
 * ║                                                                                  ║
 * ║  In the highest spiritual worlds, all multiplicity is dissolved back into      ║
 * ║  the one, simple, undivided Light. This index file is that dissolution.        ║
 * ║                                                                                  ║
 * ║  Each sub-module contains one focused aspect of the physics build process:     ║
 * ║   • fromGraphNode.js — ingesting THREE.js scene hierarchies into triangles     ║
 * ║   • build.js — crystallizing those triangles into a searchable Octree          ║
 * ║   • dynamicTriangles.js — inserting living, moving geometry at runtime        ║
 * ║   • removeMesh.js — purging dead triangles when objects are destroyed          ║
 * ║   • getTriangle.js — reading triangle vertices from the packed Float32Array    ║
 * ║                                                                                  ║
 * ║  They are spread into one unified export and bound (via `Object.keys().forEach`)║
 * ║  onto the Octree instance in index.js — a single unified consciousness         ║
 * ║  wearing many garments, like the Awtsmoos filling all worlds simultaneously.  ║
 * ╚══════════════════════════════════════════════════════════════════════════════════╝
 *
 * @file index.js
 * @memberof AwtsmoosOctree/methods/build
 */
import fromGraphNode from './fromGraphNode.js?v=purged2';
import build from './build.js?v=purged2';
import dynamicTriangles from './dynamicTriangles.js?v=purged2';
import removeMesh from './removeMesh.js?v=purged2';
import getTriangle from './getTriangle.js?v=purged2';

/**
 * @constant {Object} buildMethods
 * @description
 * The unified export object of all build-phase methods for the AwtsmoosOctree.
 * Spread-merged in the correct order so that internal helper methods (_getTriangle,
 * getTotalTriangleCount, getTriangleCount) are available when `build()` and
 * `split()` call them during the crystallization phase.
 */
export default {
    ...getTriangle,      // _getTriangle, getTriangleCount, getTotalTriangleCount (needed by build/split)
    ...build,            // build(), split()
    ...fromGraphNode,    // fromGraphNode()
    ...dynamicTriangles, // addDynamicTriangle(), addTriangle(), _insertTriangleRecursive()
    ...removeMesh        // removeMesh(), pruneDeadTriangles()
};
