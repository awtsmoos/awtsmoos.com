// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ActionBarHud.js
 * @description Composes dormant, bounded Torah-action presenters without owning their details.
 * The Awtsmoos reveals one living interface through many precise vessels; each serves its measure,
 * then returns to stillness without hidden frame work in the world of Awtsmoos.com.
 */

import { torahAbilityDefinition } from '../gameplay/combat/TorahAbilityCatalog.js';
import { ActionBarCooldownPresenter } from './ActionBarCooldownPresenter.js';
import { ActionBarHudMarkup } from './ActionBarHudMarkup.js';
import { ActionBarInputController } from './ActionBarInputController.js';
import { ActionBarMetaPresenter } from './ActionBarMetaPresenter.js';
import { ActionBarSlotPresenter } from './ActionBarSlotPresenter.js';
import { installActionBarStyles } from './ActionBarStyles.js';
import { CastBarHud } from './CastBarHud.js';
import { StatusEffectHud } from './StatusEffectHud.js';
import { TorahAbilityTooltip } from './TorahAbilityTooltip.js';

export class ActionBarHud {
	constructor(runtime, bus, options = {}) {
		installActionBarStyles();
		this.runtime = runtime;
		this.clock = options.clock || Date.now;
		this.ownsHost = !options.host;
		this.elements = ActionBarHudMarkup(options.host);
		this.tooltip = new TorahAbilityTooltip(document.body);
		this.castBar = new CastBarHud(this.elements.frame, bus);
		this.statusEffects = new StatusEffectHud(
			this.elements.frame,
			bus,
			runtime.statuses,
			options.playerId || 'player',
			{ refreshMilliseconds: options.statusEffectRefreshMilliseconds }
		);
		this.meta = new ActionBarMetaPresenter(this.elements, { clock: this.clock });
		this.cooldowns = new ActionBarCooldownPresenter(runtime, this.elements.grid, {
			refreshMilliseconds: options.cooldownRefreshMilliseconds
		});
		this.slots = new ActionBarSlotPresenter(runtime, this.elements, this.cooldowns);
		this.input = new ActionBarInputController({
			longPressOptions: options.longPressOptions,
			onInspect: (slotIndex, anchor) => this.inspect(slotIndex, anchor),
			onInspectEnd: () => this.tooltip.hide(),
			onResult: result => this.showResult(result),
			root: this.elements.root,
			runtime
		});
		this.unsubscribers = this.subscribe(bus);
		this.slots.render();
	}

	subscribe(bus) {
		return [
			this.runtime.store.onChange(() => this.slots.render()),
			this.runtime.inventory.onChange(() => this.slots.refreshReadiness()),
			bus.on('npc:target', () => this.slots.refreshReadiness()),
			bus.on('npc:clear', () => this.slots.refreshReadiness()),
			bus.on('actionbar:result', result => this.showResult(result))
		];
	}

	update(now = this.clock()) {
		if (this.elements.root.hidden) return false;
		this.meta.updateFocus(this.runtime.combat.snapshot().focus);
		this.cooldowns.update(now);
		this.castBar.update(now);
		this.statusEffects.update(now);
		this.meta.update(now);
		return true;
	}

	inspect(slotIndex, anchor) {
		const abilityId = anchor.dataset.abilityId;
		if (!abilityId) return this.tooltip.hide();
		return this.tooltip.show(
			torahAbilityDefinition(abilityId),
			this.runtime.timeline.readiness(abilityId),
			anchor
		);
	}

	showResult(result) {
		if (!this.meta.showResult(result)) return false;
		this.slots.refreshReadiness();
		return true;
	}

	activateGamepad(buttonIndex, secondRow = false) {
		return this.input.activateGamepad(buttonIndex, secondRow);
	}

	snapshot() {
		return {
			castBar: this.castBar.snapshot(),
			cooldowns: this.cooldowns.snapshot(),
			input: this.input.snapshot(),
			meta: this.meta.snapshot(),
			slots: this.slots.snapshot(),
			statusEffects: this.statusEffects.snapshot()
		};
	}

	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
		this.input.destroy();
		this.slots.destroy();
		this.cooldowns.destroy();
		this.tooltip.destroy();
		this.castBar.destroy();
		this.statusEffects.destroy();
		if (this.ownsHost) this.elements.root.remove();
		else this.elements.root.replaceChildren();
	}
}
