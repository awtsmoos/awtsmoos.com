#!/usr/bin/env node
/**
 * B"H
 * @file npcLevelUiAudit.mjs
 * @description Chapter 385: The split NPC level route is audited across its
 * newest vessels: DOM constants, overlay, fetcher, dispatcher, CSS, and data.
 */
import fs from 'node:fs';
const fail = (message, details = {}) => { console.error(JSON.stringify({ ok: false, message, details }, null, 2)); process.exit(1); };
const read = file => fs.readFileSync(file, 'utf8');
const files = {
  overlay: read('ckidsAwtsmoos/Olam/worker/handlers/ui/npcOverlay.js'),
  dialogue: read('ckidsAwtsmoos/Olam/worker/handlers/ui/npcDialogueMarkup.js'),
  levels: read('ckidsAwtsmoos/Olam/worker/handlers/ui/npcLevelMarkup.js'),
  actions: read('ckidsAwtsmoos/Olam/worker/handlers/ui/npcOverlayActions.js'),
  stats: read('ckidsAwtsmoos/Olam/worker/handlers/ui/npcStatsMarkup.js'),
  launcher: read('ckidsAwtsmoos/Olam/worker/handlers/ui/levelLauncher.js'),
  fetcher: read('ckidsAwtsmoos/Olam/worker/handlers/ui/levelFetcher.js'),
  dispatcher: read('ckidsAwtsmoos/Olam/worker/handlers/ui/worldStartDispatcher.js'),
  normalizer: read('ckidsAwtsmoos/Olam/worker/handlers/ui/levelIdNormalizer.js'),
  domConstants: read('ckidsAwtsmoos/Olam/worker/handlers/ui/domConstants.js'),
  domKit: read('ckidsAwtsmoos/Olam/worker/handlers/ui/domKit.js'),
  css: [read('ckidsAwtsmoos/Olam/worker/handlers/ui/npcCss.js'), read('ckidsAwtsmoos/Olam/worker/handlers/ui/npcCssCards.js'), read('ckidsAwtsmoos/Olam/worker/handlers/ui/npcCssResponsive.js')].join('\n'),
  levelSelect: read('ckidsAwtsmoos/Olam/uiManager/ui/screens/levelSelect.js'),
  levelData: read('ckidsAwtsmoos/Olam/uiManager/ui/screens/levelSelect/LevelDataMap.js')
};
const ladderIds = Array.from(files.levelData.matchAll(/id:\s*"(ladder-\d+\.json)"/g)).map(match => match[1]);
const details = {
  overlayConductorImports: files.overlay.includes('npcDialogueMarkup') && files.overlay.includes('npcLevelMarkup') && files.overlay.includes('npcStatsMarkup') && files.overlay.includes('npcOverlayActions'),
  overlayHasShell: files.overlay.includes('awts-npc-card') && files.overlay.includes('sealIsland'),
  dialogueHasLevelsButton: files.dialogue.includes('data-npc-choose') && files.dialogue.includes('CHOOSE LEVELS'),
  levelCardsModule: files.levels.includes('data-level-id') && files.levels.includes('awts-npc-level-card'),
  statsModule: files.stats.includes('awts-npc-stats') && files.stats.includes('areaStats'),
  actionModuleTouchSafe: files.actions.includes('bindPress') && files.actions.includes('launchLevel'),
  domConstantsLevelBase: files.domConstants.includes('LEVEL_BASE') && files.domConstants.includes('/games/mitzvahWorld/levels/ladder/data/'),
  domKitReexportsLevelBase: files.domKit.includes('LEVEL_BASE') && files.domKit.includes('domConstants'),
  fetcherUsesLevelBase: files.fetcher.includes('fetch(LEVEL_BASE + encodeURIComponent(clean)') && files.fetcher.includes('awtsmoos-level-json-v1'),
  launcherIsSplit: files.launcher.includes('levelFetcher') && files.launcher.includes('worldStartDispatcher'),
  dispatcherStartsWorld: files.dispatcher.includes('startWorld') && files.dispatcher.includes("CustomEvent('start'"),
  normalizerJson: files.normalizer.includes("(?:js|json)") && files.normalizer.includes("`${stem}.json`"),
  levelSelectCanLoadEmerald: files.levelSelect.includes('/games/mitzvahWorld/ckidsAwtsmoos/tochen/worlds/emerald.js'),
  cssHasMobileGrid: files.css.includes('awts-npc-level-grid') && files.css.includes('@media(max-width:760px)'),
  ladderIds,
  uniqueLadders: new Set(ladderIds).size
};
if (!details.overlayConductorImports || !details.overlayHasShell) fail('NPC overlay conductor is incomplete', details);
if (!details.dialogueHasLevelsButton) fail('NPC dialogue markup missing CHOOSE LEVELS button', details);
if (!details.levelCardsModule) fail('NPC level card module missing level card grid data', details);
if (!details.statsModule) fail('NPC stats module missing stats panel', details);
if (!details.actionModuleTouchSafe) fail('NPC action module is not touch-safe or cannot launch levels', details);
if (details.uniqueLadders !== 20) fail('Level data does not expose 20 unique lava ladder JSON cards', details);
if (!details.domConstantsLevelBase || !details.domKitReexportsLevelBase || !details.fetcherUsesLevelBase || !details.launcherIsSplit || !details.dispatcherStartsWorld || !details.normalizerJson) fail('Split level launcher route is incomplete', details);
if (!details.levelSelectCanLoadEmerald) fail('Level select cannot load Emerald entry route', details);
if (!details.cssHasMobileGrid) fail('NPC UI CSS lacks mobile-friendly level grid rules', details);
console.log(JSON.stringify({ ok: true, details }, null, 2));
