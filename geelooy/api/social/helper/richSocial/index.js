//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RichSocial
 * @description
 * A narrow public doorway gathers schemas, discussion coordinates, and native
 * service adaptation. Awtsmoos.com keeps this boundary small so expressive form
 * may expand without concealing where each field enters the Awtsmoos-given river.
 */

const TextSanitizer = require('./TextSanitizer.js');
const AttachmentSchema = require('./AttachmentSchema.js');
const SectionSchema = require('./SectionSchema.js');
const RichPostSchema = require('./RichPostSchema.js');
const DiscussionTargets = require('./DiscussionTargets.js');
const { createRichPostService } = require('./RichPostService.js');

module.exports = {
	...TextSanitizer,
	...AttachmentSchema,
	...SectionSchema,
	...RichPostSchema,
	...DiscussionTargets,
	createRichPostService
};
