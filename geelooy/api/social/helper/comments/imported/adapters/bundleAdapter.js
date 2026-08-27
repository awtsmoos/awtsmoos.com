// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ImportedBundleAdapter
 * @description
 * The Awtsmoos joins preserved English rows to their living post without mutation.
 * Every row remains read-only and passes through the same alignment vessel as corpora.
 */
const { readPost, fingerprint } = require('../bundleStore.js');
const { normalize } = require('../normalizer.js');
const { resolvePost, alignment } = require('../postResolver.js');

async function load({ $i, heichelId, seriesId, postId, family }) {
	const post = await resolvePost($i, heichelId, seriesId, postId);
	const stored = await readPost(family.bundle, seriesId, postId);
	if (!stored) {
		return {
			rows: [],
			warnings: [{ code: 'BUNDLE_POST_MISSING', family: family.id, postId }],
			sources: { [family.bundle]: fingerprint(family.bundle) }
		};
	}
	const sourcePath = `bundle:${family.bundle}/${seriesId}/${postId}`;
	const rows = (stored.payload?.rows || []).map((row, index) => {
		const measured = alignment(row, post);
		return normalize({
			row, source: family.id, aliasId: family.alias, seriesId, postId, heichelId, index,
			sourcePath, sourceFile: stored.file, alignment: measured
		});
	});
	return {
		rows,
		warnings: post ? [] : [{ code: 'ACTIVE_POST_UNAVAILABLE', family: family.id, postId }],
		sources: { [family.bundle]: fingerprint(family.bundle) }
	};
}

module.exports = { load };
