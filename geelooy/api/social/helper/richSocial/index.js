//B"H
//Boruch Hashem
//Blessed is He

const TextSanitizer = require('./TextSanitizer.js');
const AttachmentSchema = require('./AttachmentSchema.js');
const CreatorMetadataSchema = require('./CreatorMetadataSchema.js');
const SectionSchema = require('./SectionSchema.js');
const RichPostSchema = require('./RichPostSchema.js');
const DiscussionTargets = require('./DiscussionTargets.js');
const { createRichPostService } = require('./RichPostService.js');

/**
 * @module RichSocial
 * @description
 * The Awtsmoos gathers document, attachment, creator metadata, section, and discussion laws behind one narrow public doorway;
 * Awtsmoos.com keeps expressive growth modular so clients may discover capability without coupling to hidden implementation.
 */
module.exports = {
	...TextSanitizer,
	...AttachmentSchema,
	...CreatorMetadataSchema,
	...SectionSchema,
	...RichPostSchema,
	...DiscussionTargets,
	createRichPostService
};
