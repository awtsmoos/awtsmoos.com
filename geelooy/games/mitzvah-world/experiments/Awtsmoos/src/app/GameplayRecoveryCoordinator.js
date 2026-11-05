// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GameplayRecoveryCoordinator.js
 * @description Coordinates unstuck, checkpoint, objective, encounter, and reconnect repair.
 * The Awtsmoos renews movement, mission, conflict, and connection through distinct vessels;
 * Awtsmoos.com joins them under one inspectable command surface without fabricating progress.
 */

import { publishRecoveryFeedback } from './GameplayRecoveryFeedback.js';
import { resetInvalidLocalEncounters } from './GameplayRecoveryEncounter.js';
import { reconcileGameplayAfterReconnect } from './GameplayRecoveryReconciliation.js';

export class GameplayRecoveryCoordinator {
	constructor(runtime) {
		this.runtime = runtime;
		this.count = 0;
		this.lastReceipt = null;
		this.unsubscribers = [];
		this.bind();
	}

	unstuck() {
		const restored = this.runtime.movementRecovery?.unstuck?.(
			this.runtime.state
		);
		return this.publish('unstuck', restored, 'Returned to the last safe footing.');
	}

	returnCheckpoint() {
		const restored = this.runtime.movementRecovery?.returnToCheckpoint?.(
			this.runtime.state
		);
		return this.publish('return-checkpoint', restored, 'Returned to the last safe checkpoint.');
	}

	repairObjective() {
		this.runtime.questStore?.publish?.();
		this.runtime.expansionLandmarks?.update?.();
		this.runtime.bus?.emit?.('quest:objective-recovered', {
			quests: this.runtime.questStore?.snapshot?.() || null
		});
		return this.publish('quest-objective', true, 'Quest objective presentation was restored.');
	}

	resetEncounter() {
		const resetCount = resetInvalidLocalEncounters(this.runtime);
		this.runtime.bus?.emit?.('enemy:encounter-recovered', { resetCount });
		return this.publish(
			'encounter-reset',
			true,
			resetCount ? 'Invalid local encounter actors were restored.' : 'Encounter state was already valid.',
			{ resetCount }
		);
	}

	async reconcile() {
		const detail = await reconcileGameplayAfterReconnect(this.runtime);
		return this.publish(
			'reconnect-reconcile',
			Boolean(detail),
			detail ? 'Authoritative gameplay state was reconciled.' : 'No deployed authority required reconciliation.',
			detail
		);
	}

	diagnostics() {
		return Object.freeze({ count: this.count, lastReceipt: this.lastReceipt });
	}

	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
		this.unsubscribers.length = 0;
	}

	bind() {
		this.listen('recovery:unstuck', () => this.unstuck());
		this.listen('recovery:return-checkpoint', () => this.returnCheckpoint());
		this.listen('recovery:quest-objective', () => this.repairObjective());
		this.listen('recovery:encounter-reset', () => this.resetEncounter());
		this.listen('multiplayer:reconnected', () => this.reconcile());
		this.listen('network:reconnected', () => this.reconcile());
	}

	listen(type, handler) {
		const unsubscribe = this.runtime.bus?.on?.(type, handler);
		if (unsubscribe) this.unsubscribers.push(unsubscribe);
	}

	publish(action, success, message, detail = null) {
		this.count += 1;
		this.lastReceipt = publishRecoveryFeedback(this.runtime, {
			action,
			count: this.count,
			detail,
			message,
			success
		});
		return this.lastReceipt;
	}
}
