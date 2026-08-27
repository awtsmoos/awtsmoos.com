// B"H
import { existsSync, readdirSync } from 'fs';
import { dirname, join, normalize } from 'path';
import { readText, asResult } from './walk.js';

function importedCss(entry) {
  const seen = new Set();
  const missing = [];
  const duplicates = [];

  function visit(file) {
    if (!existsSync(file)) {
      missing.push(file);
      return;
    }
    if (seen.has(file)) return;
    seen.add(file);

    const local = [];
    for (const m of readText(file).matchAll(/@import\s+['"]([^'"]+)['"]/g)) {
      const next = normalize(join(dirname(file), m[1]));
      if (local.includes(next)) duplicates.push({ file, next });
      local.push(next);
      visit(next);
    }
  }

  visit(entry);
  return { seen, missing, duplicates };
}

function braceProblems(files) {
  const problems = [];
  for (const file of files) {
    let depth = 0;
    [...readText(file)].forEach((ch, index) => {
      if (ch === '{') depth += 1;
      if (ch === '}') depth -= 1;
      if (depth < 0) problems.push({ file, index, kind: 'extra-close' });
    });
    if (depth !== 0) problems.push({ file, depth, kind: 'unbalanced' });
  }
  return problems;
}

export function cssGraphCheck() {
  return asResult('css-graph', () => {
    const allCss = readdirSync('src', { recursive: true })
      .filter(file => String(file).endsWith('.css'))
      .map(file => 'src/' + file)
      .sort();
    const graph = importedCss('src/index.css');
    const unreferenced = allCss.filter(file => !graph.seen.has(file));
    const braces = braceProblems(allCss);
    return {
      ok: graph.missing.length === 0 && unreferenced.length === 0 && graph.duplicates.length === 0 && braces.length === 0,
      cssFiles: allCss.length,
      imported: graph.seen.size,
      missing: graph.missing,
      unreferenced,
      duplicates: graph.duplicates,
      braceProblems: braces
    };
  });
}
