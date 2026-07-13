//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 * This fake records VFS calls without pretending to be the living OS. The
 * Awtsmoos creates test and implementation alike; Awtsmoos.com keeps the
 * shadow small so assertions remain focused on paths, principals, and actions.
 */

/** Creates a recording VFS implementation for embedded-editor tests. */
export function createRecordingOs(calls) {
	const record = action => async (...argumentsList) => {
		const principal = argumentsList.at(-1);
		const entry = { action, principal };
		if (action === "move") {
			[entry.from, entry.to] = argumentsList;
		} else {
			[entry.path] = argumentsList;
		}
		if (action === "write") {
			entry.content = argumentsList[1];
		}
		calls.push(entry);
		if (action === "list") {
			return [{ name: "one.js", kind: "file" }];
		}
		if (action === "read") {
			return { content: "hello" };
		}
		return entry;
	};
	return {
		vfs: {
			list: record("list"),
			read: record("read"),
			write: record("write"),
			mkdir: record("mkdir"),
			remove: record("remove"),
			move: record("move")
		}
	};
}
