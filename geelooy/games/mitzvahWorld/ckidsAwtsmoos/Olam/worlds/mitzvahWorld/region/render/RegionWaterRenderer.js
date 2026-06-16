// B"H
/** @file RegionWaterRenderer.js @description Grounded translucent stream cells with a living shimmer ticker. */
import * as THREE from "/games/scripts/build/three.module.js";
import { groundY } from "./RegionGround.js";
import { solveWaterFlow } from "../terrain/WaterFlowSolver.js?v=awtsmoos-water-flow-20260614-bh2";
import { sealRegionVisual } from "./RegionSeal.js";
function streamPoints(stream) {
  const out = [];
  for (let i=0; i<=stream.length-4; i+=2) {
    const ax=stream[i], az=stream[i+1], bx=stream[i+2], bz=stream[i+3], distance=Math.hypot(bx-ax,bz-az), steps=Math.max(2,Math.ceil(distance/4));
    for (let step=0; step<steps; step++) { const t=step/steps; out.push({ x:ax+(bx-ax)*t, z:az+(bz-az)*t, yaw:Math.atan2(bx-ax,bz-az), phase:t }); }
  }
  return out;
}
function makeMaterial() { return new THREE.MeshLambertMaterial({ color:0x56bddd, transparent:true, opacity:.72, depthWrite:false }); }
function placeCell(olam, mesh, dummy, cell, index) {
  dummy.position.set(cell.x, groundY(olam, cell.x, cell.z) + .055, cell.z);
  dummy.rotation.set(0, cell.yaw, 0);
  dummy.scale.set(.9 + (index % 3) * .08, 1, 1 + Math.sin(cell.phase * Math.PI) * .18);
  dummy.updateMatrix(); mesh.setMatrixAt(index, dummy.matrix);
}
export function buildWaterRenderer(olam, report = {}) {
  const flow = report.water || solveWaterFlow(report.terrain || {}), cells = (flow.streams || []).flatMap(streamPoints).slice(0, 220);
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(4.6,.12,5.2), makeMaterial(), cells.length), dummy = new THREE.Object3D();
  cells.forEach((cell,index) => placeCell(olam, mesh, dummy, cell, index));
  mesh.instanceMatrix.needsUpdate = true; mesh.name = "procedural_grounded_shimmer_stream_cells";
  mesh.userData.cells = cells; mesh.userData.time = 0;
  mesh.userData.tick = dt => { mesh.userData.time += Math.min(.05, Math.max(.001, Number(dt)||1/60)); mesh.material.opacity = .68 + Math.sin(mesh.userData.time * 1.7) * .06; mesh.material.color.setHSL(.54 + Math.sin(mesh.userData.time * .25) * .012, .62, .58); };
  mesh.userData.stats = { streamCells:cells.length, movingCubeWater:true, groundedWater:true, drawCalls:1 };
  return sealRegionVisual(mesh, { movingCubeWater:true, groundedWater:true, skipRaycast:true, skipOctree:true });
}
