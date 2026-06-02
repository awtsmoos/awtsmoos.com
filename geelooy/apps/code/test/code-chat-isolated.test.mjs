// B"H
/**
 * @file code-chat-isolated.test.mjs
 * @brief Isolated tests for native Code Chat file/global scopes.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import { activeFileScope, globalScope, normalizeScope } from '../js/code-chat/scopes.js';
import { CodeChatStore } from '../js/code-chat/store.js';
import { renderCodeChatHtml } from '../js/code-chat/markup.js';

const RESULT_DIR = 'AI_THOUGHTS/2026-06-02-unified-ai-runtime-results';
const RESULT_FILE = `${RESULT_DIR}/code-chat-results.json`;

function installStorage() {
  const memory = new Map();
  globalThis.localStorage = { getItem: k => memory.get(k) || null, setItem: (k, v) => memory.set(k, String(v)) };
}

function testScopes() {
  const file = activeFileScope({ filename: 'a.js', path: '/src/a.js' });
  const global = globalScope();
  assert.equal(file.key, 'file:/src/a.js');
  assert.equal(global.key, 'global:all-workspaces');
  assert.equal(normalizeScope(global).type, 'global');
  return { file, global };
}

function testSeparateMemory() {
  const file = activeFileScope({ filename: 'a.js', path: '/src/a.js' });
  const other = activeFileScope({ filename: 'b.js', path: '/src/b.js' });
  const global = globalScope();
  CodeChatStore.append(file, { role: 'user', text: 'file a' });
  CodeChatStore.append(other, { role: 'user', text: 'file b' });
  CodeChatStore.append(global, { role: 'user', text: 'global' });
  assert.equal(CodeChatStore.get(file).messages[0].text, 'file a');
  assert.equal(CodeChatStore.get(other).messages[0].text, 'file b');
  assert.equal(CodeChatStore.get(global).messages[0].text, 'global');
  assert.notEqual(CodeChatStore.get(file).id, CodeChatStore.get(global).id);
  return { fileCount: CodeChatStore.get(file).messages.length, globalCount: CodeChatStore.get(global).messages.length };
}

function testMarkup() {
  const html = renderCodeChatHtml(globalScope());
  assert.match(html, /Native chat/);
  assert.match(html, /Open global chat/);
  assert.match(html, /Open file chat/);
  assert.doesNotMatch(html, /AI Studio/);
  return { htmlLength: html.length };
}

function writeResults(results) {
  fs.mkdirSync(RESULT_DIR, { recursive: true });
  fs.writeFileSync(RESULT_FILE, JSON.stringify(results, null, 2));
}

try {
  installStorage();
  const results = { createdAt: new Date().toISOString(), scopes: testScopes(), storage: testSeparateMemory(), markup: testMarkup(), ok: true, tests: 3, resultFile: RESULT_FILE };
  writeResults(results);
  console.log(JSON.stringify({ ok: true, tests: results.tests, resultFile: RESULT_FILE }));
} catch (error) {
  writeResults({ ok: false, error: error.message, stack: error.stack, createdAt: new Date().toISOString() });
  console.error(error);
  process.exit(1);
}
