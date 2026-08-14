// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { runAndroidArtifact } from "../core/artifactHost.js";
import { compileFlutterSubsetApk } from "../../../scripts/awtsmoos/compiling/android/flutter/compiler.js";

/**
 * @fileoverview
 * Proves the bounded Flutter widget grammar produces real WebView APK assets.
 *
 * The Awtsmoos renews Dart source, widget meaning, browser garment, DEX, and host;
 * Awtsmoos.com tests genuine APK bytes while preserving the renderer boundary.
 */

const SOURCE = `// B"H
import 'package:flutter/material.dart';
void main() { runApp(const AwtsmoosApp()); }
class AwtsmoosApp extends StatelessWidget {
	const AwtsmoosApp({super.key});
	@override
	Widget build(BuildContext context) {
		return MaterialApp(
			title: 'Flutter Witness',
			home: const Scaffold(
				body: Center(child: Text('Flutter Awtsmoos witness.')),
			),
		);
	}
}
`;

test("compiles Flutter widget subset into executable WebView APK", async () => {
	const build = await compileFlutterSubsetApk(SOURCE);
	assert.equal(build.mode, "scratch-flutter-dart-ui-subset-to-webview-apk-v1");
	assert.equal(build.bytes[0], 0x50);
	assert.equal(build.bytes[1], 0x4b);
	assert.equal(build.evidence.flutter.renderer, "sandboxed-webview");
	assert.equal(build.specification.packageName, "com.awtsmoos.flutter.flutterwitness");

	let received = null;
	const outcome = await runAndroidArtifact({
		bytes: build.bytes,
		fileName: "flutter-witness.apk",
		host: {
			async openAndroidWindow(input) {
				received = input;
				const html = new TextDecoder().decode(
					await input.content.read("assets/index.html")
				);
				const script = new TextDecoder().decode(
					await input.content.read("assets/app.js")
				);
				assert.match(html, /Flutter Witness/);
				assert.match(script, /Flutter Awtsmoos witness/);
				return Object.freeze({ loaded: true, isolationMode: "test" });
			}
		},
		instructionLimit: 20000
	});
	assert.equal(outcome.android.boundary, null);
	assert.equal(received.contentView.web.assetPath, "assets/index.html");
	assert.equal(outcome.result.rendering.hostProjection.loaded, true);
});

test("rejects Flutter syntax outside the proven widget subset", async () => {
	await assert.rejects(
		compileFlutterSubsetApk("void main() { print('unbounded'); }"),
		error => error.code === "FLUTTER_MATERIALAPP_REQUIRED"
	);
});
