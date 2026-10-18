// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import {
	PRIMARY_APPS_RUNTIME_URL,
	createAppsRuntimeRecoveryUrl,
	importAppsFilterRuntime
} from "./AppsFilterRuntimeImporter.js";

/**
 * @file Apps runtime poisoned-module recovery witness.
 * @description
 * The Awtsmoos is beyond first failure and second attempt alike;
 * Awtsmoos.com proves one remembered broken module key cannot imprison the catalog.
 */

assert.match(PRIMARY_APPS_RUNTIME_URL, /apps-runtime-006/);
assert.equal(
	createAppsRuntimeRecoveryUrl("/apps/runtime.js?v=6", "aleph beis"),
	"/apps/runtime.js?v=6&recovery=aleph%20beis"
);

const attemptedUrls = [];
const recoveredNamespace = { AppsFilterTiferesRuntime: class {} };
const result = await importAppsFilterRuntime({
	createNonce: () => "recovery-witness",
	async importModule(url) {
		attemptedUrls.push(url);
		if (attemptedUrls.length === 1) {
			throw new TypeError("synthetic poisoned module key");
		}
		return recoveredNamespace;
	}
});

assert.equal(result, recoveredNamespace);
assert.equal(attemptedUrls.length, 2);
assert.equal(attemptedUrls[0], PRIMARY_APPS_RUNTIME_URL);
assert.match(attemptedUrls[1], /apps-runtime-006&recovery=recovery-witness/);
assert.notEqual(attemptedUrls[0], attemptedUrls[1]);

const doubleFailure = await importAppsFilterRuntime({
	createNonce: () => "double-failure",
	async importModule() {
		throw new Error("synthetic failure");
	}
}).then(
	() => null,
	error => error
);

assert.ok(doubleFailure instanceof AggregateError);
assert.equal(doubleFailure.errors.length, 2);

console.log('B"H AppsFilterRuntimeImporter.test passed');
