// B"H
/**
 * @file CinematicDirectorPostBuild.js
 * @description Opening camera rail and cutscene proof for Mitzvah World.
 *
 * The Awtsmoos lets the camera pass over the village like a quiet lantern:
 * not stealing the player's whole life, only revealing that the world can
 * breathe, frame, glide, and return control with a soft hand.
 */
import { ensureMovieGenerationRuntime } from "../movie/MovieGenerationRuntime.js?compact=true&v=awtsmoos-movie-generation-runtime-20260619-bh1";

const KEY = "__awtsmoosCinematicDirector";

/**
 * Returns the world vessel from a postbuild context.
 *
 * @param {object} context Postbuild context.
 * @returns {object} Olam-like vessel.
 */
function holderOf(context = {}) { return context.olam || context || {}; }

/**
 * Returns a useful camera target.
 *
 * @param {object} holder Olam-like vessel.
 * @returns {object|null} Vector-like target.
 */
function targetOf(holder) {
  return holder?.player?.mesh?.position || holder?.chossid?.mesh?.position || { x:0, y:1.2, z:0 };
}

/**
 * Copies a vector-like value into another vector.
 *
 * @param {object} to Destination vector.
 * @param {object} from Source vector.
 * @returns {void}
 */
function copyVec(to, from) { if (to?.set) to.set(from.x, from.y, from.z); else Object.assign(to, from); }

/**
 * Interpolates one numeric value.
 *
 * @param {number} a Start.
 * @param {number} b End.
 * @param {number} t Unit progress.
 * @returns {number} Interpolated value.
 */
function lerp(a, b, t) { return a + (b - a) * t; }

/**
 * Builds the opening shot list around a target.
 *
 * @param {object} target Camera target.
 * @returns {object[]} Shot list.
 */
function openingShots(target) {
  return [
    { id:"village_wide", at:0, pos:{ x:target.x - 10, y:8, z:target.z + 16 }, look:{ x:target.x, y:1.3, z:target.z } },
    { id:"chossid_push", at:.46, pos:{ x:target.x - 5.2, y:4.2, z:target.z + 8.4 }, look:{ x:target.x, y:1.55, z:target.z } },
    { id:"marker_reveal", at:1, pos:{ x:target.x + 3.8, y:3.1, z:target.z + 5.6 }, look:{ x:target.x, y:1.75, z:target.z } }
  ];
}

/**
 * Interpolates a shot rail.
 *
 * @param {object[]} shots Shot list.
 * @param {number} t Unit progress.
 * @returns {object} Camera pose.
 */
function sampleRail(shots, t) {
  const clamped = Math.max(0, Math.min(1, t));
  let a = shots[0], b = shots[shots.length - 1];
  for (let i = 0; i < shots.length - 1; i++) if (clamped >= shots[i].at && clamped <= shots[i + 1].at) { a = shots[i]; b = shots[i + 1]; break; }
  const span = Math.max(.001, b.at - a.at), local = (clamped - a.at) / span, ease = local * local * (3 - 2 * local);
  return { id:b.id, pos:{ x:lerp(a.pos.x,b.pos.x,ease), y:lerp(a.pos.y,b.pos.y,ease), z:lerp(a.pos.z,b.pos.z,ease) }, look:{ x:lerp(a.look.x,b.look.x,ease), y:lerp(a.look.y,b.look.y,ease), z:lerp(a.look.z,b.look.z,ease) } };
}

/**
 * Installs a cinematic director and plays a short opening rail when possible.
 *
 * @param {object} context Postbuild context.
 * @returns {object|null} Director report.
 */
export function ensureCinematicDirectorPostBuild(context = {}) {
  const holder = holderOf(context), movieRuntime = ensureMovieGenerationRuntime(context), camera = holder.camera || context.camera;
  if (!holder || holder[KEY]) return holder?.[KEY] || null;
  const target = targetOf(holder), shots = openingShots(target);
  const movieReport = movieRuntime?.report?.() || null;
  const report = { ok:true, id:"mitzvah_world_opening_rail", shots:shots.map(s => s.id), durationSec:4.2, cameraFound:Boolean(camera), played:false, autoPlay:false, movieGeneration:movieReport };
  const director = { report, playOpening() {
    if (!camera?.position || !holder.tzimtzum?.onUpdate) return report;
    const start = performance.now(); const original = { x:camera.position.x, y:camera.position.y, z:camera.position.z };
    report.played = true; report.startedAt = Date.now();
    let done = false;
    holder.tzimtzum.onUpdate(() => {
      if (done) return;
      const elapsed = (performance.now() - start) / 1000, t = elapsed / report.durationSec;
      if (t > 1) { copyVec(camera.position, original); report.finishedAt = Date.now(); done = true; return; }
      const pose = sampleRail(shots, t); copyVec(camera.position, pose.pos); camera.lookAt?.(pose.look.x, pose.look.y, pose.look.z); report.lastShot = pose.id;
    });
    return report;
  } };
  holder[KEY] = director; holder.__AWTSMOOS_CINEMATIC_REPORT__ = report;
  return director;
}

export default ensureCinematicDirectorPostBuild;
