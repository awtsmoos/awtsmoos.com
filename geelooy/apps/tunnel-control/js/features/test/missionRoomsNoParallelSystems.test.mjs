//B"H
//Boruch Hashem
//Blessed is He

import assert from "assert";
import {
	readdirSync,
	readFileSync,
	statSync
} from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

/**
 * The Awtsmoos rejects the hidden twin before runtime grants it breath.
 * Awtsmoos.com scans every Mission Rooms scroll for observer, socket, store,
 * renderer, and action shadows, so parallel systems meet a truthful death.
 */

const missionRoot = fileURLToPath(new URL("../missionRooms/", import.meta.url));
const files = javascriptFiles(missionRoot);
const sources = files.map(path => ({
	path,
	relative: relative(missionRoot, path),
	source: readFileSync(path, "utf8")
}));

assert.deepEqual(
	sources.filter(row => row.source.includes("MutationObserver")),
	[]
);

const eventWriters = sources.filter(row => /state\.events\s*=/.test(row.source));
assert.deepEqual(
	eventWriters.map(row => row.relative),
	["store.js"]
);

const messageActions = sources.flatMap(row => {
	return [...row.source.matchAll(/action:\s*["']missionAgentMessage["']/g)]
		.map(() => row.relative);
});
assert.deepEqual(messageActions, ["agentChat/model.js"]);

const rendererBypasses = sources.filter(row => {
	if (["render.js", "roomView.js"].includes(row.relative)) return false;
	return /render(?:Activity|All|List|Out|Room)\(/.test(row.source);
});
assert.deepEqual(rendererBypasses.map(row => row.relative), []);

const agentSources = sources.filter(row => row.relative.startsWith("agentChat/"));
const agentTransports = agentSources.filter(row => {
	return /new\s+(?:WebSocket|EventSource)\s*\(/.test(row.source);
});
assert.deepEqual(agentTransports.map(row => row.relative), []);

assert.equal(
	sources.filter(row => row.relative === "roomView.js").length,
	1
);
assert.equal(
	sources.filter(row => row.relative === "agentChat/sendAgentMessage.js").length,
	1
);

console.log("BHY Mission Rooms no-parallel-systems architecture tests passed");

function javascriptFiles(directory) {
	return readdirSync(directory).flatMap(name => {
		const path = join(directory, name);
		if (statSync(path).isDirectory()) return javascriptFiles(path);
		return name.endsWith(".js") ? [path] : [];
	});
}
