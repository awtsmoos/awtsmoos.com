/* B"H
HLS pump: Netzach pushes frames through Mediabunny while Gevurah prevents overlap.
*/
export async function pumpHlsFrame({ state, source, fps, targetDuration, drawFrame }) {
  if (state.stopped || state.pumping) return;
  state.pumping = true;
  try {
    drawFrame?.();
    const timestamp = state.frameIndex / fps;
    const duration = 1 / fps;
    const keyFrame = state.frameIndex % Math.max(1, Math.round(fps * targetDuration)) === 0;
    await source.add(timestamp, duration, { keyFrame });
    state.frameIndex += 1;
  } catch (error) { state.errors.push(error.message || String(error)); }
  finally { state.pumping = false; }
}
