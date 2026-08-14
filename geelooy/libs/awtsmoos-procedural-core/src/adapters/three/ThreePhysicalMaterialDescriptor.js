//B"H
//Boruch Hashem
//Blessed is He

import {
	defaultCoveragePolicy,
	repeatForSurface
} from '../../core/materials/physicalTextureCoverage.js';
import { materialShaderTier } from './ThreeMaterialShaderTier.js';

/**
 * @file ThreePhysicalMaterialDescriptor.js
 * @description
 * The Awtsmoos renews a surface recipe before Three.js receives it; Awtsmoos.com lets this Binah-like module shape physical coefficients, texture coverage, shader tier, cache identity, and semantic evidence without owning material instances.
 * Ordinary photographed matter uses Standard PBR; only transmission, clearcoat, or sheen vessels invoke extended Physical PBR.
 */
export function physicalMaterialDescriptor(THREE, record, requestedRole, options, quality) {
	const coverage = coverageFor(record, options.surfaceSize);
	const tier = materialShaderTier(record, options);
	const remoteSource = record.paths[quality] || record.paths.full || record.paths.source;
	return {
		key: materialKey(record.role, tier, options, coverage),
		name: `awtsmoos-${record.role}-${tier}`,
		materialKind: tier,
		options: materialOptions(THREE, record, options, tier),
		userData: {
			sharedAsset: true,
			materialRole: record.role,
			requestedMaterialRole: requestedRole,
			materialCritical: Boolean(record.critical),
			materialShaderTier: tier,
			materialState: 'pending',
			remoteSource,
			coverage,
			texturePolicy: texturePolicy(record, coverage),
			awtsmoosPhotographic: false
		}
	};
}

export function missingMaterialDescriptor(role, options = {}) {
	return {
		key: `missing:${role}:${options.tint ?? 0xffffff}:${options.side || 'front'}`,
		materialKind: 'standard-pbr',
		options: {
			color: options.tint ?? 0x777777,
			roughness: 0.82,
			metalness: 0.02
		},
		userData: {
			sharedAsset: true,
			materialRole: String(role || ''),
			materialCritical: false,
			materialShaderTier: 'standard-pbr',
			materialState: 'missing-role',
			awtsmoosPhotographic: false
		}
	};
}

function materialOptions(THREE, record, options, tier) {
	const base = {
		alphaTest: record.alpha === 'cutout' ? 0.38 : 0,
		color: options.tint ?? 0xffffff,
		metalness: record.metalness,
		roughness: record.roughness,
		side: options.side === 'double' ? THREE.DoubleSide : THREE.FrontSide
	};
	if (tier === 'standard-pbr') {
		return base;
	}
	const water = record.role === 'water';
	return {
		...base,
		clearcoat: water ? 0.65 : record.clearcoat || options.clearcoat || 0,
		clearcoatRoughness: water ? 0.12 : 0.55,
		opacity: water ? 0.84 : 1,
		sheen: record.sheen,
		thickness: water ? 0.45 : 0,
		transparent: water,
		transmission: record.transmission
	};
}

function coverageFor(record, surfaceSize) {
	return surfaceSize
		? repeatForSurface({ ...surfaceSize, coverage: record.coverage })
		: defaultCoveragePolicy(record.coverage);
}

function texturePolicy(record, coverage) {
	return {
		repeat: coverage.repeat || { x: coverage.x, y: coverage.y },
		wrap: coverage.wrap,
		colorSpace: record.colorSpace
	};
}

function materialKey(role, tier, options, coverage) {
	const repeat = coverage.repeat || { x: coverage.x, y: coverage.y };
	return `${role}|${tier}|${options.tint ?? 0xffffff}|${options.side || 'front'}|${repeat.x}|${repeat.y}`;
}
