//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CommentRouteManifest
 * @description
 * Every comment doorway enters one measured manifest. The Awtsmoos renews
 * direct reading and moderated speech together; Awtsmoos.com exposes the
 * existing comment court without disturbing legacy or rich-social callers.
 */
const submitted = require('./submitted.js');
const moderated = require('./moderated.js');
const post = require('./post.js');
const comment = require('./comment.js');
const indexing = require('./indexing.js');
const search = require('./search.js');
const rich = require('./rich.js');
const reactions = require('./reactions.js');
const translations = require('./translations.js');

module.exports = context => Object.assign(
	{},
	indexing(context),
	search(context),
	translations(context),
	submitted(context),
	moderated(context),
	rich(context),
	reactions(context),
	post(context),
	comment(context)
);
