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
  await delay(5000);
  const rep = await ev(`(() => {
    const out = {};
    try {
      const pub = window.AwtsmoosMitzvahWorld || {};
      let rt = pub.runtime || pub;
      const score = c => c && typeof c === 'object'
        ? Number(Boolean(c.model)) * 8 + Number(Boolean(c.scene)) * 8
          + Number(Boolean(c.canonicalPlayer)) * 6 + Number(Boolean(c.renderer)) * 4
          + Number(Boolean(c.terrain)) * 4 + Number(Boolean(c.state)) * 2
          + Number(Boolean(c.bus)) + Number(Boolean(c.input)) : -1;
      if (!rt?.model || !rt?.scene) {
        let best = rt, bs = score(rt);
        for (const k of Object.keys(window)) {
          try { const c = window[k]?.runtime || window[k]; const cs = score(c); if (cs > bs) { best = c; bs = cs; } } catch {}
        }
        rt = best;
      }
      let tiny = null;
      const seen = new Set();
      const hunt = (o, d) => {
        if (!o || typeof o !== 'object' || d > 4 || seen.has(o)) return;
        seen.add(o);
        if (o.gl && o.jointMode && o.stats) { tiny = o; return; }
        for (const k of Object.keys(o)) { try { hunt(o[k], d + 1); } catch {} if (tiny) return; }
      };
      hunt(rt, 0);
      if (!tiny) { out.err = 'tiny renderer not found'; return JSON.stringify(out); }
      const gl = tiny.gl;
      out.jointMode = tiny.jointMode;
      out.maxVertexUniformVectors = tiny.maxVertexUniformVectors;
      out.maxUniformJoints = tiny.maxUniformJoints;
      out.maxVertexTextures = tiny.maxVertexTextures;
      out.floatTexture = tiny.floatTexture;
      out.frameToken = tiny.frameToken;
      out.errors = (tiny.errors || []).slice(0, 8).map(String);
      out.stats = tiny.stats ? { skinGpuUploads: tiny.stats.skinGpuUploads, skinGpuUploadReuses: tiny.stats.skinGpuUploadReuses, skinTextureUploads: tiny.stats.skinTextureUploads, skinnedMeshes: tiny.stats.skinnedMeshes, skinPaletteRecomputes: tiny.stats.skinPaletteRecomputes, skinPaletteReuses: tiny.stats.skinPaletteReuses } : null;
      out.glError = gl.getError();
      out.glVersion = gl.getParameter(gl.VERSION);
      out.glRendererStr = gl.getParameter(gl.RENDERER);
      out.maxVertUnits = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
      out.maxVertTex = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
      out.floatExt = Boolean(gl.getExtension('OES_texture_float'));
      let sk = null;
      rt.model.traverse(o => { if (!sk && o.isSkinnedMesh && o.skeleton) sk = o.skeleton; });
      out.jointCount = sk ? sk.jointCount : null;
      out.jointsLen = sk ? sk.joints.length : null;
      out.paletteRevision = sk ? sk.paletteRevision : null;
      out.binding = tiny._skinTextureBinding ? { rev: tiny._skinTextureBinding.revision, same: tiny._skinTextureBinding.skeleton === sk } : null;
    } catch (e) { out.err = String(e).slice(0, 300); }
    return JSON.stringify(out);
  })()`);
  console.log('REP:' + rep);
} finally {
  await session.close();
}
