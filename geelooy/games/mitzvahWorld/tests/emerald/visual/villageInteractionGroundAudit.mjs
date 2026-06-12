#!/usr/bin/env node
/**
 * B"H
 * @file villageInteractionGroundAudit.mjs
 * @description Chapter 708: guards the village controls, social clicks, and grounded wildlife covenant.
 */
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const physics = read("ckidsAwtsmoos/chayim/chai/methods/physics/index.js");
const legacyPhysics = read("ckidsAwtsmoos/chayim/chai/methods/physics/movement.js");
const interaction = read("ckidsAwtsmoos/chayim/chossid/methods/interaction.js");
const animals = read("ckidsAwtsmoos/Olam/worlds/mitzvahWorld/combat/VillageAnimalMob.js");
const navigator = read("ckidsAwtsmoos/Olam/worlds/mitzvahWorld/combat/VillageGroundNavigator.js");
const battleLayer = read("ckidsAwtsmoos/Olam/worlds/mitzvahWorld/postbuild/GeneratedBattleLayer.js");

const correctBasis = (source) =>
  source.includes("forwardX = Math.sin(rotY)") &&
  source.includes("forwardZ = Math.cos(rotY)") &&
  source.includes("sideX = -Math.cos(rotY)") &&
  source.includes("sideZ = Math.sin(rotY)");

const details = {
  forwardBasis: correctBasis(physics),
  legacyForwardBasis: correctBasis(legacyPhysics),
  firstClickTargetsNpc: interaction.includes("this.targetedNpc !== niv") && interaction.includes("Click again to talk"),
  secondClickTalks: interaction.includes('niv.ayshPeula("accepted interaction"'),
  targetClears: interaction.includes("clearNpcTarget()"),
  noAttackVerticalDrift: !animals.includes("addScaledVector(up") && animals.includes("attackPulseUntil"),
  sharedGroundNavigator: animals.includes("getVillageGroundNavigator(olam)"),
  cachedGroundCells: navigator.includes("groundCache") && navigator.includes("CACHE_MS") && navigator.includes("CELL"),
  staticOctreeProbes: navigator.includes("worldOctree?.rayIntersect") && navigator.includes("obstacleCache"),
  questSilentAtSpawn: !battleLayer.includes("state.announce();"),
};

if (!Object.values(details).every(Boolean)) {
  console.error(JSON.stringify({ ok: false, details }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, details }, null, 2));
