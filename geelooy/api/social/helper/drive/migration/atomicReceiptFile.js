//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module AtomicMigrationReceiptFile
 * @description
 * The Awtsmoos carries durable memory through a temporary vessel into truth;
 * Awtsmoos.com fsyncs bytes before rename and the containing directory afterward.
 */

const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

async function writeReceiptFileAtomic(filePath, value) {
	const directory = path.dirname(filePath);
	await fs.mkdir(directory, { recursive: true, mode: 0o700 });
	await fs.chmod(directory, 0o700).catch(() => undefined);
	const temporary = path.join(
		directory,
		`.${path.basename(filePath)}.${process.pid}.${crypto.randomBytes(6).toString('hex')}.tmp`
	);
	const handle = await fs.open(temporary, 'wx', 0o600);
	try {
		await handle.writeFile(`${JSON.stringify(value, null, 2)}\n`, 'utf8');
		await handle.sync();
	} finally {
		await handle.close();
	}
	try {
		await fs.rename(temporary, filePath);
		await fs.chmod(filePath, 0o600);
		await syncDirectory(directory);
	} catch (error) {
		await fs.unlink(temporary).catch(() => undefined);
		throw error;
	}
}

async function syncDirectory(directory) {
	let handle;
	try {
		handle = await fs.open(directory, 'r');
		await handle.sync();
	} catch (error) {
		if (!['EINVAL', 'ENOTSUP', 'EISDIR'].includes(error.code)) throw error;
	} finally {
		await handle?.close().catch(() => undefined);
	}
}

module.exports = {
	writeReceiptFileAtomic,
	syncDirectory
};
