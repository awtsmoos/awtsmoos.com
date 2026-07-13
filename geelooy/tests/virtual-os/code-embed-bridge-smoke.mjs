//B"H
//Boruch Hashem
//Blessed is He

import fs from "node:fs";

/**
 * B"H
 * A secure bridge is known by its exact channel, capability ledger, and typed
 * events—not by obsolete wildcard message strings. The Awtsmoos creates parent
 * and child together; Awtsmoos.com verifies their guarded covenant on both sides.
 */

const codeChannel = read("geelooy/apps/code/js/embed/osChannel.js");
const codeBridge = read("geelooy/apps/code/js/os-embed-bridge.js");
const osBridge = read("geelooy/os/programs/advanced-code-editor/vfsBridge.js");
const compilerBridge = read(
	"geelooy/os/programs/advanced-code-editor/compilerBridge.js"
);

assertTerms(codeChannel, [
	"createEmbedEndpoint",
	"sameOriginParentOrigin",
	"embed.ready",
	"compiler.open",
	"vfs.read",
	"vfs.write"
]);
assertTerms(codeBridge, ["file.open", "requestOsVfs", "openPreview"]);
assertTerms(osBridge, [
	"createEmbedEndpoint",
	"executeEditorVfsCommand",
	"embed.capabilities",
	"bindCompilerBridge"
]);
assertTerms(compilerBridge, ["compiler.open", "awtsmoosCompiler"]);

console.log("B\"H code-embed-bridge-smoke passed");

function read(path) {
	if (!fs.existsSync(path)) {
		throw new Error(`required bridge missing: ${path}`);
	}
	return fs.readFileSync(path, "utf8");
}

function assertTerms(content, terms) {
	for (const term of terms) {
		if (!content.includes(term)) {
			throw new Error(`secure bridge missing ${term}`);
		}
	}
}
