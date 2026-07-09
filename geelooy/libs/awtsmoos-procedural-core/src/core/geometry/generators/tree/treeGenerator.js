// B"H
/** @file treeGenerator.js @description Public two-draw-call procedural tree generator. */
import { TreeRNG } from './rng.js';
import { TreeGeometryBuilder } from './treeGeometryBuilder.js';
import { TreeGrowthSystem } from './treeGrowthSystem.js';
import TREE_PRESETS, { getTreePreset, listTreePresets } from './treePresets.js';

function clone(value){ return typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value)); }
function resolveConfig(config = 'Oak Medium') { return typeof config === 'string' ? getTreePreset(config) : { ...getTreePreset(config.preset || config.name || 'Oak Medium'), ...clone(config) }; }
function arrays(geo){ return { positions:geo.verts, normals:geo.normals, uvs:geo.uvs, indices:geo.indices }; }
function leafArrays(geo){ return { positions:geo.leafVerts, normals:geo.leafNorms, uvs:geo.leafUVs, indices:geo.leafIndices, colors:geo.leafColors }; }

export class TreeGenerator {
  constructor(config = 'Oak Medium') { this.config = resolveConfig(config); this.rng = new TreeRNG(this.config.seed); this.builder = new TreeGeometryBuilder(); this.system = new TreeGrowthSystem(this.config, this.rng, this.builder); }
  generate() { this.system.generate(); return { preset:this.config.name, drawCalls:2, branches:{ ...arrays(this.builder), material:this.config.bark }, leaves:{ ...leafArrays(this.builder), material:this.config.leaves }, materials:this.config.materials, stats:this.stats() }; }
  stats() { return { branchVertices:this.builder.verts.length/3, leafVertices:this.builder.leafVerts.length/3, branchTriangles:this.builder.indices.length/3, leafTriangles:this.builder.leafIndices.length/3, generatedBranches:this.system.branchCount, drawCalls:2 }; }
}

export function generateTreeProceduralData(config) { return new TreeGenerator(config).generate(); }
export { TREE_PRESETS, getTreePreset, listTreePresets };
export default TreeGenerator;
