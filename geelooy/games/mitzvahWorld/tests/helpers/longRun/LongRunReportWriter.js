// B"H
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export async function writeJsonReport(file, value) {
  await mkdir(dirname(file), { recursive:true });
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  return value;
}

export async function writeLongRunReports(baseDir, report, recorder) {
  await writeJsonReport(`${baseDir}/fullGameplayLongRunReport.json`, report);
  await writeJsonReport(`${baseDir}/fullGameplayFrameTimes.json`, recorder.frames);
  await writeJsonReport(`${baseDir}/fullGameplayActions.json`, recorder.actions);
  await writeJsonReport(`${baseDir}/fullGameplayViolations.json`, recorder.violations);
  return report;
}

export default { writeJsonReport, writeLongRunReports };
