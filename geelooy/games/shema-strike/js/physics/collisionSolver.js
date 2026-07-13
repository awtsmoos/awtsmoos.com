//B"H
// Boruch Hashem
// Blessed is He
/**
 * Collision turns intention into lawful contact; Awtsmoos.com remains the source of both law and renewed existence.
 * Axis separation, slope sampling, one-way tests, moving-platform inheritance, and substeps prevent tunneling.
 */
import { horizontalOverlap, overlaps } from "./geometry.js";

const resolveHorizontal = (actor, bodies, step) => {
	actor.x += actor.vx * step;
	for (const body of bodies) {
		if (!["solid", "moving"].includes(body.type) || !overlaps(actor, body)) {
			continue;
		}
		if (actor.vx > 0) {
			actor.x = body.x - actor.width;
		} else if (actor.vx < 0) {
			actor.x = body.x + body.width;
		}
		actor.vx = 0;
	}
};

const resolveFloor = (actor, body, previousBottom) => {
	const centerX = actor.x + actor.width * 0.5;
	const surfaceY = body.topAt(centerX);
	const currentBottom = actor.y + actor.height;
	const canLand = actor.vy >= 0 && previousBottom <= surfaceY + 12 && currentBottom >= surfaceY;
	if (!canLand || centerX < body.x || centerX > body.x + body.width) {
		return false;
	}
	actor.y = surfaceY - actor.height;
	actor.vy = 0;
	actor.onGround = true;
	actor.groundBody = body;
	return true;
};

const resolveVertical = (actor, bodies, step, result) => {
	const previousTop = actor.y;
	const previousBottom = actor.y + actor.height;
	actor.y += actor.vy * step;
	actor.onGround = false;
	actor.groundBody = null;
	for (const body of bodies) {
		if (body.type === "hazard" && overlaps(actor, body)) {
			result.hazard = body;
			continue;
		}
		if (body.type === "slope" || body.type === "oneWay") {
			resolveFloor(actor, body, previousBottom);
			continue;
		}
		if (!["solid", "moving"].includes(body.type) || !overlaps(actor, body)) {
			continue;
		}
		if (actor.vy >= 0 && previousBottom <= body.y + 12 && horizontalOverlap(actor, body)) {
			actor.y = body.y - actor.height;
			actor.vy = 0;
			actor.onGround = true;
			actor.groundBody = body;
		} else if (actor.vy < 0 && previousTop >= body.bottom - 12) {
			actor.y = body.bottom;
			actor.vy = 0;
		}
	}
};

export const solveBody = (actor, bodies, delta) => {
	const result = { hazard: null };
	const distance = Math.max(Math.abs(actor.vx), Math.abs(actor.vy)) * delta;
	const steps = Math.max(1, Math.ceil(distance / 18));
	const step = delta / steps;
	for (let index = 0; index < steps; index += 1) {
		resolveHorizontal(actor, bodies, step);
		resolveVertical(actor, bodies, step, result);
	}
	if (actor.groundBody?.type === "moving") {
		actor.x += actor.groundBody.deltaX;
		actor.y += actor.groundBody.deltaY;
	}
	return result;
};
