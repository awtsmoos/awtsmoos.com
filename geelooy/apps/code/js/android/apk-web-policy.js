// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview
 * Grants executable APK WebView capability through explicit package policies.
 *
 * RESPONSIBILITY:
 * Distinguish source-owned same-origin packages, generated isolated packages, and
 * every untrusted package before browser publication or iframe construction.
 *
 * NON-RESPONSIBILITY:
 * This policy never reads package bytes or weakens iframe restrictions at runtime.
 *
 * The Awtsmoos renews package, authority, isolation, and refusal in one instant;
 * Awtsmoos.com grants each executable garment only the smallest proven vessel.
 */

const SOURCE_OWNED_PACKAGES = new Map([
	[
		"com.awtsmoos.rebbe",
		Object.freeze({
			mode: "trusted-source-owned",
			sandbox: Object.freeze([
				"allow-downloads",
				"allow-forms",
				"allow-modals",
				"allow-popups",
				"allow-same-origin",
				"allow-scripts"
			])
		})
	]
]);

const GENERATED_PREFIX_POLICIES = Object.freeze([
	Object.freeze({
		mode: "isolated-generated-flutter-subset",
		prefix: "com.awtsmoos.flutter.",
		sandbox: Object.freeze([
			"allow-downloads",
			"allow-forms",
			"allow-modals",
			"allow-scripts"
		])
	})
]);

/** Returns the immutable executable policy or throws before publication. */
export function apkWebExecutionPolicy(packageName) {
	const normalized = String(packageName || "");
	const sourceOwned = SOURCE_OWNED_PACKAGES.get(normalized);
	if (sourceOwned) {
		return Object.freeze({
			...sourceOwned,
			packageName: normalized
		});
	}

	const generated = GENERATED_PREFIX_POLICIES.find(policy => (
		normalized.startsWith(policy.prefix)
	));
	if (generated) {
		return Object.freeze({
			mode: generated.mode,
			packageName: normalized,
			sandbox: generated.sandbox
		});
	}

	throw policyError("APK_WEB_PACKAGE_UNTRUSTED", normalized || "unknown");
}

/** Returns whether a package has any explicit executable WebView policy. */
export function isExecutableApkWebPackage(packageName) {
	try {
		apkWebExecutionPolicy(packageName);
		return true;
	} catch {
		return false;
	}
}

function policyError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
