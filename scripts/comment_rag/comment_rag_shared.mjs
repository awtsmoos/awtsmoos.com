// B"H
/**
 * @file comment_rag_shared.mjs
 * @description
 * The shared altar for Likkutei Sichos comment RAG builders. It does not write
 * to the living comment tree. It only reads routed extensionless comments and
 * shapes deterministic chunks that can be embedded, checkpointed, and resumed.
 */
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const DosDB = require('../../ayzarim/DosDB/index.js');

export const DEFAULT_ROOT = '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash';
export const DEFAULT_ALIAS = 'likkutei_translation_en';

export function volumesFromSpec(spec = '1-15') {
  const out = [];
  for (const part of String(spec || '').split(',')) {
    const trimmed = part.trim();
    const range = trimmed.match(/^(\d+)-(\d+)$/);
    if (range) {
      for (let i = Number(range[1]); i <= Number(range[2]); i++) out.push(i);
    } else if (trimmed) out.push(Number(trimmed));
  }
  return [...new Set(out)].filter(Number.isFinite).sort((a, b) => a - b);
}

export function countComments(obj) {
  return Object.entries(obj || {}).reduce((sum, [key, value]) => {
    return /^\d+$/.test(key) && Array.isArray(value) ? sum + value.length : sum;
  }, 0);
}

export function summariesIn(ragDir) {
  if (!fs.existsSync(ragDir)) return [];
  return fs.readdirSync(ragDir)
    .filter(name => name.startsWith('likkutei_comment_migrate_'))
    .map(name => path.join(ragDir, name, 'summary.json'))
    .filter(fs.existsSync)
    .sort();
}

export function commentPathsFromSummaries(ragDir, selected, aliasId = DEFAULT_ALIAS) {
  const wanted = new Set(selected.map(volume => `likkuteiSichosVolume${volume}`));
  const out = new Map();
  for (const file of summariesIn(ragDir)) {
    let summary;
    try { summary = JSON.parse(fs.readFileSync(file, 'utf8')); }
    catch { continue; }
    if (!summary?.apply) continue;
    for (const item of summary.paths || []) {
      const route = String(item.path || '').replace(/\.(awtsmoosJSON|json)$/i, '');
      const match = route.match(/atSeries\/([^/]+)\/atPost\/([^/]+)\/([^/]+)$/);
      if (!match || match[3] !== aliasId || !wanted.has(match[1])) continue;
      out.set(route, {
        commentPath: route,
        seriesId: match[1],
        postId: match[2],
        aliasId: match[3],
        volume: Number(match[1].replace(/\D+/g, ''))
      });
    }
  }
  return [...out.values()].sort((a, b) => a.volume - b.volume || a.commentPath.localeCompare(b.commentPath));
}

export function rowsToText(rows) {
  return rows.map(item => {
    const section = item.verseSection ?? item.dayuh?.verseSection ?? '';
    const sub = item.subSection ?? item.dayuh?.subSection ?? '';
    const hebrew = item.sourceHebrew || item.dayuh?.sourceHebrew || '';
    const english = item.content || '';
    return `[${section}:${sub}] ${hebrew}\nEN: ${english}`;
  }).join('\n');
}

export function chunksFromBranch(branch, versesPerChunk) {
  const keys = Object.keys(branch.obj || {})
    .filter(key => /^\d+$/.test(key) && Array.isArray(branch.obj[key]) && branch.obj[key].length)
    .sort((a, b) => Number(a) - Number(b));
  const chunks = [];
  for (let i = 0; i < keys.length; i += versesPerChunk) {
    const slice = keys.slice(i, i + versesPerChunk);
    const rows = slice.flatMap(key => branch.obj[key]);
    chunks.push({
      id: `${branch.seriesId}:${branch.postId}:v${slice[0]}-v${slice.at(-1)}`,
      source: 'likkutei_sichos',
      sourceType: 'comment_translation',
      volume: branch.volume,
      seriesId: branch.seriesId,
      postId: branch.postId,
      aliasId: branch.aliasId,
      commentPath: branch.commentPath,
      verseStart: Number(slice[0]),
      verseEnd: Number(slice.at(-1)),
      commentCount: rows.length,
      commentIds: rows.map(row => row?.id).filter(Boolean),
      firstCommentId: rows[0]?.id || '',
      lastCommentId: rows.at(-1)?.id || '',
      sampleContent: rows[0]?.content || '',
      text: rowsToText(rows)
    });
  }
  return chunks;
}

export async function buildManifest({ root, ragDir, volumes, aliasId, versesPerChunk }) {
  const dos = new DosDB(root);
  await dos.init?.();
  const branches = [];
  const skipped = [];
  for (const meta of commentPathsFromSummaries(ragDir, volumes, aliasId)) {
    const obj = await dos.get(meta.commentPath).catch(error => ({ __error: String(error?.message || error) }));
    const comments = countComments(obj);
    if (comments) branches.push({ ...meta, obj, comments });
    else skipped.push({ ...meta, reason: obj?.__error || 'empty' });
  }
  return {
    BH: 'B"H',
    root,
    ragDir,
    volumes,
    aliasId,
    versesPerChunk,
    branches: branches.length,
    skipped,
    chunks: branches.flatMap(branch => chunksFromBranch(branch, versesPerChunk))
  };
}

export function readJsonlRecords(file) {
  if (!fs.existsSync(file)) return [];
  const records = [];
  const lines = fs.readFileSync(file, 'utf8').split(/\n/).filter(Boolean);
  for (const line of lines) {
    try { records.push(JSON.parse(line)); }
    catch { records.push({ __badLine: line.slice(0, 120) }); }
  }
  return records;
}

export function readResultRecords(resultsDir) {
  if (!fs.existsSync(resultsDir)) return [];
  return fs.readdirSync(resultsDir)
    .filter(name => name.endsWith('.jsonl'))
    .sort()
    .flatMap(name => readJsonlRecords(path.join(resultsDir, name)))
    .filter(item => item && !item.__badLine);
}

export function uniqueRecords(records) {
  const out = new Map();
  for (const record of records) if (record?.id && !out.has(record.id)) out.set(record.id, record);
  return [...out.values()].sort((a, b) => a.id.localeCompare(b.id));
}

export function sidecarCount(root) {
  const base = path.join(root, 'social/heichelos/ikar/comments/atSeries');
  if (!fs.existsSync(base)) return 0;
  const { execFileSync } = require('child_process');
  const script = `find ${JSON.stringify(base)} -path '*/likkuteiSichosVolume*/atPost/*/likkutei_translation_en.awtsmoosJSON' -type f 2>/dev/null | wc -l`;
  return Number(require('child_process').execSync(script).toString().trim() || 0);
}
