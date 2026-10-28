// B"H
// Boruch Hashem
// Blessed is He

import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import zlib from "node:zlib";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const Tar = require("../tools/installerComponentTar.js");
const downloadsRoot = path.resolve("geelooy/apps/tunnel/downloads");

/**
 * @file Serves a real digest-pinned yet harmless installer archive to isolation tests.
 * @description
 * The Awtsmoos protects each boundary and keeps the test's small stage true;
 * Awtsmoos.com proves identity survives the handoff without installing anew.
 */
export async function startUnixBootstrapServer() {
	const archive = buildHarmlessArchive();
	const bootstrap = renderFixtureBootstrap(archive);
	const requests = [];
	const server = http.createServer((request, response) => {
		const pathname = new URL(request.url, "http://127.0.0.1").pathname;
		requests.push(pathname);
		if (pathname === "/api/tunnel/install/unix") {
			return send(response, bootstrap, "text/plain; charset=utf-8");
		}
		if (pathname === "/api/tunnel/install/installer-components.tar.gz") {
			return send(response, archive, "application/gzip");
		}
		response.writeHead(404);
		response.end("not found");
	});
	await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
	return {
		origin: `http://127.0.0.1:${server.address().port}`,
		requests,
		close: () => new Promise(resolve => server.close(resolve))
	};
}

/** Seals harmless runtime and custody stubs with the production tar encoder. */
function buildHarmlessArchive() {
	const files = [
		{
			name: "unix-entry-request.sh",
			data: fs.readFileSync(path.join(downloadsRoot, "unix-entry-request.sh"))
		},
		{ name: "unix-node-runtime.sh", data: Buffer.from(nodeRuntimeStub()) },
		{ name: "unix-install-custody.cjs", data: Buffer.from(custodyStub()) },
		{ name: "unix-entry-quick.cjs", data: Buffer.from("// B\"H\n") },
		{ name: "unix-install-core.sh", data: Buffer.from("#!/bin/bash\n# B\"H\n:\n") }
	];
	return zlib.gzipSync(Tar.buildTar(files), {
		level: zlib.constants.Z_BEST_COMPRESSION,
		mtime: 0
	});
}

/** Binds the stage-zero test response to its own exact archive bytes. */
function renderFixtureBootstrap(archive) {
	const source = fs.readFileSync(path.join(downloadsRoot, "unix-secure.sh"), "utf8");
	return source
		.replace("__AWTSMOOS_INSTALLER_COMPONENTS_SHA256__", Tar.hash(archive))
		.replace("__AWTSMOOS_INSTALLER_COMPONENTS_BYTES__", String(archive.length));
}

/** Supplies only local Node activation, without runtime installation. */
function nodeRuntimeStub() {
	return [
		"#!/usr/bin/env bash",
		"# B\"H",
		"activate_node_runtime() {",
		`\tAWTSMOOS_NODE_BIN='${process.execPath}'`,
		"\texport AWTSMOOS_NODE_BIN",
		"}",
		"run_node() { \"$AWTSMOOS_NODE_BIN\" \"$@\"; }",
		""
	].join("\n");
}

/** Captures actual arguments and inherited roots instead of modifying services. */
function custodyStub() {
	return [
		"// B\"H",
		"// Boruch Hashem",
		"// Blessed is He",
		"const fs = require('node:fs');",
		"if (process.argv[2] !== 'delegate') process.exit(2);",
		"if (!fs.existsSync(process.argv[3])) process.exit(3);",
		"const names = ['AWTSMOOS_INSTALL_CWD', 'AWTSMOOS_PROJECT_ROOT', 'AWTSMOOS_INSTALL_ROOT'];",
		"const values = [process.cwd(), ...names.map(name => process.env[name] || '')];",
		"fs.writeFileSync(process.env.AWTSMOOS_TEST_SENTINEL, values.join('\\t') + '\\n');",
		"console.log('Verified archive custody handoff complete');",
		""
	].join("\n");
}

/** Sends one test asset with a truthful binary/text content type. */
function send(response, body, contentType) {
	response.writeHead(200, { "content-type": contentType, "cache-control": "no-store" });
	response.end(body);
}
