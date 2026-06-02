// B"H
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { spawnTask, status, result } = require('../../geelooy/apps/tunnel/agent/tools/fs/actionGroups/aiAgents/taskRunner.js');

/**
 * B"H
 * Chapter 375: The Painted Provider Counted The Eight Real Breaths.
 *
 * This does not pretend to be a real novel. It proves the machinery: sixteen
 * chapter delegates spawn, and each delegate invokes its provider eight times,
 * leaving pass metadata and a manifest that exposes the true cycle count.
 */
async function main() {
  const oldFetch = global.fetch;
  let calls = 0;
  global.fetch = async (_url, request) => {
    calls += 1;
    const body = JSON.parse(request.body);
    const text = body.messages.map(m => m.content).join('\n');
    const chapter = (text.match(/chapter (\d+) of/i) || [null, '1'])[1];
    const cycle = (text.match(/cycle (\d+) of/i) || [null, '1'])[1];
    const content = `Chapter ${chapter} cycle ${cycle}. ` + 'Living prose expands through the Awtsmoos tunnel. '.repeat(Number(cycle) + 8);
    return { ok: true, status: 200, json: async () => ({ choices: [{ message: { content } }] }), text: async () => 'ok' };
  };
  try {
    const outputDir = 'AI_THOUGHTS/novel-agent-runs/mock-cycle-8-' + Date.now();
    const config = {
      root: path.resolve(__dirname, '../..'),
      aiAgents: {
        providerKeys: { minimax: 'dummy' },
        maxTotalTasks: 40,
        maxChildrenPerTask: 20,
        pollIntervalMs: 50,
        promotionCycles: 0,
        agentCycles: 8,
        chapterCycles: 8,
        allowRecursiveSpawn: false
      }
    };
    const spawned = spawnTask(config, { kind: 'novelOrchestra', provider: 'minimax', agentId: 'minimax-deep', stream: false, chapterCount: 16, outputDir, chapterCycles: 8, prompt: 'Write a real chapter.' });
    const done = await wait(spawned.taskId, 120);
    assert.strictEqual(done.status, 'complete', JSON.stringify(done.error || done.task?.error));
    const manifest = JSON.parse(fs.readFileSync(path.join(config.root, outputDir, 'manifest.json'), 'utf8'));
    assert.strictEqual(manifest.childTaskIds.length, 16, 'child count');
    assert.strictEqual(manifest.chapterCycles, 8, 'manifest cycles');
    assert.strictEqual(calls, 16 * 8, 'provider calls');
    for (const chapter of manifest.chapters) assert.strictEqual(chapter.cycles, 8, 'chapter cycles');
    console.log(JSON.stringify({ ok: true, calls, childTasks: manifest.childTaskIds.length, chapterCycles: manifest.chapterCycles, outputDir }, null, 2));
  } finally {
    global.fetch = oldFetch;
  }
}

async function wait(taskId, seconds) {
  for (let i = 0; i < seconds * 20; i++) {
    await new Promise(resolve => setTimeout(resolve, 50));
    const got = status({ taskId });
    if (got.task && ['complete', 'failed'].includes(got.task.status)) return result({ taskId });
  }
  return result({ taskId });
}

main().catch(error => { console.error(error.stack || error.message); process.exit(1); });
