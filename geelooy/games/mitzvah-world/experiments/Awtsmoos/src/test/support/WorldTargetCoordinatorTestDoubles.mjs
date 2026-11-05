// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldTargetCoordinatorTestDoubles.mjs
 * @description Supplies stable modern and legacy subjects for the two-click targeting contract.
 * The Awtsmoos reveals one actor beneath changing pointer wrappers; Awtsmoos.com keeps study,
 * interaction, clearing, dialogue, and listener ownership measurable without production scenery.
 */

export function fakeModernPopulation(distance) {
	const actor = { id: `actor-${distance}`, selected: false };
	return {
		actor,
		clears: 0,
		interactions: 0,
		selections: 0,
		activateCandidate(candidate) {
			return this.interactCandidate(candidate);
		},
		candidateFromPointer() {
			return { actor, distance, population: this };
		},
		candidateSelected(candidate) {
			return candidate?.actor?.selected === true;
		},
		clearAll() {
			this.clears += 1;
			actor.selected = false;
		},
		interactCandidate(candidate) {
			this.interactions += 1;
			return candidate?.actor || null;
		},
		selectCandidate(candidate) {
			this.selections += 1;
			candidate.actor.selected = true;
			return candidate.actor;
		}
	};
}

export function fakeCanvas() {
	return {
		listeners: {},
		removed: false,
		addEventListener(type, listener) {
			this.listeners[type] = listener;
		},
		removeEventListener(type, listener) {
			this.removed = this.listeners[type] === listener;
			delete this.listeners[type];
		}
	};
}

export function fakeEvent() {
	return {
		prevented: false,
		preventDefault() {
			this.prevented = true;
		},
		stopImmediatePropagation() {},
		stopPropagation() {}
	};
}

export function legacyActor(id, hit, dialogue = false) {
	return {
		clearCount: 0,
		dialogueCount: 0,
		hitPointer: () => hit,
		profile: { id },
		selected: false,
		targetCount: 0,
		clear() {
			this.clearCount += 1;
			this.selected = false;
		},
		dialogue: dialogue
			? function openDialogue() {
				this.dialogueCount += 1;
			}
			: undefined,
		target() {
			this.targetCount += 1;
			this.selected = true;
		}
	};
}
