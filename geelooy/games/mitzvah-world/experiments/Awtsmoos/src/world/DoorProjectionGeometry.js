// B"H
import {
	add,
	cross,
	dot,
	normalize,
	scale,
	sub,
	v
} from '../math/Geometry3D.js';

export function pointerRay(event, camera, canvas, targetHint) {
	const rectangle = canvas.getBoundingClientRect();
	const x = ((event.clientX - rectangle.left) / rectangle.width) * 2 - 1;
	const y = 1 - ((event.clientY - rectangle.top) / rectangle.height) * 2;
	const basis = cameraBasis(camera, targetHint);
	const tangent = Math.tan((camera.fov || 45) * Math.PI / 360);
	const direction = add(
		add(basis.forward, scale(basis.right, x * tangent * (camera.aspect || 1))),
		scale(basis.up, y * tangent)
	);
	return { origin: basis.origin, dir: normalize(direction) };
}

export function screenBox(box, camera, canvas, targetHint, padding) {
	const points = boxCorners(box)
		.map((point) => project(point, camera, canvas, targetHint))
		.filter(Boolean);
	if (points.length < 2) {
		return null;
	}
	return {
		x0: Math.min(...points.map((point) => point.x)) - padding,
		x1: Math.max(...points.map((point) => point.x)) + padding,
		y0: Math.min(...points.map((point) => point.y)) - padding,
		y1: Math.max(...points.map((point) => point.y)) + padding
	};
}

function boxCorners(box) {
	const points = [];
	for (const sideX of [-1, 1]) {
		for (const sideY of [-1, 1]) {
			for (const sideZ of [-1, 1]) {
				const horizontal = add(box.center, scale(box.right, sideX * box.half.x));
				const vertical = add(horizontal, scale(box.up, sideY * box.half.y));
				points.push(add(vertical, scale(box.forward, sideZ * box.half.z)));
			}
		}
	}
	return points;
}

function project(point, camera, canvas, targetHint) {
	const basis = cameraBasis(camera, targetHint);
	const delta = sub(point, basis.origin);
	const depth = dot(delta, basis.forward);
	if (depth <= 0.05) {
		return null;
	}
	const tangent = Math.tan((camera.fov || 45) * Math.PI / 360);
	const x = dot(delta, basis.right) / (depth * tangent * (camera.aspect || 1));
	const y = dot(delta, basis.up) / (depth * tangent);
	return {
		x: (x + 1) * 0.5 * canvas.clientWidth,
		y: (1 - y) * 0.5 * canvas.clientHeight
	};
}

function cameraBasis(camera, targetHint) {
	const origin = v(camera.position.x, camera.position.y, camera.position.z);
	const forward = normalize(sub(targetOf(targetHint || camera.target), origin));
	const right = normalize(cross(forward, v(0, 1, 0)));
	return { origin, forward, right, up: normalize(cross(right, forward)) };
}

function targetOf(target) {
	if (Array.isArray(target)) {
		return v(target[0] || 0, target[1] || 0, target[2] || 0);
	}
	return v(target?.x || 0, target?.y || 0, target?.z || 0);
}
