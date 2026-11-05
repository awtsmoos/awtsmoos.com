// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DeferredTerrainEnrichmentFixtureObjects.mjs
 * @description Builds tiny scene, collision, and package vessels for deferred-enrichment lifecycle tests.
 * The Awtsmoos gives each mock one truthful boundary and one removable role; Awtsmoos.com keeps helpers lucid and light,
 * so fauna, sacred letters, forest, and collision can be composed without hiding their order from sight.
 */

export function createFixtureGroup(name, events) {
	return {
		children: [],
		add(child) {
			this.children.push(child);
			events.push(`visual:${child.id}`);
		},
		remove(child) {
			const index = this.children.indexOf(child);
			if (index >= 0) this.children.splice(index, 1);
		},
		name
	};
}

export function createFixtureContext(colliderStore, forest, obstacleTriangles, text) {
	return {
		colliderStore,
		forest: {
			colliders: [],
			group: forest,
			records: [],
			stats: { rendering: {}, unsupported: {} }
		},
		groundSampler: () => 0,
		halfSize: 120,
		obstacleTriangles,
		quality: 'medium',
		roadTriangles: [],
		textLandmark: {
			artifact: null,
			colliders: [],
			definition: null,
			mesh: text,
			stats: {}
		}
	};
}

export function createFixtureOctree(events, removed) {
	return {
		insert(value) {
			events.push(`collision:${value.id}`);
			return true;
		},
		remove(value) {
			removed.push(value.id);
			return true;
		}
	};
}

export function createFixtureTextPackage(collider) {
	return {
		artifact: { id: 'artifact' },
		colliders: [collider],
		definition: { id: 'definition' },
		mesh: { id: 'text-visual' },
		stats: { colliders: 1 }
	};
}

export function createFixtureForestPackage(collider) {
	return {
		colliders: [collider],
		group: { id: 'forest-visual' },
		records: [{ id: 'tree-1' }],
		stats: {
			drawCalls: 2,
			mobilePolicy: 'bounded',
			unsupported: { wind: 'disabled' }
		}
	};
}

export function createFixtureCollider(id) {
	return { id };
}
