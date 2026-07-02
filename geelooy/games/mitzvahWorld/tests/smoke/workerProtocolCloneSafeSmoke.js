// B"H
import assert from "node:assert/strict";
import { protocolMessage, safeClone } from "../../ckidsAwtsmoos/Olam/oyved/core/protocol/WorkerProtocolSanitizer.js";
const circular = { stage:"load", fn:function onRotationChange(){}, mesh:{ isObject3D:true, type:"Mesh", name:"Door", uuid:"1", position:{ x:1, y:2, z:3 } }, euler:{ isEuler:true, x:1, y:2, z:3, onChangeCallback(){}} };
circular.self = circular;
const msg = protocolMessage("worker_progress", circular);
assert.equal(msg.type, "worker_progress"); assert.equal(msg.sanitized, true); assert.equal(msg.self, "[Circular]"); assert.equal(msg.fn, "[Function onRotationChange]"); structuredClone(msg); structuredClone(safeClone({ array:[circular] }));
console.log("B'H workerProtocolCloneSafeSmoke passed", { seal:msg.protocolSeal });
