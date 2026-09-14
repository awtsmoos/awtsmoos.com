//B"H
//Boruch Hashem
//Blessed be He

const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

/**
 * Builds the deterministic bridge APK available without Gradle/SDK installation.
 * It packages canonical bytecode as `assets/app.merkava` beside a minimal Activity.
 * The final NativeActivity/EGL host lives separately and replaces this bridge once
 * an Android NDK/signing toolchain is available.
 * @param {Uint8Array|Buffer} merkavaBytes Verified canonical application bytes.
 * @param {object} options APK identity options.
 * @returns {Promise<object>} Compiler APK result with explicit bridge metadata.
 */
async function buildAndroidBridgeApk(merkavaBytes, options = {}) {
	const compilerPath = path.resolve(__dirname, "../../../compiling/android/apk/compiler.js");
	const { compileJavaActivityApk } = await import(pathToFileURL(compilerPath).href);
	const packageName = options.packageName || "com.awtsmoos.merkava";
	const className = options.className || "MainActivity";
	const source = activitySource(packageName, className);
	const result = await compileJavaActivityApk(source, {
		assets: {
			"app.merkava": Uint8Array.from(merkavaBytes),
			"index.html": bridgeHtml()
		},
		label: options.label || "Merkava",
		minSdkVersion: options.minSdkVersion || 21,
		targetSdkVersion: options.targetSdkVersion || 35
	});
	return {
		...result,
		bridge: true,
		nativeRuntimeReady: false
	};
}

/** Writes an APK atomically from the deterministic bridge compiler result. */
async function writeAndroidBridgeApk(merkavaBytes, outputPath, options = {}) {
	const result = await buildAndroidBridgeApk(merkavaBytes, options);
	const destination = path.resolve(outputPath);
	fs.mkdirSync(path.dirname(destination), { recursive: true });
	const temporary = `${destination}.tmp-${process.pid}`;
	fs.writeFileSync(temporary, Buffer.from(result.bytes));
	fs.renameSync(temporary, destination);
	return { ...result, output: destination };
}

/** Produces only syntax accepted by the repo's deterministic Java subset. */
function activitySource(packageName, className) {
	return `// B"H · Boruch Hashem · Blessed be He
package ${packageName};
import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebView;
public class ${className} extends Activity {
\tprotected void onCreate(Bundle state) {
\t\tsuper.onCreate(state);
\t\tWebView webView = new WebView(this);
\t\twebView.loadUrl("file:///android_asset/index.html");
\t\tsetContentView(webView);
\t}
}`;
}

/** Static bridge page makes the transitional nature visible and non-deceptive. */
function bridgeHtml() {
	return `<!--B"H--><!--Boruch Hashem--><!--Blessed be He--><!doctype html><meta charset="utf-8"><title>Merkava</title><body><h1>Merkava</h1><p>Canonical app.merkava is packaged. NativeActivity execution requires the NDK host.</p></body>`;
}

module.exports = {
	buildAndroidBridgeApk,
	writeAndroidBridgeApk
};
