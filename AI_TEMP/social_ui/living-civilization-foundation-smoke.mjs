// B"H
import fs from 'node:fs/promises';

const files = {
  sharedTokens: 'geelooy/shared/civilization/tokens.css',
  sharedPrimitives: 'geelooy/shared/civilization/primitives.css',
  codeCss: 'geelooy/apps/code/css/app.css',
  osCss: 'geelooy/os/civilization/styles.css',
  aiCss: 'geelooy/ai/styles.css',
  appsCss: 'geelooy/apps/style.css',
  emailCss: 'geelooy/email/styles.css',
  postCss: 'geelooy/heichelos/post/styles/main.css',
  searchJs: 'geelooy/apps/code/js/civilization/universal-search.js',
  cardJs: 'geelooy/apps/code/js/civilization/living-card.js',
  modesJs: 'geelooy/apps/code/js/civilization/pulse-modes.js',
  indexJs: 'geelooy/apps/code/js/civilization/index.js'
};
const checks = [];
function assert(condition, label, detail = {}) {
  if (!condition) { const error = new Error(label); error.detail = detail; throw error; }
  checks.push(label);
}
async function read(key) { return fs.readFile(files[key], 'utf8'); }
try {
  const tokens = await read('sharedTokens');
  const primitives = await read('sharedPrimitives');
  assert(tokens.includes('--civ-knowledge'), 'sharedSemanticKnowledgeToken');
  assert(tokens.includes('--civ-governance'), 'sharedSemanticGovernanceToken');
  assert(primitives.includes('.civ-living-card'), 'sharedLivingCardClass');
  assert(primitives.includes('.civ-search-shell'), 'sharedUniversalSearchClass');
  assert(primitives.includes('.civ-memory-trail'), 'sharedMemoryTrailClass');
  assert(primitives.includes('.civ-reputation-grid'), 'sharedReputationGridClass');
  assert(primitives.includes('.civ-zoom-map'), 'sharedZoomMapClass');
  for (const key of ['codeCss','osCss','aiCss','appsCss','emailCss','postCss']) {
    const text = await read(key);
    assert(text.includes('shared/civilization/tokens.css'), `${key}ImportsSharedTokens`);
    assert(text.includes('shared/civilization/primitives.css'), `${key}ImportsSharedPrimitives`);
  }
  const search = await read('searchJs');
  const card = await read('cardJs');
  const modes = await read('modesJs');
  const index = await read('indexJs');
  assert(search.includes('/api/social/civilization') || search.includes('CivilizationClient.events'), 'searchUsesCivilizationEvents');
  assert(card.includes('/api/social/profiles') || card.includes('livingCard'), 'livingCardUsesProfileRoute');
  assert(modes.includes('civilizationMode'), 'pulseModesSetBodyMode');
  assert(index.includes('UniversalCivilizationSearch.open'), 'indexWiresUniversalSearch');
  assert(index.includes('CivilizationLivingCard.open'), 'indexWiresLivingCard');
  assert(index.includes('CivilizationPulseModes.next'), 'indexWiresPulseModes');
  for (const [key, path] of Object.entries(files)) {
    const text = await fs.readFile(path, 'utf8');
    assert(!text.includes('/api/v2/social'), `${key}NoV2`);
  }
  console.log(JSON.stringify({ pass: true, checks }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ pass: false, message: error.message, detail: error.detail || null }, null, 2));
  process.exit(1);
}
