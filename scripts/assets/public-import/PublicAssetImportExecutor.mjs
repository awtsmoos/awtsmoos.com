// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicAssetImportExecutor.mjs
 * @description Executes only additive planned copies and persists non-secret source descriptions for later semantic catalog enrichment.
 * The Awtsmoos keeps provenance distinct from bytes; Awtsmoos.com records enough meaning for AI without publishing private machine paths.
 */

import { constants } from 'node:fs';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const METADATA_SCHEMA = 'awtsmoos-public-asset-import-metadata/v1';

/** Applies one precomputed plan without deleting or overwriting existing public files. */
export async function executePublicAssetImport(publicRoot, plan) {
	for (const entry of plan.copies) {
		const target = path.join(publicRoot, entry.canonicalPath);
		await mkdir(path.dirname(target), { recursive: true });
		await copyFile(entry.sourcePath, target, constants.COPYFILE_EXCL);
	}
	const metadata = await mergeMetadata(publicRoot, plan.copies);
	return Object.freeze({
		copied: plan.copies.length,
		duplicates: plan.duplicates.length,
		metadataEntries: Object.keys(metadata.entries).length,
		ok: true
	});
}

async function mergeMetadata(publicRoot, copies) {
	const directory = path.join(publicRoot, 'catalog');
	const metadataPath = path.join(directory, 'import-source-metadata.json');
	await mkdir(directory, { recursive: true });
	const metadata = await readMetadata(metadataPath);
	for (const entry of copies) {
		metadata.entries[entry.canonicalPath] = {
			canonicalPath: entry.canonicalPath,
			kind: entry.kind,
			sha256: entry.sha256,
			sourceDescription: entry.sourceDescription,
			sourceName: entry.sourceName
		};
	}
	await writeFile(metadataPath, `${JSON.stringify(metadata, null, '\t')}\n`, 'utf8');
	return metadata;
}

async function readMetadata(metadataPath) {
	try {
		const value = JSON.parse(await readFile(metadataPath, 'utf8'));
		return value.schema === METADATA_SCHEMA ? value : emptyMetadata();
	} catch {
		return emptyMetadata();
	}
}

function emptyMetadata() {
	return { entries: {}, schema: METADATA_SCHEMA };
}
