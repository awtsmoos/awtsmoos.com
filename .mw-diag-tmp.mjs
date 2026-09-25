import { createCdpProofSession } from '/Users/awtsmoos/work/awtsmoos.com/geelooy/games/mitzvahWorld/proof/CdpProofSession.mjs';
import { readAuthoredMeadowVisualState } from '/Users/awtsmoos/work/awtsmoos.com/geelooy/games/mitzvahWorld/proof/AuthoredMeadowVisualState.mjs';

const BASE = process.argv[2] || 'http://127.0.0.1:8910';
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
  await delay(5000);
  const diag = await ev(`(() => {
    const out = {};
    try {
      const c = document.querySelector('canvas');
      out.canvas = c ? { w: c.width, h: c.height } : null;
      const gl = c ? (c.getContext('webgl2') || c.getContext('webgl')) : null;
      out.webgl = gl ? { ver: gl.getParameter(gl.VERSION), rend: gl.getParameter(gl.RENDERER) } : 'none';
      // sample center pixels via 2d readback of a draw
      const t = document.createElement('canvas'); t.width = 8; t.height = 8;
      const tctx = t.getContext('2d');
      tctx.drawImage(c, 0, 0, 8, 8);
      const d = tctx.getImageData(0, 0, 8, 8).data;
      let sum = 0, n = 0, distinct = new Set();
      for (let i = 0; i < d.length; i += 4) { sum += d[i] + d[i+1] + d[i+2]; distinct.add((d[i] << 16) | (d[i+1] << 8) | d[i+2]); n++; }
      out.pixels = { avg: Math.round(sum / (n * 3)), distinct: distinct.size, sample: [d[0], d[1], d[2], d[60], d[61], d[62]] };
    } catch (e) { out.err = String(e).slice(0, 200); }
    return JSON.stringify(out);
  })()`);
  console.log('DIAG:' + diag);
  console.log('STATE:' + JSON.stringify(state));
} finally {
  await session.close();
}
