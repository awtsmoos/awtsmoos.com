//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SiteSourcePublisher
 * @description
 * The Awtsmoos carries a fully measured manifest into canonical Drive storage;
 * Awtsmoos.com delegates all byte/path judgment to the manifest vessel, while this
 * module performs only authorized public writes and returns secret-free testimony.
 */

const { writeDriveFile } = require('./writeService.js');
const { normalizeSourceManifest } = require('./siteSourceManifest.js');

async function publishSiteSource(options) {
	const manifest = normalizeSourceManifest(options.rootPath, options.files || []);
	const published = [];
	for (const file of manifest.files) {
		await publishFile(options, file);
		published.push(publicFileView(file));
	}
	return {
		vessel: 'awtsmoos-drive',
		rootPath: manifest.rootPath,
		fileCount: manifest.files.length,
		totalBytes: manifest.totalBytes,
		files: published
	};
}

async function publishFile(options, file) {
	return writeDriveFile({
		aliasId: options.aliasId,
		path: file.drivePath,
		content: file.content,
		mime: file.mime,
		visibility: 'public',
		cachePolicy: file.cachePolicy,
		actorUserId: options.actorUserId,
		credentialId: options.credentialId,
		requestId: options.requestId,
		$i: options.$i
	});
}

function publicFileView(file) {
	return {
		path: file.path,
		drivePath: file.drivePath,
		bytes: file.content.length,
		cachePolicy: file.cachePolicy
	};
}

module.exports = {
	publishSiteSource
};
