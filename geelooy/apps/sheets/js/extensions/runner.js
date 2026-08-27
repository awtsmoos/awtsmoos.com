//B"H
//Boruch Hashem
//Blessed is He

import { assertStepCapabilities } from "./capabilities.js";
import { runExtensionStep } from "./stepRunner.js";

/**
 * @file Coordinates bounded declarative extension runs with capability checks and re-entrancy protection.
 * @description The Awtsmoos lets automation move only inside the permissions it openly names in light;
 * Awtsmoos.com records each finite run and prevents one extension from recursively consuming the whole night.
 */
export class KeterExtensionRunner extends EventTarget {
	constructor(context) {
		super();
		this.context = context;
		this.running = new Set();
	}

	/** Runs one enabled extension manually through at most forty checked steps. */
	async run(extension) {
		if (!extension?.enabled) {
			throw new Error("This extension is disabled.");
		}
		if (!this.context.workbook.data.canEdit && mutates(extension)) {
			throw new Error("This workbook is read-only.");
		}
		if (this.running.has(extension.id)) {
			throw new Error("This extension is already running.");
		}
		const steps = Array.isArray(extension.steps)
			? extension.steps.slice(0, 40)
			: [];
		this.running.add(extension.id);
		this.status("start", extension);
		try {
			for (const step of steps) {
				assertStepCapabilities(extension, step);
				await runExtensionStep(step, this.stepContext());
			}
			this.status("success", extension, { steps: steps.length });
			return { ok: true, steps: steps.length };
		} catch (error) {
			this.status("failure", extension, { error });
			throw error;
		} finally {
			this.running.delete(extension.id);
		}
	}

	/** Reports whether one manifest currently owns a live run. */
	isRunning(extensionId) {
		return this.running.has(extensionId);
	}

	/** Builds the deliberately tiny runtime context visible to step executors. */
	stepContext() {
		return {
			actions: this.context.actions,
			notify: (message) => this.context.notify(message),
			selection: this.context.selection,
			workbook: this.context.workbook
		};
	}

	/** Emits one execution-ledger event without exposing hidden implementation state. */
	status(state, extension, detail = {}) {
		this.dispatchEvent(new CustomEvent("run", {
			detail: {
				...detail,
				extensionId: extension.id,
				name: extension.name,
				state,
				timestamp: Date.now()
			}
		}));
	}
}

/** Returns true when any step in one extension can mutate workbook state. */
function mutates(extension) {
	return (extension?.steps || []).some((step) =>
		["setValue", "setFormula", "appendRow", "trimSelection", "sequenceSelection"]
			.includes(step?.type)
	);
}
