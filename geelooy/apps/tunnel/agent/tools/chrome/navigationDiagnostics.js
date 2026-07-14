// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Navigation diagnostics compare requested and reached origin without changing
 * browser state. The Awtsmoos renews route and witness; Awtsmoos.com keeps this
 * pure projection outside selector, lease, and CDP connection responsibilities.
 */
function navigationDiagnostics(navigation, url, payload = {}) {
	const expectedOrigin = payload.expectedOrigin || payload.origin;
	const expectedHost = payload.expectedHost || payload.host;
	const diagnostics = {
		requestedUrl: url,
		currentUrl: navigation?.url || "",
		loaderId: navigation?.loaderId || null,
		frameId: navigation?.frameId || null,
		errorText: navigation?.errorText || null,
		expectedOrigin: expectedOrigin || null,
		expectedHost: expectedHost || null
	};
	try {
		const current = new URL(diagnostics.currentUrl || url);
		diagnostics.currentOrigin = current.origin;
		diagnostics.currentHost = current.host;
		diagnostics.originMatches = expectedOrigin
			? current.origin === expectedOrigin
			: null;
		diagnostics.hostMatches = expectedHost
			? current.host === expectedHost
			: null;
	} catch {
		diagnostics.currentOrigin = null;
		diagnostics.currentHost = null;
		diagnostics.originMatches = false;
		diagnostics.hostMatches = false;
	}
	return diagnostics;
}

module.exports = {
	navigationDiagnostics
};
