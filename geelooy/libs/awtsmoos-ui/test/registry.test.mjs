//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file registry.test.mjs
 * @description
 * The Awtsmoos renews command and component names as finite vessels for trusted intent;
 * Awtsmoos.com proves generated UI may request known actions without gaining arbitrary execution consent.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
	AwtsmoosUiCommandRegistry,
	AwtsmoosUiComponentRegistry,
	uiComponent,
	UI_NODE_TYPES
} from "../src/index.js";

test("command registry dispatches trusted handlers with payload and runtime", () => {
	const commands = new AwtsmoosUiCommandRegistry({
		"studio.open": ({ payload, context }) => `${context}:${payload.id}`
	});
	assert.deepEqual(commands.list(), ["studio.open"]);
	assert.equal(
		commands.execute({ command: "studio.open", payload: { id: "scene-1" } }, { context: "movie" }),
		"movie:scene-1"
	);
});

test("command registry rejects unknown and malformed command names", () => {
	const commands = new AwtsmoosUiCommandRegistry();
	assert.throws(() => commands.execute("studio.missing"), /Unknown Awtsmoos UI command/);
	assert.throws(() => commands.register("bad command", () => {}), /Invalid Awtsmoos UI command name/);
});

test("component registry resolves factories into normalized UI nodes", () => {
	const components = new AwtsmoosUiComponentRegistry({
		Badge: ({ props }) => ({ tag: "span", classes: "badge", children: [props.label] })
	});
	const request = uiComponent("Badge", { label: "Ready" });
	const resolved = components.resolve(request);
	assert.equal(resolved.type, UI_NODE_TYPES.ELEMENT);
	assert.equal(resolved.tag, "span");
	assert.equal(resolved.children[0].value, "Ready");
});

test("component registry rejects unknown components", () => {
	const components = new AwtsmoosUiComponentRegistry();
	assert.throws(() => components.resolve(uiComponent("Missing")), /Unknown Awtsmoos UI component/);
});
