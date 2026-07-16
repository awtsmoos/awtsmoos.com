// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RevelationGameplayViewModel.js
 * @description Selects truthful action, event, vitality, and minimap HUD data.
 *
 * The Awtsmoos renews position, vitality, equipment, and fellowship every instant.
 * Awtsmoos.com displays those facts without creating rival gameplay state or
 * allowing malformed restored values to tear an interface vessel beyond bounds.
 */
import { buildRevelationMinimap } from './RevelationMinimapProjection.js';

/**
 * Builds the active gameplay portion of the Revelation view model.
 *
 * @param {object} state Canonical state or a read-only projection.
 * @param {object[]} registry Canonical assembled world tiles.
 * @returns {object} Gameplay HUD projection.
 */
export function buildGameplayViewModel(state, registry = []) {
	const maxLight = Math.max(1, numberOr(state.Stats?.maxLight, 100));
	const light = clamp(numberOr(state.Stats?.light, 100), 0, maxLight);
	return {
		vitalityLabel: 'Living Light',
		vitality: light,
		maxVitality: maxLight,
		vitalityPercent: Math.round((light / maxLight) * 100),
		minimap: buildRevelationMinimap(state, registry),
		actions: buildActions(state),
		events: buildEvents(state)
	};
}

function buildActions(state) {
	const weapon = humanize(state.Equipment?.weapon || 'WEAPON_NONE');
	const balmCount = numberOr(state.Inventory?.items?.balm);
	const wickCount = numberOr(state.Inventory?.items?.wick);
	return [
		{
			key: 'A',
			name: weapon === 'Weapon None' ? 'Interact' : weapon,
			intent: 'A',
			count: null
		},
		{ key: 'B', name: 'PaRDeS Art', intent: 'B', count: null },
		{ key: 'I', name: 'Balm', panel: 'items', count: balmCount },
		{ key: 'J', name: 'Lost Wick', panel: 'journal', count: wickCount }
	];
}

function buildEvents(state) {
	const events = [];
	if (state.Message) events.push({ kind: 'world', text: String(state.Message) });
	const shared = globalThis.__OHR_HAGNUZ_SHARED_JOURNEY__;
	if (!shared || shared.connection === 'offline') {
		events.push({ kind: 'solo', text: 'Solo Journey · local save active' });
		return events;
	}
	events.push({ kind: 'shared', text: `Shared Journey · ${shared.connection}` });
	if (shared.lastMessageType) {
		events.push({
			kind: 'shared',
			text: `Server event · ${humanize(shared.lastMessageType)}`
		});
	}
	if (shared.road?.lamp?.lit) {
		events.push({ kind: 'shared', text: 'The shared lamp is burning.' });
	}
	if (shared.road?.encounter && !shared.road.encounter.defeated) {
		events.push({
			kind: 'danger',
			text: `Veil Wisp · ${shared.road.encounter.health}/${shared.road.encounter.maxHealth}`
		});
	}
	if (shared.error) events.push({ kind: 'danger', text: String(shared.error) });
	return events.slice(0, 5);
}

function clamp(value, minimum, maximum) {
	return Math.min(maximum, Math.max(minimum, value));
}

function numberOr(value, fallback = 0) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function humanize(value) {
	return String(value)
		.replace(/[_-]+/g, ' ')
		.toLowerCase()
		.replace(/\b\w/g, letter => letter.toUpperCase());
}
