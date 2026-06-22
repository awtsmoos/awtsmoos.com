// B"H
/** @file runAllPerformanceAudits.js @description ESM runner for all static performance/beauty regression audits. */
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");
const tests = [
  "tests/performance/postLoadFpsSmoke.js",
  "tests/performance/noPixelatedTextureAudit.js",
  "tests/performance/animalLodAndSingleMeshAudit.js",
  "tests/performance/npcSchedulerAudit.js"
];
const results = [];
for (const test of tests) {
  const run = spawnSync(process.execPath, [test], { cwd:root, encoding:"utf8" });
  results.push({ test, ok:run.status === 0, stdout:run.stdout.trim(), stderr:run.stderr.trim() });
  if (run.status !== 0) {
    console.error(JSON.stringify({ ok:false, failed:test, results }, null, 2));
    process.exit(run.status || 1);
  }
}
console.log(JSON.stringify({ ok:true, suite:"runAllPerformanceAudits", results }, null, 2));
