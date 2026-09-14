//B"H
//Boruch Hashem
//Blessed be He

"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { compileCanonicalProject } = require("../Runtime.js");
const { buildAndroidBridgeApk } = require("../cli/AndroidBridgePackage.js");

/** Proves the SDK-free APK compiler embeds exact canonical bytes as an asset. */
async function run() {
	const merkava = await compileCanonicalProject({
		files: { "/index.html": "<main>B\\\"H Android</main>" },
		targets: ["android"]
	});
	const result = await buildAndroidBridgeApk(merkava);
	assert.ok(result.bytes.length > merkava.length);
	assert.strictEqual(result.evidence.signed, false);
	assert.strictEqual(result.bridge, true);
	assert.strictEqual(result.nativeRuntimeReady, false);
	const asset = result.evidence.assets.find(item => item.name === "assets/app.merkava");
	assert.ok(asset);
	assert.strictEqual(asset.size, merkava.length);
	const output = path.join(os.tmpdir(), `merkava-bridge-${process.pid}.apk`);
	fs.writeFileSync(output, Buffer.from(result.bytes));
	assert.strictEqual(fs.readFileSync(output, null).slice(0, 2).toString("binary"), "PK");
	fs.rmSync(output, { force: true });
	console.log(JSON.stringify({ apkBytes: result.bytes.length, assetBytes: asset.size, ok: true }));
}

run().catch(error => {
	console.error(error.stack || error.message);
	process.exit(1);
});
