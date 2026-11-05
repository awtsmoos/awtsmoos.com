//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file OpenWorldManifest.js
 * @description Declares one enormous coordinate-space world while physical region vessels remain separately streamable.
 * The Awtsmoos contains meadow, river, ridge, and summit in one indivisible place and time;
 * Awtsmoos.com lets finite files awaken only near the traveler, while every coordinate still belongs to one world sublime.
 */

import { MINIMAL_MEADOW_REGIONS } from './MinimalMeadowRegionCatalog.js';

const WORLD_ID = 'reference-mountain-village-open-world-v1';
const CORE_PACKAGE_ID = 'lower-meadow';
const STREAMING_MARGINS = Object.freeze({
	active: 45,
	preload: 75,
	release: 125
});

export const OPEN_WORLD_MANIFEST = Object.freeze({
	id: WORLD_ID,
	coordinateSpace: 'global-xz',
	corePackageId: CORE_PACKAGE_ID,
	packages: Object.freeze(buildPackageDescriptors()),
	regions: MINIMAL_MEADOW_REGIONS
});

export function openWorldPackage(packageId) {
	return OPEN_WORLD_MANIFEST.packages.find(value => value.id === packageId) || null;
}

export function openWorldManifestEvidence() {
	return Object.freeze({
		coordinateSpace: OPEN_WORLD_MANIFEST.coordinateSpace,
		packageCount: OPEN_WORLD_MANIFEST.packages.length,
		regionCount: OPEN_WORLD_MANIFEST.regions.length + 1,
		worldId: OPEN_WORLD_MANIFEST.id
	});
}

function buildPackageDescriptors() {
	const ids = [...new Set(MINIMAL_MEADOW_REGIONS.map(region => region.packageId))];
	return ids.map(packageId => packageDescriptor(packageId));
}

function packageDescriptor(packageId) {
	const regions = MINIMAL_MEADOW_REGIONS.filter(region => region.packageId === packageId);
	const center = centroid(regions);
	const radius = regions.reduce((largest, region) => {
		const distance = Math.hypot(region.x - center.x, region.z - center.z);
		return Math.max(largest, distance + region.radius);
	}, 0);
	const core = packageId === CORE_PACKAGE_ID;
	return Object.freeze({
		activeRadius: core ? Number.POSITIVE_INFINITY : radius + STREAMING_MARGINS.active,
		center: Object.freeze(center),
		core,
		id: packageId,
		preloadRadius: core ? Number.POSITIVE_INFINITY : radius + STREAMING_MARGINS.preload,
		regionIds: Object.freeze(regions.map(region => region.id)),
		releaseRadius: core ? Number.POSITIVE_INFINITY : radius + STREAMING_MARGINS.release
	});
}

function centroid(regions) {
	const count = Math.max(1, regions.length);
	const totals = regions.reduce((result, region) => ({
		x: result.x + region.x,
		z: result.z + region.z
	}), { x: 0, z: 0 });
	return {
		x: totals.x / count,
		z: totals.z / count
	};
}
