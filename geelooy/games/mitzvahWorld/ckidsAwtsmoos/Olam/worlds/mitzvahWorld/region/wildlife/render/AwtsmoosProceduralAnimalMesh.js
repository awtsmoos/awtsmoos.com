// B"H
/** @file AwtsmoosProceduralAnimalMesh.js @description One-mesh animal vessel: no bead-chain bodies, only one procedural geometry. */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import { silhouetteFor } from "../../render/wildlife/AnimalSpeciesSilhouettes.js?compact=true&v=animal-realism-split-20260705-bh1";

function p(list, x, y, z) { list.push(x, y, z); }
function tri(list, a, b, c) { list.push(a, b, c); }
function colorOf(s) { return s.color || 0x9a714b; }

function profile(species) {
  const s = silhouetteFor(species);
  return { body:s.body || [.7,.35,1], head:s.head || [.22,.18,.2], color:colorOf(s), low:Boolean(s.low), ears:Boolean(s.ears), horns:Boolean(s.horns), tail:Boolean(s.tail), wings:Boolean(s.wings) };
}

function ellipsoid(vertices, indices, center, scale, rings = 7, cols = 12) {
  const base = vertices.length / 3;
  for (let r = 0; r <= rings; r++) {
    const v = r / rings, phi = -Math.PI / 2 + v * Math.PI;
    for (let c = 0; c < cols; c++) {
      const u = c / cols, theta = u * Math.PI * 2;
      p(vertices, center[0] + Math.cos(phi) * Math.cos(theta) * scale[0], center[1] + Math.sin(phi) * scale[1], center[2] + Math.cos(phi) * Math.sin(theta) * scale[2]);
    }
  }
  for (let r = 0; r < rings; r++) for (let c = 0; c < cols; c++) {
    const a = base + r * cols + c, b = base + r * cols + (c + 1) % cols, d = base + (r + 1) * cols + c, e = base + (r + 1) * cols + (c + 1) % cols;
    tri(indices, a, d, b); tri(indices, b, d, e);
  }
}

function fin(vertices, indices, a, b, c, d) {
  const base = vertices.length / 3;
  [a, b, c, d].forEach(v => p(vertices, ...v));
  tri(indices, base, base + 1, base + 2); tri(indices, base + 1, base + 3, base + 2);
}

export function createAwtsmoosProceduralAnimalMesh(species = "fox", data = {}) {
  const s = profile(species), vertices = [], indices = [], low = s.low ? .18 : .34;
  ellipsoid(vertices, indices, [0, low + .28, 0], s.body, 9, 16);
  ellipsoid(vertices, indices, [0, low + .43, .78], s.head, 7, 12);
  ellipsoid(vertices, indices, [-.22, low + .2, -.22], [.07,.22,.07], 5, 8);
  ellipsoid(vertices, indices, [.22, low + .2, -.22], [.07,.22,.07], 5, 8);
  ellipsoid(vertices, indices, [-.22, low + .2, .32], [.07,.22,.07], 5, 8);
  ellipsoid(vertices, indices, [.22, low + .2, .32], [.07,.22,.07], 5, 8);
  if (s.tail) fin(vertices, indices, [-.12,low+.38,-.75],[.12,low+.38,-.75],[-.05,low+.55,-1.35],[.05,low+.55,-1.35]);
  if (s.ears) { fin(vertices, indices, [-.1,low+.62,.82],[-.02,low+.62,.82],[-.08,low+1.05,.82],[0,low+1.05,.82]); fin(vertices, indices, [.02,low+.62,.82],[.1,low+.62,.82],[0,low+1.05,.82],[.08,low+1.05,.82]); }
  if (s.horns) { fin(vertices, indices, [-.16,low+.62,.78],[-.1,low+.62,.78],[-.34,low+.9,.86],[-.28,low+.9,.86]); fin(vertices, indices, [.1,low+.62,.78],[.16,low+.62,.78],[.28,low+.9,.86],[.34,low+.9,.86]); }
  if (s.wings) fin(vertices, indices, [-.65,low+.42,.1],[.65,low+.42,.1],[-1.05,low+.2,-.2],[1.05,low+.2,-.2]);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices); geometry.computeVertexNormals(); geometry.computeBoundingSphere(); geometry.name = `awtsmoos_one_mesh_${species}_geometry`;
  const material = new THREE.MeshStandardMaterial({ color:s.color, roughness:.88, metalness:0, flatShading:false });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = `awtsmoos_one_mesh_${species}_${data.id || "wild"}`;
  Object.assign(mesh.userData ||= {}, { species, singleMeshAnimal:true, renderMeshCount:1, awtsmoosProceduralAnimal:true, notSphereChain:true, proceduralAnimalSurface:"AwtsmoosOneMesh", anatomyScore:10, source:"geelooy-lobs-Awtsmoos-procedural-compatible" });
  return mesh;
}

export default createAwtsmoosProceduralAnimalMesh;
