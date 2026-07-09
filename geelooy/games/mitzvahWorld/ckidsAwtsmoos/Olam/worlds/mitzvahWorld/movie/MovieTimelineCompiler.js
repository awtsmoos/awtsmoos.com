// B"H
/**
 * @file MovieTimelineCompiler.js
 * @description Converts movie JSON into playable camera/dialogue/action beats.
 *
 * The timeline is a seder of moments: first a wide breath, then a face, then a
 * word, then a motion. Each beat is small, but together they make a scene able
 * to become a whole generated movie.
 */
import { normalizeMovieProject, normalizeMovieScene } from "./MovieSceneSchema.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { synthesizeSceneShots } from "./MovieShotLibrary.js?compact=true&v=full-chain-cache-bust-20260708-bh10";

/**
 * Creates a dialogue beat from text.
 *
 * @param {object} beat Source beat.
 * @returns {object} Dialogue beat.
 */
function dialogueBeat(beat) {
  return { id:`dialogue_${beat.id}`, kind:"dialogue", at:beat.at, durationSec:beat.durationSec, actor:beat.actor || beat.target || "player", text:beat.text, emotion:beat.emotion || "calm" };
}

/**
 * Creates an actor action beat.
 *
 * @param {object} beat Source beat.
 * @returns {object|null} Action beat.
 */
function actionBeat(beat) {
  if (!beat.action) return null;
  return { id:`action_${beat.id}`, kind:"action", at:beat.at, durationSec:beat.durationSec, actor:beat.actor || beat.target || "player", action:beat.action, emotion:beat.emotion || null };
}

/**
 * Generates default dialogue if a scene has none.
 *
 * @param {object} scene Normalized scene.
 * @returns {object[]} Dialogue beats.
 */
function defaultDialogue(scene) {
  if (scene.beats.some(beat => beat.text)) return [];
  const actor = scene.actors[0]?.id || "player";
  return [{ id:`dialogue_${scene.id}_opening`, kind:"dialogue", at:1.2, durationSec:3.4, actor, text:`${scene.title} begins.`, emotion:scene.mood }];
}

/**
 * Compiles one scene into a timeline.
 *
 * @param {object} scene Normalized scene.
 * @returns {object} Compiled scene.
 */
export function compileMovieScene(scene = {}) {
  const normalized = scene.camera && scene.actors && scene.beats ? scene : normalizeMovieScene(scene);
  scene = normalized;
  const camera = scene.camera.length ? scene.camera : synthesizeSceneShots(scene);
  const dialogue = scene.beats.filter(beat => beat.text).map(dialogueBeat).concat(defaultDialogue(scene));
  const actions = scene.beats.map(actionBeat).filter(Boolean);
  const beats = [...camera, ...dialogue, ...actions].sort((a, b) => a.at - b.at || String(a.kind).localeCompare(String(b.kind)));
  return { id:scene.id, title:scene.title, kind:scene.kind, mood:scene.mood, durationSec:scene.durationSec, actors:scene.actors, beats, camera, dialogue, actions, consequences:scene.consequences, report:{ beats:beats.length, camera:camera.length, dialogue:dialogue.length, actions:actions.length, actors:scene.actors.length } };
}

/**
 * Compiles a whole movie project.
 *
 * @param {object} input Movie JSON.
 * @returns {object} Compiled movie.
 */
export function compileMovieProject(input = {}) {
  const project = normalizeMovieProject(input), scenes = project.scenes.map(compileMovieScene);
  return { id:project.id, title:project.title, scenes, episodes:project.episodes, report:{ scenes:scenes.length, beats:scenes.reduce((n, s) => n + s.report.beats, 0), camera:scenes.reduce((n, s) => n + s.report.camera, 0), dialogue:scenes.reduce((n, s) => n + s.report.dialogue, 0), actions:scenes.reduce((n, s) => n + s.report.actions, 0), actors:scenes.reduce((n, s) => n + s.report.actors, 0) } };
}

export default compileMovieProject;
