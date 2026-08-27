/* B"H
Benchmark grade: numbers become a plain decision for the editor.
*/
export function gradeBenchmark(result) {
  if (!result.supported) return { grade:'Unavailable', value:'VideoEncoder is not available here.', score:0 };
  const rt = result.realtimeFactor || 0, mbps = result.mbps || 0;
  if (rt >= 2 && mbps <= 12) return { grade:'Excellent', value:'Good value for live preview and export tests.', score:95 };
  if (rt >= 1.15) return { grade:'Good', value:'Worth using; faster than realtime.', score:82 };
  if (rt >= .85) return { grade:'Borderline', value:'Usable for preview, risky for live/export.', score:61 };
  return { grade:'Slow', value:'Not enough value at this size/codec; lower resolution or codec.', score:35 };
}
export function summarizeBenchmark(result) {
  const g = gradeBenchmark(result);
  if (!result.supported) return `${g.grade}: ${g.value}`;
  return `${g.grade}: ${result.encodeFps.toFixed(1)} encode fps, ${result.realtimeFactor.toFixed(2)}× realtime, ${result.mbps.toFixed(2)} Mbps. ${g.value}`;
}
