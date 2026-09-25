import { createCdpProofSession } from '/Users/awtsmoos/work/awtsmoos.com/geelooy/games/mitzvahWorld/proof/CdpProofSession.mjs';
import { readAuthoredMeadowVisualState } from '/Users/awtsmoos/work/awtsmoos.com/geelooy/games/mitzvahWorld/proof/AuthoredMeadowVisualState.mjs';

const BASE = process.argv[2] || 'http://127.0.0.1:8910';
const delay = ms => new Promise(r => setTimeout(r, ms));
const session = await createCdpProofSession(9666);
const command = session.command;
const ev = (expression) => command('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }).then(r => r.result.value);
try {
  await command('Page.enable', {});
  await command('Runtime.enable', {});
  await command('Page.navigate', { url: BASE + '/games/mitzvahWorld/index.html' }, { timeoutMs: 60000 });
  for (let i = 0; i < 600 && !await ev('Boolean(document.querySelector("[data-world-id=blank-meadow]:not([disabled])"))'); i++) await delay(50);
  await ev('document.querySelector("[data-world-id=blank-meadow]").click()');
  for (let i = 0; i < 300; i++) {
    const s = await readAuthoredMeadowVisualState(command);
    if (s.loadingFailure || (s.playerAttached && s.skinnedMeshes > 0)) break;
    await delay(200);
  }
  const info = await ev(`new Promise(resolve => {
    let frames = 0;
    const t0 = performance.now();
    function tick() { frames++; if (performance.now() - t0 < 2000) requestAnimationFrame(tick); else resolve({ rafFrames: frames }); }
    requestAnimationFrame(tick);
  })`);
  console.log('RAF:' + info);
  const stats = await ev(`(() => {
    const keys = Object.keys(window).filter(k => /runtime|game|world|eret[z]?/i.test(k)).slice(0, 10);
    return JSON.stringify({ keys });
  })()`);
  console.log('WIN:' + stats);
} finally {
  await session.close();
}
