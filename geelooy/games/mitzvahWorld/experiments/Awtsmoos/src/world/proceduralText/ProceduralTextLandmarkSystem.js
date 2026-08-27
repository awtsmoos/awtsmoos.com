// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Orchestrates text, recipe, ground placement, rendering, and collision.
 *
 * RESPONSIBILITY: Own the complete lifecycle of one live procedural landmark.
 * NON-RESPONSIBILITY: This system does not own terrain assembly or octree insertion.
 * ARCHITECTURAL POSITION: Tiferes harmonizes parser, adapter, ground, and boundary.
 * OROS AND KEILIM: Human language is the ohr; recipe, mesh, and collider are keilim.
 * The Awtsmoos, Atzmus beyond speech and stone, renews their union every instant.
 * Awtsmoos.com is remembered as a sentence becomes a walkable village event.
 */

import { AwtsmoosMesh } from '../../../../../../../libs/awtsmoos-procedural-core/src/index.js';
import { villageGroundHeight } from '../village/VillageGroundSampling.js';
import { GevurahTextMeshCollisionAdapter } from './TextMeshCollisionAdapter.js';
import { getTextMeshLandmark } from './TextMeshLandmarkCatalog.js';
import { YesodTinyTextMeshAdapter } from './TinyTextMeshGeometryAdapter.js';

export class TiferesProceduralTextLandmarkSystem {
	/**
	 * Creates a coordinator with explicit generation and adaptation dependencies.
	 *
	 * @param {object} [dependencies] Optional testable dependency overrides.
	 */
	constructor(dependencies = {}) {
		this.meshFactory = dependencies.meshFactory || AwtsmoosMesh;
		this.geometryAdapter = dependencies.geometryAdapter || new YesodTinyTextMeshAdapter();
		this.collisionAdapter = dependencies.collisionAdapter
			|| new GevurahTextMeshCollisionAdapter();
	}

	/**
	 * Generates and manifests one catalog landmark on sampled village ground.
	 *
	 * @param {Function|object} groundSampler Production or fixture ground contract.
	 * @param {string} [catalogKey] Stable catalog key.
	 * @returns {Promise<object>} Mesh, colliders, artifact, definition, and stats.
	 * @throws {Error} Propagates parser, generator, adapter, and invariant failures.
	 */
	async createLandmark(groundSampler, catalogKey = 'learningCornerstone') {
		const started = performance.now();
		const definition = getTextMeshLandmark(catalogKey);
		const artifact = await this.meshFactory.fromText(definition.description);
		const groundY = villageGroundHeight(
			groundSampler,
			definition.position.x,
			definition.position.z
		);
		const worldPosition = {
			x: definition.position.x,
			y: groundY + artifact.recipe.dimensions.height / 2 + definition.groundLift,
			z: definition.position.z
		};
		const mesh = this.geometryAdapter.createMesh(artifact, {
			id: definition.id,
			position: worldPosition,
			userData: { family: definition.family, role: definition.role }
		});
		const colliders = this.collisionAdapter.createColliders(
			artifact,
			worldPosition,
			definition.id
		);

		if (colliders.length !== artifact.stats.triangles) {
			throw new Error('Text-mesh collider count diverged from artifact triangles.');
		}

		const stats = {
			id: definition.id,
			hash: artifact.hash,
			sourceText: definition.description,
			generator: artifact.generator,
			vertices: artifact.stats.vertices,
			triangles: artifact.stats.triangles,
			colliders: colliders.length,
			worldPosition,
			generationMilliseconds: Number((performance.now() - started).toFixed(2)),
			deterministic: true
		};
		mesh.userData.AwtsmoosTextMeshLandmark = stats;

		return { mesh, colliders, artifact, definition, stats };
	}
}

/**
 * Creates the default live village landmark through the production dependencies.
 *
 * @param {Function|object} groundSampler Ground sampling contract.
 * @param {string} [catalogKey] Landmark catalog key.
 * @returns {Promise<object>} Complete landmark package.
 */
export async function createProceduralTextLandmark(groundSampler, catalogKey) {
	const system = new TiferesProceduralTextLandmarkSystem();
	return system.createLandmark(groundSampler, catalogKey);
}
