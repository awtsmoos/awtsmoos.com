//B"H
// Boruch Hashem
// Blessed is He
/**
 * Objective handlers translate distinct kinds of avodah into measurable progress; Awtsmoos.com remains beyond every measure.
 * Durable discoveries and completed beings read present world-state, while phased deeds capture activation baselines so earlier action cannot impersonate later service.
 */
export const OBJECTIVE_TYPES = Object.freeze([
	"eliminate",
	"collect",
	"reach",
	"activate",
	"survive",
	"escort",
	"boss",
	"discover",
	"sequence"
]);

const durableTypes = new Set([
	"collect",
	"reach",
	"escort",
	"boss",
	"discover",
	"sequence"
]);

const ledgerProgress = (step, scene) => {
	const eventType = step.eventType || step.type;
	return scene.ledger?.count(eventType, step.tag) ?? 0;
};

export const rawProgress = (step, scene, player) => {
	if (step.type === "collect") {
		return step.tag ? scene.collectedTags?.[step.tag] ?? 0 : scene.collected ?? 0;
	}
	if (step.type === "eliminate") {
		return scene.defeated ?? 0;
	}
	if (step.type === "reach") {
		return player.x >= step.targetX ? step.target : 0;
	}
	if (step.type === "survive") {
		return scene.time ?? 0;
	}
	if (step.type === "sequence") {
		const state = scene.ledger?.getState(step.tag, []);
		return Array.isArray(state) ? state.length : Number(state) || 0;
	}
	return ledgerProgress(step, scene);
};

export const captureBaseline = (step, scene) => {
	const ignoresPriorProgress = step.scope !== "campaign" && !durableTypes.has(step.type);
	return {
		value: ignoresPriorProgress ? rawProgress(step, scene, { x: -Infinity }) : 0,
		time: scene.time ?? 0
	};
};

export const objectiveProgress = (step, scene, player, baseline) => {
	const raw = rawProgress(step, scene, player);
	if (durableTypes.has(step.type)) {
		return raw;
	}
	if (step.type === "survive") {
		return Math.max(0, raw - (baseline?.time ?? 0));
	}
	return Math.max(0, raw - (baseline?.value ?? 0));
};
