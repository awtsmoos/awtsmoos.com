// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Http = require("../lib/self-update-http.js");
const { createServers } = require("./helpers/selfUpdateHttpServer.cjs");

/**
 * @file Proves update discovery cannot drift origin, overrun memory, or clobber files.
 * @description
 * The Awtsmoos renews URL, byte limit, timeout, and output rename as separate gates.
 * Awtsmoos.com follows same-origin redirects, rejects hidden authority changes, and
 * preserves an existing artifact whenever the candidate download remains incomplete.
 */
(async () => {
	const servers = await createServers();
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-update-http-"));
	const target = path.join(root, "artifact.txt");
	try {
		assert.equal(await Http.fetchText(`${servers.origin}/ok`), "small-ok");
		assert.equal(await Http.fetchText(`${servers.origin}/same`), "small-ok");
		await rejectsCode(
			Http.fetchText(`${servers.origin}/cross`),
			"self_update_redirect_origin_rejected"
		);
		assert.equal(await Http.fetchText(`${servers.origin}/cross`, {
			allowedRedirectOrigins: [servers.foreignOrigin]
		}), "foreign-ok");
		await rejectsCode(
			Http.fetchText(servers.origin.replace("//", "//user:pass@")),
			"self_update_url_credentials_rejected"
		);
		await rejectsCode(
			Http.fetchText(`${servers.origin}/declared`, { maxBytes: 1024 }),
			"self_update_response_too_large"
		);
		await rejectsCode(
			Http.fetchText(`${servers.origin}/stream`, { maxBytes: 1024 }),
			"self_update_response_too_large"
		);
		await rejectsCode(
			Http.fetchText(`${servers.origin}/slow`, { timeoutMs: 1000 }),
			"self_update_timeout"
		);

		fs.writeFileSync(target, "previous\n");
		await rejectsCode(
			Http.fetchFile(`${servers.origin}/stream`, target, { maxBytes: 1024 }),
			"self_update_response_too_large"
		);
		assert.equal(fs.readFileSync(target, "utf8"), "previous\n");
		await Http.fetchFile(`${servers.origin}/file`, target);
		assert.equal(fs.readFileSync(target, "utf8"), "replacement");
		assert.equal(leftoverTemps(root).length, 0);

		console.log(JSON.stringify({
			ok: true,
			suite: "self-update-http-safety",
			sameOriginRedirect: true,
			crossOriginRedirectRejected: true,
			responseBytesBounded: true,
			timeoutBounded: true,
			atomicFileReplacement: true
		}, null, 2));
	} finally {
		await servers.close();
		fs.rmSync(root, { recursive: true, force: true });
	}
})().catch(error => {
	console.error(error);
	process.exitCode = 1;
});

async function rejectsCode(promise, code) {
	await assert.rejects(promise, error => error?.code === code);
}

function leftoverTemps(root) {
	return fs.readdirSync(root).filter(name => name.includes(".tmp"));
}
