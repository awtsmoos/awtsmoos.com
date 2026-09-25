import { createCdpProofSession } from '/Users/awtsmoos/work/awtsmoos.com/geelooy/games/mitzvahWorld/proof/CdpProofSession.mjs';
import { readAuthoredMeadowVisualState } from '/Users/awtsmoos/work/awtsmoos.com/geelooy/games/mitzvahWorld/proof/AuthoredMeadowVisualState.mjs';

const BASE = process.argv[2] || 'http://127.0.0.1:8910';
const delay = ms => new Promise(r => setTimeout(r, ms));
const session = await createCdpProofSession(9666);
const command = session.command;
const ev = (expression, timeoutMs = 30000) => command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, { timeoutMs }).then(r => r.result.value);
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
  await delay(3000);
  const hasDiag = await ev('Boolean((window.AwtsmoosDiagnostics||{}).runtime)');
  console.log('hasDiag=' + hasDiag);
  await ev(`window.__probe = { marks: [] };
    window.__mark = (m) => window.__probe.marks.push(m);
    window.__race = (p, ms, name) => { window.__mark(name + ':start'); return Promise.race([
      Promise.resolve(p).then(v => { window.__mark(name + ':resolved'); return name + ':resolved'; },
                              e => { window.__mark(name + ':rejected:' + String(e && e.message || e).slice(0,120)); return name + ':rejected'; }),
      new Promise(r => setTimeout(() => { window.__mark(name + ':HANG'); r(name + ':HANG'); }, ms)) ]); };
    window.__base = location.origin + '/games/mitzvahWorld/experiments/Awtsmoos/src/launcher/MitzvahWorldModeLoaders.js';
    window.__rel = (p) => new URL(p, window.__base).href;`);
  const tests = [
    ['particles', `import(window.__rel('../fx/MitzvahParticleLayer.js')).then(m => window.__race(m.attachMitzvahParticles({ runtime: window.AwtsmoosDiagnostics.runtime }), 7000, 'attachParticles'))`],
    ['npc', `import(window.__rel('../npc/MitzvahNpcDialogue.js')).then(m => window.__race(m.attachNpcDialogue({ runtime: window.AwtsmoosDiagnostics.runtime, environment: globalThis }), 7000, 'attachNpc'))`],
    ['studio', `import(window.__rel('../studio/MitzvahStudioHandoff.js')).then(m => window.__race(m.maybeApplyStudioHandoff({ runtime: window.AwtsmoosDiagnostics.runtime, environment: globalThis }), 7000, 'studioHandoff'))`],
  ];
  for (const [name, expr] of tests) {
    try {
      const r = await ev(`(async () => { try { return await (${expr}); } catch (e) { window.__mark('${name}:threw:' + String(e && e.message || e).slice(0,120)); return '${name}:threw'; } })()`, 25000);
      console.log(name + ' => ' + r);
    } catch (e) { console.log(name + ' => EVAL_TIMEOUT'); }
    const marks = await ev('JSON.stringify(window.__probe.marks)').catch(() => 'unreadable');
    console.log('marks=' + marks);
  }
} finally {
  await session.close();
}
