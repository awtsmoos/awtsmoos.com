// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CastBarHud.js
 * @description Shows one bounded cast or channel with transform-only progress updates.
 */

import { torahAbilityDefinition } from '../gameplay/combat/TorahAbilityCatalog.js';

export class CastBarHud {
	constructor(host, bus) {
		this.bus = bus;
		this.active = null;
		this.domUpdates = 0;
		this.root = document.createElement('div');
		this.root.className = 'Mitzvah-castbar';
		this.root.hidden = true;
		this.root.innerHTML = '<span class="Mitzvah-castbar-name"></span>'
			+ '<span class="Mitzvah-castbar-time"></span>'
			+ '<i class="Mitzvah-castbar-fill"></i>';
		this.name = this.root.querySelector('.Mitzvah-castbar-name');
		this.time = this.root.querySelector('.Mitzvah-castbar-time');
		this.fill = this.root.querySelector('.Mitzvah-castbar-fill');
		host.appendChild(this.root);
		this.unsubscribers = [
			bus.on('torah:cast-start', detail => this.start(detail)),
			bus.on('torah:cast-complete', detail => this.finish(detail)),
			bus.on('torah:interrupt', detail => this.finish(detail)),
			bus.on('actionbar:result', detail => {
				if (!detail?.ok) this.finish(detail);
			})
		];
	}

	start(detail) {
		const definition = torahAbilityDefinition(detail?.abilityId);
		if (!definition) return;
		this.active = { ...detail, title: definition.title };
		this.name.textContent = definition.title;
		this.root.dataset.phase = detail.phase;
		this.root.hidden = false;
		this.domUpdates += 1;
		this.update(detail.startedAt);
	}

	update(now) {
		if (!this.active || this.root.hidden) return false;
		const duration = Math.max(1, this.active.completesAt - this.active.startedAt);
		const progress = Math.min(1, Math.max(0, (now - this.active.startedAt) / duration));
		const remaining = Math.max(0, this.active.completesAt - now);
		this.fill.style.transform = `scaleX(${progress})`;
		const label = `${(remaining / 1000).toFixed(1)}s`;
		if (this.time.textContent !== label) this.time.textContent = label;
		this.domUpdates += 1;
		return true;
	}

	finish(detail) {
		if (!this.active) return;
		if (detail?.castId && detail.castId !== this.active.castId) return;
		this.active = null;
		this.root.hidden = true;
		this.fill.style.transform = 'scaleX(0)';
		this.domUpdates += 1;
	}

	snapshot() {
		return { active: this.active ? { ...this.active } : null, domUpdates: this.domUpdates };
	}

	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
		this.root.remove();
	}
}
