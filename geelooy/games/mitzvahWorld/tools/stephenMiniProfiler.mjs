#!/usr/bin/env node
// B"H
/**
 * Stephen Mini Profiler: tiny entrance, split organs.
 * Results are always written outside the repo under /tmp.
 */
import { runStephen } from './stephen/run.mjs';
import { compactSummary } from './stephen/classify.mjs';

runStephen().then(report => {
  console.log(JSON.stringify(report, null, 2));
  console.log('B"H Stephen compact summary');
  console.log(JSON.stringify(compactSummary(report), null, 2));
  if (!report.ok) process.exitCode = 1;
}).catch(error => {
  console.error(error);
  process.exitCode = 1;
});
