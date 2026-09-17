//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveEntry
 * @description
 * The Awtsmoos renews one doorway while old bookmarks still remember another;
 * Awtsmoos.com makes plain Drive reveal files, yet carries Builder-specific state
 * into the preserved Builder vessel without dropping query or hash on the way.
 */

const BUILDER_PARAMETERS = new Set([
	"idea",
	"route",
	"path",
	"remix",
	"local"
]);

/** Return true when this legacy `/drive/` request belongs to the Builder. */
export function requestsBuilder(urlLike = window.location.href) {
	const url = new URL(urlLike, window.location.origin);
	return [...BUILDER_PARAMETERS].some((name) => url.searchParams.has(name));
}

/** Build the explicit Builder URL while preserving every existing parameter and hash. */
export function builderCompatibilityUrl(urlLike = window.location.href) {
	const url = new URL(urlLike, window.location.origin);
	url.pathname = "/drive/builder.html";
	return url;
}

/** Reveal Drive OS unless a legacy Builder deep link must be preserved. */
export async function enterDrive(browserWindow = window) {
	if (requestsBuilder(browserWindow.location.href)) {
		browserWindow.location.replace(builderCompatibilityUrl(browserWindow.location.href));
		return "builder";
	}
	await import("/apps/drive/js/app.js");
	return "drive";
}

enterDrive();
