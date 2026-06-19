// B"H
/**
 * @file MovieSceneSchema.js
 * @description Data covenant for generated scenes, episodes, actors, shots.
 *
 * A movie scene begins as plain JSON, a little breath of intention. The
 * Awtsmoos gives that intention shape: actors, beats, camera grammar, dialogue,
 * action, emotion, and consequence, all normalized before the runtime touches
 * the world.
 */
const DEFAULT_SCENE = Object.freeze({
  id:"mitzvah_world_generated_scene",
  title:"Generated Mitzvah World Scene",
  kind:"discovery",
  mood:"wonder",
  durationSec:18,
  location:{ id:"current", position:[0,0,0] },
  actors:[{ id:"player", role:"chossid", target:"player" }],
  beats:[]
});

/**
 * Creates a stable array.
 *
 * @param {*} value Possible array.
 * @returns {Array} Array value.
 */
function list(value) { return Array.isArray(value) ? value : []; }

/**
 * Normalizes a numeric vector.
 *
 * @param {*} value Candidate vector.
 * @param {number[]} fallback Fallback vector.
 * @returns {number[]} Three numeric entries.
 */
export function movieVec3(value, fallback = [0,0,0]) {
  const source = Array.isArray(value) ? value : fallback;
  return [Number(source[0]) || 0, Number(source[1]) || 0, Number(source[2]) || 0];
}

/**
 * Normalizes one actor declaration.
 *
 * @param {object} actor Actor input.
 * @param {number} index Actor index.
 * @returns {object} Actor packet.
 */
export function normalizeMovieActor(actor = {}, index = 0) {
  const id = actor.id || actor.target || `actor_${index + 1}`;
  return { id, target:actor.target || id, role:actor.role || "support", displayName:actor.displayName || actor.name || id, style:actor.style || {}, blocking:list(actor.blocking), gestures:list(actor.gestures) };
}

/**
 * Normalizes one movie beat.
 *
 * @param {object} beat Beat input.
 * @param {number} index Beat index.
 * @returns {object} Beat packet.
 */
export function normalizeMovieBeat(beat = {}, index = 0) {
  return { id:beat.id || `beat_${index + 1}`, at:Number(beat.at ?? index * 3) || 0, durationSec:Number(beat.durationSec || beat.duration || 3) || 3, kind:beat.kind || beat.type || "camera", target:beat.target || null, text:beat.text || beat.line || "", actor:beat.actor || beat.speaker || null, camera:beat.camera || null, action:beat.action || null, emotion:beat.emotion || null };
}

/**
 * Normalizes one scene JSON block.
 *
 * @param {object} input Scene input.
 * @returns {object} Normalized scene.
 */
export function normalizeMovieScene(input = {}) {
  const scene = { ...DEFAULT_SCENE, ...input };
  return { id:scene.id, title:scene.title || scene.id, kind:scene.kind || "discovery", mood:scene.mood || "wonder", durationSec:Number(scene.durationSec || scene.duration || 18) || 18, location:{ id:scene.location?.id || "current", position:movieVec3(scene.location?.position) }, actors:list(scene.actors).map(normalizeMovieActor), beats:list(scene.beats).map(normalizeMovieBeat), camera:list(scene.camera), consequences:list(scene.consequences), tags:list(scene.tags) };
}

/**
 * Normalizes a movie project or single scene.
 *
 * @param {object} input Movie input.
 * @returns {object} Movie project.
 */
export function normalizeMovieProject(input = {}) {
  const scenes = list(input.scenes).length ? input.scenes : [input.scene || input];
  return { id:input.id || "mitzvah_world_movie_project", title:input.title || "Mitzvah World Movie Project", scenes:scenes.map(normalizeMovieScene), episodes:list(input.episodes), variables:input.variables || {} };
}

export default normalizeMovieProject;
