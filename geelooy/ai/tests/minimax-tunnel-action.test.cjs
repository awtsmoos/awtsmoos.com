#!/usr/bin/env node
// B"H
/**
 * minimax-tunnel-action.test.cjs
 * Tests tunnel fs-actions with MiniMax API streaming.
 */

const path = require('path');

const API_KEY = process.env.MINIMAX_API_KEY || '';
const MINIMAX_ENDPOINT = 'https://api.minimax.io/v1/chat/completions';

function findPublicRoot(start) {
  let dir = start;
  while (dir && dir !== path.dirname(dir)) {
    if (require('fs').existsSync(path.join(dir, 'geelooy/apps/tunnel/agent/main.js'))) return dir;
    dir = path.dirname(dir);
  }
  return null;
}

const REPO_ROOT = findPublicRoot(__dirname);
const { buildActions } = require(path.join(REPO_ROOT, 'geelooy/apps/tunnel/agent/tools/fs/actions.js'));

const TEST_ROOT = path.join(__dirname, '.tmp-minimax-tunnel-test');

async function setup() {
  const fsp = require('fs/promises');
  await fsp.rm(TEST_ROOT, { recursive: true, force: true });
  await fsp.mkdir(TEST_ROOT, { recursive: true });
  await fsp.writeFile(path.join(TEST_ROOT, 'test.txt'), 'B"H test file', 'utf8');
  await fsp.writeFile(path.join(TEST_ROOT, 'package.json'), '{"name":"test","version":"1.0.0"}', 'utf8');
}

function mkConfig() {
  return {
    root: TEST_ROOT,
    allowWrite: true,
    allowSecrets: false,
    tools: { fsRead: true, fsWrite: true, fsBulk: true, fsList: true, fsTree: true }
  };
}

async function runFs(action, payload = {}) {
  const full = { action, ...payload };
  const actions = buildActions(mkConfig(), full, null);
  if (typeof actions[action] !== 'function') throw new Error('Missing action: ' + action);
  return await actions[action]();
}

function skippedMiniMax() {
  return { ok: true, skipped: true, reason: 'MINIMAX_API_KEY not set' };
}

function mergeToolCall(toolCalls, piece) {
  const index = Number.isFinite(piece?.index) ? piece.index : 0;
  if (!toolCalls[index]) {
    toolCalls[index] = { id: '', type: 'function', function: { name: '', arguments: '' } };
  }
  if (piece.id) toolCalls[index].id += piece.id;
  if (piece.type) toolCalls[index].type = piece.type;
  if (piece.function?.name) toolCalls[index].function.name += piece.function.name;
  if (piece.function?.arguments) toolCalls[index].function.arguments += piece.function.arguments;
}

async function streamChat(model, messages, options = {}) {
  if (!API_KEY) return { fullText: '', fullReasoning: '', toolCalls: [], skipped: true };
  const res = await fetch(MINIMAX_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify({
      model,
      messages,
      tools: options.tools,
      tool_choice: options.toolChoice,
      stream: true,
      temperature: 1.0,
      max_tokens: 512,
      extra_body: { reasoning_split: true }
    })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';
  let fullReasoning = '';
  let buffer = '';
  const toolCalls = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop();
    for (const line of lines) {
      const t = line.trim();
      if (!t || t === 'data:[DONE]' || t === 'data: [DONE]' || !t.startsWith('data: ')) continue;
      try {
        const data = JSON.parse(t.substring(6));
        if (data.error) continue;
        const delta = data.choices?.[0]?.delta || {};
        if (delta.content) fullText += delta.content;
        if (delta.reasoning_details?.[0]?.text) fullReasoning += delta.reasoning_details[0].text;
        for (const call of delta.tool_calls || []) mergeToolCall(toolCalls, call);
      } catch (_) {}
    }
  }
  return { fullText, fullReasoning, toolCalls: toolCalls.filter(Boolean) };
}

async function main() {
  const fsp = require('fs/promises');
  await fsp.rm(TEST_ROOT, { recursive: true, force: true }).catch(() => {});
  await setup();

  const results = [];

  const TESTS = [
    ['tunnel:list', async () => {
      const r = await runFs('list', { path: '.' });
      return { ok: r.ok, count: r.items?.length };
    }],
    ['tunnel:read', async () => {
      const r = await runFs('read', { path: 'test.txt', maxChars: 200 });
      return { ok: r.ok, has: r.content?.includes('B"H') };
    }],
    ['tunnel:tree', async () => {
      const r = await runFs('tree', { path: '.', depth: 2 });
      return { ok: r.ok, len: r.treeText?.length };
    }],
    ['tunnel:write', async () => {
      const r = await runFs('write', { path: 'new.txt', content: 'Written by test' });
      return { ok: r.ok };
    }],
    ['tunnel:bulkWrite', async () => {
      const r = await runFs('bulkWrite', { writes: [{ path: 'a.txt', content: 'A' }, { path: 'b.txt', content: 'B' }] });
      return { ok: r.ok, count: r.okCount };
    }],
    ['tunnel:readManyLines', async () => {
      // readManyLines requires ranges array, not lineOffsets
      const r = await runFs('readManyLines', { ranges: [{ path: 'test.txt', startLine: 1, endLine: 10 }] });
      return { ok: r.ok };
    }],
    ['tunnel:stat', async () => {
      const r = await runFs('stat', { path: 'test.txt' });
      return { ok: r.ok };
    }],
    ['tunnel:fileHashes', async () => {
      const r = await runFs('fileHashes', { paths: ['test.txt'] });
      return { ok: r.ok, count: r.files?.length };
    }],
    ['tunnel:astOutline', async () => {
      const r = await runFs('astOutline', { path: 'package.json' });
      return { ok: r.ok || r.error?.includes('not a JavaScript') };
    }],
    ['tunnel:grep', async () => {
      const r = await runFs('grep', { path: '.', query: 'test', caseSensitive: false });
      return { ok: r.ok, matches: r.matches?.length };
    }],
    ['minimax:stream', async () => {
      if (!API_KEY) return skippedMiniMax();
      const { fullText, fullReasoning } = await streamChat('MiniMax-M2.7', [
        { role: 'user', content: 'Say exactly "BH" with no other text.' }
      ]);
      return { ok: fullText.includes('BH'), text: fullText.slice(0, 40), reasoning: fullReasoning.slice(0, 40) };
    }],
    ['minimax:non-stream', async () => {
      if (!API_KEY) return skippedMiniMax();
      const res = await fetch(MINIMAX_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${API_KEY}` },
        body: JSON.stringify({
          model: 'MiniMax-M2.7',
          messages: [{ role: 'user', content: 'Say just "Ok" in one word.' }],
          stream: false,
          max_tokens: 512
        })
      });
      if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
      const json = await res.json();
      const raw = json.choices?.[0]?.message?.content || '';
      // MiniMax non-stream wraps responses in <think>... — strip it
      const stripped = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
      return { ok: /^ok\b/i.test(stripped), text: stripped };
    }],
    ['minimax:tool-call', async () => {
      if (!API_KEY) return skippedMiniMax();
      const tools = [{
        type: 'function',
        function: {
          name: 'noop',
          description: 'A no-operation tunnel action used only to verify MiniMax tool-call transport.',
          parameters: { type: 'object', properties: {}, additionalProperties: false }
        }
      }];
      const { fullText, toolCalls } = await streamChat('MiniMax-M2.7', [
        { role: 'system', content: 'You have access to a "noop" tool. If asked to use it, respond with a tool call.' },
        { role: 'user', content: 'Please call the noop tool with no arguments.' }
      ], { tools, toolChoice: { type: 'function', function: { name: 'noop' } } });
      return { ok: toolCalls.some(call => call.function?.name === 'noop'), text: fullText.slice(0, 80), toolCalls };
    }]
  ];

  const args = process.argv.slice(2);
  const selected = args.includes('all')
    ? TESTS.map(([n]) => n)
    : args.length ? args : TESTS.map(([n]) => n);

  for (const [name, fn] of TESTS) {
    if (!selected.includes(name)) continue;
    process.stdout.write(`${name}... `);
    try {
      const r = await fn();
      console.log(r.ok ? '✓' : '✗', r.error || '');
      results.push({ name, ...r });
    } catch (e) {
      console.log('✗', e.message);
      results.push({ name, ok: false, error: e.message });
    }
  }

  await fsp.rm(TEST_ROOT, { recursive: true, force: true }).catch(() => {});
  const failed = results.filter(r => !r.ok);
  console.log('\n' + JSON.stringify({ ok: failed.length === 0, total: results.length, failed: failed.length, results }, null, 2));
  process.exit(failed.length === 0 ? 0 : 1);
}

main().catch(e => { console.error(e); process.exit(1); });
