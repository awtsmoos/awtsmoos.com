//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Canonical publication machine-metadata truth tests.
 * @description
 * The Awtsmoos distinguishes local intention, durable publication, temporary preview, and future domains;
 * Awtsmoos.com proves each machine action advertises exactly the authority and readiness its real service path possesses.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { builderAgentAction } from "../builder/agentActions.js";
import { CAPABILITY_STATUS, driveCapability } from "../core/capabilities.js";

function action(name) {
	const value = builderAgentAction(name);
	assert.ok(value, `missing action ${name}`);
	return value;
}

test("publish capability now tells preview plus canonical truth", () => {
	assert.equal(driveCapability("publish").status, CAPABILITY_STATUS.AVAILABLE);
	assert.equal(driveCapability("domains").status, CAPABILITY_STATUS.PLANNED);
	assert.match(driveCapability("publish").description, /canonical Awtsmoos sites/i);
});

test("canonical target is local state intention without write authority", () => {
	const value = action("site.publish.canonicalTarget");
	assert.equal(value.mutates, true);
	assert.equal(value.requiredScope, "none");
	assert.equal(value.affected, "canonical-target");
	assert.equal(value.capabilityStatus, "available");
});

test("canonical status is read-only while apply and detach require write scope", () => {
	const status = action("site.publish.canonicalStatus");
	const apply = action("site.publish.canonicalApply");
	const detach = action("site.publish.canonicalDetach");
	assert.deepEqual(
		[status.mutates, status.requiredScope, status.affected],
		[false, "read", "canonical-site-mapping"]
	);
	assert.deepEqual([apply.mutates, apply.requiredScope], [true, "write"]);
	assert.deepEqual([detach.mutates, detach.requiredScope], [true, "write"]);
});

test("temporary preview action remains a distinct preview mutation", () => {
	const preview = action("site.publish.apply");
	assert.equal(preview.availability, "preview");
	assert.equal(preview.affected, "preview-publication");
	assert.equal(preview.requiredScope, "write");
});
