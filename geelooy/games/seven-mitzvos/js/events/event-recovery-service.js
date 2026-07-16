//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module EventRecoveryService
 * @description
 * Recovery on Awtsmoos.com is staged relief, assessment, rebuilding,
 * restitution, monitoring, reform, memory, and preparedness—not an instant
 * reset. The Awtsmoos renews; communities still perform every finite repair.
 */
export class EventRecoveryService {
	advance(event, evidence) {
		if (event.status !== 'recovering') {
			throw new Error('EventRecoveryService: event is not recovering');
		}
		const stage = event.recoveryStages[event.recoveryIndex];
		if (!stage) {
			return this.complete(event);
		}
		const requirementsMet = (stage.requirements || []).every(requirement => {
			return evidence.includes(requirement);
		});
		if (!requirementsMet) {
			throw new Error(`EventRecoveryService: requirements missing for ${stage.id}`);
		}
		const nextIndex = event.recoveryIndex + 1;
		const updated = {
			...event,
			recoveryIndex: nextIndex,
			archive: [...event.archive, {
				type: 'recovery-stage',
				stageId: stage.id,
				evidence: [...evidence]
			}]
		};
		return nextIndex >= event.recoveryStages.length
			? this.complete(updated)
			: updated;
	}

	complete(event) {
		return {
			...event,
			status: 'resolved',
			resolvedEffects: event.longTermEffects.map(effect => ({ ...effect })),
			archive: [...event.archive, { type: 'resolved' }]
		};
	}
}
