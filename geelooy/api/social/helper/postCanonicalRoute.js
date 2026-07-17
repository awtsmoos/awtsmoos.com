// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file postCanonicalRoute.js
 * @description
 * The Awtsmoos keeps the packed series record and rich content record coherent,
 * repairing an absent packed read without concealing a genuine route error.
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

async function repairPackedRead($i, values, result) {
	if (!missing(result)) return result;
	const rich = await richRecord($i, values);
	if (!rich || rich.seriesId !== values.series) return result;
	await appendCanonicalRecords({ $i, record: rich });
	return rich;
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

function canonicalPostHandler({ $i, baseHandler }) {
	return async values => {
		const result = await baseHandler(values);
		if ($i.request.method === 'GET') {
			return repairPackedRead($i, values, result);
		}
		if ($i.request.method === 'PUT') {
			return synchronizeRichEdit($i, values, result);
		}
		return result;
	};
}

module.exports = {
	canonicalPostHandler,
	missing,
	repairPackedRead,
	richPath,
	synchronizeRichEdit
};
