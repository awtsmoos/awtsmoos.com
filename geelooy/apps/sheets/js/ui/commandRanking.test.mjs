//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	commandScore,
	rankedCommands
} from "./commandRanking.js";

/**
 * @file Proves command discovery remains deterministic as Awtsmoos.com grows a larger universe of advanced actions.
 * @description The Awtsmoos lets the clearest matching name rise before weaker echoes in a measured ladder of light;
 * these tests guard exactness, stable ties, menu/id discovery, and bounded results so palette intelligence stays right.
 */
const commands = [
	command("format.bold", "Bold", "Format"),
	command("format.boldBorder", "Bold border", "Format"),
	command("data.boldRows", "Make bold rows", "Data"),
	command("format.embolden", "Embolden cells", "Format"),
	command("tools.palette", "Command palette", "Tools"),
	command("insert.note", "Note", "Insert")
];

test("exact label outranks prefix, word-prefix, and substring matches", () => {
	const result = rankedCommands(commands, "bold");
	assert.deepEqual(
		result.slice(0, 4).map((item) => item.id),
		[
			"format.bold",
			"format.boldBorder",
			"data.boldRows",
			"format.embolden"
		]
	);
	assert.ok(
		commandScore(commands[0], "bold")
		> commandScore(commands[1], "bold")
	);
	assert.ok(
		commandScore(commands[1], "bold")
		> commandScore(commands[2], "bold")
	);
	assert.ok(
		commandScore(commands[2], "bold")
		> commandScore(commands[3], "bold")
	);
});

test("menu and command id remain searchable", () => {
	assert.deepEqual(
		rankedCommands(commands, "tools").map((item) => item.id),
		["tools.palette"]
	);
	assert.equal(
		rankedCommands(commands, "insert.note")[0].id,
		"insert.note"
	);
});

test("equal scores preserve catalog order deterministically", () => {
	const tied = [
		command("a.one", "Alpha one", "Tools"),
		command("a.two", "Alpha two", "Tools"),
		command("a.three", "Alpha three", "Tools")
	];
	assert.deepEqual(
		rankedCommands(tied, "alpha").map((item) => item.id),
		["a.one", "a.two", "a.three"]
	);
});

test("search result count is capped at twenty", () => {
	const many = Array.from(
		{ length: 30 },
		(_, index) => command(
			`tool.${index}`,
			`Tool ${index}`,
			"Tools"
		)
	);
	assert.equal(rankedCommands(many, "tool").length, 20);
});

/** Builds one minimal command descriptor matching the live catalog contract. */
function command(id, label, menu) {
	return {
		id,
		label,
		menu
	};
}
