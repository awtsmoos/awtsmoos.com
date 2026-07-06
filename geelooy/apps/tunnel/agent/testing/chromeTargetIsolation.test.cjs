// B"H
const assert = require('assert');
const Cdp = require('../tools/chrome/cdp.js');
const Actions = require('../tools/chrome/actions.js');
const { ACTIONS } = require('../tools/chrome/index.js');
const Priority = require('../lib/runtime/priority.js');

const pages = [
  { id: 'page-a', type: 'page', url: 'https://a.example/', title: 'A', webSocketDebuggerUrl: 'ws://a' },
  { id: 'page-b', type: 'page', url: 'https://b.example/', title: 'B', webSocketDebuggerUrl: 'ws://b' },
  { id: 'page-c', type: 'page', url: 'about:blank', title: '', webSocketDebuggerUrl: 'ws://c' }
];

const scopeA = { browserSessionId: 'browser-a', roomId: 'room-a', missionId: 'mission-a', agentSessionId: 'session-a', logicalAgentId: 'agent-a' };
const scopeB = { browserSessionId: 'browser-b', roomId: 'room-b', missionId: 'mission-b', agentSessionId: 'session-b', logicalAgentId: 'agent-b' };

assert.equal(Cdp.targetScopeKey(scopeA), 'browser-a::room-a::mission-a::session-a::agent-a');
Cdp.leaseTarget('page-a', scopeA);
Cdp.leaseTarget('page-b', scopeB);

assert.equal(Cdp.canUseTarget('page-a', scopeA), true);
assert.equal(Cdp.canUseTarget('page-a', scopeB), false);
assert.equal(Cdp.choosePage(pages, scopeA).id, 'page-a');
assert.equal(Cdp.choosePage(pages, scopeB).id, 'page-b');
assert.equal(Cdp.choosePage(pages, { ...scopeB, chromeTargetId: 'page-a' }), null);
assert.equal(Cdp.choosePage(pages, { ...scopeB, chromeTargetId: 'page-a', force: true }).id, 'page-a');

Cdp.leaseTarget('page-c', { ...scopeA, shared: true });
assert.equal(Cdp.canUseTarget('page-c', scopeB), true);

const lease = Cdp.targetLease('page-a');
assert.equal(Actions.leaseMatches(lease, scopeA), true);
assert.equal(Actions.leaseMatches(lease, scopeB), false);
assert.equal(Actions.targetOptions({ pageId: 'p1', logicalAgentId: 'agent-x' }).chromeTargetId, 'p1');

assert.equal(typeof ACTIONS.chromeTargets, 'function');
assert.equal(typeof ACTIONS.chromeNewPage, 'function');
assert.equal(typeof ACTIONS.chromeClosePage, 'function');
assert.equal(Priority.laneForAction('chromeTargets', 'chrome'), Priority.LANES.P0);
assert.equal(Priority.laneForAction('chromeClosePage', 'chrome'), Priority.LANES.P0);

console.log(JSON.stringify({ ok: true, suite: 'chrome-target-isolation' }, null, 2));
