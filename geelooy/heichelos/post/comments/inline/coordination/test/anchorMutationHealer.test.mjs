// B"H
import assert from "node:assert/strict";

const calls = [];
const observed = [];
let observerCallback = null;
let timeoutJobs = [];

globalThis.window = {
    location: { search: `?inline=${encodeURIComponent(JSON.stringify(["a", "b"]))}` },
    __awtsmoosInlineManifestTestHook: alias => calls.push(alias)
};

globalThis.setTimeout = fn => {
    timeoutJobs.push(fn);
    return timeoutJobs.length;
};

globalThis.MutationObserver = class FakeMutationObserver {
    constructor(callback) {
        observerCallback = callback;
    }
    observe(target, options) {
        observed.push({ target, options });
    }
    disconnect() {
        observed.push({ disconnected: true });
    }
};

const root = {
    querySelector(selector) {
        assert.equal(selector, ".post-reader-localized-context");
        return { nodeName: "reader" };
    }
};

const module = await import("../AnchorMutationHealer.js");
const observer = module.activateAnchorMutationHealer(root);
assert.ok(observer);
assert.equal(observed.length, 1);
assert.deepEqual(observed[0].options, { childList: true, subtree: true });

observerCallback([{ addedNodes: [1], removedNodes: [] }]);
observerCallback([{ addedNodes: [2], removedNodes: [] }]);
assert.equal(timeoutJobs.length, 1, "mutations should debounce into one scheduled heal");

await timeoutJobs.shift()();
assert.deepEqual(calls, ["a", "b"]);

module.deactivateAnchorMutationHealer();
assert.equal(observed.at(-1).disconnected, true);

console.log('B"H anchorMutationHealer.test passed');
