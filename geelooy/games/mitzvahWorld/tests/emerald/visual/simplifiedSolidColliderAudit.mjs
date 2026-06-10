#!/usr/bin/env node
/**
 * B"H
 * @file simplifiedSolidColliderAudit.mjs
 * @description Chapter 636: Ordinary solid visuals must automatically generate
 * simplified world-box colliders at final bounds before octree insertion.
 */
import fs from 'node:fs';
const factory = fs.readFileSync('ckidsAwtsmoos/Olam/math/colliders/SimplifiedColliderFactory.js','utf8');
const add = fs.readFileSync('ckidsAwtsmoos/Olam/math/OctreeWorld/methods/addObject.js','utf8');
const hub = fs.readFileSync('ckidsAwtsmoos/Olam/math/OctreeWorld/methods/index.js','utf8');
const details = {
  factoryExists: factory.includes('makeSimplifiedBoxCollider') && factory.includes('worldBoxOf(mesh)'),
  createsBoxGeometry: factory.includes('new THREE.BoxGeometry(size.x, size.y, size.z)'),
  placesAtWorldCenter: factory.includes('collider.position.copy(center)') && factory.includes('collider.quaternion.identity()'),
  marksCollision: factory.includes('simplifiedCollider: true') && factory.includes('collisionBody: true') && factory.includes('addToOctree: true'),
  terrainOptOut: factory.includes('terrainColliderOnly') && add.includes('Terrain can opt out'),
  skipBeforeSimplify: add.includes('sourceSkipReason(mesh)') && add.includes('if (sourceReason)'),
  usesFactory: add.includes('colliderForOctree(mesh)') && add.includes('simplified-world-box-created-before-octree'),
  hubCacheBust: hub.includes('addObject.js?v=simplified-solid-colliders-20260609-bh634')
};
if (!Object.values(details).every(Boolean)) { console.error(JSON.stringify({ok:false,details},null,2)); process.exit(1); }
console.log(JSON.stringify({ok:true,details},null,2));
