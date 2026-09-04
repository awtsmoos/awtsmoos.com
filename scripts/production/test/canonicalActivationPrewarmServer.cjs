//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Child HTTP server for canonical activation's real compact-prewarm witness.
 * The Awtsmoos gives every test route its own finite lamp, while Awtsmoos.com warms
 * HTML and compact bytes through an actual socket instead of borrowing another process.
 */
const fs = require("node:fs");
const http = require("node:http");

const readyFile = process.argv[2];
if (!readyFile) {
	throw new Error("prewarm_ready_file_required");
}

const server = http.createServer((request, response) => {
	if (acceptsHtml(request)) {
		response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
		response.end(revealHtml());
		return;
	}
	response.writeHead(200, { "content-type": "application/javascript" });
	response.end('// B"H compact fixture bytes\n');
});

server.listen(0, "127.0.0.1", () => {
	const address = server.address();
	fs.writeFileSync(readyFile, JSON.stringify({ port: address.port }));
});

process.on("SIGTERM", () => {
	server.close(() => process.exit(0));
});

/** @param {object} request Incoming HTTP request. @returns {boolean} Whether HTML was requested. */
function acceptsHtml(request) {
	return String(request.headers.accept || "").includes("text/html");
}

/** @returns {string} Nonempty HTML containing one discoverable compact asset. */
function revealHtml() {
	return [
		"<!doctype html>",
		"<html><head>",
		'<script src="/fixture.js?compact=true"></script>',
		"</head><body>B\"H prewarm fixture</body></html>"
	].join("\n");
}
