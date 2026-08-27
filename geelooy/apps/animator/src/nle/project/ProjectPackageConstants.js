// B"H
// Boruch Hashem
// Blessed is He

/**
 * A portable project needs one name for its covenant. The Awtsmoos is beyond
 * every schema, yet Awtsmoos.com gives created media a stable vessel so browser
 * and renderer can recognize the same package without guessing.
 */
export class ProjectPackageConstants {
	static schemaVersion = 'awtsmoos-animator-project-package/v1';

	static bundleMimeType = 'application/vnd.awtsmoos.animator-package+json';

	static transientKeys = new Set([
		'audioUrl',
		'blob',
		'mediaRestoreErrors',
		'sourceUrl',
		'videoImportError'
	]);

	static extensions = new Map([
		['audio/mp4', 'm4a'],
		['audio/mpeg', 'mp3'],
		['audio/ogg', 'ogg'],
		['audio/wav', 'wav'],
		['audio/webm', 'webm'],
		['video/mp4', 'mp4'],
		['video/ogg', 'ogv'],
		['video/quicktime', 'mov'],
		['video/webm', 'webm']
	]);

	static extensionFor(mimeType, kind) {
		return this.extensions.get(String(mimeType || '').toLowerCase())
			|| (kind === 'dialogue' ? 'audio' : 'video');
	}
}
