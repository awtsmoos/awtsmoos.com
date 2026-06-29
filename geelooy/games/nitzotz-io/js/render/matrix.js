// B"H
import { lookAt, mul, perspective } from '../math.js';

/** B"H: Perspective bends the finite world toward the player without eating it. */
export function viewProjection(canvas, camera, player) {
  const shake = camera.shake ? Math.sin(performance.now() * 0.04) * camera.shake * 20 : 0;
  const eye = [camera.x + shake, camera.z, camera.y - shake];
  const target = [player.x, camera.targetZ ?? player.z + player.h * 0.6, player.y];
  return mul(perspective(Math.PI / 3.35, canvas.width / canvas.height, 8, 7200), lookAt(eye, target));
}
