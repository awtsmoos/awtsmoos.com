import { createCdpProofSession } from '/Users/awtsmoos/work/awtsmoos.com/geelooy/games/mitzvahWorld/proof/CdpProofSession.mjs';

const BASE = process.argv[2] || 'http://127.0.0.1:8910';
const delay = ms => new Promise(r => setTimeout(r, ms));
const session = await createCdpProofSession(9666);
const command = session.command;
const ev = (expression) => command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }).then(r => r.result.value);
try {
  await command('Page.enable', {});
  await command('Runtime.enable', {});
  await command('Page.navigate', { url: BASE + '/games/mitzvahWorld/index.html' }, { timeoutMs: 60000 });
  await delay(4000);
  const rep = await ev(`(async () => {
    const out = {};
    try {
      const base = location.origin + '/games/mitzvahWorld/experiments/Awtsmoos/src/';
      const race = (p, ms, name) => Promise.race([
        p.then(v => name + ':resolved', e => name + ':rejected:' + String(e && e.message || e).slice(0, 120)),
        new Promise(r => setTimeout(() => r(name + ':HANG'), ms))
      ]);
      // releaseUrl equivalent: resolve against the launcher module like the game does
      const probeBase = base + 'launcher/MitzvahWorldModeLoaders.js';
      const rel = (p) => new URL(p, probeBase).href;
      out.particle = await race(import(rel('../fx/MitzvahParticleLayer.js')), 8000, 'particle');
      out.npc = await race(import(rel('../npc/MitzvahNpcDialogue.js')), 8000, 'npc');
      out.studio = await race(import(rel('../studio/MitzvahStudioHandoff.js')), 8000, 'studio');
      out.postplay = await race(import(new URL('../app/EretzPostPlayablePriority.js?v=20260908-current-hot-path-03', probeBase).href), 8000, 'postplay');
    } catch (e) { out.err = String(e).slice(0, 300); }
    return JSON.stringify(out);
  })()`);
  console.log('IMPORT:' + rep);
} finally {
  await session.close();
}
