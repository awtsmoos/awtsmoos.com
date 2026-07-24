// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTreeSystem.js
 * @description Owns core-authorized placements, real bark, alpha leaves, gentle wind, and cleanup.
 * The Awtsmoos breathes through finite leaves without turning trunks transparent; Awtsmoos.com
 * hydrates real textures, retains a safe leaf fallback, and spends only bounded tree transforms.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { cachedTextureImage, loadPublicMaterialUrl } from '../assets/PublicMaterialCache.js';
import { TEXTURE_PURPOSES } from '../assets/TextureCatalog.js';
import {
	createForestLeafPublicTexture,
	createForestLeafTexture
} from '../world/trees/ForestLeafTexture.js';
import { createMinimalMeadowTree } from './MinimalMeadowTreeFactory.js?v=20260724-meadow-21';
import { createMinimalMeadowTreePlacements } from './MinimalMeadowTreePlacements.js?v=20260724-meadow-21';

export class MinimalMeadowTreeSystem {
	static async create(runtime) {
		await Promise.all([
			loadPublicMaterialUrl(TEXTURE_PURPOSES.forestBark, 18000),
			loadPublicMaterialUrl(TEXTURE_PURPOSES.forestLeaf, 18000)
		]);
		return new MinimalMeadowTreeSystem(runtime);
	}

	constructor(runtime) {
		this.runtime = runtime;
		this.group = new Group();
		this.group.name = 'Awtsmoos_bounded_core_forest';
		this.publicLeafImage = cachedTextureImage(TEXTURE_PURPOSES.forestLeaf);
		this.materials = materials(this.publicLeafImage);
		this.placements = createMinimalMeadowTreePlacements(runtime.terrain);
		this.trees = this.placements.map(placement => createMinimalMeadowTree(placement, this.materials));
		for (const tree of this.trees) this.group.add(tree);
		this.clock = 0;
		this.publicLeafApplied = false;
	}

	update(deltaSeconds) {
		this.clock += deltaSeconds;
		for (let index = 0; index < this.trees.length; index += 1) {
			const tree = this.trees[index];
			const sway = Math.sin(this.clock * 0.62 + index * 1.7) * 0.008;
			tree.quaternion.z = sway;
		}
		this.hydratePublicLeaves();
	}

	hydratePublicLeaves() {
		if (this.publicLeafApplied || !this.publicLeafImage) return;
		const prepared = createForestLeafPublicTexture(this.publicLeafImage);
		if (!prepared) return;
		for (const tree of this.trees) tree.traverse(node => {
			if (node.userData?.part === 'alpha-cutout-leaf-crown') node.material.mapImage = prepared;
		});
		this.publicLeafApplied = true;
	}

	diagnostics() {
		return {
			alphaMode: 'MASK',
			barkOpaque: true,
			coreAuthority: 'awtsmoos-procedural-core',
			leafSource: this.publicLeafApplied ? 'public-alpha-prepared' : 'procedural-alpha-fallback',
			presets: new Set(this.placements.map(placement => placement.preset)).size,
			trees: this.trees.length
		};
	}

	destroy() {
		this.group.parent?.remove(this.group);
	}
}

function materials(publicLeafImage) {
	createForestLeafPublicTexture(publicLeafImage);
	return {
		bark: {
			color: '#6b4930',
			mapImage: cachedTextureImage(TEXTURE_PURPOSES.forestBark),
			mapRepeat: [2.5, 5.5],
			textureUrl: TEXTURE_PURPOSES.forestBark
		},
		leaf: {
			color: '#5f8d45',
			mapImage: createForestLeafTexture(),
			mapRepeat: [1, 1],
			textureUrl: TEXTURE_PURPOSES.forestLeaf
		}
	};
}
