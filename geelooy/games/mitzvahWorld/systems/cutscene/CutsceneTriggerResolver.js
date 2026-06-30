// B"H
import { normalizeCutsceneTimeline } from "./CutsceneTimelineSchema.js";
import { isCutsceneSeen, markCutsceneSeen } from "./CutsceneSeenState.js";

const list = value => Array.isArray(value) ? value : [];

function timelinesOf(source = {}) {
  if (Array.isArray(source)) return source;
  return [...list(source.timelines), ...list(source.cutscenes), ...list(source.cutsceneManifest)];
}

function triggerRows(timeline = {}) {
  const when = timeline.play?.when || timeline.when || {};
  const rows = list(timeline.triggers).length ? timeline.triggers : [];
  return when.event ? [{ type:when.event, ...when }, ...rows] : rows;
}

function same(a, b) { return !a || !b || String(a) === String(b); }

function matchesRow(row = {}, event = {}) {
  const type = row.type || row.event;
  if (type && type !== event.type) return false;
  if (!same(row.questId, event.questId)) return false;
  if (!same(row.doorId, event.doorId)) return false;
  if (!same(row.triggerId, event.triggerId)) return false;
  if (!same(row.worldId, event.worldId)) return false;
  return true;
}

function blockedBySeen(timeline, holder) {
  return (timeline.once || timeline.play?.once) && isCutsceneSeen(holder, timeline.id);
}

export function resolveCutscenesForEvent(event = {}, source = {}, holder = {}) {
  const resolved = [], skipped = [];
  for (const raw of timelinesOf(source)) {
    const timeline = normalizeCutsceneTimeline(raw);
    const rows = triggerRows(timeline);
    if (!rows.some(row => matchesRow(row, event))) continue;
    if (blockedBySeen(timeline, holder)) skipped.push({ id:timeline.id, reason:"seen-once" });
    else resolved.push(timeline);
  }
  return { event, resolved, skipped };
}

export function markResolvedCutscenesSeen(holder = {}, timelines = []) {
  for (const timeline of timelines) if (timeline.once || timeline.play?.once) markCutsceneSeen(holder, timeline.id);
  return holder.worldState || holder.__awtsmoosWorldState || {};
}

export default { resolveCutscenesForEvent, markResolvedCutscenesSeen };
