// B"H
/**
 * @file commentReadSources.js
 * @description
 * Comment reads ask only the authoritative DosDB path language. For migrated
 * heichel comments, DosDB may internally route that path into AwtsmoosDB, but
 * no duplicate packed mirror is a fallback source.
 */

const { getAliasCommentFilePath, getParentCommentsBasePath } = require("./commentPaths.js");
const { NEW_SOURCE, OLD_SOURCE, attempt, readResponse } = require("./commentReadReport.js");

function names(value) {
    const strip = name => String(name).replace(/\.awtsmoosJSON$/i, "");
    if (Array.isArray(value)) return value.map(strip).filter(Boolean);
    if (value && typeof value === "object") return Object.keys(value).map(strip).filter(Boolean);
    return [];
}

function resolveVerseSection($i, verseSection) {
    const incoming = verseSection ?? $i.$_GET?.verseSection ?? $i.$_GET?.idx;
    return incoming === undefined || incoming === null || incoming === "" ? undefined : incoming;
}

function parseMap(value) {
    if (!value) return null;
    if (typeof value === "object") return value;
    try { return JSON.parse(value); } catch { return null; }
}

async function readNamesSafe(db, path) {
    try { return names(await db.get(path)); } catch { return []; }
}

async function candidateAliases(context, basePath) {
    const direct = await readNamesSafe(context.$i.db, basePath);
    if (direct.length) return direct;
    const editors = await readNamesSafe(context.$i.db, `/social/heichelos/${context.heichelId}/editors`);
    const out = new Set(editors);
    if (context.aliasId) out.add(context.aliasId);
    return Array.from(out).filter(Boolean);
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
    const value = await getObjectKeySafe(db, path, key);
    return value !== undefined && value !== null && !(Array.isArray(value) && value.length === 0);
}

async function readAuthorVerse(context, path, verseSection) {
    try {
        const data = await getObjectKeySafe(context.$i.db, path, verseSection);
        return attempt({ ok: true, source: OLD_SOURCE, data: Array.isArray(data) ? data.map(row => withVerse(row, verseSection)) : [] });
    } catch (error) {
        return attempt({ ok: false, source: OLD_SOURCE, error });
    }
}

async function readAuthorAllVerses(context, path) {
    try {
        const verseSections = names(await context.$i.db.getObjectKeys(path));
        const comments = [];
        for (const verseSection of verseSections) {
            const rows = await getObjectKeySafe(context.$i.db, path, verseSection).catch(() => []);
            if (Array.isArray(rows)) for (const row of rows) comments.push(withVerse(row, verseSection));
        }
        return attempt({ ok: true, source: OLD_SOURCE, data: comments });
    } catch (error) {
        return attempt({ ok: false, source: OLD_SOURCE, error });
    }
}

async function readVerseSections(context, path) {
    try { return attempt({ ok: true, source: OLD_SOURCE, data: names(await context.$i.db.getObjectKeys(path)) }); }
    catch (error) { return attempt({ ok: false, source: OLD_SOURCE, error }); }
}

async function readAuthors(context, basePath, verseSection) {
    try {
        const aliases = await candidateAliases(context, basePath);
        const authors = [];
        for (const aliasId of aliases) {
            const aliasPath = `${basePath}/${aliasId}`;
            if (verseSection === undefined) {
                const sections = await readVerseSections(context, aliasPath);
                if (sections.count > 0) authors.push(aliasId);
            } else if (await hasObjectKeySafe(context.$i.db, aliasPath, verseSection)) authors.push(aliasId);
        }
        return attempt({ ok: true, source: OLD_SOURCE, data: authors });
    } catch (error) {
        return attempt({ ok: false, source: OLD_SOURCE, error });
    }
}

function disabledDuplicateMirror() {
    return attempt({ ok: true, source: NEW_SOURCE, data: [] });
}

function projectedResponse(context, data, source, primary, fallback, paths) {
    return readResponse({ data: projectComments(context.$i, data), source, primary, fallback, paths });
}

async function readCommentsWithSource(context) {
    const verseSection = resolveVerseSection(context.$i, context.verseSection);
    if (verseSection === undefined) return await readAllCommentsOfAliasWithSource(context);
    const path = getAliasCommentFilePath(context);
    const paths = { awtsmoosDbFsPath: path, duplicateMirrorDisabled: true, verseSection };
    const primary = await readAuthorVerse(context, path, verseSection);
    if (primary.count > 0) return projectedResponse(context, primary.data, OLD_SOURCE, primary, null, paths);
    const disabled = disabledDuplicateMirror();
    return projectedResponse(context, [], "empty", primary, disabled, paths);
}

async function readAllCommentsOfAliasWithSource(context) {
    const path = getAliasCommentFilePath(context);
    const paths = { awtsmoosDbFsPath: path, duplicateMirrorDisabled: true, allVerseSections: true };
    const primary = await readAuthorAllVerses(context, path);
    if (primary.count > 0) return projectedResponse(context, primary.data, OLD_SOURCE, primary, null, paths);
    const disabled = disabledDuplicateMirror();
    return projectedResponse(context, [], "empty", primary, disabled, paths);
}

async function readVerseSectionsWithSource(context) {
    const path = getAliasCommentFilePath(context);
    const paths = { awtsmoosDbFsPath: path, duplicateMirrorDisabled: true };
    const primary = await readVerseSections(context, path);
    if (primary.count > 0) return readResponse({ data: primary.data, source: OLD_SOURCE, primary, paths });
    const disabled = disabledDuplicateMirror();
    return readResponse({ data: [], source: "empty", primary, fallback: disabled, paths });
}

async function readAuthorsWithSource(context) {
    const verseSection = resolveVerseSection(context.$i, context.verseSection);
    const basePath = getParentCommentsBasePath(context);
    const paths = { awtsmoosDbFsPath: basePath, duplicateMirrorDisabled: true, verseSection };
    const primary = await readAuthors(context, basePath, verseSection);
    if (primary.count > 0) return readResponse({ data: primary.data, source: OLD_SOURCE, primary, paths });
    const disabled = disabledDuplicateMirror();
    return readResponse({ data: [], source: "empty", primary, fallback: disabled, paths });
}

module.exports = { NEW_SOURCE, OLD_SOURCE, resolveVerseSection, readCommentsWithSource, readAllCommentsOfAliasWithSource, readVerseSectionsWithSource, readAuthorsWithSource };
