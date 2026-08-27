// B"H

/**
 * @file core/vacuum/comparison.js
 * @chapter Meaning, Allocation, And Every Rebuilt Index Stand Before One Measure
 * @description
 * Requires allocation verification, coordinate-free semantic equality, root-key
 * order, and reopened destination search/vector index integrity.
 */

const semanticDigest = require('./semanticDigest.js');
const derivedIndexes = require('./derivedIndexes.js');

function compareDatabases(source, destination) {
	const sourceVerification = source.verify();
	const destinationVerification = destination.verify();
	const sourceKeys = source.keys(source.root).map(String);
	const destinationKeys = destination.keys(destination.root).map(String);
	const sourceDigest = sourceVerification.ok ? semanticDigest(source) : null;
	const destinationDigest = destinationVerification.ok ? semanticDigest(destination) : null;
	const keyOrderEqual = JSON.stringify(sourceKeys) === JSON.stringify(destinationKeys);
	const digestEqual = sourceDigest !== null && sourceDigest === destinationDigest;
	const derivedConfiguration = derivedIndexes.capture(source);
	const derivedVerification = derivedIndexes.verify(destination, derivedConfiguration);

	return {
		ok: sourceVerification.ok
			&& destinationVerification.ok
			&& keyOrderEqual
			&& digestEqual
			&& derivedVerification.ok,
		sourceVerification,
		destinationVerification,
		sourceDigest,
		destinationDigest,
		keyOrderEqual,
		digestEqual,
		derivedConfiguration,
		derivedVerification,
		sourceRootKeys: sourceKeys.length,
		destinationRootKeys: destinationKeys.length
	};
}

module.exports = compareDatabases;
