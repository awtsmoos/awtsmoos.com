/**
 * B"H
 * @file MitzvahWorldPostBuild.js
 * @description
 * Final Mitzvah World pass: doors, Chossid NPCs, generated battle targets,
 * and a small debug summary for runtime inspection.
 */

import { ensureChossidNpcs } from "../npcs/EnsureChossidNpcs.js";
import { ensureHouseDoors } from "../doors/EnsureHouseDoors.js";
import { ensureGeneratedBattleLayer } from "./GeneratedBattleLayer.js";

/**
 * B"H
 * Stores postbuild diagnostics on any available global vessel.
 *
 * @param {Object} summary Summary.
 * @returns {void}
 */
function publishSummary(summary) {
  const root =
    typeof window !== "undefined" ? window :
    typeof self !== "undefined" ? self :
    null;

  if (root) root.__MITZVAH_WORLD_POSTBUILD__ = summary;
}

/**
 * B"H
 * Runs one safe postbuild step without killing the rest of the world.
 *
 * @param {string} label Step label.
 * @param {Function} fn Step function.
 * @param {Object} summary Mutable summary.
 * @returns {Promise<void>}
 */
async function runSafe(label, fn, summary) {
  try {
    const result = await fn();
    const count = Array.isArray(result) ? result.length : (result ? 1 : 0);
    summary.steps[label] = { ok: true, count };
    console.log(`B"H | POSTBUILD_STEP_OK | ${label}`, count);
  } catch (error) {
    summary.steps[label] = {
      ok: false,
      message: error?.message || String(error),
      stack: error?.stack || null
    };
    console.error(`B"H | ${label}_FAILED | message=${error?.message || String(error)}`, error);
  }

  publishSummary(summary);
}

/**
 * B"H
 * Counts scene objects with known mitzvah-world markers.
 *
 * @param {any} scene Scene.
 * @returns {Object} Counts.
 */
function countSceneMarkers(scene) {
  const counts = {
    chossidNpcs: 0,
    battleTargets: 0,
    generatedTrees: 0,
    doors: 0
  };

  if (!scene || typeof scene.traverse !== "function") return counts;

  scene.traverse(child => {
    if (child?.userData?.mitzvahWorldNpcRoot || child?.userData?.isNpcPart) counts.chossidNpcs++;
    if (child?.userData?.isBattleTarget) counts.battleTargets++;
    if (child?.userData?.nefeshType === "tree" || child?.userData?.isGeneratedFoliage) counts.generatedTrees++;
    if (String(child?.name || "").toLowerCase().includes("door")) counts.doors++;
  });

  return counts;
}

/**
 * B"H
 * Runs final repairs.
 *
 * @param {Object} context Context.
 * @returns {Promise<Object>} Summary.
 */
export async function runMitzvahWorldPostBuild(context) {
  const summary = {
    startedAt: Date.now(),
    steps: {},
    finalCounts: {}
  };

  publishSummary(summary);

  await runSafe("HOUSE_DOORS", () => ensureHouseDoors(context), summary);
  await runSafe("CHOSSID_NPCS", () => ensureChossidNpcs(context), summary);
  await runSafe("GENERATED_BATTLE_LAYER", () => ensureGeneratedBattleLayer(context), summary);

  summary.finishedAt = Date.now();
  summary.finalCounts = countSceneMarkers(context?.scene || context?.olam?.scene);
  publishSummary(summary);

  console.log("B\"H | MITZVAH_WORLD_POSTBUILD_SUMMARY", summary);
  return summary;
}
