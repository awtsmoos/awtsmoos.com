// B"H
import assert from "node:assert/strict";
import { runLongRunScenario } from "../helpers/longRun/LongRunScenario.js";
import { writeLongRunReports } from "../helpers/longRun/LongRunReportWriter.js";
import { longRunDir } from "../helpers/visualProof/VisualProofPaths.js";

const result = runLongRunScenario({ repeats:10, count:48 });
const report = await writeLongRunReports(longRunDir, result.report, result.recorder);

assert.equal(report.qualityReduced, false, "quality was not reduced");
assert(report.durationSimulatedMs >= 180000, "3-minute equivalent action run completed");
assert.equal(report.violations.length, 0, `no long-run violations: ${JSON.stringify(report.violations)}`);
assert(report.blockedCollisions > 0, "long run includes real blocked collisions");
assert(report.triggerEvents > 0, "long run includes trigger events");
console.log("B'H liveLongRunGameplayActionsSmoke passed", report);
