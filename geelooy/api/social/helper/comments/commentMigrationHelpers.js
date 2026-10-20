//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module CommentMigrationHelpers
 * @description Legacy migration helpers: ids, packets, listing and reading (split from commentMigration.js, verbatim).
 */

function stableMigratedId({ comment, aliasId, verseSection, index }) {
    return comment?.id || comment?.commentId || `BH_migrated_${aliasId}_${verseSection}_${index}`;
}

function migrationPacket({ sourcePath, aliasId, verseSection, index }) {
    return { version: 6, source: "legacy-comment-paths", sourcePath, aliasId, verseSection, index, migratedAt: Date.now(), packedMirrorWritten: false };
}

function names(value) {
    if (Array.isArray(value)) return value.map(String).filter(Boolean);
    if (value && typeof value === "object") return Object.keys(value).map(String).filter(Boolean);
    return [];
}

function progress(params, event, data = {}) {
    if (typeof params.onProgress === "function") params.onProgress({ event, ...data });
}

async function listAliases({ $i, parentBasePath }) {
    try { return names(await $i.db.get(parentBasePath)); } catch (_) { return []; }
}

async function listVerseSections({ $i, aliasPath }) {
    try { return names(await $i.db.getObjectKeys(aliasPath)); } catch (_) { return []; }
}

async function readLegacyComments({ $i, aliasPath, verseSection }) {
    try {
        const value = await $i.db.getObjectKey(aliasPath, verseSection);
        return Array.isArray(value) ? value : [];
    } catch (_) { return []; }
}

module.exports = {
	stableMigratedId,
	migrationPacket,
	names,
	progress,
	listAliases,
	listVerseSections,
	readLegacyComments,
};
