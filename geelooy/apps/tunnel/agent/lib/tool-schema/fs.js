// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Readable schema router for native tunnel filesystem and local lifecycle actions.
 * @description
 * The Awtsmoos lets many tool names enter one catalog without compressing their
 * meaning into a single unreadable breath. Awtsmoos.com gives fake SSH an explicit
 * listener schema while older families keep their measured contracts in rhyme.
 */
const P = require("./primitives.js");
const { isBatchAction, batchSchema } = require("./batch.js");
const { chatgptSchema } = require("./chatgpt.js");
const { aiAgentSchema } = require("./agent.js");

function fsSchema(name) {
	if (/^chatgpt/i.test(name)) return chatgptSchema(name);
	if (/^(agent|aiAgent)/i.test(name)) return aiAgentSchema(name);
	if (isBatchAction(name)) return batchSchema(name);
	if (/^fakeSsh/i.test(name)) return fakeSshSchema(name);
	if (/^(writeImage|imageWrite|uploadImage)$/i.test(name)) return imageWriteSchema();
	if (name === "write" || name === "writeIfHash") return writeSchema();
	if (/bulkWrite/i.test(name)) return bulkWriteSchema();
	if (/readManyLines/i.test(name)) return readManySchema();
	if (/read64/i.test(name)) return P.pathSchema({ offsetBytes: P.integer("Start byte offset."), maxBytes: P.integer("Maximum bytes to read.") });
	if (/readLines/i.test(name)) return P.pathSchema({ startLine: P.integer("First line."), endLine: P.integer("Last line."), maxChars: P.integer("Maximum returned characters.") });
	if (/^(bulk|read|stat|textStats|fileHashes|nodeCheckFile|nodeCheckMany|nodeCheckFiles|connectedFiles)$/i.test(name)) return multiPathSchema();
	if (/^(portList|portFind|portKillSafe|waitForPort)$/i.test(name)) return portSchema();
	if (/list|tree|findFiles|largeFiles|rootBrowse/i.test(name)) return listSchema();
	if (/rg|grep|selectString|bulkSearch|find/i.test(name)) return searchSchema();
	if (/command|Runner|test|lint|typecheck|build/i.test(name)) return commandSchema();
	if (/http/i.test(name)) return httpSchema();
	return P.commonSchema();
}

function fakeSshSchema(name) {
	if (name === "fakeSshStart") {
		return P.objectSchema({
			host: P.string("Bind host. Non-loopback requires persisted fakeSshAllowPublic=true."),
			port: P.integer("SSH listener port."),
			maxConnections: P.integer("Maximum concurrent SSH connections."),
			username: P.string("Username embedded into the short-lived access token."),
			public: P.bool("Request public binding; policy must already allow it.")
		});
	}
	return P.objectSchema({});
}

function writeSchema() {
	return P.objectSchema({ path: P.string("Repo-relative file path."), p: P.string("Path alias."), content: P.string("Complete full file content."), expectedHash: P.string("Optional hash guard."), timeoutMs: P.integer("Timeout in milliseconds.") }, ["content"]);
}

function bulkWriteSchema() {
	return P.objectSchema({ writes: P.array(fileWriteSpec()), files: P.object("Map of path to content."), content: P.string("JSON/XML carrier containing writes."), params: P.object("Object carrier containing writes/files."), body: P.string("JSON/XML carrier alias."), query: P.string("JSON carrier alias."), goal: P.string("JSON carrier alias."), timeoutMs: P.integer("Timeout in milliseconds.") });
}

function readManySchema() {
	return P.objectSchema({ ranges: P.array(P.objectSchema({ path: P.string("Repo-relative file path."), p: P.string("Path alias."), startLine: P.integer("First line."), endLine: P.integer("Last line.") })), content: P.string("JSON carrier containing ranges."), params: P.object("Object carrier."), maxChars: P.integer("Maximum returned characters.") }, ["ranges"]);
}

function multiPathSchema() {
	return P.pathSchema({ paths: P.string("Newline-separated paths or JSON array."), files: P.string("Newline-separated paths or JSON array."), maxFiles: P.integer("Maximum files per page."), pageSize: P.integer("Files per page."), cursor: P.integer("Pagination cursor."), maxDepth: P.integer("Directory expansion depth."), maxChars: P.integer("Maximum chars per file."), totalMaxChars: P.integer("Maximum chars in page."), timeoutMs: P.integer("Timeout in milliseconds.") });
}

function portSchema() {
	return P.objectSchema({ port: P.integer("TCP port."), ports: P.array(P.integer("TCP port.")), host: P.string("Host; defaults to 127.0.0.1."), timeoutMs: P.integer("Timeout."), confirm: P.bool("Required for termination."), dryRun: P.bool("Inspect without terminating."), force: P.bool("Force termination after graceful attempt.") });
}

function listSchema() {
	return P.pathSchema({ depth: P.integer("Tree depth."), limit: P.integer("Maximum entries."), pageSize: P.integer("Entries per page."), cursor: P.integer("Zero-based pagination cursor."), maxChars: P.integer("Maximum returned characters."), query: P.string("Optional search query.") });
}

function searchSchema() {
	return P.objectSchema({ p: P.string("Repo-relative root/path."), path: P.string("Repo-relative root/path."), query: P.string("Search query."), pattern: P.string("Search pattern."), regex: P.bool("Treat pattern as regex."), maxResults: P.integer("Maximum matches."), maxFiles: P.integer("Maximum files to scan."), maxChars: P.integer("Maximum returned characters.") });
}

function commandSchema() {
	return P.objectSchema({ p: P.string("Repo-relative path."), cwd: P.string("Repo-relative cwd."), command: P.string("Command to run."), timeoutMs: P.integer("Timeout in milliseconds."), maxChars: P.integer("Maximum returned characters.") });
}

function httpSchema() {
	return P.objectSchema({ url: P.string("URL to request."), method: P.string("HTTP method."), headers: P.string("JSON/text headers."), body: P.string("Request body."), timeoutMs: P.integer("Timeout."), maxChars: P.integer("Maximum returned characters.") });
}

function imageWriteSchema() {
	return P.objectSchema({ path: P.string("Destination path."), p: P.string("Path alias."), fileName: P.string("Safe filename."), directory: P.string("Directory."), imageBase64: P.string("Raw base64 image bytes."), content64: P.string("Base64 alias."), dataUrl: P.string("data:image/... payload."), mime: P.string("Image MIME type."), format: P.string("png, jpg, jpeg, webp, gif."), maxBytes: P.integer("Maximum decoded bytes."), timeoutMs: P.integer("Timeout.") });
}

function fileWriteSpec() {
	return P.objectSchema({ path: P.string("Repo-relative file path."), p: P.string("Path alias."), content: P.string("Complete file content."), text: P.string("Content alias.") });
}

module.exports = { fsSchema, imageWriteSchema, fileWriteSpec };
