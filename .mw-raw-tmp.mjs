import { createCdpProofSession } from '/Users/awtsmoos/work/awtsmoos.com/geelooy/games/mitzvahWorld/proof/CdpProofSession.mjs';
import { readAuthoredMeadowVisualState } from '/Users/awtsmoos/work/awtsmoos.com/geelooy/games/mitzvahWorld/proof/AuthoredMeadowVisualState.mjs';
import { writeFileSync } from 'node:fs';

const BASE = process.argv[2] || 'http://127.0.0.1:8910';
const OUT = process.argv[3] || '/tmp/mw-raw.png';
const delay = ms => new Promise(r => setTimeout(r, ms));
const session = await createCdpProofSession(9666);
const command = session.command;
const ev = (expression) => command('Runtime.evaluate', { expression, returnByValue: true }).then(r => r.result.value);
try {
  await command('Page.enable', {});
  await command('Runtime.enable', {});
  await command('Page.navigate', { url: BASE + '/games/mitzvahWorld/index.html' }, { timeoutMs: 60000 });
  for (let i = 0; i < 600 && !await ev('Boolean(document.querySelector("[data-world-id=blank-meadow]:not([disabled])"))'); i++) await delay(50);
  await ev('document.querySelector("[data-world-id=blank-meadow]").click()');
  let state = null;
  for (let i = 0; i < 300; i++) {
    state = await readAuthoredMeadowVisualState(command);
    if (state.loadingFailure || (state.playerAttached && state.skinnedMeshes > 0)) break;
    await delay(200);
  }
  console.log('STATE:' + JSON.stringify({pa: state.playerAttached, sm: state.skinnedMeshes, rm: state.realMeshes, cs: state.canonicalStatus, lh: state.loaderHidden}));
  // let a few frames render, then strip veil/overlay elements and screenshot
  await delay(3000);
  const veilInfo = await ev(`(() => {
    const els = [...document.querySelectorAll('body *')].filter(e => {
      const s = getComputedStyle(e);
      return (s.position === 'fixed' || s.position === 'absolute') && parseInt(s.zIndex || '0') > 5 && e.offsetParent !== null;
    });
    const info = els.map(e => e.tagName + '.' + (e.className.baseVal !== undefined ? '' : e.className) + '#' + e.id).slice(0, 12);
    els.forEach(e => { e.style.display = 'none'; });
    return JSON.stringify(info);
  })()`);
  console.log('VEILS:' + veilInfo);
  await delay(800);
  const shot = await command('Page.captureScreenshot', { format: 'png', fromSurface: true }, { timeoutMs: 120000 });
  writeFileSync(OUT, Buffer.from(shot.data, 'base64'));
  console.log('SAVED:' + OUT);
} finally {
  await session.close();
}
