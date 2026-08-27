/* B"H
Video stats: every encoded frame leaves a footprint for the operator.
*/
export function createVideoStats() { return { frames:0, encoded:0, dropped:0, queueSamples:[], errors:[] }; }
export function sampleQueue(stats, depth) { stats.queueSamples.push(Number(depth || 0)); return stats; }
export function averageQueueDepth(stats) { return stats.queueSamples.length ? stats.queueSamples.reduce((a,b)=>a+b,0) / stats.queueSamples.length : 0; }
