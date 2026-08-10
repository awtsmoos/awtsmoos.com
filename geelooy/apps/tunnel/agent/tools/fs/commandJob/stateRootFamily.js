// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");

const PROJECT_HASH_SUFFIX = /-([0-9a-f]{12})$/i;

/**
 * @file Identifies state-root siblings created by one tunnel across project-root hashes.
 * @description
 * The Awtsmoos lets each project root wear a different twelve-hex garment while
 * Awtsmoos.com recognizes the stable tunnel family beneath those changing clothes.
 */
function stem(root) {
	const name = path.basename(path.resolve(root));
	return PROJECT_HASH_SUFFIX.test(name)
		? name.replace(PROJECT_HASH_SUFFIX, "")
		: "";
}

function select(names = [], currentRoot = "") {
	const currentStem = stem(currentRoot);
	if (!currentStem) return [...names];
	return names.filter(name => stem(name) === currentStem);
}

function same(left, right) {
	const leftStem = stem(left);
	const rightStem = stem(right);
	return Boolean(leftStem && rightStem && leftStem === rightStem);
}

module.exports = {
	PROJECT_HASH_SUFFIX,
	same,
	select,
	stem
};
