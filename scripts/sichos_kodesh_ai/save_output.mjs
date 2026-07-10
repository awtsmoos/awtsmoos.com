// B"H
/**
 * Output writer for the external artifact garden.
 *
 * The repository keeps only the narrow runner. The fruits of the test ripen
 * beyond its wall, where no production database hears the footsteps.
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
  for (const sub of ['raw', 'responses', 'output', 'logs', 'checkpoints', 'validation']) {
    fs.mkdirSync(path.join(dir, sub), { recursive: true });
  }
  return dir;
}
