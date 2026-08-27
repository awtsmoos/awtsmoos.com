// B"H
// Boruch Hashem
// Blessed is He
/**
 * Contacts separate penetration, bounce, and friction. The Awtsmoos lets each
 * Awtsmoos.com particle meet planes, spheres, and boxes through one exact law.
 */
function respond(position, velocity, normal, penetration, collider) {
	for (let axis = 0; axis < 3; axis += 1) {
		position[axis] += normal[axis] * penetration;
	}
	const normalSpeed = velocity.reduce(
		(sum, value, axis) => sum + value * normal[axis],
		0
	);
	if (normalSpeed < 0) {
		const restitution = Math.max(0, Number(collider.restitution ?? 0.2));
		for (let axis = 0; axis < 3; axis += 1) {
			velocity[axis] -= normal[axis] * normalSpeed * (1 + restitution);
		}
	}
	const corrected = velocity.reduce(
		(sum, value, axis) => sum + value * normal[axis],
		0
	);
	const friction = Math.max(0, Math.min(1, Number(collider.friction ?? 0.1)));
	for (let axis = 0; axis < 3; axis += 1) {
		const tangent = velocity[axis] - normal[axis] * corrected;
		velocity[axis] -= tangent * friction;
	}
}

function collidePlane(position, velocity, radius, collider) {
	const normal = collider.normal ?? [0, 1, 0];
	const distance = position.reduce(
		(sum, value, axis) => sum + value * normal[axis],
		-Number(collider.offset ?? 0)
	) - radius;
	if (distance < 0) {
		respond(position, velocity, normal, -distance, collider);
	}
	return distance < 0;
}

function collideSphere(position, velocity, radius, collider) {
	const center = collider.center ?? [0, 0, 0];
	const delta = position.map((value, axis) => value - center[axis]);
	const distance = Math.hypot(...delta);
	const boundary = Math.max(0, Number(collider.radius ?? 1)) + radius;
	if (distance >= boundary) {
		return false;
	}
	const normal = distance > 1e-9
		? delta.map(value => value / distance)
		: [0, 1, 0];
	respond(position, velocity, normal, boundary - distance, collider);
	return true;
}

function collideBox(position, velocity, radius, collider) {
	const minimum = collider.minimum ?? [-1, -1, -1];
	const maximum = collider.maximum ?? [1, 1, 1];
	const inside = position.every((value, axis) => (
		value > minimum[axis] - radius && value < maximum[axis] + radius
	));
	if (!inside) {
		return false;
	}
	const faces = position.flatMap((value, axis) => [
		{
			penetration: value - (minimum[axis] - radius),
			normal: axis === 0 ? [-1, 0, 0] : axis === 1 ? [0, -1, 0] : [0, 0, -1]
		},
		{
			penetration: maximum[axis] + radius - value,
			normal: axis === 0 ? [1, 0, 0] : axis === 1 ? [0, 1, 0] : [0, 0, 1]
		}
	]);
	faces.sort((left, right) => left.penetration - right.penetration);
	respond(position, velocity, faces[0].normal, faces[0].penetration, collider);
	return true;
}

/** Resolves all configured colliders and returns a renderer-neutral contact report. */
export function collideAdvancedParticle(particle, colliders = []) {
	const position = [...particle.position];
	const velocity = [...particle.velocity];
	const radius = Math.max(0, particle.size * 0.5);
	let contacts = 0;
	for (const collider of colliders) {
		const type = collider.type ?? "plane";
		const collided = type === "plane"
			? collidePlane(position, velocity, radius, collider)
			: type === "sphere"
				? collideSphere(position, velocity, radius, collider)
				: type === "box" && collideBox(position, velocity, radius, collider);
		contacts += Number(collided);
	}
	return Object.freeze({
		particle: Object.freeze({ ...particle, position, velocity }),
		contacts
	});
}
