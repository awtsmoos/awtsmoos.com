// B"H
import { lookAt, mul, perspective } from '../math.js';

/** Ultra-wide desktop narrows the lens; portrait mobile opens it for awareness. */
export function viewProjection(canvas, camera, player) {
	const aspect = canvas.width / Math.max(1, canvas.height);
	const fov = aspect > 1.7 ? Math.PI / 3.75 : aspect < 0.8 ? Math.PI / 2.75 : Math.PI / 3.25;
	const shake = camera.shake ? Math.sin(performance.now() * 0.04) * camera.shake * 20 : 0;
	const eye = [camera.x + shake, camera.z, camera.y - shake];
	const target = [camera.targetX ?? player.x, camera.targetZ ?? player.z, camera.targetY ?? player.y];
	return mul(perspective(fov, aspect, 8, 8200), lookAt(eye, target));
}
