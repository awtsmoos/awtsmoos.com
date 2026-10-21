//B"H
//Blessed is He
//Boruch Hashem
/**
 * @file copyLegacyCommentsHelpers.js
 * @description Shared helpers extracted verbatim from copyLegacyCommentsToNewSystem.js.
 */
const path = require("path");
const DosDB = require("../../../../../../ayzarim/DosDB/index.js");
const { migrateParentCommentsToAwtsmoosDb, compactReport } = require("../commentMigration.js");
const { discoverCommentParents } = require("../commentMigrationDiscovery.js");

function parseArgs(argv) {
    const args = {};
    for (const item of argv) {
        if (!item.startsWith("--")) continue;
        const raw = item.slice(2);
        const eq = raw.indexOf("=");
        args[eq === -1 ? raw : raw.slice(0, eq)] = eq === -1 ? true : raw.slice(eq + 1).replace(/^"|"$/g, "");
    }
    return args;
}

function repoRoot() {
    return path.resolve(__dirname, "../../../../../../");
}

function defaultDbPath() {
    return path.resolve(repoRoot(), "../../dayuhChadash");
}

async function makeRuntime(dbPath) {
    const db = new DosDB(dbPath);
    await db.init();
    process.awtsmoosDbPath = dbPath;
    return { db };
}

function names(value) {
    if (Array.isArray(value)) return value.map(String).filter(Boolean);
    if (value && typeof value === "object") return Object.keys(value).map(String).filter(Boolean);
    return [];
}

async function listAllHeichelIds($i) {
    try { return names(await $i.db.get("/social/heichelos")); }
    catch (_) { return []; }
}

async function discoverTargets({ $i, heichelId, seriesId, parentId, parentType, postId }) {
    if (parentId) return [{ heichelId, seriesId, parentId, parentType, postId: postId || (parentType === "post" ? parentId : undefined) }];
    const heichelIds = heichelId ? [heichelId] : await listAllHeichelIds($i);
    const targets = [];
    for (const id of heichelIds) targets.push(...await discoverCommentParents({ $i, heichelId: id, seriesId }));
    return targets;
}

function totals(reports) {
    return reports.reduce((sum, report) => {
        const compact = compactReport(report);
        for (const key of Object.keys(sum)) sum[key] += compact[key] || 0;
        return sum;
    }, { aliasesSeen: 0, versesSeen: 0, copied: 0, migrated: 0, indexed: 0, sharded: 0, vectors: 0, vectorSkipped: 0, alreadyPresent: 0, skipped: 0, errors: 0 });
}

function love(message, data) {
    const suffix = data ? ` ${JSON.stringify(data)}` : "";
    console.log(`B\"H ${new Date().toLocaleTimeString()} ${message}${suffix}`);
}

function modeName({ indexSearch }) {
    return indexSearch ? "search-sidecar-index" : "audit-discovery-only";
}

function defaultProgress(event) {
    if (event.event === "parent:aliases") love("parent aliases found", { parentId: event.parentId, aliasesSeen: event.aliasesSeen });
    if (event.event === "alias:start" && event.verseCount) love("alias verses found", { aliasId: event.aliasId, verseCount: event.verseCount });
    if (event.event === "verse:start" && event.commentCount) love("walking verse", { aliasId: event.aliasId, verseSection: event.verseSection, commentCount: event.commentCount });
}

module.exports = { parseArgs, repoRoot, defaultDbPath, makeRuntime, names, listAllHeichelIds, discoverTargets, totals, love, modeName, defaultProgress };