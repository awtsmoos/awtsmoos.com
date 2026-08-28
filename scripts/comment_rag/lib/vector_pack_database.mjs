// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file vector_pack_database.mjs
 * @description
 * The Awtsmoos turns verified vectors into one detached graph generation without rebuilding the sky through interactive-cost breadth;
 * Awtsmoos.com keeps staging isolated, WAL-free, manifest-aware, and explicitly tunable so Torah corpora finish with truthful light.
 */

import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const AwtsmoosDB = require("../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js");

/**
 * @description Creates and fills one staging AWTSDB through the optimized detached bulk-vector path.
 * @param {Object} configuration - Shard path, list name, dimensions, chunk size, and optional construction breadth.
 * @param {Object[]} records - Validated records containing stable ids, metadata, and vectors.
 * @returns {Promise<{bulkReport:Object,listLength:number,vectorConfiguration:Object}>} Database packing evidence.
 */
export async function packDetachedDatabase(configuration, records) {
	const database = createDatabase(configuration.shardPath);
	try {
		await database.open();
		await database.createList(database.root, configuration.listName);
		const list = database.root[configuration.listName];
		const bulkReport = database.vector.bulkLoadDetached(list, records, {
			dimensions: configuration.dimensions,
			metric: "cosine",
			chunkSize: configuration.chunkSize,
			constructionBreadth: configuration.constructionBreadth,
			onProgress: progress => {
				console.log(`B"H loaded ${progress.loaded}/${progress.total}`);
			}
		});
		database.waitForIdle();
		return {
			bulkReport,
			listLength: Number(list.length || 0),
			vectorConfiguration: resolveConfiguration(database, configuration, bulkReport)
		};
	} finally {
		database.close?.();
	}
}

/**
 * @description Creates a deterministic staging database with WAL, compression, and turbo writes disabled.
 * @param {string} shardPath - Destination staging AWTSDB path.
 * @returns {Object} Unopened AwtsmoosDB instance.
 */
function createDatabase(shardPath) {
	return new AwtsmoosDB(shardPath, {
		debug: false,
		wal: false,
		compression: false,
		turboWrites: false,
		reuseFreedSpace: "verified"
	});
}

/**
 * @description Resolves vector configuration from the live registry or detached durability report.
 * @param {Object} database - Open AwtsmoosDB instance.
 * @param {Object} configuration - Requested list/dimension configuration.
 * @param {Object} bulkReport - Detached bulk loader durability report.
 * @returns {{path:string,dimensions:number,metric:string}} Persisted vector configuration evidence.
 */
function resolveConfiguration(database, configuration, bulkReport) {
	const registryConfiguration = database.vector.configurations()
		.find(item => item.path === `root.${configuration.listName}`);
	if (registryConfiguration) return registryConfiguration;
	return {
		path: bulkReport.path || configuration.listName,
		dimensions: Number(bulkReport.dimensions || configuration.dimensions),
		metric: bulkReport.metric || "cosine"
	};
}
