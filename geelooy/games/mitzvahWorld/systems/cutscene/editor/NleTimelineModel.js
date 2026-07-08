// B"H
import { normalizeCutsceneTimeline, validateCutsceneTimeline } from "../CutsceneTimelineSchema.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";

const clone = value => JSON.parse(JSON.stringify(value ?? {}));
const list = value => Array.isArray(value) ? value : [];

export class NleTimelineModel {
  constructor(input = {}) {
    this.timeline = clone(input.id ? input : { id:"nle_timeline", title:"NLE Timeline", tracks:[], play:{ once:false, when:{ event:"enterWorld" } } });
  }

  static deserialize(text = "{}") { return new NleTimelineModel(JSON.parse(text)); }

  addTrack(type = "dialogue", extra = {}) {
    const track = { type, id:extra.id || `${type}_${this.timeline.tracks.length + 1}`, ...extra };
    if (!track.beats && !track.keyframes && !track.events) track.beats = [];
    this.timeline.tracks.push(track);
    return track;
  }

  track(idOrType) {
    return this.timeline.tracks.find(t => t.id === idOrType || t.type === idOrType) || this.addTrack(idOrType);
  }

  addBeat(trackId, beat = {}) {
    const track = this.track(trackId), lane = track.keyframes ? "keyframes" : track.events ? "events" : "beats";
    track[lane] ||= [];
    const row = { id:beat.id || `${track.id || track.type}_beat_${track[lane].length + 1}`, at:Number(beat.at || 0), ...beat };
    track[lane].push(row);
    track[lane].sort((a, b) => (a.at || 0) - (b.at || 0));
    return row;
  }

  moveBeat(trackId, beatId, at = 0) {
    const track = this.track(trackId), lanes = ["beats", "keyframes", "events"];
    const beat = lanes.flatMap(k => list(track[k])).find(b => b.id === beatId);
    if (beat) beat.at = Number(at) || 0;
    return beat || null;
  }

  removeBeat(trackId, beatId) {
    const track = this.track(trackId);
    for (const lane of ["beats", "keyframes", "events"]) {
      const before = list(track[lane]).length;
      track[lane] = list(track[lane]).filter(b => b.id !== beatId);
      if (track[lane].length !== before) return true;
    }
    return false;
  }

  validate(context = {}) { return validateCutsceneTimeline(this.timeline, context); }
  toRuntimeTimeline() { return normalizeCutsceneTimeline(this.timeline); }
  serialize() { return JSON.stringify(this.timeline, null, 2); }
  snapshot() { return clone(this.timeline); }

  missingReferences(context = {}) {
    const runtime = this.toRuntimeTimeline(), actors = new Set(context.actors || []), quests = new Set(context.quests || []), doors = new Set(context.doors || []), triggers = new Set(context.triggers || []);
    const missing = { actors:[], quests:[], doors:[], triggers:[] };
    for (const beat of runtime.beats) if (beat.actor && actors.size && !actors.has(beat.actor)) missing.actors.push(beat.actor);
    for (const row of list(runtime.triggers)) {
      if (row.questId && quests.size && !quests.has(row.questId)) missing.quests.push(row.questId);
      if (row.doorId && doors.size && !doors.has(row.doorId)) missing.doors.push(row.doorId);
      if (row.triggerId && triggers.size && !triggers.has(row.triggerId)) missing.triggers.push(row.triggerId);
    }
    return Object.fromEntries(Object.entries(missing).map(([k, v]) => [k, [...new Set(v)]]));
  }
}

export default NleTimelineModel;
