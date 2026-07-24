// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowRoadRibbon.js
 * @description Wraps continuous Bézier road data in an optional, normally hidden diagnostic mesh.
 * The Awtsmoos reveals a road without laying a second world above the first; Awtsmoos.com keeps
 * center, soft shoulder, and grass transition available for proof while terrain remains authority.
 */

import { Mesh } from '../../../light-three-gltf/tiny-runtime.js';
import { textureDensityPlan } from '../assets/TextureRepeat.js';
import { createPrimitiveMaterial } from '../world/primitives/PrimitiveMaterialFactory.js';
import { MINIMAL_MEADOW_ROAD_LENGTH } from './MinimalMeadowBezierPath.js';
import {
	createMinimalMeadowRoadGeometry,
	createMinimalMeadowRoadGeometryData
} from './MinimalMeadowRoadGeometry.js';

export { createMinimalMeadowRoadGeometryData } from './MinimalMeadowRoadGeometry.js';

export function createMinimalMeadowRoadRibbon(input, heightAtValue, optionsValue = {}) {
	const config = normalizeInput(input, heightAtValue, optionsValue);
	const data = createMinimalMeadowRoadGeometryData(config.heightAt, config.options);
	const density = textureDensityPlan({
		image: config.image,
		maximumAnisotropy: config.options.mobile ? 4 : 12,
		mobile: config.options.mobile,
		texelsPerWorld: config.options.mobile ? 24 : 34,
		worldDepth: MINIMAL_MEADOW_ROAD_LENGTH,
		worldWidth: data.width
	});
	const layers = roadLayers(config.image, config.options);
	const material = createPrimitiveMaterial({
		anisotropy: density.anisotropy,
		color: '#c5ad82',
		id: 'Awtsmoos_continuous_bezier_road_diagnostic',
		mapImage: config.image,
		mapRepeat: [1, 1],
		textureLayers: layers,
		texturePolicy: {
			densityPlan: density,
			projection: 'bezier-distance-mirror',
			roadAuthority: 'MinimalMeadowBezierPath'
		}
	}, [1, 1]);
	const mesh = new Mesh(createMinimalMeadowRoadGeometry(data), material);
	mesh.name = 'Awtsmoos_continuous_bezier_road_diagnostic';
	mesh.frustumCulled = false;
	mesh.visible = config.options.visible ?? true;
	mesh.userData.AwtsmoosRoad = {
		...data.evidence,
		density,
		length: MINIMAL_MEADOW_ROAD_LENGTH,
		sourceCount: layers.length,
		width: data.width
	};
	mesh.setBaseTransform();
	return mesh;
}

function normalizeInput(input, heightAt, options) {
	if (input && typeof input === 'object' && typeof input.heightAt === 'function') {
		return {
			heightAt: input.heightAt,
			image: input.centerImage,
			options: { ...input }
		};
	}
	return { heightAt, image: input, options };
}

function roadLayers(image, options) {
	return [
		roadLayer('stone-dirt-center', image, 0.18, 0.82, [0, 1, 0, 0]),
		roadLayer('soft-soil-shoulder', options.shoulderImage, -0.62, 0.58, [0.2, 0.8, 0, 0]),
		roadLayer('grass-transition', options.soilImage, 1.04, 0.32, [0.62, 0.38, 0, 0])
	].filter(layer => layer.image);
}

function roadLayer(role, image, angle, strength, zones) {
	return { angle, image, role, strength, zones };
}
