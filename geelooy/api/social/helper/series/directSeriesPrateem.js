//B"H
/**
 * @file directSeriesPrateem.js
 * @chapter The Metadata Spark Entered Its Own Quiet Chamber
 * @description
 * Reads `prateem.awtsmoosJSON` directly from the real AwtsmoosDB series family
 * file. This endpoint is the tiny, hot metadata path, so it avoids mutable
 * request DosDB state entirely under mixed concurrent API storms.
 */

const path = require("path");
const AwtsmoosDB = require("../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js");
const awtsmoosJSON = require("../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js");
const { er } = require("../general.js");

function parseMap(value) {
    if (!value) return null;
    if (typeof value === "object") return { ...value };
    try { return JSON.parse(value); }
    catch { return null; }
}

function propertyMapFromQuery($i) {
    return parseMap($i.$_GET?.propertyMap || $i.$_GET?.properties);
}

function rootDirectory($i) {
    return process.awtsmoosDbPath || process.env.AWTSMOOS_DB_PATH || $i?.db?.directory || path.resolve(process.cwd(), "../../dayuhChadash");
}

function seriesDbFile($i, heichelId) {
    return path.join(rootDirectory($i), "socialPacked", `social.heichel.${heichelId}.series.fs.awtsdb`);
}

function sharedSeriesDb(file) {
    if (!globalThis.__awtsmoosDirectSeriesDbCache) globalThis.__awtsmoosDirectSeriesDbCache = new Map();
    const cache = globalThis.__awtsmoosDirectSeriesDbCache;
    if (cache.has(file)) return cache.get(file);
    const db = new AwtsmoosDB(file, { compression: false, reuseFreedSpace: "verified" });
    db.open();
    cache.set(file, db);
    return db;
}

function project(value, map) {
    if (!map || !value || typeof value !== "object") return value;
    const out = {};
    for (const [key, rule] of Object.entries(map)) if (rule && Object.prototype.hasOwnProperty.call(value, key)) out[key] = value[key];
    return out;
}

async function readPrateemBuffer($i, heichelId, seriesId) {
    const db = sharedSeriesDb(seriesDbFile($i, heichelId));
    const filePath = `/social/heichelos/${heichelId}/series/${seriesId}/prateem.awtsmoosJSON`;
    try {
        const buffer = db.fs.cat(filePath);
        return Buffer.isBuffer(buffer) ? buffer : null;
    } catch {
        return null;
    }
}

async function getDirectSeriesPrateem({ $i, heichelId, seriesId }) {
    const buffer = await readPrateemBuffer($i, heichelId, seriesId);
    if (!buffer) return er({ code: "SERIES_NOT_FOUND", details: { heichelId, seriesId } });
    let prateem = awtsmoosJSON.deserializeBinary(buffer);
    prateem = project(prateem, propertyMapFromQuery($i));
    if (!prateem || typeof prateem !== "object") return er({ code: "SERIES_NOT_FOUND", details: { heichelId, seriesId } });
    return { prateem: { ...prateem, id: prateem.id || seriesId }, id: seriesId };
}

module.exports = { getDirectSeriesPrateem };
