#!/usr/bin/env node
// B"H
/**
 * @file copyLegacyCommentsToNewSystem.js
 * @chapter The Gathering Of Old Sparks
 * @description
 * Scans the old comment tree under dayuhChadash/social/heichelos and copies
 * legacy comments into the new read system. It defaults to dry-run; pass
 * --write to actually mirror comments into packed shards and search sidecars.
 */

const path = require("path");
const DosDB = require("../../../../../../ayzarim/DosDB/index.js");
const { migrateParentCommentsToAwtsmoosDb } = require("../commentMigration.js");
const { discoverCommentParents } = require("../commentMigrationDiscovery.js");

/** @param {Array<string>} argv @returns {object} */
function parseArgs(argv) {
    const args = {};
    for (const item of argv) {
        if (!item.startsWith("--")) continue;
        const raw = item.slice(2);
        const eq = raw.indexOf("=");
        if (eq === -1) args[raw] = true;
        else args[raw.slice(0, eq)] = raw.slice(eq + 1);
    }
    return args;
}

/** @param {string} dbPath @returns {Promise<object>} */
async function makeRuntime(dbPath) {
    const db = new DosDB(dbPath);
    await db.init();
    return { db };
}

/** @param {object} $i @returns {Promise<Array<string>>} */
async function listAllHeichelIds($i) {
    try {
        const value = await $i.db.get("/social/heichelos");
        if (Array.isArray(value)) return value.map(String).filter(Boolean);
        if (value && typeof value === "object") return Object.keys(value).map(String).filter(Boolean);
        return [];
    } catch (_) {
        return [];
    }
}

/** @param {object} options @returns {Promise<Array<object>>} */
async function discoverTargets({ $i, heichelId, seriesId, parentId, parentType, postId }) {
    if (parentId) return [{ heichelId, seriesId, parentId, parentType, postId: postId || (parentType === "post" ? parentId : undefined) }];
    const heichelIds = heichelId ? [heichelId] : await listAllHeichelIds($i);
    const targets = [];
    for (const id of heichelIds) {
        targets.push(...await discoverCommentParents({ $i, heichelId: id, seriesId }));
    }
    return targets;
}

/** @param {object} reports @returns {object} */
function totals(reports) {
    return reports.reduce((sum, report) => ({
        copied: sum.copied + (report.copied || 0),
        indexed: sum.indexed + (report.indexed || 0),
        sharded: sum.sharded + (report.sharded || 0),
        alreadyPresent: sum.alreadyPresent + (report.alreadyPresent || 0),
        skipped: sum.skipped + (report.skipped || 0),
        errors: sum.errors + (report.errors?.length || 0)
    }), { copied: 0, indexed: 0, sharded: 0, alreadyPresent: 0, skipped: 0, errors: 0 });
}

/** @param {object} options @returns {Promise<object>} */
async function copyLegacyCommentsToNewSystem(options = {}) {
    const dbPath = options.dbPath || path.resolve(process.cwd(), "../../dayuhChadash");
    const $i = options.$i || await makeRuntime(dbPath);
    const dryRun = options.write ? false : options.dryRun !== false;
    const parentType = options.parentType || "post";
    const targets = await discoverTargets({ ...options, $i, parentType });
    const reports = [];

    for (const target of targets) {
        reports.push(await migrateParentCommentsToAwtsmoosDb({ $i, ...target, dryRun }));
    }

    return {
        BH: "B\"H",
        success: true,
        dbPath,
        dryRun,
        targetCount: targets.length,
        totals: totals(reports),
        reports
    };
}

if (require.main === module) {
    const args = parseArgs(process.argv.slice(2));
    copyLegacyCommentsToNewSystem({
        dbPath: args.db,
        heichelId: args.heichel || args.heichelId,
        seriesId: args.series || args.seriesId,
        parentId: args.parent || args.parentId,
        parentType: args.parentType || "post",
        postId: args.post || args.postId,
        write: Boolean(args.write),
        dryRun: !args.write
    }).then(report => {
        console.log(JSON.stringify(report, null, 2));
        if (report.totals.errors) process.exitCode = 1;
    }).catch(error => {
        console.error(JSON.stringify({ BH: "B\"H", error: true, message: error.message, stack: error.stack }, null, 2));
        process.exitCode = 1;
    });
}

module.exports = { parseArgs, makeRuntime, copyLegacyCommentsToNewSystem };
