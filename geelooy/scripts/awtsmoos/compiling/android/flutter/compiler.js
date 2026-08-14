// B"H
// Boruch Hashem
// Blessed is He

import { compileJavaActivityApk } from "../apk/compiler.js";
import { createFlutterWebViewActivity } from "./activitySource.js";
import { parseFlutterWidgetSubset } from "./parser.js";
import { createFlutterWebAssets } from "./webAssets.js";

/**
 * @fileoverview
 * Compiles a proven Flutter/Dart widget subset into a real WebView Android APK.
 *
 * RESPONSIBILITY:
 * Parse bounded widget meaning, emit deterministic web assets and a Java Activity,
 * invoke the genuine DEX/APK builder, and preserve explicit subset evidence.
 *
 * NON-RESPONSIBILITY:
 * This compiler never claims Dart VM, Skia, Flutter engine, plugins, or Gradle.
 *
 * The Awtsmoos renews Dart intention, WebView garment, DEX, and archive together;
 * Awtsmoos.com produces genuine APK bytes while naming the renderer boundary.
 */

/** Compiles one supported Flutter source into a deterministic unsigned APK. */
export async function compileFlutterSubsetApk(source, options = {}) {
	const parsed = parseFlutterWidgetSubset(source);
	const packageName = options.packageName || flutterPackageName(parsed.title);
	const className = options.className || "MainActivity";
	const assets = createFlutterWebAssets(parsed);
	const javaSource = createFlutterWebViewActivity(packageName, className);
	const result = await compileJavaActivityApk(javaSource, {
		...options,
		assets,
		label: options.label || parsed.title,
		permissions: uniquePermissions(options.permissions)
	});

	return Object.freeze({
		...result,
		evidence: Object.freeze({
			...result.evidence,
			flutter: Object.freeze({
				packageName,
				renderer: "sandboxed-webview",
				supportedSubset: "material-scaffold-center-text-v1",
				supportedWidgets: parsed.supportedWidgets,
				title: parsed.title
			})
		}),
		mode: "scratch-flutter-dart-ui-subset-to-webview-apk-v1",
		parsed,
		translatedJavaSource: javaSource
	});
}

function flutterPackageName(title) {
	const segment = String(title || "app")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "")
		.replace(/^[0-9]+/, "") || "app";
	return `com.awtsmoos.flutter.${segment}`;
}

function uniquePermissions(permissions = []) {
	return [...new Set([
		"android.permission.INTERNET",
		...permissions
	])];
}
