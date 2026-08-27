#!/usr/bin/env node
// B"H
/**
 * @file migrateOldCommentsToAwtsmoosDb.js
 * @description
 * A real migration runner for old alias/verse comment vessels. It can migrate
 * one parent directly, or discover every post/comment parent in a heichel and
 * mirror each comment into both the AwtsmoosDB search sidecar and the packed
 * social shard.
 */

const path = require("path");
const DosDB = require("../../../../../../ayzarim/DosDB/index.js");
const { migrateParentCommentsToAwtsmoosDb } = require("../commentMigration.js");
const { discoverCommentParents } = require("../commentMigrationDiscovery.js");

/**
 * Parses `--key=value` and boolean flags from argv.
 * @param {Array<string>} argv Raw CLI args.
 * @returns {object} Parsed flags.
 */
function parseArgs(argv) {
    const args = {};
    for (const item of argv) {
        if (!item.startsWith("--")) continue;
        const body = item.slice(2);
        const equals = body.indexOf("=");
        if (equals === -1) args[body] = true;
        else args[body.slice(0, equals)] = body.slice(equals + 1);
    }
    return args;
}

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

if (require.main === module) {
    const args = parseArgs(process.argv.slice(2));
    runCommentMigration({
        dbPath: args.db,
        heichelId: args.heichel || args.heichelId,
        seriesId: args.series || args.seriesId,
        parentId: args.parent || args.parentId,
        parentType: args.parentType || "post",
        postId: args.post || args.postId,
        dryRun: Boolean(args.dryRun)
    }).then(report => {
        console.log(JSON.stringify({ BH: "B\"H", ...report }, null, 2));
        if (report.error || report.totals?.errors) process.exitCode = 1;
    }).catch(error => {
        console.error(JSON.stringify({
            BH: "B\"H",
            error: true,
            message: error.message,
            stack: error.stack
        }, null, 2));
        process.exitCode = 1;
    });
}

module.exports = {
    parseArgs,
    makeRuntime,
    runCommentMigration
};
