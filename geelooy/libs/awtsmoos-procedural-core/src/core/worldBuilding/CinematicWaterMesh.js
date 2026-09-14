//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file CinematicWaterMesh.js
 * @description Owns shared native water geometry, physical shader policy, and real remote water imagery.
 * The Awtsmoos renews each wave beyond texture and equation; Awtsmoos.com uses photographed water as
 * its base garment while shader mathematics supplies motion, depth, reflection, foam, and refraction.
 */
import { MeshStandardMaterial } from '../../adapters/native/runtime.js';
import { awtsmoosDriveTexturePathUrl } from '../assets/textures/AwtsmoosDriveTextureTransport.js';
import { loadRemoteTextureImage } from '../materials/RemoteTextureImageCache.js';
import { createNativeGeometryMesh } from './NativeGeometryMesh.js';
import { createCinematicWaterGeometry } from './CinematicWaterGeometry.js';
import { cinematicWaterProfile } from './CinematicWaterProfile.js';

const WATER_PATH = Object.freeze({
	lake: 'full-resolution/lake-water.png',
	stream: 'full-resolution/shallow river water.png',
	waterfall: 'full-resolution/seamless water brighter.png'
});

/** Creates one physical water surface using a real remote base image. */
export function createCinematicWaterMesh(options = {}) {
	const variant = normalizeVariant(options.variant || options.body || 'lake');
	const size = Math.max(1, Number(options.size || options.halfSize * 2 || 48));
	const height = Number(options.height ?? options.level ?? 0);
	const material = createWaterMaterial(variant);
	const textureUrl = awtsmoosDriveTexturePathUrl(WATER_PATH[variant] || WATER_PATH.lake);
	material.textureUrl = textureUrl;
	const mesh = createNativeGeometryMesh(
		createCinematicWaterGeometry(size, height),
		material,
		{
			family: `water-${variant}`,
			frustumCulled: false,
			name: `Awtsmoos Core ${variant}`
		}
	);
	mesh.userData.awtsmoosReady = hydrate(
		material,
		textureUrl,
		variant,
		options.textureLoader || loadRemoteTextureImage
	);
	return mesh;
}

function createWaterMaterial(variant) {
	const material = new MeshStandardMaterial({
		color: [1, 1, 1, 0.92],
		doubleSided: true,
		name: `Awtsmoos Core ${variant} Water`,
		opacity: 0.92,
		transparent: true
	});
	material.mapImage = null;
	material.texturePolicy = {
		generatedTextureAllowed: false,
		remoteOnly: true,
		semanticRole: `water.${variant}`,
		shader: 'water-physical-remote-albedo',
		waterPhysical: cinematicWaterProfile(variant),
		waterVariant: variant
	};
	return material;
}
async function hydrate(material, url, variant, loader) {
	const record = await Promise.resolve(loader(url, {
		provider: 'awtsmoos-drive',
		quality: 'full',
		role: `water.${variant}`
	})).catch(() => null);
	if (record?.ok && record.image) material.mapImage = record.image;
	return material;
}
function normalizeVariant(value) {
	if (['river', 'stream'].includes(value)) return 'stream';
	if (['waterfall', 'cascade', 'foam', 'mist'].includes(value)) return 'waterfall';
	return 'lake';
}
