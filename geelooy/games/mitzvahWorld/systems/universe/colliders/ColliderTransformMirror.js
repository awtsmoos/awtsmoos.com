// B"H
export function mirrorColliderTransform(object = {}) { return object.manual?.transform || { position:object.position || [0,0,0], rotation:object.rotation || [0,0,0], scale:object.scale || [1,1,1] }; }
