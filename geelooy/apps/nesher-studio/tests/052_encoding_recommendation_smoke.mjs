import assert from 'node:assert/strict';
import { buildBenchmarkRecommendation } from '../modules/encodingBenchmark/benchmarkRecommendation.js';
import { formatBenchmarkMatrix, publicMatrixJson } from '../modules/encodingBenchmark/benchmarkReport.js';
import { summarizeMatrix, valueScore } from '../modules/encodingBenchmark/benchmarkMatrix.js';

const results = [
  { id:'slow', label:'Slow 360p', supported:true, encodeFps:20, realtimeFactor:.66, mbps:3, width:640, height:360, fps:30, codec:'vp8', bytes:1024, chunks:2 },
  { id:'fast', label:'Fast 720p', supported:true, encodeFps:90, realtimeFactor:3, mbps:7, width:1280, height:720, fps:30, codec:'vp8', bytes:4096, chunks:4 },
  { id:'none', label:'Missing', supported:false, reason:'no encoder' }
];
const detail = buildBenchmarkRecommendation(results);
assert.equal(detail.best.id, 'fast');
assert.ok(detail.warnings.some(w => w.includes('Slow')));
const matrix = summarizeMatrix(results);
assert.equal(matrix.recommendationDetail.best.id, 'fast');
assert.ok(valueScore(results[1]) > valueScore(results[0]));
assert.match(formatBenchmarkMatrix(matrix), /Use Fast 720p/);
assert.equal(publicMatrixJson(matrix).best.id, 'fast');
console.log('B"H encoding recommendation smoke passed');
