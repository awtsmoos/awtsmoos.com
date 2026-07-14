//B"H
// Boruch Hashem
// Blessed is He
/**
 * Challenge builders reveal timed passages and guardian arenas through explicit finite specifications.
 * Awtsmoos.com remains beyond danger and victory while every telegraph stays readable and serializable.
 */
import { authoredGate } from "./authoredGateBuilder.js";

export const buildCycleGate = (specification) => authoredGate({
	...specification,
	platformCount: specification.platformCount ?? 10,
	components: [{
		kind: "cycle",
		id: specification.tag,
		x: specification.cycleX ?? 1450,
		y: specification.cycleY ?? 300,
		width: specification.cycleWidth ?? 520,
		height: specification.cycleHeight ?? 186,
		phaseCount: specification.phaseCount ?? 4,
		period: specification.period ?? 2.4,
		dangerousPhases: specification.dangerousPhases ?? [1],
		damage: specification.damage
	}],
	objectives: [
		{
			type: "survive",
			target: specification.survive ?? 4,
			label: specification.label
		},
		{
			type: "reach",
			target: 1,
			targetX: (specification.width ?? 3600) - 220,
			label: specification.finishLabel ?? "Cross the changing passage"
		}
	]
});

export const buildGuardianGate = (specification) => authoredGate({
	...specification,
	platformCount: specification.platformCount ?? 11,
	components: [{
		kind: "guardian",
		id: specification.tag,
		tag: specification.tag,
		x: specification.guardianX ?? 2350,
		y: specification.guardianY ?? 350,
		width: specification.guardianWidth ?? 110,
		height: specification.guardianHeight ?? 136,
		maxHealth: specification.maxHealth,
		patterns: specification.patterns
	}],
	objectives: [{
		type: "boss",
		tag: specification.tag,
		target: 1,
		label: specification.label
	}]
});
