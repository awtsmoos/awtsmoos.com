//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ObstacleCourseActivityDefinition.js
 * @description
 * Binds one renderer-neutral Core obstacle-course plan to MitzvahWorld gameplay policy.
 * The Awtsmoos gives measure to motion and purpose to pace; Awtsmoos.com lets one
 * authored path become a replayable race without mixing renderer truth into grace.
 */

const DEFAULT_COUNTDOWN_MS = 3000;
const DEFAULT_MEDAL_TARGETS_MS = Object.freeze({
	gold: 45000,
	silver: 60000,
	bronze: 90000
});

/**
 * @description Creates one frozen MitzvahWorld activity definition from a validated Core plan.
 * @param {object} coursePlan Renderer-neutral Core obstacle-course plan.
 * @param {object} [policy={}] MitzvahWorld gameplay policy overrides.
 * @returns {Readonly<object>} Frozen activity definition.
 */
export function createObstacleCourseActivityDefinition(coursePlan, policy = {}) {
	assertCoursePlan(coursePlan);
	const checkpointIds = coursePlan.elements
		.filter((element) => element.kind === 'checkpoint')
		.slice()
		.sort((left, right) => left.sequence - right.sequence)
		.map((checkpoint) => checkpoint.id);
	if (!checkpointIds.length) {
		throw new TypeError('Obstacle course activities require at least one checkpoint.');
	}
	return Object.freeze({
		activityId: String(policy.activityId ?? coursePlan.id),
		activityTarget: String(policy.activityTarget ?? coursePlan.id),
		checkpointIds: Object.freeze(checkpointIds),
		countdownMs: positiveInteger(policy.countdownMs ?? DEFAULT_COUNTDOWN_MS, 'countdownMs'),
		courseId: String(coursePlan.id),
		medalTargetsMs: normalizeMedalTargets(policy.medalTargetsMs),
		reward: Object.freeze({ ...(policy.reward ?? {}) }),
		systemVersion: 1,
		title: String(policy.title ?? coursePlan.title)
	});
}

/**
 * @description Verifies that Core supplied a valid obstacle-course plan vessel.
 * @param {object} coursePlan Candidate Core plan.
 * @returns {void}
 */
function assertCoursePlan(coursePlan) {
	if (!coursePlan || coursePlan.kind !== 'obstacle-course' || !Array.isArray(coursePlan.elements)) {
		throw new TypeError('A canonical Core obstacle-course plan is required.');
	}
	if (coursePlan.validation?.valid === false) {
		throw new TypeError('Invalid Core obstacle-course plans cannot become activities.');
	}
}

/**
 * @description Normalizes ordered medal thresholds while preserving faster-is-better law.
 * @param {object} [targets] Candidate medal thresholds in milliseconds.
 * @returns {Readonly<object>} Frozen medal targets.
 */
function normalizeMedalTargets(targets = DEFAULT_MEDAL_TARGETS_MS) {
	const gold = positiveInteger(targets.gold ?? DEFAULT_MEDAL_TARGETS_MS.gold, 'gold');
	const silver = positiveInteger(targets.silver ?? DEFAULT_MEDAL_TARGETS_MS.silver, 'silver');
	const bronze = positiveInteger(targets.bronze ?? DEFAULT_MEDAL_TARGETS_MS.bronze, 'bronze');
	if (!(gold <= silver && silver <= bronze)) {
		throw new RangeError('Medal targets must satisfy gold <= silver <= bronze.');
	}
	return Object.freeze({ gold, silver, bronze });
}

/**
 * @description Converts a gameplay duration policy into a positive integer.
 * @param {unknown} value Candidate numeric value.
 * @param {string} label Error label.
 * @returns {number} Positive integer value.
 */
function positiveInteger(value, label) {
	const numericValue = Number(value);
	if (!Number.isInteger(numericValue) || numericValue <= 0) {
		throw new RangeError(`${label} must be a positive integer.`);
	}
	return numericValue;
}
