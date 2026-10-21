#!/usr/bin/env node
//B"H
//Blessed is He
//Boruch Hashem
/**
 * @file migrateOldCommentsToAwtsmoosDb.js
 * @description
 * A real migration runner for old alias/verse comment vessels. It can migrate
 * one parent directly, or discover every post/comment parent in a heichel and
 * mirror each comment into both the AwtsmoosDB search sidecar and the packed
 * social shard.
 */

const { makeRuntime, runCommentMigration } = require("./migrateOldCommentsRun.js");

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