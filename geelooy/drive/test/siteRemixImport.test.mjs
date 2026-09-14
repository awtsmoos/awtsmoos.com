//B"H
//Boruch Hashem
//Blessed be He

import test from "node:test";
import assert from "node:assert/strict";
import { importSiteRemix } from "../services/siteRemixImport.js";
import { remixDirectories, remixFolderName } from "../services/siteRemixImportPaths.js";

/** Creates an in-memory workspace faithful enough to prove isolated Remix mutation order. */
function harness(seed = {}) {
	const nodes = new Map(Object.entries(seed));
	const value = { currentPath: ".", entries: entriesAt(nodes, "."), document: null };
	const state = {
		snapshot: () => ({ ...value }),
		patch: changes => Object.assign(value, changes)
	};
	const workspace = {
		state,
		async navigate(path) {
			value.currentPath = path;
			value.entries = entriesAt(nodes, path);
			return true;
		},
		async createFolder(name) {
			const path = join(value.currentPath, name);
			if (nodes.has(path)) return false;
			nodes.set(path, { type: "directory" });
			value.entries = entriesAt(nodes, value.currentPath);
			return true;
		},
		async createFile(name) {
			const path = join(value.currentPath, name);
			if (nodes.has(path)) return false;
			nodes.set(path, { type: "file", content: "" });
			value.document = { path, name, content: "" };
			value.entries = entriesAt(nodes, value.currentPath);
			return true;
		},
		setDraft(content) {
			value.document = { ...value.document, content };
		},
		async saveDocument() {
			nodes.set(value.document.path, { type: "file", content: value.document.content });
			return true;
		},
		async openEntry(entry) {
			value.document = { path: join(value.currentPath, entry.name), name: entry.name, content: nodes.get(join(value.currentPath, entry.name))?.content };
			return true;
		}
	};
	return { workspace, state, nodes };
}

test("remix imports nested source into a new folder and preserves existing work", async () => {
	const existing = { "existing.txt": { type: "file", content: "mine" } };
	const { workspace, state, nodes } = harness(existing);
	const result = await importSiteRemix({ workspace, state }, manifest());
	assert.equal(result.rootPath, "remix-demo");
	assert.equal(nodes.get("existing.txt").content, "mine");
	assert.equal(nodes.get("remix-demo/index.html").content, "<h1>B\"H</h1>");
	assert.equal(nodes.get("remix-demo/assets/site.js").content, "//B\"H");
	const origin = [...nodes.entries()].find(([path]) => path.startsWith("remix-demo/.awtsmoos-remix-origin"));
	assert.match(origin[1].content, /\/sites\/alpha\/demo\//);
	assert.equal(state.snapshot().document.name, "index.html");
});

test("folder naming and directory planning are deterministic and traversal-safe", () => {
	assert.equal(remixFolderName({ title: "Demo" }, [{ name: "remix-demo" }]), "remix-demo-2");
	assert.deepEqual(remixDirectories([{ path: "a/b/c.js" }, { path: "a/d.css" }]), ["a", "a/b"]);
	assert.throws(() => remixDirectories([{ path: "../secret.txt" }]), error => error.code === "REMIX_PATH_INVALID");
});

function manifest() {
	return { title: "Demo", aliasId: "alpha", siteId: "demo", canonicalUrl: "/sites/alpha/demo/", sourceKind: "drive", sourceRevision: null, files: [
		{ path: "index.html", content: "<h1>B\"H</h1>" },
		{ path: "assets/site.js", content: "//B\"H" }
	] };
}

function join(parent, name) { return parent === "." ? name : `${parent}/${name}`; }
function entriesAt(nodes, parent) {
	const prefix = parent === "." ? "" : `${parent}/`;
	return [...nodes.entries()].flatMap(([path, node]) => {
		if (!path.startsWith(prefix)) return [];
		const rest = path.slice(prefix.length);
		return !rest || rest.includes("/") ? [] : [{ name: rest, type: node.type }];
	});
}
