// B"H
/**
 * @file commentMigration.js
 * @description
 * The old comment vessels remain the canonical source. This migrator reads
 * their alias/verse arrays and mirrors each shtar into the AwtsmoosDB AI-search
 * sidecar with binary/tightly-packed metadata for future semantic engines.
 */

const {
    getParentCommentsBasePath,
    getAliasCommentFilePath
} = require("./commentPaths.js");

const {
    indexCommentSearchRecord
} = require("./commentAwtsmoosDbBridge.js");

const {
    writeCommentShardRecord
} = require("./commentShardMirror.js");

const {
    writeMigrationManifest
} = require("../packed/socialPacked.js");

function stableMigratedId({ comment, aliasId, verseSection, index }) {
    if (comment?.id) return comment.id;
    if (comment?.commentId) return comment.commentId;
    return `BH_migrated_${aliasId}_${verseSection}_${index}`;
}

function migrationPacket({ sourcePath, aliasId, verseSection, index }) {
    return {
        version: 1,
        source: "legacy-comment-paths",
        sourcePath,
        aliasId,
        verseSection,
        index,
        migratedAt: Date.now()
    };
}

/**
 * Migrates comments for one parent path into the AwtsmoosDB search sidecar.
 * @param {object} params Migration params.
 * @returns {Promise<object>} Migration report.
 */
async function migrateParentCommentsToAwtsmoosDb({
    $i,
    heichelId,
    seriesId,
    parentType = "post",
    parentId,
    postId,
    storageFormat = "awtsmoosBinary",
    legacySourceFormat = "awtsmoosJson",
    dryRun = false,
    writeManifest = true
}) {
    if (!$i?.db) return { error: true, message: "Missing $i.db" };
    if (!heichelId || !seriesId || !parentId) {
        return { error: true, message: "Missing heichelId, seriesId, or parentId" };
    }

    const parentBasePath = getParentCommentsBasePath({
        heichelId,
        seriesId,
        parentId,
        parentType,
        postId
    });
    if (!parentBasePath) return { error: true, message: "Could not resolve parent comment path" };

    let aliases = [];
    try {
        aliases = await $i.db.get(parentBasePath);
    } catch (_) {
        aliases = [];
    }
    const aliasIds = Array.isArray(aliases) ? aliases : Object.keys(aliases || {});
    const report = {
        success: true,
        parentBasePath,
        aliasesSeen: aliasIds.length,
        migrated: 0,
        sharded: 0,
        skipped: 0,
        dryRun,
        errors: []
    };

    for (const aliasId of aliasIds) {
        const aliasPath = getAliasCommentFilePath({
            heichelId,
            seriesId,
            parentId,
            aliasId,
            parentType,
            postId
        });
        let verseSections = [];
        try {
            const keys = await $i.db.getObjectKeys(aliasPath);
            verseSections = Array.isArray(keys) ? keys : Object.keys(keys || {});
        } catch (error) {
            report.errors.push({ aliasId, aliasPath, message: error.message || String(error) });
            continue;
        }

        for (const verseSection of verseSections) {
            let comments = [];
            try {
                const value = await $i.db.getObjectKey(aliasPath, verseSection);
                comments = Array.isArray(value) ? value : [];
            } catch (error) {
                report.errors.push({ aliasId, aliasPath, verseSection, message: error.message || String(error) });
                continue;
            }

            for (let index = 0; index < comments.length; index++) {
                const comment = comments[index];
                if (!comment || typeof comment !== "object") {
                    report.skipped++;
                    continue;
                }

                const id = stableMigratedId({ comment, aliasId, verseSection, index });
                comment.id = id;
                comment.author = comment.author || aliasId;
                comment.verseSection = comment.verseSection ?? verseSection;

                const migration = migrationPacket({ sourcePath: aliasPath, aliasId, verseSection, index });
                if (dryRun) {
                    report.migrated++;
                    report.sharded++;
                    continue;
                }

                const indexed = await indexCommentSearchRecord({
                    $i,
                    comment,
                    heichelId,
                    seriesId,
                    parentId,
                    parentType,
                    postId: postId || (parentType === "post" ? parentId : undefined),
                    aliasId,
                    status: "migrated",
                    storageFormat,
                    legacySourceFormat,
                    migration
                });

                const sharded = writeCommentShardRecord({
                    $i,
                    comment,
                    context: {
                        heichelId,
                        seriesId,
                        parentType,
                        parentId,
                        postId: postId || (parentType === "post" ? parentId : undefined),
                        aliasId,
                        verseSection
                    },
                    migration
                });

                if (indexed?.success) report.migrated++;
                else report.errors.push({ aliasId, verseSection, index, indexed });
                if (sharded?.file) report.sharded++;
                else report.errors.push({ aliasId, verseSection, index, sharded });
            }
        }
    }

    if (!dryRun && writeManifest) {
        writeMigrationManifest({
            $i,
            manifest: {
                id: `comment_${heichelId}_${seriesId}_${parentType}_${parentId}_${Date.now()}`,
                type: "legacyCommentsToPackedShards",
                parentBasePath,
                heichelId,
                seriesId,
                parentType,
                parentId,
                postId: postId || (parentType === "post" ? parentId : ""),
                aliasesSeen: report.aliasesSeen,
                migrated: report.migrated,
                sharded: report.sharded,
                skipped: report.skipped,
                errors: report.errors.length,
                createdAt: Date.now()
            }
        });
    }

    return report;
}

module.exports = {
    migrateParentCommentsToAwtsmoosDb
};
