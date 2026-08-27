/* B"H */
export function createMp4Exporter(input = {}) { return { kind:'Mp4Exporter', extension:'mp4', mime:'video/mp4', videoCodec:input.videoCodec || 'avc1.42E01F', audioCodec:input.audioCodec || 'mp4a.40.2', fastStart:input.fastStart ?? true }; }
export function describeMp4Artifact(job, bytes = 0) { return { kind:'mp4', name:`${safe(job.name)}.mp4`, mime:'video/mp4', bytes, status:'descriptor-only' }; }
function safe(name='export') { return String(name).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'export'; }
