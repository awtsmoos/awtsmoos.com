// B"H
/**
 * @file code-ui-route-isolated.test.mjs
 * @brief Isolated route tests for Code UI wiring when Chrome is unavailable.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';

const RESULT_DIR = 'AI_THOUGHTS/2026-06-02-unified-ai-runtime-results';
const RESULT_FILE = `${RESULT_DIR}/code-ui-route-results.json`;

function read(path) { return fs.readFileSync(path, 'utf8'); }
function assertHas(text, pattern, label) { assert.match(text, pattern, label); }
function assertNotHas(text, pattern, label) { assert.doesNotMatch(text, pattern, label); }

function testActionRegistry() {
  const fileCommand = read('geelooy/apps/code/js/actions/commands/open-code-chat-file.js');
  const globalCommand = read('geelooy/apps/code/js/actions/commands/open-code-chat-global.js');
  const legacy = read('geelooy/apps/code/js/actions/commands/open-ai-studio.js');
  assertHas(fileCommand, /code-chat\/index\.js/, 'file chat command targets Code Chat');
  assertHas(globalCommand, /code-chat\/index\.js/, 'global chat command targets Code Chat');
  assertHas(legacy, /CodeChat\.openFile/, 'legacy Studio command aliases to file Code Chat');
  return { ok: true };
}

function testMenuAndPalette() {
  const menu = read('geelooy/apps/code/js/menus/main.js');
  const palette = read('geelooy/apps/code/js/command-palette/commands.js');
  assertHas(menu, /Code Chat: This File/, 'main menu exposes file Code Chat');
  assertHas(menu, /Code Chat: All Workspaces/, 'main menu exposes global Code Chat');
  assertHas(menu, /Vibe Code/, 'main menu still exposes Vibe Code separately');
  assertHas(palette, /Tool: Code Chat for This File/, 'palette exposes file Code Chat');
  assertHas(palette, /Tool: Code Chat for All Workspaces/, 'palette exposes global Code Chat');
  return { ok: true };
}

async function testCodeChatPureMarkup() {
  const { renderCodeChatHtml } = await import('../js/code-chat/markup.js');
  const { globalScope } = await import('../js/code-chat/scopes.js');
  const html = renderCodeChatHtml(globalScope());
  assertHas(html, /Native chat/, 'native chat subtitle');
  assertHas(html, /Open file chat/, 'file switch action');
  assertHas(html, /Open global chat/, 'global switch action');
  return { ok: true, htmlLength: html.length };
}

function testPreviewNoCreatedIframe() {
  const previewManager = read('geelooy/apps/code/js/editor/preview-manager.js');
  const merkavaPreview = read('geelooy/apps/code/js/html-preview/merkava-preview.js');
  assertNotHas(previewManager, /createElement\(['"]iframe['"]\)/, 'PreviewManager must not create iframe');
  assertHas(previewManager, /renderMerkavaPreview/, 'PreviewManager uses Merkava preview renderer');
  assertHas(merkavaPreview, /usesIframe: false/, 'Merkava preview reports no iframe usage');
  return { ok: true };
}

function testStaticHtmlRoute() {
  const html = read('geelooy/apps/code/index.html');
  assertHas(html, /id="main-menu-btn"/, 'main menu button exists');
  assertHas(html, /id="previewer"/, 'preview container exists');
  assertHas(html, /js\/main\.js/, 'main module loaded');
  return { ok: true, bytes: html.length };
}

async function run() {
  const results = {
    createdAt: new Date().toISOString(),
    actionRegistry: testActionRegistry(),
    menuAndPalette: testMenuAndPalette(),
    codeChat: await testCodeChatPureMarkup(),
    preview: testPreviewNoCreatedIframe(),
    staticHtml: testStaticHtmlRoute(),
    ok: true,
    tests: 5
  };
  fs.mkdirSync(RESULT_DIR, { recursive: true });
  fs.writeFileSync(RESULT_FILE, JSON.stringify(results, null, 2));
  console.log(JSON.stringify({ ok: true, tests: results.tests, resultFile: RESULT_FILE }));
}

run().catch(error => {
  fs.mkdirSync(RESULT_DIR, { recursive: true });
  fs.writeFileSync(RESULT_FILE, JSON.stringify({ ok: false, error: error.message, stack: error.stack, createdAt: new Date().toISOString() }, null, 2));
  console.error(error);
  process.exit(1);
});
