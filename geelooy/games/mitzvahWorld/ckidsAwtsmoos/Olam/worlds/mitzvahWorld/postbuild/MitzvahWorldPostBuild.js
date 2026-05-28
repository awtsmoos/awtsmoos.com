// B"H
/**
 * @file MitzvahWorldPostBuild.js
 * @description
 * Chapter 3: The automatic city/battle/NPC postbuild is closed.
 *
 * This module used to import and run house doors, generated battle enemies,
 * wood collectibles, NPC role markers, and Emerald features for every worker
 * load. That is forbidden for the clean Level 1 platformer path because the
 * authored level already contains its complete manifest.
 */

/**
 * No-op postbuild kept only for compatibility with stale imports.
 *
 * @param {object} context Optional postbuild context.
 * @returns {Promise<object>} Empty summary.
 */
export async function runMitzvahWorldPostBuild(context = {}) {
  return {
    skipped: true,
    reason: "clean-level-pipeline",
    source: context?.worldData?.shaym || context?.source || null,
    steps: {},
    finalCounts: {}
  };
}
