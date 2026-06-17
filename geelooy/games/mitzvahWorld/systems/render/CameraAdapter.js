// B"H
/** Camera commands emitted by movie runtime. */
export function cameraCommandFromRail(rail = {}) { return { adapter:"camera", op:"follow_rail", rail }; }
export function cameraCommandBatch(rails = []) { return rails.map(cameraCommandFromRail); }
