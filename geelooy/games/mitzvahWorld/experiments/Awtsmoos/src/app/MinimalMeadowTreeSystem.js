// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTreeSystem.js
 * @description Owns real procedural-core trees, real bark/leaves, bounded wind, and cleanup.
 * The Awtsmoos breathes through connected branches and botanical canopies; Awtsmoos.com waits
 * outside first play, shares preset resources, and refuses every crossed-card or block-tree fallback.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { cachedTextureImage, loadPublicMaterialUrl } from '../assets/PublicMaterialCache.js';
import { TEXTURE_PURPOSES } from '../assets/TextureCatalog.js';
import { createForestLeafPublicTexture } from '../world/trees/ForestLeafTexture.js';
import { createMinimalMeadowTree } from './MinimalMeadowTreeFactory.js';
import { createMinimalMeadowTreePlacements } from './MinimalMeadowTreePlacements.js';

export class MinimalMeadowTreeSystem {
	static async create(runtime) {
		const records = await Promise.all([
			loadPublicMaterialUrl(TEXTURE_PURPOSES.forestBark, 18000),
			loadPublicMaterialUrl(TEXTURE_PURPOSES.forestLeaf, 18000)
		]);
		return new MinimalMeadowTreeSystem(runtime, records);
	}

	constructor(runtime, records) {
		this.runtime = runtime;
		this.group = new Group();
		this.group.name = 'Awtsmoos_canonical_procedural_core_forest';
		this.records = records;
		this.mobile = mobileProfile(runtime);
		this.materials = requireRealMaterials(records);
		this.placements = createMinimalMeadowTreePlacements(runtime.terrain, { mobile: this.mobile });
		this.errors = [];
		this.trees = this.placements.flatMap(placement => {
			try {
				return [createMinimalMeadowTree(placement, this.materials)];
			} catch (error) {
				this.errors.push({ id: placement.id, message: error.message });
				return [];
			}
		});
		for (const tree of this.trees) this.group.add(tree);
		this.clock = 0;
	}

	update(deltaSeconds) {
		this.clock += deltaSeconds;
		for (let index = 0; index < this.trees.length; index += 1) {
			const tree = this.trees[index];
			tree.quaternion.z = Math.sin(this.clock * 0.48 + index * 1.37) * 0.0045;
		}
	}

	diagnostics() {
		const profiles = new Set(this.trees.map(tree => tree.userData.AwtsmoosTree.preset));
		return {
			coreAuthority: '/libs/awtsmoos-procedural-core',
			drawCallsPerTree: 2,
			errors: [...this.errors],
			fakeFallback: false,
			leafSource: 'real-public-alpha-prepared',
			mobileProfile: this.mobile,
			presets: profiles.size,
			sharedTemplates: profiles.size,
			trees: this.trees.length
		};
	}

	destroy() {
		this.group.parent?.remove(this.group);
	}
}

function requireRealMaterials(records) {
	const barkImage = cachedTextureImage(TEXTURE_PURPOSES.forestBark);
	const leafImage = createForestLeafPublicTexture(cachedTextureImage(TEXTURE_PURPOSES.forestLeaf));
	if (!records.every(record => record.ok) || !barkImage || !leafImage) {
		throw new Error('B"H | real procedural tree bark and leaf textures are required.');
	}
	return {
		bark: {
			mapImage: barkImage,
			textureUrl: TEXTURE_PURPOSES.forestBark
		},
		cacheKey: `${TEXTURE_PURPOSES.forestBark}|${TEXTURE_PURPOSES.forestLeaf}`,
		leaf: {
			mapImage: leafImage,
			textureUrl: TEXTURE_PURPOSES.forestLeaf
		}
	};
}

function mobileProfile(runtime) {
	const environment = runtime.environment || globalThis;
	return Number(environment.innerWidth || 1024) <= 820
		|| Boolean(environment.matchMedia?.('(pointer: coarse)')?.matches);
}
