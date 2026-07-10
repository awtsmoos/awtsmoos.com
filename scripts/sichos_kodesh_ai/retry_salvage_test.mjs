// B"H
/** Regression proof for validation-guided retry and oversized-output salvage. */
import fs from 'fs';
import os from 'os';
import path from 'path';
import { runDocument } from './document_runner.mjs';
import { recoverExactChunk } from './response_repair.mjs';

const sample = { documentId: 'retry-test', title: 'Retry test', meaningfulSubsectionCount: 1,
  sections: [{ sectionIndex: 7, paragraphs: [{ paragraphIndex: 0, text: 'מקור 23', footnotes: ['23'] }] }] };
const chunk = { ...sample, chunkIndex: 0, combinedChars: 10 };
const oversized = '<translation><v index="1"><s index="0"><en>Wrong</en></s></v><v index="7"><s index="0"><en>Right<sup>23</sup></en></s></v><v index="9"><s index="0"><en>Extra</en></s></v></translation>';
const recovered = recoverExactChunk(chunk, oversized);
if (!recovered.ok || recovered.method !== 'indexed_v_slice') throw new Error('Oversized response was not safely sliced');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sichos-retry-'));
let calls = 0;
const prompts = [];
const client = async ({ prompt }) => {
  prompts.push(prompt); calls++;
  const xml = calls === 1
    ? '<translation><v index="7"><s index="0"><en>Wrong<sup>24</sup></en></s></v></translation>'
    : '<translation><v index="7"><s index="0"><en>Right<sup>23</sup></en></s></v></translation>';
  return { sanitizedRequest: {}, rawResponse: { xml }, xml, usage: { prompt_tokens: 10, completion_tokens: 5 } };
};
const summary = await runDocument(sample, { rootDir: root, maxChars: 3500, retries: 1, retryBaseMs: 0, client });
const chunkDir = path.join(root, 'documents', sample.documentId, 'chunks', '0000');
const firstAttempt = path.join(chunkDir, 'attempts', '01', 'response.xml');
const secondPrompt = path.join(chunkDir, 'attempts', '02', 'prompt.txt');
if (calls !== 2) throw new Error(`Expected 2 calls, got ${calls}`);
if (!fs.existsSync(firstAttempt)) throw new Error('Rejected response was not persisted');
if (!fs.readFileSync(secondPrompt, 'utf8').includes('footnotes mismatch')) throw new Error('Retry prompt lacks validation feedback');
if (!summary.results[0].validation.ok) throw new Error('Final result did not validate');
console.log(JSON.stringify({ ok: true, calls, oversizedRecovery: recovered.method, rejectedAttemptPersisted: true, feedbackPrompted: true }, null, 2));
