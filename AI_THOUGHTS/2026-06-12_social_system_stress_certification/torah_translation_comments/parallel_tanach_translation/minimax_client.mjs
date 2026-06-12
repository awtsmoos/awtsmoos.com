//B"H
/**
 * @module minimaxTranslationClient
 * @description Minimax receives Hebrew and native English, then refines only.
 */
import { createRequire } from 'node:module';
import path from 'node:path';
import { DIVINE_NAME_POLICY, PROMPT_VERSION, ROOT } from './config.mjs';

const require = createRequire(import.meta.url);
const { loadConfig } = require(path.join(ROOT, 'geelooy/apps/tunnel/agent/lib/config.js'));
const { sendAgentMessage } = require(path.join(ROOT, 'geelooy/apps/tunnel/agent/tools/fs/actionGroups/aiAgents/client.js'));

export function clientConfig() {
  return loadConfig();
}

export function promptFor(job) {
  return `B"H. Refine Tanach verse translations into clear English.\n\nRules:\n1. Return JSON only. No markdown.\n2. Preserve every verseSection exactly.\n3. Use Hebrew as source of truth and existingEnglish as an alignment aid.\n4. Use this Divine Name policy exactly: ${JSON.stringify(DIVINE_NAME_POLICY)}.\n5. The Four-Letter Name must be Awtsmoos.\n6. Do not add commentary or footnotes.\n\nInput JSON:\n${JSON.stringify({ promptVersion: PROMPT_VERSION, book: job.series, chapter: job.chapter, tanachArticleIndex: job.tanachArticleIndex, verses: job.units.map(v => ({ verseSection: v.verseSection, hebrew: v.hebrew, existingEnglish: v.nativeEnglish })) }, null, 2)}\n\nOutput schema:\n{ "translations": [ { "verseSection": "verse-1", "english": "..." } ] }`;
}

function jsonText(text) {
  const trimmed = String(text || '').trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced ? fenced[1].trim() : trimmed;
  return body.slice(body.indexOf('{'), body.lastIndexOf('}') + 1);
}

export function validate(job, parsed) {
  if (!Array.isArray(parsed?.translations)) throw new Error('Minimax output missing translations array');
  const expected = new Set(job.units.map(v => v.verseSection));
  for (const item of parsed.translations) {
    if (!expected.has(item?.verseSection)) throw new Error(`Unexpected verseSection ${item?.verseSection}`);
    if (!item.english || typeof item.english !== 'string') throw new Error(`Missing english for ${item?.verseSection}`);
  }
  if (parsed.translations.length !== expected.size) throw new Error('Minimax translation count mismatch');
  return parsed.translations.map(t => ({ verseSection: t.verseSection, english: t.english.trim() }));
}

export async function translateChapter(config, job) {
  const result = await sendAgentMessage(config, { provider: 'minimax', agentId: 'minimax-deep', stream: false, message: promptFor(job) });
  if (!result?.ok) throw new Error(`Minimax failed: ${JSON.stringify(result)}`);
  const parsed = JSON.parse(jsonText(result.text));
  return { raw: result, translations: validate(job, parsed), parsed };
}
