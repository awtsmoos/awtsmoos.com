// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzRuntimeDiagnostics.js
 * @description Exposes gameplay, actor, renderer, visual-quality, UI, and performance facts as receipts.
 * The Awtsmoos makes every hidden system answer without becoming the world it defines;
 * Awtsmoos.com gives player, sky, camera, terrain, and renderer one truthful visual witness that shines.
 */

import { captureVisualQualityDiagnostics } from './VisualQualityDiagnostics.js';

export function attachRuntimeDiagnostics(diagnostics, runtime, movement, localRpg) {
	Object.assign(diagnostics, {
		actionBar: runtime.actionBar,
		actionBarRuntime: runtime.gameplayUi.actionBar,
		animationDiagnostics: runtime.player.diagnostics(),
		animationNames: runtime.player.names,
		assets: runtime.assets,
		bus: runtime.bus,
		clips: runtime.clips,
		combatActionBar: runtime.combatActionBar,
		combatActionBarState: () => runtime.combatActionBar?.snapshot(),
		door: runtime.doors[0],
		equipment: runtime.equipment,
		forest: runtime.terrain.forest,
		forestStats: runtime.terrain.forest.stats,
		gameplayUi: runtime.gameplayUi,
		gameplayUiState: () => runtime.gameplayUi.snapshot(),
		grassImage: runtime.grassImage,
		ground: runtime.ground,
		groundSampler: runtime.groundSampler,
		hostileDiagnostics: () => runtime.hostileNpcs?.diagnostics?.() || null,
		hostileNpcs: runtime.hostileNpcs,
		houseDoor: runtime.doors[1],
		houseDoors: runtime.doors.slice(1),
		inventoryPanel: runtime.inventoryPanel,
		inventoryStore: runtime.inventoryStore,
		joystick: runtime.joystick,
		jumpButton: runtime.jumpButton,
		lava: runtime.lava,
		lavaStats: runtime.lava.stats(),
		localRpg,
		logVillageLifeDiagnostics: label => runtime.villageLifeLogger?.force(runtime, label),
		mainOctree: runtime.mainOctree,
		materialResidencyDiagnostics: () => runtime.materialResidency?.diagnostics?.(),
		model: runtime.model,
		movement,
		mover: runtime.mover,
		npc: runtime.npc,
		npcHud: runtime.npcHud,
		octree: runtime.mover.octree,
		orbit: runtime.orbit,
		performanceMonitor: runtime.performanceMonitor,
		performanceMetrics: () => runtime.performanceMonitor?.diagnostics(),
		performancePolicy: performancePolicy(runtime),
		player: runtime.player,
		playerSource: runtime.playerGltf.scene.userData.isolatedModelLoad,
		runtime,
		shadowStats: runtime.shadows.stats(),
		shadows: runtime.shadows,
		textureGpuDiagnostics: () => runtime.renderer?.textures?.diagnostics?.(),
		villageLifeDiagnostics: () => runtime.villageLifeLogger?.snapshot(),
		visualQuality: () => captureVisualQualityDiagnostics(runtime),
		worldModels: runtime.worldModels,
		worldModelStats: runtime.worldModels?.stats() || null,
		worldMode: runtime.worldMode,
		worldStats: runtime.worldMode.stats()
	});
	return diagnostics;
}

function performancePolicy(runtime) {
	return {
		combatHudUpdateMilliseconds: 50,
		forestDrawCalls: runtime.terrain.forest.stats.rendering.drawCalls,
		forestLod: runtime.terrain.forest.stats.mobilePolicy,
		forestWind: runtime.terrain.forest.stats.unsupported.wind,
		hostileActors: runtime.hostileNpcs?.actors?.length || 0,
		importedModelAnimations: runtime.worldModels?.players.length || 0,
		importedModelFailures: runtime.worldModels?.failures.length || 0,
		maxRenderDpr: runtime.terrain.stats.renderDpr,
		minimapPolicy: 'movement-threshold-updates',
		roadCollision: 'shared-manual-strip',
		staticArchitecture: true,
		structuredVillageLogging: true,
		uiReconstructionPolicy: 'state-transitions-only'
	};
}
