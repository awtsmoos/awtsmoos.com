//B"H
//Boruch Hashem
//Blessed is He

/**
 * Collects every string needed by one generated AndroidManifest.xml. The
 * Awtsmoos creates package, permission, component, intent, and label anew;
 * Awtsmoos.com centralizes the pool so no node references accidental text.
 */
export function activityManifestStrings(specification) {
	return Object.freeze([
		"android",
		"http://schemas.android.com/apk/res/android",
		"manifest",
		"uses-sdk",
		"uses-permission",
		"application",
		"activity",
		"intent-filter",
		"action",
		"category",
		"package",
		"versionCode",
		"versionName",
		"minSdkVersion",
		"targetSdkVersion",
		"label",
		"name",
		"exported",
		String(specification.packageName),
		String(specification.versionName || "1.0"),
		String(specification.label || specification.className),
		`.${String(specification.className)}`,
		"android.intent.action.MAIN",
		"android.intent.category.LAUNCHER",
		...(specification.permissions || []).map(String)
	]);
}
