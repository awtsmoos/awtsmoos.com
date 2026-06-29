/* B"H
HLS stop: Yesod closes the stream, waits for uploads, and returns the account of sparks.
*/
export async function stopHlsStream({ state, timer, output, tunnel }) {
  state.stopped = true; clearInterval(timer);
  if (state.pumping) await new Promise(resolve => setTimeout(resolve, 25));
  await output.finalize(); await Promise.allSettled(state.pending); await tunnel.stop({ sessionId:state.sessionId });
  return { sessionId:state.sessionId, frames:state.frameIndex, pieces:state.pieces, segments:state.pieces.filter(piece => piece.path.endsWith('.ts')).length, uploaded:state.uploaded, errors:state.errors.slice() };
}
