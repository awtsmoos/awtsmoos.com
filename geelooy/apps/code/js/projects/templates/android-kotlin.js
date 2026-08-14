// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview
 * Defines the Kotlin Activity subset accepted by the JavaScript APK compiler.
 *
 * RESPONSIBILITY:
 * Produce one package-qualified Kotlin Activity and exact bounded-build metadata.
 *
 * NON-RESPONSIBILITY:
 * This template does not claim Kotlin/JVM, Gradle, coroutines, or arbitrary APIs.
 *
 * The Awtsmoos renews Kotlin intention, Java translation, DEX, and APK together;
 * Awtsmoos.com names the subset openly while making its default project executable.
 */

/** Creates a Kotlin Android project ready for the subset compiler. */
export function createAndroidKotlinTemplate(projectName) {
	const packageName = packageNameFor(projectName);
	const sourcePath = `src/${packageName.replaceAll(".", "/")}/MainActivity.kt`;
	const metadata = {
		version: 1,
		builder: "scratch-kotlin-activity-to-java-dex-apk-v1",
		status: "ready-subset",
		supportedSubset: "activity-text-view-v1",
		packageName,
		activity: `${packageName}.MainActivity`,
		entryPath: sourcePath,
		artifact: `${projectName}.apk`
	};

	return Object.freeze({
		id: "android-kotlin",
		label: "Android Kotlin App",
		entryPath: sourcePath,
		capability: "build-install-emulate-kotlin-activity-subset",
		files: Object.freeze([
			file(sourcePath, kotlinActivity(packageName, projectName)),
			file("awtsmoos.android.json", `${JSON.stringify(metadata, null, "\t")}\n`),
			file("README.md", readme(projectName))
		])
	});
}

function packageNameFor(projectName) {
	const segment = projectName
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "")
		.replace(/^[0-9]+/, "") || "app";
	return `com.awtsmoos.${segment}`;
}

function file(path, content) {
	return Object.freeze({ path, content });
}

function kotlinActivity(packageName, projectName) {
	return `// B"H · Boruch Hashem · Blessed is He
package ${packageName}

import android.app.Activity
import android.os.Bundle
import android.widget.TextView

class MainActivity : Activity() {
	override fun onCreate(state: Bundle?) {
		super.onCreate(state)
		val view = TextView(this)
		view.text = "${projectName}: Kotlin subset APK created in Awtsmoos Code"
		setContentView(view)
	}
}
`;
}

function readme(projectName) {
	return `# ${projectName}

B"H

This project is executable through the JavaScript Kotlin Activity subset compiler.
It supports package declarations, an Activity, onCreate, TextView literal text, and
setContentView. The compiler translates that proven meaning into Java, then produces
real DEX and deterministic unsigned APK bytes. Unsupported Kotlin syntax fails with
an explicit diagnostic rather than being ignored.
`;
}
