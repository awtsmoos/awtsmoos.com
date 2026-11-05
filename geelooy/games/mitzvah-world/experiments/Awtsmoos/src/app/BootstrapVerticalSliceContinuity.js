//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file BootstrapVerticalSliceContinuity.js
 * @description Restores and persists the real Blank Meadow teaching quest without rich boss systems.
 * The Awtsmoos is beyond every remembered step; Awtsmoos.com carries one honest finite thread,
 * preserving unowned boss, Daas, reward, claim, and accessibility vessels while quest and recovery proceed.
 * Recovery witnesses are throttled to one write per second: a burst of recoveries describes one
 * fall, and the record is rebuilt from living quest and recovery state whenever it is written.
 */

import { MinimalMeadowTeachingQuestRuntime } from './MinimalMeadowTeachingQuestRuntime.js';
import { MinimalMeadowVerticalSlicePersistence } from './MinimalMeadowVerticalSlicePersistence.js';

const RECOVERY_SAVE_THROTTLE_MS = 1000;

export class BootstrapVerticalSliceContinuity {
	constructor(runtime, environment = globalThis) {
		this.runtime = runtime;
		this.persistence = new MinimalMeadowVerticalSlicePersistence(environment);
		this.record = this.persistence.load();
		this.lastSave = null;
		this.lastRecoverySaveAt = 0;
		runtime.teachingQuest = new MinimalMeadowTeachingQuestRuntime(
			runtime,
			this.record.quest
		);
		this.stopAdvanced = runtime.bus?.on?.(
			'teaching-quest:advanced',
			() => this.save('quest-advanced')
		) || null;
		this.stopCompleted = runtime.bus?.on?.(
			'teaching-quest:completed',
			() => this.save('quest-completed')
		) || null;
		this.stopRecovery = runtime.bus?.on?.(
			'movement:recovered',
			() => this.save('recovery')
		) || null;
	}

	save(reason = 'state-change') {
		if (reason === 'recovery') {
			const now = Date.now();
			if (now - this.lastRecoverySaveAt < RECOVERY_SAVE_THROTTLE_MS) return true;
			this.lastRecoverySaveAt = now;
		}
		const record = this.persistence.save({
			...this.record,
			quest: this.runtime.teachingQuest?.snapshot?.() || this.record.quest,
			recovery: this.runtime.movementRecovery?.diagnostics?.()
				|| this.record.recovery
		});
		this.record = record;
		this.lastSave = Object.freeze({
			reason,
			saveError: record.saveError || null,
			savedAt: record.savedAt
		});
		return !record.saveError;
	}

	diagnostics() {
		return Object.freeze({
			lastSave: this.lastSave,
			loadError: this.record.loadError || null,
			quest: this.runtime.teachingQuest?.snapshot?.() || null,
			recovery: this.runtime.movementRecovery?.diagnostics?.() || null
		});
	}

	destroy() {
		this.stopAdvanced?.();
		this.stopCompleted?.();
		this.stopRecovery?.();
		this.runtime.teachingQuest?.destroy?.();
	}
}
