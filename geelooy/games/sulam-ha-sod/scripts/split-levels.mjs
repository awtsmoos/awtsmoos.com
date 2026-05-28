// B"H
import { mkdirSync, writeFileSync } from 'node:fs';
import { LEVELS } from '../js/data/levels.js';

const dir = new URL('../js/data/levels/', import.meta.url);
mkdirSync(dir, { recursive: true });
const header = `// B"H
/**
 * Hand-authored Sulam HaSod chamber data.
 * This file is intentionally plain data: no engine imports, no side effects.
 */
`;

for (const [i, level] of LEVELS.entries()) {
  const n = String(i + 1).padStart(2, '0');
  const name = `level${n}`;
  writeFileSync(new URL(`${name}.js`, dir), `${header}export const ${name} = ${JSON.stringify(level, null, 2)};\n`);
}

const imports = LEVELS.map((_, i) => {
  const n = String(i + 1).padStart(2, '0');
  return `import { level${n} } from './levels/level${n}.js';`;
}).join('\n');
const list = LEVELS.map((_, i) => `level${String(i + 1).padStart(2, '0')}`).join(', ');
writeFileSync(new URL('../js/data/levels.js', import.meta.url), `// B"H
/** Ten separately-authored Kabbalistic chambers, each in its own data file. */
${imports}

export const LEVELS = [${list}];
`);
console.log(JSON.stringify({ wrote: LEVELS.length }));
