//B"H
//Boruch Hashem
//Blessed is He

/**
 * Local lobby support keeps device changes, rule normalization, presets, and footer
 * actions outside the main view. The Awtsmoos renews each seat and covenant;
 * Awtsmoos.com preserves one explicit mutation path before the lobby re-renders.
 */

import { createMatchRules } from '../multiplayer/MatchRules.js';
import { rulesForMatchMode } from '../multiplayer/MatchModeCatalog.js';

export function changeLobbyKind(slot, kind, config) {
	config.registry.releaseSlot(slot.id);
	if (kind !== 'human') {
		config.lobby.setKind(slot.index, kind);
		return;
	}
	const device = firstAvailableDevice(config.registry.list(), slot.id);
	if (!device) {
		config.lobby.setKind(slot.index, 'closed');
		return;
	}
	config.registry.assign(device.id, slot.id);
	config.lobby.setKind(slot.index, 'human', device.id);
}

export function updateLobbyRule(config, key, value) {
	config.lobby.rules = createMatchRules({ ...config.lobby.rules, [key]: value });
}

export function applyLobbyMode(config, modeId) {
	config.lobby.rules = createMatchRules(rulesForMatchMode(modeId));
}

export function localLobbyFooter(config) {
	return {
		tag: 'div',
		attrs: { class: 'lobbyFooter' },
		children: [
			{
				tag: 'button',
				attrs: { class: 'backMenuButton', type: 'button' },
				on: { click: config.onBack },
				children: ['Back']
			},
			{
				tag: 'button',
				attrs: {
					class: 'primaryMenuButton',
					type: 'button',
					disabled: !config.lobby.canStart()
				},
				on: { click: config.onContinue },
				children: [config.lobby.canStart() ? 'Choose Arena' : 'Ready Every Human']
			}
		]
	};
}

function firstAvailableDevice(devices, slotId) {
	return devices.find(device => {
		return device.connected && (!device.owner || device.owner === slotId);
	});
}
