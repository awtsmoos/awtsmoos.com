#!/usr/bin/env node
// B"H
/**
 * @file visible-root-regression.cjs
 * @description
 * Chapter 654: A static beis din for the rooted Chossid and mission card.
 *
 * The Awtsmoos recreates every byte each instant, but old cache seals can creep
 * back like husks if nobody judges the gates. This regression inspects player
 * root proof, worker probes, lava reset helpers, and the new mission UI river.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');
const seal = 'visible-root-binding-20260610-bh710';
const banned = ['wall-direct-mobile-move-20260610-bh705', 'wall-direct-mobile-router-20260610-bh706', 'physics-motion-trace-20260610-bh708', 'chossid-model-load-20260610-bh709'];
const checks = [
  { file: 'index.html', must: ['index.js?compact=true&v=' + seal] },
  { file: 'index.js', must: ['const SEAL = "' + seal + '"', 'ikar.js?compact=true&bh=${SEAL}'] },
  { file: 'ckidsAwtsmoos/ikar.js', must: ['PlayerGuaranteeProbe.js?compact=true&v=' + seal, 'installPlayerGuaranteeProbe(scope, SEAL)', seal] },
  { file: 'ckidsAwtsmoos/boot/PlayerGuaranteeProbe.js', must: ['__AWTSMOOS_REQUEST_PLAYER_PROBE__', '__AWTSMOOS_ASSERT_PLAYER_BODY__', 'playerProbe', 'modelParentIsRoot'] },
  { file: 'ckidsAwtsmoos/Olam/worldManager/index.js', must: ['StartWorldFlow.js?compact=true&v=' + seal] },
  { file: 'ckidsAwtsmoos/Olam/worldManager/StartWorldFlow.js', must: ['ikarOyvedManager.js?v=' + seal, '__AWTSMOOS_ACTIVE_WORKER_MANAGER__'] },
  { file: 'ckidsAwtsmoos/Olam/ikarOyvedManager.js', must: ['worker/domEvents.js?v=' + seal, 'OYVED_MANAGER_BOUND'] },
  { file: 'ckidsAwtsmoos/Olam/worker/domEvents.js', must: ['TouchOrchestrator.js?v=' + seal, 'DOM_EVENTS_BOUND'] },
  { file: 'ckidsAwtsmoos/Olam/worker/input/TouchOrchestrator.js', must: ['const SEAL = \'' + seal + '\'', 'mobileMove'] },
  { file: 'ckidsAwtsmoos/Olam/ikarOyvedManager/messages/WorkerMessageInterceptor.js', must: ['playerProbeResult', '__AWTSMOOS_LAST_PLAYER_PROBE__'] },
  { file: 'ckidsAwtsmoos/Olam/oyved/core/PlayerRuntimeProbe.js', must: ['modelParentIsRoot', 'fallbackPresent', seal] },
  { file: 'ckidsAwtsmoos/Olam/oyved/core/ContinuousEventRouter.js', must: ['WorldDisposal.js?v=' + seal, 'SpikeResetActions.js?v=' + seal, 'playerProbe: postPlayerProbe'] },
  { file: 'ckidsAwtsmoos/Olam/oyved/core/WorldDisposal.js', must: ['destroyWorld', 'disposed'] },
  { file: 'ckidsAwtsmoos/Olam/oyved/core/SpikeResetActions.js', must: ['resetAfterSpikeDeath', 'enableAfterSpikeReset', 'resolveSpikeResetFeet'] },
  { file: 'ckidsAwtsmoos/Olam/oyved/core/interpreter/ContinuousRoute.js', must: ['ContinuousEventRouter.js?v=' + seal] },
  { file: 'ckidsAwtsmoos/Olam/oyved/methods/world/WorldHeescheel.js', must: ['levelMission', 'missionPayload', 'requiredPerutosFrom'] },
  { file: 'ckidsAwtsmoos/Olam/uiManager/ui/gameUI/index.js', must: ['missionCard.js?v=mission-card-ui-20260610-bh711', 'missionCard'] },
  { file: 'ckidsAwtsmoos/Olam/uiManager/ui/gameUI/missionCard.js', must: ['shaym: "levelMission"', 'Collect the perutos', 'mission-card-inner'] },
  { file: 'ckidsAwtsmoos/Olam/worker/handlers/ui/directFallbackMap.js', must: ['levelMission: () => showMission(ob)', 'missionFallback.js?v=mission-card-ui-20260610-bh711'] },
  { file: 'ckidsAwtsmoos/Olam/worker/handlers/ui/missionFallback.js', must: ['showMission', 'awtsmoos-mission-fallback', 'levelMission'] },
  { file: 'ckidsAwtsmoos/chayim/chossid/index.js', must: [seal] },
  { file: 'ckidsAwtsmoos/chayim/chai/index.js', must: [seal] },
  { file: 'ckidsAwtsmoos/Olam/methods/boyrayNivra.js', must: ['const TRACE_SEAL = \'' + seal + '\'', 'scene-prepared-real-model'] },
  { file: 'ckidsAwtsmoos/Olam/methods/helpers/loaders/GLTFLoaderVessel.js', must: ['const TRACE_SEAL = \'' + seal + '\'', 'parse-complete'] },
  { file: 'ckidsAwtsmoos/exports/ChayimExports.js', must: ['chossid/index.js?v=' + seal, 'chai/index.js?v=' + seal] }
];
function read(relative) {
  const full = path.join(root, relative);
  if (!fs.existsSync(full)) throw new Error(`Missing file: ${relative} at ${full}`);
  return fs.readFileSync(full, 'utf8');
}
function assertIncludes(file, text, needle) { if (!text.includes(needle)) throw new Error(`${file} missing required witness: ${needle}`); }
function assertBannedGone(file, text) { for (const needle of banned) if (text.includes(needle)) throw new Error(`${file} still contains stale seal: ${needle}`); }
function main() {
  const touched = [];
  for (const check of checks) {
    const text = read(check.file);
    assertBannedGone(check.file, text);
    for (const needle of check.must) assertIncludes(check.file, text, needle);
    touched.push(check.file);
  }
  console.log('B"H visible-root regression passed', JSON.stringify({ seal, root, checked: touched.length, files: touched }, null, 2));
}
try { main(); }
catch (error) { console.error('B"H visible-root regression failed:', error.message); process.exit(1); }
