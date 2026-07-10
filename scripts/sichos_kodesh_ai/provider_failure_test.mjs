// B"H
/** Offline verification that fatal provider errors are not retried. */
import fs from 'fs';
import os from 'os';
import path from 'path';
import assert from 'assert/strict';
import { runDocument } from './document_runner.mjs';
import { DeepSeekError } from './deepseek_client.mjs';

const document = {
  documentId: 'fatal-provider-fixture',
  title: 'Fatal provider fixture',
  sections: [{
    sectionIndex: 1,
    paragraphs: [{ paragraphIndex: 0, text: 'מקור', footnotes: [] }]
  }]
};

async function main() {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sichos-provider-'));
  let calls = 0;
  const client = async () => {
    calls++;
    throw new DeepSeekError('DeepSeek HTTP 402: Insufficient Balance', {
      status: 402,
      fatal: true,
      retryable: false
    });
  };

  let caught = null;
  try {
    await runDocument(document, {
      rootDir,
      maxChars: 3500,
      retries: 5,
      retryBaseMs: 1,
      client
    });
  } catch (error) {
    caught = error;
  }

  assert.equal(calls, 1);
  assert.equal(caught instanceof DeepSeekError, true);
  assert.equal(caught.fatal, true);
  console.log(JSON.stringify({ ok: true, calls, fatal: caught.fatal, retried: false }, null, 2));
}

main().catch(error => {
  console.error(error.stack || String(error));
  process.exit(1);
});
