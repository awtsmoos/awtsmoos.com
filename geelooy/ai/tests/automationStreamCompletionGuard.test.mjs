//B"H
import assert from "node:assert/strict";
import { AutomationStreamCompletionGuard } from "../js/automation/streamCompletionGuard.js";

let clock = 1000;
const sleeps = [];
const guard = new AutomationStreamCompletionGuard({
  now: () => clock,
  sleep: async ms => { sleeps.push(ms); clock += ms; }
});

guard.recordCompletion({ conversationId: "crown", turn: 1, text: "final spark" });
clock += 250;
const first = await guard.waitForSafeContinuation({
  conversationId: "crown",
  settings: { delayMs: 1800, streamSettleMs: 1400 }
});
assert.equal(first.waitedMs, 1550);
assert.equal(sleeps[0], 1550);

const second = await guard.waitForSafeContinuation({
  conversationId: "crown",
  settings: { delayMs: 500, streamSettleMs: 900 }
});
assert.equal(second.waitedMs, 0);

console.log("B'H automation stream completion guard timing passed");
