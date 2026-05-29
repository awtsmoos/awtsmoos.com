// B"H
import assert from 'node:assert/strict';
import { readdirSync, statSync, readFileSync } from 'node:fs';

/**
 * Modularity regression.
 *
 * The Awtsmoos does not want one giant scroll swallowing the whole ladder. The
 * early chambers now stand like hand-cut tablets: terrain, actors, and story.
 * If a future edit tries to crush them back into one file, this test refuses
 * the collapse and keeps the ladder readable level by level.
 */
function testEnrichmentModulesExist() {
  const files = readdirSync('js/data/enrichment').filter(file => file.endsWith('.js'));
  for (const name of ['geometry.js', 'builders.js', 'ascent.js', 'vault.js', 'hazards.js', 'triggers.js', 'antiAutopilot.js', 'devilDeceptions.js']) assert.ok(files.includes(name), `missing enrichment module ${name}`);
  const orchestrator = readFileSync('js/data/levelCruelty.js', 'utf8');
  assert.ok(orchestrator.length < 1800, 'levelCruelty should stay a tiny orchestrator');
}

function testEarlySplitLevelsExist() {
  for (const dir of ['level01-malchus', 'level02-yesod', 'level03-hod', 'level04-netzach', 'level05-gevurah']) {
    const files = readdirSync(`js/data/levels/${dir}`).filter(file => file.endsWith('.js'));
    for (const name of ['terrain.js', 'actors.js', 'story.js']) assert.ok(files.includes(name), `missing ${dir}/${name}`);
    for (const file of files) assert.ok(statSync(`js/data/levels/${dir}/${file}`).size < 3200, `${dir}/${file} should stay small`);
  }
}

function testWrappersStayTiny() {
  for (const file of ['level01-malchus.js', 'level02-yesod.js', 'level03-hod.js', 'level04-netzach.js', 'level05-gevurah.js']) {
    const text = readFileSync(`js/data/levels/${file}`, 'utf8');
    assert.ok(text.split('\n').length < 45, `${file} should remain a tiny wrapper`);
  }
}

testEnrichmentModulesExist();
testEarlySplitLevelsExist();
testWrappersStayTiny();
console.log('Sulam HaSod modularity regression ok: early levels split into terrain actors story');
