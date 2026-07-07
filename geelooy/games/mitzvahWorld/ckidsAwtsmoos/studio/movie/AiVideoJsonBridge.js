// B"H
import { createTimeline, addTrack, addTimelineClip, addTimelineKeyframe } from "./Timeline.js";
import { exportCutscene } from "./CutsceneExporter.js";
import { DEFAULT_CUSTOM_MOVIE_ACTIONS, actionPickerModel, normalizeMovieActionName } from "./MovieActionCatalog.js";

const KINDS = ["camera", "actor", "dialogue", "subtitle", "audio", "effect", "caption", "bubble", "shader"];
const list = value => Array.isArray(value) ? value : value == null ? [] : [value];
const object = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const n = (value, fallback = 0) => { const x = Number(value); return Number.isFinite(x) ? x : fallback; };
const text = (value, fallback = "") => value == null ? fallback : String(value);
const cleanKind = kind => KINDS.includes(kind) ? kind : "actor";
const clipId = (prefix, index) => `${prefix}_${String(index + 1).padStart(2, "0")}`;

function customActionsFor(video = {}, project = {}) {
  return [...DEFAULT_CUSTOM_MOVIE_ACTIONS, ...list(project.customActions), ...list(video.customActions), ...list(video.actions?.custom)];
}

export function parseAiVideoJson(input = {}) {
  const json = typeof input === "string" ? JSON.parse(input) : object(input);
  const video = object(json.video || json.movie || json);
  return { schema:"mitzvah-ai-video-json-v2", ...json, video:{ ...video, durationSec:Math.max(1, n(video.durationSec ?? video.duration, 30)) } };
}

export function timelineFromAiVideo(input = {}) {
  const project = parseAiVideoJson(input), video = project.video, customActions = customActionsFor(video, project);
  const timeline = createTimeline({ id:video.id || project.id || "ai_video", duration:video.durationSec });
  for (const kind of KINDS) addTrack(timeline, kind, kind[0].toUpperCase() + kind.slice(1));
  list(video.shots).forEach((shot, index) => addShot(timeline, shot, index, customActions));
  list(video.actors).forEach((actor, index) => addActor(timeline, actor, index, customActions));
  list(video.characters).forEach((actor, index) => addActor(timeline, actor, index + list(video.actors).length, customActions));
  list(video.animals).forEach((animal, index) => addAnimal(timeline, animal, index, customActions));
  list(video.dialogue).forEach((line, index) => addDialogue(timeline, line, index));
  list(video.captions).forEach((caption, index) => addCaption(timeline, caption, index));
  list(video.speechBubbles || video.bubbles).forEach((bubble, index) => addBubble(timeline, bubble, index));
  list(video.audio).forEach((cue, index) => addCue(timeline, "audio", cue, index));
  list(video.effects).forEach((fx, index) => addCue(timeline, "effect", fx, index));
  list(video.shaders).forEach((fx, index) => addCue(timeline, "shader", fx, index));
  return { ok:true, project, timeline, customActions, actionPicker:actionPickerModel(customActions), summary:summarizeAiVideo(project, timeline, customActions) };
}

function addShot(timeline, raw, index, customActions) {
  const shot = object(raw), start = n(shot.start ?? shot.at, index * 3), duration = Math.max(.25, n(shot.duration ?? shot.durationSec, 3));
  const cameraCall = shot.cameraCall || shot.call || `AI_CAMERA_CALL_${index + 1}`;
  const action = normalizeMovieActionName(shot.action || "idle", customActions);
  const camera = addTimelineClip(timeline, "camera", { id:shot.id || clipId("camera", index), label:shot.label || `${cameraCall} ${shot.shot || "wide"}`, start, duration, payload:{ shot:shot.shot || "wide", subject:shot.subject || shot.actor || null, lens:shot.lens || "35mm", cameraCall, cssEffect:shot.cssEffect || null, shader:shot.shader || null, aiVideo:true } });
  const actor = shot.actor || shot.subject;
  if (actor) addTimelineClip(timeline, "actor", { id:clipId("actor", index), label:`${actor} ${action}`, start, duration, payload:{ actor, action, cameraCall, customAction:customActions.some(item => item.id === action), aiVideo:true } });
  for (const key of list(shot.keyframes)) addTimelineKeyframe(timeline, camera.id, { time:n(key.time, start), value:object(key.value || key) });
  if (!camera.keyframes?.length) addTimelineKeyframe(timeline, camera.id, { time:start, value:{ position:shot.position || [0, 3, 7], lookAt:shot.lookAt || [0, 1, 0], lens:shot.lens || "35mm", call:cameraCall } });
}

function addActor(timeline, raw, index, customActions) {
  const actor = object(raw), start = n(actor.start ?? actor.at, 0), duration = Math.max(.25, n(actor.duration ?? actor.durationSec, 3));
  addTimelineClip(timeline, "actor", { id:actor.id || clipId("json_actor", index), label:`${actor.actor || actor.id || "actor"} ${actor.action || "idle"}`, start, duration, payload:{ ...actor, action:normalizeMovieActionName(actor.action || "idle", customActions), aiVideo:true } });
}

function addAnimal(timeline, raw, index, customActions) {
  const animal = object(raw), start = n(animal.start ?? animal.at, 0), duration = Math.max(.25, n(animal.duration ?? animal.durationSec, 6));
  addTimelineClip(timeline, "actor", { id:animal.id || clipId("animal", index), label:`single mesh ${animal.species || "animal"} ${animal.action || "idle"}`, start, duration, payload:{ diet:animal.diet || "species-default", behavior:list(animal.behavior || animal.moves), ...animal, actor:animal.id || `animal_${index + 1}`, action:normalizeMovieActionName(animal.action || "graze", customActions), singleMeshAnimal:true, proceduralAnimal:true, realisticAnimal:true, aiVideo:true } });
}

function addDialogue(timeline, raw, index) {
  const line = object(raw), start = n(line.start ?? line.at, index * 4), duration = Math.max(.5, n(line.duration ?? line.durationSec, 3));
  const speaker = text(line.speaker, "narrator"), content = text(line.text || line.line, "");
  addTimelineClip(timeline, "dialogue", { id:line.id || clipId("dialogue", index), label:`${speaker}: ${content.slice(0, 32)}`, start, duration, payload:{ speaker, text:content, speechBubble:Boolean(line.bubble), aiVideo:true } });
  addTimelineClip(timeline, "subtitle", { id:clipId("subtitle", index), label:content.slice(0, 42) || "Subtitle", start, duration, payload:{ text:content, aiVideo:true } });
}

function addCaption(timeline, raw, index) {
  const caption = object(raw), start = n(caption.start ?? caption.at, 0), duration = Math.max(.25, n(caption.duration ?? caption.durationSec, 3));
  addTimelineClip(timeline, "caption", { id:caption.id || clipId("caption", index), label:caption.text || "Extreme caption", start, duration, payload:{ ...caption, extremeCaption:true, aiVideo:true } });
}

function addBubble(timeline, raw, index) {
  const bubble = object(raw), start = n(bubble.start ?? bubble.at, 0), duration = Math.max(.25, n(bubble.duration ?? bubble.durationSec, 3));
  addTimelineClip(timeline, "bubble", { id:bubble.id || clipId("bubble", index), label:`${bubble.actor || "actor"} bubble`, start, duration, payload:{ ...bubble, speechBubble:true, aiVideo:true } });
}

function addCue(timeline, kind, raw, index) {
  const cue = object(raw), start = n(cue.start ?? cue.at, 0), duration = Math.max(.25, n(cue.duration ?? cue.durationSec, 1));
  addTimelineClip(timeline, cleanKind(kind), { id:cue.id || clipId(kind, index), label:cue.label || cue.sound || cue.name || kind, start, duration, payload:{ ...cue, aiVideo:true } });
}

export function summarizeAiVideo(project, timeline, customActions = customActionsFor(project.video, project)) {
  const counts = Object.fromEntries(timeline.tracks.map(track => [track.kind, track.clips.length]));
  const cameraCalls = timeline.tracks.find(track => track.kind === "camera")?.clips.map(clip => clip.payload?.cameraCall).filter(Boolean) || [];
  return { id:project.video.id || project.id || timeline.id, durationSec:timeline.duration, tracks:timeline.tracks.length, clips:timeline.tracks.reduce((sum, track) => sum + track.clips.length, 0), cameraCalls, customActions:customActions.map(item => item.id || item), counts };
}

export function exportAiVideoCutscene(input = {}) {
  const built = timelineFromAiVideo(input);
  return { ...built, cutscene:exportCutscene({ id:built.summary.id, name:built.project.video.title || "AI Video", timeline:built.timeline }) };
}

export function createEncodingJob(input = {}, options = {}) {
  const built = exportAiVideoCutscene(input), now = new Date().toISOString();
  return { ok:true, id:options.id || `encode_${Date.now().toString(36)}`, status:"queued", createdAt:now, format:options.format || "mp4", fps:n(options.fps, 24), size:options.size || [1280,720], source:"ai-video-json", actionPicker:built.actionPicker, customActions:built.customActions, summary:built.summary, cutscene:built.cutscene };
}

export default { parseAiVideoJson, timelineFromAiVideo, exportAiVideoCutscene, createEncodingJob };
