//B"H — signer self-test: build, sign, verify, tamper, re-verify.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { compileNativeAppApk } from "./nativeApk.js";
import { getOrCreateSigningKey, signApkEntries, verifySignedApk } from "./signer.js";

let failures = 0;
function check(name, condition, detail = "") {
	if (condition) {
		console.log(`  ok   ${name}`);
	} else {
		failures += 1;
		console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ""}`);
	}
}

const keyDir = mkdtempSync(join(tmpdir(), "awtsmoos-apk-test-"));
try {
	const key = getOrCreateSigningKey(keyDir);
	check("key-created", !!key.privateKeyPem && key.certDer.length > 200, `cert=${key.certDer.length}B`);
	const keyAgain = getOrCreateSigningKey(keyDir);
	check("key-persistent", Buffer.from(keyAgain.certDer).equals(Buffer.from(key.certDer)));

	const fakeSo = new Uint8Array(5000).map((_, i) => i & 0xff);
	const apk = compileNativeAppApk({
		assets: { "app.merkava": new TextEncoder().encode("MKV1-test-bytecode") },
		keyDir,
		label: "HelloApk",
		nativeActivity: { libName: "merkava" },
		nativeLibs: { "arm64-v8a": { "libmerkava.so": fakeSo } },
		packageName: "com.merkava.helloapk",
		versionCode: 1,
		versionName: "1.0"
	});
	check("apk-built", apk.bytes.length > 8000, `${apk.bytes.length}B`);

	const verified = verifySignedApk(apk.bytes);
	for (const item of verified.checks) check(`verify:${item.name}`, item.ok, item.detail || "");
	check("verify:overall", verified.ok);

	// Tamper with one payload byte inside the .so region; v2 must catch it.
	const tampered = Uint8Array.from(apk.bytes);
	const marker = tampered.indexOf(0x7f);
	if (marker > 0) tampered[marker] ^= 0xff;
	const tamperedResult = verifySignedApk(tampered);
	check("tamper-detected", !tamperedResult.ok);

	// v1-only and v2-only variants still verify their own scheme.
	const v1Only = signApkEntries(
		[{ alignment: 4, bytes: new TextEncoder().encode("<manifest/>"), name: "AndroidManifest.xml" }],
		key,
		{ v1: true, v2: false }
	);
	const v1Checks = verifySignedApk(v1Only.bytes).checks;
	check("v1-only:self-consistent", v1Checks.some((c) => c.name === "v1-manifest-digests" && c.ok));

	console.log(failures === 0 ? "ALL SIGNER TESTS PASS" : `${failures} FAILURES`);
	process.exit(failures === 0 ? 0 : 1);
} finally {
	rmSync(keyDir, { recursive: true, force: true });
}
