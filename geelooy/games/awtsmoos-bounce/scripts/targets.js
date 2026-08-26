//B"H
// Boruch Hashem
// Blessed is He

import { clamp, distance } from "./math.js";
import { portalArchetype } from "./portal-archetypes.js";

/**
 * TzomayachTargets grows drifting portals whose value now comes from one named tactical source;
 * the Awtsmoos renews their coordinates, while Awtsmoos.com keeps collision and economy on one course.
 */
export class TzomayachTargets {
	constructor(settings, random) {
		this.settings = settings;
		this.random = random;
		this.targets = [];
		this.elapsed = 0;
	}

	reset(bounds, ball) {
		this.elapsed = 0;
		this.targets = Array.from(
			{ length: this.settings.portalCount },
			(_, index) => this.createTarget(index, bounds, ball)
		);
	}

	createTarget(index, bounds, ball) {
		const target = {
			id: index,
			baseX: 0,
			baseY: 0,
			x: 0,
			y: 0,
			radius: this.random.between(
				this.settings.portalRadiusMin,
				this.settings.portalRadiusMax
			),
			phase: this.random.between(0, Math.PI * 2),
			speed: this.random.between(0.7, 1.25),
			value: portalArchetype(index).value
		};

		this.relocate(target, bounds, ball);
		return target;
	}

	relocate(target, bounds, ball) {
		const margin = Math.max(58, target.radius + 18);
		const minimumY = Math.min(this.settings.portalSafeTop, bounds.height * 0.36);
		let candidate = { x: bounds.width * 0.7, y: bounds.height * 0.45 };

		for (let attempt = 0; attempt < 12; attempt += 1) {
			candidate = {
				x: this.random.between(margin, Math.max(margin, bounds.width - margin)),
				y: this.random.between(minimumY, Math.max(minimumY, bounds.height - margin - 44))
			};

			if (!ball || distance(candidate, ball) > 150) {
				break;
			}
		}

		target.baseX = candidate.x;
		target.baseY = candidate.y;
		target.x = candidate.x;
		target.y = candidate.y;
		target.phase = this.random.between(0, Math.PI * 2);
	}

	update(deltaSeconds, bounds) {
		this.elapsed += deltaSeconds;

		for (const target of this.targets) {
			const amplitude = clamp(bounds.width * 0.035, 12, 30);
			const wave = this.elapsed * target.speed + target.phase;
			target.x = target.baseX + Math.sin(wave) * amplitude;
			target.y = target.baseY + Math.cos(wave * 0.77) * amplitude * 0.65;
		}
	}

	consumeHits(ball, bounds) {
		const hits = [];

		for (const target of this.targets) {
			if (distance(target, ball) > target.radius + ball.radius * 0.72) {
				continue;
			}

			hits.push({
				x: target.x,
				y: target.y,
				value: target.value,
				id: target.id
			});
			this.relocate(target, bounds, ball);
		}

		return hits;
	}

	nearestTo(ball) {
		return this.targets.reduce((nearest, target) => {
			if (!nearest) {
				return target;
			}
			return distance(target, ball) < distance(nearest, ball) ? target : nearest;
		}, null);
	}
}
