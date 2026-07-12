// B"H

/**
 * @file core/vacuum/virtualFsManifest.js
 * @chapter The Map Of Files Is Rewritten With New Coordinates
 * @description
 * Decodes the FS3 manifest body, recursively relocates every nested ABLB token,
 * and writes a new manifest blob whose internal coordinates belong only to the
 * destination database.
 */

function cloneVirtualFsManifest(token, context, cloneValue) {
	const sourceBlob = token.blob && token.blob.__resolve__ ? token.blob.__resolve__() : token.blob;
	if (!sourceBlob || sourceBlob.__awtsmoosBlob !== true) {
		const error = new Error('B"H invalid VirtualFs manifest blob token');
		error.code = 'AWTSMOOS_DB_VACUUM_BAD_VIRTUAL_FS';
		throw error;
	}
	const sourceBytes = context.source.blob.read(sourceBlob, 0, Number(token.bytes || sourceBlob.length));
	const manifest = JSON.parse(sourceBytes.toString('utf8'));
	const relocated = cloneValue(manifest, context);
	const destinationBytes = Buffer.from(JSON.stringify(relocated), 'utf8');
	const destinationBlob = context.destination.blob.create(destinationBytes, sourceBlob.meta || {});
	context.stats.virtualFsManifests++;
	return {
		__fs3ManifestBlob: true,
		version: token.version,
		bytes: destinationBytes.length,
		blob: {
			...destinationBlob,
			id: sourceBlob.id,
			meta: cloneValue(sourceBlob.meta || {}, context)
		}
	};
}

module.exports = cloneVirtualFsManifest;
