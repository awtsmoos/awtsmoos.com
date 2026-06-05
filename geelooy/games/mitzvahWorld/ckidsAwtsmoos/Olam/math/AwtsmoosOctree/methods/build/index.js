// B"H
/**
 * @module AwtsmoosOctree/methods/build/index
 * @description
 * Chapter 142: The collision gate imports the explicit-collider mercy.
 * Cache-busts fromGraphNode so Android cannot keep the version that rejected
 * village house and fence colliders before their triangles were born.
 */
import fromGraphNode from './fromGraphNode.js?v=explicit-collision-overrides-village-20260604-bh447';
import build from './build.js';
import dynamicTriangles from './dynamicTriangles.js';
import removeMesh from './removeMesh.js';
import getTriangle from './getTriangle.js';

export default {
  ...getTriangle,
  ...build,
  ...fromGraphNode,
  ...dynamicTriangles,
  ...removeMesh
};
