#!/usr/bin/env node
// B"H
import fs from 'node:fs';
import { LLAMA, MANIFEST, MAX_TOKENS, MODEL } from './sichos_kodesh/config.mjs';
const state = { modelExists: fs.existsSync(MODEL), llamaExists: fs.existsSync(LLAMA), manifestExists: fs.existsSync(MANIFEST), records: 0, failures: [] };
if (state.manifestExists) {
	for (const line of fs.readFileSync(MANIFEST, 'utf8').split(/\n/).filter(Boolean)) {
		const row = JSON.parse(line); state.records += 1;
		if (!row.text || /[\u0590-\u05ff]/u.test(row.text)) state.failures.push({ id: row.id, reason: 'non_english_text' });
		if (row.embeddingTokensEstimated > MAX_TOKENS) state.failures.push({ id: row.id, reason: 'token_ceiling', tokens: row.embeddingTokensEstimated });
		for (const key of ['seriesId', 'postId', 'verseStart', 'verseEnd', 'firstSubSection', 'lastSubSection']) if (row[key] == null) state.failures.push({ id: row.id, reason: `missing_${key}` });
	}
}
state.readyForEmbedding = state.modelExists && state.llamaExists && state.manifestExists && !state.failures.length;
console.log(JSON.stringify(state, null, 2)); if (state.failures.length) process.exitCode = 1;
