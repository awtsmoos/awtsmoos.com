// B"H
/**
 * @file progress.mjs
 * @chapter The Heartbeat Speaks From Disk
 * @description
 * Prints the durable Ikar Hebrew index heartbeat. It never opens the target DB,
 * never mutates source files, and derives stopped/running state from the lock
 * plus live PID evidence when available.
 */

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { ROOT } from "./config.mjs";

const TMP_ROOT = path.join(ROOT, ".awtsmoos", "tmp");
const LOCK_PATH = path.join(TMP_ROOT, "ikar-hebrew-index.lock");
const PROGRESS_PATH = path.join(TMP_ROOT, "ikar-hebrew-index-progress.json");

function readJson(file, fallback = null) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; }
}

function processExists(pid) {
  if (!pid) return false;
  try {
    if (process.platform === "win32") {
      const out = execFileSync("powershell.exe", ["-NoProfile", "-Command", `Get-CimInstance Win32_Process -Filter \"ProcessId=${Number(pid)}\" | Select-Object -ExpandProperty CommandLine`], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
      return /ikar_hebrew_index|index_builder\.mjs/.test(out);
    }
    process.kill(Number(pid), 0);
    return true;
  } catch {
    return false;
  }
}

function normalizedProgress() {
  const progress = readJson(PROGRESS_PATH, {});
  const lock = readJson(LOCK_PATH, null);
  const pid = progress.pid || lock?.pid || 0;
  const running = processExists(pid);
  let status = progress.status || "stopped";
  if (status === "running" || status === "packing") status = running ? status : "stopped";
  return {
    runId: progress.runId || lock?.runId || "",
    status,
    currentSeries: progress.currentSeries || "",
    completedSeries: Number(progress.completedSeries || 0),
    totalSeries: Number(progress.totalSeries || 0),
    percent: Number(progress.percent || 0),
    segmentsIndexed: Number(progress.segmentsIndexed || 0),
    tokenRefs: Number(progress.tokenRefs || 0),
    tempShardBytes: Number(progress.tempShardBytes || 0),
    startedAt: progress.startedAt || "",
    updatedAt: progress.updatedAt || "",
    estimatedRemaining: progress.estimatedRemaining || "unknown"
  };
}

console.log(JSON.stringify(normalizedProgress(), null, 2));
