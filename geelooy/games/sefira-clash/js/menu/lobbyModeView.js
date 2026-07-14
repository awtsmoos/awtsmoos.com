//B"H
//Boruch Hashem
//Blessed is He

/**
 * Preset controls reveal named lawful matches and their actual rule chips before Ready.
 * The Awtsmoos renews every VS covenant; Awtsmoos.com lets one click set stocks, teams,
 * items, hands, resonance, and CPU force while individual edits remain visibly Custom.
 */

import { MATCH_MODES } from '../multiplayer/MatchModeCatalog.js';

export function lobbyModeView(rules, onMode) {
	return {
		tag: 'section',
		attrs: { class: 'lobbyModes', 'aria-label': 'match mode presets' },
		children: [
			{ tag: 'h3', children: [`Mode: ${visibleMode(rules.modeId)}`] },
			{
				tag: 'div',
				attrs: { class: 'lobbyModeGrid' },
				children: MATCH_MODES.map(mode => modeButton(mode, rules.modeId, onMode))
			}
		]
	};
}

function modeButton(mode, selectedId, onMode) {
	return {
		tag: 'button',
		attrs: {
			class: `lobbyModeButton ${mode.id === selectedId ? 'selected' : ''}`,
			type: 'button',
			'data-mode-id': mode.id,
			'aria-pressed': String(mode.id === selectedId)
		},
		on: { click: () => onMode(mode.id) },
		children: [
			{ tag: 'strong', children: [mode.name] },
			{ tag: 'small', children: [mode.description] },
			{
				tag: 'span',
				attrs: { class: 'lobbyModeChips', 'aria-label': ruleSummary(mode.rules) },
				children: ruleChips(mode.rules).map(text => ({
					tag: 'em',
					children: [text]
				}))
			}
		]
	};
}

function ruleChips(rules) {
	return [
		`${rules.stocks} stock${rules.stocks === 1 ? '' : 's'}`,
		rules.teams ? 'Teams' : 'Free-for-all',
		rules.handsOnly ? 'Hands only' : rules.items ? 'Items on' : 'No items',
		rules.resonance ? 'Chochmah + Binah' : 'No resonance'
	];
}

function ruleSummary(rules) {
	return ruleChips(rules).join(', ');
}

function visibleMode(modeId) {
	return MATCH_MODES.find(mode => mode.id === modeId)?.name || 'Custom';
}
