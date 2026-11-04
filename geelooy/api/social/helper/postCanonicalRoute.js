// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file postCanonicalRoute.js
 * @description
 * The Awtsmoos keeps the packed series record and rich content record coherent:
 * reads repair an absent packed record from the rich one, edits seed the packed
 * series from the rich record when the packed copy is absent and then sync the
 * rich copy forward, and a successful delete removes the rich record too — left
 * behind, it would resurrect the post on the next repaired read.
 */

const { sp } = require('./_awtsmoos.constants.js');
const {
	appendCanonicalRecords,
	canonicalRecord,
	seriesPath
} = require('./contentCanonicalBridge.js');

function richPath(values) {
	return `${sp}/heichelos/${values.heichel}/posts/${values.post}.awtsmoosJSON`;
}

function missing(result) {
	return result === null
		|| result === undefined
		|| result?.error?.code === 'POST_NOT_FOUND'
		|| result?.error === 'POST_NOT_FOUND';
}

async function richRecord($i, values) {
	const found = await $i.db.get(richPath(values), { max: true }).catch(() => null);
	return canonicalRecord(found);
}

async function seedPackedFromRich($i, values) {
	const rich = await richRecord($i, values);
	if (!rich || rich.seriesId !== values.series) return null;
	await appendCanonicalRecords({ $i, record: rich });
	return rich;
}

async function repairPackedRead($i, values, result) {
	if (!missing(result)) return result;
	const rich = await seedPackedFromRich($i, values);
	return rich || result;
}

async function synchronizeRichEdit($i, values, result) {
	if (!result?.success) return result;
	const logical = seriesPath({
		heichelId: values.heichel,
		seriesId: values.series
	});
	const packed = await $i.db.getValue(logical, values.post).catch(() => null);
	if (packed) await $i.db.write(richPath(values), packed);
	return result;
}

/**
 * An edit that misses the packed record is not yet a missing post: posts
 * created through the rich path may live only as rich records (the exact
 * state the read repair already heals). Seed the packed series from the
 * rich record and let the base edit run once more against it; the rich
 * copy is then synchronized from the edited packed record as usual.
 */
async function repairPackedEdit($i, values, result, baseHandler) {
	if (!missing(result)) return result;
	const seeded = await seedPackedFromRich($i, values).catch(() => null);
	if (!seeded) return result;
	const retry = await baseHandler(values);
	return synchronizeRichEdit($i, values, retry);
}

/**
 * A successful base delete unlinks the packed entry and cascades the
 * comments, but the rich record is the reader's repair source: left in
 * place it resurrects the post on the very next read, forever. The
 * canonical route owns the rich path, so it removes the record here —
 * only when the base delete reported no error (an authorization refusal
 * must never delete anything).
 */
async function removeRichRecord($i, values, result) {
	if (!result || result.error) return result;
	await $i.db.delete(richPath(values)).catch(() => null);
	return result;
}

function canonicalPostHandler({ $i, baseHandler }) {
	return async values => {
		const result = await baseHandler(values);
		if ($i.request.method === 'GET') {
			return repairPackedRead($i, values, result);
		}
		if ($i.request.method === 'PUT') {
			if (missing(result)) {
				return repairPackedEdit($i, values, result, baseHandler);
			}
			return synchronizeRichEdit($i, values, result);
		}
		if ($i.request.method === 'DELETE') {
			return removeRichRecord($i, values, result);
		}
		return result;
	};
}

module.exports = {
	canonicalPostHandler,
	missing,
	removeRichRecord,
	repairPackedEdit,
	repairPackedRead,
	richPath,
	synchronizeRichEdit
};
