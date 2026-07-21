// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StatusEffectHud.js
 * @description Presents active player effects with transition-only reconstruction.
 */

import { torahStatusEffectDefinition } from '../gameplay/combat/TorahStatusEffectCatalog.js';

export class StatusEffectHud {
	constructor(host, bus, store, targetId = 'player') {
		this.bus = bus;
		this.store = store;
		this.targetId = targetId;
		this.domUpdates = 0;
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
			const node = document.createElement('span');
			node.className = `Mitzvah-status-effect is-${definition.icon}`;
			node.dataset.expiresAt = effect.expiresAt;
			node.setAttribute('role', 'listitem');
			node.title = definition.tooltip;
			node.innerHTML = `<b>${definition.icon.slice(0, 2)}</b><small></small>`;
			if (effect.stacks > 1) node.dataset.stacks = effect.stacks;
			fragment.appendChild(node);
			this.nodes.set(effect.sequence, node);
		}
		this.root.replaceChildren(fragment);
		this.root.hidden = this.nodes.size === 0;
		this.domUpdates += 1;
	}

	update(now) {
		if (this.root.hidden) return false;
		for (const node of this.nodes.values()) {
			const seconds = Math.max(0, Math.ceil((Number(node.dataset.expiresAt) - now) / 1000));
			const label = `${seconds}`;
			const time = node.querySelector('small');
			if (time.textContent !== label) time.textContent = label;
		}
		this.domUpdates += 1;
		return true;
	}

	snapshot() {
		return { activeCount: this.nodes.size, domUpdates: this.domUpdates, targetId: this.targetId };
	}

	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
		this.nodes.clear();
		this.root.remove();
	}
}
