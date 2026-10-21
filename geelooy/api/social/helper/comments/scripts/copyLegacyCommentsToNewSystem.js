#!/usr/bin/env node
//B"H
//Blessed is He
//Boruch Hashem
/**
 * @file copyLegacyCommentsToNewSystem.js
 * @description
 * Discovers legacy comment-tree parents and optionally indexes their comments
 * into the authoritative AwtsmoosDB comment-search sidecar. It never writes
 * packed comment shards, JSONL mirrors, vector copies, or fallback stores.
 */

const { migrateParentCommentsToAwtsmoosDb, compactReport } = require("../commentMigration.js");

const {
	parseArgs, repoRoot, defaultDbPath, makeRuntime, discoverTargets, totals, love, modeName, defaultProgress
} = require("./copyLegacyCommentsHelpers.js");

async function copyLegacyCommentsToNewSystem(options = {}) {
    const dbPath = path.resolve(options.dbPath || defaultDbPath());
    const $i = options.$i || await makeRuntime(dbPath);
    const dryRun = options.write ? false : options.dryRun !== false;
    const parentType = options.parentType || "post";
    const indexSearch = Boolean(options.indexSearch);
    love("migration opening", { dbPath, dryRun, mode: modeName({ indexSearch }), heichelId: options.heichelId || "ALL", seriesId: options.seriesId || "ALL", duplicateMirrorWritten: false });
    const targets = await discoverTargets({ ...options, $i, parentType });
    love("discovered targets", { count: targets.length });
    const reports = [];
    for (let index = 0; index < targets.length; index++) {
        const target = targets[index];
        love(`(${index + 1}/${targets.length}) entering ${target.heichelId}/${target.seriesId}/${target.parentType}/${target.parentId}`);
        const report = await migrateParentCommentsToAwtsmoosDb({ $i, ...target, dryRun, fastMode: true, indexSearch, onProgress: options.onProgress || defaultProgress });
        reports.push(report);
        love("running totals", totals(reports));
    }
    const result = { BH: "B\"H", success: true, dbPath, dryRun, indexSearch, duplicateMirrorWritten: false, targetCount: targets.length, totals: totals(reports), reports };
    love("migration complete", { dryRun, indexSearch, targetCount: result.targetCount, totals: result.totals, duplicateMirrorWritten: false });
    return result;
}

if (require.main === module) {
    const args = parseArgs(process.argv.slice(2));
    copyLegacyCommentsToNewSystem({
        dbPath: args.db || args.dbPath,
        heichelId: args.heichel || args.heichelId,
        seriesId: args.series || args.seriesId,
        parentId: args.parent || args.parentId,
        parentType: args.parentType || "post",
        postId: args.post || args.postId,
        write: Boolean(args.write),
        dryRun: !args.write,
        indexSearch: Boolean(args.index)
    }).then(report => {
        console.log(JSON.stringify(report, null, 2));
        if (report.totals.errors) process.exitCode = 1;
    }).catch(error => {
        console.error(JSON.stringify({ BH: "B\"H", error: true, message: error.message, stack: error.stack }, null, 2));
        process.exitCode = 1;
    });
}

module.exports = { parseArgs, repoRoot, defaultDbPath, makeRuntime, copyLegacyCommentsToNewSystem };