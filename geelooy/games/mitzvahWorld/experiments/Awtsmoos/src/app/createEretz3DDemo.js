// B"H
import { createEretzActors } from './EretzActorSystem.js';
import { startEretzRuntime } from './EretzRuntimeLoop.js';
import { createEretzUi } from './EretzUiSystem.js';
import { installViewport } from './EretzViewport.js';
import { createEretzWorldFoundation } from './EretzWorldFoundation.js';
import { installWorldDiagnostics } from './WorldDiagnostics.js';

function exposeBootFailure(error, hosts) {
	const failure = {
		message: error?.message || String(error),
		stack: error?.stack || '',
		name: error?.name || 'Error',
		at: new Date().toISOString()
	};
	if (typeof window !== 'undefined') window.AwtsmoosBootError = failure;
	if (hosts?.hud) hosts.hud.textContent = `B"H world initialization failed: ${failure.message}`;
	console.error('B"H Mitzvah World initialization failed.', error);
	return failure;
}

/**
 * Opens the Eretz runtime as a sequence of measured covenants: static world,
 * living actors, UI, diagnostics, then one bounded dynamic frame loop.
 */
export async function createEretz3DDemo(hosts) {
	try {
		const foundation = await createEretzWorldFoundation(hosts);
		const actors = createEretzActors(foundation);
		const runtime = createEretzUi(actors);
		installViewport(runtime);
		const diagnostics = installWorldDiagnostics(runtime);
		const movement = startEretzRuntime(runtime, diagnostics);
		Object.assign(diagnostics, {
			player: runtime.player,
			model: runtime.model,
			npc: runtime.npc,
			lava: runtime.lava,
			shadows: runtime.shadows,
			mover: runtime.mover,
			bus: runtime.bus,
			actionBar: runtime.actionBar,
			npcHud: runtime.npcHud,
			inventoryPanel: runtime.inventoryPanel,
			equipment: runtime.equipment,
			octree: runtime.mover.octree,
			mainOctree: runtime.mainOctree,
			joystick: runtime.joystick,
			jumpButton: runtime.jumpButton,
			orbit: runtime.orbit,
			ground: runtime.ground,
			groundSampler: runtime.groundSampler,
			door: runtime.doors[0],
			houseDoors: runtime.doors.slice(1),
			houseDoor: runtime.doors[1],
			worldMode: runtime.worldMode,
			grassImage: runtime.grassImage,
			assets: runtime.assets,
			forest: runtime.terrain.forest,
			forestStats: runtime.terrain.forest.stats,
			lavaStats: runtime.lava.stats(),
			worldStats: runtime.worldMode.stats(),
			shadowStats: runtime.shadows.stats(),
			playerSource: runtime.playerGltf.scene.userData.isolatedModelLoad,
			npcSource: runtime.npcGltf.scene.userData.isolatedModelLoad,
			animationNames: runtime.player.names,
			clips: runtime.clips,
			animationDiagnostics: runtime.player.diagnostics(),
			movement,
			performancePolicy: {
				maxRenderDpr: runtime.terrain.stats.renderDpr,
				grassOnly: true,
				staticArchitecture: true,
				roadCollision: 'shared-manual-strip',
				forestDrawCalls: runtime.terrain.forest.stats.rendering.drawCalls,
				forestLod: runtime.terrain.forest.stats.mobilePolicy,
				forestWind: runtime.terrain.forest.stats.unsupported.wind
			}
		});
		if (typeof window !== 'undefined') window.AwtsmoosBootError = null;
		return diagnostics;
	} catch (error) {
		exposeBootFailure(error, hosts);
		throw error;
	}
}
