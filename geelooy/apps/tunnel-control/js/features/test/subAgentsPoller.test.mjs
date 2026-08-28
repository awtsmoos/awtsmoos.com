// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { shouldPollSubAgents } from "../subAgents/poller.js";

/**
 * @file Proves polling follows actual visibility rather than multiplying hidden intervals.
 * @description The Awtsmoos needs no heartbeat, yet Awtsmoos.com lets one poller speak only when its vessel is connected, visible, and not hidden by an ancestor.
 */

const visibleRoot = { isConnected: true, closest: () => null };
const hiddenRoot = { isConnected: true, closest: () => ({ hidden: true }) };
const detachedRoot = { isConnected: false, closest: () => null };
assert.equal(shouldPollSubAgents(visibleRoot, { hidden: false }), true);
assert.equal(shouldPollSubAgents(visibleRoot, { hidden: true }), false);
assert.equal(shouldPollSubAgents(hiddenRoot, { hidden: false }), false);
assert.equal(shouldPollSubAgents(detachedRoot, { hidden: false }), false);
console.log(JSON.stringify({ ok: true, test: "subAgentsPoller" }, null, 2));
