// B"H
import {
	dot,
	normalize,
	sub
} from '../math/Geometry3D.js';

export function rayObb(ray, box) {
	const direction = normalize(ray.dir);
	let minimum = 0.05;
	let maximum = 80;
	for (const [axis, half] of axes(box)) {
		const offset = dot(axis, sub(box.center, ray.origin));
		const projected = dot(direction, axis);
		if (Math.abs(projected) < 0.00001) {
			if (-offset - half > 0 || -offset + half < 0) {
				return null;
			}
			continue;
		}
		let near = (offset - half) / projected;
		let far = (offset + half) / projected;
		if (near > far) {
			[near, far] = [far, near];
		}
		minimum = Math.max(minimum, near);
		maximum = Math.min(maximum, far);
		if (minimum > maximum) {
			return null;
		}
	}
	return { t: minimum };
}

export function colorArray(hex = '#6b3d1e') {
	const value = parseInt(String(hex).replace('#', ''), 16);
	return [
		((value >> 16) & 255) / 255,
		((value >> 8) & 255) / 255,
		(value & 255) / 255,
		1
	];
}

function axes(box) {
	return [
		[box.right, box.half.x],
		[box.up, box.half.y],
		[box.forward, box.half.z]
	];
}
