// B"H
/**
 * @module OctreeWorld_Methods_Hub
 * @description
 * Chapter 147: The collision world imports insertion with remembered world pose.
 * The house wall boxes were cloned into physics without a stable local pose.
 * This hub cache-busts the corrected inserter so solid walls become solid where
 * they are visible.
 */
import addObject from './addObject.js';
import removeMesh from './removeMesh.js';
import update from './update.js';
import fromGraphNode from './fromGraphNode.js';
import insert from './insert.js?v=world-pose-collider-clones-20260605-bh448';
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
