// B"H

/**
 * @file api/search/indexer/tokenDelta.js
 * @chapter Changed Words Separate From Words Whose Meaning Remains
 * @description Computes added, removed, and retained token sets.
 */

const operations = require('./ops.js');

function tokenDelta(oldValue, newValue) {
	const oldTokens = oldValue ? operations.extractTokens(oldValue) : new Set();
	const newTokens = newValue ? operations.extractTokens(newValue) : new Set();
	const added = [];
	const removed = [];
	const retained = [];
	for (const token of newTokens) {
		if (oldTokens.has(token)) retained.push(token);
		else added.push(token);
	}
	for (const token of oldTokens) {
		if (!newTokens.has(token)) removed.push(token);
	}
	return { added, removed, retained };
}

module.exports = tokenDelta;
