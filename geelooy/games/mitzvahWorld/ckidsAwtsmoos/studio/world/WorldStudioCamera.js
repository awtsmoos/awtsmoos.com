// B"H
export function createStudioCamera() {
  return { mode:"topdown", zoom:1, pan:{ x:0, y:0 }, orbit:{ yaw:0, pitch:.7 }, pinchZoom:true };
}
export default { createStudioCamera };
