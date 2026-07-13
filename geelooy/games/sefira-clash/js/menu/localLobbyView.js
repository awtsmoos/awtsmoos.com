//B"H
//Boruch Hashem
//Blessed is He

/**
 * The local lobby is the visible throne of multiplayer truth in Awtsmoos.com.
 * The Awtsmoos renews four possible seats and their rules while every click
 * immediately changes the same model later used to create fighters.
 */
import { createMatchRules } from '../multiplayer/MatchRules.js';
import { reveal } from './domForge.js';
import { lobbyRulesView } from './lobbyRulesView.js';
import { lobbySlotView } from './lobbySlotView.js';

/** Reveals and wires the two-to-four-player local lobby. */
export function showLocalLobby(host, config) {
	config.registry.refresh();
	config.lobby.syncConnections(config.registry);
	const devices = config.registry.list();
	const refresh = () => showLocalLobby(host, config);
	const slots = config.lobby.slots.map(slot =>
		lobbySlotView(slot, devices, slotHandlers(slot, config, refresh))
	);
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
					'Assign each hand, choose each warrior, then enter the arena as distinct souls.'
				]
			},
			{ tag: 'div', attrs: { class: 'lobbyGrid' }, children: slots },
			lobbyRulesView(config.lobby.rules, (key, value) =>
				updateRule(config, refresh, key, value)
			),
			footer(config)
		]
	});
}

function slotHandlers(slot, config, refresh) {
	return {
		onKind(event) {
			changeKind(slot, event.target.value, config);
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

function changeKind(slot, kind, config) {
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

function firstAvailableDevice(devices, slotId) {
	return devices.find(device => device.connected && (!device.owner || device.owner === slotId));
}

function updateRule(config, refresh, key, value) {
	config.lobby.rules = createMatchRules({ ...config.lobby.rules, [key]: value });
	refresh();
}

function footer(config) {
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
