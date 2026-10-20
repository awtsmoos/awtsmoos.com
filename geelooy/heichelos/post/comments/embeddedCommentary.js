//B"H
//Blessed is He
//Boruch Hashem

/**
 * @fileoverview Embedded commentary for units-shaped posts (Bavli dafim).
 *
 * The Awtsmoos lets every commentary speak in the comment section under its
 * own alias. Bavli daf posts carry Rashi and Tosafot attached to their own
 * units ({id, title, text} — the dibur and its Hebrew gloss). The classical
 * provider reads a separate Rashi corpus; when that road yields nothing for
 * a daf, this vessel turns the post's own attached commentary into comments
 * so no daf is ever left without its commentators.
 */

const COMMENTATORS = {
	rashi: {
		field: 'rashi',
		alias: 'rashi',
		commentator: 'Rashi',
		commentator_name: 'Rabbi Shlomo Yitzchaki',
		source: 'bavli-embedded-rashi'
	},
	tosafot: {
		field: 'tosafot',
		alias: 'tosafot',
		commentator: 'Tosafot',
		commentator_name: 'Tosafot',
		source: 'bavli-embedded-tosafot'
	}
};

/**
 * Lists the embedded commentary entries of one kind on a post, in unit
 * order, each paired with its anchoring unit.
 * @param {object} post Post record with a `units` array.
 * @param {string} kind 'rashi' or 'tosafot'.
 * @returns {Array<{unit: object, unitIndex: number, entry: object, entryIndex: number}>}
 */
function embeddedEntries(post, kind) {
	const spec = COMMENTATORS[kind];
	const units = Array.isArray(post?.units) ? post.units : [];
	if (!spec || !units.length) return [];
	const found = [];
	units.forEach((unit, unitIndex) => {
		const entries = Array.isArray(unit?.[spec.field]) ? unit[spec.field] : [];
		entries.forEach((entry, entryIndex) => {
			if (entry && typeof entry === 'object') {
				found.push({ unit, unitIndex, entry, entryIndex });
			}
		});
	});
	return found;
}

/**
 * True when the post carries embedded commentary of the given kind.
 * @param {object} post Post record with a `units` array.
 * @param {string} kind 'rashi' or 'tosafot'.
 * @returns {boolean}
 */
export function hasEmbeddedCommentary(post, kind) {
	return embeddedEntries(post, kind).length > 0;
}

/**
 * Converts one embedded commentary entry into an Awtsmoos comment. The
 * dibur (the entry title — the opening words of the commented text) anchors
 * the comment; the body joins dibur and gloss the way the source corpus
 * presents its Hebrew.
 * @param {object} post Post record (for stable ids).
 * @param {string} kind 'rashi' or 'tosafot'.
 * @param {object} found One embeddedEntries() result.
 * @returns {object|null} Comment record, or null when the entry is empty.
 */
function entryToComment(post, kind, found) {
	const spec = COMMENTATORS[kind];
	const title = String(found.entry.title || '').trim();
	const text = String(found.entry.text || '').trim();
	if (!title && !text) return null;
	const hebrew = title && text ? title + ' — ' + text : (title || text);
	const anchorId = found.entry.id != null
		? String(found.entry.id)
		: `${found.unitIndex}-${found.entryIndex}`;
	return {
		id: `${spec.alias}-embedded-${anchorId}`,
		alias: spec.alias,
		aliasId: spec.alias,
		commentator: spec.commentator,
		commentator_name: spec.commentator_name,
		anchor: title,
		dibur: title,
		ref: '',
		text: hebrew,
		textHeb: hebrew,
		textEng: '',
		kind: 'commentary',
		source: spec.source,
		unitIndex: found.unitIndex,
		createdAt: Date.now()
	};
}

/**
 * Builds comments from a post's own embedded commentary of one kind.
 * @param {object} post Post record with a `units` array.
 * @param {string} kind 'rashi' or 'tosafot'.
 * @returns {Array<object>} Comments in Awtsmoos format (may be empty).
 */
export function embeddedCommentaryComments(post, kind) {
	return embeddedEntries(post, kind)
		.map((found) => entryToComment(post, kind, found))
		.filter(Boolean);
}
