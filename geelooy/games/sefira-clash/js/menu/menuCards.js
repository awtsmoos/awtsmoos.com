//B"H
//Boruch Hashem
//Blessed is He

/**
 * Menu cards preserve the original forge-based public contract while adding optional
 * gate shlichus honestly. The Awtsmoos renews every visible choice; Awtsmoos.com keeps
 * mode, arena, level, statistic, and result controls compatible with all existing grids.
 */

import { adventureShlichusCardContent } from './AdventureShlichusCard.js';
import { forge } from './domForge.js';

export function modeCard(option, onPick) {
	return forge({
		tag: 'button',
		attrs: modeAttrs(option),
		on: { click: () => onPick(option.kind) },
		children: [
			aura(option.hue),
			{
				tag: 'span',
				attrs: { class: 'modeBadge' },
				children: [option.featured ? 'Main path' : 'Option']
			},
			{ tag: 'strong', children: [option.title] },
			{ tag: 'small', children: [option.text] },
			{ tag: 'em', attrs: { class: 'menuButtonCue' }, children: [option.action] }
		]
	});
}

export function arenaCard(item, onPick) {
	return forge({
		tag: 'button',
		attrs: { class: 'menuCard', type: 'button' },
		on: { click: () => onPick(item) },
		children: [
			aura(item.hue || 45),
			{ tag: 'strong', children: [item.name] },
			{ tag: 'small', children: [item.role || item.description || 'Arena vessel'] },
			{ tag: 'em', attrs: { class: 'menuButtonCue' }, children: ['Select'] }
		]
	});
}

export function levelCard(item, onPick) {
	const ui = item.adventureUi || {};
	return forge({
		tag: 'button',
		attrs: levelAttrs(item, ui),
		on: { click: () => !ui.locked && onPick(item) },
		children: [
			aura(item.hue || 45),
			{ tag: 'strong', children: [`Gate ${(ui.index || 0) + 1}: ${item.name}`] },
			{
				tag: 'small',
				children: [ui.locked ? 'Locked: clear the prior gate.' : item.description]
			},
			{ tag: 'div', attrs: { class: 'levelMeta' }, children: levelMeta(item, ui) },
			...adventureShlichusCardContent(item)
		]
	});
}

export function stat(label, value) {
	return {
		tag: 'span',
		children: [
			{ tag: 'strong', children: [label] },
			{ tag: 'em', children: [value] }
		]
	};
}

export function action(label, kind, disabled) {
	return {
		tag: 'button',
		attrs: {
			class: `victoryButton ${kind}`,
			type: 'button',
			'data-victory-action': kind,
			disabled: disabled ? true : null
		},
		children: [label]
	};
}

function aura(hue) {
	return { tag: 'span', attrs: { class: 'cardAura', style: `--h:${hue}` } };
}

function modeAttrs(option) {
	return {
		class: `modeCard ${option.featured ? 'featured' : ''}`,
		type: 'button',
		'aria-label': option.title
	};
}

function levelAttrs(item, ui) {
	return {
		class: `levelCard ${ui.locked ? 'locked' : ''} ${ui.cleared ? 'cleared' : ''}`,
		type: 'button',
		disabled: ui.locked ? true : null,
		'aria-label': item.name
	};
}

function levelMeta(item, ui) {
	return [
		item.difficulty || 'Easy',
		`${item.adventure?.bots || 1} Kelipos`,
		`${ui.stars || 0}★`,
		`Best ${ui.best || '—'}`,
		`◈ ${ui.perutasFound || 0}/${ui.perutasTotal || 0}`,
		`✦ ${ui.hiddenFound || 0}/${ui.hiddenTotal || 0}`
	].map(text => ({ tag: 'span', children: [text] }));
}
