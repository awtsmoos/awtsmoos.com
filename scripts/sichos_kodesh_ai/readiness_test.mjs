// B"H
/** Readiness test for retry, reuse, stitching, and footnote-free policy. */
import assert from 'assert';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { runDocument } from './document_runner.mjs';
import { parseSichosXml } from './parse_xml.mjs';
import { validateForJob } from './translation_policy.mjs';

const document = { documentId: 'readiness', title: 'Readiness', meaningfulSubsectionCount: 2,
  sections: [{ sectionIndex: 1, paragraphs: [
    { paragraphIndex: 0, text: 'מקור 12', footnotes: ['12'] },
    { paragraphIndex: 1, text: 'מקור נוסף', footnotes: [] }
  ] }] };

async function main() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sichos-ready-'));
  let calls = 0;
  const client = async () => {
    calls++;
    const xml = calls === 1
      ? '<translation><v index="1"><s index="9"><en>Bad</en></s></v></translation>'
      : '<translation><v index="1"><s index="0"><en>English<sup>99</sup></en></s><s index="1"><en>More</en></s></v></translation>';
    return { sanitizedRequest: {}, rawResponse: { xml }, xml,
      usage: { prompt_tokens: 10, completion_tokens: 5 } };
  };
  const first = await runDocument(document, { rootDir: root, maxChars: 3500,
    retries: 2, retryBaseMs: 0, client });
  assert.equal(calls, 2);
  assert.equal(first.results[0].validation.ok, true);
  const before = calls;
  await runDocument(document, { rootDir: root, maxChars: 3500, retries: 0, client });
  assert.equal(calls, before);
  const xml = fs.readFileSync(path.join(root,'documents','readiness','translation.xml'),'utf8');
  assert.equal(validateForJob(document, parseSichosXml(xml)).ok, true);
  console.log(JSON.stringify({ ok: true, retryCalls: calls, resumedWithoutCalls: true,
    finalValidation: true, footnotesSkipped: true }, null, 2));
}

main();
