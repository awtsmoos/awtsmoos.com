// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview
 * Resolves the living Java, Kotlin, or Flutter source from Apps Code tab state.
 *
 * RESPONSIBILITY:
 * Select the active supported tab, prefer its unsaved editor value, derive language,
 * and produce a safe visible APK label without reading stale filesystem content.
 *
 * NON-RESPONSIBILITY:
 * This module never compiles, persists, or launches the resolved source.
 *
 * The Awtsmoos renews unsaved Java, Kotlin, and Dart letters before every build;
 * Awtsmoos.com compiles the living editor while naming each bounded language vessel.
 */

const LANGUAGE_BY_EXTENSION = Object.freeze({
	".dart": "flutter",
	".java": "java",
	".kt": "kotlin"
});

/** Resolves one active Android source record. */
export function resolveActiveAndroidSource(options = {}) {
	const activeTab = options.tabs?.find(tab => tab.id === options.activeTabId);
	const item = activeTab?.item;
	const path = String(item?.path || "");
	if (!path) {
		throw sourceError(
			"ACTIVE_ANDROID_SOURCE_REQUIRED",
			"Open a Java, Kotlin, or Flutter source file before building an APK."
		);
	}

	const extension = path.match(/\.[^.\/\\]+$/)?.[0]?.toLowerCase() || "";
	const language = LANGUAGE_BY_EXTENSION[extension];
	if (!language) {
		throw sourceError(
			"ACTIVE_ANDROID_SOURCE_UNSUPPORTED",
			"The active file must end in .java, .kt, or .dart."
		);
	}

	const source = String(
		options.activeEditorValue
		?? activeTab?.content
		?? item?.content
		?? ""
	);
	if (!source.trim()) {
		throw sourceError(
			"ACTIVE_ANDROID_SOURCE_EMPTY",
			"The active Android source is empty."
		);
	}

	const label = sourceLabel(path);
	return Object.freeze({
		artifactName: `${label}.apk`,
		extension,
		label,
		language,
		path,
		source
	});
}

function sourceLabel(path) {
	const leaf = path.replace(/\\/g, "/").split("/").pop() || "AndroidApp";
	const stem = leaf.replace(/\.[^.]+$/, "") || "AndroidApp";
	return stem.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "")
		|| "AndroidApp";
}

function sourceError(code, message) {
	const error = new Error(message);
	error.code = code;
	return error;
}
