//B"H — Builds the HelloApk test app with the pure-Awtsmoos packager.
// Inputs: existing libmerkava.so + real app.merkava bytecode.
// No aapt, no apksigner, no keytool anywhere in this path.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { compileNativeAppApk } from "./nativeApk.js";
import { verifySignedApk } from "./signer.js";

const DIST = "/home/hatch/workspace/mw-repo/geelooy/apps/merkava-native-browser/dist/apps/HelloApk-android";
const OUT_DIR = "/home/hatch/workspace/apk-out";
const KEY_DIR = "/home/hatch/workspace/.apk-keys";

const soBytes = new Uint8Array(readFileSync(`${DIST}/lib/arm64-v8a/libmerkava.so`));
const bytecode = new Uint8Array(readFileSync(`${DIST}/assets/app.merkava`));
console.log(`inputs: libmerkava.so=${soBytes.length}B app.merkava=${bytecode.length}B`);

const apk = compileNativeAppApk({
	assets: { "app.merkava": bytecode },
	keyDir: KEY_DIR,
	label: "HelloApk",
	minSdkVersion: 26,
	nativeActivity: { libName: "merkava" },
	nativeLibs: { "arm64-v8a": { "libmerkava.so": soBytes } },
	packageName: "com.merkava.helloapk",
	targetSdkVersion: 35,
	versionCode: 1,
	versionName: "1.0"
});
console.log(`built: ${apk.bytes.length}B mode=${apk.mode}`);

const verified = verifySignedApk(apk.bytes);
for (const item of verified.checks) {
	console.log(`  ${item.ok ? "ok  " : "FAIL"} ${item.name}${item.detail ? ` — ${item.detail}` : ""}`);
}
if (!verified.ok) {
	console.error("SELF-VERIFICATION FAILED");
	process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });
const outPath = `${OUT_DIR}/HelloApk-pure.apk`;
writeFileSync(outPath, apk.bytes);
console.log(`wrote ${outPath}`);
