// B"H
const KINDS = new Set(["control", "camera", "lighting", "dialogue", "animation", "audio", "consequence"]);
const list = value => Array.isArray(value) ? value : [];
const num = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

function idOf(value, fallback) { return String(value || fallback).trim(); }
function triggerOf(input = {}) {
  const when = input.play?.when || input.when || {};
  const type = when.event || input.event || input.type;
  return type ? [{ type, ...when }] : list(input.triggers);
}

function fromDialogue(track = {}) {
  return list(track.beats || track.events).map((b, i) => ({ kind:"dialogue", at:num(b.at), id:idOf(b.id, `dialogue_${i + 1}`), speaker:b.speaker || track.speaker || "narrator", text:b.text || b.subtitle || "", duration:b.duration || b.durationSec || 3 }));
}

function fromCamera(track = {}) {
  return list(track.keyframes || track.beats).map((b, i) => ({ kind:"camera", at:num(b.at), id:idOf(b.id, `camera_${i + 1}`), target:b.focus || b.target || b.actor || null, duration:b.duration || b.durationSec || 1, zoom:b.zoom ?? null, shot:b.shot || null }));
}

function fromActor(track = {}) {
  return list(track.keyframes || track.beats).map((b, i) => ({ kind:"animation", at:num(b.at), id:idOf(b.id, `${track.actor || "actor"}_${i + 1}`), actor:b.actor || track.actor || null, target:b.face || b.target || null, intent:b.pose || b.action || b.intent || "idle", duration:b.duration || b.durationSec || 1 }));
}

function fromQuest(track = {}) {
  return list(track.events || track.beats).map((b, i) => ({ kind:"consequence", at:num(b.at), id:idOf(b.id, `quest_${i + 1}`), consequences:[{ type:b.type || "flag", id:b.questId, key:b.markSeen || b.flag || b.key, state:b.state, value:b.value ?? true }] }));
}

function fromHud(track = {}) {
  return list(track.events || track.beats).map((b, i) => ({ kind:"control", at:num(b.at), id:idOf(b.id, `hud_${i + 1}`), action:b.visible === false || b.action === "hide" ? "hide_hud" : "show_hud" }));
}

function beatsFromTrack(track = {}) {
  const type = track.type || track.kind || track.name;
  if (type === "dialogue" || type === "subtitle") return fromDialogue(track);
  if (type === "camera") return fromCamera(track);
  if (type === "actor" || type === "animation") return fromActor(track);
  if (type === "quest" || type === "flag" || type === "consequence") return fromQuest(track);
  if (type === "hud") return fromHud(track);
  return list(track.beats).map((b, i) => ({ ...b, kind:b.kind || type || "control", id:b.id || `${type || "beat"}_${i + 1}`, at:num(b.at) }));
}

export function normalizeCutsceneTimeline(input = {}) {
  const id = idOf(input.id, "cutscene");
  const beats = [...list(input.beats), ...list(input.tracks).flatMap(beatsFromTrack)]
    .map((b, i) => ({ ...b, id:idOf(b.id, `beat_${i + 1}`), at:num(b.at), kind:b.kind || "control" }))
    .sort((a, b) => a.at - b.at || a.id.localeCompare(b.id));
  return { id, title:input.title || id, mood:input.mood || "wonder", beats, triggers:triggerOf(input), play:input.play || null, actors:input.actors || {}, once:input.once ?? input.play?.once ?? false, source:input };
}

export function validateCutsceneTimeline(input = {}, context = {}) {
  const timeline = normalizeCutsceneTimeline(input), errors = [], warnings = [];
  if (!timeline.id) errors.push("missing:id");
  if (!timeline.beats.length) warnings.push("empty:beats");
  for (const beat of timeline.beats) {
    if (!KINDS.has(beat.kind)) errors.push(`unknown-kind:${beat.kind}`);
    if (beat.at < 0) errors.push(`negative-at:${beat.id}`);
    if (beat.kind === "dialogue" && !beat.text) errors.push(`dialogue-text:${beat.id}`);
    if (beat.kind === "camera" && !beat.target && !beat.shot) warnings.push(`camera-target:${beat.id}`);
    if (beat.kind === "animation" && !beat.actor) errors.push(`actor-missing:${beat.id}`);
  }
  const knownActors = new Set(context.actors || Object.keys(timeline.actors || {}));
  for (const beat of timeline.beats) if (beat.actor && knownActors.size && !knownActors.has(beat.actor)) warnings.push(`missing-actor:${beat.actor}`);
  return { ok:errors.length === 0, errors, warnings, timeline };
}

export default { normalizeCutsceneTimeline, validateCutsceneTimeline };
