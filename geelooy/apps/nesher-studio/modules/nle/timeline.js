/* B"H
Timeline: clips become a measured path, and time accepts a ruler.
*/
export function createTimeline() { return { fps:30, duration:12, tracks:[track('video-1','Video 1','video'), track('audio-1','Audio 1','audio')] }; }
export function addClip(timeline, clip = {}) { const target = timeline.tracks.find(t => t.id === (clip.trackId || 'video-1')) || timeline.tracks[0]; const item = { id:clip.id || `clip-${crypto.randomUUID?.() || Date.now()}`, assetId:clip.assetId || 'asset-canvas', start:Number(clip.start || 0), duration:Number(clip.duration || 4), name:clip.name || 'Scene clip' }; target.clips.push(item); return item; }
function track(id, name, kind) { return { id, name, kind, clips:[] }; }
