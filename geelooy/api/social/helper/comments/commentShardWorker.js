// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module CommentShardWorker
 * @description
 * A disposable process opens one derived comment shard, reads one virtual file,
 * serializes its small payload, and exits. Its heap and file mappings therefore
 * vanish completely instead of becoming part of the long-lived API process.
 */

const AwtsmoosDB = require('../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const awts = require('../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js');

function decodeRequest(encoded) {
	return JSON.parse(Buffer.from(String(encoded || ''), 'base64url').toString('utf8'));
}

function validRequest(request = {}) {
	return typeof request.file === 'string'
		&& request.file.endsWith('.comments.fs.awtsdb')
		&& typeof request.virtualPath === 'string'
		&& request.virtualPath.startsWith('/bySeries/');
}

function readShardFile(request) {
	const database = new AwtsmoosDB(request.file, {
		readOnly: true,
		readonly: true,
		wal: false,
		processLockMode: 'shared',
		lockMode: 'shared'
	});
	try {
		database.open();
		const stat = database.fs.stat(request.virtualPath);
		if (!stat?.exists || stat.type !== 'file' || !stat.size) return null;
		return awts.deserializeBinary(
			database.fs.readRange(request.virtualPath, 0, stat.size)
		);
	} finally {
		try {
			database.close();
		} catch {}
	}
}

function respond(payload) {
	process.stdout.write(JSON.stringify(payload));
}

try {
	const request = decodeRequest(process.argv[2]);
	respond({
		ok: validRequest(request),
		data: validRequest(request) ? readShardFile(request) : null
	});
} catch (error) {
	respond({
		ok: false,
		data: null,
		error: error?.message || String(error)
	});
}
