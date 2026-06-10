#!/usr/bin/env node
/**
 * B"H
 * @file colliderAuditHookAudit.mjs
 * @description Chapter 629: Runtime octree insertion must be auditable from the
 * phone console so false village blockers can be named precisely.
 */
import fs from 'node:fs';
const hub = fs.readFileSync('ckidsAwtsmoos/Olam/math/OctreeWorld/methods/index.js','utf8');
const add = fs.readFileSync('ckidsAwtsmoos/Olam/math/OctreeWorld/methods/addObject.js','utf8');
const audit = fs.readFileSync('ckidsAwtsmoos/Olam/math/collisionAudit/CollisionAudit.js','utf8');
const details = {
  hubCacheBust: hub.includes('addObject.js?v=collider-audit-addobject-20260609-bh627'),
  addImportsAudit: add.includes('collisionAudit/CollisionAudit.js?v=collider-audit-20260609-bh627'),
  addLogsAccepted: add.includes('auditAccepted(mesh') && add.includes('direct-addObject-triangles'),
  addLogsSkipped: add.includes('auditSkipped(mesh'),
  auditPrintsBox: audit.includes('COLLIDER_ACCEPTED_AUDIT') && audit.includes('box: worldBox(mesh)'),
  auditPrintsFlags: audit.includes('skipOctree') && audit.includes('villageDecor') && audit.includes('isTerrain')
};
if (!Object.values(details).every(Boolean)) { console.error(JSON.stringify({ok:false,details},null,2)); process.exit(1); }
console.log(JSON.stringify({ok:true,details},null,2));
