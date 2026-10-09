// B"H
// Drive Intake — flexible post document intake for the firehose.
// Detects input shape, validates, normalizes to canonical post documents.
// Never guesses: unknown shapes go to quarantine, never to the import stream.
//
// Usage:
//   node scripts/drive-intake/intake.mjs --in <driveDir> --out <batchDir>
//
// Output:
//   <batchDir>/normalized/*.json   — canonical post documents
//   <batchDir>/manifest.json       — {files:[{file,postId,series,sha256,bytes}], postCount}
//   <batchDir>/quarantine/         — rejected files with reasons

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const SCHEMAS = {
  'meluket-post': {
    fingerprint: (d) => typeof d.id === 'string' && d.id.startsWith('BH_') &&
      d.enrichment && typeof d.enrichment === 'object' &&
      Array.isArray(d.enrichment.hebrew_phrases),
    normalize: normalizeMeluketPost,
  },
  'raw-maamar': {
    fingerprint: (d) => typeof d.hebrew_text === 'string' && d.hebrew_text.length > 0 &&
      d.metadata && typeof d.metadata === 'object',
    normalize: normalizeRawMaamar,
  },
};

function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function normalizeMeluketPost(d, file) {
  // Already canonical-ish; enforce required fields and deterministic ID.
  const postId = d.id || d.postId;
  if (!postId || !postId.startsWith('BH_')) return { error: 'MISSING_POST_ID' };
  if (!d.enrichment || !Array.isArray(d.enrichment.hebrew_phrases) ||
      !d.enrichment.hebrew_phrases.length) {
    return { error: 'EMPTY_HEBREW' };
  }
  return {
    ok: true,
    doc: {
      id: postId, postId,
      seriesId: d.seriesId || d.parentSeriesId || 'unknown',
      heichelId: d.heichelId || 'ikar',
      title: d.title || '',
      createdAt: d.createdAt || Date.now(),
      content: d.content || '',
      hebrew_text_raw: d.hebrew_text_raw || d.hebrew_text || '',
      enrichment: d.enrichment,
      footnotes: d.footnotes || [],
      verification: { status: 'intake-normalized', checkedAt: Date.now(), sourceFile: file },
    },
  };
}

function normalizeRawMaamar(d, file) {
  // Raw Hebrew text + metadata; enrichment comes later from other agents.
  const meta = d.metadata || {};
  const postId = meta.postId || meta.id;
  if (!postId || !postId.startsWith('BH_')) return { error: 'MISSING_POST_ID' };
  return {
    ok: true,
    doc: {
      id: postId, postId,
      seriesId: meta.seriesId || 'unknown',
      heichelId: meta.heichelId || 'ikar',
      title: meta.title || '',
      createdAt: meta.createdAt || Date.now(),
      content: '',
      hebrew_text_raw: d.hebrew_text,
      enrichment: { hebrew_phrases: [], translation_en_phrases: [] },
      footnotes: [],
      verification: { status: 'intake-raw', checkedAt: Date.now(), sourceFile: file },
    },
  };
}

function detectSchema(d) {
  for (const [name, s] of Object.entries(SCHEMAS)) {
    try { if (s.fingerprint(d)) return name; } catch { /* next */ }
  }
  return 'unknown';
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--in') out.in = argv[++i];
    else if (argv[i] === '--out') out.out = argv[++i];
  }
  return out;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.in || !args.out) {
    console.error('Usage: node scripts/drive-intake/intake.mjs --in <driveDir> --out <batchDir>');
    process.exit(2);
  }
  const inDir = path.resolve(args.in);
  const outDir = path.resolve(args.out);
  const normDir = path.join(outDir, 'normalized');
  const quarDir = path.join(outDir, 'quarantine');
  fs.mkdirSync(normDir, { recursive: true });
  fs.mkdirSync(quarDir, { recursive: true });

  const files = fs.readdirSync(inDir).filter(f => f.endsWith('.json'));
  const manifest = [];
  const quarantine = [];
  const seenIds = new Set();

  for (const f of files) {
    const p = path.join(inDir, f);
    let d;
    try { d = JSON.parse(fs.readFileSync(p, 'utf8')); }
    catch (e) { quarantine.push({ file: f, reason: 'INVALID_JSON: ' + e.message }); continue; }

    const schema = detectSchema(d);
    if (schema === 'unknown') {
      // Fingerprint the shape for human review — never guess.
      const keys = Object.keys(d).sort().join(',');
      quarantine.push({ file: f, reason: 'UNKNOWN_SCHEMA', keys });
      fs.writeFileSync(path.join(quarDir, f + '.reason.json'),
        JSON.stringify({ file: f, reason: 'UNKNOWN_SCHEMA', topKeys: Object.keys(d).sort() }, null, 2));
      continue;
    }
    const r = SCHEMAS[schema].normalize(d, f);
    if (!r.ok) {
      quarantine.push({ file: f, reason: r.error, schema });
      continue;
    }
    if (seenIds.has(r.doc.postId)) {
      quarantine.push({ file: f, reason: 'DUPLICATE_POST_ID', postId: r.doc.postId });
      continue;
    }
    seenIds.add(r.doc.postId);

    // Deterministic output: sorted keys.
    const out = JSON.stringify(r.doc, Object.keys(r.doc).sort(), 2);
    const outName = r.doc.postId + '.json';
    fs.writeFileSync(path.join(normDir, outName), out);
    manifest.push({
      file: outName, postId: r.doc.postId, series: r.doc.seriesId,
      schema, sha256: sha256(out), bytes: Buffer.byteLength(out),
    });
  }

  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify({
    intakeBy: 'scripts/drive-intake/intake.mjs',
    intakeAt: new Date().toISOString(),
    files: manifest, postCount: manifest.length,
    quarantined: quarantine.length, quarantine,
  }, null, 2));

  console.log(JSON.stringify({
    ok: true, normalized: manifest.length, quarantined: quarantine.length,
    outDir,
  }));
}

main().catch(e => { console.error('INTAKE_FAILED: ' + e.message); process.exit(1); });
