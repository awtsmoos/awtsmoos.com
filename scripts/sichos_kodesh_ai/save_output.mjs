// B"H
/**
 * Output writer for the external artifact garden.
 * The repo keeps only the runner; the test fruits ripen outside the orchard wall.
 */
import fs from 'fs';
import path from 'path';

export const DEFAULT_OUTPUT_ROOT = '/Users/awtsmoos/Documents/Awtsmoos/docs/torah/sichos-kodesh-ai';

export function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2));
}

export function writeText(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, String(value));
}

export function makeRunDir(root = DEFAULT_OUTPUT_ROOT) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dir = path.join(root, 'tests', `tiny-deepseek-${stamp}`);
  for (const sub of ['raw', 'responses', 'output', 'logs', 'checkpoints']) {
    fs.mkdirSync(path.join(dir, sub), { recursive: true });
  }
  return dir;
}
