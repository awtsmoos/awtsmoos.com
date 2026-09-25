import { createCdpProofSession } from '/Users/awtsmoos/work/awtsmoos.com/geelooy/games/mitzvahWorld/proof/CdpProofSession.mjs';

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
  // wait well past the 15s world-entry timeout
  await delay(25000);
  const rep = await ev(`(() => {
    const out = {};
    try {
      const mb = document.getElementById('menuBoot');
      out.menuBoot = mb ? { hidden: mb.hidden, failure: mb.dataset?.loadingFailure || null, state: mb.dataset?.state || null } : 'absent';
      const launches = [...document.querySelectorAll('section.Awtsmoos-launch')];
      out.launchVeils = launches.map(s => ({ state: s.dataset?.state, msg: s.querySelector('[data-launch-message]')?.textContent?.slice(0, 90) || null, progress: s.querySelector('[role=progressbar]')?.getAttribute('aria-valuenow') }));
      out.docState = document.documentElement.dataset?.awtsmoosRuntimeState || document.body.dataset?.awtsmoosRuntimeState || null;
      const d = window.AwtsmoosDiagnostics || {};
      out.rendererPolicyStage = d.rendererPolicyStage || null;
      out.rendererPolicyError = d.rendererPolicyError ? String(d.rendererPolicyError).slice(0, 200) : null;
      out.postPlayableStage = d.postPlayablePriorityStage || null;
      out.bootError = window.AwtsmoosBootError ? String(window.AwtsmoosBootError.message || window.AwtsmoosBootError).slice(0, 200) : null;
      out.bootTracker = window.AwtsmoosBootTracker ? 'alive' : 'null';
    } catch (e) { out.err = String(e).slice(0, 200); }
    return JSON.stringify(out);
  })()`);
  console.log('VEIL:' + rep);
} finally {
  await session.close();
}
