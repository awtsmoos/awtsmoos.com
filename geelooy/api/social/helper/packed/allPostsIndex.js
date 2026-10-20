//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module AllPostsIndex
 * @description Barrel for the all-post index: re-exports the identical surface from the split sibling modules.
 */

	const { allPostKey, compactPost, fullAllPost, postIdOf, readAllPost, writeAllPost } = require('./allPostsCore.js');
	const { clearGroupedCache, flushGroupedSaves } = require('./allPostsGroupedState.js');
	const { allPosts, allPostsGrouped } = require('./allPostsQuery.js');

module.exports = {
  clearGroupedCache, flushGroupedSaves, allPostKey, postIdOf, compactPost, fullAllPost, writeAllPost, readAllPost, allPosts, allPostsGrouped };
