// B"H
import { createTimeline, addTrack, addTimelineClip, addTimelineKeyframe } from "./Timeline.js";
import { exportCutscene } from "./CutsceneExporter.js";

const KINDS = ["camera", "actor", "dialogue", "subtitle", "audio", "effect"];

function list(value) { return Array.isArray(value) ? value : value == null ? [] : [value]; }
function object(value) { return value && typeof value === "object" && !Array.isArray(value) ? value : {}; }
function n(value, fallback = 0) { const x = Number(value); return Number.isFinite(x) ? x : fallback; }
function text(value, fallback = "") { return value == null ? fallback : String(value); }
function cleanKind(kind = "camera") { return KINDS.includes(kind) ? kind : "actor"; }
function clipId(prefix, index) { return `${prefix}_${String(index + 1).padStart(2, "0")}`; }

export function parseAiVideoJson(input = {}) {
  const json = typeof input === "string" ? JSON.parse(input) : object(input);
  const video = object(json.video || json.movie || json);
  const duration = Math.max(1, n(video.durationSec ?? video.duration, 30));
  return { schema:"mitzvah-ai-video-json-v1", ...json, video:{ ...video, durationSec:duration } };
}

export function timelineFromAiVideo(input = {}) {
  const project = parseAiVideoJson(input), video = project.video;
  const timeline = createTimeline({ id:video.id || project.id || "ai_video", duration:video.durationSec });
  for (const kind of KINDS) addTrack(timeline, kind, kind[0].toUpperCase() + kind.slice(1));
  for (const [index, shot] of list(video.shots).entries()) addShot(timeline, shot, index);
  for (const [index, line] of list(video.dialogue).entries()) addDialogue(timeline, line, index);
  for (const [index, cue] of list(video.audio).entries()) addCue(timeline, "audio", cue, index);
  for (const [index, fx] of list(video.effects).entries()) addCue(timeline, "effect", fx, index);
  return { ok:true, project, timeline, summary:summarizeAiVideo(project, timeline) };
}

function addShot(timeline, raw, index) {
  const shot = object(raw), start = n(shot.start ?? shot.at, index * 3), duration = Math.max(.25, n(shot.duration ?? shot.durationSec, 3));
  const camera = addTimelineClip(timeline, "camera", { id:shot.id || clipId("camera", index), label:shot.label || shot.shot || "AI shot", start, duration, payload:{ shot:shot.shot || "wide", subject:shot.subject || shot.actor || null, lens:shot.lens || null, aiVideo:true } });
  const actor = shot.actor || shot.subject;
  if (actor) addTimelineClip(timeline, "actor", { id:clipId("actor", index), label:`${actor} ${shot.action || "perform"}`, start, duration, payload:{ actor, action:shot.action || "idle", aiVideo:true } });
  for (const key of list(shot.keyframes)) addTimelineKeyframe(timeline, camera.id, { time:n(key.time, start), value:object(key.value || key) });
  if (!camera.keyframes?.length) addTimelineKeyframe(timeline, camera.id, { time:start, value:{ position:shot.position || [0, 3, 7], lookAt:shot.lookAt || [0, 1, 0] } });
}

function addDialogue(timeline, raw, index) {
  const line = object(raw), start = n(line.start ?? line.at, index * 4), duration = Math.max(.5, n(line.duration ?? line.durationSec, 3));
  const speaker = text(line.speaker, "narrator"), content = text(line.text || line.line, "");
  addTimelineClip(timeline, "dialogue", { id:line.id || clipId("dialogue", index), label:`${speaker}: ${content.slice(0, 32)}`, start, duration, payload:{ speaker, text:content, aiVideo:true } });
  addTimelineClip(timeline, "subtitle", { id:clipId("subtitle", index), label:content.slice(0, 42) || "Subtitle", start, duration, payload:{ text:content, aiVideo:true } });
}

function addCue(timeline, kind, raw, index) {
  const cue = object(raw), start = n(cue.start ?? cue.at, 0), duration = Math.max(.25, n(cue.duration ?? cue.durationSec, 1));
  addTimelineClip(timeline, cleanKind(kind), { id:cue.id || clipId(kind, index), label:cue.label || cue.sound || cue.name || kind, start, duration, payload:{ ...cue, aiVideo:true } });
}

export function summarizeAiVideo(project, timeline) {
  const counts = Object.fromEntries(timeline.tracks.map(track => [track.kind, track.clips.length]));
  return { id:project.video.id || project.id || timeline.id, durationSec:timeline.duration, tracks:timeline.tracks.length, clips:timeline.tracks.reduce((sum, track) => sum + track.clips.length, 0), counts };
}

export function exportAiVideoCutscene(input = {}) {
  const built = timelineFromAiVideo(input);
  return { ...built, cutscene:exportCutscene({ id:built.summary.id, name:built.project.video.title || "AI Video", timeline:built.timeline }) };
}

export function createEncodingJob(input = {}, options = {}) {
  const built = exportAiVideoCutscene(input), now = new Date().toISOString();
  return { ok:true, id:options.id || `encode_${Date.now().toString(36)}`, status:"queued", createdAt:now, format:options.format || "mp4", fps:n(options.fps, 24), size:options.size || [1280, 720], source:"ai-video-json", summary:built.summary, cutscene:built.cutscene };
}

export default { parseAiVideoJson, timelineFromAiVideo, exportAiVideoCutscene, createEncodingJob };
