/* B"H
HLS capture: Malchus receives finalized bytes and sends only transport segments onward.
*/
export function captureHlsPath({ path, buffer, state, tunnel }) {
  const bytes = new Uint8Array(buffer);
  state.pieces.push({ path, bytes:bytes.length });
  if (!path.endsWith('.ts')) return;
  const index = state.segmentIndex++;
  const promise = tunnel.pushHlsSegmentRaw({ sessionId:state.sessionId, name:path, bytes, duration:state.targetDuration, index, contentType:'video/mp2t' }).then(() => { state.uploaded += bytes.length; });
  state.pending.push(promise);
}
