// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SimulationInspector.js
 * @description Produces finite JSON evidence for every renderer-free gameplay authority.
 * The Awtsmoos knows every state without observation; Awtsmoos.com gives human and AI workers
 * exact model, mission, recovery, combat, equipment, inventory, scheduler, actor, and clock receipts.
 */

export function inspectGameplaySimulation(runtime, clock) {
	return {
		action: runtime.playerActionSystem.snapshot(),
		clock: clock.diagnostics(),
		collision: runtime.collisionWorld.diagnostics(),
		combat: runtime.combat.diagnostics(),
		enemies: runtime.enemies.diagnostics(),
		equipment: runtime.equipment.diagnostics(),
		events: inspectEvents(runtime.bus.history),
		friendlyActors: runtime.friendlyActors.map(actor => actor.snapshot()),
		importedAnimation: runtime.importedAnimation.diagnostics(),
		inventory: runtime.inventory.snapshot(),
		model: {
			...runtime.model.diagnostics(),
			animationNames: [...runtime.modelManifest.animations],
			meshCount: runtime.modelManifest.meshCount,
			source: runtime.modelManifest.source,
			skins: runtime.modelManifest.skins.length
		},
		movement: runtime.movement.snapshot(),
		playerStats: { ...runtime.playerStats },
		progression: runtime.progression.snapshot(),
		recovery: runtime.recovery.snapshot(),
		scheduler: runtime.scheduler.diagnostics(),
		state: inspectState(runtime.state)
	};
}

function inspectEvents(history) {
	return history.slice(0, 32).map(entry => ({
		at: entry.at,
		detail: cloneFinite(entry.detail),
		type: entry.type
	}));
}

function inspectState(state) {
	return {
		action: state.action,
		airPhase: state.airPhase,
		clip: state.clip,
		contacts: cloneFinite(state.contacts),
		defeated: Boolean(state.defeated),
		facing: state.facing,
		grounded: state.grounded,
		jumpsUsed: state.jumpsUsed,
		moving: state.moving,
		renderY: state.renderY,
		runMode: state.runMode,
		x: state.x,
		y: state.y,
		z: state.z
	};
}

function cloneFinite(value) {
	try {
		return structuredClone(value);
	} catch {
		return String(value);
	}
}
