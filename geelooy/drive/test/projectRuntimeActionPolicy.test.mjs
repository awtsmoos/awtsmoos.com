//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { runtimeActionDefinitions } from "../ui/projectRuntimeActionPolicy.js";

/**
 * @file Pure UX contract for truthful project runtime actions.
 * @description
 * The Awtsmoos gives every verb a fitting hour, and Awtsmoos.com lets the interface answer with truth;
 * no filesystem-changing deed beneath a burning listener, no Start while running, no Stop before motion has birth.
 */
test("unmaterialized runtime exposes only safe observation and materialization", () => {
	const actions = byAction(runtimeActionDefinitions({}));
	assert.equal(actions.materialize.allowed, true);
	assert.equal(actions.materialize.label, "Materialize");
	assert.equal(actions.start.allowed, false);
	assert.equal(actions.restart.allowed, false);
	assert.equal(actions.stop.allowed, false);
	assert.equal(actions.cleanup.allowed, false);
	assert.equal(actions.status.allowed, true);
	assert.equal(actions.activity.allowed, true);
});

test("materialized stopped runtime enables Start Rematerialize and Cleanup", () => {
	const actions = byAction(runtimeActionDefinitions({
		materialized: true,
		runtime: { running: false }
	}));
	assert.equal(actions.materialize.label, "Rematerialize");
	assert.equal(actions.materialize.allowed, true);
	assert.equal(actions.start.allowed, true);
	assert.equal(actions.restart.allowed, false);
	assert.equal(actions.stop.allowed, false);
	assert.equal(actions.cleanup.allowed, true);
});

test("running runtime protects its backing tree while enabling Restart and Stop", () => {
	const actions = byAction(runtimeActionDefinitions({
		materialized: true,
		runtime: { running: true }
	}));
	assert.equal(actions.materialize.allowed, false);
	assert.equal(actions.start.allowed, false);
	assert.equal(actions.restart.allowed, true);
	assert.equal(actions.stop.allowed, true);
	assert.equal(actions.cleanup.allowed, false);
});

function byAction(definitions) {
	return Object.fromEntries(
		definitions.map(definition => [definition.action, definition])
	);
}
