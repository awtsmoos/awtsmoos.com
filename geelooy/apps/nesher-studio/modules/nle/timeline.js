/* B"H
A timeline is the ladder where frames climb into story.
*/
export function createTimeline() {
  const timeline = { fps:30, duration:16, selectedClipId:null, tracks:[track('video-1','Video 1','video'), track('audio-1','Audio 1','audio')] };
  addClip(timeline, { assetId:'asset-canvas', name:'Opening scene', start:0, duration:4 });
  return timeline;
}
export function addClip(timeline, clip = {}) {
  const target = timeline.tracks.find(t => t.id === (clip.trackId || 'video-1')) || timeline.tracks[0];
  const start = Number.isFinite(+clip.start) ? +clip.start : nextStart(target);
  const item = { id:clip.id || `clip-${crypto.randomUUID?.() || Date.now()}`, assetId:clip.assetId || 'asset-canvas', start, duration:Number(clip.duration || 4), name:clip.name || 'Scene clip' };
  target.clips.push(item); timeline.duration = Math.max(timeline.duration, item.start + item.duration + 2); timeline.selectedClipId = item.id; return item;
}
export function selectClip(timeline, id) { if (timeline.tracks.some(t => t.clips.some(c => c.id === id))) timeline.selectedClipId = id; }
function nextStart(track) { return track.clips.reduce((max, c) => Math.max(max, c.start + c.duration), 0); }
function track(id, name, kind) { return { id, name, kind, clips:[] }; }
