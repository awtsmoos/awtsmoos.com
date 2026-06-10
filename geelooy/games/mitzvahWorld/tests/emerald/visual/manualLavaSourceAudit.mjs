#!/usr/bin/env node
/**
 * B"H
 * @file manualLavaSourceAudit.mjs
 * @description Chapter 605: Lava levels must be backed by 20 manual source
 * modules, not a one-loop formula generator.
 */
import fs from 'node:fs';
const dir = 'levels/ladder/source/lava/levels';
const files = fs.readdirSync(dir).filter(file => /^level\d\d\.js$/.test(file)).sort();
const registry = fs.readFileSync('levels/ladder/source/lava/index.js', 'utf8');
const builder = fs.readFileSync('levels/ladder/buildManualLavaLevels.mjs', 'utf8');
const oldWrapper = fs.readFileSync('levels/ladder/rewriteAllLavaLevels.mjs', 'utf8');
const fileDetails = files.map(file => {
  const text = fs.readFileSync(`${dir}/${file}`, 'utf8');
  return { file, hasDefaultLevel: text.includes('export default level({'), manualDescription: /description: '.*(hand|manual|handmade|hand-laid|hand-authored)/i.test(text), constCount: (text.match(/^const /gm) || []).length };
});
const details = {
  fileCount: files.length,
  allExpectedNames: Array.from({ length: 20 }, (_, i) => `level${String(i + 1).padStart(2, '0')}.js`).every(file => files.includes(file)),
  registryImportsAll: Array.from({ length: 20 }, (_, i) => registry.includes(`./levels/level${String(i + 1).padStart(2, '0')}.js`)).every(Boolean),
  builderAssertsManual: builder.includes('Expected 20 manual lava source files') && builder.includes('does not invent courses'),
  oldGeneratorRemoved: oldWrapper.includes('Compatibility wrapper') && !oldWrapper.includes('for (let level = 1; level <= 20'),
  eachFileLooksManual: fileDetails.every(d => d.hasDefaultLevel && d.manualDescription && d.constCount >= 5)
};
if (!Object.values(details).every(Boolean)) { console.error(JSON.stringify({ ok: false, details, fileDetails }, null, 2)); process.exit(1); }
console.log(JSON.stringify({ ok: true, details }, null, 2));
