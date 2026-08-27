// B"H

/**
 * @file api/search/indexer/ops.js
 * @chapter Added, Removed, And Retained Words Each Receive One Exact Operation
 * @description Unifies token extraction and persistent posting mutations.
 */

const TokenExtractor = require('./extractor.js');
const TokenAdder = require('./adder.js');
const TokenRemover = require('./remover.js');
const TokenReplacer = require('./replacer.js');

module.exports = {
	extractTokens(value) {
		return TokenExtractor.extract(value);
	},

	addToken(db, indexHandle, token, pointer) {
		return TokenAdder.add(db, indexHandle, token, pointer);
	},

	removeToken(db, indexHandle, token, pointer) {
		return TokenRemover.remove(db, indexHandle, token, pointer);
	},

	replaceToken(db, indexHandle, token, oldPointer, newPointer) {
		return TokenReplacer.replace(db, indexHandle, token, oldPointer, newPointer);
	}
};
