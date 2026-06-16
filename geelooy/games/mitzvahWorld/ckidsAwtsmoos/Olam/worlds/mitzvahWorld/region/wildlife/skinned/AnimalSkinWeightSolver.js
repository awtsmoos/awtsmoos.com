// B"H
/** @file AnimalSkinWeightSolver.js @description Anatomical renderer-free 4-weight skin solving. */
function boneIndex(map, id) { return map[id] === undefined ? 0 : map[id]; }
function normalize(weights) { const sum = weights.reduce((a, b) => a + b[1], 0) || 1; return weights.map(w => [w[0], w[1] / sum]).slice(0, 4); }
function fill(out, weights) { const w = normalize(weights); for (let i = 0; i < 4; i++) { out.indices.push(w[i] ? w[i][0] : 0); out.weights.push(w[i] ? w[i][1] : 0); } }
function mapBones(rig) { const out = {}; (rig.bones || []).forEach((b, i) => { out[b.id] = i; }); return out; }
function legWeights(tag, x, z, map) { const side = x < 0 ? "l" : "r", fore = tag === "foreLeg", root = `${fore ? "fore" : "hind"}_${side}`; const lift = Math.max(0, Math.min(1, z + 1)); return [[boneIndex(map,`${root}_upper`),.42],[boneIndex(map,`${root}_knee`),.28],[boneIndex(map,`${root}_ankle`),.2],[boneIndex(map,`${root}_paw`),.1 + lift*.08]]; }
function bodyWeights(z, map) { if (z < -.35) return [[boneIndex(map,"pelvis"),.55],[boneIndex(map,"spine_0"),.35],[boneIndex(map,"spine_1"),.1]]; if (z < .25) return [[boneIndex(map,"spine_0"),.32],[boneIndex(map,"spine_1"),.42],[boneIndex(map,"chest"),.26]]; return [[boneIndex(map,"chest"),.55],[boneIndex(map,"spine_1"),.25],[boneIndex(map,"neck_0"),.2]]; }
function headWeights(tag, z, map) { if (tag === "snout") return [[boneIndex(map,"snout"),.75],[boneIndex(map,"head"),.2],[boneIndex(map,"jaw"),.05]]; return [[boneIndex(map,"head"),.65],[boneIndex(map,"neck_1"),.25],[boneIndex(map,"snout"),.1]]; }
function tailWeights(z, map) { const t = Math.max(0, Math.min(5, Math.floor(Math.abs(z) * 3))); return [[boneIndex(map,`tail_${t}`),.68],[boneIndex(map,`tail_${Math.max(0,t-1)}`),.22],[boneIndex(map,"pelvis"),.1]]; }
export function solveAnimalSkinWeights(mesh, rig) {
  const map = mapBones(rig), out = { skinIndices:[], skinWeights:[] }, pos = mesh.positions || [], tags = mesh.tags || [];
  for (let i = 0; i < pos.length; i += 3) { const vi = i / 3, x = pos[i], z = pos[i+2], tag = tags[vi] || "body"; let weights = null;
    if (tag === "foreLeg" || tag === "hindLeg") weights = legWeights(tag, x, z, map); else if (tag === "tail") weights = tailWeights(z, map); else if (tag === "head" || tag === "snout" || tag === "neck") weights = headWeights(tag, z, map); else weights = bodyWeights(z, map);
    fill({ indices:out.skinIndices, weights:out.skinWeights }, weights);
  }
  return out;
}
export default solveAnimalSkinWeights;
