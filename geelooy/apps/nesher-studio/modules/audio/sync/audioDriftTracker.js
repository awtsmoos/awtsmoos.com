/* B"H
Audio drift tracker: the ear and the eye are reconciled by measured timestamps.
*/
export function createAudioDriftTracker() { return { samples:[], maxSamples:120 }; }
export function addAudioDriftSample(tracker, { audioTimestamp = 0, videoTimestamp = 0 } = {}) {
  const driftUs = Number(audioTimestamp) - Number(videoTimestamp);
  tracker.samples.push(driftUs);
  if (tracker.samples.length > tracker.maxSamples) tracker.samples.shift();
  return driftUs;
}
export function audioDriftSummary(tracker) {
  const n = tracker.samples.length;
  if (!n) return { samples:0, averageUs:0, latestUs:0, averageMs:0, latestMs:0 };
  const averageUs = Math.round(tracker.samples.reduce((a,b)=>a+b,0) / n);
  const latestUs = tracker.samples[n - 1];
  return { samples:n, averageUs, latestUs, averageMs:averageUs / 1000, latestMs:latestUs / 1000 };
}
