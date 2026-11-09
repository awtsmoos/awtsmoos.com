// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldReleaseIdentity.cjs
 * @description Publishes ONE release ID across HTML, entry, bundles, manifest, terrain assets, and Chossid metadata.
 * The Awtsmoos gives one road one name; Awtsmoos.com seals every first-play byte under a single content
 * hash so a cache-mixed deployment can never pass for a release. Chapter 4: the release ID is the SHA-256
 * of the canonical sorted list of first-play artifact hashes, so it changes exactly when any sealed
 * artifact changes, and it is published in the HTML meta tag, an inlined JSON manifest, and the
 * generated release manifest, where the compact entry can reject a mixed release before the renderer starts.
 */

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const RELEASE_META_NAME = 'mitzvah-world-release';
const RELEASE_SCRIPT_ID = 'mitzvah-world-release';

/** First-play artifacts sealed under one release ID, relative to the game root. */
const RELEASE_ARTIFACTS = Object.freeze([
	'experiments/Awtsmoos/src/mitzvah-world.compact.js',
	'experiments/Awtsmoos/src/mitzvah-world-foundation.compact.js',
	'experiments/Awtsmoos/src/mitzvah-world-player.compact.js',
	'experiments/Awtsmoos/src/mitzvah-world-core.compact.js',
	'styles/generated/mitzvah-world.production.css',
	'build/generated/mitzvah-world-essential-assets.json'
]);

/**
 * Computes one release ID from the first-play artifact bytes and publishes it in the
 * production HTML and the generated release manifest.
 *
 * @param {string} gameRoot Absolute Mitzvah World root.
 * @returns {Readonly<object>} Immutable release receipt.
 */
function buildMitzvahWorldReleaseIdentity(gameRoot) {
	const artifacts = {};
	for (const relativePath of RELEASE_ARTIFACTS) {
		const artifactPath = path.join(gameRoot, relativePath);
		if (!fs.existsSync(artifactPath)) {
			throw new Error(`RELEASE_ARTIFACT_MISSING:${relativePath}`);
		}
		artifacts[relativePath] = hashFile(artifactPath);
	}
	const chossid = readCanonicalChossid(gameRoot);
	if (chossid) {
		artifacts[chossid.relativePath] = chossid.sha256;
	}
	const releaseId = computeReleaseId(artifacts);
	const receipt = Object.freeze({
		artifacts: Object.freeze({ ...artifacts }),
		releaseId
	});
	const indexPath = path.join(gameRoot, 'index.html');
	let html = fs.readFileSync(indexPath, 'utf8');
	html = writeReleaseMeta(html, releaseId);
	html = writeReleaseScript(html, receipt);
	html = writeCssLinkVersion(html, artifacts['styles/generated/mitzvah-world.production.css']);
	fs.writeFileSync(indexPath, html);
	const manifestPath = path.join(gameRoot, 'build/generated/mitzvah-world-release.json');
	fs.writeFileSync(manifestPath, `${JSON.stringify(receipt, null, '\t')}\n`);
	return receipt;
}

/** Returns the exact SHA-256 of one emitted artifact. */
function hashFile(filePath) {
	return crypto
		.createHash('sha256')
		.update(fs.readFileSync(filePath))
		.digest('hex');
}

/** Reads the canonical Chossid GLB content hash from the essential-assets manifest. */
function readCanonicalChossid(gameRoot) {
	const manifestPath = path.join(gameRoot, 'build/generated/mitzvah-world-essential-assets.json');
	let manifest;
	try {
		manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
	} catch {
		return null;
	}
	const chossid = manifest?.assets?.canonicalChossid;
	if (!chossid || typeof chossid.sha256 !== 'string' || typeof chossid.publicUrl !== 'string') {
		return null;
	}
	const relativePath = chossid.publicUrl.replace(/^\/games\/mitzvah-world\//, '');
	const artifactPath = path.join(gameRoot, relativePath);
	if (fs.existsSync(artifactPath)) {
		const fileHash = hashFile(artifactPath);
		if (fileHash !== chossid.sha256) {
			throw new Error(`RELEASE_CHOSSID_HASH_MISMATCH:${chossid.sha256}:${fileHash}`);
		}
	}
	return Object.freeze({ relativePath, sha256: chossid.sha256 });
}

/** Computes one deterministic release ID from the sorted artifact hashes. */
function computeReleaseId(artifacts) {
	const pairs = Object.entries(artifacts).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
	return crypto
		.createHash('sha256')
		.update(JSON.stringify(pairs))
		.digest('hex');
}

/** Writes or replaces the release meta tag while preserving every other HTML byte. */
function writeReleaseMeta(html, releaseId) {
	const meta = `<meta name="${RELEASE_META_NAME}" content="${releaseId}">`;
	const existing = new RegExp(`<meta\\s+name=["']${RELEASE_META_NAME}["'][^>]*>`, 'g');
	if (existing.test(html)) {
		return html.replace(existing, meta);
	}
	const titleMatch = html.match(/<title>[^<]*<\/title>/);
	if (!titleMatch) {
		throw new Error('RELEASE_META_TITLE_MISSING');
	}
	return html.replace(titleMatch[0], `${titleMatch[0]}\n\t${meta}`);
}

/**
 * Aligns the production CSS link's cache token with the release manifest's
 * content hash (first 10 hex), so the served stylesheet can never drift from
 * the sealed artifact. The link previously carried a stale short token that
 * matched neither the manifest hash nor any artifact.
 */
function writeCssLinkVersion(html, cssHash) {
	if (typeof cssHash !== 'string' || !/^[a-f0-9]{64}$/.test(cssHash)) {
		throw new Error('RELEASE_CSS_HASH_INVALID');
	}
	const token = cssHash.slice(0, 10);
	const pattern = /(\.\/styles\/generated\/mitzvah-world\.production\.css\?v=)[a-f0-9]{10}/;
	if (!pattern.test(html)) {
		throw new Error('RELEASE_CSS_LINK_MISSING');
	}
	return html.replace(pattern, `$1${token}`);
}

/** Writes or replaces the inlined release manifest script while preserving every other HTML byte. */
function writeReleaseScript(html, receipt) {
	const script = `<script type="application/json" id="${RELEASE_SCRIPT_ID}">${JSON.stringify(receipt)}</script>`;
	const existing = new RegExp(`<script\\s+type=["']application\\/json["']\\s+id=["']${RELEASE_SCRIPT_ID}["']>[\\s\\S]*?<\\/script>`, 'g');
	if (existing.test(html)) {
		return html.replace(existing, script);
	}
	const metaMatch = html.match(new RegExp(`<meta\\s+name=["']${RELEASE_META_NAME}["'][^>]*>`));
	if (!metaMatch) {
		throw new Error('RELEASE_SCRIPT_META_MISSING');
	}
	return html.replace(metaMatch[0], `${metaMatch[0]}\n\t${script}`);
}

module.exports = {
	RELEASE_ARTIFACTS,
	RELEASE_META_NAME,
	RELEASE_SCRIPT_ID,
	buildMitzvahWorldReleaseIdentity,
	computeReleaseId
};
