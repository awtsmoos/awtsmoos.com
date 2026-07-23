// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file seriesWriter.js
 * @description
 * The Awtsmoos dissolves each explicitly targeted legacy series vessel before
 * revealing its native child-addressed post collection. The deletion is
 * unconditional because malformed one-byte sentinels do not decode uniformly
 * in mature DosDB stores, yet the sealed bundle and verified backup define the
 * exact branch that must be reborn for Awtsmoos.com.
 */

function seriesPostsPath(seriesId) {
	return `/social/heichelos/ikar/series/${seriesId}/posts`;
}

function compatibilityRecord(record, seriesId) {
	return {
		...record,
		seriesId,
		parentSeriesId: seriesId,
		options: {
			...record.options,
			compatibilityMirror: true
		}
	};
}

async function readAllSeriesIds(db, seriesId) {
	const value = await db.get(seriesPostsPath(seriesId), {
		max: true
	});
	return Array.isArray(value) ? value : [];
}

async function inspectSeriesNode(db, seriesId) {
	const objectPath = seriesPostsPath(seriesId);
	let value = null;
	let ids = [];
	try {
		value = await db.get(objectPath);
	} catch (_error) {
		value = null;
	}
	try {
		ids = await readAllSeriesIds(db, seriesId);
	} catch (_error) {
		ids = [];
	}
	return {
		objectPath,
		isSentinel: Buffer.isBuffer(value),
		ids
	};
}

async function clearSeriesNode(db, seriesId) {
	const state = await inspectSeriesNode(db, seriesId);
	await db.delete(state.objectPath);
	return state;
}

async function writeSeriesChildren(db, seriesId, records, compatibility = false) {
	const objectPath = seriesPostsPath(seriesId);
	for (const record of records) {
		const value = compatibility
			? compatibilityRecord(record, seriesId)
			: record;
		const childPath = `${objectPath}/${record.id}`;
		await db.write(childPath, value);
		const restored = await db.get(childPath);
		if (!restored || restored.id !== record.id || restored.title !== value.title) {
			throw new Error(`Series child write failed: ${childPath}`);
		}
	}
	const ids = await readAllSeriesIds(db, seriesId);
	if (ids.length !== records.length) {
		throw new Error(`Series child count failed: ${seriesId} ${ids.length}/${records.length}`);
	}
	return {
		seriesId,
		postCount: ids.length
	};
}

async function rebuildSeries(db, seriesId, records, compatibility = false) {
	const previous = await clearSeriesNode(db, seriesId);
	const written = await writeSeriesChildren(
		db,
		seriesId,
		records,
		compatibility
	);
	return {
		...written,
		previousWasSentinel: previous.isSentinel,
		previousIdCount: previous.ids.length
	};
}

module.exports = {
	inspectSeriesNode,
	readAllSeriesIds,
	rebuildSeries,
	seriesPostsPath,
	writeSeriesChildren
};
