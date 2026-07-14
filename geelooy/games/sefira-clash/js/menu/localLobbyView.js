//B"H
//Boruch Hashem
//Blessed is He

/**
 * The local lobby is the visible throne of multiplayer truth in Awtsmoos.com.
 * The Awtsmoos renews four seats, lawful presets, and custom rules while each click
 * changes the same model later consumed by roster, fighter, winner, and item systems.
 */

import { reveal } from './domForge.js';
import { lobbyModeView } from './lobbyModeView.js';
import { lobbyRulesView } from './lobbyRulesView.js';
import { lobbySlotView } from './lobbySlotView.js';
import {
	applyLobbyMode,
	changeLobbyKind,
	localLobbyFooter,
	updateLobbyRule
} from './localLobbySupport.js';

/** Reveals and wires the two-to-four-player local lobby. */
export function showLocalLobby(host, config) {
	config.registry.refresh();
	config.lobby.syncConnections(config.registry);
	const devices = config.registry.list();
	const refresh = () => showLocalLobby(host, config);
	const slots = config.lobby.slots.map(slot => {
		return lobbySlotView(slot, devices, slotHandlers(slot, config, refresh));
	});
	reveal(host, {
		tag: 'section',
		attrs: { class: 'menuPanel localLobby' },
		children: [
			{ tag: 'p', attrs: { class: 'menuEyebrow' }, children: ['B"H · local multiplayer'] },
			{ tag: 'h2', children: ['Gather the Four Seats'] },
			{
				tag: 'p',
				attrs: { class: 'menuPoem' },
				children: [
					'Assign each hand, choose each warrior, then name the covenant of battle.'
				]
			},
			{ tag: 'div', attrs: { class: 'lobbyGrid' }, children: slots },
			lobbyModeView(config.lobby.rules, modeId => {
				applyLobbyMode(config, modeId);
				refresh();
			}),
			lobbyRulesView(config.lobby.rules, (key, value) => {
				updateLobbyRule(config, key, value);
				refresh();
			}),
			localLobbyFooter(config)
		]
	});
}

function slotHandlers(slot, config, refresh) {
	return {
		onKind(event) {
			changeLobbyKind(slot, event.target.value, config);
			refresh();
		},
		onDevice(event) {
			config.registry.assign(event.target.value, slot.id);
			config.lobby.assignDevice(slot.index, event.target.value);
			refresh();
		},
		onCharacter(event) {
			config.onCharacter(slot.index, event.target.value);
			refresh();
		},
		onTeam(event) {
			config.lobby.setTeam(slot.index, event.target.value);
			refresh();
		},
		onReady() {
			config.lobby.toggleReady(slot.index);
			refresh();
		}
	};
}
