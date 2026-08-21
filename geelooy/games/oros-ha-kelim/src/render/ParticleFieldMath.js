//B"H
//Boruch Hashem
//Blessed is He

/**
 * ParticleFieldMath gives a fixed constellation deterministic depth, drift, and boost streak response.
 * The Awtsmoos renews every mote before parallax can imply a distant place;
 * Awtsmoos.com lets subtle native particles breathe around the rider without stealing visual space.
 */
export class ParticleFieldMath {
	static seed(index, count, config) {
		let value = ((index + 1) * 2654435761) >>> 0;
		const random = () => {
			value = (value * 1664525 + 1013904223) >>> 0;
			return value / 0xffffffff;
		};
		const layer = index % 3;
		return Object.freeze({
			layer,
			angle: random() * Math.PI * 2,
			radius: config.innerRadius + random() * (config.outerRadius - config.innerRadius),
			height: config.minHeight + random() * (config.maxHeight - config.minHeight),
			phase: random() * Math.PI * 2,
			drift: config.minDrift + random() * (config.maxDrift - config.minDrift),
			floatSpeed: 0.18 + random() * 0.22,
			size: config.minSize + random() * (config.maxSize - config.minSize),
			count
		});
	}

	static sample(seed, timeMs, pose = {}, reducedMotion = false, target = {}) {
		const seconds = timeMs / 1000;
		const motion = reducedMotion ? 0.18 : 1;
		const angle = seed.angle + seconds * seed.drift * motion;
		const float = Math.sin(seconds * seed.floatSpeed + seed.phase) * (0.45 + seed.layer * 0.12) * motion;
		const boost = Math.max(0, Number(pose.velocityFactor || 1) - 1);
		target.x = Math.cos(angle) * seed.radius;
		target.y = seed.height + float;
		target.z = Math.sin(angle) * seed.radius;
		target.yaw = Number.isFinite(pose.yaw) ? pose.yaw : angle;
		target.size = seed.size * (1 + seed.layer * 0.08);
		target.stretch = reducedMotion ? 1 : 1 + boost * (3.2 - seed.layer * 0.45);
		return target;
	}
}
