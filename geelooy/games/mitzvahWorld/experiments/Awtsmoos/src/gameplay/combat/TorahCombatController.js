// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TorahCombatController.js
 * @description Commits canonical passage focus and history only after accepted world consequence.
 * The Awtsmoos lets study, turn, target, impact, and reward arrive in their truthful order;
 * Awtsmoos.com keeps one focus meter and inventory history, never a shadow combat border.
 */

import { bindTorahCombatEvents } from './TorahCombatEventBindings.js';
import { TorahFocusMeter } from './TorahFocusMeter.js';
import { evaluateTorahStudyUse } from './TorahStudyRules.js';
import { reserveTorahCombatTurn } from './TorahCombatTurnGateway.js';

export class TorahCombatController {
	constructor(options) {
		this.bus = options.bus;
		this.clock = options.clock || Date.now;
		this.inventory = options.inventory;
		this.profile = options.profile;
		this.turns = options.turns || null;
		this.focus = options.focus || new TorahFocusMeter({
			clock: this.clock,
			maximum: this.profile.snapshot().derived.focusMaximum
		});
		this.selectedTarget = null;
		this.pendingUse = null;
		this.completedUseResult = null;
		this.unsubscribers = bindTorahCombatEvents(this, this.bus);
	}

	usePassage(requestedPassage, options = {}) {
		const now = this.clock();
		this.focus.synchronizeMaximum(this.profile.snapshot().derived.focusMaximum, now);
		const decision = evaluateTorahStudyUse(this.inventory.snapshot(), requestedPassage, now, {
			focus: this.focus.snapshot(now).current,
			skipPassageCooldown: Boolean(options.skipPassageCooldown),
			targetAttackable: Boolean(this.selectedTarget?.attackable),
			targetRequired: options.targetRequired
		});
		if (!decision.ok) return this.publishResult({ ...decision, requestId: options.requestId || null });
		const turnDecision = reserveTorahCombatTurn(this.turns, decision, options, now);
		if (!turnDecision.ok) {
			return this.publishResult({ ok: false, reason: turnDecision.reason, requestId: options.requestId || null });
		}
		this.completedUseResult = null;
		this.pendingUse = { ...decision, requestId: options.requestId || null };
		if (options.worldImpactRequired === false) {
			this.receiveImpact({ accepted: true, kind: 'support' });
		} else {
			this.bus.emit('torah:use', decision.passage);
		}
		if (this.pendingUse) {
			this.pendingUse = null;
			this.publishResult({ ok: false, reason: 'TARGET_UNAVAILABLE', requestId: options.requestId || null });
		}
		return options.returnResult ? this.completedUseResult : true;
	}

	receiveTarget(payload) {
		this.selectedTarget = payload?.attackable ? payload : null;
	}

	clearTarget(payload) {
		if (!payload?.id || payload.id === this.selectedTarget?.id) this.selectedTarget = null;
	}

	receiveImpact(impact) {
		const pending = this.pendingUse;
		if (!pending) return;
		this.pendingUse = null;
		if (!impact?.accepted) {
			this.publishResult({ ok: false, reason: impact?.reason || 'ABILITY_REJECTED', requestId: pending.requestId });
			return;
		}
		const now = this.clock();
		if (!this.focus.spend(pending.focusCost, now)) {
			this.publishResult({ ok: false, reason: 'INSUFFICIENT_FOCUS', requestId: pending.requestId });
			return;
		}
		this.inventory.markPassageUsed(pending.passage.id, now);
		this.publishResult({
			...impact,
			focus: this.focus.snapshot(now),
			ok: true,
			passage: pending.passage,
			requestId: pending.requestId
		});
	}

	publishResult(result) {
		this.completedUseResult = result;
		this.bus.emit('torah:result', result);
		return result;
	}

	snapshot() {
		return {
			focus: this.focus.snapshot(this.clock()),
			selectedTarget: this.selectedTarget ? { ...this.selectedTarget } : null,
			selectedTargetId: this.selectedTarget?.id || null
		};
	}

	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
	}
}
