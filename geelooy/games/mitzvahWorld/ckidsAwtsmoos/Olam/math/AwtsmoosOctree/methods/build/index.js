// B"H
/**
 * @module AwtsmoosOctree/methods/build/index
 * @description
 * Chapter 142: The collision gate imports the explicit-collider mercy.
 * Cache-busts fromGraphNode so Android cannot keep the version that rejected
 * village house and fence colliders before their triangles were born.
 */
import fromGraphNode from './fromGraphNode.js?compact=true&v=explicit-collision-overrides-village-20260604-bh447';
import build from './build.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import dynamicTriangles from './dynamicTriangles.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import removeMesh from './removeMesh.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import getTriangle from './getTriangle.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default {
  ...getTriangle,
  ...build,
  ...fromGraphNode,
  ...dynamicTriangles,
  ...removeMesh
};
