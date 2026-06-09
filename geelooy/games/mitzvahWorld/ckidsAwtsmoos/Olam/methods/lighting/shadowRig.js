// B"H
/** @file shadowRig.js @description Chapter 445: Long readable shadows for village depth. */
export function tuneEmeraldShadow(sun) {
  sun.castShadow = true; sun.shadow.mapSize.width = 2048; sun.shadow.mapSize.height = 2048;
  sun.shadow.camera.near = 0.5; sun.shadow.camera.far = 4200;
  sun.shadow.camera.left = -720; sun.shadow.camera.right = 720; sun.shadow.camera.top = 720; sun.shadow.camera.bottom = -720;
  sun.shadow.bias = -0.00022;
  return sun;
}
