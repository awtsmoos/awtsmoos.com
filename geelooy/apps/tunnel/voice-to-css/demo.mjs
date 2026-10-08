//B"H
// Voice-to-CSS Tool — demo.mjs
// End-to-end pipeline demo:
//   node demo.mjs "make the title bigger"
// Runs: parseIntent -> generateCss -> propose -> formatForChat,
// then applyDiffToHtml + renderPreviewPage -> /tmp/voice-css-preview.html
// Prints every intermediate so Yaakov can see the pipeline.
// ESM, no external deps.

import { writeFileSync } from 'node:fs';
import { parseIntent } from './parser.mjs';
import { generateCss } from './generator.mjs';
import { propose, formatForChat } from './approver.mjs';
import { applyDiffToHtml, renderPreviewPage } from './preview.mjs';

const SAMPLE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Mini Sefer Page</title>
<style>
  body { font-family: serif; max-width: 42em; margin: 2em auto; line-height: 1.6; }
  .meluket-sefer-title { font-size: 1.8em; }
  .meluket-hebrew { direction: rtl; text-align: right; }
</style>
</head>
<body class="meluket-sefer">
  <h1 class="meluket-sefer-title">Sefer HaMaamarim <span class="meluket-sefer-title-he">ספר המאמרים</span></h1>
  <p class="meluket-hebrew" lang="he">בראשית ברא אלוקים את השמים ואת הארץ</p>
  <p class="meluket-english" lang="en">In the beginning, G-d created the heavens and the earth.</p>
  <button class="meluket-fn-marker">[1]</button>
  <p class="meluket-footnote">Footnote: Rashi explains this verse.</p>
</body>
</html>`;

const OUT_PATH = '/tmp/voice-css-preview.html';

const text = process.argv.slice(2).join(' ') || 'make the title bigger';

console.log(`\n=== voice-to-css demo: "${text}" ===\n`);

// 1. Parse
const intent = parseIntent(text);
console.log('--- 1. parseIntent(text) -> intent ---');
console.log(JSON.stringify(intent, null, 2));

// 2. Generate
const diff = generateCss(intent);
console.log('\n--- 2. generateCss(intent) -> diff ---');
console.log(JSON.stringify(diff, null, 2));

// 3. Propose
const proposal = propose(diff);
console.log('\n--- 3. propose(diff) -> proposal ---');
console.log(`id: ${proposal.id}  status: ${proposal.status}  createdAt: ${proposal.createdAt}`);

// 4. Chat text
const chatText = formatForChat(proposal);
console.log('\n--- 4. formatForChat(proposal) -> chat text ---');
console.log(chatText);

// 5. Preview
const afterHtml = applyDiffToHtml(SAMPLE_HTML, diff);
const page = renderPreviewPage(SAMPLE_HTML, afterHtml, diff);
writeFileSync(OUT_PATH, page);
console.log(`\n--- 5. applyDiffToHtml + renderPreviewPage -> ${OUT_PATH} ---`);
console.log(`preview page written (${page.length} bytes); style block injected: ${afterHtml.includes('data-voice-css-preview')}`);
