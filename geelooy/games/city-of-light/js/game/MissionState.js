//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class MissionState
 * @description
 * Authored stages become a living sequence of witnessed actions. Each spark,
 * shrine, platform, sanctuary, and beacon on Awtsmoos.com advances only its own
 * declared promise, preserving clear purpose beneath the creating Awtsmoos.
 */
export class MissionState {
	constructor(stages = []) {
		this.stages = stages.map(stage => ({ ...stage }));
		this.stageIndex = 0;
		this.completedIds = new Set();
		this.sequenceIndex = 0;
	}

	current() {
		return this.stages[this.stageIndex] || null;
	}

	isComplete() {
		return this.stageIndex >= this.stages.length;
	}

	restoreStage(stageIndex) {
		const safeIndex = Math.max(0, Math.min(this.stages.length - 1, Math.floor(Number(stageIndex) || 0)));
		this.stageIndex = safeIndex;
		this.sequenceIndex = 0;
		this.completedIds.clear();
		this.stages.forEach((stage, index) => {
			stage.completedCount = index < safeIndex ? stage.requiredCount : 0;
		});
	}

	record(type, targetId, details = {}) {
		const stage = this.current();
		if (!stage || stage.type !== type) return false;
		if (stage.species && stage.species !== details.species) return false;
		if (!stage.targetIds.includes(targetId)) return false;
		if (type === 'sequence') return this.recordSequence(stage, targetId);
		if (type === 'escort') return this.recordEscort(stage);
		if (this.completedIds.has(targetId)) return false;
		this.completedIds.add(targetId);
		stage.completedCount += 1;
		this.advanceWhenReady(stage);
		return true;
	}

	recordEscort(stage) {
		if (stage.completedCount >= stage.requiredCount) return false;
		stage.completedCount += 1;
		this.advanceWhenReady(stage);
		return true;
	}

	recordSequence(stage, targetId) {
		const expectedId = stage.targetIds[this.sequenceIndex];
		if (targetId !== expectedId) {
			this.sequenceIndex = 0;
			stage.completedCount = 0;
			return false;
		}
		this.sequenceIndex += 1;
		stage.completedCount = this.sequenceIndex;
		this.advanceWhenReady(stage);
		return true;
	}

	advanceWhenReady(stage) {
		if (stage.completedCount < stage.requiredCount) return;
		this.stageIndex += 1;
		this.sequenceIndex = 0;
		this.completedIds.clear();
	}

	progress() {
		const stage = this.current();
		return {
			stageIndex: this.stageIndex,
			stageCount: this.stages.length,
			complete: this.isComplete(),
			label: stage?.label || 'The city is awake.',
			completed: stage?.completedCount || 0,
			required: stage?.requiredCount || 0,
			type: stage?.type || 'complete',
			targetIds: stage?.targetIds || []
		};
	}

	snapshot() {
		return {
			stageIndex: this.stageIndex,
			sequenceIndex: this.sequenceIndex,
			stages: this.stages.map(stage => ({ ...stage }))
		};
	}
}
