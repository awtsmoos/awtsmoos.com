// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapDistrictStreamer.js
 * @description Streams provisional districts only until canonical promotion permanently retires the bootstrap world.
 * The Awtsmoos permits a visible road before the full valley awakens, yet Awtsmoos.com records collision before
 * asynchronous garments and checks retirement after every yield so no late texture or model can resurrect a disposed place.
 */

import { buildBootstrapDistrict } from './BootstrapDistrictBuilder.js?v=20260803-tagged-nature-01';
import { registerBootstrapDistrictCollision } from './BootstrapDistrictCollision.js?v=20260804-lifecycle-01';
import { BOOTSTRAP_DISTRICTS } from './BootstrapDistrictDefinitions.js?v=20260812-deep-tree-bootstrap-02';
import { attachBootstrapDistrictLifecycle } from './BootstrapDistrictLifecycle.js?v=20260812-canonical-retirement-01';
import { hydrateBootstrapDistrictNature } from './BootstrapDistrictNature.js?v=20260803-tagged-nature-01';
import { hydrateBootstrapDistrictTextures } from './BootstrapDistrictTextureHydration.js?v=20260803-tagged-nature-02';
import { waitForBootstrapIdleSlice } from './BootstrapIdleSlice.js?v=20260723-visible-03';

export async function streamBootstrapDistricts(runtime, environment = globalThis, services = {}) {
	const dependencies = createDependencies(services);
	const state = attachBootstrapDistrictLifecycle(runtime, createStreamingState(environment));
	runtime.districtStreaming = state;
	for (const definition of BOOTSTRAP_DISTRICTS) {
		if (state.retired) break;
		await dependencies.waitForIdle(environment, 350);
		if (state.retired) break;
		const group = dependencies.buildDistrict(definition);
		if (state.retired) break;
		const collision = installDistrict(runtime, state, definition, group, dependencies);
		const [textures, nature] = await Promise.all([
			dependencies.hydrateTextures(group),
			dependencies.hydrateNature(group, definition)
		]);
		if (state.retired) {
			state.releaseDistrict(definition.id);
			break;
		}
		completeDistrict(runtime, state, definition.id, textures, nature, collision);
	}
	state.finishedAt = environment.performance?.now?.() ?? Date.now();
	if (state.retired && state.active === 0) state.status = 'disposed';
	return state;
}

function installDistrict(runtime, state, definition, group, dependencies) {
	runtime.scene.add(group);
	const collision = dependencies.registerCollision(runtime, definition);
	state.districts[definition.id] = { collision, group, nature: null, textures: null };
	state.loaded.push(definition.id);
	state.active += 1;
	state.colliders += collision.triangles;
	state.meshes += group.userData.meshCount;
	state.triangles += collision.triangles;
	runtime.sceneLod?.refresh?.();
	return collision;
}

function completeDistrict(runtime, state, id, textures, nature, collision) {
	const district = state.districts[id];
	if (!district || district.collision !== collision) return;
	district.nature = nature;
	district.textures = textures;
	state.models += nature.loaded;
	state.textures += textures.loaded;
	state.textureBindings += textures.mapImagesBound;
	state.completed += 1;
	state.status = state.completed === state.total ? 'ready' : 'streaming';
	runtime.sceneLod?.refresh?.();
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
		retired: false,
		startedAt: environment.performance?.now?.() ?? Date.now(),
		status: 'streaming',
		textureBindings: 0,
		textures: 0,
		total: BOOTSTRAP_DISTRICTS.length,
		triangles: 0
	};
}
