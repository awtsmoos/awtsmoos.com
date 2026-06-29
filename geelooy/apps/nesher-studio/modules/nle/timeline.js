/* B"H
NLE timeline facade: the active app keeps its small API, while real edit verbs now exist.
The clip id argument never shadows the generator; every split receives a fresh vessel.
*/
export function createTimeline(input = {}) {
  const timeline = { fps:input.fps || 30, duration:input.duration || 16, selectedClipId:null, tracks:input.tracks || [track('video-1','Video 1','video'), track('audio-1','Audio 1','audio')], history:[] };
  if (!input.tracks) addClip(timeline, { assetId:'asset-canvas', name:'Opening scene', start:0, duration:4 }, { silent:true });
  return timeline;
}
export function addClip(timeline, clip = {}, options = {}) {
  if (!options.silent) remember(timeline, 'add clip');
  const target = getTrack(timeline, clip.trackId || 'video-1');
  const start = Number.isFinite(+clip.start) ? +clip.start : nextStart(target);
  const item = createClipRecord(clip, target.id, start);
  target.clips.push(item); sortTrack(target); timeline.duration = duration(timeline); timeline.selectedClipId = item.id; return item;
}
export function selectClip(timeline, clipId) { if (findClip(timeline, clipId)) timeline.selectedClipId = clipId; return selectedClip(timeline); }
export function selectedClip(timeline) { return findClip(timeline, timeline.selectedClipId)?.clip || null; }
export function trimClip(timeline, clipId, patch = {}) { remember(timeline, 'trim clip'); const found = findClip(timeline, clipId); if (!found) return null; Object.assign(found.clip, patch); found.clip.duration = Math.max(0.001, Number(found.clip.duration || 0)); sortTrack(found.track); timeline.duration = duration(timeline); return found.clip; }
export function splitClip(timeline, clipId, at) {
  remember(timeline, 'split clip');
  const found = findClip(timeline, clipId); if (!found) return null;
  const { clip, track } = found;
  if (at <= clip.start || at >= clip.start + clip.duration) return null;
  const right = { ...clip, id:makeId('clip'), start:at, duration:clip.start + clip.duration - at, inPoint:clip.inPoint + (at - clip.start) };
  clip.duration = at - clip.start;
  track.clips.splice(track.clips.indexOf(clip) + 1, 0, right);
  timeline.selectedClipId = right.id; timeline.duration = duration(timeline); return [clip, right];
}
export function rippleDeleteClip(timeline, clipId) { remember(timeline, 'ripple delete'); const found = findClip(timeline, clipId); if (!found) return null; const removed = found.track.clips.splice(found.track.clips.indexOf(found.clip), 1)[0]; found.track.clips.filter(c => c.start > removed.start).forEach(c => c.start = Math.max(0, c.start - removed.duration)); timeline.selectedClipId = null; timeline.duration = duration(timeline); return removed; }
export function moveClip(timeline, clipId, start, trackId) { remember(timeline, 'move clip'); const found = findClip(timeline, clipId); if (!found) return null; const clip = found.track.clips.splice(found.track.clips.indexOf(found.clip), 1)[0]; clip.start = Math.max(0, Number(start || 0)); clip.trackId = trackId || found.track.id; const target = getTrack(timeline, clip.trackId); target.clips.push(clip); sortTrack(target); timeline.duration = duration(timeline); return clip; }
export function timelineSummary(timeline) { return { tracks:timeline.tracks.length, clips:timeline.tracks.reduce((n,t)=>n+t.clips.length,0), duration:timeline.duration, selectedClipId:timeline.selectedClipId }; }
function createClipRecord(clip, trackId, start) { return { id:clip.id || makeId('clip'), assetId:clip.assetId || 'asset-canvas', trackId, start, duration:Number(clip.duration || 4), inPoint:Number(clip.inPoint || 0), name:clip.name || 'Scene clip', volume:clip.volume ?? 1, opacity:clip.opacity ?? 1, muted:!!clip.muted, disabled:!!clip.disabled }; }
function getTrack(timeline, trackId) { return timeline.tracks.find(t => t.id === trackId) || timeline.tracks[0]; }
function findClip(timeline, clipId) { for (const track of timeline.tracks) { const clip = track.clips.find(c => c.id === clipId); if (clip) return { track, clip }; } return null; }
function remember(timeline, label) { timeline.history ||= []; timeline.history.push({ label, at:Date.now(), summary:timelineSummary(timeline) }); if (timeline.history.length > 80) timeline.history.shift(); }
function nextStart(track) { return track.clips.reduce((max, c) => Math.max(max, c.start + c.duration), 0); }
function duration(timeline) { return Math.max(1, ...timeline.tracks.flatMap(t => t.clips.map(c => c.start + c.duration + 2)), 16); }
function sortTrack(track) { track.clips.sort((a,b) => a.start - b.start); }
function track(id, name, kind) { return { id, name, kind, clips:[] }; }
function makeId(prefix) { return `${prefix}-${globalThis.crypto?.randomUUID?.() || Date.now()}`; }
