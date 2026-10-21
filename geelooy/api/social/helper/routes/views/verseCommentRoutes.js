//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module VerseCommentRoutes
 * @description
 * Barrel for VerseCommentRoutes: class plus prototype mixins, identical export surface.
 */

const { VerseCommentRoutes } = require('./verseCommentRoutesClass.js');
const verseCountsMixin = require('./verseCommentRoutesCounts.js');
const byAnchorMixin = require('./verseCommentRoutesByAnchor.js');
Object.assign(VerseCommentRoutes.prototype, verseCountsMixin, byAnchorMixin);

function createVerseCommentRoutes({ $i, userid } = {}) {
	return new VerseCommentRoutes({ $i, userid }).routes();
}

module.exports = { VerseCommentRoutes, createVerseCommentRoutes };
