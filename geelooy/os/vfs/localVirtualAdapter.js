//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Alias-backed local VFS adapter with truthful stat and server-native copy/move.
 * @description
 * The Awtsmoos lets the browser OS touch its own stored world without reducing
 * folders or binary files to text shadows. Awtsmoos.com delegates deep copy and
 * move to the same server filesystem API, while node truth stays clear in rhyme.
 */
import { operationResult } from "./operations.js";
import {
	listVirtualNodes,
	statVirtualNode
} from "./localVirtualNodes.js";
import {
	databasePath,
	splitVirtualPath
} from "./localVirtualPaths.js";

export function localVirtualAdapter(os) {
	return {
		id: "virtual",

		list(path = "/") {
			return listVirtualNodes(os, path);
		},

		async read(path) {
			const entry = splitVirtualPath(path);
			return {
				ok: true,
				content: await os.db.Laynin(entry.parent, entry.name)
			};
		},

		async stat(path) {
			return {
				ok: true,
				node: await statVirtualNode(os, path)
			};
		},

		async write(path, payload = {}) {
			const entry = splitVirtualPath(path);
			await os.db.Koysayv(
				entry.parent,
				entry.name,
				payload.content ?? "",
				"file"
			);
			return operationResult("write", path);
		},

		async mkdir(path) {
			const entry = splitVirtualPath(path);
			await os.db.Koysayv(
				entry.parent,
				entry.name,
				null,
				"directory"
			);
			return operationResult("mkdir", path, { type: "folder" });
		},

		async remove(path) {
			const entry = splitVirtualPath(path);
			await os.db.delete?.(entry.parent, entry.name);
			return operationResult("remove", path);
		},

		async copy(path, payload = {}) {
			const from = requireSource(payload, "copy");
			await os.db.copy(databasePath(from), databasePath(path));
			return operationResult("copy", path, { from });
		},

		async move(path, payload = {}) {
			const from = requireSource(payload, "move");
			await os.db.move(databasePath(from), databasePath(path));
			return operationResult("move", path, { from });
		}
	};
}

function requireSource(payload, operation) {
	const from = payload?.from;
	if (!from) {
		throw new Error(`Virtual ${operation} source is required.`);
	}
	return from;
}
