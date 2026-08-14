// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module RichCompatibilityRead
 * @description Legacy author/alias views derive from bounded dedicated rich trees.
 */
const reader = require('./richCommentReader.js');

function aliasOf(row) {
	return String(row?.aliasId || row?.author || '').trim();
}

function flatten(rows = []) {
	const out = [];
	for (const row of rows) {
		out.push(row);
		out.push(...flatten(row.replies || []));
	}
	return out;
}

async function tree({ $i, heichelId, postId, verseSection = '' }) {
	const rows = [];
	let offset = 0;
	let pages = 0;
	let report;
	do {
		report = await reader.getTree({
			$i,
			heichelId,
			postId,
			verseSection,
			offset,
			limit: 100,
			maxDepth: 8,
			replyLimit: 100
		});
		rows.push(...(report.success || []));
		offset += 100;
		pages++;
	} while (report?.meta?.hasMore && pages < 50);
	return flatten(rows);
}

async function authors(args) {
	return {
		success: [...new Set((await tree(args)).map(aliasOf).filter(Boolean))]
	};
}

async function aliasComments({ aliasId, ...args }) {
	return {
		success: (await tree(args)).filter(row => aliasOf(row) === String(aliasId))
	};
}

async function aliasSections({ aliasId, ...args }) {
	const report = await aliasComments({ aliasId, ...args });
	return {
		success: [...new Set(report.success.map(row => String(row.verseSection ?? 'root')))]
	};
}

module.exports = {
	aliasComments,
	aliasOf,
	aliasSections,
	authors,
	flatten,
	tree
};
