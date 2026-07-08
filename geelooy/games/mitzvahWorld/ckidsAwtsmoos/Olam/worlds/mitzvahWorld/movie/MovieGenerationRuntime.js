// B"H
/**
 * @file MovieGenerationRuntime.js
 * @description Installs universal movie generation into Mitzvah World.
 *
 * The world receives a director, not a prison. JSON scenes may arrive from the
 * level, a quest, a dialogue, or a generated event; the director turns them into
 * movie packets while gameplay remains free.
 */
import { MovieDirectorRuntime } from "./MovieDirectorRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { MITZVAH_MOVIE_PROJECT } from "./MitzvahMovieProject.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

const KEY = "__awtsmoosMovieGenerationRuntime";

/**
 * Returns the Olam-like holder.
 *
 * @param {object} context Postbuild context.
 * @returns {object} Holder.
 */
function holderOf(context = {}) { return context.olam || context || {}; }

/**
 * Returns movie JSON from world data or fallback.
 *
 * @param {object} context Postbuild context.
 * @returns {object} Movie project JSON.
 */
function inputOf(context = {}) {
  return context.movieGeneration || context.worldData?.movieGeneration || context.worldData?.awtsmoosMovie || MITZVAH_MOVIE_PROJECT;
}

/**
 * Installs movie generation API on the world holder.
 *
 * @param {object} context Postbuild context.
 * @returns {object|null} Runtime director.
 */
export function ensureMovieGenerationRuntime(context = {}) {
  const holder = holderOf(context);
  if (!holder) return null;
  if (holder[KEY]) return holder[KEY];
  const runtime = new MovieDirectorRuntime(holder, inputOf(context));
  holder[KEY] = runtime;
  holder.__AWTSMOOS_MOVIE_GENERATOR__ = runtime.report();
  holder.generateMovieScene = input => runtime.generateScene(input);
  holder.previewMovieScene = id => runtime.preview(id);
  holder.playMovieScene = id => {
    const report = runtime.play(id);
    holder.__AWTSMOOS_MOVIE_GENERATOR__ = runtime.report();
    holder.__AWTSMOOS_MOVIE_LAST_PLAYBACK__ = report;
    return report;
  };
  return runtime;
}

export default ensureMovieGenerationRuntime;
