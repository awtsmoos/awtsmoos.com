// B"H
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { dirname, extname, resolve } from 'path';

/**
 * Walks JavaScript vessels beneath the given directory.
 * @param {string} dir absolute directory path.
 * @param {string[]} files accumulator receiving discovered files.
 * @returns {string[]} discovered JavaScript files.
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
 * Returns true when an import target can resolve as file or index module.
 * @param {string} target absolute unresolved target path.
 * @returns {boolean} whether the module exists.
 */
function moduleExists(target) {
  return [target, `${target}.js`, resolve(target, 'index.js')].some(existsSync);
}

/**
 * Scans one file for relative import specifiers and records missing edges.
 * @param {string} file absolute JavaScript file path.
 * @param {string} root repository root.
 * @returns {string[]} missing import descriptions.
 */
function scanFile(file, root) {
  const text = readFileSync(file, 'utf8');
  const misses = [];
  const rx = /import\s+(?:[^'\"]+?\s+from\s+)?["']([^"']+)["']|import\(["']([^"']+)["']\)/g;
  let match;
  while ((match = rx.exec(text))) {
    const spec = match[1] || match[2];
    if (!spec.startsWith('.')) continue;
    const target = resolve(dirname(file), spec);
    if (!moduleExists(target)) misses.push(`${file.slice(root.length + 1)} -> ${spec}`);
  }
  return misses;
}

const root = process.cwd();
const files = [
  ...walkJs(resolve(root, 'src')),
  ...walkJs(resolve(root, 'js')),
  ...walkJs(resolve(root, 'tools'))
];
const missing = files.flatMap(file => scanFile(file, root));
console.log(JSON.stringify({ files: files.length, missing: missing.length, misses: missing }, null, 2));
process.exitCode = missing.length ? 1 : 0;
