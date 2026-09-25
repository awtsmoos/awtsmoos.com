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
  await delay(4000);
  const proof = await ev(`(() => {
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
          try {
            const c = window[k]?.runtime || window[k];
            const cs = score(c);
            if (cs > bs) { best = c; bs = cs; }
          } catch {}
        }
        rt = best;
      }
      out.rtScore = score(rt);
      let skel = null, meshName = null;
      rt.model?.traverse?.(o => {
        if (!skel && o.isSkinnedMesh && o.skeleton) { skel = o.skeleton; meshName = o.name; }
      });
      if (!skel) { out.err = 'no skeleton'; return JSON.stringify(out); }
      const J = skel.joints.length;
      out.joints = J;
      out.mesh = meshName;
      // replicate jointTextureSize from tiny-render-skin-upload.js
      const size = Math.max(4, Math.ceil(Math.sqrt(Math.max(1, J * 4))));
      out.texSize = size;
      out.shaderRowsNeeded = J;
      out.sizeGeJ = size >= J;
      // CPU layout: joint j matrix at floats [j*16, j*16+16) of jointMatrices (RGBA texels linear)
      // shader jointAt(j): y=(j+0.5)/size -> row j (NEAREST); x in {0.125,0.375,0.625,0.875} -> col floor(x*size)
      const jm = skel.jointMatrices;
      out.jointMatricesLen = jm ? jm.length : 0;
      const cols = [0.125, 0.375, 0.625, 0.875].map(x => Math.floor(x * size));
      out.shaderCols = cols;
      // what the shader reconstructs for joint 0 (as 4 column vectors):
      function texel(row, col) {
        const t = row * size + col;
        return [jm[t*4], jm[t*4+1], jm[t*4+2], jm[t*4+3]];
      }
      const row0 = 0;
      const shaderJoint0 = [texel(row0, cols[0]), texel(row0, cols[1]), texel(row0, cols[2]), texel(row0, cols[3])];
      const cpuJoint0 = [[jm[0],jm[1],jm[2],jm[3]],[jm[4],jm[5],jm[6],jm[7]],[jm[8],jm[9],jm[10],jm[11]],[jm[12],jm[13],jm[14],jm[15]]];
      const flat = a => a.map(c => c.map(v => Math.round(v * 1000) / 1000));
      out.shaderJoint0 = flat(shaderJoint0);
      out.cpuJoint0 = flat(cpuJoint0);
      let maxDiff = 0;
      for (let c = 0; c < 4; c++) for (let r2 = 0; r2 < 4; r2++) maxDiff = Math.max(maxDiff, Math.abs(shaderJoint0[c][r2] - cpuJoint0[c][r2]));
      out.maxAbsDiffJoint0 = Math.round(maxDiff * 1e6) / 1e6;
      // also: would texImage2D get a big-enough array?
      out.pixelsHave = jm.length;
      out.pixelsNeed = size * size * 4;
      // CPU-side skinning sanity: skin first 200 verts of the mesh, measure spread
      let mesh = null;
      rt.model.traverse(o => { if (!mesh && o.isSkinnedMesh) mesh = o; });
      const pos = mesh.geometry.attributes.position;
      const si = mesh.geometry.attributes.skinIndex || mesh.geometry.attributes.aJoints;
      const sw = mesh.geometry.attributes.skinWeight || mesh.geometry.attributes.aWeights;
      out.hasSkinAttrs = Boolean(si && sw);
      if (si && sw) {
        let minX=1e9,maxX=-1e9,minY=1e9,maxY=-1e9,minZ=1e9,maxZ=-1e9;
        const N = Math.min(400, pos.count);
        const ibm = skel.inverseBindMatrices;
        const mw = mesh.matrixWorld.elements || mesh.matrixWorld;
        // inverse of meshWorld (assume affine)
        for (let v = 0; v < N; v++) {
          const px=pos.getX(v), py=pos.getY(v), pz=pos.getZ(v);
          let sx=0, sy=0, sz=0;
          for (let k = 0; k < 4; k++) {
            const j = si.getX ? si.getX(v*4+k) : 0;
            const w = sw.getX ? sw.getX(v*4+k) : 0;
            if (w === 0 || j*16+15 >= jm.length) continue;
            // skin matrix = jointMatrices[j] (already includes inverse meshWorld * jointWorld * IBM)
            const m = jm, o = j*16;
            const x = m[o]*px + m[o+4]*py + m[o+8]*pz + m[o+12];
            const y = m[o+1]*px + m[o+5]*py + m[o+9]*pz + m[o+13];
            const z = m[o+2]*px + m[o+6]*py + m[o+10]*pz + m[o+14];
            sx += x*w; sy += y*w; sz += z*w;
          }
          if (sx<minX)minX=sx; if(sx>maxX)maxX=sx;
          if (sy<minY)minY=sy; if(sy>maxY)maxY=sy;
          if (sz<minZ)minZ=sz; if(sz>maxZ)maxZ=sz;
        }
        const r3 = a => Math.round(a*1000)/1000;
        out.cpuSkinnedSpread = { x:[r3(minX),r3(maxX)], y:[r3(minY),r3(maxY)], z:[r3(minZ),r3(maxZ)] };
      }
    } catch (e) { out.err = String(e).slice(0, 300); }
    return JSON.stringify(out);
  })()`);
  console.log('PROOF:' + proof);
} finally {
  await session.close();
}
