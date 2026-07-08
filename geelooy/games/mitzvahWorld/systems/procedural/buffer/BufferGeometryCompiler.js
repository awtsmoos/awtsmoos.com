// B"H
import { bufferAttributePacket } from "./BufferAttributePacket.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { indexBufferPacket } from "./IndexBufferPacket.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { bufferGeometryPacket } from "./BufferGeometryPacket.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
const BOX_POS = [-.5,-.5,-.5,.5,-.5,-.5,.5,.5,-.5,-.5,.5,-.5,-.5,-.5,.5,.5,-.5,.5,.5,.5,.5,-.5,.5,.5];
const BOX_IDX = [0,1,2,0,2,3,4,6,5,4,7,6,0,4,5,0,5,1,3,2,6,3,6,7,1,5,6,1,6,2,0,3,7,0,7,4];
export function compileBufferGeometry(renderData = {}) { const primitive = renderData.geometry?.primitive || renderData.primitive || "box"; const id = renderData.id || renderData.geometry?.id || primitive; const scale = renderData.geometry?.transform?.scale || [1,1,1]; const positions = BOX_POS.map((v,i)=>v * scale[i % 3]); return bufferGeometryPacket(id, { position:bufferAttributePacket("position", positions, 3) }, indexBufferPacket(BOX_IDX), { primitive, recipe:renderData.geometry?.recipe || null }); }
