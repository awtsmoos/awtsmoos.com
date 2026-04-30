
// B"H
/**
 * @module OctreeWorld_Methods_Hub
 * @description
 * 🕍 THE ASSEMBLY OF FACULTIES 🕍
 * 
 * "Everything follows the head."
 * This hub gathers all the modular pieces of the OctreeWorld logic—Adding, 
 * Removing, Updating, and Querying—and presents them as a unified whole.
 */
import addObject from './addObject.js';
import removeMesh from './removeMesh.js';
import update from './update.js';
import fromGraphNode from './fromGraphNode.js';
import insert from './insert.js';
import building from './building/index.js';
import internalHelpers from './internal/index.js';
import queries from './queries/index.js';

export default {
    ...addObject,
    ...removeMesh,
    ...update,
    ...fromGraphNode,
    ...insert,
    ...building,
    ...internalHelpers,
    ...queries
};
