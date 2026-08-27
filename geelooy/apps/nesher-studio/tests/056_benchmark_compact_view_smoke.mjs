import assert from 'node:assert/strict';
import { formatCompactBenchmarkRecommendation } from '../modules/encodingBenchmark/benchmarkCompactView.js';
import { summarizeMatrix } from '../modules/encodingBenchmark/benchmarkMatrix.js';

const matrix = summarizeMatrix([
  { id:'slow', label:'Slow 360p', supported:true, encodeFps:20, realtimeFactor:.66, mbps:3, width:640, height:360, fps:30, codec:'vp8', bytes:1024, chunks:2 },
  { id:'fast', label:'VP9 360p compression check', supported:true, encodeFps:161.6, realtimeFactor:5.39, mbps:2.2, width:640, height:360, fps:30, codec:'vp09', bytes:90000, chunks:4 },
  { id:'none', label:'Missing codec', supported:false, reason:'no encoder' }
]);
const compact = formatCompactBenchmarkRecommendation(matrix);
assert.match(compact, /Recommendation:/);
assert.match(compact, /Best codec: vp09 640×360/);
assert.match(compact, /Ranked:/);
assert.match(compact, /Warning: Slow 360p is below realtime/);
assert.ok(compact.indexOf('VP9 360p') < compact.indexOf('Slow 360p'));
console.log('B"H benchmark compact view smoke passed');
