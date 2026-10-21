//B"H
//Blessed is He
//Boruch Hashem
/**
 * @file migrateOldCommentsRun.js
 * @description Runtime + migration runner extracted verbatim from migrateOldCommentsToAwtsmoosDb.js.
 */
const path = require("path");
const DosDB = require("../../../../../../ayzarim/DosDB/index.js");
const { migrateParentCommentsToAwtsmoosDb } = require("../commentMigration.js");
const { discoverCommentParents } = require("../commentMigrationDiscovery.js");

/**
 * Builds the runtime context used by comment helpers.
 * @param {string} dbPath Database root path.
 * @returns {Promise<object>} Runtime context.
 */
async function makeRuntime(dbPath) {
    const db = new DosDB(dbPath);
    await db.init();
    return { db };
}

/**
 * Runs one or many comment migrations.
 * @param {object} options Migration options.
 * @returns {Promise<object>} Migration report.
 */
async function runCommentMigration({
    $i,
    dbPath,
    heichelId,
    seriesId,
    parentId,
    parentType = "post",
    postId,
    dryRun = false,
    storageFormat = "awtsmoosBinary",
    legacySourceFormat = "awtsmoosJson"
}) {
    const runtime = $i || await makeRuntime(dbPath || path.resolve(process.cwd(), "../../dayuhChadash"));
    if (!heichelId) return { error: true, message: "Missing heichelId. Pass --heichel=<id>." };

    const parents = parentId
        ? [{ heichelId, seriesId, parentType, parentId, postId: postId || (parentType === "post" ? parentId : undefined) }]
        : await discoverCommentParents({ $i: runtime, heichelId, seriesId });

    if (!parents.length) {
        return {
            success: true,
            dryRun,
            discoveredParents: 0,
            reports: [],
            message: "No legacy comment parents found for the provided scope."
        };
    }

    const reports = [];
    for (const parent of parents) {
        reports.push(await migrateParentCommentsToAwtsmoosDb({
            $i: runtime,
            ...parent,
            storageFormat,
            legacySourceFormat,
            dryRun
        }));
    }

    return {
        success: true,
        dryRun,
        discoveredParents: parents.length,
        totals: reports.reduce((total, report) => ({
            migrated: total.migrated + (report.migrated || 0),
            sharded: total.sharded + (report.sharded || 0),
            skipped: total.skipped + (report.skipped || 0),
            errors: total.errors + (report.errors?.length || 0)
        }), { migrated: 0, sharded: 0, skipped: 0, errors: 0 }),
        reports
    };
}

module.exports = { makeRuntime, runCommentMigration };