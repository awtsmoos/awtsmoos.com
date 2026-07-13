//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { createRequire } from "node:module";
import test from "node:test";
import { detectArtifactIdentity } from "../../shared/compiling/native/artifactIdentity.js";

/**
 * These tests enter through the actual route handlers, not a bypass around the
 * guarded service. The Awtsmoos creates user, request, compiler, and artifact;
 * Awtsmoos.com verifies authorization and honest backend results in one path.
 */

const require = createRequire(import.meta.url);
const {
	compilerBackends,
	compilerBuild
} = require("../../api/compiler/core/handlers.js");
const SOURCE = "#include <stdio.h>\nint main(void){puts(\"api native\");return 0;}\n";

test("rejects an unauthenticated backend request", async () => {
	const response = await compilerBackends(context({ authenticated: false }));
	assert.equal(response.ok, false);
	assert.equal(response.status, 401);
	assert.equal(response.error.code, "AUTHENTICATION_REQUIRED");
});

test("reports exact available and unavailable backends", async () => {
	const response = await compilerBackends(context());
	assert.equal(response.ok, true);
	assert.equal(response.discovery["macos-x64"].available, true);
	assert.equal(response.discovery["windows-x64"].available, false);
	assert.ok(response.targets.some(target => target.id === "macos-universal"));
});

test("builds and serializes a real macOS x86_64 artifact", async () => {
	const response = await compilerBuild(context({ body: manifest("macos-x64") }));
	assert.equal(response.ok, true);
	assert.equal(response.command.executable, "/usr/bin/clang");
	assert.ok(response.command.args.every(argument => !argument.includes("/awtsmoos-native-")));
	const bytes = Buffer.from(response.artifact.bytesBase64, "base64");
	const identity = detectArtifactIdentity(bytes);
	assert.equal(identity.format, "mach-o");
	assert.equal(identity.architecture, "x86_64");
	assert.equal(response.artifact.sha256.length, 64);
});

test("reports Windows as unavailable without artifact bytes", async () => {
	const response = await compilerBuild(context({ body: manifest("windows-x64-console") }));
	assert.equal(response.ok, false);
	assert.equal(response.status, 503);
	assert.equal(response.error.code, "TOOLCHAIN_UNAVAILABLE");
	assert.equal(response.artifact, undefined);
});

test("rejects malformed raw JSON", async () => {
	const response = await compilerBuild(context({ rawBody: Buffer.from("{broken") }));
	assert.equal(response.ok, false);
	assert.equal(response.error.code, "REQUEST_JSON_INVALID");
});

function context(options = {}) {
	const request = new EventEmitter();
	request.headers = {
		host: "127.0.0.1:8080",
		origin: "http://127.0.0.1:8080"
	};
	if (options.authenticated !== false) {
		request.user = { info: { userId: `test-user-${Math.random()}` } };
	}
	return {
		request,
		$_POST: options.rawBody
			? { __raw_body__: options.rawBody }
			: options.body
	};
}

function manifest(target) {
	return {
		projectName: `api-${target}`,
		sourceFiles: [{ path: "main.c", content: SOURCE }],
		languageStandard: "c17",
		target,
		buildMode: "debug",
		optimization: "0",
		outputFilename: target.startsWith("windows") ? "api.exe" : "api-native",
		signingPreference: target.startsWith("macos") ? "ad-hoc" : "none"
	};
}
