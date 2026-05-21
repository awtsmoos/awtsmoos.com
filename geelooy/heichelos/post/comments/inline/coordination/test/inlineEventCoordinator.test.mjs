// B"H
import assert from "node:assert/strict";
import { emitAwtsmoosEvent, clearAwtsmoosEventHistory } from "../../../state/eventBus.js";
import { activateInlineEventCoordinator } from "../InlineEventCoordinator.js";

const calls = [];
globalThis.window = { __awtsmoosInlineEventCoordinator: false };

window.__awtsmoosInlineManifestTestHook = alias => {
    calls.push(alias);
};

activateInlineEventCoordinator();
clearAwtsmoosEventHistory();

emitAwtsmoosEvent("comment:submitted", { aliasId: "a" });
emitAwtsmoosEvent("comment:submitted", { aliasId: "a" });
emitAwtsmoosEvent("comment:approved", { aliasId: "b" });
emitAwtsmoosEvent("coordinate:changed", { aliasId: "c" });
await Promise.resolve();
await Promise.resolve();

assert.deepEqual(calls, ["a", "b", "c"]);
activateInlineEventCoordinator();
emitAwtsmoosEvent("comment:submitted", { aliasId: "d" });
await Promise.resolve();
await Promise.resolve();
assert.deepEqual(calls, ["a", "b", "c", "d"]);

console.log('B"H inlineEventCoordinator.test passed');
