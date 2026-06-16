// B"H
/** @file YardGateVisualGenerator.js @description Visual descriptor for lockable yard gates. */
export function yardGateVisual(gate = {}) { return { id: `${gate.id}_visual`, gateId: gate.id, x: gate.x, z: gate.z, yaw: gate.yaw || 0, width: gate.width || 2.4, height: gate.height || 1.25, visualOnly: true, lockable: true, lockId: gate.lockId, keyId: gate.keyId }; }
export default { yardGateVisual };
