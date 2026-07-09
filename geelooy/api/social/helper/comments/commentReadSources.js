// B"H
/**
 * @file commentReadSources.js
 * @description
 * Comment reads first ask DosDB, then — only when the old packed FS exposes a
 * directory but DosDB cannot deserialize the alias file — read the exact
 * AwtsmoosDB VirtualFS file directly. This restores old Tanach translation and
 * commentary files such as `torah_translation_en.awtsmoosJSON` without changing
 * any comment write path.
 */

const path = require("path");
const { getAliasCommentFilePath, getParentCommentsBasePath } = require("./commentPaths.js");
const { NEW_SOURCE, OLD_SOURCE, attempt, readResponse } = require("./commentReadReport.js");
const AwtsmoosDB = require("../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js");
const awts = require("../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js");

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

async function readNamesSafe(db, filePath) {
    try { return names(await db.get(filePath)); } catch { return []; }
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

async function getObjectKeySafe(db, filePath, key) {
    if (typeof db.getObjectKey === "function") return await db.getObjectKey(filePath, key);
    const obj = await db.get(filePath, { propertyMap: { [key]: true } });
    return obj && obj[key];
}

async function getFullObjectSafe(db, filePath) {
    try {
        const obj = await db.get(filePath);
        return obj && typeof obj === "object" && !Array.isArray(obj) ? obj : null;
    } catch {
        return null;
    }
}

function packedCommentsDbPath(context) {
    const root = context.$i?.db?.directory;
    if (!root || !context.heichelId) return null;
    return path.join(root, "socialPacked", `social.heichel.${context.heichelId}.comments.fs.awtsdb`);
}

function directVirtualObject(context, filePath) {
    const dbFile = packedCommentsDbPath(context);
    if (!dbFile) return null;
    const virtualPath = filePath.endsWith(".awtsmoosJSON") ? filePath : `${filePath}.awtsmoosJSON`;
    let db;
    try {
        db = new AwtsmoosDB(dbFile, { compression: false, reuseFreedSpace: "verified", readOnly: true, processLockMode: "shared", lockMode: "shared" });
        db.open();
        const stat = db.fs.stat(virtualPath);
        if (!stat?.exists || stat.type !== "file" || !stat.size) return null;
        const buffer = db.fs.readRange(virtualPath, 0, stat.size);
        return awts.deserializeBinary(buffer);
    } catch {
        return null;
    } finally {
        try { db?.pager?.close?.(); db?.processLock?.release?.(); } catch {}
    }
}

function rowsFromObjectKeyObject(obj, verseSection) {
    const rows = obj && (obj[String(verseSection)] ?? obj[verseSection]);
    return Array.isArray(rows) ? rows.map(row => withVerse(row, verseSection)) : [];
}

function allRowsFromObjectKeyObject(obj) {
    const comments = [];
    if (!obj || typeof obj !== "object") return comments;
    for (const [verseSection, rows] of Object.entries(obj)) {
        if (Array.isArray(rows)) for (const row of rows) comments.push(withVerse(row, verseSection));
    }
    return comments;
}

async function hasObjectKeySafe(context, filePath, key) {
    const value = await getObjectKeySafe(context.$i.db, filePath, key).catch(() => undefined);
    if (value !== undefined && value !== null && !(Array.isArray(value) && value.length === 0)) return true;
    const obj = await getFullObjectSafe(context.$i.db, filePath) || directVirtualObject(context, filePath);
    return rowsFromObjectKeyObject(obj, key).length > 0;
}

async function readAuthorVerse(context, filePath, verseSection) {
    try {
        const data = await getObjectKeySafe(context.$i.db, filePath, verseSection);
        if (Array.isArray(data) && data.length) return attempt({ ok: true, source: OLD_SOURCE, data: data.map(row => withVerse(row, verseSection)) });
    } catch {}
    const obj = await getFullObjectSafe(context.$i.db, filePath) || directVirtualObject(context, filePath);
    return attempt({ ok: true, source: OLD_SOURCE, data: rowsFromObjectKeyObject(obj, verseSection) });
}

async function readAuthorAllVerses(context, filePath) {
    try {
        const verseSections = names(await context.$i.db.getObjectKeys(filePath));
        const comments = [];
        for (const verseSection of verseSections) {
            const rows = await getObjectKeySafe(context.$i.db, filePath, verseSection).catch(() => []);
            if (Array.isArray(rows)) for (const row of rows) comments.push(withVerse(row, verseSection));
        }
        if (comments.length) return attempt({ ok: true, source: OLD_SOURCE, data: comments });
    } catch {}
    const obj = await getFullObjectSafe(context.$i.db, filePath) || directVirtualObject(context, filePath);
    return attempt({ ok: true, source: OLD_SOURCE, data: allRowsFromObjectKeyObject(obj) });
}

async function readVerseSections(context, filePath) {
    try {
        const direct = names(await context.$i.db.getObjectKeys(filePath));
        if (direct.length) return attempt({ ok: true, source: OLD_SOURCE, data: direct });
    } catch {}
    const obj = await getFullObjectSafe(context.$i.db, filePath) || directVirtualObject(context, filePath);
    return attempt({ ok: true, source: OLD_SOURCE, data: names(obj) });
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
            } else if (await hasObjectKeySafe(context, aliasPath, verseSection)) authors.push(aliasId);
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
    const filePath = getAliasCommentFilePath(context);
    const paths = { awtsmoosDbFsPath: filePath, directPackedFallback: true, duplicateMirrorDisabled: true, verseSection };
    const primary = await readAuthorVerse(context, filePath, verseSection);
    if (primary.count > 0) return projectedResponse(context, primary.data, OLD_SOURCE, primary, null, paths);
    const disabled = disabledDuplicateMirror();
    return projectedResponse(context, [], "empty", primary, disabled, paths);
}

async function readAllCommentsOfAliasWithSource(context) {
    const filePath = getAliasCommentFilePath(context);
    const paths = { awtsmoosDbFsPath: filePath, directPackedFallback: true, duplicateMirrorDisabled: true, allVerseSections: true };
    const primary = await readAuthorAllVerses(context, filePath);
    if (primary.count > 0) return projectedResponse(context, primary.data, OLD_SOURCE, primary, null, paths);
    const disabled = disabledDuplicateMirror();
    return projectedResponse(context, [], "empty", primary, disabled, paths);
}

async function readVerseSectionsWithSource(context) {
    const filePath = getAliasCommentFilePath(context);
    const paths = { awtsmoosDbFsPath: filePath, directPackedFallback: true, duplicateMirrorDisabled: true };
    const primary = await readVerseSections(context, filePath);
    if (primary.count > 0) return readResponse({ data: primary.data, source: OLD_SOURCE, primary, paths });
    const disabled = disabledDuplicateMirror();
    return readResponse({ data: [], source: "empty", primary, fallback: disabled, paths });
}

async function readAuthorsWithSource(context) {
    const verseSection = resolveVerseSection(context.$i, context.verseSection);
    const basePath = getParentCommentsBasePath(context);
    const paths = { awtsmoosDbFsPath: basePath, directPackedFallback: true, duplicateMirrorDisabled: true, verseSection };
    const primary = await readAuthors(context, basePath, verseSection);
    if (primary.count > 0) return readResponse({ data: primary.data, source: OLD_SOURCE, primary, paths });
    const disabled = disabledDuplicateMirror();
    return readResponse({ data: [], source: "empty", primary, fallback: disabled, paths });
}

module.exports = { NEW_SOURCE, OLD_SOURCE, resolveVerseSection, readCommentsWithSource, readAllCommentsOfAliasWithSource, readVerseSectionsWithSource, readAuthorsWithSource };
