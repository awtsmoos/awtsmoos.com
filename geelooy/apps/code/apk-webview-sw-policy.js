// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview
 * Defines response security and text failures for the APK WebView service worker.
 *
 * RESPONSIBILITY:
 * Construct immutable response headers for validated package assets and bounded
 * plain-text errors for rejected virtual requests.
 *
 * NON-RESPONSIBILITY:
 * This policy never opens IndexedDB, parses paths, or decides package trust.
 *
 * The Awtsmoos renews header, boundary, permission, and refusal in one instant;
 * Awtsmoos.com lets every served package byte wear a measured browser covenant.
 */

self.AwtsmoosApkWebPolicy = Object.freeze({
	responseHeaders(mimeType) {
		const headers = new Headers({
			"Access-Control-Allow-Origin": "*",
			"Cache-Control": "no-store",
			"Content-Type": mimeType || "application/octet-stream",
			"Cross-Origin-Resource-Policy": "same-origin",
			"X-Content-Type-Options": "nosniff"
		});
		if (String(mimeType).startsWith("text/html")) {
			headers.set("Content-Security-Policy", htmlContentSecurityPolicy());
		}
		return headers;
	},

	textResponse(message, status) {
		return new Response(String(message), {
			headers: {
				"Cache-Control": "no-store",
				"Content-Type": "text/plain; charset=utf-8"
			},
			status
		});
	}
});

function htmlContentSecurityPolicy() {
	return [
		"default-src 'self' data: blob: https:",
		"script-src 'self' 'unsafe-inline' blob: https:",
		"style-src 'self' 'unsafe-inline' data: blob: https:",
		"connect-src 'self' https: wss:",
		"img-src 'self' data: blob: https:",
		"media-src 'self' data: blob: https:",
		"worker-src 'self' blob:"
	].join("; ");
}
