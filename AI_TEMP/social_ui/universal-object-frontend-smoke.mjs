// B"H
import fs from 'node:fs/promises';
const files = {
  css: 'geelooy/shared/civilization/object-layer.css', appCss: 'geelooy/apps/code/css/app.css',
  client: 'geelooy/apps/code/js/civilization/client.js', search: 'geelooy/apps/code/js/civilization/universal-search.js',
  inspector: 'geelooy/apps/code/js/civilization/object-inspector.js', relationships: 'geelooy/apps/code/js/civilization/relationship-sidebar.js',
  timeline: 'geelooy/apps/code/js/civilization/timeline-panel.js', health: 'geelooy/apps/code/js/civilization/object-health.js',
  index: 'geelooy/apps/code/js/civilization/index.js', osClient: 'geelooy/os/civilization/client.js',
  osDesktop: 'geelooy/os/civilization/desktop.js', osWindow: 'geelooy/os/civilization/object-window.js'
};
const checks = [];
function assert(ok, label, detail = {}) { if (!ok) { const e = new Error(label); e.detail = detail; throw e; } checks.push(label); }
async function read(key) { return fs.readFile(files[key], 'utf8'); }
try {
  const css = await read('css');
  assert(css.includes('.civ-object-inspector'), 'cssInspectorClass');
  assert(css.includes('.civ-relationship-sidebar'), 'cssRelationshipClass');
  assert(css.includes('.civ-health-badge'), 'cssHealthClass');
  assert((await read('appCss')).includes('shared/civilization/object-layer.css'), 'codeImportsObjectLayerCss');
  const client = await read('client');
  assert(client.includes('/api/social/objects/search'), 'clientSearchObjects');
  assert(client.includes('/api/social/objects/types'), 'clientObjectTypes');
  assert(client.includes('/inspect'), 'clientInspect');
  const search = await read('search');
  assert(search.includes('CivilizationClient.objects'), 'searchUsesObjectResults');
  assert(search.includes('CivilizationObjectInspector.open'), 'searchOpensInspector');
  const index = await read('index');
  assert(index.includes('CivilizationObjectInspector.open'), 'indexWiresInspector');
  assert(index.includes('civilization-object-launcher'), 'indexAddsObjectLauncher');
  const osClient = await read('osClient');
  assert(osClient.includes('/api/social/objects/search'), 'osClientSearchObjects');
  assert(osClient.includes('/inspect'), 'osClientInspectObject');
  const osDesktop = await read('osDesktop');
  assert(osDesktop.includes('openObjectWindow'), 'osDesktopWiresObjectWindow');
  assert(osDesktop.includes("['Objects'"), 'osObjectsIcon');
  assert((await read('osWindow')).includes('inspectObject'), 'osWindowInspectsObject');
  for (const [key, path] of Object.entries(files)) {
    const text = await fs.readFile(path, 'utf8');
    assert(!text.includes('/api/v2/social'), `${key}NoV2`);
  }
  console.log(JSON.stringify({ pass: true, checks }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ pass: false, message: error.message, detail: error.detail || null }, null, 2));
  process.exit(1);
}
