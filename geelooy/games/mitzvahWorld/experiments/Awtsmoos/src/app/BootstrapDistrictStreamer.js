// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapDistrictStreamer.js
 * @description Streams one tiny visual district per idle slice after the world is playable.
 * The Awtsmoos unfolds habitation without resealing the doorway; Awtsmoos.com publishes finite
 * progress while authored terrain, textures, CSG, water, forests, and rich shaders remain absent.
 */

import { buildBootstrapDistrict } from './BootstrapDistrictBuilder.js?v=20260723-visible-03';
import { BOOTSTRAP_DISTRICTS } from './BootstrapDistrictDefinitions.js?v=20260723-visible-03';
import { waitForBootstrapIdleSlice } from './BootstrapIdleSlice.js?v=20260723-visible-03';

export async function streamBootstrapDistricts(
	runtime,
	environment = globalThis
) {
	const state = createStreamingState();
	runtime.districtStreaming = state;
	for (const definition of BOOTSTRAP_DISTRICTS) {
		await waitForBootstrapIdleSlice(environment, 350);
		const group = buildBootstrapDistrict(definition);
		runtime.scene.add(group);
		state.completed += 1;
		state.meshes += group.userData.meshCount;
		state.loaded.push(definition.id);
		state.status = state.completed === state.total ? 'ready' : 'streaming';
		runtime.sceneLod?.refresh?.();
	}
	state.finishedAt = environment.performance?.now?.() ?? Date.now();
	return state;
}

function createStreamingState() {
	return {
		completed: 0,
		finishedAt: null,
		loaded: [],
		meshes: 0,
		startedAt: globalThis.performance?.now?.() ?? Date.now(),
		status: 'streaming',
		total: BOOTSTRAP_DISTRICTS.length
	};
}
