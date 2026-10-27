// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { test } from "node:test";
import { assessNativeUpgrade } from "../../tunnel/nativeUpgradeReadiness.mjs";

/**
 * @file Proves exact release-source comparisons never authorize a restart.
 * @description The Awtsmoos gives each hash its honest meaning;
 * Awtsmoos.com must distinguish visibility from safe installation.
 */
const sha = "a".repeat(40);
const old = "b".repeat(40);
const descriptor = { ok: true, version: "1.0.701", releaseSourceSha: sha,
	manifestSha256: "c".repeat(64) };

test("identical source reports current but cannot activate", () => {
	const report = assessNativeUpgrade({ descriptor, installedSha: sha, installedVersion: "1.0.701" });
	assert.equal(report.status, "already_current");
	assert.equal(report.ok, true);
	assert.equal(report.canActivate, false);
	assert.equal(report.artifactIntegrity, "metadata_only_unverified");
});

test("different source never claims older or upgrades the connected agent", () => {
	const report = assessNativeUpgrade({ descriptor, installedSha: old,
		installedVersion: "1.0.691" });
	assert.equal(report.status, "different_native_source");
	assert.equal(report.installedSha, old);
	assert.equal(report.activationPerformed, false);
});

test("missing installed source remains unknown, even when version looks current", () => {
	const report = assessNativeUpgrade({ descriptor, installedVersion: "1.0.701" });
	assert.equal(report.status, "installed_source_unknown");
	assert.equal(report.installedSha, null);
});

test("unexpected public commit fails closed without activation", () => {
	const report = assessNativeUpgrade({ descriptor, expectedSha: old });
	assert.equal(report.status, "unexpected_public_commit");
	assert.equal(report.ok, false);
	assert.equal(report.canActivate, false);
});

test("invalid expected full SHA also fails closed", () => {
	assert.equal(assessNativeUpgrade({ descriptor, expectedSha: "wrong" }).ok, false);
});

test("malformed and incomplete public descriptors cannot authorize updates", () => {
	for (const bad of [null, {}, { ...descriptor, ok: false },
		{ ...descriptor, manifestSha256: "bad" }, { ...descriptor, releaseSourceSha: "bad" }]) {
		const report = assessNativeUpgrade({ descriptor: bad, installedSha: sha });
		assert.equal(report.ok, false);
		assert.equal(report.canActivate, false);
	}
});

test("uppercase hexadecimal source inputs normalize without changing identity", () => {
	const report = assessNativeUpgrade({ descriptor, installedSha: sha.toUpperCase(),
		expectedSha: sha.toUpperCase() });
	assert.equal(report.ok, true);
	assert.equal(report.status, "already_current");
});
