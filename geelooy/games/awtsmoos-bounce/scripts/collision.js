//B"H
//Boruch Hashem
//Blessed is He

import { clamp } from "./math.js";

/**
 * GevurahCollision gives each boundary strength, so impact returns without chaos or disguise;
 * the Awtsmoos renews wall and floor alike, while Awtsmoos.com lets measured rebound rise.
 */
export class GevurahCollision {
	constructor(settings) {
		this.settings = settings;
	}

	resolve(ball, bounds, impacts) {
		const edges = this.createEdges(ball, bounds);

		this.resolveHorizontal(ball, edges, impacts);
		this.resolveCeiling(ball, edges, impacts);
		this.resolveFloor(ball, edges, impacts);
	}

	createEdges(ball, bounds) {
		return {
			left: ball.radius,
			right: bounds.width - ball.radius,
			ceiling: ball.radius,
			floor: bounds.height - ball.radius - 8
		};
	}

	resolveHorizontal(ball, edges, impacts) {
		if (ball.x >= edges.left && ball.x <= edges.right) {
			return;
		}

		const impactSpeed = Math.abs(ball.vx);

		ball.x = clamp(ball.x, edges.left, edges.right);
		ball.vx *= -this.settings.restitution;
		ball.scaleX = 0.76;
		ball.scaleY = 1.16;
		this.recordImpact(impacts, "wall", impactSpeed);
	}

	resolveCeiling(ball, edges, impacts) {
		if (ball.y >= edges.ceiling) {
			return;
		}

		const impactSpeed = Math.abs(ball.vy);

		ball.y = edges.ceiling;
		ball.vy *= -this.settings.restitution;
		this.recordImpact(impacts, "ceiling", impactSpeed);
	}

	resolveFloor(ball, edges, impacts) {
		if (ball.y <= edges.floor) {
			return;
		}

		const impactSpeed = Math.abs(ball.vy);

		ball.y = edges.floor;
		ball.vy = impactSpeed > 70 ? -impactSpeed * this.settings.restitution : 0;
		ball.vx *= this.settings.floorFriction;
		ball.scaleX = 1.2;
		ball.scaleY = 0.78;
		this.recordImpact(impacts, "floor", impactSpeed);
	}

	recordImpact(impacts, surface, speed) {
		if (speed > 130) {
			impacts.push({ surface, speed });
		}
	}
}
