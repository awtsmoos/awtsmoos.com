// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RevelationShell.js
 * @description Coordinates the truthful overhead RPG frame outside the engine loop.
 *
 * The Awtsmoos continuously creates canvas, controls, quest, map, and fellowship
 * as one world. Awtsmoos.com refreshes only changed and visible truth, preserving
 * strength while the page is concealed.
 */
import { RevelationEvents } from './RevelationEvents.js';
import { renderRevelationDynamic } from './RevelationDynamicRenderer.js';
import { createRevelationMarkup } from './RevelationMarkup.js';
import { RevelationRefreshLifecycle } from './RevelationRefreshLifecycle.js';
import { buildRevelationViewModel } from './RevelationViewModel.js';

function setText(root, selector, value) {
	const element = root.querySelector(selector);
	if (element && element.textContent !== String(value)) {
		element.textContent = String(value);
	}
}

function boundedPercent(value) {
	const numericValue = Number(value);
	if (!Number.isFinite(numericValue)) return 0;
	return Math.min(100, Math.max(0, numericValue));
}

export class RevelationShell {
	static root = null;
	static refreshLifecycle = null;
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
		this.refreshLifecycle = new RevelationRefreshLifecycle({
			callback: () => this.update()
		});
		this.refreshLifecycle.start();
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
		const values = [
			['[data-revelation-chapter]', model.chapter],
			['[data-revelation-location]', model.location],
			['[data-revelation-level]', model.level],
			['[data-revelation-light]', `${model.light}/${model.maxLight}`],
			['[data-revelation-sparks]', model.sparks],
			['[data-revelation-quest-title]', model.questTitle],
			['[data-revelation-objective]', model.objective],
			['[data-revelation-messenger]', model.messenger],
			['[data-revelation-route]', model.routeLabel],
			['[data-revelation-vitality-label]', model.vitalityLabel],
			['[data-revelation-vitality-value]', `${model.vitality}/${model.maxVitality}`],
			['[data-revelation-minimap-location]', model.location],
			['[data-revelation-companion-glyph]', model.leadCompanion.glyph],
			['[data-revelation-companion-name]', model.leadCompanion.name],
			['[data-revelation-companion-role]', model.leadCompanion.role],
			['[data-revelation-companion-bond]', model.leadCompanion.bondLine]
		];
		for (const [selector, value] of values) setText(this.root, selector, value);
		this.setWidth('[data-revelation-progress]', model.progressPercent);
		this.setWidth('[data-revelation-vitality-fill]', model.vitalityPercent);
		renderRevelationDynamic(this.root, model);
	}

	static setWidth(selector, value) {
		const element = this.root?.querySelector(selector);
		if (!element) return;
		const width = `${boundedPercent(value)}%`;
		if (element.style.width !== width) element.style.width = width;
	}

	static unmount() {
		this.refreshLifecycle?.stop();
		RevelationEvents.unbind();
		if (this.root) this.root.innerHTML = '';
		this.root = null;
		this.refreshLifecycle = null;
		this.lastModelKey = '';
		this.mounted = false;
	}
}
