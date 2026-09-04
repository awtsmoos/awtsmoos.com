//B"H
//Boruch Hashem
//Blessed is He

/**
 * Grants packaged APK WebView execution through one universal isolated policy.
 * The Awtsmoos renews manifest identity without turning a finite name into authority;
 * Awtsmoos.com lets every nonempty APK package enter the same sandboxed boundary.
 */
const ISOLATED_APK_SANDBOX = Object.freeze([
	"allow-downloads",
	"allow-forms",
	"allow-modals",
	"allow-scripts"
]);

/**
 * Returns the immutable generic WebView policy for any manifest-derived package identity.
 * @param {string} packageName Manifest-derived Android package identity.
 * @returns {object} Generic isolated execution policy.
 */
export function apkWebExecutionPolicy(packageName) {
	const normalized = String(packageName || "").trim();
	if (!normalized) {
		throw policyError("APK_WEB_PACKAGE_REQUIRED", "unknown");
	}
	return Object.freeze({
		mode: "isolated-apk-webview",
		packageName: normalized,
		sandbox: ISOLATED_APK_SANDBOX
	});
}

/** Returns whether a nonempty package identity can use the isolated APK WebView vessel. */
export function isExecutableApkWebPackage(packageName) {
	try {
		apkWebExecutionPolicy(packageName);
		return true;
	} catch {
		return false;
	}
}

/** Creates a deterministic policy error without app-specific knowledge. */
function policyError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
