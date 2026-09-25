import { createCdpProofSession } from '/Users/awtsmoos/work/awtsmoos.com/geelooy/games/mitzvahWorld/proof/CdpProofSession.mjs';
import { readAuthoredMeadowVisualState } from '/Users/awtsmoos/work/awtsmoos.com/geelooy/games/mitzvahWorld/proof/AuthoredMeadowVisualState.mjs';
import { writeFileSync } from 'node:fs';

const BASE = process.argv[2] || 'http://127.0.0.1:8910';
const OUT = process.argv[3] || '/tmp/mw-raw2.png';
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
  await delay(4000);
  const hidden = await ev(`(() => {
    const marks = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const hits = new Set();
    while (walker.nextNode()) {
      const t = walker.currentNode.nodeValue || '';
      if (/ENTERING WORLD|living flame|Return to menu/.test(t)) hits.add(walker.currentNode.parentElement);
    }
    hits.forEach(el => {
      let p = el, depth = 0;
      while (p && p !== document.body && depth < 4) {
        const sib = [...p.parentElement.children].filter(c => c !== p && c.offsetParent !== null);
        if (sib.length === 0 || depth >= 2) { marks.push(p.tagName + '.' + String(p.className).slice(0, 30)); p.style.display = 'none'; break; }
        p = p.parentElement; depth++;
      }
    });
    return JSON.stringify(marks);
  })()`);
  console.log('HID:' + hidden);
  const canvasInfo = await ev(`(() => {
    const c = [...document.querySelectorAll('canvas')].map(c => ({ w: c.width, h: c.height, vis: c.offsetParent !== null }));
    return JSON.stringify(c);
  })()`);
  console.log('CANVAS:' + canvasInfo);
  await delay(800);
  const shot = await command('Page.captureScreenshot', { format: 'png', fromSurface: true }, { timeoutMs: 120000 });
  writeFileSync(OUT, Buffer.from(shot.data, 'base64'));
  console.log('SAVED:' + OUT);
} finally {
  await session.close();
}
