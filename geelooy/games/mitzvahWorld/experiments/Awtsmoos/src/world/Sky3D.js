// B"H
import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { TEXTURE_URLS } from '../assets/TextureCatalog.js';
import { createSkyDome } from './sky/SkyDome.js';
import {
	createSkyDisc,
	createSkyQuad,
	createSkyRay
} from './sky/SkyMeshFactory.js';

const SUN_POSITION = Object.freeze([-96, 84, -150]);
const CLOUD_COLOR = Object.freeze([0.78, 0.86, 0.96, 0.22]);
const RAY_COLOR = Object.freeze([1, 0.88, 0.46, 0.14]);

/**
 * Builds the golden-hour atmospheric layer from cache-bound public materials.
 * The sky is a living ceiling: water lends its blue depth, gold lends the sun its fire.
 */
export function createSky3D() {
	const group = new Group();
	group.name = 'Awtsmoos_hyper_real_sun_sky_clouds_fast';
	group.add(createSkyDome(TEXTURE_URLS.water.bright));
	group.add(createHorizonHaze());
	group.add(createSkyDisc(
		'sun-white-hot-core',
		SUN_POSITION,
		5.5,
		[1, 0.96, 0.82, 1],
		TEXTURE_URLS.metals.gold2
	));
	group.add(createSkyDisc(
		'sun-golden-bloom-fresnel',
		SUN_POSITION,
		15,
		[1, 0.68, 0.16, 0.32],
		TEXTURE_URLS.metals.gold2
	));
	for (let index = 0; index < 9; index += 1) group.add(createSunRay(index));
	for (let index = 0; index < 16; index += 1) group.add(createCloudBand(index));
	group.userData.AwtsmoosSky = {
		sun: SUN_POSITION,
		style: 'gradient-atmosphere-haze-cloud-lens-cache-bound',
		cloudTextureProxy: TEXTURE_URLS.water.bright,
		shaderPolicy: 'sun-position-driven-gradient-with-transparent-cloud-planes'
	};
	return group;
}

function createHorizonHaze() {
	return createSkyQuad(
		'blue_gold_horizon_haze_not_white',
		[0, 4, -175],
		[540, 92],
		[0.58, 0.72, 0.92, 0.22],
		TEXTURE_URLS.water.bright
	);
}

function createSunRay(index) {
	const angle = index / 9 * Math.PI * 2;
	const length = index % 2 ? 72 : 106;
	const width = index % 2 ? 5.8 : 8.5;
	return createSkyRay(
		`sun_lens_ray_${index}`,
		SUN_POSITION,
		angle,
		length,
		width,
		RAY_COLOR,
		TEXTURE_URLS.metals.gold2
	);
}

function createCloudBand(index) {
	return createSkyQuad(
		`soft_cloud_layer_${index}`,
		[
			-180 + index * 24,
			48 + Math.sin(index * 1.7) * 10,
			-120 - (index % 5) * 16
		],
		[28 + (index % 4) * 12, 7 + (index % 3) * 4],
		CLOUD_COLOR,
		TEXTURE_URLS.water.bright
	);
}
