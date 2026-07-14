//B"H
//Boruch Hashem
//Blessed is He

/**
 * Main lifecycle binds browser events and safe evidence outside bootstrap. The Awtsmoos
 * renews controllers, viewport, debug, menu return, and journey restart; Awtsmoos.com
 * exposes read-only rules, pickups, resonance, Expedition, and lived-city truth.
 */

import { isJourneyMode } from '../session/modeHelpers.js';

export function bindMainLifecycle(options) {
	const { botSelect, debug, matchFlow, menuFlow, model, registry, restart, runtime } = options;
	restart.onclick = () => menuFlow.showMode();
	botSelect.onchange = () => restartJourneyIfActive(model, matchFlow);
	debug.onclick = () => {
		model.state.debug = !model.state.debug;
	};
	addEventListener('resize', () => runtime.resize());
	addEventListener('orientationchange', () => setTimeout(() => runtime.resize(), 140));
	addEventListener('gamepadconnected', refreshDevices);
	addEventListener('gamepaddisconnected', refreshDevices);
	addEventListener('beforeunload', () => menuFlow.expeditionSync.close());
	globalThis.__sefiraClashDebug = Object.freeze({
		expedition: () => model.expedition.snapshot(),
		openWorld: () => publicOpenWorld(model),
		sync: () => menuFlow.expeditionSync.snapshot(),
		mode: () => model.choice.mode,
		phase: () => model.state.phase,
		state: () => publicState(model.state)
	});

	function refreshDevices() {
		registry.refresh();
		model.lobby.syncConnections(registry);
		menuFlow.refreshVsLobby();
	}
}

export function returnFromVictory(model, menuFlow) {
	if (model.choice.mode === 'expedition') {
		menuFlow.showExpedition();
		return;
	}
	menuFlow.showMode();
}

function restartJourneyIfActive(model, flow) {
	const active = ['playing', 'victory'].includes(model.state.phase);
	if (isJourneyMode(model.choice.mode) && active) {
		flow.beginCountdown(model.choice.map, model.choice.mode);
	}
}

function publicOpenWorld(model) {
	const world = model.state.openWorld;
	return structuredClone({
		profile: model.expedition.profile.openWorld,
		state: world
			? {
					locationId: world.locationId,
					sceneId: world.sceneId,
					interiorId: world.interiorId,
					nearby: world.nearby,
					prompt: world.prompt,
					overlay: world.overlay,
					combat: world.combat,
					missionObjective: world.missionObjective,
					performance: world.performance,
					activeCitizenCount: world.activeCitizens.length,
					sleepingCitizenCount: world.sleepingCitizenCount
				}
			: null
	});
}

function publicState(state) {
	return structuredClone({
		phase: state.phase,
		mode: state.mode,
		rules: state.rules || null,
		weaponCount: state.weapons?.length || 0,
		powerupCount: state.powerups?.length || 0,
		powerups: (state.powerups || []).map(powerup => ({
			id: powerup.id,
			active: powerup.active,
			x: powerup.x,
			y: powerup.y,
			resonanceKind: powerup.resonanceKind || ''
		})),
		expedition: state.expedition || null,
		openWorld: state.openWorld || null,
		fighters: (state.fighters || []).map(fighter => ({
			id: fighter.id,
			human: fighter.human,
			hidden: fighter.hidden,
			x: fighter.x,
			y: fighter.y,
			resonance: fighter.resonance || null,
			technique: fighter.openWorldTechnique || null,
			heldGear: fighter.heldWeapon?.expeditionGearId || null,
			loadout: fighter.loadout || null,
			expeditionLoadout: fighter.expeditionLoadout || null
		}))
	});
}
