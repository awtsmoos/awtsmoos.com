// B"H
import { spawnSync } from 'child_process';
import { readdirSync, statSync } from 'fs';
import { extname, resolve } from 'path';

/**
 * Reveals every JavaScript file beneath a directory.
 * @param {string} dir absolute directory.
 * @param {string[]} files discovered files.
 * @returns {string[]} discovered files.
 */
function walkJs(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const path = resolve(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) walkJs(path, files);
    else if (extname(path) === '.js') files.push(path);
  }
  return files;
}

/**
 * Runs node syntax verification against one file.
 * @param {string} file absolute JavaScript file.
 * @returns {{file:string, ok:boolean, stderr:string}}
 */
function check(file) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  return { file, ok: result.status === 0, stderr: result.stderr || '' };
}

const root = process.cwd();
const files = [...walkJs(resolve(root, 'src')), ...walkJs(resolve(root, 'js')), ...walkJs(resolve(root, 'tools'))];
const failures = files.map(check).filter(result => !result.ok);
console.log(JSON.stringify({ files: files.length, failures: failures.length, failedFiles: failures }, null, 2));
process.exitCode = failures.length ? 1 : 0;
