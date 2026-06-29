/* B"H
Queue sampler: the encoder queue is watched as a pulse, not guessed in darkness.
*/
export function createEncodeQueueSampler(limit = 180) { return { limit, samples:[] }; }
export function pushQueueSample(sampler, depth, at = Date.now()) {
  sampler.samples.push({ depth:Number(depth || 0), at });
  if (sampler.samples.length > sampler.limit) sampler.samples.shift();
  return sampler;
}
export function queueSampleSummary(sampler) {
  const depths = sampler.samples.map(s => s.depth);
  const max = depths.length ? Math.max(...depths) : 0;
  const average = depths.length ? depths.reduce((a,b)=>a+b,0) / depths.length : 0;
  return { samples:depths.length, max, average };
}
