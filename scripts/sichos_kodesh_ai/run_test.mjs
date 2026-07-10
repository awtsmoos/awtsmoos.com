// B"H
/**
 * One tiny Sichos Kodesh DeepSeek test runner.
 *
 * The Awtsmoos says: do not drink the sea; lift one random honest drop,
 * translate subsection by subsection, and stop at the shore.
 */
import path from 'path';
import { buildPrompt } from './build_prompt.mjs';
import { callDeepSeek } from './deepseek_client.mjs';
import { parseSichosXml, validateParsed } from './parse_xml.mjs';
import { makeRunDir, writeJson, writeText } from './save_output.mjs';
import { loadSample, SOURCE } from './sample_picker.mjs';
import { runValidationFixtures } from './validation_fixtures.mjs';
import { estimateCost } from './cost_estimate.mjs';

const FLAGS = new Set(process.argv.slice(2).filter(arg => arg.startsWith('--') && !arg.includes('=')).map(arg => arg.slice(2)));
const OPTIONS = Object.fromEntries(process.argv.slice(2).filter(arg => arg.startsWith('--') && arg.includes('=')).map(arg => arg.slice(2).split('=')));
const MAX_PARAGRAPHS = Number(OPTIONS.count || 3);
const MAX_SECTIONS = Number(OPTIONS.sections || 3);
const MODEL = OPTIONS.model || 'deepseek-chat';
const DRY_RUN = FLAGS.has('dry-run');
const RANDOM = FLAGS.has('random');

function writeInitialArtifacts(runDir, sample, prompt, fixtures) {
  writeJson(path.join(runDir, 'raw', 'sample.json'), sample);
  writeText(path.join(runDir, 'raw', 'prompt.txt'), prompt);
  writeJson(path.join(runDir, 'validation', 'fixtures.json'), fixtures);
}

function writeDryRun(runDir, sample, prompt, fixtures) {
  const dry = { BH: 'B"H', dryRun: true, random: RANDOM, runDir, source: SOURCE, model: MODEL, sample, prompt, fixtures };
  writeJson(path.join(runDir, 'logs', 'summary.json'), dry);
  console.log(JSON.stringify(dry, null, 2));
}

function writeLiveResult(runDir, sample, result) {
  writeJson(path.join(runDir, 'raw', 'request.json'), result.sanitizedRequest);
  writeJson(path.join(runDir, 'responses', 'raw-response.json'), result.rawResponse);
  writeText(path.join(runDir, 'responses', 'response.xml'), result.xml.trim());
  const parsed = parseSichosXml(result.xml);
  const validation = validateParsed(sample, parsed, { throwOnError: false });
  const finalJson = { BH: 'B"H', runDir, source: SOURCE, model: MODEL, sample, parsed, validation, usage: result.usage, cost: estimateCost(result.usage) };
  writeJson(path.join(runDir, 'output', 'parsed.xml.json'), parsed);
  writeJson(path.join(runDir, 'output', 'final.json'), finalJson);
  writeJson(path.join(runDir, 'validation', 'validation.json'), validation);
  writeJson(path.join(runDir, 'logs', 'summary.json'), { ok: validation.ok, runDir, usage: result.usage, cost: finalJson.cost });
  console.log(JSON.stringify(finalJson, null, 2));
  if (!validation.ok) process.exitCode = 2;
}

async function main() {
  const runDir = makeRunDir();
  const sample = loadSample({ maxSections: MAX_SECTIONS, maxParagraphs: MAX_PARAGRAPHS, random: RANDOM });
  const prompt = buildPrompt(sample);
  const fixtures = runValidationFixtures();
  writeInitialArtifacts(runDir, sample, prompt, fixtures);
  if (DRY_RUN) return writeDryRun(runDir, sample, prompt, fixtures);
  const result = await callDeepSeek({ prompt, model: MODEL });
  writeLiveResult(runDir, sample, result);
}

main().catch(error => {
  console.error(error.stack || String(error));
  process.exit(1);
});
