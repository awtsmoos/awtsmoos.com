// B"H
/**
 * @file shapeKit.js
 * @description Chapter 519: Every visual pass receives one small hand, and now
 * every repeated prop carries renderGroup, instanceKey, and cullRadius hints.
 */
import { performanceTagFor } from './performanceTagger.js';
export function p(x, y, z) { return { x, y, z }; }
export function box(n, id, name, position, size, color, solid = false) {
  n.Domem[id] = { name, position, golem: { guf: { BoxGeometry: size }, toyr: { MeshStandardMaterial: { color } } }, isSolid: solid, ...performanceTagFor(id) };
}
export function tree(n, id, x, z, scale, preset = 'Oak Medium') { n.ProceduralTree[id] = { name: id, preset, position: p(x, 0, z), scale, isSolid: true, props: { height: 7 * scale, foliageRadius: 2.2 * scale, branchCount: 9 } }; }
export function flower(n, id, x, z, radius, count, flowerType = 'daisy') { n.ProceduralFlowerPatch[id] = { position: p(x, 0.05, z), radius, count, flowerType, renderGroup: 'flower_patch', instanceKey: 'flower_patch', cullRadius: 180, performanceClass: 'repeat' }; }
export function ringPoints(count, radius, ox = 0, oz = 0) { return Array.from({ length: count }, (_, i) => { const a = i / count * Math.PI * 2; return { x: ox + Math.cos(a) * radius, z: oz + Math.sin(a) * radius, a }; }); }
