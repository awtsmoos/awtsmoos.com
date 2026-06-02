// B"H
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert');

const repo = path.resolve(__dirname, '../..');
const installed = path.join(os.homedir(), '.awtsmoos-tunnel');
const keyFile = path.join(os.homedir(), '.awtsmoos-secrets', 'minimax.key');
const { loadConfig } = require(path.join(installed, 'lib/config.js'));
const { providerKey, providerKeySource } = require(path.join(installed, 'tools/fs/actionGroups/aiAgents/providers.js'));
const { sendAgentMessage } = require(path.join(installed, 'tools/fs/actionGroups/aiAgents/client.js'));
const tasks = require(path.join(installed, 'tools/fs/actionGroups/aiAgents/taskRunner.js'));

/**
 * B"H
 * Chapter 370: Sixteen Living Pages Refused The Mask.
 *
 * This is not a mock harness. It loads a key from outside the repo, calls the
 * real provider once, then runs the real novel orchestra and rejects any file
 * that smells like a fake chapter or placeholder doll.
 */
async function main() {
  const config = realConfig();
  const key = providerKey(config, 'minimax');
  assert(key && key.startsWith('sk-'), 'MiniMax key did not load');
  assert(['configFile', 'defaultFile'].includes(providerKeySource(config, 'minimax')), 'key must come from external file');

  const smoke = await sendAgentMessage(config, {
    provider: 'minimax', agentId: 'minimax-deep', stream: false,
    message: 'Reply with one original sentence about a tunnel of small agents writing a novel. Do not say mocked.'
  });
  assert.strictEqual(smoke.ok, true, 'MiniMax smoke failed: ' + JSON.stringify(smoke));
  assert(smoke.text && smoke.text.length > 20, 'smoke response too short');
  assert(!/mocked chapter|real mocked/i.test(smoke.text), 'smoke returned mock text');

  const outputDir = `AI_THOUGHTS/novel-agent-runs/real-minimax-${Date.now()}`;
  const spawned = tasks.spawnTask(config, {
    kind: 'novelOrchestra', provider: 'minimax', agentId: 'minimax-deep', stream: false,
    chapterCount: 16, outputDir,
    prompt: 'Write a concise actual novel. Each chapter should be 120-180 words, vivid, distinct, and never say mocked or placeholder.'
  });
  assert(spawned.ok && spawned.taskId, 'spawn failed');

  const result = await awaitTask(spawned.taskId, 240);
  assert.strictEqual(result.status, 'complete', 'novel task not complete: ' + JSON.stringify({ status: result.status, error: result.error }));
  const files = (result.output?.files || []).filter(file => /chapter-\d+\.md$/.test(file));
  assert.strictEqual(files.length, 16, 'expected 16 chapter files');
  for (const file of files) verifyChapter(file);

  console.log(JSON.stringify({ ok: true, smokePreview: smoke.text.slice(0, 120), taskId: spawned.taskId, outputDir: path.resolve(repo, outputDir), chapterFiles: files.length }, null, 2));
}

function realConfig() {
  assert(fs.existsSync(keyFile), 'MiniMax key file missing');
  assert(!keyFile.includes('/awtsmoos.com/'), 'key file must stay outside repo');
  const config = loadConfig();
  config.root = repo;
  config.aiAgents = config.aiAgents || {};
  config.aiAgents.providerKeys = {};
  config.aiAgents.providerKeyFiles = { ...(config.aiAgents.providerKeyFiles || {}), minimax: keyFile };
  config.aiAgents.providerTimeoutMs = 20000;
  config.aiAgents.maxTotalTasks = 40;
  config.aiAgents.maxChildrenPerTask = 20;
  config.aiAgents.pollIntervalMs = 1000;
  config.aiAgents.promotionCycles = 0;
  config.aiAgents.allowRecursiveSpawn = false;
  return config;
}

async function awaitTask(taskId, seconds) {
  for (let i = 0; i < seconds; i++) {
    await sleep(1000);
    const status = tasks.status({ taskId });
    if (status.task && ['complete', 'failed'].includes(status.task.status)) return tasks.result({ taskId });
  }
  return tasks.result({ taskId });
}

function verifyChapter(file) {
  const text = fs.readFileSync(file, 'utf8');
  assert(text.length > 300, 'chapter too short: ' + file);
  assert(!/mocked chapter|real mocked|placeholder/i.test(text), 'mock/placeholder text found: ' + file);
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
main().catch(error => { console.error(error.stack || error.message || String(error)); process.exit(1); });
