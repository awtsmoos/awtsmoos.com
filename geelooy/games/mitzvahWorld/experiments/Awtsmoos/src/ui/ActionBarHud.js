// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ActionBarHud.js
 * @description Composes one bounded HUD for Torah actions, cooldowns, casts, statuses, and insight.
 * The Awtsmoos reveals one interface through many faithful vessels, each serving its measure;
 * Awtsmoos.com preserves readiness, hostile warning, rhythm, and player treasure.
 */
import { actionBarActionDefinition } from '../gameplay/actionbar/ActionBarActionCatalog.js';
import { ActionBarCombatDisplays } from './ActionBarCombatDisplays.js';
import { ActionBarCooldownPresenter } from './ActionBarCooldownPresenter.js';
import { ActionBarHudMarkup } from './ActionBarHudMarkup.js';
import { ActionBarInputController } from './ActionBarInputController.js';
import { ActionBarMetaPresenter } from './ActionBarMetaPresenter.js';
import { ActionBarSlotPresenter } from './ActionBarSlotPresenter.js';
import { installActionBarStyles } from './ActionBarStyles.js';
import { TorahAbilityTooltip } from './TorahAbilityTooltip.js';

export class ActionBarHud {
	constructor(runtime, bus, options = {}) {
		installActionBarStyles();
		this.runtime = runtime;
		this.clock = options.clock || Date.now;
		this.ownsHost = !options.host;
		this.elements = ActionBarHudMarkup(options.host);
		this.tooltip = new TorahAbilityTooltip(document.body);
		this.displays = new ActionBarCombatDisplays(
			this.elements.frame,
			bus,
			runtime,
			options
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
			bus.on('actionbar:result', result => this.showResult(result)),
			bus.on('combat:melee-result', result => this.showResult(result))
		];
	}

	update(now = this.clock()) {
		if (this.elements.root.hidden) return false;
		this.meta.updateFocus(this.runtime.combat.snapshot().focus);
		this.cooldowns.update(now);
		this.displays.update(now);
		this.meta.update(now);
		return true;
	}

	inspect(slotIndex, anchor) {
		const actionId = anchor.dataset.actionId;
		if (!actionId) return this.tooltip.hide();
		return this.tooltip.show(
			actionBarActionDefinition(actionId),
			this.runtime.readinessForSlot(slotIndex),
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
			...this.displays.snapshot(),
			cooldowns: this.cooldowns.snapshot(),
			input: this.input.snapshot(),
			meta: this.meta.snapshot(),
			slots: this.slots.snapshot()
		};
	}

	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
		this.input.destroy();
		this.slots.destroy();
		this.cooldowns.destroy();
		this.tooltip.destroy();
		this.displays.destroy();
		if (this.ownsHost) this.elements.root.remove();
		else this.elements.root.replaceChildren();
	}
}
