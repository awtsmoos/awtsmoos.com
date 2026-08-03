// B"H
// Boruch Hashem
// Blessed is He
/** @module CommentRouteManifest */
const submitted = require('./submitted.js');
const post = require('./post.js');
const comment = require('./comment.js');
const indexing = require('./indexing.js');
const search = require('./search.js');
const rich = require('./rich.js');
const reactions = require('./reactions.js');

module.exports = context => Object.assign(
	{},
	indexing(context),
	search(context),
	submitted(context),
	rich(context),
	reactions(context),
	post(context),
	comment(context)
);
