import assert from 'node:assert/strict';
import { bouncingBall } from '../modules/encodingBenchmark/bouncingBallFrame.js';
import { gradeBenchmark, summarizeBenchmark } from '../modules/encodingBenchmark/benchmarkGrade.js';
import { formatBenchmarkMatrix } from '../modules/encodingBenchmark/benchmarkReport.js';
import { summarizeMatrix, valueScore } from '../modules/encodingBenchmark/benchmarkMatrix.js';
const spec = { width:640, height:360, frames:90 };
const a = bouncingBall(spec, 0), b = bouncingBall(spec, 45);
assert.notEqual(a.x, b.x); assert.ok(a.r > 0);
assert.equal(gradeBenchmark({ supported:false }).grade, 'Unavailable');
assert.equal(gradeBenchmark({ supported:true, realtimeFactor:2.5, mbps:5 }).grade, 'Excellent');
assert.match(summarizeBenchmark({ supported:true, realtimeFactor:1.2, encodeFps:36, mbps:2.1 }), /Good/);
const matrix = summarizeMatrix([sample('fast', 4), sample('slow', .7)]);
assert.equal(matrix.best.id, 'fast'); assert.ok(valueScore(matrix.best) > valueScore(matrix.results[1]));
assert.match(formatBenchmarkMatrix(matrix), /Use fast/);
console.log('B"H encoding benchmark smoke passed');
function sample(id, rt) { return { id, label:id, supported:true, realtimeFactor:rt, encodeFps:rt * 30, mbps:2, width:640, height:360, fps:30, bytes:1000, chunks:30, codec:'vp8', grade:gradeBenchmark({ supported:true, realtimeFactor:rt, mbps:2 }) }; }
