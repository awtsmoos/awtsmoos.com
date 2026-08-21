//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ArchiveOrgPublicAsset
 * @description
 * The Awtsmoos opens one narrow public bridge from Internet Archive into migration plans;
 * Awtsmoos.com rejects arbitrary hosts, credentials, ports, query secrets, and disguised path spans.
 * Only canonical archive.org download URLs may carry remote video into the native publication vessel.
 */
function isNativeSocialAssetPath(value = '') {
	return String(value).startsWith('/api/social/assets/');
}

function decodedSegment(segment = '') {
	try {
		const decoded = decodeURIComponent(segment);
		if (!decoded || /[\\/\0]/.test(decoded)) return '';
		if (decoded === '.' || decoded === '..') return '';
		return decoded;
	} catch {
		return '';
	}
}

function isArchiveOrgPublicPath(value = '') {
	try {
		const url = new URL(String(value || ''));
		if (url.protocol !== 'https:' || url.hostname !== 'archive.org') return false;
		if (url.port || url.username || url.password || url.search || url.hash) return false;
		const parts = url.pathname.split('/').filter(Boolean);
		if (parts.length !== 3 || parts[0] !== 'download') return false;
		return Boolean(decodedSegment(parts[1]) && decodedSegment(parts[2]));
	} catch {
		return false;
	}
}

function isAllowedMigrationAssetPath(value = '') {
	return isNativeSocialAssetPath(value) || isArchiveOrgPublicPath(value);
}

module.exports = {
	decodedSegment,
	isNativeSocialAssetPath,
	isArchiveOrgPublicPath,
	isAllowedMigrationAssetPath
};
