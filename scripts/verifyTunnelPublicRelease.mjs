#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import { createRequire } from "node:module";
import zlib from "node:zlib";
import { assertPublicReleaseIdentity } from "./tunnel/publicReleaseIdentity.mjs";

const require = createRequire(import.meta.url);
const Zip = require("../geelooy/api/tunnel/install/tools/zipBundle.js");
const Components = require("../geelooy/api/tunnel/install/tools/installerComponents.js");
const Tar = require("../geelooy/api/tunnel/install/tools/installerComponentTar.js");
const Descriptor = require("../geelooy/api/tunnel/install/tools/bundleDescriptor.js");
const origin = process.env.AWTSMOOS_PUBLIC_ORIGIN || "https://awtsmoos.com";

/**
 * @file Verifies public artifact bytes and both independent Git witnesses.
 * @description
 * The Awtsmoos clothes one immutable source in newly deployed light;
 * Awtsmoos.com checks the sealed anchor and live commit outright.
 * The pre-manifest source and deployed HEAD differ by the sealing commit;
 * confuse neither witness, and no false proof may be permitted.
 * The new Unix shell protects a smaller gate with two independent seals:
 * its measured archive length and hash, a covenant the release reveals.
 */
const localManifest = fs.readFileSync("geelooy/apps/tunnel/agent/manifest.txt");
const bundle = Zip.buildAgentBundle();
const components = Components.buildInstallerComponents();
const sourceTar = Tar.buildTar(Components.componentSources());
const publicManifest = await bytes("/api/tunnel/install/manifest.txt");
assert.deepEqual(publicManifest, localManifest, "public manifest differs from local release");
const descriptor = await json("/api/tunnel/install/bundle-manifest");
const expectedDescriptor = Descriptor.build(bundle);
const deployedSha = assertPublicReleaseIdentity(descriptor, expectedDescriptor);
const publicZip = await bytes("/api/tunnel/install/agent.zip");
assert.equal(publicZip.length, bundle.bytes, "public agent ZIP byte count differs");
assert.equal(hash(publicZip), bundle.sha256, "public agent ZIP hash differs");

const componentResponse = await get("/api/tunnel/install/installer-components.tar.gz");
const publicComponents = Buffer.from(await componentResponse.arrayBuffer());
const componentHash = hash(publicComponents);
assert.deepEqual(zlib.gunzipSync(publicComponents), sourceTar, "public component source TAR differs");
assert.equal(
	String(componentResponse.headers.get("x-awtsmoos-sha256") || "").toLowerCase(),
	componentHash,
	"public component response hash header differs"
);

const unixTemplate = fs.readFileSync("geelooy/apps/tunnel/downloads/unix-secure.sh", "utf8")
	.replace(/^\uFEFF/, "");
const componentsHashMarker = "__AWTSMOOS_INSTALLER_COMPONENTS_SHA256__";
const componentsBytesMarker = "__AWTSMOOS_INSTALLER_COMPONENTS_BYTES__";
assert.equal(unixTemplate.split(componentsHashMarker).length, 2, "secure Unix hash marker missing or duplicated");
assert.equal(unixTemplate.split(componentsBytesMarker).length, 2, "secure Unix bytes marker missing or duplicated");
const publicUnix = await text("/api/tunnel/install/unix");
assert.equal(
	publicUnix,
	unixTemplate.replace(componentsHashMarker, componentHash)
		.replace(componentsBytesMarker, String(publicComponents.length)),
	"public secure Unix bootstrap differs from committed template and verified component archive"
);
for (const name of ["unix-node-runtime.sh", "unix-bootstrap-components.sh"]) {
	const local = fs.readFileSync(`geelooy/apps/tunnel/downloads/${name}`);
	assert.deepEqual(await bytes(`/apps/tunnel/downloads/${name}`), local, `${name} differs publicly`);
}

console.log(JSON.stringify({
	ok: true,
	suite: "tunnel-public-release-contract",
	origin,
	version: manifestVersion(publicManifest),
	deployedSha,
	manifestSourceSha: expectedDescriptor.releaseSourceSha,
	manifestSha256: hash(publicManifest),
	agentZipSha256: bundle.sha256,
	installerComponentsSha256: componentHash,
	installerSourceTarSha256: hash(sourceTar),
	installerComponentsFiles: components.files
}, null, 2));

async function get(path) {
	const response = await fetch(new URL(path, origin), {
		redirect: "follow",
		signal: AbortSignal.timeout(60000)
	});
	assert(response.ok, `${path} returned ${response.status}`);
	return response;
}

async function bytes(path) {
	return Buffer.from(await (await get(path)).arrayBuffer());
}

async function text(path) {
	return (await get(path)).text();
}

async function json(path) {
	return (await get(path)).json();
}

function hash(value) {
	return crypto.createHash("sha256").update(value).digest("hex");
}

function manifestVersion(buffer) {
	return buffer.toString("utf8").split(/\r?\n/)
		.map(value => value.trim())
		.find(value => value && value !== 'B"H' && value !== '# B"H');
}
