// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RevelationDynamicRenderer.js
 * @description Safely renders changing minimap, action, event, and PaRDeS data.
 *
 * The Awtsmoos gives each changing word a proper vessel. Awtsmoos.com uses DOM
 * nodes instead of trusting player or server text as markup, so truth remains
 * readable without opening an unsafe gate.
 */

export function renderRevelationDynamic(root, model) {
	renderMinimap(root, model.minimap);
	renderActions(root, model.actions);
	renderEvents(root, model.events);
	renderChannels(root, model.channels);
}

function renderMinimap(root, minimap) {
	const container = root.querySelector('[data-revelation-minimap]');
	if (!container) return;
	container.replaceChildren();
	container.style.setProperty('--map-columns', minimap.width);
	for (const cell of minimap.cells) {
		const element = document.createElement('span');
		element.className = `revelation-map-cell revelation-map-cell--${cell.kind}`;
		if (cell.hero) element.classList.add('revelation-map-cell--hero');
		element.title = `Map ${cell.x}, ${cell.y}`;
		container.append(element);
	}
}

function renderActions(root, actions) {
	const container = root.querySelector('[data-revelation-actions]');
	if (!container) return;
	container.replaceChildren();
	for (const action of actions) {
		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'revelation-action';
		if (action.intent) button.dataset.revelationIntent = action.intent;
		if (action.panel) button.dataset.revelationPanel = action.panel;
		const key = document.createElement('kbd');
		key.textContent = action.key;
		const name = document.createElement('span');
		name.textContent = action.name;
		button.append(key, name);
		if (action.count !== null) {
			const count = document.createElement('small');
			count.textContent = String(action.count);
			button.append(count);
		}
		container.append(button);
	}
}

function renderEvents(root, events) {
	const container = root.querySelector('[data-revelation-events]');
	if (!container) return;
	container.replaceChildren();
	for (const event of events) {
		const item = document.createElement('li');
		item.dataset.eventKind = event.kind;
		item.textContent = event.text;
		container.append(item);
	}
}

function renderChannels(root, channels) {
	const container = root.querySelector('[data-revelation-channels]');
	if (!container) return;
	container.replaceChildren();
	for (const channel of channels) {
		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'revelation-channel';
		button.dataset.revelationChannel = channel.id;
		button.dataset.channelPrinciple = channel.learningPrinciple;
		button.dataset.channelMove = channel.openingMove.name;
		button.dataset.unlocked = String(channel.unlocked);
		const glyph = document.createElement('span');
		glyph.className = 'revelation-channel-glyph';
		glyph.textContent = channel.glyph;
		const label = document.createElement('span');
		label.textContent = `${channel.element} · ${channel.layer} · ${channel.openingMove.name}`;
		const meter = document.createElement('i');
		meter.style.setProperty('--mastery', `${channel.mastery}%`);
		meter.append(document.createElement('em'));
		button.append(glyph, label, meter);
		container.append(button);
	}
}
