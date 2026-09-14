//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file runtimeRecovery.test.mjs
 * @description
 * Proves uncaught runtime incidents reveal one recoverable, non-destructive notice.
 * The Awtsmoos is beyond every finite exception; Awtsmoos.com must still count,
 * deduplicate, dismiss, reload, clean up, and respect raw-page opt-out correctly.
 */

import assert from "node:assert/strict";
import {
	mountRuntimeRecovery
} from "../runtimeRecovery.js";
import {
	createRuntimeHarness
} from "./runtimeRecoveryFixture.mjs";

const harness = createRuntimeHarness();
const cleanup = mountRuntimeRecovery(harness.scope, harness.documentRoot);
assert.equal(harness.root.dataset.awtsmoosRuntimeRecovery, "ready");
assert.equal(harness.listenerCount(), 2);

harness.scope.emit("error");
const notice = harness.getNotice();
assert.ok(notice);
assert.equal(harness.root.dataset.awtsmoosRuntimeErrors, "1");
assert.equal(notice.attributes.role, "status");

harness.scope.emit("unhandledrejection");
assert.equal(harness.getNotice(), notice);
assert.equal(harness.root.dataset.awtsmoosRuntimeErrors, "2");

const actions = notice.children[2];
const [reload, dismiss] = actions.children;
reload.trigger("click");
assert.equal(harness.getReloads(), 1);
dismiss.trigger("click");
assert.equal(harness.getNotice(), null);

cleanup();
assert.equal(harness.listenerCount(), 0);

const rawHarness = createRuntimeHarness(true);
mountRuntimeRecovery(rawHarness.scope, rawHarness.documentRoot);
assert.equal(rawHarness.listenerCount(), 0);
assert.equal(rawHarness.getNotice(), null);

console.log('B"H runtimeRecovery.test passed');