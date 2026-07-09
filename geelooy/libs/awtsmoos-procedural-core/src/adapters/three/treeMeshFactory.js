// B"H
/** @file treeMeshFactory.js @description Creates exactly two tree draw calls: bark mesh and leaves mesh. */
import { generateTreeProceduralData } from "../../core/geometry/generators/tree/treeGenerator.js";
import { createAwtsmoosThreeBufferGeometry } from "./bufferGeometry.js";
import { removeWhiteLeafTextureBackgroundOnce } from "./treeAlphaTexture.js";
function matMaps(config){ return config?.materials || config?.maps || {}; }
function barkMaterial(THREE, data, config){ const maps=matMaps(config).bark || {}; return new THREE.MeshStandardMaterial({ name:'awts_tree_bark', color:data.material?.tint ?? 0xffffff, map:maps.map || maps.color || null, normalMap:maps.normal || null, roughnessMap:maps.roughness || null, aoMap:maps.ao || null, roughness:.86 }); }
function leafMaterial(THREE, data, config){ const maps=matMaps(config).leaves || {}, raw=maps.map || maps.color || config?.leafTexture || null, map=raw ? removeWhiteLeafTextureBackgroundOnce(THREE, raw) : null; return new THREE.MeshLambertMaterial({ name:'awts_tree_leaves', color:data.material?.tint ? 0xffffff : 0xffffff, map, vertexColors:true, side:THREE.DoubleSide, transparent:true, alphaTest:data.material?.alphaTest ?? .34, depthWrite:false }); }
export function createProceduralTreeThreeGroup(THREE, config = {}) {
  if (!THREE) throw new Error('B"H | THREE namespace is required for procedural tree group');
  const data = generateTreeProceduralData(config.preset || config.name || config);
  const group = new THREE.Group();
  group.name = config.name || data.preset || 'Awtsmoos Procedural Tree';
  const barkGeo = createAwtsmoosThreeBufferGeometry(THREE, data.branches, { preserveNormals:true });
  const leafGeo = createAwtsmoosThreeBufferGeometry(THREE, data.leaves, { preserveNormals:true });
  const bark = new THREE.Mesh(barkGeo, barkMaterial(THREE, data.branches, config));
  const leaves = new THREE.Mesh(leafGeo, leafMaterial(THREE, data.leaves, config));
  bark.name = 'bark'; leaves.name = 'leaves'; bark.castShadow = leaves.castShadow = true; bark.receiveShadow = leaves.receiveShadow = true;
  group.add(bark, leaves);
  group.userData = { awtsmoosProceduralTree:true, drawCalls:2, preset:data.preset, stats:data.stats, materialNeeds:data.materials?.needs, barkType:data.materials?.barkType, leafType:data.materials?.leafType };
  return group;
}
export default createProceduralTreeThreeGroup;
