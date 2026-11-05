// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlatformShowcaseScene.js
 * @description Places generated assets, all 113 plants, public water, and collision in the live world.
 */
import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import {
	loadPublicMaterialImage,
	serializableImageRecord
} from '../../assets/PublicMaterialImageLoader.js';
import { generateWorldAssets } from '../proceduralApi/index.js';
import { GevurahTextMeshCollisionAdapter } from '../proceduralText/TextMeshCollisionAdapter.js';
import { YesodTinyTextMeshAdapter } from '../proceduralText/TinyTextMeshGeometryAdapter.js';
import { createCompleteBotanicalGarden } from './CompleteBotanicalGarden.js';
import { platformPartStyle, platformTerrainStyle } from './PlatformMaterialPalette.js';
import { countPlatformMeshes, platformGroundPosition } from './PlatformSceneUtilities.js';
import { platformShowcaseRecipes } from './PlatformShowcaseRecipes.js';
import { createTinyWorldMesh, createTinyWorldPartGroup } from './TinyWorldGeometryAdapter.js';
import { insertWorldGeometryColliders } from './WorldGeometryCollisionAdapter.js';

export async function createPlatformShowcase(runtime) {
	const assets = await generateWorldAssets(platformShowcaseRecipes());
	const byId = Object.fromEntries(assets.map(asset => [asset.id, asset]));
	const waterShader = byId['platform-water-shader'].artifact;
	const textureRecord = await loadPublicMaterialImage(
		waterShader.material.textures.albedo,
		4500
	);
	const group = new Group();
	group.name = 'AwtsmoosExtremePlatformShowcase';
	const collisions = [];
	addTerrain(group, runtime, byId['platform-voxel-hill'].artifact, collisions);
	addRiver(group, runtime, byId['platform-river'].artifact, textureRecord, collisions);
	addWell(group, runtime, byId['platform-well'].artifact, textureRecord, collisions);
	const garden = addGarden(group, runtime);
	addTextLandmark(group, runtime, byId['platform-language-landmark'].artifact, collisions);
	group.userData.platformShowcase = true;
	group.setBaseTransform();
	runtime.scene.add(group);
	const diagnostics = {
		algorithm: byId['platform-voxel-hill'].artifact.algorithm,
		assets: assets.map(asset => asset.id),
		botanicalSpecies: garden.stats.species,
		botanicalTriangles: garden.stats.triangles,
		colliders: collisions.reduce((sum, record) => sum + record.inserted, 0),
		firebaseWater: serializableImageRecord(textureRecord),
		meshes: countPlatformMeshes(group),
		waterShader: {
			exposed: /fresnel/i.test(waterShader.fragmentShader),
			renderedByTinyCustomShader: false,
			uniforms: waterShader.uniforms
		}
	};
	group.userData.diagnostics = diagnostics;
	return { assets, diagnostics, garden, group };
}

function addTerrain(group, runtime, artifact, collisions) {
	const position = platformGroundPosition(runtime, -10, -9, 2.1);
	group.add(createTinyWorldMesh(artifact.geometry, {
		...platformTerrainStyle(), name: 'platform_voxel_hill', position
	}));
	collisions.push(insertWorldGeometryColliders(runtime.mainOctree, artifact.geometry, position, {
		kind: 'platform:voxel-hill'
	}));
}

function addRiver(group, runtime, artifact, textureRecord, collisions) {
	const position = platformGroundPosition(runtime, 0, -11, 0.18);
	group.add(createTinyWorldPartGroup(artifact.parts, {
		name: 'platform_river', position,
		styleFor: part => platformPartStyle(part, textureRecord)
	}));
	const banks = artifact.parts.find(part => part.role === 'river-banks');
	collisions.push(insertWorldGeometryColliders(runtime.mainOctree, banks, position, {
		kind: 'platform:river-banks'
	}));
}

function addWell(group, runtime, artifact, textureRecord, collisions) {
	const position = platformGroundPosition(runtime, 9, -6, 0);
	group.add(createTinyWorldPartGroup(artifact.parts, {
		name: 'platform_well', position,
		styleFor: part => platformPartStyle(part, textureRecord)
	}));
	for (const part of artifact.parts.filter(item => item.role !== 'well-water')) {
		collisions.push(insertWorldGeometryColliders(runtime.mainOctree, part, position, {
			kind: `platform:${part.role}`
		}));
	}
}

function addGarden(group, runtime) {
	const garden = createCompleteBotanicalGarden({ quality: 'low', scale: 0.9, seed: 613 });
	group.add(createTinyWorldMesh(garden.geometry, {
		color: '#ffffff', name: 'platform_complete_botanical_garden',
		position: platformGroundPosition(runtime, 0, -25, 0), roughness: 0.88
	}));
	return garden;
}

function addTextLandmark(group, runtime, artifact, collisions) {
	const position = platformGroundPosition(runtime, 0, -3, artifact.recipe.dimensions.height / 2);
	group.add(new YesodTinyTextMeshAdapter().createMesh(artifact, {
		id: 'platform_language_landmark', position
	}));
	const colliders = new GevurahTextMeshCollisionAdapter().createColliders(
		artifact, position, 'platform:language-landmark'
	);
	let inserted = 0;
	for (const collider of colliders) if (runtime.mainOctree.insert(collider)) inserted += 1;
	collisions.push({ created: colliders.length, inserted, kind: 'platform:language-landmark' });
}
