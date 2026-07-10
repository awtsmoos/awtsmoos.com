// B"H
/** Regression proof for prompt-only footnote removal, salvage, and retry. */
import fs from 'fs';
import os from 'os';
import path from 'path';
import { buildPrompt } from './build_prompt.mjs';
import { runDocument } from './document_runner.mjs';
import { recoverExactChunk } from './response_repair.mjs';

const sample = {
  documentId: 'retry-test',
  title: 'Retry test',
  meaningfulSubsectionCount: 1,
  sections: [{
    sectionIndex: 7,
    paragraphs: [{
      paragraphIndex: 0,
      text: 'בשנת 5723 נאמר מקור 23.',
      promptText: 'בשנת 5723 נאמר מקור.',
      footnotes: ['23']
    }]
  }]
};
const chunk = { ...sample, chunkIndex: 0, combinedChars: 10 };
const oversized = '<translation><v index="1"><s index="0"><en>Wrong</en></s></v><v index="7"><s index="0"><en>Right<sup>99</sup></en></s></v></translation>';
const recovered = recoverExactChunk(chunk, oversized);
if (!recovered.ok || recovered.xml.includes('<sup>')) throw new Error('Footnote-free slicing failed');
const prompt = buildPrompt(chunk);
if (prompt.includes('<fn>') || prompt.includes('מקור 23')) throw new Error('Prompt still contains the footnote marker');
if (!prompt.includes('5723')) throw new Error('Meaningful source number was removed');
if (!prompt.includes('Do not use English contractions')) throw new Error('No-contractions rule is missing');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sichos-retry-'));
let calls = 0;
const client = async () => {
  calls++;
  const xml = calls === 1
    ? '<translation><v index="7"><s index="1"><en>Wrong index</en></s></v></translation>'
    : '<translation><v index="7"><s index="0"><en>It is correct</en></s></v></translation>';
  return {
    sanitizedRequest: {}, rawResponse: { xml }, xml,
    usage: { prompt_tokens: 10, completion_tokens: 5 }
  };
};
const summary = await runDocument(sample, {
  rootDir: root, maxChars: 3500, retries: 1, retryBaseMs: 0, client
});
const attempts = path.join(root, 'documents', sample.documentId, 'chunks', '0000', 'attempts');
if (calls !== 2 || !fs.existsSync(path.join(attempts, '01', 'response.xml'))) {
  throw new Error('Retry persistence failed');
}
if (!summary.results[0].validation.ok) throw new Error('Final result failed validation');
console.log(JSON.stringify({
  ok: true,
  calls,
  promptUsesPromptText: true,
  meaningfulNumbersPreserved: true,
  noContractionsRule: true
}, null, 2));
