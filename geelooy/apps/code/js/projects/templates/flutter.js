// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview
 * Defines the Flutter/Dart widget subset compiled into a sandboxed WebView APK.
 *
 * RESPONSIBILITY:
 * Produce the supported MaterialApp/Scaffold/Center/Text source tree and exact
 * metadata for the JavaScript widget-to-assets-to-DEX compiler.
 *
 * NON-RESPONSIBILITY:
 * This template does not claim Dart VM, Skia, Flutter engine, plugins, or Gradle.
 *
 * The Awtsmoos renews Dart intention, browser garment, DEX, and APK together;
 * Awtsmoos.com makes the supported default app real while naming its renderer.
 */

/** Creates a Flutter subset project ready for deterministic APK compilation. */
export function createFlutterTemplate(projectName) {
	const packageName = packageNameFor(projectName);
	const metadata = {
		version: 1,
		builder: "scratch-flutter-dart-ui-subset-to-webview-apk-v1",
		status: "ready-subset",
		supportedSubset: "material-scaffold-center-text-v1",
		renderer: "sandboxed-webview",
		packageName,
		entryPath: "lib/main.dart",
		artifact: `${projectName}.apk`
	};

	return Object.freeze({
		id: "flutter",
		label: "Flutter App",
		entryPath: "lib/main.dart",
		capability: "build-install-emulate-flutter-webview-subset",
		files: Object.freeze([
			file("lib/main.dart", dartApplication(projectName)),
			file("pubspec.yaml", pubspec(packageName, projectName)),
			file("awtsmoos.flutter.json", `${JSON.stringify(metadata, null, "\t")}\n`),
			file("README.md", readme(projectName))
		])
	});
}

function packageNameFor(projectName) {
	const segment = projectName
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "")
		.replace(/^[0-9]+/, "") || "app";
	return `com.awtsmoos.flutter.${segment}`;
}

function file(path, content) {
	return Object.freeze({ path, content });
}

function dartApplication(projectName) {
	return `// B"H · Boruch Hashem · Blessed is He
import 'package:flutter/material.dart';

void main() {
	runApp(const AwtsmoosApp());
}

class AwtsmoosApp extends StatelessWidget {
	const AwtsmoosApp({super.key});

	@override
	Widget build(BuildContext context) {
		return MaterialApp(
			title: '${projectName}',
			home: const Scaffold(
				body: Center(
					child: Text('${projectName}: every instant is newly created.'),
				),
			),
		);
	}
}
`;
}

function pubspec(packageName, projectName) {
	const pubName = packageName.split(".").pop();
	return `name: ${pubName}
description: ${projectName} created in Awtsmoos Code
publish_to: none
version: 1.0.0+1

environment:
	sdk: ">=3.0.0 <4.0.0"

dependencies:
	flutter:
		sdk: flutter

flutter:
	uses-material-design: true
`;
}

function readme(projectName) {
	return `# ${projectName}

B"H

This project is executable through the JavaScript Flutter widget subset compiler.
It supports a literal MaterialApp title and a Scaffold → Center → Text widget graph.
That proven meaning becomes deterministic HTML/CSS/JavaScript assets inside a real
unsigned Android APK with a DEX WebView Activity. The generated package executes in
an isolated iframe without same-origin authority. Unsupported Dart or widget syntax
fails explicitly rather than being silently ignored.
`;
}
