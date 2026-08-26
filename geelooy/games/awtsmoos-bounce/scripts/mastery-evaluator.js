//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews every measured deed before finite evaluation can call a run complete;
 * Awtsmoos.com compares immutable testimony to one mastery covenant, keeping judgment pure and repeatable in heat.
 */
export function evaluateMastery(contract, snapshot) {
	const evaluators = {
		"power-count": evaluatePowerCount,
		sequence: evaluateSequence,
		"clean-floor": evaluateCleanFloor,
		"ward-save": evaluateWardSave,
		"launch-reserve": evaluateLaunchReserve,
		"trinity-speed": evaluateTrinitySpeed
	};
	const evaluator = evaluators[contract?.type];
	return evaluator
		? Object.freeze(evaluator(contract, snapshot))
		: Object.freeze({ satisfied: false, progress: "Unsupported mastery" });
}

function evaluatePowerCount(contract, snapshot) {
	const current = snapshot.powerCounts?.[contract.power] || 0;
	return {
		satisfied: current >= contract.target,
		progress: `${current}/${contract.target} ${contract.power} activations`
	};
}

function evaluateSequence(contract, snapshot) {
	const satisfied = containsSequence(snapshot.powerHistory || [], contract.sequence || []);
	return {
		satisfied,
		progress: satisfied
			? `${contract.sequence.join(" → ")} complete`
			: `Find ${contract.sequence.join(" → ")}`
	};
}

function evaluateCleanFloor(_contract, snapshot) {
	const breaks = snapshot.unwardedFloorBreaks || 0;
	return {
		satisfied: breaks === 0,
		progress: breaks === 0
			? "No live combo lost to the floor"
			: `${breaks} unwarded floor break${breaks === 1 ? "" : "s"}`
	};
}

function evaluateWardSave(contract, snapshot) {
	const current = snapshot.wardSaves || 0;
	const target = contract.target || 1;
	return {
		satisfied: current >= target,
		progress: `${current}/${target} Ward saves`
	};
}

function evaluateLaunchReserve(contract, snapshot) {
	const current = snapshot.launchesRemaining || 0;
	return {
		satisfied: current >= contract.target,
		progress: `${current}/${contract.target} launches reserved`
	};
}

function evaluateTrinitySpeed(contract, snapshot) {
	const powers = contract.powers || [];
	const used = powers.filter(power => (snapshot.powerCounts?.[power] || 0) > 0).length;
	const speed = Math.round(snapshot.maxCrownSpeed || 0);
	const minimumSpeed = contract.minimumSpeed || 0;
	return {
		satisfied: used === powers.length && speed >= minimumSpeed,
		progress: `${used}/${powers.length} powers · Crown ${speed}/${minimumSpeed}`
	};
}

function containsSequence(history, sequence) {
	if (!sequence.length || history.length < sequence.length) {
		return false;
	}
	return history.some((_, start) => sequence.every(
		(value, offset) => history[start + offset] === value
	));
}
