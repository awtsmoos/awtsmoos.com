// B"H
import { existsSync, readdirSync, statSync, readFileSync } from 'fs';
import { extname, join } from 'path';

/** Walks a directory tree and returns exact files. */
export function walk(dir, files = []) {
  if (!existsSync(dir)) return files;
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) walk(path, files);
    else files.push(path);
  }
  return files;
}

/** Finds files by extension under many roots. */
export function filesByExt(ext, roots = ['src']) {
  return roots.flatMap(root => walk(root)).filter(file => extname(file) === ext).sort();
}

/** Reads UTF-8 text safely for verifier modules. */
export function readText(file) {
  return readFileSync(file, 'utf8');
}

/** Simple test wrapper returning a stable report object. */
export function asResult(name, fn) {
  try {
    const data = fn();
    return { name, ok: data.ok !== false, ...data };
  } catch (error) {
    return { name, ok: false, error: String(error?.stack || error) };
  }
}
