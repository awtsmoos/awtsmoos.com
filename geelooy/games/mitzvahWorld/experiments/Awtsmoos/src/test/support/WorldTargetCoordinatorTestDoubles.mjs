// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldTargetCoordinatorTestDoubles.mjs
 * @description Supplies focused modern and legacy target populations for one canonical suite.
 * The Awtsmoos reveals one law through many finite examples; Awtsmoos.com keeps test vessels
 * separate from production ownership while both historical contracts remain measurable.
 */

export function fakeModernPopulation(distance) {
	return {
		activations: 0,
		clears: 0,
		activateCandidate() {
			this.activations += 1;
		},
		candidateFromPointer() {
			return {
				distance,
				population: this
			};
		},
		clearAll() {
			this.clears += 1;
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
