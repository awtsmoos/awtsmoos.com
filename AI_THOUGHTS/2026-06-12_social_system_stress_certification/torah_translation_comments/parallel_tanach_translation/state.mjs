//B"H
/**
 * @module translationState
 * @description Logs and audit state: memory beside the authoritative comments.
 */
import fs from 'node:fs';
import path from 'node:path';
import { LOG_PATH, RUN_DIR, STATE_PATH } from './config.mjs';

export function prepareRun(batchId) {
  fs.mkdirSync(RUN_DIR, { recursive: true });
  fs.writeFileSync(LOG_PATH, '');
  const dir = path.join(RUN_DIR, batchId);
  fs.mkdirSync(path.join(dir, 'minimax'), { recursive: true });
  return dir;
}

export function log(line, data) {
  const rendered = data === undefined ? line : `${line} ${JSON.stringify(data)}`;
  console.log(rendered);
  fs.appendFileSync(LOG_PATH, `${new Date().toISOString()} ${rendered}\n`);
}

export function readState() {
  try { return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8')); }
  catch { return { runs: [] }; }
}

export function writeState(state) {
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

export function saveJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2));
}

export function chapterSlug(job) {
  return `${job.series}_chapter_${String(job.chapter).padStart(3, '0')}`;
}
