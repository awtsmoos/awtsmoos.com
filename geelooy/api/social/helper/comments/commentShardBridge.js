// B"H
/**
 * @file commentShardBridge.js
 * @description
 * Read-only bridge from the social comment API into derived commentary shards.
 * The bridge is intentionally conservative: it only checks shard families that
 * can plausibly contain the requested series, so empty Likkutei Sichos comment
 * folders return quickly instead of opening every shard in the universe.
 */

const fs = require("fs");
const path = require("path");
const AwtsmoosDB = require("../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js");
const awts = require("../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js");

const SHARD_SOURCE = "commentShard";

function encodePart(value) {
    return encodeURIComponent(String(value ?? "root")).replace(/%/g, "~");
}

function safeAliasFile(aliasId) {
    return encodePart(aliasId).replace(/[^A-Za-z0-9_.~-]/g, "_");
}

function shardRoot(context) {
    const root = context?.$i?.db?.directory;
    return root ? path.join(root, "socialPacked", "commentShards") : null;
}

function majorDirs(context) {
    const root = shardRoot(context);
    if (!root) return [];
    try {
        return fs.readdirSync(root, { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => entry.name);
    } catch {
        return [];
    }
}

function likelyMajorDirs(context) {
    const seriesId = String(context?.seriesId || "");
    const all = majorDirs(context);
    const preferred = [];
    if (/^(berakhot|shabbat|eiruvin|pesachim|yoma|sukkah|beitzah|rosh_hashanah|taanit|megillah|moed_katan|chagigah|yevamot|ketubot|nedarim|nazir|sotah|gittin|kiddushin|bava_|sanhedrin|makkot|shevuot|avodah_zarah|horayot|zevachim|menachot|chullin|bekhorot|arakhin|temurah|keritot|meilah|tamid|middot|niddah)/.test(seriesId)) preferred.push("talmudBavli");
    if (/^(bereshis|shemos|vayikra|bamidbar|devarim|yehoshua|shoftim|shmuel|melachim|yirmiyahu|yechezkel|yeshayahu|tehillim|mishlei|iyov|shir_hashirim|rus|eicha|koheles|ester|daniel|ezra|nechemia|divrei_hayamim)/.test(seriesId)) preferred.push("tanach");
    if (/^(likkuteiSichos|likkuteiSichosVolume|chassidus|derechMitzvosecha|hayomYom|imreiBina|keserShemTov|kuntress|maamarim|seferHasichos|torahOhr|likkuteiTorah|tanya)/.test(seriesId)) preferred.push("chassidus");
    if (/^mishnah/.test(seriesId)) preferred.push("mishnah");
    const unique = [...new Set(preferred)].filter(dir => all.includes(dir));
    return unique.length ? unique : all;
}

function shardFile(context, majorId, aliasId) {
    const root = shardRoot(context);
    return root ? path.join(root, majorId, `${safeAliasFile(aliasId)}.comments.fs.awtsdb`) : null;
}

function virtualBase(context) {
    return `/bySeries/${encodePart(context.seriesId)}/byPost/${encodePart(context.parentId)}`;
}

function readVirtualFile(dbFile, virtualPath) {
    if (!dbFile || !fs.existsSync(dbFile) || fs.statSync(dbFile).size < 1) return null;
    const db = new AwtsmoosDB(dbFile, { readOnly: true, readonly: true, wal: false, processLockMode: "shared", lockMode: "shared" });
    try {
        db.open();
        const stat = db.fs.stat(virtualPath);
        if (!stat?.exists || stat.type !== "file" || !stat.size) return null;
        return awts.deserializeBinary(db.fs.readRange(virtualPath, 0, stat.size));
    } catch {
        return null;
    } finally {
        try { db.pager?.close?.(); db.processLock?.release?.(); } catch {}
    }
}

function eligible(context) {
    return context?.parentType === "post" && context?.seriesId && context?.parentId;
}

function unwrapRecord(row) {
    if (!row || typeof row !== "object") return row;
    const comment = row.comment && typeof row.comment === "object" ? { ...row.comment } : { ...row };
    if (comment.verseSection === undefined && row.verseSection !== undefined) comment.verseSection = row.verseSection;
    if (comment.dayuh && comment.dayuh.verseSection === undefined && row.verseSection !== undefined) comment.dayuh = { ...comment.dayuh, verseSection: row.verseSection };
    return comment;
}

function unwrapRows(data) {
    return Array.isArray(data) ? data.map(unwrapRecord) : data;
}

function readFromAliasShard(context, aliasId, virtualPath) {
    if (!eligible(context) || !aliasId) return null;
    for (const majorId of likelyMajorDirs(context)) {
        const file = shardFile(context, majorId, aliasId);
        const unwrapped = unwrapRows(readVirtualFile(file, virtualPath));
        if (Array.isArray(unwrapped) && unwrapped.length) return { data: unwrapped, majorId, file, virtualPath };
        if (unwrapped && typeof unwrapped === "object" && Object.keys(unwrapped).length) return { data: unwrapped, majorId, file, virtualPath };
    }
    return null;
}

function readAliasSection(context, verseSection) {
    return readFromAliasShard(context, context.aliasId, `${virtualBase(context)}/bySection/${encodePart(verseSection)}.awtsmoosJSON`);
}

function readAliasAll(context) {
    return readFromAliasShard(context, context.aliasId, `${virtualBase(context)}/comments.awtsmoosJSON`);
}

function readAliasSections(context) {
    const hit = readAliasAll(context);
    if (!hit || !Array.isArray(hit.data)) return null;
    const sections = [...new Set(hit.data.map(row => row?.verseSection ?? row?.dayuh?.verseSection).filter(value => value !== undefined && value !== null))];
    return { ...hit, data: sections.map(String) };
}

function aliasFiles(context) {
    const out = new Set();
    const root = shardRoot(context);
    if (!root) return [];
    for (const majorId of likelyMajorDirs(context)) {
        try {
            for (const file of fs.readdirSync(path.join(root, majorId))) if (file.endsWith(".comments.fs.awtsdb")) out.add(file.replace(/\.comments\.fs\.awtsdb$/i, ""));
        } catch {}
    }
    return [...out];
}

function readAuthors(context, verseSection) {
    if (!eligible(context)) return null;
    const authors = [];
    for (const aliasId of aliasFiles(context)) {
        const testContext = { ...context, aliasId };
        const hit = verseSection === undefined ? readAliasAll(testContext) : readAliasSection(testContext, verseSection);
        if (hit && Array.isArray(hit.data) && hit.data.length) authors.push(aliasId);
    }
    return authors.length ? { data: authors, majorId: "mixed", file: shardRoot(context), virtualPath: virtualBase(context) } : null;
}

module.exports = { SHARD_SOURCE, readAliasSection, readAliasAll, readAliasSections, readAuthors };
