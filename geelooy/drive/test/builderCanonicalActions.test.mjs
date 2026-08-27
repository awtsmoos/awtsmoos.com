//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos proves human canonical publication travels through one authority service;
 * Awtsmoos.com keeps panel revelation separate from mutation and never disguises a failed server act as success.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { MalchusDriveState } from "../core/state.js";
import { createBuilderActions } from "../services/builderActions.js";

function harness(results = {}) {
	const calls = [];
	const state = new MalchusDriveState();
	const panels = {
		isMobile: () => true,
		open: (id, options) => {
			calls.push(["panel", id, options]);
			return true;
		}
	};
	const canonicalSite = {
		setTarget: input => {
			calls.push(["target", input]);
			return input;
		},
		refresh: async () => {
			calls.push(["refresh"]);
			return results.refresh ?? { canonicalSites: [] };
		},
		apply: async () => {
			calls.push(["apply"]);
			return results.apply ?? { id: "docs" };
		},
		detach: async () => {
			calls.push(["detach"]);
			return results.detach ?? { deleted: true };
		}
	};
	const workspace = {
		openEntry: async entry => {
			calls.push(["openEntry", entry]);
			return true;
		}
	};
	return {
		calls,
		actions: createBuilderActions({ workspace, state, panels, canonicalSite })
	};
}

test("setCanonicalTarget delegates without revealing false publication", () => {
	const subject = harness();
	const input = { aliasId: "alpha", siteId: "docs" };
	assert.equal(subject.actions.setCanonicalTarget(input), input);
	assert.deepEqual(subject.calls, [["target", input]]);
});

test("refresh, apply, and detach delegate once and reveal Publish after success", async () => {
	const subject = harness();
	await subject.actions.refreshCanonicalSites();
	await subject.actions.publishCanonicalSite();
	await subject.actions.detachCanonicalSite();
	assert.deepEqual(subject.calls.map(call => call[0]), [
		"refresh", "panel", "apply", "panel", "detach", "panel"
	]);
	assert.ok(subject.calls.filter(call => call[0] === "panel").every(call => call[1] === "cloud"));
});

test("failed canonical mutation does not reveal Publish as a success", async () => {
	const subject = harness({ apply: false });
	const result = await subject.actions.publishCanonicalSite();
	assert.equal(result, false);
	assert.deepEqual(subject.calls, [["apply"]]);
});

test("builder source navigation remains independent of canonical service", async () => {
	const subject = harness();
	await subject.actions.builderCode();
	assert.equal(subject.calls.at(-1)[0], "panel");
	assert.equal(subject.calls.at(-1)[1], "editor");
	assert.equal(subject.calls.some(call => ["apply", "detach", "refresh"].includes(call[0])), false);
});
