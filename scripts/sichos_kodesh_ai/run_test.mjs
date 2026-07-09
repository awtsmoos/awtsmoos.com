// B"H
/**
 * One tiny Sichos Kodesh DeepSeek test runner.
 * The Awtsmoos says: touch not the production sea; lift only a few droplets.
 */
import fs from 'fs';
import path from 'path';
import { buildPrompt } from './build_prompt.mjs';
import { callDeepSeek } from './deepseek_client.mjs';
import { parseSichosXml, validateParsed } from './parse_xml.mjs';
import { makeRunDir, writeJson, writeText } from './save_output.mjs';

const SOURCE = '/Users/awtsmoos/Documents/Awtsmoos/docs/torah/sichos-kodesh-parsed/Sichos Kodesh.parsed.json';
const MAX_PARAGRAPHS = Number(process.argv.find(a => a.startsWith('--count='))?.split('=')[1] || 3);
const MAX_SECTIONS = Number(process.argv.find(a => a.startsWith('--sections='))?.split('=')[1] || 1);
const MODEL = process.argv.find(a => a.startsWith('--model='))?.split('=')[1] || 'deepseek-chat';

function cleanText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function sectionChars(section) {
  return [...section.paragraphs.map(p => p.text).join(' ')].length;
}

function loadSample() {
  const data = JSON.parse(fs.readFileSync(SOURCE, 'utf8'));
  const docs = Object.entries(data.collections?.Farbrengens?.documents || {});
  for (const [documentId, doc] of docs) {
    const fields = doc.fields || {};
    const parsed = fields.parsedMainText || [];
    const sections = [];
    for (let sectionIndex = 0; sectionIndex < parsed.length; sectionIndex++) {
      const section = parsed[sectionIndex];
      if (section.kind === 'separator' || !(section.subsections || []).length) continue;
      const paragraphs = section.subsections.slice(0, MAX_PARAGRAPHS).map((item, offset) => ({
        paragraphIndex: offset,
        sourceSubsectionIndex: item.index,
        text: cleanText(item.text)
      })).filter(item => item.text);
      if (paragraphs.length) sections.push({ sectionIndex, sourceIndex: section.index, paragraphs });
      if (sections.length >= MAX_SECTIONS) break;
    }
    if (sections.length >= MAX_SECTIONS) {
      return {
        documentId,
        sourcePath: doc.path || '',
        title: cleanText(fields.title),
        sectionIndex: sections[0].sectionIndex,
        paragraphs: sections[0].paragraphs,
        sections: sections.map(section => ({ ...section, chars: sectionChars(section) }))
      };
    }
  }
  throw new Error('No tiny sample with enough sections found');
}

async function main() {
  const runDir = makeRunDir();
  const sample = loadSample();
  const prompt = buildPrompt(sample);
  writeJson(path.join(runDir, 'raw', 'sample.json'), sample);
  writeText(path.join(runDir, 'raw', 'prompt.txt'), prompt);
  const result = await callDeepSeek({ prompt, model: MODEL });
  writeJson(path.join(runDir, 'raw', 'request.json'), result.sanitizedRequest);
  writeJson(path.join(runDir, 'responses', 'raw-response.json'), result.rawResponse);
  writeText(path.join(runDir, 'responses', 'response.xml'), result.xml.trim());
  const parsed = parseSichosXml(result.xml);
  const validation = validateParsed(sample, parsed);
  const finalJson = { BH: 'B"H', runDir, source: SOURCE, model: MODEL, sample, parsed, validation, usage: result.usage };
  writeJson(path.join(runDir, 'output', 'parsed.xml.json'), parsed);
  writeJson(path.join(runDir, 'output', 'final.json'), finalJson);
  writeJson(path.join(runDir, 'logs', 'summary.json'), { ok: validation.ok, runDir, usage: result.usage });
  console.log(JSON.stringify(finalJson, null, 2));
  if (!validation.ok) process.exitCode = 2;
}

main().catch(error => {
  console.error(error.stack || String(error));
  process.exit(1);
});
