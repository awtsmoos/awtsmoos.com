// B"H
/** Generate the complete Sichos Kodesh translation manifest outside the repo. */
import fs from 'fs';
import path from 'path';
import { DEFAULT_OUTPUT_ROOT, writeJson, writeText } from './save_output.mjs';
import { classifyDocument, loadCorpus } from './corpus_utils.mjs';

function csvCell(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function toCsv(rows) {
  const columns = ['documentId', 'title', 'sourcePath', 'eligible', 'reason', 'rawSectionCount', 'meaningfulSectionCount', 'meaningfulSubsectionCount', 'chars', 'footnoteCount'];
  return [columns.join(','), ...rows.map(row => columns.map(key => csvCell(row[key])).join(','))].join('\n');
}

function toMarkdown(summary, rows) {
  const skipped = rows.filter(row => !row.eligible);
  const lines = [
    'B"H', '', '# Sichos Kodesh corpus audit', '',
    `- Total farbrengens: ${summary.total}`,
    `- Eligible for translation: ${summary.eligible}`,
    `- Skipped: ${summary.skipped}`,
    `- Meaningful subsections: ${summary.meaningfulSubsections}`,
    `- Source characters: ${summary.sourceChars}`,
    `- Footnote references: ${summary.footnotes}`, '',
    '## Skipped records', ''
  ];
  for (const row of skipped) lines.push(`- \`${row.documentId}\` — ${row.title} — **${row.reason}**`);
  lines.push('', '## Eligible farbrengens', '');
  for (const row of rows.filter(row => row.eligible)) {
    lines.push(`- \`${row.documentId}\` — ${row.title} — ${row.meaningfulSectionCount} v / ${row.meaningfulSubsectionCount} s / ${row.chars} chars`);
  }
  return lines.join('\n');
}

function main() {
  const corpus = loadCorpus();
  const docs = Object.entries(corpus.collections?.Farbrengens?.documents || {});
  const rows = docs.map(([documentId, doc]) => classifyDocument(documentId, doc));
  const summary = {
    generatedAt: new Date().toISOString(),
    total: rows.length,
    eligible: rows.filter(row => row.eligible).length,
    skipped: rows.filter(row => !row.eligible).length,
    meaningfulSubsections: rows.reduce((sum, row) => sum + row.meaningfulSubsectionCount, 0),
    sourceChars: rows.reduce((sum, row) => sum + row.chars, 0),
    footnotes: rows.reduce((sum, row) => sum + row.footnoteCount, 0)
  };
  const dir = path.join(DEFAULT_OUTPUT_ROOT, 'config');
  fs.mkdirSync(dir, { recursive: true });
  writeJson(path.join(dir, 'corpus-manifest.json'), { summary, documents: rows });
  writeJson(path.join(dir, 'eligible-farbrengens.json'), rows.filter(row => row.eligible));
  writeJson(path.join(dir, 'skipped-farbrengens.json'), rows.filter(row => !row.eligible));
  writeText(path.join(dir, 'corpus-manifest.csv'), toCsv(rows));
  writeText(path.join(dir, 'corpus-manifest.md'), toMarkdown(summary, rows));
  console.log(JSON.stringify({ summary, outputDir: dir }, null, 2));
}

main();
