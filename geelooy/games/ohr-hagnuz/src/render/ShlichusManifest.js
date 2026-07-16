// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShlichusManifest.js
 * @description Renders legacy Shlichus state through safe, literal DOM vessels.
 *
 * The Awtsmoos entrusts each mission as meaning, never as executable markup.
 * Awtsmoos.com therefore receives every title and description through text nodes.
 */
import { StateRegister } from '../binah/StateRegister.js';
import { ShlichusLedger } from '../shlichus/ShlichusLedger.js';

const ACTIVE_STYLE = [
	'padding:15px',
	'background:rgba(255,255,255,0.05)',
	'border-left:4px solid #ea80fc',
	'border-radius:5px'
].join(';');

const COMPLETED_STYLE = [
	'padding:10px',
	'background:rgba(76, 175, 80, 0.1)',
	'border-left:4px solid #4caf50',
	'border-radius:5px',
	'color:#888',
	'text-decoration:line-through'
].join(';');

function createTextNode(tagName, text, cssText = '') {
	const element = document.createElement(tagName);
	element.textContent = String(text);
	if (cssText) element.style.cssText = cssText;
	return element;
}

function createHeading(text, color, marginTop = '') {
	const heading = createTextNode('h2', text);
	heading.style.color = color;
	if (marginTop) heading.style.marginTop = marginTop;
	return heading;
}

function createActiveMission(quest) {
	const block = document.createElement('div');
	block.style.cssText = ACTIVE_STYLE;
	const title = createTextNode(
		'div',
		quest.title,
		'font-size:20px;font-weight:bold;color:#fff'
	);
	const description = createTextNode(
		'div',
		quest.desc,
		'font-size:14px;color:#ccc;margin-top:5px'
	);
	const rewardSuffix = quest.rewardItem ? ' + Divine Garment' : '';
	const reward = createTextNode(
		'div',
		`Reward: ${quest.rewardGelt} Gelt${rewardSuffix}`,
		'font-size:14px;color:#ffd54f;margin-top:10px;font-style:italic'
	);
	block.append(title, description, reward);
	return block;
}

function createCompletedMission(quest) {
	return createTextNode('div', quest.title, COMPLETED_STYLE);
}

/**
 * Refreshes the existing Shlichus panel from canonical legacy mission state.
 */
export class ShlichusManifest {
	static refresh() {
		const container = document.getElementById('shlichus-content');
		if (!container) return;
		const active = Array.isArray(StateRegister.ActiveShlichus)
			? StateRegister.ActiveShlichus
			: [];
		const completed = Array.isArray(StateRegister.CompletedShlichus)
			? StateRegister.CompletedShlichus
			: [];
		container.replaceChildren();
		container.append(createHeading(`Active Decrees (${active.length})`, '#ea80fc'));
		if (active.length === 0) {
			container.append(createTextNode(
				'div',
				'No active missions. Speak to Sages.',
				'color:#888;font-style:italic'
			));
		}
		for (const id of active) {
			const quest = ShlichusLedger[id];
			if (quest) container.append(createActiveMission(quest));
		}
		container.append(createHeading(
			`Elevated Sparks (${completed.length})`,
			'#4caf50',
			'30px'
		));
		for (const id of completed) {
			const quest = ShlichusLedger[id];
			if (quest) container.append(createCompletedMission(quest));
		}
	}
}
