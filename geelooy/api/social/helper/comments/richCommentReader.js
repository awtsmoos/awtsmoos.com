//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module RichCommentReader
 * @description Barrel for the rich comment reader: re-exports the identical surface from the split sibling modules.
 */

	const { getTree, getReplies } = require("./richCommentReaderTree.js");

	const { integer, present } = require("./richCommentReaderCore.js");

module.exports = { getReplies, getTree, integer, present };
