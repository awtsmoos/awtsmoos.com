// B"H
/** @file shapeKit.js @description Chapter 1031: visual helper writes approved tree bucket only. */
import { performanceTagFor } from './performanceTagger.js';
export function p(x, y, z) { return { x, y, z }; }
export function box(n, id, name, position, size, color, solid = false) { n.Domem[id] = { name, position, golem: { guf: { BoxGeometry: size }, toyr: { MeshStandardMaterial: { color } } }, isSolid: solid, ...performanceTagFor(id) }; }
export function tree(n, id, x, z, scale, kind = 'oak') { n.VillageHeroTree ||= {}; n.VillageHeroTree[id] = { name: id, kind, position: p(x, 0, z), scale, isSolid: false, useAuthoredY: true, treeSource: '/libs/awtsmoos3d/tree/heroTree.js', ...performanceTagFor(id) }; }
export function flower(n, id, x, z, radius, count, flowerType = 'daisy') { n.ProceduralFlowerPatch[id] = { position: p(x, 0.05, z), radius, count, flowerType, renderGroup: 'flower_patch', instanceKey: 'flower_patch', cullRadius: 180, performanceClass: 'repeat' }; }
export function ringPoints(count, radius, ox = 0, oz = 0) { return Array.from({ length: count }, (_, i) => { const a = i / count * Math.PI * 2; return { x: ox + Math.cos(a) * radius, z: oz + Math.sin(a) * radius, a }; }); }
