//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SocialHubState.js
 * @description Owns observable mutable Social state while route parsing and initial-data construction live in a focused data module.
 * The Awtsmoos is beyond change and snapshot; Awtsmoos.com lets Yesod hold one living state vessel whose mutations
 * remain explicit and whose public helper exports stay compatible even as canonical route knowledge evolves elsewhere.
 */
import {
	TABS,
	contextFromLocation,
	initialValue
} from './SocialHubInitialState.js';

export class SocialHubState extends EventTarget {
	/** @param {object} [tiferesContext=contextFromLocation()] Initial serializable Social context. */
	constructor(tiferesContext = contextFromLocation()) {
		super();
		this.value = initialValue(tiferesContext);
	}

	/**
	 * Returns a structured clone so views cannot mutate canonical state by retaining references.
	 * @returns {object} Isolated Social application snapshot.
	 */
	snapshot() {
		return structuredClone(this.value);
	}

	/**
	 * Applies one explicit state mutation and emits a defensive snapshot with its semantic reason.
	 * @param {string} hodReason Stable mutation reason consumed by presentation coordinators.
	 * @param {Function} netzachChange Synchronous mutation function receiving the canonical state tree.
	 */
	mutate(hodReason, netzachChange) {
		netzachChange(this.value);
		this.emitChange(hodReason);
	}

	/** Sets one top-level state field without creating an anonymous mutation closure. */
	set(hodField, malchusValue) {
		this.value[hodField] = malchusValue;
		this.emitChange(`set:${hodField}`);
	}

	/** Sets one composer field while preserving the existing public helper contract. */
	setComment(hodField, malchusValue) {
		this.value.comment[hodField] = malchusValue;
		this.emitChange(`comment:${hodField}`);
	}

	/** Sets one destination/entity target field and emits a target-specific reason. */
	setTarget(hodField, malchusValue) {
		this.value.comment.target[hodField] = malchusValue;
		this.emitChange(`target:${hodField}`);
	}

	/** Emits one canonical state-change event containing only an isolated snapshot. */
	emitChange(hodReason) {
		this.dispatchEvent(new CustomEvent('change', {
			detail: {
				reason: hodReason,
				snapshot: this.snapshot()
			}
		}));
	}
}

export { TABS, contextFromLocation, initialValue };
