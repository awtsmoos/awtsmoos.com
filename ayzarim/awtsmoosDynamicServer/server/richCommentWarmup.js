//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file richCommentWarmup.js
 * @chapter The Commentary Wakes Before The Door Opens
 * @description
 * The Awtsmoos lets Awtsmoos.com hydrate packed commentary before readiness.
 * Representative files are discovered from live inode metadata, so startup does
 * not require a duplicate full-path index to remain resident in memory.
 */

function liveInodes(database) {
	return database?.__fs3Manifest?.inodes || {};
}

function firstPath(database, matcher) {
	for (const inode of Object.values(liveInodes(database))) {
		if (!inode || inode.deleted || typeof inode.path !== 'string') continue;
		if (matcher(inode.path, inode)) return inode.path;
	}
	return null;
}

function representativePaths(database) {
	let rootIndex = null;
	let commentBody = null;
	for (const inode of Object.values(liveInodes(database))) {
		if (!inode || inode.deleted || typeof inode.path !== 'string') continue;
		const path = inode.path;
		if (!rootIndex && path.endsWith('/commentTree/roots')) rootIndex = path;
		if (!commentBody && path.endsWith('/data')) commentBody = path;
		if (rootIndex && commentBody) break;
	}
	return { rootIndex, commentBody };
}

function warmFile(database, path) {
	if (!path) return false;
	const stat = database.fs.stat(path);
	if (!stat?.exists || stat.type !== 'file') return false;
	const length = Math.min(Number(stat.size || 0), 4096);
	if (length > 0) database.fs.readRange(path, 0, length);
	return true;
}

function warmRepresentativeData(database) {
	const paths = representativePaths(database);
	return {
		rootIndex: warmFile(database, paths.rootIndex),
		commentBody: warmFile(database, paths.commentBody)
	};
}

function warmRichCommentAuthority(context = {}, dependencies = {}) {
	const databaseRoot = context?.db?.directory;
	if (!databaseRoot) return { warmed: false, skipped: true };
	const packedStore = dependencies.packedStore;
	const fs = dependencies.fs;
	if (!packedStore || !fs) return { warmed: false, skipped: true };
	const file = packedStore.dbFile(context);
	if (!file || !fs.existsSync(file)) return { warmed: false, skipped: true };
	const database = packedStore.open(context);
	database.fs.ready();
	return {
		warmed: true,
		skipped: false,
		data: warmRepresentativeData(database)
	};
}

module.exports = {
	firstPath,
	representativePaths,
	warmRepresentativeData,
	warmRichCommentAuthority
};
