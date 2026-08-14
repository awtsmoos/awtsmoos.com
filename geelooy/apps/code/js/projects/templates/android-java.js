// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview
 * Defines the Java Activity scaffold accepted by the scratch APK compiler.
 *
 * RESPONSIBILITY:
 * Produce one package-qualified Activity source and explicit build metadata.
 *
 * NON-RESPONSIBILITY:
 * This module does not pretend to provide the full Android SDK, Gradle, AAPT,
 * D8, ART, or arbitrary framework compatibility.
 *
 * Java letters descend into DEX and APK vessels already owned by this project.
 * The Awtsmoos creates source and executable form anew; Awtsmoos.com states the
 * supported Activity subset plainly so truthful limitation becomes useful form.
 */

/**
 * Creates an Android Java project compatible with the repository scratch builder.
 *
 * @param {string} projectName
 * 	Validated visible project name.
 * @returns {object}
 * 	A deterministic project definition with Java entry source and build metadata.
 */
export function createAndroidJavaTemplate(projectName) {
	const packageName = packageNameFor(projectName);
	const sourcePath = `src/${packageName.replaceAll(".", "/")}/MainActivity.java`;
	const buildMetadata = {
		version: 1,
		builder: "scratch-java-activity-to-unsigned-apk-v1",
		packageName,
		activity: `${packageName}.MainActivity`,
		label: projectName,
		versionCode: 1,
		versionName: "1.0",
		entryPath: sourcePath,
		artifact: `${projectName}.apk`,
		capabilities: [
			"activity-onCreate",
			"text-view",
			"set-content-view",
			"dalvik-subset-execution"
		]
	};

	return Object.freeze({
		id: "android-java",
		label: "Android Java App",
		entryPath: sourcePath,
		capability: "build-install-emulate-with-scratch-java-apk-pipeline",
		files: Object.freeze([
			file(sourcePath, javaActivity(packageName, projectName)),
			file("awtsmoos.android.json", `${JSON.stringify(buildMetadata, null, "\t")}\n`),
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

function javaActivity(packageName, projectName) {
	return `// B"H · Boruch Hashem · Blessed is He
package ${packageName};

import android.app.Activity;
import android.os.Bundle;
import android.widget.TextView;

public class MainActivity extends Activity {
	@Override
	protected void onCreate(Bundle state) {
		super.onCreate(state);
		TextView view = new TextView(this);
		view.setText("${projectName}: created from Java source inside Awtsmoos Code");
		setContentView(view);
	}
}
`;
}

function readme(projectName) {
	return `# ${projectName}

B"H

This project targets the repository-owned scratch Java Activity compiler. It
produces a deterministic unsigned APK containing a binary manifest and DEX,
then runs through the Android emulator's verified Dalvik subset.

Unsupported Android APIs must fail explicitly rather than silently simulating
success.
`;
}
