// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ActionBarHud.js
 * @description Coordinates action slots, cooldowns, casts, statuses, tooltip inspection, and input as one bounded HUD facade.
 * The Awtsmoos joins many changing signals without confusing their ownership; Awtsmoos.com keeps each mechanism modular while this facade preserves one stable public fellowship.
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
	/**
	 * @param {object} runtime Action-bar runtime facade.
	 * @param {object} bus Event bus publishing combat/target lifecycle signals.
	 * @param {object} [options={}] Clock, host, refresh, and input options.
	 */
	constructor(runtime, bus, options = {}) {
		installActionBarStyles();
		this.runtime = runtime;
		this.clock = options.clock || Date.now;
		this.ownsHost = !options.host;
		this.elements = ActionBarHudMarkup(options.host);
		this.tooltip = new TorahAbilityTooltip(this.elements.frame);
		this.displays = new ActionBarCombatDisplays(this.elements.frame, bus, runtime, options);
		this.meta = new ActionBarMetaPresenter(this.elements, { clock: this.clock });
		this.cooldowns = new ActionBarCooldownPresenter(runtime, this.elements.grid, {
			refreshMilliseconds: options.cooldownRefreshMilliseconds
		});
		this.slots = new ActionBarSlotPresenter(runtime, this.elements, this.cooldowns);
		this.input = this.createInputController(options);
		this.unsubscribers = this.subscribe(bus);
		this.slots.render();
	}

	/** @returns {ActionBarInputController} Input controller bound to this HUD. */
	createInputController(options) {
		return new ActionBarInputController({
			longPressOptions: options.longPressOptions,
			onInspect: (slotIndex, anchor) => this.inspect(slotIndex, anchor),
			onInspectEnd: () => this.tooltip.hide(),
			onResult: result => this.showResult(result),
			root: this.elements.root,
			runtime: this.runtime
		});
	}

	/** @param {object} bus Event bus. @returns {Function[]} Unsubscribe callbacks. */
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

	/** @param {number} [now=this.clock()] Frame timestamp. @returns {boolean} Whether visible HUD state updated. */
	update(now = this.clock()) {
		if (this.elements.root.hidden) return false;
		this.meta.updateFocus(this.runtime.combat.snapshot().focus);
		this.cooldowns.update(now);
		this.displays.update(now);
		this.meta.update(now);
		return true;
	}

	/** @param {number} slotIndex Slot index. @param {HTMLElement} anchor Slot element. @returns {boolean} Tooltip reveal result. */
	inspect(slotIndex, anchor) {
		const actionId = anchor.dataset.actionId;
		if (!actionId) return Boolean(this.tooltip.hide());
		return this.tooltip.show(actionBarActionDefinition(actionId), this.runtime.readinessForSlot(slotIndex), anchor);
	}

	/** @param {object} result Action/combat result. @returns {boolean} Whether result was presented. */
	showResult(result) {
		if (!this.meta.showResult(result)) return false;
		this.slots.refreshReadiness();
		return true;
	}

	/** @param {number} buttonIndex Gamepad button. @param {boolean} [secondRow=false] Row modifier. @returns {*} Input result. */
	activateGamepad(buttonIndex, secondRow = false) { return this.input.activateGamepad(buttonIndex, secondRow); }

	/** @returns {object} Serializable HUD state snapshot. */
	snapshot() {
		return { ...this.displays.snapshot(), cooldowns: this.cooldowns.snapshot(), input: this.input.snapshot(), meta: this.meta.snapshot(), slots: this.slots.snapshot() };
	}

	/** @returns {void} Releases subscriptions, presenters, tooltip, and owned DOM. */
	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
		this.input.destroy(); this.slots.destroy(); this.cooldowns.destroy(); this.tooltip.destroy(); this.displays.destroy();
		if (this.ownsHost) this.elements.root.remove(); else this.elements.root.replaceChildren();
	}
}
