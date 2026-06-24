/* B"H */
import { buildMediaPlaylist } from '../export/HlsExporter.js';
export function createHlsPublisher(input = {}) { return { kind:'HlsPublisher', targetDuration:input.targetDuration || 2, segments:input.segments || [], uploadedBytes:0 }; }
export function addHlsSegment(pub, segment) { const model = { name:segment.name || `seg-${String(pub.segments.length).padStart(6,'0')}.ts`, duration:Number(segment.duration || pub.targetDuration), bytes:segment.bytes || 0 }; pub.segments.push(model); pub.uploadedBytes += Number(model.bytes || 0); return model; }
export function hlsPlaylist(pub, end = false) { return buildMediaPlaylist(pub.segments, { targetDuration:pub.targetDuration, end }); }
