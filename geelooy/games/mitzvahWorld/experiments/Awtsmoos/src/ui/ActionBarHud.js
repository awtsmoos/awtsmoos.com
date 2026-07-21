// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ActionBarHud.js
 * @description Presents the persistent Torah action bar without per-frame DOM reconstruction.
 */

import { torahAbilityDefinition } from '../gameplay/combat/TorahAbilityCatalog.js';
import { ActionBarHudMarkup } from './ActionBarHudMarkup.js';
import { ActionBarInputController } from './ActionBarInputController.js';
import {
	renderActionBarSlots,
	updateActionSlotCooldown,
	updateActionSlotReadiness
} from './ActionBarSlotView.js';
import { installActionBarStyles } from './ActionBarStyles.js';
import { CastBarHud } from './CastBarHud.js';
import { StatusEffectHud } from './StatusEffectHud.js';
import { TorahAbilityTooltip } from './TorahAbilityTooltip.js';

export class ActionBarHud {
	constructor(runtime, bus, options = {}) {
		installActionBarStyles();
		this.runtime = runtime;
		this.bus = bus;
		this.clock = options.clock || Date.now;
		this.ownsHost = !options.host;
		this.elements = ActionBarHudMarkup(options.host);
		this.domUpdates = 0;
		this.feedbackExpiresAt = 0;
		this.focusSignature = '';
		this.tooltip = new TorahAbilityTooltip(document.body);
		this.castBar = new CastBarHud(this.elements.frame, bus);
		this.statusEffects = new StatusEffectHud(
			this.elements.frame,
			bus,
			runtime.statuses,
			options.playerId || 'player'
		);
		this.input = new ActionBarInputController({
			onInspect: (slotIndex, anchor) => this.inspect(slotIndex, anchor),
			onInspectEnd: () => this.tooltip.hide(),
			onResult: result => this.showResult(result),
			root: this.elements.root,
			runtime
		});
		this.unsubscribers = [
			runtime.store.onChange(() => this.render()),
			runtime.inventory.onChange(() => this.refreshReadiness()),
			bus.on('npc:target', () => this.refreshReadiness()),
			bus.on('npc:clear', () => this.refreshReadiness()),
			bus.on('actionbar:result', result => this.showResult(result))
		];
		this.render();
	}

	render() {
		const layout = this.runtime.store.snapshot();
		renderActionBarSlots(this.elements.grid, layout);
		this.elements.lock.textContent = layout.locked ? 'Layout locked' : 'Lock layout';
		this.elements.lock.setAttribute('aria-pressed', String(layout.locked));
		this.refreshReadiness();
		this.domUpdates += 1;
	}

	refreshReadiness() {
		for (const button of this.elements.grid.querySelectorAll('.Mitzvah-action-slot')) {
			const abilityId = button.dataset.abilityId;
			const decision = abilityId
				? this.runtime.timeline.readiness(abilityId)
				: { ok: false, reason: 'empty-slot' };
			updateActionSlotReadiness(button, decision);
		}
		this.domUpdates += 1;
	}

	update(now = this.clock()) {
		if (this.elements.root.hidden) return false;
		this.updateFocus();
		for (const button of this.elements.grid.querySelectorAll('[data-ability-id]')) {
			const definition = torahAbilityDefinition(button.dataset.abilityId);
			const state = this.runtime.timeline.cooldowns.snapshotAbility(definition, now);
			updateActionSlotCooldown(button, definition, state);
		}
		this.castBar.update(now);
		this.statusEffects.update(now);
		if (this.feedbackExpiresAt && now >= this.feedbackExpiresAt) {
			this.elements.feedback.hidden = true;
			this.feedbackExpiresAt = 0;
		}
		this.domUpdates += 1;
		return true;
	}

	updateFocus() {
		const focus = this.runtime.combat.snapshot().focus;
		const ratio = focus.maximum ? Math.min(1, focus.current / focus.maximum) : 0;
		const signature = `${Math.round(focus.current)}:${Math.round(focus.maximum)}`;
		if (signature === this.focusSignature) return;
		this.focusSignature = signature;
		this.elements.focusFill.style.setProperty('--focus-ratio', ratio.toFixed(3));
		this.elements.focusLabel.textContent = `${Math.floor(focus.current)} / ${Math.floor(focus.maximum)} focus`;
		this.elements.focusTrack.setAttribute('aria-valuemax', focus.maximum);
		this.elements.focusTrack.setAttribute('aria-valuenow', focus.current);
	}

	inspect(slotIndex, anchor) {
		const abilityId = anchor.dataset.abilityId;
		if (!abilityId) return this.tooltip.hide();
		this.tooltip.show(
			torahAbilityDefinition(abilityId),
			this.runtime.timeline.readiness(abilityId),
			anchor
		);
	}

	showResult(result) {
		if (!result) return;
		this.elements.feedback.textContent = result.ok ? 'Torah ability ready' : readable(result.reason);
		this.elements.feedback.dataset.state = result.ok ? 'accepted' : 'rejected';
		this.elements.feedback.hidden = false;
		this.feedbackExpiresAt = this.clock() + 1800;
		this.refreshReadiness();
	}

	activateGamepad(buttonIndex, secondRow = false) {
		return this.input.activateGamepad(buttonIndex, secondRow);
	}

	snapshot() {
		return {
			castBar: this.castBar.snapshot(),
			domUpdates: this.domUpdates,
			statusEffects: this.statusEffects.snapshot()
		};
	}

	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
		this.input.destroy();
		this.tooltip.destroy();
		this.castBar.destroy();
		this.statusEffects.destroy();
		if (this.ownsHost) this.elements.root.remove();
		else this.elements.root.replaceChildren();
	}
}

function readable(reason) {
	return String(reason || 'Unavailable').replaceAll('-', ' ');
}
