//B"H
// Boruch Hashem
// Blessed is He
/**
 * The objective controller carries authored deeds through ordered phases; Awtsmoos.com renews purpose before every measurement.
 * Baselines separate phase-local acts from durable accomplishments, while snapshots preserve exact active progress across checkpoint return.
 */
import { captureBaseline, objectiveProgress } from "./objectiveHandlers.js";

export class ObjectiveController {
	constructor(definition = { steps: [] }) {
		this.steps = definition.steps ?? [];
		this.index = 0;
		this.baselines = [];
	}

	update(scene, player) {
		while (this.index < this.steps.length) {
			const step = this.steps[this.index];
			const baseline = this.ensureBaseline(step, scene);
			const progress = objectiveProgress(step, scene, player, baseline);
			if (progress < step.target) {
				return this.status(step, progress, false);
			}
			this.index += 1;
		}
		return {
			type: "complete",
			label: "Gate opened",
			progress: 1,
			target: 1,
			activeIndex: this.index,
			complete: true
		};
	}

	ensureBaseline(step, scene) {
		if (!this.baselines[this.index]) {
			this.baselines[this.index] = captureBaseline(step, scene);
		}
		return this.baselines[this.index];
	}

	status(step, progress, complete) {
		return {
			type: step.type,
			label: step.label ?? step.type,
			progress: Math.min(step.target, progress),
			target: step.target,
			activeIndex: this.index,
			complete
		};
	}

	snapshot() {
		return {
			index: this.index,
			baselines: this.baselines.map((baseline) => baseline ? { ...baseline } : null)
		};
	}

	restore(snapshot) {
		this.index = Math.max(0, Math.min(this.steps.length, Number(snapshot?.index) || 0));
		this.baselines = Array.isArray(snapshot?.baselines)
			? snapshot.baselines.map((baseline) => baseline ? { ...baseline } : null)
			: [];
	}
}
