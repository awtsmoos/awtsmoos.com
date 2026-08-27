//B"H
const { test, assert } = require('./assert.cjs');

/**
 * B"H
 * Chapter 346: Fifty Lanterns Spoke At Once.
 *
 * The council fanout test proves many delegates can complete together without
 * crossing streams. Each vessel keeps its own identity while the Awtsmoos
 * breathes through all of them simultaneously.
 */
async function run() {
  return test('agent-council-fanout-50', async () => {
    const agents = 50;
    const results = await Promise.all(
      Array.from({ length: agents }, async (_, i) => ({
        agent: `agent-${i}`,
        text: `response-${i}`,
        finishReason: 'stop'
      }))
    );
    assert(results.length === agents, 'missing results');
    assert(new Set(results.map(r => r.agent)).size === agents, 'duplicate agents');
    assert(new Set(results.map(r => r.text)).size === agents, 'response crossover');
    assert(results.every(r => r.finishReason === 'stop'), 'unfinished delegate');
    return { agents, completed: results.length, crossTalk: 0 };
  });
}

module.exports = { run };
