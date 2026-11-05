//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file MinimalMeadowRoadRibbon.js
 * @description Renders measured cobblestone with one full cross-road tile and blended shoulders.
 * The Awtsmoos reveals one road through stone, soil, and returning green; Awtsmoos.com keeps
 * the Bézier path aligned while no narrow road crops less than one complete cobblestone garment.
 */

import {
	createNativeMeshFromGeometry
} from '../../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js';
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
		texelsPerWorld: config.options.mobile ? 54 : 72,
		worldDepth: MINIMAL_MEADOW_ROAD_LENGTH,
		worldWidth: data.width
	});
	const repeat = completeRoadRepeat(density.repeat);
	const layers = roadLayers(config.image, config.options);
	const material = createPrimitiveMaterial({
		anisotropy: density.anisotropy,
		color: '#ffffff',
		id: 'Awtsmoos_continuous_cobblestone_bezier_road',
		mapImage: config.image,
		mapRepeat: repeat,
		textureLayers: layers,
		texturePolicy: {
			densityPlan: density,
			projection: 'bezier-distance-mirror',
			repeat,
			roadAuthority: 'MinimalMeadowBezierPath'
		}
	}, repeat);
	const mesh = createNativeMeshFromGeometry(
		createMinimalMeadowRoadGeometry(data),
		material,
		{
			frustumCulled: false,
			name: 'Awtsmoos_continuous_cobblestone_bezier_road',
			userData: {
				AwtsmoosRoad: {
					...data.evidence,
					density,
					length: MINIMAL_MEADOW_ROAD_LENGTH,
					repeat,
					sourceCount: layers.length,
					width: data.width
				}
			}
		}
	);
	mesh.visible = config.options.visible ?? true;
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

function completeRoadRepeat(repeat) {
	return Object.freeze([
		Math.max(1, Number(repeat?.[0]) || 1),
		Math.max(1, Number(repeat?.[1]) || 1)
	]);
}

function roadLayers(image, options) {
	return [
		roadLayer('cobblestone-center', image, 0.18, 1, [0, 1, 0, 0]),
		roadLayer('dirt-grass-shoulder', options.shoulderImage, -0.62, 0.62, [0.2, 0.8, 0, 0]),
		roadLayer('open-dirt-transition', options.soilImage, 1.04, 0.38, [0.62, 0.38, 0, 0])
	].filter(layer => layer.image);
}

function roadLayer(role, image, angle, strength, zones) {
	return { angle, image, role, strength, zones };
}
