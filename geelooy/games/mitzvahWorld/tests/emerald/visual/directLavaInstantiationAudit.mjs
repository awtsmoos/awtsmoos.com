#!/usr/bin/env node
/**
 * B"H
 * @file directLavaInstantiationAudit.mjs
 * @description Chapter 616: Lava platforms must not depend on stale AWTSMOOS
 * star exports. SolidBlock and core lava classes are directly imported by the
 * active instantiateMezuzahDirect path.
 */
import fs from 'node:fs';
const loaderIndex = fs.readFileSync('ckidsAwtsmoos/Olam/methods/loadNivrayim/index.js', 'utf8');
const instantiate = fs.readFileSync('ckidsAwtsmoos/Olam/methods/loadNivrayim/instantiateMezuzahDirect.js', 'utf8');
const details = {
  activeImportCacheBust: loaderIndex.includes('instantiateMezuzahDirect.js?v=direct-lava-platforms-20260609-bh613'),
  directSolidBlock: instantiate.includes('SolidBlockDirect') && instantiate.includes('dvarim/architecture/SolidBlock.js?v=direct-lava-platforms-20260609-bh613'),
  directMoving: instantiate.includes('MovingPlatformDirect') && instantiate.includes('dvarim/hazards/MovingPlatform.js?v=direct-lava-platforms-20260609-bh613'),
  directHazards: instantiate.includes('SpikeFieldDirect') && instantiate.includes('FallResetTriggerDirect'),
  resolveDirectFirst: instantiate.includes('return DIRECT_TYPES[type] || AWTSMOOS[type] || null'),
  logsDirectKnown: instantiate.includes('directKnown: Object.keys(DIRECT_TYPES)')
};
if (!Object.values(details).every(Boolean)) { console.error(JSON.stringify({ ok: false, details }, null, 2)); process.exit(1); }
console.log(JSON.stringify({ ok: true, details }, null, 2));
