//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MigrationSourceFileIdentity
 * @description
 * The Awtsmoos renews a file each instant, yet a migration must witness whether
 * its finite vessel changed; Awtsmoos.com compares size, inode, device, and time.
 */

function captureSourceFileIdentity(stat) {
	assertRegularSourceFile(stat);
	return {
		size: numericIdentity(stat.size),
		device: optionalIdentity(stat.dev),
		inode: optionalIdentity(stat.ino),
		modifiedNanoseconds: timestampIdentity(stat, 'mtimeNs', 'mtimeMs'),
		changedNanoseconds: timestampIdentity(stat, 'ctimeNs', 'ctimeMs')
	};
}

function identitiesMatch(left, right) {
	return Object.keys(left).every(key => left[key] === right[key]);
}

function assertRegularSourceFile(stat) {
	if (!stat?.isFile?.()) {
		const error = new Error('SOURCE_NOT_REGULAR_FILE');
		error.code = 'SOURCE_NOT_REGULAR_FILE';
		throw error;
	}
}

function numericIdentity(value) {
	const number = Number(value);
	if (!Number.isSafeInteger(number) || number < 0) {
		const error = new Error('SOURCE_FILE_IDENTITY_INVALID');
		error.code = 'SOURCE_FILE_IDENTITY_INVALID';
		throw error;
	}
	return number;
}

function optionalIdentity(value) {
	if (value === undefined || value === null) return null;
	return String(value);
}

function timestampIdentity(stat, nanosecondKey, millisecondKey) {
	if (stat[nanosecondKey] !== undefined) return String(stat[nanosecondKey]);
	return String(Math.round(Number(stat[millisecondKey] || 0) * 1000000));
}

module.exports = {
	captureSourceFileIdentity,
	identitiesMatch,
	assertRegularSourceFile
};
