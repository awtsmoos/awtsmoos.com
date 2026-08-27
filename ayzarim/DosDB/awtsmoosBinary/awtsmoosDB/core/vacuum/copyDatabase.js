// B"H

/**
 * @file core/vacuum/copyDatabase.js
 * @chapter Reachable Names And Compact Vectors Enter A Clean Destination Vessel
 * @description Copies logical root values while excluding pointer-bearing derived
 * indexes, then rebuilds ordinary or detached vector graphs against new pointers.
 */

const derivedIndexes = require('./derivedIndexes.js');
const copyRootValue = require('./rootValueCopier.js');

function copyDatabase(source, destination, options = {}) {
	const configuration = derivedIndexes.capture(source);
	const context = {
		source,
		destination,
		seen: new WeakMap(),
		stats: {
			rootKeys: 0,
			blobs: 0,
			blobBytes: 0,
			texts: 0,
			virtualFsManifests: 0,
			rootStrategies: {},
			derivedIndexes: configuration
		}
	};
	const sourceKeys = source.keys(source.root)
		.filter(key => !derivedIndexes.DERIVED_ROOT_KEYS.has(String(key)));
	const destinationKeys = destination.keys(destination.root);

	for (const key of destinationKeys) delete destination.root[key];
	destination.waitForIdle();

	for (const key of sourceKeys) {
		context.stats.rootStrategies[String(key)] = copyRootValue(
			key,
			source.root[key],
			context,
			options
		);
		context.stats.rootKeys++;
	}

	context.stats.rebuiltIndexes = derivedIndexes.rebuild(
		source,
		destination,
		configuration
	);
	return context.stats;
}

module.exports = copyDatabase;
