// B"H
// Boruch Hashem
// Blessed be He

/**
 * @file securityHeaders.js
 * @description
 * Central security-header vessel for Awtsmoos.com dynamic and static responses
 * (S3-MINOR-2). Applied at the app layer because no nginx config lives in the
 * repo. The Content-Security-Policy is intentionally permissive — the site
 * ships inline scripts/styles throughout — but it pins frame-ancestors and
 * base-uri and blocks plugins, so a mis-issued header can never silently
 * break rendering.
 */

const SECURITY_HEADERS = {
	// HTTPS-only; 1 year, subdomains included.
	'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
	// Block MIME sniffing.
	'X-Content-Type-Options': 'nosniff',
	// Clickjacking: same-origin framing only (no cross-origin embeds of the site exist).
	'X-Frame-Options': 'SAMEORIGIN',
	// Keep full URLs out of cross-origin referrers.
	'Referrer-Policy': 'strict-origin-when-cross-origin',
	// Permissive by necessity (inline scripts/styles ship everywhere); still
	// pins framing, base and plugins. Tighten per-route only with a live test.
	'Content-Security-Policy': [
		"default-src 'self' https: data: blob:",
		"script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
		"style-src 'self' 'unsafe-inline' https:",
		"img-src 'self' https: data: blob:",
		"font-src 'self' https: data:",
		"connect-src 'self' https: wss:",
		"media-src 'self' https: data: blob:",
		"frame-ancestors 'self'",
		"object-src 'none'",
		"base-uri 'self'"
	].join('; ')
};

/**
 * Applies the site-wide security headers to a Node response vessel.
 * Never overwrites a header a route already set explicitly.
 * @param {{setHeader: Function, getHeader?: Function}} response Node response.
 */
function applySecurityHeaders(response) {
	if (!response || typeof response.setHeader !== 'function') return;
	for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
		try {
			if (typeof response.getHeader === 'function' && response.getHeader(name) !== undefined) continue;
			response.setHeader(name, value);
		} catch (_) {
			// Headers already sent — leave the response alone.
		}
	}
}

module.exports = { SECURITY_HEADERS, applySecurityHeaders };
