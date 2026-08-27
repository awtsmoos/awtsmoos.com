// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StatusEffectHud.js
 * @description Presents active player effects with event-driven membership and bounded countdown writes.
 * The Awtsmoos renews time itself without waste: effects enter and leave by event, while only a newly
 * visible second receives a DOM garment in the responsive world revealed through Awtsmoos.com.
 */

import { torahStatusEffectDefinition } from '../gameplay/combat/TorahStatusEffectCatalog.js';

const DEFAULT_REFRESH_MILLISECONDS = 250;

export class StatusEffectHud {
	constructor(host, bus, store, targetId = 'player', options = {}) {
		this.bus = bus;
		this.store = store;
		this.targetId = targetId;
		this.domUpdates = 0;
		this.nextRefreshAt = 0;
		this.refreshMilliseconds = options.refreshMilliseconds ?? DEFAULT_REFRESH_MILLISECONDS;
		this.nodes = new Map();
		this.root = document.createElement('div');
		this.root.className = 'Mitzvah-status-effects';
		this.root.setAttribute('aria-label', 'Active Torah effects');
		this.root.setAttribute('role', 'list');
		this.root.hidden = true;
		host.appendChild(this.root);
		this.unsubscribers = [
			bus.on('status:apply', detail => this.changed(detail)),
			bus.on('status:expire', detail => this.changed(detail))
		];
		this.render();
	}

	changed(detail) {
		if (detail?.targetId === this.targetId) this.render();
	}

	render() {
		const effects = this.store.snapshot(this.targetId).effects;
		const fragment = document.createDocumentFragment();
		this.nodes.clear();
		for (const effect of effects) {
			const definition = torahStatusEffectDefinition(effect.effectId);
			if (!definition) continue;
			const node = this.createNode(effect, definition);
			fragment.appendChild(node);
			this.nodes.set(effect.sequence, node);
		}
		this.root.replaceChildren(fragment);
		this.root.hidden = this.nodes.size === 0;
		this.nextRefreshAt = 0;
		this.domUpdates += 1;
	}

	createNode(effect, definition) {
		const node = document.createElement('span');
		node.className = `Mitzvah-status-effect is-${definition.icon}`;
		node.dataset.expiresAt = effect.expiresAt;
		node.setAttribute('role', 'listitem');
		node.title = definition.tooltip;
		node.innerHTML = `<b>${definition.icon.slice(0, 2)}</b><small></small>`;
		if (effect.stacks > 1) node.dataset.stacks = effect.stacks;
		return node;
	}

	update(now) {
		if (this.root.hidden || now < this.nextRefreshAt) return false;
		this.nextRefreshAt = now + this.refreshMilliseconds;
		let changedCount = 0;
		for (const node of this.nodes.values()) {
			const seconds = Math.max(0, Math.ceil((Number(node.dataset.expiresAt) - now) / 1000));
			const time = node.querySelector('small');
			const label = String(seconds);
			if (time.textContent === label) continue;
			time.textContent = label;
			changedCount += 1;
		}
		this.domUpdates += changedCount;
		return changedCount > 0;
	}

	snapshot() {
		return {
			activeCount: this.nodes.size,
			domUpdates: this.domUpdates,
			nextRefreshAt: this.nextRefreshAt,
			refreshMilliseconds: this.refreshMilliseconds,
			targetId: this.targetId
		};
	}

	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
		this.nodes.clear();
		this.root.remove();
	}
}
