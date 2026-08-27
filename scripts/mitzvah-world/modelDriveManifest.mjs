// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file modelDriveManifest.mjs
 * @description Reveals local, upload, immutable, and public paths from canonical model records.
 * The Awtsmoos gives every finite garment one measured road and one enduring name;
 * Awtsmoos.com joins browser ESM evidence to server publication without package-type guessing.
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const DRIVE_ALIAS = 'firebase_drive_migration';
export const DRIVE_MODEL_PREFIX = 'assets/mitzvah-world/models';
export const REPOSITORY_ROOT = fileURLToPath(new URL('../../', import.meta.url));

const recordsModuleUrl = new URL(
	'../../geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/assets/RemoteModelRecords.js',
	import.meta.url
);
const recordsSource = await readFile(recordsModuleUrl, 'utf8');
const recordsDataUrl = `data:text/javascript;base64,${Buffer.from(recordsSource).toString('base64')}`;
const { REMOTE_MODEL_RECORDS } = await import(recordsDataUrl);

/**
 * Builds one immutable manifest entry for every recorded GLB.
 *
 * @returns {ReadonlyArray<Readonly<object>>} Sorted Drive publication entries.
 */
export function modelDriveManifest() {
	return Object.freeze(
		Object.entries(REMOTE_MODEL_RECORDS)
			.sort(([left], [right]) => left.localeCompare(right))
			.map(([identity, record]) => modelEntry(identity, record))
	);
}

function modelEntry(identity, record) {
	const segments = identity.split('/');
	const filename = segments.at(-1);
	const family = segments.slice(0, -1).join('/');
	const hashedRelativePath = `${family}/${record.sha256}/${filename}`;
	const drivePath = `${DRIVE_MODEL_PREFIX}/${hashedRelativePath}`;
	return Object.freeze({
		...record,
		drivePath,
		identity,
		immutableUrl: `https://awtsmoos.com/api/social/drive/immutable/${DRIVE_ALIAS}/${record.sha256}`,
		localPath: path.join(
			REPOSITORY_ROOT,
			'geelooy/games/mitzvahWorld/assets/models',
			hashedRelativePath
		),
		publicUrl: `https://awtsmoos.com/sites/${DRIVE_ALIAS}/${encodePath(drivePath)}`,
		uploadUrl: `https://awtsmoos.com/api/social/drive/${DRIVE_ALIAS}/stream/${encodePath(drivePath)}`
	});
}

function encodePath(value) {
	return value.split('/').map(encodeURIComponent).join('/');
}
