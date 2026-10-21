//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module NeedsWorkConstants
 * @description
 * Sibling of NeedsWorkRoutes: gap priorities and labels, relocated verbatim.
 */

const GAP_PRIORITY = {
	missing_translation: 1,
	missing_footnotes: 1,
	broken_page_markers: 2,
	missing_phrase_translations: 2,
	missing_page_markers: 2,
	no_alias_link: 2,
	empty_alias_link: 2,
	submitted_unapproved: 2,
	missing_summaries: 3
};

const GAP_LABEL = {
	missing_translation: "Missing English translation",
	missing_phrase_translations: "Missing phrase-by-phrase translations",
	missing_summaries: "Missing summaries",
	missing_footnotes: "Missing footnotes",
	missing_page_markers: "No inline page markers (series uses them)",
	broken_page_markers: "Broken/malformed inline page markers",
	no_alias_link: "Post has no author alias link",
	empty_alias_link: "Alias has no linked posts at all",
	submitted_unapproved: "Submitted, awaiting approval"
};

module.exports = {
	GAP_PRIORITY,
	GAP_LABEL
};
