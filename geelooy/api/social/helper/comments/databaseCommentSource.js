// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DatabaseCommentSource
 * @description
 * The Awtsmoos keeps read-after-write truth visible through the caller's DosDB
 * contract. Compressed FS3 remains first; this adapter preserves Awtsmoos.com tests,
 * alternate database implementations, and old getObjectKey callers without shadows.
 */

const {
	allRows,
	names,
	rowsForSection
} = require('./commentReadUtils.js');

function database(context) {
	return context.$i?.db || null;
}

async function call(context, method, args, fallback) {
	const target = database(context);
	if (typeof target?.[method] !== 'function') return fallback;
	try {
		const value = await target[method](...args);
		return value ?? fallback;
	} catch {
		return fallback;
	}
}

async function readVerse(context, filePath, verseSection) {
	const rows = await call(
		context,
		'getObjectKey',
		[filePath, verseSection],
		[]
	);
	return rowsForSection({ [verseSection]: rows }, verseSection);
}

async function readSections(context, filePath) {
	const keys = await call(context, 'getObjectKeys', [filePath], []);
	return names(keys);
}

async function readAll(context, filePath) {
	const sections = await readSections(context, filePath);
	const object = {};
	for (const section of sections) {
		object[section] = await call(
			context,
			'getObjectKey',
			[filePath, section],
			[]
		);
	}
	return allRows(object);
}

async function readAuthors(context, basePath, verseSection) {
	const aliases = names(await call(context, 'get', [basePath], []));
	const visible = [];
	for (const aliasId of aliases) {
		const aliasPath = `${basePath}/${aliasId}`;
		const aliasContext = { ...context, aliasId };
		const rows = verseSection === undefined
			? await readAll(aliasContext, aliasPath)
			: await readVerse(aliasContext, aliasPath, verseSection);
		if (rows.length) visible.push(aliasId);
	}
	return visible;
}

module.exports = {
	call,
	database,
	readAll,
	readAuthors,
	readSections,
	readVerse
};
