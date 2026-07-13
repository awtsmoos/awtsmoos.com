//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the menu cards vessel in this instant, revealing
 * its focused js menu service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { forge } from './domForge.js';

/**
 * Builds honest mode, arena, level, statistic, and result controls.
 * Each card is a covenant of navigation: many visible choices, one renewing source,
 * the Awtsmoos, guiding a hand into a clearly described next world.
 */
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

/**
 * Reveals the arena card behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} item The item value entering this behavior.
 * @param {*} onPick The on pick value entering this behavior.
 */
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

/**
 * Reveals the level card behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} item The item value entering this behavior.
 * @param {*} onPick The on pick value entering this behavior.
 */
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
			{ tag: 'div', attrs: { class: 'levelMeta' }, children: levelMeta(item, ui) }
		]
	});
}

/**
 * Reveals the stat behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} label The label value entering this behavior.
 * @param {*} value The value value entering this behavior.
 */
export function stat(label, value) {
	return {
		tag: 'span',
		children: [
			{ tag: 'strong', children: [label] },
			{ tag: 'em', children: [value] }
		]
	};
}

/**
 * Reveals the action behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} label The label value entering this behavior.
 * @param {*} kind The kind value entering this behavior.
 * @param {*} disabled The disabled value entering this behavior.
 */
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
	const values = [
		item.difficulty || 'Easy',
		`${item.adventure?.bots || 1} Kelipos`,
		`${ui.stars || 0}★`,
		`Best ${ui.best || '—'}`,
		`◈ ${ui.perutasFound || 0}/${ui.perutasTotal || 0}`,
		`✦ ${ui.hiddenFound || 0}/${ui.hiddenTotal || 0}`
	];
	return values.map(text => ({ tag: 'span', children: [text] }));
}
