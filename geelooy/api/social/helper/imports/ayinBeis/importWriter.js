// B"H
/**
 * Boruch Hashem. Blessed is He.
 *
 * @file importWriter.js
 * @description
 * In the Awtsmoos every restoration is already whole. Awtsmoos.com reveals
 * that wholeness carefully: back up the vessel, write one known post, mirror
 * the full body into packed indexes, then re-read its hash before continuing.
 */

const fs = require('fs');
const path = require('path');
const { contentHash } = require('./authorizedBundle.js');
const { mirrorConnectedPostToAllPosts } = require('../../packed/postMigration.js');

function seriesPostsPath(heichelId, seriesId) {
	return `/social/heichelos/${heichelId}/series/${seriesId}/posts`;
}

/** Read one destination post after a write for verification. */
async function readPost(db, heichelId, seriesId, postId) {
	const posts = await db.get(seriesPostsPath(heichelId, seriesId), { max: true });
	return posts && typeof posts === 'object' ? posts[postId] || null : null;
}

/** Build a replacement that preserves identity and unrelated metadata. */
function buildReplacement(item, heichelId, provenance) {
	const previous = item.targetPost || {};
	const dayuh = previous.dayuh && typeof previous.dayuh === 'object' && !Array.isArray(previous.dayuh) ? previous.dayuh : {};
	return {
		...previous,
		id: previous.id || item.targetPostId,
		postId: previous.postId || previous.id || item.targetPostId,
		heichelId,
		seriesId: previous.seriesId || previous.parentSeriesId || item.record.seriesId,
		parentSeriesId: previous.parentSeriesId || previous.seriesId || item.record.seriesId,
		title: item.record.title,
		content: item.record.content,
		dayuh: {
			...dayuh,
			importProvenance: {
				sourceName: String(provenance.sourceName || ''),
				sourceId: item.record.sourceId,
				sourceUrl: String(provenance.sourceUrl || ''),
				authorizationBasis: String(provenance.authorizationBasis || ''),
				importedAt: Date.now()
			}
		}
	};
}

/** Write a complete JSON rollback snapshot before the first mutation. */
function writeBackup(plan, backupDir) {
	fs.mkdirSync(backupDir, { recursive: true });
	const file = path.join(backupDir, `ayin-beis-before-${Date.now()}.json`);
	const records = plan.items
		.filter(item => ['fill-empty', 'replace'].includes(item.action))
		.map(item => ({ seriesId: item.record.seriesId, postId: item.targetPostId, post: item.targetPost }));
	fs.writeFileSync(file, JSON.stringify({ B_H: true, createdAt: Date.now(), records }, null, 2), 'utf8');
	return file;
}

/** Apply validated actions and verify each exact content hash after storage. */
async function applyImportPlan({ db, plan, provenance, backupDir, mirrorPost = mirrorConnectedPostToAllPosts }) {
	const writable = plan.items.filter(item => ['fill-empty', 'replace'].includes(item.action));
	if (!writable.length) return { backupFile: '', written: 0, verified: 0, items: [] };
	const backupFile = writeBackup(plan, backupDir);
	const results = [];
	for (const item of writable) {
		const post = buildReplacement(item, plan.heichelId, provenance);
		const postsPath = seriesPostsPath(plan.heichelId, item.record.seriesId);
		await db.updateEntry(postsPath, { key: item.targetPostId, value: post });
		await mirrorPost({ $i: { db }, post });
		const stored = await readPost(db, plan.heichelId, item.record.seriesId, item.targetPostId);
		const storedHash = contentHash(stored?.content || '');
		if (storedHash !== item.record.contentHash) throw new Error(`Verification failed for ${item.targetPostId}.`);
		results.push({ postId: item.targetPostId, seriesId: item.record.seriesId, action: item.action, contentHash: storedHash });
	}
	return { backupFile, written: results.length, verified: results.length, items: results };
}

module.exports = { applyImportPlan, buildReplacement, readPost, seriesPostsPath, writeBackup };
