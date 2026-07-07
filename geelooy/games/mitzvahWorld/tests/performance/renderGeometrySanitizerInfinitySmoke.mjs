// B"H
import assert from 'node:assert/strict';
import { sanitizeRenderGeometryTree } from '../../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/runtime/RenderGeometrySanitizer.js';

function vector() { return { x:1, y:1, z:1 }; }
function matrix() { return { elements:[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] }; }
function material(name = 'mat') { return { name, type:'MeshBasicMaterial', dispose() { this.disposed = true; } }; }
function geometry(drawCount) {
  return {
    type:'BufferGeometry',
    attributes:{ position:{ count:3, itemSize:3, array:new Float32Array(9) } },
    drawRange:{ start:0, count:drawCount },
    dispose() { this.disposed = true; }
  };
}
function mesh(name, drawCount) {
  return {
    name,
    type:'Mesh',
    isMesh:true,
    visible:true,
    position:vector(),
    scale:vector(),
    rotation:vector(),
    matrix:matrix(),
    matrixWorld:matrix(),
    material:material(),
    geometry:geometry(drawCount),
    userData:{},
    parent:{ removed:null, remove(node) { this.removed = node.name; } }
  };
}
function root(nodes) {
  return {
    name:'root',
    userData:{},
    traverse(visitor) { visitor(this); nodes.forEach(visitor); }
  };
}

const lawfulInfinity = mesh('lawful-default-infinity-draw-range', Infinity);
const safeStats = sanitizeRenderGeometryTree(root([lawfulInfinity]), { warn:false });
assert.equal(safeStats.removed, 0);
assert.equal(lawfulInfinity.parent.removed, null);
assert.equal(lawfulInfinity.geometry.disposed, undefined);

const brokenNaN = mesh('broken-nan-draw-range', NaN);
const brokenStats = sanitizeRenderGeometryTree(root([brokenNaN]), { warn:false });
assert.equal(brokenStats.removed, 1);
assert.equal(brokenStats.reasons['invalid-draw-range-count'], 1);
assert.equal(brokenNaN.parent.removed, 'broken-nan-draw-range');
assert.equal(brokenNaN.geometry.disposed, true);

console.log('B"H renderGeometrySanitizerInfinitySmoke passed');
