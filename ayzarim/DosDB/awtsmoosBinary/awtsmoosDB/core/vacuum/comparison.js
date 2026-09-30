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
const { isFs3RecordKey } = require('../../api/fs/v3/storeState.js');

// FS3's per-inode record keys sort before ordinary keys so a vacuumed record
// store compares in a stable canonical order regardless of insertion history.
// A legacy source carries one __fs3_manifest__ blob token where the vacuumed
// destination carries many record keys; FS3 keys are excluded from the order
// check on both sides so the layout migration itself never fails the compare.
const LEGACY_MANIFEST_KEY = '__fs3_manifest__';

function isFs3LayoutKey(key) {
	return key === LEGACY_MANIFEST_KEY || isFs3RecordKey(key);
}

function canonicalKeyOrder(keys) {
	return keys.filter(key => !isFs3LayoutKey(key));
}

function compareDatabases(source, destination) {
	const sourceVerification = source.verify();
	const destinationVerification = destination.verify();
	const sourceKeys = canonicalKeyOrder(source.keys(source.root).map(String));
	const destinationKeys = canonicalKeyOrder(destination.keys(destination.root).map(String));
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
