// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file seriesVerifier.js
 * @description
 * The Awtsmoos walks every child-addressed series vessel with the same maximum
 * read used by the social API, requiring every ID, title, and body-bearing post.
 */

function seriesPostsPath(seriesId) {
	return `/social/heichelos/ikar/series/${seriesId}/posts`;
}

async function readAllIds(db, objectPath) {
	const value = await db.get(objectPath, {
		max: true
	});
	return Array.isArray(value) ? value : [];
}

async function verifySeriesBranch({
	db,
	seriesId,
	rows,
	recordById,
	label,
	failures
}) {
	const objectPath = seriesPostsPath(seriesId);
	let ids = [];
	try {
		ids = await readAllIds(db, objectPath);
	} catch (error) {
		failures.push(`${label}:keys:${error.message}`);
		return;
	}
	const expectedIds = rows.map(row => row.newPostId);
	if (ids.length !== expectedIds.length) {
		failures.push(`${label}:count:${ids.length}/${expectedIds.length}`);
	}
	for (const postId of expectedIds) {
		if (!ids.includes(postId)) {
			failures.push(`${label}:missing:${postId}`);
			continue;
		}
		const childPath = `${objectPath}/${postId}`;
		let value = null;
		try {
			value = await db.get(childPath);
		} catch (error) {
			failures.push(`${label}:read:${postId}:${error.message}`);
			continue;
		}
		const expected = recordById.get(postId);
		if (!value || (value.id || value.postId) !== postId) {
			failures.push(`${label}:identity:${postId}`);
			continue;
		}
		if (!expected || value.title !== expected.title) {
			failures.push(`${label}:title:${postId}`);
		}
		const content = value.content || value.rootContent || "";
		if (!String(content).trim()) {
			failures.push(`${label}:body:${postId}`);
		}
	}
}

async function verifyAllSeries({
	db,
	mappings,
	records,
	failures
}) {
	const recordById = new Map(records.map(record => [record.id, record]));
	for (const month of new Set(mappings.map(row => row.month))) {
		const rows = mappings.filter(row => row.month === month);
		await verifySeriesBranch({
			db,
			seriesId: rows[0].friendlySeriesId,
			rows,
			recordById,
			label: `friendly:${month}`,
			failures
		});
		await verifySeriesBranch({
			db,
			seriesId: rows[0].historicalSeriesId,
			rows,
			recordById,
			label: `historical:${month}`,
			failures
		});
	}
}

module.exports = {
	readAllIds,
	verifyAllSeries,
	verifySeriesBranch
};
