// B"H
/**
 * @file awtsmoos_jobs_status.mjs
 * @chapter The Two Rivers Report Their Breath
 * @description
 * Prints one JSON status object for Ikar indexing and Tanach translation. It
 * reads durable progress/checkpoint/log artifacts and the live process table so
 * later checks do not require remembering PIDs by hand.
 */

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const IKAR_PROGRESS = path.join(ROOT, ".awtsmoos", "tmp", "ikar-hebrew-index-progress.json");
const TANACH_STATE = path.join(ROOT, "AI_THOUGHTS/2026-06-12_social_system_stress_certification/torah_translation_comments/parallel_tanach_translation_state.json");
const TANACH_LOG = path.join(ROOT, ".logs", "tanach-provider-2500.out.log");
const TANACH_LOG_500 = path.join(ROOT, ".logs", "tanach-provider-500.out.log");
const TANACH_ERR = path.join(ROOT, ".logs", "tanach-provider-2500.err.log");
const INDEX_ERR = path.join(ROOT, ".logs", "ikar-hebrew-index.err.log");

function readJson(file, fallback = null) { try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; } }
function readText(file) { try { return fs.readFileSync(file, "utf8"); } catch { return ""; } }
function stat(file) { try { const s = fs.statSync(file); return { bytes: s.size, updatedAt: s.mtime.toISOString() }; } catch { return { bytes: 0, updatedAt: "" }; } }

function processes() {
  try {
    const ps = execFileSync("powershell.exe", ["-NoProfile", "-Command", "Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'node.exe' -and $_.CommandLine -match 'index_builder|provider_tanach_run' } | Select-Object ProcessId,CommandLine | ConvertTo-Json -Compress"], { encoding: "utf8" }).trim();
    const parsed = ps ? JSON.parse(ps) : [];
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch { return []; }
}

function verifiedWrites(logText) {
  const ids = [];
  const re = /BH_(\d+)_commentBy_torah_translation_en_/g;
  let match;
  while ((match = re.exec(logText))) ids.push(Number(match[1]));
  const recent = ids.slice(-240);
  const span = recent.length > 1 ? (recent.at(-1) - recent[0]) / 1000 : 0;
  return { count: ids.length, recentSample: recent.length, spanSeconds: Number(span.toFixed(1)), versesPerMinute: span ? Number((recent.length / span * 60).toFixed(1)) : 0 };
}

function fatalSignals(...texts) {
  return texts.join("\n").split(/\r?\n/).filter(line => /database already|active exclusive writer|fatal crash|ELOCK|IKAR_INDEX_ALREADY_RUNNING/i.test(line)).slice(-20);
}

const live = processes();
const ikarProgress = readJson(IKAR_PROGRESS, {});
const tanachState = readJson(TANACH_STATE, {});
const tanachLog = readText(fs.existsSync(TANACH_LOG) ? TANACH_LOG : TANACH_LOG_500);
const tanachErr = readText(TANACH_ERR);
const indexErr = readText(INDEX_ERR);
const lastRun = tanachState.runs?.at?.(-1) || {};

console.log(JSON.stringify({
  checkedAt: new Date().toISOString(),
  processes: live.map(p => ({ pid: p.ProcessId, command: p.CommandLine })),
  ikar: {
    live: live.some(p => /index_builder\.mjs/.test(p.CommandLine || "")),
    progress: ikarProgress,
    indexErr: stat(INDEX_ERR)
  },
  tanach: {
    live: live.some(p => /provider_tanach_run\.mjs/.test(p.CommandLine || "")),
    checkpoint: { ...stat(TANACH_STATE), runs: tanachState.runs?.length || 0, lastRun: lastRun.batchId || "", providerCount: lastRun.providers?.length || 0, maxParallel: lastRun.options?.maxParallel, force: lastRun.options?.force, resume: lastRun.options?.resume, chunkVerses: lastRun.options?.chunkVerses },
    verifiedWrites: verifiedWrites(tanachLog),
    stdout: stat(fs.existsSync(TANACH_LOG) ? TANACH_LOG : TANACH_LOG_500),
    stderr: stat(TANACH_ERR)
  },
  fatalSignals: fatalSignals(tanachLog, tanachErr, indexErr)
}, null, 2));
