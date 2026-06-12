// B"H
/**
 * @file commentReadSources.js
 * @chapter The Comment Tree Refused The Slow Shadow
 * @description
 * Comment reads ask DosDB first. For migrated heichel comments, DosDB routes to
 * the AwtsmoosDB family filesystem. The old packed shard fallback is disabled
 * unless `allowPackedFallback=true`, because missing migrated comments must fail
 * fast rather than scan a giant fallback mirror.
 */

const { getAliasCommentFilePath, getParentCommentsBasePath } = require("./commentPaths.js");
const { readCommentShardRecords, listPackedCommentAuthors, listPackedCommentVerseSections } = require("./commentShardMirror.js");
const { NEW_SOURCE, OLD_SOURCE, attempt, readResponse } = require("./commentReadReport.js");

function names(value) {
    if (Array.isArray(value)) return value.map(String).filter(Boolean).map(name => name.replace(/\.awtsmoosJSON$/i, ""));
    if (value && typeof value === "object") return Object.keys(value).map(String).filter(Boolean).map(name => name.replace(/\.awtsmoosJSON$/i, ""));
    return [];
}

function resolveVerseSection($i, verseSection) {
    if (verseSection === undefined || verseSection === null || verseSection === "") verseSection = $i.$_GET?.verseSection ?? $i.$_GET?.idx;
    if (verseSection === undefined || verseSection === null || verseSection === "") return undefined;
    return verseSection;
}

function parseMap(value) {
    if (!value) return null;
    if (typeof value === "object") return value;
    try { return JSON.parse(value); }
    catch { return null; }
}

function allowPackedFallback(context) {
    return context.$i.$_GET?.disablePackedFallback !== "true";
}

function commentPropertyMap($i) {
    return parseMap($i.$_GET?.propertyMap || $i.$_GET?.properties);
}

function projectScalar(value, rule) {
    if (typeof rule === "number" && typeof value === "string") return value.slice(0, rule);
    if (typeof rule === "number" && value && typeof value === "object") {
        const copy = Array.isArray(value) ? value.slice(0, rule) : { ...value };
        if (typeof copy.text === "string") copy.text = copy.text.slice(0, rule);
        return copy;
    }
    return value;
}

function projectOne(comment, map) {
    if (!map || !comment || typeof comment !== "object") return comment;
    const out = {};
    for (const [key, rule] of Object.entries(map)) {
        if (rule === false || rule === undefined || rule === null) continue;
        if (Object.prototype.hasOwnProperty.call(comment, key)) out[key] = projectScalar(comment[key], rule);
    }
    if (comment.verseSection !== undefined && out.verseSection === undefined && map.verseSection !== false) out.verseSection = comment.verseSection;
    return out;
}

function projectComments($i, comments) {
    const map = commentPropertyMap($i);
    return map ? comments.map(comment => projectOne(comment, map)) : comments;
}

function withVerse(row, verseSection) {
    return row && typeof row === "object" ? { ...row, verseSection: row.verseSection ?? row.dayuh?.verseSection ?? verseSection } : row;
}

async function getObjectKeySafe(db, path, key) {
    if (typeof db.getObjectKey === "function") return await db.getObjectKey(path, key);
    const obj = await db.get(path, { propertyMap: { [key]: true } });
    return obj && obj[key];
}

async function hasObjectKeySafe(db, path, key) {
    if (typeof db.hasObjectKey === "function") return await db.hasObjectKey(path, key);
    const obj = await db.get(path, { propertyMap: { [key]: true } });
    return Boolean(obj && Object.prototype.hasOwnProperty.call(obj, key));
}

async function readOldCommentsAtVerse(context, legacyPath, verseSection) {
    try {
        const data = await getObjectKeySafe(context.$i.db, legacyPath, verseSection);
        return attempt({ ok: true, source: OLD_SOURCE, data: Array.isArray(data) ? data.map(row => withVerse(row, verseSection)) : [] });
    } catch (error) {
        return attempt({ ok: false, source: OLD_SOURCE, error });
    }
}

async function readOldAllCommentsOfAlias(context, legacyPath) {
    try {
        const verseSections = names(await context.$i.db.getObjectKeys(legacyPath));
        const comments = [];
        for (const verseSection of verseSections) {
            const rows = await getObjectKeySafe(context.$i.db, legacyPath, verseSection).catch(() => []);
            if (!Array.isArray(rows)) continue;
            for (const row of rows) comments.push(withVerse(row, verseSection));
        }
        return attempt({ ok: true, source: OLD_SOURCE, data: comments });
    } catch (error) {
        return attempt({ ok: false, source: OLD_SOURCE, error });
    }
}

async function tryOldVerseSections(context, legacyPath) {
    try { return attempt({ ok: true, source: OLD_SOURCE, data: names(await context.$i.db.getObjectKeys(legacyPath)) }); }
    catch (error) { return attempt({ ok: false, source: OLD_SOURCE, error }); }
}

async function readOldAuthors(context, legacyBase, verseSection) {
    try {
        const aliases = names(await context.$i.db.get(legacyBase));
        if (verseSection === undefined) return attempt({ ok: true, source: OLD_SOURCE, data: aliases });
        const authors = [];
        for (const aliasId of aliases) if (await hasObjectKeySafe(context.$i.db, `${legacyBase}/${aliasId}`, verseSection)) authors.push(aliasId);
        return attempt({ ok: true, source: OLD_SOURCE, data: authors });
    } catch (error) {
        return attempt({ ok: false, source: OLD_SOURCE, error });
    }
}

function tryPackedComments(context) {
    if (!allowPackedFallback(context)) return attempt({ ok: true, source: NEW_SOURCE, data: [] });
    try { return attempt({ ok: true, source: NEW_SOURCE, data: readCommentShardRecords(context) }); }
    catch (error) { return attempt({ ok: false, source: NEW_SOURCE, error }); }
}

function tryPackedVerseSections(context) {
    if (!allowPackedFallback(context)) return attempt({ ok: true, source: NEW_SOURCE, data: [] });
    try { return attempt({ ok: true, source: NEW_SOURCE, data: listPackedCommentVerseSections({ ...context, verseSection: undefined }) }); }
    catch (error) { return attempt({ ok: false, source: NEW_SOURCE, error }); }
}

function tryPackedAuthors(context) {
    if (!allowPackedFallback(context)) return attempt({ ok: true, source: NEW_SOURCE, data: [] });
    try { return attempt({ ok: true, source: NEW_SOURCE, data: listPackedCommentAuthors(context) }); }
    catch (error) { return attempt({ ok: false, source: NEW_SOURCE, error }); }
}

function projectedResponse(context, data, source, primary, fallback, paths) {
    return readResponse({ data: projectComments(context.$i, data), source, primary, fallback, paths });
}

async function readCommentsWithSource(context) {
    const verseSection = resolveVerseSection(context.$i, context.verseSection);
    const legacyPath = getAliasCommentFilePath(context);
    const paths = { awtsmoosDbFsPath: legacyPath, oldPackedShardFallback: allowPackedFallback(context), verseSection };
    if (verseSection === undefined) return await readAllCommentsOfAliasWithSource(context);
    const primary = await readOldCommentsAtVerse(context, legacyPath, verseSection);
    if (primary.count > 0) return projectedResponse(context, primary.data, OLD_SOURCE, primary, null, paths);
    const fallback = tryPackedComments({ ...context, verseSection });
    return projectedResponse(context, fallback.data, fallback.count > 0 ? NEW_SOURCE : "empty", primary, fallback, paths);
}

async function readAllCommentsOfAliasWithSource(context) {
    const legacyPath = getAliasCommentFilePath(context);
    const paths = { awtsmoosDbFsPath: legacyPath, oldPackedShardFallback: allowPackedFallback(context), allVerseSections: true };
    const primary = await readOldAllCommentsOfAlias(context, legacyPath);
    if (primary.count > 0) return projectedResponse(context, primary.data, OLD_SOURCE, primary, null, paths);
    const fallback = tryPackedComments({ ...context, verseSection: undefined });
    return projectedResponse(context, fallback.data, fallback.count > 0 ? NEW_SOURCE : "empty", primary, fallback, paths);
}

async function readVerseSectionsWithSource(context) {
    const legacyPath = getAliasCommentFilePath(context);
    const paths = { awtsmoosDbFsPath: legacyPath, oldPackedShardFallback: allowPackedFallback(context) };
    const primary = await tryOldVerseSections(context, legacyPath);
    if (primary.count > 0) return readResponse({ data: primary.data, source: OLD_SOURCE, primary, paths });
    const fallback = tryPackedVerseSections(context);
    return readResponse({ data: fallback.data, source: fallback.count > 0 ? NEW_SOURCE : "empty", primary, fallback, paths });
}

async function readAuthorsWithSource(context) {
    const verseSection = resolveVerseSection(context.$i, context.verseSection);
    const legacyBase = getParentCommentsBasePath(context);
    const paths = { awtsmoosDbFsPath: legacyBase, oldPackedShardFallback: allowPackedFallback(context), verseSection };
    const primary = await readOldAuthors(context, legacyBase, verseSection);
    if (primary.count > 0) return readResponse({ data: primary.data, source: OLD_SOURCE, primary, paths });
    const fallback = tryPackedAuthors({ ...context, verseSection });
    return readResponse({ data: fallback.data, source: fallback.count > 0 ? NEW_SOURCE : "empty", primary, fallback, paths });
}

module.exports = { NEW_SOURCE, OLD_SOURCE, resolveVerseSection, readCommentsWithSource, readAllCommentsOfAliasWithSource, readVerseSectionsWithSource, readAuthorsWithSource };
