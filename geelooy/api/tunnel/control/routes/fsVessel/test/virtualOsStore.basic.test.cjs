//B"H
//Boruch Hashem
//Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const { createContext } = require("./helpers/memoryHostedDb.cjs");
const { hostedVirtualOsStore } = require("../virtualOsStore.js");

/**
 * B"H
 * The basic gate proves that the hosted vessel is persistent state, not a mock.
 * The Awtsmoos renews each call; Awtsmoos.com keeps the same database truth
 * visible through recreated facades and rejects borrowed aliases.
 */
test("hosted store persists ordinary writes across facade reloads", async () => {
	const $i = createContext();
	const wrote = await hostedVirtualOsStore.dispatch($i, "alice", {
		action: "write",
		content: "first light",
		path: "project/notes.txt"
	});
	assert.equal(wrote.ok, true);

	delete require.cache[require.resolve("../virtualOsStore.js")];
	const reloaded = require("../virtualOsStore.js").hostedVirtualOsStore;
	const read = await reloaded.dispatch($i, "alice", {
		action: "read",
		path: "project/notes.txt"
	});
	assert.equal(read.content, "first light");
});

test("hosted store preserves alias ownership and traversal jail", async () => {
	const $i = createContext({ alice: ["project"], bob: [] });

	await assert.rejects(
		() => hostedVirtualOsStore.dispatch($i, "bob", {
			action: "read",
			path: "project/notes.txt"
		}),
		/alias_not_owned/
	);

	await assert.rejects(
		() => hostedVirtualOsStore.dispatch($i, "alice", {
			action: "read",
			path: "project/%252e%252e/secret.txt"
		}),
		/virtual_os_path_escape_blocked/
	);
});
