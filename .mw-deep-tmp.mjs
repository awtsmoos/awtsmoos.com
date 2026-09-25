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
  for (let i = 0; i < 300; i++) {
    const s = await readAuthoredMeadowVisualState(command);
    if (s.loadingFailure || (s.playerAttached && s.skinnedMeshes > 0)) break;
    await delay(200);
  }
  await delay(6000);
  const deep = await ev(`(() => {
    const out = {};
    try {
      const pub = window.AwtsmoosMitzvahWorld || {};
      const rt = pub.runtime || pub;
      const r = rt.renderer || {};
      out.hydration = r.hydrationState || null;
      out.delegate = Boolean(r.delegate);
      out.jointMode = r.jointMode || null;
      out.stats = r.stats ? JSON.parse(JSON.stringify(r.stats)) : null;
      out.errors = (r.errors || []).slice(0, 5).map(String);
      out.lastFrameError = rt.lastFrameError ? String(rt.lastFrameError).slice(0, 300) : null;
      out.frameToken = r.frameToken ?? null;
      out.skinTex = Boolean(r.skinTexture);
      out.skinBinding = r._skinTextureBinding ? { rev: r._skinTextureBinding.revision, skel: r._skinTextureBinding.skeleton ? r._skinTextureBinding.skeleton.name : null } : null;
      // scene graph sanity: player mesh world positions
      const meshes = [];
      rt.model?.traverse?.(o => { if (o.isSkinnedMesh && meshes.length < 3) meshes.push({ name: o.name, pos: o.getWorldPosition ? Array.from(o.getWorldPosition({x:0,y:0,z:0}) ? [o.position.x, o.position.y, o.position.z] : []) : null }); });
      out.sampleMeshes = meshes;
      out.camPos = rt.camera?.position ? [rt.camera.position.x, rt.camera.position.y, rt.camera.position.z] : null;
      // WebGL error state
      const gl = r.gl;
      out.glError = gl ? gl.getError() : 'no-gl';
      out.floatTex = gl ? Boolean(gl.getExtension('OES_texture_float')) : null;
    } catch (e) { out.err = String(e).slice(0, 300); }
    return JSON.stringify(out);
  })()`);
  console.log('DEEP:' + deep);
} finally {
  await session.close();
}
