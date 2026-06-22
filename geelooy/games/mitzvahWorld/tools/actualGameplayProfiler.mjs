#!/usr/bin/env node
// B"H
/** Actual Gameplay Profiler: waits for gameplay-ready before FPS sampling. */
import { runActualGameplayProfiler } from './actualGameplay/run.mjs';
import { compactSummary } from './actualGameplay/classify.mjs';

runActualGameplayProfiler().then(report => {
  console.log(JSON.stringify(report, null, 2));
  console.log('B"H Actual gameplay compact summary');
  console.log(JSON.stringify(compactSummary(report), null, 2));
  if (!report.ok) process.exitCode = 1;
}).catch(error => {
  console.error(error);
  process.exitCode = 1;
});
