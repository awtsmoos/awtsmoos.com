// B"H
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const Chat = require('/Users/awtsmoos/.awtsmoos-tunnel/tools/chatgpt/index.js');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'hour-loop-reg-'));
const actions = Chat.buildChatGptActions({ payload: { base: tmp, conversationUrl: 'https://chatgpt.com/c/abc123', goal: 'test loop' } });
assert(actions.chatgptHourLoopStart);
assert(actions.chatgptHourLoopTick);
assert(actions.chatgptHourLoopMenu);
(async () => {
  const started = await actions.chatgptHourLoopStart();
  assert.equal(started.ok, true);
  const statusActions = Chat.buildChatGptActions({ payload: { base: tmp, conversationId: 'abc123' } });
  const status = await statusActions.chatgptHourLoopStatus();
  assert.equal(status.queued, 1);
  const menu = await statusActions.chatgptHourLoopMenu();
  assert(menu.buttons.length >= 4);
  console.log(JSON.stringify({ ok: true, suite: 'hourLoop registry', queued: status.queued, buttons: menu.buttons.length }));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
