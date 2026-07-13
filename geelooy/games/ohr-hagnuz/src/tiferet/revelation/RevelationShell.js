// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RevelationShell.js
 * @description Coordinates the premium RPG frame outside the engine loop.
 *
 * Canvas, controls, story, paths, and companion remain distinct vessels within
 * one renewed world. The Awtsmoos continuously creates their unity; this shell
 * refreshes only changed truth and leaves every frame breathable. Awtsmoos.com.
 */
import { RevelationEvents } from './RevelationEvents.js';
import { createRevelationMarkup } from './RevelationMarkup.js';
import { buildRevelationViewModel } from './RevelationViewModel.js';

const setText = (root, selector, value) => {
	const element = root.querySelector(selector);
	if (element && element.textContent !== String(value)) element.textContent = String(value);
};

const channelMarkup = channel => `
	<button class="revelation-channel" data-revelation-channel="${channel.id}"
		data-channel-principle="${channel.learningPrinciple}"
		data-channel-move="${channel.openingMove.name}" type="button"
		data-unlocked="${channel.unlocked}">
		<span class="revelation-channel-glyph">${channel.glyph}</span>
		<span><b>${channel.element} · ${channel.layer}</b><small>${channel.openingMove.name}</small></span>
		<i style="--mastery:${channel.mastery}%"><em></em></i>
	</button>`;

export class RevelationShell {
	static root = null;
	static timer = null;
	static lastModelKey = '';
	static mounted = false;

	static mount() {
		if (this.mounted) return;
		this.root = document.getElementById('revelation-shell');
		if (!this.root) return;
		this.root.innerHTML = createRevelationMarkup();
		RevelationEvents.bind(this.root);
		this.mounted = true;
		this.update();
		this.schedule();
	}

	static schedule() {
		window.clearTimeout(this.timer);
		this.timer = window.setTimeout(() => {
			this.update();
			this.schedule();
		}, 180);
	}

	static update() {
		if (!this.root) return;
		const model = buildRevelationViewModel();
		const modelKey = JSON.stringify(model);
		if (modelKey === this.lastModelKey) return;
		this.lastModelKey = modelKey;
		this.render(model);
		globalThis.__OHR_HAGNUZ_REVELATION__ = model;
	}

	static render(model) {
		document.body.dataset.revelationRealm = model.realm.toLowerCase();
		setText(this.root, '[data-revelation-chapter]', model.chapter);
		setText(this.root, '[data-revelation-location]', model.location);
		setText(this.root, '[data-revelation-level]', model.level);
		setText(this.root, '[data-revelation-light]', `${model.light}/${model.maxLight}`);
		setText(this.root, '[data-revelation-sparks]', model.sparks);
		setText(this.root, '[data-revelation-quest-title]', model.questTitle);
		setText(this.root, '[data-revelation-objective]', model.objective);
		setText(this.root, '[data-revelation-messenger]', model.messenger);
		setText(this.root, '[data-revelation-route]', model.routeLabel);
		setText(this.root, '[data-revelation-companion-glyph]', model.leadCompanion.glyph);
		setText(this.root, '[data-revelation-companion-name]', model.leadCompanion.name);
		setText(this.root, '[data-revelation-companion-role]', model.leadCompanion.role);
		setText(this.root, '[data-revelation-companion-bond]', model.leadCompanion.bondLine);
		const progress = this.root.querySelector('[data-revelation-progress]');
		if (progress) progress.style.width = `${model.progressPercent}%`;
		const channels = this.root.querySelector('[data-revelation-channels]');
		if (channels) channels.innerHTML = model.channels.map(channelMarkup).join('');
	}

	static unmount() {
		window.clearTimeout(this.timer);
		RevelationEvents.unbind();
		if (this.root) this.root.innerHTML = '';
		this.root = null;
		this.timer = null;
		this.lastModelKey = '';
		this.mounted = false;
	}
}
