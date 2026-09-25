//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file searchCatalogWarmWorker.js
 * @description
 * The Awtsmoos moves cold publication decoding into a separate thread-vessel;
 * Awtsmoos.com returns only plain catalog testimony so no database handle or
 * mutable runtime object crosses the worker boundary into the HTTP process.
 */

const fs = require('node:fs');
const { parentPort, workerData } = require('node:worker_threads');
const { publicationCatalogPath } = require('./publicationCatalogPaths.js');
const { readPublicationCatalog } = require('./publicationCatalogReader.js');

/** Fingerprints the worker-observed publication generation after decoding. */
function fingerprint(file) {
	const status = fs.statSync(file);
	return `${status.dev}:${status.ino}:${status.size}:${status.mtimeMs}`;
}

/** Decodes one catalog under the supplied database root and returns plain data. */
async function warmCatalog() {
	const directory = String(workerData?.directory || '');
	if (!directory) {
		throw coded('SEARCH_WARM_ROOT_MISSING', 'Search warm worker has no database root.');
	}
	const searchInterface = { db: { directory } };
	const loaded = await readPublicationCatalog(searchInterface);
	const file = publicationCatalogPath(searchInterface);
	return {
		fingerprint: fingerprint(file),
		generation: loaded.generation,
		items: loaded.items
	};
}

/** Sends compact testimony and never exports worker stack internals. */
warmCatalog()
	.then(result => parentPort.postMessage({ ok: true, result }))
	.catch(error => parentPort.postMessage({
		ok: false,
		error: {
			code: error?.code || 'SEARCH_CATALOG_WARM_FAILED',
			message: error?.message || 'Search catalog warm worker failed.'
		}
	}));

function coded(code, message) {
	return Object.assign(new Error(message), { code });
}
