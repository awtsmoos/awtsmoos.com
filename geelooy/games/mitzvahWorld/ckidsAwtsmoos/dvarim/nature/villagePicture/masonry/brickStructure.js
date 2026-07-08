// B"H
/** @file brickStructure.js @description One-buffer masonry walls, parser-clear and visual-only. */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { material } from "../geometryKit.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { PICTURE_COLORS as C } from "../palette.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { buildBrickWallRenderData } from "../../../../../../../libs/awtsmoos-procedural-core/src/core/geometry/generators/brickWall/brickWallGenerator.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export const DEFAULT_STONE_PALETTE = Object.freeze([C.stone, 0xd9c9a6, 0xb4a486, 0xe9d9b8, 0xa8926f, 0xf2e4c2]);
const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
function at(values, index, fallback = 0) { return Array.isArray(values) && values[index] !== undefined ? values[index] : fallback; }
function dataOf(object) { if (!object.userData) object.userData = {}; return object.userData; }
function maxValue(values = []) { let max = 0; for (let i = 0; i < values.length; i++) if (values[i] > max) max = values[i]; return max; }
function attr(values, size) { return new THREE.BufferAttribute(new Float32Array(values || []), size); }
function indexAttr(values = []) { const source = maxValue(values) > 65535 ? new Uint32Array(values) : new Uint16Array(values); return new THREE.BufferAttribute(source, 1); }
function geometryFromRenderData(data) { const geo = new THREE.BufferGeometry(); geo.setAttribute("position", attr(data.positions, 3)); geo.setAttribute("normal", attr(data.normals, 3)); geo.setAttribute("uv", attr(data.uvs, 2)); geo.setAttribute("color", attr(data.colors, 3)); geo.setIndex(indexAttr(data.indices)); geo.computeBoundingBox(); geo.computeBoundingSphere(); return geo; }
function markVisual(object, extra = {}) { Object.assign(dataOf(object), { masonryVisualOnly:true, physics:"separate-colliders-only", skipOctree:true, noOctree:true, skipRaycast:true }, extra); return object; }
export function addMasonryBox(group, color, position, scale, mode = "rock") { const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material(color, { textureMode:mode })); mesh.position.set(n(at(position,0)), n(at(position,1)), n(at(position,2))); mesh.scale.set(n(at(scale,0,1),1), n(at(scale,1,1),1), n(at(scale,2,1),1)); markVisual(mesh); group.add(mesh); return mesh; }
export function buildBrickSpan(group, span = {}) { return buildBrickStructure(group, { spans:[span], panels:[] }).bricks; }
export function buildBrickStructure(group, structure = {}) { const data = buildBrickWallRenderData(structure), geo = geometryFromRenderData(data), mat = material(0xffffff, { textureMode:"rock", vertexColors:true }); const mesh = new THREE.Mesh(geo, mat); mesh.name = structure.name || "one_buffer_geometry_masonry_wall_no_stack_bomb"; markVisual(mesh, { singleBufferGeometry:true, bricks:data.bricks }); group.add(mesh); Object.assign(dataOf(group), { visualBrickStructure:{ bricks:data.bricks, panels:0, meshes:1, physics:"none", algorithm:"libs-one-buffer-no-gaps-no-spread-stack" } }); return group.userData.visualBrickStructure; }
