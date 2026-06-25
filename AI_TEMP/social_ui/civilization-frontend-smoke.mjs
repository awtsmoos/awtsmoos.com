// B"H
import fs from 'node:fs/promises';

const files = {
  appCss: 'geelooy/apps/code/css/app.css', appIndex: 'geelooy/apps/code/js/app/index.js',
  codeClient: 'geelooy/apps/code/js/civilization/client.js', codeIndex: 'geelooy/apps/code/js/civilization/index.js',
  codeHud: 'geelooy/apps/code/js/civilization/hud.js', codeRain: 'geelooy/apps/code/js/civilization/event-rain.js',
  codeCockpit: 'geelooy/apps/code/js/civilization/cockpit.js', osIndex: 'geelooy/os/index.html',
  osScript: 'geelooy/os/script.js', osClient: 'geelooy/os/civilization/client.js',
  osDesktop: 'geelooy/os/civilization/desktop.js', osStart: 'geelooy/os/civilization/start-menu-feed.js',
  osCss: 'geelooy/os/civilization/styles.css'
};
const checks = [];
function assert(condition, label, detail = {}) {
  if (!condition) { const error = new Error(label); error.detail = detail; throw error; }
  checks.push(label);
}
async function read(name) { return fs.readFile(files[name], 'utf8'); }

try {
  const appCss = await read('appCss');
  assert(appCss.includes('./civilization/tokens.css'), 'codeCssImportsTokens');
  assert(appCss.includes('./civilization/cockpit.css'), 'codeCssImportsCockpit');

  const appIndex = await read('appIndex');
  assert(appIndex.includes('../civilization/index.js'), 'appImportsCivilization');
  assert(appIndex.includes('CivilizationFrontend.init()'), 'appInitializesCivilization');

  for (const key of ['codeClient','codeIndex','codeHud','codeRain','codeCockpit','osClient','osDesktop','osStart']) {
    const text = await read(key);
    assert(!text.includes('/api/v2/social'), `${key}NoV2`);
  }
  const codeClient = await read('codeClient');
  assert(codeClient.includes('/api/social/civilization/state'), 'codeClientUsesCivilizationState');
  assert(codeClient.includes('/api/social/profiles/'), 'codeClientUsesLivingCard');

  const codeIndex = await read('codeIndex');
  assert(codeIndex.includes('custom-menu-container'), 'codeLauncherUsesExistingMenu');
  assert(codeIndex.includes('visual-layer') || codeIndex.includes('CivilizationEventRain'), 'codeRainWired');

  const osIndex = await read('osIndex');
  assert(osIndex.includes('civilization/styles.css'), 'osLinksCivilizationCss');

  const osScript = await read('osScript');
  assert(osScript.includes('./civilization/desktop.js'), 'osImportsDesktop');
  assert(osScript.includes('renderCivilizationStartFeed'), 'osStartMenuFeedWired');
  assert(osScript.includes('initCivilizationDesktop({ os })'), 'osDesktopInitWired');

  const osClient = await read('osClient');
  assert(osClient.includes('/api/social/civilization'), 'osClientUsesCivilizationApi');

  const osCss = await read('osCss');
  assert(osCss.includes('.civ-os-icon'), 'osCssIconClass');
  assert(osCss.includes('.civ-start-feed'), 'osCssStartFeedClass');

  console.log(JSON.stringify({ pass: true, checks }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ pass: false, message: error.message, detail: error.detail || null }, null, 2));
  process.exit(1);
}
