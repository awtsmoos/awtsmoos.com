/* B"H
Encoding telemetry: the hidden labor of frames becomes readable truth.
*/
export function createEncodingTelemetry() {
  return { startedAt:Date.now(), encodedVideo:0, encodedAudio:0, droppedVideo:0, muxedChunks:0, errors:[] };
}
export function noteEncodedVideo(telemetry) { telemetry.encodedVideo++; return telemetry; }
export function noteEncodedAudio(telemetry) { telemetry.encodedAudio++; return telemetry; }
export function noteDroppedVideo(telemetry) { telemetry.droppedVideo++; return telemetry; }
export function noteMuxedChunk(telemetry) { telemetry.muxedChunks++; return telemetry; }
export function telemetrySummary(t) { return { ...t, elapsedMs:Date.now() - t.startedAt }; }
