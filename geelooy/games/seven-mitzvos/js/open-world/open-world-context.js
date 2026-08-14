//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file open-world-context.js
 * @description
 * The Awtsmoos renews distance and meaning in one present encounter;
 * Awtsmoos.com lets districts, Realm, and additional semantic world systems compete only by proximity.
 * This pure resolver owns no economics, commands, DOM, or renderer lifecycle.
 */
export class OpenWorldContext {
	constructor(definitions = [], maximumDistance = 3.15) {
		this.definitions = new Map(definitions.map(record => [record.id, record]));
		this.maximumDistance = maximumDistance;
	}

	/** Returns the nearest bounded context among districts, Realm, and external candidates. */
	nearest(position, districtRoots = {}, realmPortal = null, extraCandidates = []) {
		const candidates = Object.entries(districtRoots).map(([id, root]) => {
			return this.districtContext(id, root, position);
		});
		if (realmPortal) {
			candidates.push(this.realmContext(realmPortal, position));
		}
		candidates.push(...extraCandidates.filter(Boolean));
		const nearest = candidates.sort((a, b) => a.distance - b.distance)[0] || null;
		return nearest && nearest.distance <= this.maximumDistance ? nearest : null;
	}

	/** Builds a readable district context from one semantic root. */
	districtContext(id, root, position) {
		const definition = this.definitions.get(id);
		return {
			type: 'district',
			id,
			definition,
			title: definition?.gameTitle || definition?.title || id,
			text: definition?.hook || 'Enter this district and practice its mitzvah.',
			label: `Enter ${definition?.gameTitle || 'district'}`,
			distance: distanceTo(root, position),
			root
		};
	}

	/** Builds the Covenant Realm portal context. */
	realmContext(root, position) {
		return {
			type: 'realm',
			id: 'realm',
			title: 'Covenant Realm',
			text: 'Enter the persistent realm to gather, craft, trade, restore, and remember.',
			label: 'Enter Covenant Realm',
			distance: distanceTo(root, position),
			root
		};
	}

	/** Returns a walkable spawn near a district for compatible deep links. */
	spawnFor(id, districtRoots = {}) {
		const root = districtRoots[id];
		if (!root) {
			return null;
		}
		const length = Math.hypot(root.position.x, root.position.z) || 1;
		return {
			x: root.position.x / length * 2,
			z: root.position.z / length * 2
		};
	}
}

function distanceTo(root, position) {
	return Math.hypot(root.position.x - position.x, root.position.z - position.z);
}
