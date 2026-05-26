// B"H
/**
 * Chapter 12: The Two Screens And The Six Logs.
 *
 * This gate proves the next layer: Torah debate rules, debate deck, mobile and
 * desktop controls, HUD responsiveness, and wood collectibles. It reads only
 * committed project files so the street cannot lie.
 */

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const cwdGameRoot = path.resolve('.');
const repoGameRoot = path.resolve('geelooy/games/mitzvahWorld');
const gameRoot = fs.existsSync(path.join(cwdGameRoot, 'index.js')) ? cwdGameRoot : repoGameRoot;
const root = path.join(gameRoot, 'ckidsAwtsmoos/Olam/worlds/mitzvahWorld');
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');
const must = (text, regex, label) => assert.ok(regex.test(text), `${label} must match ${regex}`);

const rules = read('data/debate/TorahDebateRules.js');
const decks = read('data/debate/TorahDebateDecks.js');
const responsive = read('data/mobile/ResponsiveContracts.js');
const wood = read('data/collectibles/WoodCollectibles.js');
const woodPostBuild = read('postbuild/WoodCollectiblePostBuild.js');
const postBuild = read('postbuild/MitzvahWorldPostBuild.js');

must(rules, /pshat[\s\S]*Asiyah[\s\S]*earth/, 'pshat rule');
must(rules, /remez[\s\S]*Yetzirah[\s\S]*water/, 'remez rule');
must(rules, /derush[\s\S]*Beriah[\s\S]*fire/, 'derush rule');
must(rules, /sod[\s\S]*Atzilus[\s\S]*air/, 'sod rule');
must(rules, /resolveDebateType[\s\S]*strong[\s\S]*weak[\s\S]*neutral/, 'debate resolver');

must(decks, /opensBattleDebate[\s\S]*chumash_bereishis_opening/, 'battle debate deck');
must(decks, /requiredPassages[\s\S]*bereishis_1_1/, 'required passage');
must(decks, /rewards[\s\S]*unlockPassages[\s\S]*shemos_20_2/, 'unlock reward');

must(responsive, /mobile[\s\S]*tap[\s\S]*safeArea[\s\S]*minTouchTargetPx/, 'mobile input');
must(responsive, /desktop[\s\S]*click[\s\S]*KeyE[\s\S]*wideHud/, 'desktop input');
must(responsive, /actionBar[\s\S]*slots:\s*6/, 'responsive action bar');
must(responsive, /chumashReader[\s\S]*mobileMode[\s\S]*desktopMode/, 'Chumash responsive reader');

must(wood, /WOOD_COLLECTIBLE_CONTRACT[\s\S]*interactable[\s\S]*touchable/, 'wood click touch');
must(wood, /disappearsOnCollect[\s\S]*progressEvent[\s\S]*collect[\s\S]*Wood/, 'wood progress');
must(wood, /wood_emerald_6/, 'sixth wood node');
must(woodPostBuild, /createWoodLog[\s\S]*accepted interaction[\s\S]*ensureWoodCollectibles/, 'wood postbuild interaction');
must(woodPostBuild, /addItem[\s\S]*updateQuestProgress[\s\S]*group\.visible = false/, 'wood collection runtime effects');
must(postBuild, /ensureWoodCollectibles/, 'postbuild wood import');
must(postBuild, /WOOD_COLLECTIBLES/, 'postbuild wood safe step');
must(postBuild, /woodCollectibles/, 'postbuild wood diagnostics');
must(woodPostBuild, /createWoodLog[\s\S]*accepted interaction[\s\S]*ensureWoodCollectibles/, 'wood postbuild interaction');
must(woodPostBuild, /addItem[\s\S]*updateQuestProgress[\s\S]*group\.visible = false/, 'wood collection runtime effects');
must(postBuild, /ensureWoodCollectibles/, 'postbuild wood import');
must(postBuild, /WOOD_COLLECTIBLES/, 'postbuild wood safe step');
must(postBuild, /woodCollectibles/, 'postbuild wood diagnostics');

console.log('B"H - next-layer contracts passed.');
