// B"H
/**
 * @file import-context.js
 * @brief Lightweight connected-file discovery for live AI suggestions.
 *
 * @description
 * The live helper reads the current file and a small ring of directly imported
 * siblings. It does not wander endlessly; it brings nearby lamps, not a flood.
 */

import { State } from '../state.js';

const IMPORT_RE = /(?:import\s+(?:[^'";]+\s+from\s+)?|export\s+[^'";]+\s+from\s+|import\()(['"])(\.{1,2}\/[^'"]+)\1/g;

function dirname(path = '') { return String(path).split('/').slice(0, -1).join('/') || '/'; }
function normalize(path = '') {
  const out = [];
  String(path).split('/').forEach(part => {
    if (!part || part === '.') return;
    if (part === '..') out.pop();
    else out.push(part);
  });
  return '/' + out.join('/');
}

export function importedPaths(code = '', filePath = '') {
  const base = dirname(filePath);
  const found = [];
  for (const match of String(code || '').matchAll(IMPORT_RE)) {
    const raw = match[2];
    const resolved = normalize(base + '/' + raw);
    found.push(resolved, resolved + '.js', resolved + '.mjs', resolved + '/index.js');
  }
  return [...new Set(found)];
}

export function connectedOpenTabs(code = '', filePath = '', limit = 3) {
  const wanted = new Set(importedPaths(code, filePath));
  return State.tabs
    .filter(tab => wanted.has(tab.item?.path) || wanted.has(tab.item?.path?.replace(/\.[^.]+$/, '')))
    .slice(0, limit)
    .map(tab => ({ path: tab.item?.path || tab.item?.name, name: tab.item?.name, content: String(tab.content || '').slice(0, 5000) }));
}

export function connectedContextText(code = '', filePath = '', limit = 3) {
  const tabs = connectedOpenTabs(code, filePath, limit);
  if (!tabs.length) return 'No connected open tabs found.';
  return tabs.map(tab => `Connected file: ${tab.path}\n${tab.content}`).join('\n\n---\n\n');
}
