// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapJourneyGuide.js
 * @description Projects either first-footstep guidance or canonical quest truth into one compact story beat.
 * The Awtsmoos lets the same small lantern carry dawn, mission, struggle, and return;
 * Awtsmoos.com replaces tutorial walls with the one true next sentence the traveler has earned.
 */

const WALK_REVEAL_DISTANCE = 7;
const JOURNEY_REVEAL_DISTANCE = 22;

/** Remembers first position while yielding immediately to canonical quest truth when it appears. */
export class BootstrapJourneyGuide {
	/** @param {object} runtime Immediate or hydrated Mitzvah World runtime. */
	constructor(runtime) {
		this.runtime = runtime;
		this.origin = positionOf(runtime.state);
	}

	/** @returns {{eyebrow:string,objective:string,hint:string}} Current compact narrative beat. */
	describe() {
		const quest = this.runtime.quest;
		const snapshot = quest?.snapshot?.();
		return snapshot
			? questBeat(this.runtime, snapshot)
			: onboardingBeat(this.runtime, this.origin);
	}
}

function questBeat(runtime, snapshot) {
	const definition = snapshot.definition || runtime.quest?.definition || {};
	const giver = definition.giver || {};
	const story = definition.story || {};
	const beats = {
		active: () => beat(
			definition.name || 'The eastern road',
			snapshot.currentObjective?.description || 'Continue the Shlichus.',
			progressHint(snapshot)
		),
		available: () => availableQuestBeat(runtime, definition, giver, story),
		completed: () => beat(
			'Shlichus fulfilled',
			'The eastern road breathes again.',
			'Measured intention remains with you.'
		),
		ready: () => beat(
			definition.name || 'The eastern road',
			`Return to ${giver.name || 'Reb Mendel'}.`,
			'Bring the recovered vessels home.'
		)
	};
	return beats[snapshot.status]?.() || beats.active();
}

function availableQuestBeat(runtime, definition, giver, story) {
	if (runtime.directContextAction?.hasOffer?.()) {
		return beat(
			story.chapter || definition.name || 'A road waits',
			story.opening || 'The eastern road carries an unfamiliar rhythm.',
			`Begin ${definition.name || 'the Shlichus'}.`
		);
	}
	return beat(
		giver.name || 'Reb Mendel the Watchman',
		`Find ${giver.name || 'Reb Mendel'} and hear what changed on the eastern road.`,
		story.purpose || 'The road is waiting for deliberate action.'
	);
}

function progressHint(snapshot) {
	const objective = snapshot.currentObjective || {};
	if (Number.isFinite(objective.progress) && Number.isFinite(objective.count)) {
		return `${objective.progress}/${objective.count} · ${phaseLabel(snapshot.phase)}`;
	}
	return phaseLabel(snapshot.phase);
}

function phaseLabel(phase) {
	const labels = {
		completed: 'The road is restored',
		defeat: 'Read each threat before acting',
		recovery: 'Recover what remains',
		return: 'Return to Reb Mendel'
	};
	return labels[phase] || 'Follow the road with intention';
}

function onboardingBeat(runtime, origin) {
	const state = runtime.state || {};
	const target = runtime.enemies?.selected?.profile?.name;
	if (target) {
		return beat('A presence stirs', `Face ${target} when you are ready.`, 'Stay moving. Act when the opening is clear.');
	}
	const distance = distanceFrom(origin, positionOf(state));
	if (distance >= JOURNEY_REVEAL_DISTANCE) {
		return beat('The valley opens', 'Follow the road toward the homes ahead.', 'Explore freely. The world will answer what you approach.');
	}
	if (distance >= WALK_REVEAL_DISTANCE || state.moving) {
		return beat('The first path', 'Keep toward the cottages beyond the meadow.', 'Move with the floating stick. Jump only when you need it.');
	}
	return beat('The valley wakes', 'Walk forward and find the first home.', 'Touch anywhere in the left movement zone and slide.');
}

function beat(eyebrow, objective, hint) {
	return { eyebrow, objective, hint };
}

function positionOf(state = {}) {
	return { x: Number(state.x) || 0, z: Number(state.z) || 0 };
}

function distanceFrom(origin, position) {
	return Math.hypot(position.x - origin.x, position.z - origin.z);
}
