// B"H
/**
 * @file ai-studio-isolated.test.mjs
 * @brief Real isolated Node tests for unified runtime, chat UX, tools, preview, and live suggestions.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import { routeAwtsmoosAction, runSharedAgent, buildToolManifest } from '../../../shared/awtsmoos-runtime/index.js';
import { computeInsertion } from '../js/ai-studio/typing.js';
import { renderAiStudioHtml } from '../js/ai-studio/markup.js';
import { AiChatStore } from '../js/ai-studio/chat-store.js';
import { appendChatText, buildAutofillPrompt, scrollToBottom, shouldAutoScroll, toolAccessSummary } from '../js/ai-studio/chat-helper.js';
import { FileMemoryStore } from '../js/ai-studio/file-memory.js';
import { importedPaths } from '../js/ai-studio/import-context.js';
import { buildLiveSuggestionPrompt, rememberSuggestion, shouldRequestSuggestion } from '../js/ai-studio/live-engine.js';
import { AiStudioSettings } from '../js/ai-studio/settings.js';
import { renderVirtualDomMarkup, summarizeHtmlToVirtualDom } from '../js/html-preview/webgl-vdom.js';
import { renderMerkavaPreview } from '../js/html-preview/merkava-preview.js';
import { listVirtualFiles, readVirtualFile, writeVirtualFile } from '../../tunnel-control/js/runtime/mesh/virtualFilesystem.js';
import { createRuntimeAdapter } from '../../tunnel-control/js/runtime/mesh/runtimeAdapters.js';

const RESULT_DIR = 'AI_THOUGHTS/2026-06-02-unified-ai-runtime-results';
const RESULT_FILE = `${RESULT_DIR}/isolated-node-results.json`;

function memoryStorage() {
  const memory = new Map();
  return { getItem: k => memory.get(k) || null, setItem: (k, v) => memory.set(k, String(v)), removeItem: k => memory.delete(k) };
}

function installBrowserVessels() { globalThis.localStorage = memoryStorage(); }

async function testVirtualRouting() {
  const write = await routeAwtsmoosAction({ action: 'write', args: { path: '/x.js', content: 'export const x = 7;' }, preferVirtual: true });
  assert.equal(write.ok, true);
  const read = await routeAwtsmoosAction({ action: 'read', args: { path: '/x.js' }, preferVirtual: true });
  assert.equal(read.content, 'export const x = 7;');
  return { write, read };
}

async function testTunnelControlSharedFs() {
  const wrote = writeVirtualFile('/mesh.txt', 'mesh yes');
  assert.equal(readVirtualFile('/mesh.txt').content, 'mesh yes');
  assert.ok(listVirtualFiles('/').some(entry => entry.path === '/mesh.txt'));
  return wrote;
}

async function testRuntimeAdapter() {
  const adapter = createRuntimeAdapter({ id: 'virtual-test', mode: 'virtual-os', mountedCapabilities: { files: true } });
  const result = await adapter.invoke('files.read', { path: '/mesh.txt' });
  assert.equal(result.content, 'mesh yes');
  return result;
}

async function testSharedAgent() {
  const text = await runSharedAgent({
    mode: 'chat', userAsk: 'say hi', contextPrompt: 'File: a.js', modelId: 'MiniMax-M2.7',
    streamChat: async (messages, key, model, tools, onActive, onChunk, onReasoning, onTool, onDone) => {
      assert.equal(model, 'MiniMax-M2.7');
      assert.ok(tools.some(tool => tool.name === 'read'));
      assert.match(messages[0].content, /unified Awtsmoos/);
      onActive?.(); onChunk('hello'); onDone('hello');
    }
  });
  assert.equal(text, 'hello');
  return { text };
}

function testChatStorageAndHelpers() {
  const store = new AiChatStore(memoryStorage(), 'test-chats');
  const chat = store.create('Test chat');
  store.append(chat.id, { role: 'user', text: 'Help me' });
  store.append(chat.id, { role: 'assistant', text: 'B"H yes' });
  assert.equal(store.get(chat.id).messages.length, 2);
  assert.match(buildAutofillPrompt({ filename: 'a.js', ast: { nearestSymbol: 'main' }, selectedText: 'x' }), /main/);
  assert.equal(shouldAutoScroll({ scrollHeight: 1000, scrollTop: 900, clientHeight: 80 }), true);
  const box = { scrollHeight: 77, scrollTop: 0 };
  scrollToBottom(box);
  assert.equal(box.scrollTop, 77);
  assert.match(appendChatText('', 'assistant', 'ok'), /Awtsmoos AI/);
  assert.match(toolAccessSummary(buildToolManifest(['read', 'serverRestart'])), /virtual/);
  return store.get(chat.id);
}

function testLiveSuggestionMemoryAndThrottle() {
  const file = { path: '/src/main.js', name: 'main.js' };
  const settings = { liveEnabled: true, liveMinChars: 5, liveThrottleMs: 1000, liveMemoryLimit: 3, liveConnectedFiles: 2 };
  assert.equal(shouldRequestSuggestion({ lastLength: 10, lastRequestAt: 0, now: 5000 }, settings, '0123456789012345').ok, true);
  assert.equal(shouldRequestSuggestion({ lastLength: 10, lastRequestAt: 4900, now: 5000 }, settings, '0123456789012345').reason, 'throttled');
  assert.ok(importedPaths("import x from './x.js';", '/src/main.js').includes('/src/x.js'));
  rememberSuggestion({ path: file.path, filename: file.name, code: 'import x from "./x.js";', tab: { item: file } }, 'return x;', settings);
  const memory = FileMemoryStore.get({ item: file });
  assert.equal(memory.notes.length, 1);
  assert.match(buildLiveSuggestionPrompt({ filename: 'main.js', path: '/src/main.js', code: 'const a=1;', tab: { item: file } }, settings), /Per-file shared memory/);
  return memory;
}

async function testPreviewNoIframe() {
  const summary = summarizeHtmlToVirtualDom('<html><head><title>T</title></head><body><h1>Hello</h1></body></html>');
  assert.equal(summary.title, 'T');
  assert.match(renderVirtualDomMarkup(summary, { errors: [] }), /canvas/);
  const container = { dataset: {}, innerHTML: '', querySelector: () => null };
  const result = await renderMerkavaPreview(container, { name: 'index.html' }, '<html><body><p>Merkava</p></body></html>', 't1');
  assert.equal(result.usesIframe, false);
  assert.doesNotMatch(container.innerHTML, /<iframe/i);
  return { engine: result.engine, htmlLength: container.innerHTML.length };
}

function testSettingsAndMarkup() {
  const saved = AiStudioSettings.save({ liveEnabled: true, liveModelId: 'MiniMax-M2.7', liveMinChars: 9 });
  assert.equal(saved.liveEnabled, true);
  assert.equal(AiStudioSettings.getLiveModelId(), 'MiniMax-M2.7');
  assert.equal(computeInsertion('abc', 1, 2, 'Z').value, 'aZc');
  const html = renderAiStudioHtml();
  assert.match(html, /Live Typing Suggestions/);
  assert.match(html, /Per-file shared memory/);
  return { ok: true };
}

function writeResults(results) {
  fs.mkdirSync(RESULT_DIR, { recursive: true });
  fs.writeFileSync(RESULT_FILE, JSON.stringify(results, null, 2));
}

async function run() {
  installBrowserVessels();
  const results = {
    createdAt: new Date().toISOString(),
    virtualRouting: await testVirtualRouting(),
    tunnelControlFs: await testTunnelControlSharedFs(),
    runtimeAdapter: await testRuntimeAdapter(),
    sharedAgent: await testSharedAgent(),
    chatStorage: testChatStorageAndHelpers(),
    liveSuggestions: testLiveSuggestionMemoryAndThrottle(),
    preview: await testPreviewNoIframe(),
    settingsAndMarkup: testSettingsAndMarkup(),
    ok: true,
    tests: 8,
    resultFile: RESULT_FILE
  };
  writeResults(results);
  console.log(JSON.stringify({ ok: true, tests: results.tests, resultFile: RESULT_FILE }));
}

run().catch(error => {
  writeResults({ ok: false, error: error.message, stack: error.stack, createdAt: new Date().toISOString() });
  console.error(error);
  process.exit(1);
});
