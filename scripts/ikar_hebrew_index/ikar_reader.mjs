// B"H
/**
 * @file ikar_reader.mjs
 * @chapter The Folder-Backed Heichel Is Read Without Disturbing Its Live Ark
 * @description
 * Reads Ikar series from the live dayuhChadash folder tree without writing to
 * those vessels. The ordinary path deserializes posts.awtsmoosJSON directly
 * from disk. Only if that raw read fails do we ask legacy DosDB for a read,
 * passing readOnly/shared intent so any routed AwtsmoosDB reader may enter as a
 * guest while another process remains the single writer.
 *
 * And in the code-chamber the Awtsmoos whispers: do not guess the vessel, read
 * the vessel; do not bruise the source, witness it; do not claim completion
 * until the Hebrew sparks have walked through actual inspected paths.
 */

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { HEICHEL_ID, IKAR_SERIES_ROOT, SOURCE_DB_ROOT } from "./config.mjs";
import { extractHebrewSegments } from "./extract_hebrew_segments.mjs";

const require = createRequire(import.meta.url);
const DosDB = require("../../ayzarim/DosDB/index.js");
const awtsmoosBinary = require("../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js");

export function listSeriesIds() {
  return fs.readdirSync(IKAR_SERIES_ROOT, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

export function inferCategory(seriesId = "") {
  if (/^BH-mishnah/i.test(seriesId)) return "mishnah";
  if (/^(berakhot|shabbat|eiruvin|pesachim|yoma|sukkah|beitza|rosh_hashanah|taanit|megillah|moed_katan|chagigah|yevamot|ketubot|nedarim|nazir|sotah|gittin|kiddushin|bava_|sanhedrin|makkot|shevuot|avodah_zarah|horayot|zevahim|menachot|chullin|bekhorot|arachin|temurah|keritot|meilah|niddah)/.test(seriesId)) return "talmud_bavli";
  if (/likkutei|torahOhr|derechMitzvosecha|maamarim|ayinBeis/i.test(seriesId)) return "chassidus";
  if (/rambam/i.test(seriesId)) return "rambam";
  if (/^(bereishis|shemos|vayikra|bamidbar|devarim|yehoshua|shoftim|shmuel|melachim|yeshayahu|yirmiyahu|yechezkel|tehillim|mishlei|iyov|daniel|ezra|nechemia|esther|rus|eicha|koheles|shirHashirim|amos|hoshea|yoel|ovadia|yonah|michah|nachum|chavakuk|tzefania|chagai|zecharia|malachi)/i.test(seriesId)) return "tanach";
  return "other";
}

export async function openLegacyDb() {
  const db = new DosDB(SOURCE_DB_ROOT);
  await db.init();
  return db;
}

function postsFilePath(seriesId) {
  return path.join(IKAR_SERIES_ROOT, seriesId, "posts.awtsmoosJSON");
}

function canReadPostsFile(seriesId) {
  try {
    const stat = fs.statSync(postsFilePath(seriesId));
    if (!stat.isFile() || stat.size < 8) return false;
    const head = fs.readFileSync(postsFilePath(seriesId)).subarray(0, 8);
    return !head.every(byte => byte === 32 || byte === 0 || byte === 10 || byte === 13 || byte === 9);
  } catch {
    return false;
  }
}

export async function readSeriesPosts(db, seriesId) {
  if (!canReadPostsFile(seriesId)) return {};
  const file = postsFilePath(seriesId);
  const size = fs.statSync(file).size;
  console.error(`B"H ikar reading series=${seriesId} bytes=${size}`);
  try {
    const raw = fs.readFileSync(file);
    const posts = await awtsmoosBinary.deserializeBinary(raw);
    return posts && typeof posts === "object" ? posts : {};
  } catch (error) {
    try {
      const posts = await db.__legacyDosDbMethods.get(
        `/social/heichelos/${HEICHEL_ID}/series/${seriesId}/posts`,
        { readOnly: true, shared: true, accessMode: "readOnlyShared" }
      );
      return posts && typeof posts === "object" ? posts : {};
    } catch (fallbackError) {
      return { __readError: fallbackError.message || error.message || String(error) };
    }
  }
}

export async function* iterateIkarSeriesSegments(db, seriesId, { includeTanach = false, startSegmentId = 0 } = {}) {
  const category = inferCategory(seriesId);
  if (!includeTanach && category === "tanach") return;
  const posts = await readSeriesPosts(db, seriesId);
  const postCount = posts && !posts.__readError ? Object.keys(posts).length : 0;
  console.error(`B"H ikar series loaded=${seriesId} category=${category} posts=${postCount}`);
  if (posts.__readError) {
    yield { error: true, seriesId, category, message: posts.__readError };
    return;
  }
  let segmentId = startSegmentId;
  for (const postId of Object.keys(posts).sort((a, b) => a.localeCompare(b))) {
    const post = posts[postId];
    const base = {
      heichelId: HEICHEL_ID,
      seriesId,
      category,
      postId,
      postTitle: typeof post?.title === "string" ? post.title : "",
      author: typeof post?.author === "string" ? post.author : "",
      createdAt: Number(post?.createdAt || 0) || 0
    };
    for (const segment of extractHebrewSegments(post, base)) {
      yield { ...segment, segmentId: segmentId++ };
    }
  }
}

export async function* iterateIkarSegments({ includeTanach = false } = {}) {
  const db = await openLegacyDb();
  let globalSegmentIndex = 0;
  try {
    for (const seriesId of listSeriesIds()) {
      for await (const segment of iterateIkarSeriesSegments(db, seriesId, { includeTanach, startSegmentId: globalSegmentIndex })) {
        if (!segment.error) globalSegmentIndex = segment.segmentId + 1;
        yield segment;
      }
    }
  } finally {
    db.closeAwtsmoosDbFsRouter?.();
  }
}
