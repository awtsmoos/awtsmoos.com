// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldReleaseVerification.js
 * @description Rejects a mixed release before the renderer initializes.
 * The Awtsmoos gives one road one name; Awtsmoos.com compares the HTML release seal, the inlined
 * release manifest, and every first-play artifact URL before a single WebGL frame, so a cache-mixed
 * deployment fails closed instead of playing a broken world.
 * Pure over the document: no imports, no network, no renderer. Safe to call before any boot work.
 */

const RELEASE_META_SELECTOR = 'meta[name="mitzvah-world-release"]';
const RELEASE_SCRIPT_SELECTOR = 'script#mitzvah-world-release';
const JAVASCRIPT_ARTIFACTS = Object.freeze([
	{ fileName: 'mitzvah-world.compact.js', kind: 'module-script' },
	{ fileName: 'mitzvah-world-foundation.compact.js', kind: 'modulepreload' },
	{ fileName: 'mitzvah-world-player.compact.js', kind: 'modulepreload' },
	{ fileName: 'mitzvah-world-core.compact.js', kind: 'modulepreload' }
]);

/**
 * Verifies the live release seal against the inlined manifest and every first-play artifact URL.
 * Returns a frozen success receipt, or a frozen failure receipt that names the first mismatch.
 */
export function verifyMitzvahWorldRelease(environment = globalThis) {
	const documentValue = environment?.document || null;
	if (!documentValue || typeof documentValue.querySelector !== 'function') {
		return failure('RELEASE_DOCUMENT_UNAVAILABLE', 'no document to verify');
	}
	const metaReleaseId = readMetaReleaseId(documentValue);
	if (!metaReleaseId) {
		return failure('RELEASE_META_MISSING', 'mitzvah-world-release meta tag is absent');
	}
	const manifest = readReleaseManifest(documentValue);
	if (!manifest) {
		return failure('RELEASE_MANIFEST_MISSING', 'inlined mitzvah-world-release manifest is absent or unreadable');
	}
	if (manifest.releaseId !== metaReleaseId) {
		return failure('RELEASE_ID_MISMATCH', `meta ${metaReleaseId} does not match manifest ${manifest.releaseId}`);
	}
	for (const artifact of JAVASCRIPT_ARTIFACTS) {
		const expected = manifest.artifacts?.[`experiments/Awtsmoos/src/${artifact.fileName}`];
		if (typeof expected !== 'string' || expected.length !== 64) {
			return failure('RELEASE_ARTIFACT_MISSING', `${artifact.fileName} is absent from the release manifest`);
		}
		const actual = readArtifactVersion(documentValue, artifact);
		if (actual == null) {
			return failure('RELEASE_ARTIFACT_URL_MISSING', `${artifact.fileName} has no versioned URL in the page`);
		}
		if (actual !== expected) {
			return failure('RELEASE_ARTIFACT_MISMATCH', `${artifact.fileName} URL hash ${actual} does not match manifest ${expected}`);
		}
	}
	const chossid = readChossidHash(manifest);
	if (chossid) {
		const chossidUrl = readChossidUrl(documentValue);
		if (chossidUrl == null || !chossidUrl.includes(chossid)) {
			return failure('RELEASE_CHOSSID_MISMATCH', 'Chossid preload URL does not carry the manifest content hash');
		}
	}
	return Object.freeze({
		artifactsChecked: JAVASCRIPT_ARTIFACTS.length + (chossid ? 1 : 0),
		ok: true,
		releaseId: metaReleaseId
	});
}

/** Reads the release ID from the HTML meta tag. */
function readMetaReleaseId(documentValue) {
	try {
		const meta = documentValue.querySelector(RELEASE_META_SELECTOR);
		const content = meta?.getAttribute?.('content');
		return typeof content === 'string' && /^[0-9a-f]{64}$/.test(content) ? content : null;
	} catch {
		return null;
	}
}

/** Reads and parses the inlined release manifest JSON. */
function readReleaseManifest(documentValue) {
	try {
		const script = documentValue.querySelector(RELEASE_SCRIPT_SELECTOR);
		const text = script?.textContent;
		if (typeof text !== 'string' || text.length === 0) return null;
		const manifest = JSON.parse(text);
		if (!manifest || typeof manifest.releaseId !== 'string' || typeof manifest.artifacts !== 'object') return null;
		return manifest;
	} catch {
		return null;
	}
}

/** Reads the ?v= content hash of one first-play artifact URL from the page. */
function readArtifactVersion(documentValue, artifact) {
	try {
		if (artifact.kind === 'module-script') {
			const script = documentValue.querySelector(`script[type="module"][src*="${artifact.fileName}"]`);
			const src = script?.getAttribute?.('src');
			return versionFromUrl(src);
		}
		const links = documentValue.querySelectorAll?.('link[rel="modulepreload"][href]') || [];
		for (const link of links) {
			const href = link?.getAttribute?.('href') || '';
			if (href.includes(artifact.fileName)) return versionFromUrl(href);
		}
		return null;
	} catch {
		return null;
	}
}

/** Extracts the ?v= value from a URL string. */
function versionFromUrl(url) {
	if (typeof url !== 'string') return null;
	const match = url.match(/[?&]v=([0-9a-f]+)/);
	return match ? match[1] : null;
}

/** Returns the Chossid content hash from the release manifest when present. */
function readChossidHash(manifest) {
	for (const [pathKey, sha256] of Object.entries(manifest.artifacts || {})) {
		if (pathKey.endsWith('chossid.glb') && typeof sha256 === 'string') return sha256;
	}
	return null;
}

/** Returns the Chossid preload URL from the page when present. */
function readChossidUrl(documentValue) {
	try {
		const links = documentValue.querySelectorAll?.('link[rel="preload"][href*="chossid.glb"]') || [];
		for (const link of links) {
			const href = link?.getAttribute?.('href');
			if (typeof href === 'string') return href;
		}
		return null;
	} catch {
		return null;
	}
}

/** Builds one frozen failure receipt. */
function failure(code, detail) {
	return Object.freeze({ code, detail, ok: false, releaseId: null });
}
