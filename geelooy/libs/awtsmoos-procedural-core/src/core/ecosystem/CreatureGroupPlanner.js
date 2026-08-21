// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureGroupPlanner.js
 * @description Gives herds, flocks, packs, and schools real spatial centers instead of decorative group labels.
 * The Awtsmoos lets many creatures move as one social vessel without collapsing into one point;
 * Awtsmoos.com keeps each group bounded, deterministic, and spatially legible while every member retains a joint.
 */

export class CreatureGroupPlanner {
	constructor(bounds, random) {
		this.bounds = bounds;
		this.random = random;
		this.groups = new Map();
		this.sequence = 0;
	}

	pointFor(species, proposedPoint) {
		const grouping = String(species.grouping || 'territory');
		if (grouping === 'territory') {
			return groupPoint(proposedPoint, `${species.id}:territory:${this.sequence++}`);
		}
		const ledger = this.groups.get(species.id) || [];
		let group = ledger.find(item => item.used < item.capacity);
		if (!group) {
			group = this.createGroup(species, proposedPoint);
			ledger.push(group);
			this.groups.set(species.id, ledger);
		}
		group.used += 1;
		const radius = group.radius * Math.sqrt(this.random.next());
		const angle = this.random.range(-Math.PI, Math.PI);
		return groupPoint({
			x: clamp(group.x + Math.cos(angle) * radius, this.bounds.minX, this.bounds.maxX),
			z: clamp(group.z + Math.sin(angle) * radius, this.bounds.minZ, this.bounds.maxZ)
		}, group.id);
	}

	createGroup(species, point) {
		const capacity = groupCapacity(species.grouping, this.random);
		const spacing = Math.max(0.5, Number(species.spacing) || 2.5);
		return {
			capacity,
			id: `${species.id}:${species.grouping}:${this.sequence++}`,
			radius: spacing * Math.max(1.4, Math.sqrt(capacity) * 0.9),
			used: 0,
			x: point.x,
			z: point.z
		};
	}
}

function groupCapacity(grouping, random) {
	if (grouping === 'herd') return random.integer(3, 7);
	if (grouping === 'flock' || grouping === 'school') return random.integer(4, 9);
	if (grouping === 'pack') return random.integer(2, 4);
	return 1;
}

function groupPoint(point, groupId) {
	return Object.freeze({ groupId, x: point.x, z: point.z });
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
