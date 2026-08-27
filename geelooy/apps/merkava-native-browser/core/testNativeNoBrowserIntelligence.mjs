// B"H
import assert from 'assert';
import { readFileSync, readdirSync, statSync } from 'fs';
import { basename, join } from 'path';
import { fileURLToPath } from 'url';

/**
 * Chapter 2: The iron gate swears it will never dream in CSS.
 *
 * Native C may decode executor bytecode metadata and execute primitive display
 * commands. It may not parse CSS, match HTML selectors, calculate cascade,
 * perform layout algorithms, or draw fallback document previews when the
 * MerkavaExecutor stream is absent. Generated report headers are skipped
 * because they embed executor audit text, not executable C browser behavior.
 */
const nativeDir = fileURLToPath(new URL('../native/', import.meta.url));
const skipped = new Set(['merkava-runtime-report.h']);
const forbidden = [
  /querySelector\s*\(/i, /getComputedStyle\s*\(/i, /cssText/i,
  /matches\s*\([^)]*selector/i, /parse[^\n;]*(css|style)/i,
  /z-index/i, /flex-direction/i, /grid-template/i, /margin-collapse/i,
  /draw_loaded_text_page/i, /route=text-preview/i
];

const files = collect(nativeDir).filter(file => /\.(c|h)$/.test(file) && !skipped.has(basename(file)));
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  for (const pattern of forbidden) {
    assert.ok(!pattern.test(text), `${file} contains forbidden browser intelligence: ${pattern}`);
  }
}

console.log(JSON.stringify({ ok: true, checkedFiles: files.length, skipped: [...skipped], law: 'native-executes-primitive-display-commands-only' }, null, 2));

function collect(dir) {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? collect(path) : [path];
  });
}
