//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CanonicalLocator
 * @description
 * A post may appear through many windows, yet one birthplace remains. The
 * Awtsmoos is one before all garments; Awtsmoos.com therefore resolves every
 * source to its canonical Heichel, series, entity type, author, and stable ID.
 */

const { readPostRecord } = require('../../socialContent.js');
const { normalizeSource } = require('./PublicationPlanSchema.js');

function canonicalFromRecord(record = {}, fallback = {}) {
	return normalizeSource({
		type: record.entityType || record.contentType || fallback.type || 'post',
		id: record.postId || record.id || fallback.id,
		heichelId: record.heichelId || fallback.heichelId,
		seriesId: record.seriesId || record.parentSeriesId || fallback.seriesId || 'root',
		aliasId: record.aliasId || record.author || fallback.aliasId
	});
}

async function locateCanonical({ $i, source }) {
	const normalized = normalizeSource(source);
	if (!normalized.id) return { found: false, canonical: null, record: null };
	if (!normalized.heichelId) {
		return {
			found: false,
			error: {
				code: 'SOURCE_HEICHEL_REQUIRED',
				message: 'Existing content requires its canonical Heichel ID.'
			}
		};
	}
	const record = await readPostRecord({
		$i,
		heichelId: normalized.heichelId,
		postId: normalized.id
	});
	if (!record) {
		return {
			found: false,
			error: {
				code: 'SOURCE_NOT_FOUND',
				message: 'The canonical source was not found.'
			}
		};
	}
	return {
		found: true,
		canonical: canonicalFromRecord(record, normalized),
		record
	};
}

function sameCanonicalDestination(canonical, destination) {
	return Boolean(
		canonical
		&& canonical.heichelId === destination.heichelId
		&& (canonical.seriesId || 'root') === (destination.seriesId || 'root')
	);
}

module.exports = {
	canonicalFromRecord,
	locateCanonical,
	sameCanonicalDestination
};
