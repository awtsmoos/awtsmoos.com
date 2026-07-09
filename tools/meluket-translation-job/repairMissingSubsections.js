// B"H
/**
 * Repairs failed Meluket swarm chunks when DeepSeek omitted a small number of
 * subsection translations but the rest of the chunk validated structurally.
 *
 * It reads source.json + last parsed XML validation, asks DeepSeek only for the
 * missing v/s coordinates, inserts the missing <t> nodes, revalidates, and only
 * then writes DONE.json. It writes no database content.
 */
const fs = require('fs');
const path = require('path');
const apiKey = process.env.DEEPSEEK_API_KEY;
const outDir = path.join(process.env.AWTSMOOS_JOB_ROOT || '/Users/awtsmoos/Documents/awtsmoos-jobs/meluket-translation-job', 'generated', 'meluket-swarm');
const chunkRoot = path.join(outDir, 'chunks');
const model = process.argv.find(a => a.startsWith('--model='))?.split('=')[1] || 'deepseek-chat';

function escapeXml(text = '') { return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function unescapeXml(text) { return String(text).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'); }
function atomicWrite(file, content) { fs.mkdirSync(path.dirname(file), { recursive: true }); const tmp = `${file}.${process.pid}.${Date.now()}.tmp`; fs.writeFileSync(tmp, content); fs.renameSync(tmp, file); }
function attr(text, name) { const m = text.match(new RegExp(`${name}="([^"]*)"`)); return m ? m[1] : ''; }
function textTag(xml, name) { return unescapeXml((xml.match(new RegExp(`<${name}>([\\s\\S]*?)<\\/${name}>`)) || [])[1] || '').trim(); }
function parseFragment(rawXml) {
  const xml = rawXml.replace(/^\s*```(?:xml)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
  const rootOpen = xml.match(/<awtsmoosMeluketTranslation\b[^>]*>/)?.[0] || '';
  const sections = [];
  for (const sectionBlock of [...xml.matchAll(/<section\b[^>]*>[\s\S]*?<\/section>/g)].map(m => m[0])) {
    const sectionOpen = sectionBlock.match(/<section\b[^>]*>/)?.[0] || '';
    const v = Number(attr(sectionOpen, 'v'));
    const sectionSummaryBrief = textTag(sectionBlock, 'sectionSummaryBrief');
    const translations = [...sectionBlock.matchAll(/<t\b[^>]*>[\s\S]*?<\/t>/g)].map(m => m[0]).map(tBlock => {
      const open = tBlock.match(/<t\b[^>]*>/)?.[0] || '';
      return { v, s: Number(attr(open, 's')), translation: unescapeXml((tBlock.match(/<t\b[^>]*>([\s\S]*?)<\/t>/) || [])[1] || '').trim() };
    });
    sections.push({ v, sectionSummaryBrief, translations });
  }
  return { xml, root: { heichel: attr(rootOpen, 'heichel'), alias: attr(rootOpen, 'alias'), seriesId: attr(rootOpen, 'seriesId'), postId: attr(rootOpen, 'postId'), batchId: attr(rootOpen, 'batchId') }, sections };
}
function expectedKeys(batch) { const out = new Set(); for (const section of batch.sections) for (const item of section.items) out.add(`${section.v}:${item.s}`); return out; }
function validateFragment(batch, parsed) {
  const expected = expectedKeys(batch);
  const actual = new Set(parsed.sections.flatMap(sec => sec.translations.map(t => `${t.v}:${t.s}`)));
  const missing = [...expected].filter(k => !actual.has(k));
  const extra = [...actual].filter(k => !expected.has(k));
  const empty = parsed.sections.flatMap(sec => sec.translations).filter(t => !t.translation).map(t => `${t.v}:${t.s}`);
  const expectedSummaryVs = new Set(batch.sections.map(s => String(s.v)));
  const summaryVs = new Set(parsed.sections.filter(s => s.sectionSummaryBrief).map(s => String(s.v)));
  const missingSummaries = [...expectedSummaryVs].filter(v => !summaryVs.has(v));
  const rootOk = parsed.root.seriesId === batch.seriesId && parsed.root.postId === batch.postId && parsed.root.batchId === batch.batchId && parsed.root.alias === 'meluket_translation_en';
  return { ok: rootOk && !missing.length && !extra.length && !empty.length && !missingSummaries.length, rootOk, expected: expected.size, returned: actual.size, missing, extra, empty, missingSummaries };
}
function sourceFor(batch, key) {
  const [vText, sText] = key.split(':');
  const v = Number(vText), s = Number(sText);
  const section = batch.sections.find(x => x.v === v);
  const item = section?.items.find(x => x.s === s);
  if (!item) throw new Error(`missing source for ${key}`);
  return { v, s, text: item.text, context: section.items.map(i => ({ s: i.s, text: i.text })) };
}
function buildRepairPrompt(batch, missingItems) {
  return `B"H
Return ONLY raw XML. No markdown fences.
Translate only the listed missing Meluket subsection(s). Preserve exact v and s. Do not add, omit, split, or merge.
Use Yaakov not Jacob. Use Awtsmoos for Atzmus/עצמות. Preserve Chassidic terms faithfully.

<awtsmoosMeluketRepair heichel="ikar" alias="meluket_translation_en" seriesId="${escapeXml(batch.seriesId)}" postId="${escapeXml(batch.postId)}" batchId="${escapeXml(batch.batchId)}">
${missingItems.map(item => `  <missing v="${item.v}" s="${item.s}">${escapeXml(item.text)}</missing>`).join('\n')}
</awtsmoosMeluketRepair>

Respond as:
<awtsmoosMeluketRepair heichel="ikar" alias="meluket_translation_en" seriesId="${escapeXml(batch.seriesId)}" postId="${escapeXml(batch.postId)}" batchId="${escapeXml(batch.batchId)}">
  <t v="${missingItems[0]?.v ?? 0}" s="${missingItems[0]?.s ?? 0}">English translation</t>
</awtsmoosMeluketRepair>`;
}
function parseRepair(xml) {
  return [...xml.replace(/^\s*```(?:xml)?\s*/i, '').replace(/\s*```\s*$/i, '').matchAll(/<t\b[^>]*>[\s\S]*?<\/t>/g)].map(m => m[0]).map(block => {
    const open = block.match(/<t\b[^>]*>/)?.[0] || '';
    return { v: Number(attr(open, 'v')), s: Number(attr(open, 's')), translation: unescapeXml((block.match(/<t\b[^>]*>([\s\S]*?)<\/t>/) || [])[1] || '').trim() };
  });
}
function mergeXml(batch, parsed, repairs) {
  const byKey = new Map();
  for (const sec of parsed.sections) for (const t of sec.translations) byKey.set(`${t.v}:${t.s}`, t.translation);
  for (const r of repairs) byKey.set(`${r.v}:${r.s}`, r.translation);
  const summary = new Map(parsed.sections.map(sec => [sec.v, sec.sectionSummaryBrief]));
  return `<awtsmoosMeluketTranslation heichel="ikar" alias="meluket_translation_en" seriesId="${escapeXml(batch.seriesId)}" postId="${escapeXml(batch.postId)}" batchId="${escapeXml(batch.batchId)}">\n${batch.sections.map(section => `  <section v="${section.v}">\n    <sectionSummaryBrief>${escapeXml(summary.get(section.v) || '')}</sectionSummaryBrief>\n${section.items.map(item => `    <t s="${item.s}">${escapeXml(byKey.get(`${section.v}:${item.s}`) || '')}</t>`).join('\n')}\n  </section>`).join('\n')}\n</awtsmoosMeluketTranslation>`;
}
async function callDeepSeek(prompt) {
  const res = await fetch('https://api.deepseek.com/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` }, body: JSON.stringify({ model, temperature: 0.1, messages: [{ role: 'user', content: prompt }] }) });
  const text = await res.text(); let json; try { json = JSON.parse(text); } catch {}
  if (!res.ok) throw new Error(`DeepSeek HTTP ${res.status}: ${text.slice(0, 1200)}`);
  return { status: res.status, rawJson: json, content: json?.choices?.[0]?.message?.content || '' };
}
function latestValidation(dir) {
  const files = fs.readdirSync(dir).filter(x => x.startsWith('validation-attempt-') && x.endsWith('.json')).sort();
  if (!files.length) return null;
  return path.join(dir, files[files.length - 1]);
}
async function repairDir(dir) {
  const batch = JSON.parse(fs.readFileSync(path.join(dir, 'source.json'), 'utf8'));
  const valPath = latestValidation(dir);
  if (!valPath) throw new Error(`no validation in ${dir}`);
  const validationFile = JSON.parse(fs.readFileSync(valPath, 'utf8'));
  const parsed = validationFile.parsed;
  const validation = validationFile.validation;
  if (!validation?.missing?.length || validation.missing.length > 5) return { skipped: true, reason: 'not small missing set', dir };
  const missingItems = validation.missing.map(key => sourceFor(batch, key));
  const prompt = buildRepairPrompt(batch, missingItems);
  atomicWrite(path.join(dir, 'repair-prompt.xml.txt'), prompt);
  const response = await callDeepSeek(prompt);
  atomicWrite(path.join(dir, 'repair-response.raw.json'), JSON.stringify(response.rawJson, null, 2));
  atomicWrite(path.join(dir, 'repair-response.xml'), response.content.trim());
  const repairs = parseRepair(response.content);
  const repairedKeys = new Set(repairs.map(r => `${r.v}:${r.s}`));
  const stillMissingRepair = validation.missing.filter(k => !repairedKeys.has(k));
  if (stillMissingRepair.length) throw new Error(`repair did not return ${stillMissingRepair.join(',')}`);
  const merged = mergeXml(batch, parsed, repairs);
  atomicWrite(path.join(dir, 'response-repaired.xml'), merged);
  const reparsed = parseFragment(merged);
  const repairedValidation = validateFragment(batch, reparsed);
  atomicWrite(path.join(dir, 'validation-repaired.json'), JSON.stringify({ validation: repairedValidation, parsed: reparsed }, null, 2));
  if (!repairedValidation.ok) throw new Error(`repaired validation failed ${JSON.stringify(repairedValidation)}`);
  atomicWrite(path.join(dir, 'DONE.json'), JSON.stringify({ B_H: true, completedAt: new Date().toISOString(), repair: true, validation: repairedValidation }, null, 2));
  fs.rmSync(path.join(dir, 'FAILED.json'), { force: true });
  return { ok: true, dir, repaired: validation.missing };
}
async function main() {
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY is not set');
  const failed = [...fs.readdirSync(chunkRoot)].map(name => path.join(chunkRoot, name)).filter(dir => fs.existsSync(path.join(dir, 'FAILED.json')));
  const results = [];
  for (const dir of failed) results.push(await repairDir(dir).catch(err => ({ ok: false, dir, error: err.stack || String(err) })));
  console.log(JSON.stringify({ B_H: true, failedCount: failed.length, results }, null, 2));
  if (results.some(r => !r.ok && !r.skipped)) process.exitCode = 4;
}
main().catch(err => { console.error(err.stack || err.message); process.exit(1); });
