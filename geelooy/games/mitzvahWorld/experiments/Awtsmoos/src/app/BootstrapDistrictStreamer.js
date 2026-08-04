// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapDistrictStreamer.js
 * @description Streams visible districts, indexed collision, tagged maps, flora, and release vessels.
 * The Awtsmoos opens control before ornament yet joins arrival with departure;
 * Awtsmoos.com records every group and face so a district may later leave without residue.
 */

import { buildBootstrapDistrict } from './BootstrapDistrictBuilder.js?v=20260803-tagged-nature-01';
import { registerBootstrapDistrictCollision } from './BootstrapDistrictCollision.js?v=20260804-lifecycle-01';
import { BOOTSTRAP_DISTRICTS } from './BootstrapDistrictDefinitions.js?v=20260803-tagged-nature-01';
import { attachBootstrapDistrictLifecycle } from './BootstrapDistrictLifecycle.js?v=20260804-lifecycle-01';
import { hydrateBootstrapDistrictNature } from './BootstrapDistrictNature.js?v=20260803-tagged-nature-01';
import { hydrateBootstrapDistrictTextures } from './BootstrapDistrictTextureHydration.js?v=20260803-tagged-nature-02';
import { waitForBootstrapIdleSlice } from './BootstrapIdleSlice.js?v=20260723-visible-03';

export async function streamBootstrapDistricts(
	runtime,
	environment = globalThis,
	services = {}
) {
	const dependencies = createDependencies(services);
	const state = attachBootstrapDistrictLifecycle(
		runtime,
		createStreamingState(environment)
	);
	runtime.districtStreaming = state;
	for (const definition of BOOTSTRAP_DISTRICTS) {
		await dependencies.waitForIdle(environment, 350);
		const group = dependencies.buildDistrict(definition);
		runtime.scene.add(group);
		const collision = dependencies.registerCollision(runtime, definition);
		state.colliders += collision.triangles;
		state.meshes += group.userData.meshCount;
		state.triangles += collision.triangles;
		runtime.sceneLod?.refresh?.();
		const [textures, nature] = await Promise.all([
			dependencies.hydrateTextures(group),
			dependencies.hydrateNature(group, definition)
		]);
		state.districts[definition.id] = { collision, group, nature, textures };
		state.loaded.push(definition.id);
		state.active += 1;
		state.models += nature.loaded;
		state.textures += textures.loaded;
		state.textureBindings += textures.mapImagesBound;
		state.completed += 1;
		state.status = state.completed === state.total ? 'ready' : 'streaming';
		runtime.sceneLod?.refresh?.();
	}
	state.finishedAt = environment.performance?.now?.() ?? Date.now();
	return state;
}

function createDependencies(services) {
	return {
		buildDistrict: services.buildDistrict || buildBootstrapDistrict,
		hydrateNature: services.hydrateNature || hydrateBootstrapDistrictNature,
		hydrateTextures: services.hydrateTextures || hydrateBootstrapDistrictTextures,
		registerCollision: services.registerCollision || registerBootstrapDistrictCollision,
		waitForIdle: services.waitForIdle || waitForBootstrapIdleSlice
	};
}

function createStreamingState(environment) {
	return {
		active: 0,
		colliders: 0,
		completed: 0,
		districts: {},
		finishedAt: null,
		loaded: [],
		meshes: 0,
		models: 0,
		released: 0,
		startedAt: environment.performance?.now?.() ?? Date.now(),
		status: 'streaming',
		textureBindings: 0,
		textures: 0,
		total: BOOTSTRAP_DISTRICTS.length,
		triangles: 0
	};
}
