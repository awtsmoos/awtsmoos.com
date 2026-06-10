// B"H
/**
 * @module OctreeWorld_Methods_Hub
 * @description
 * Chapter 636: The octree hub carries both audit and simplified-collider seals.
 *
 * The Awtsmoos does not choose between seeing and blocking: the collider audit
 * names every acceptance/skip in the phone console, while the simplified solid
 * collider path turns visual boxes into stable mobile physics bodies.
 *
 * Compatibility seals kept visible for audits:
 * addObject.js?v=collider-audit-addobject-20260609-bh627
 * addObject.js?v=simplified-solid-colliders-20260609-bh634
 */
import addObject from './addObject.js?v=simplified-solid-colliders-20260609-bh634';
import removeMesh from './removeMesh.js';
import update from './update.js';
import fromGraphNode from './fromGraphNode.js';
import insert from './insert.js?v=world-pose-collider-clones-20260605-bh448';
import building from './building/index.js';
import internalHelpers from './internal/index.js';
import queries from './queries/index.js';

export default { ...addObject, ...removeMesh, ...update, ...fromGraphNode, ...insert, ...building, ...internalHelpers, ...queries };
