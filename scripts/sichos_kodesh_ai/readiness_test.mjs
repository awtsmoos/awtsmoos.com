// B"H
/** Offline readiness tests: stitching, retries, resume, footnotes, indices. */
import fs from 'fs';
import os from 'os';
import path from 'path';
import assert from 'assert/strict';
import { runDocument } from './document_runner.mjs';
import { parseSichosXml, validateParsed } from './parse_xml.mjs';

const document = {
  documentId: 'fixture-doc', title: 'Fixture', sections: [
    { sectionIndex: 4, paragraphs: [
      { paragraphIndex: 2, text: 'מקור 12', footnotes: ['12'] },
      { paragraphIndex: 5, text: 'עוד מקור 12 13', footnotes: ['12', '13'] }
    ] },
    { sectionIndex: 9, paragraphs: [
      { paragraphIndex: 1, text: 'סיום', footnotes: [] }
    ] }
  ]
};

function xmlFor(sample) {
  const body = sample.sections.map(v => `<v index="${v.sectionIndex}">${v.paragraphs.map(s => {
    const supers = s.footnotes.map(n => `<sup>${n}</sup>`).join('');
    return `<s index="${s.paragraphIndex}"><en>English ${supers}</en></s>`;
  }).join('')}</v>`).join('');
  return `<translation>${body}</translation>`;
}

async function main() {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sichos-ready-'));
  let calls = 0;
  const flakyClient = async ({ prompt }) => {
    calls++;
    if (calls === 1) throw new Error('simulated transient failure');
    const sectionIndices = [...prompt.matchAll(/<v index="(\d+)">/g)].map(m => Number(m[1]));
    const sample = { sections: document.sections.filter(v => sectionIndices.includes(v.sectionIndex)) };
    return { xml: xmlFor(sample), usage: { prompt_tokens: 10, completion_tokens: 5 }, sanitizedRequest: {}, rawResponse: {} };
  };
  const first = await runDocument(document, { rootDir, maxChars: 12, retries: 2, retryBaseMs: 1, client: flakyClient });
  assert.equal(first.chunks, 2);
  assert.equal(calls, 3);
  const finalXml = fs.readFileSync(path.join(rootDir, 'documents', document.documentId, 'translation.xml'), 'utf8');
  assert.equal(validateParsed(document, parseSichosXml(finalXml)).ok, true);
  const beforeResume = calls;
  const second = await runDocument(document, { rootDir, maxChars: 12, retries: 2, retryBaseMs: 1, client: flakyClient });
  assert.equal(second.results.every(result => result.reused), true);
  assert.equal(calls, beforeResume);
  const badFootnote = '<translation><v index="4"><s index="2"><en>English <sup>13</sup></en></s><s index="5"><en>English <sup>12</sup><sup>13</sup></en></s></v><v index="9"><s index="1"><en>English</en></s></v></translation>';
  assert.equal(validateParsed(document, parseSichosXml(badFootnote)).ok, false);
  console.log(JSON.stringify({ ok: true, chunks: first.chunks, retryCalls: calls, resumedWithoutCalls: true, finalValidation: true }, null, 2));
}

main().catch(error => { console.error(error.stack || String(error)); process.exit(1); });
