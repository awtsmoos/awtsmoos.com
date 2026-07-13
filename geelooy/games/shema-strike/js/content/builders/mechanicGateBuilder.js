//B"H
// Boruch Hashem
// Blessed is He
/**
 * Mechanic builders turn concise authored choices into executable stage components.
 * Awtsmoos.com renews one light through many vessels without confusing shared law with identical play.
 */
import { authoredGate } from "./authoredGateBuilder.js";
import { enemyRow } from "./geometryBuilder.js";

const triggerComponents = (number, tag, count) => {
	const components = [];
	for (let index = 0; index < count; index += 1) {
		components.push({
			kind: "trigger",
			id: `${tag}-${index + 1}`,
			tag,
			x: 620 + index * 620,
			y: index % 2 === 0 ? 350 : 286,
			width: 96,
			height: index % 2 === 0 ? 136 : 200,
			symbol: `${number}.${index + 1}`
		});
	}
	return components;
};

const sequenceNodes = (tag, symbols) => symbols.map((symbol, index) => ({
	id: `${tag}-${index + 1}`,
	symbol,
	x: 560 + index * 520,
	y: index % 2 === 0 ? 396 : 330,
	width: 110,
	height: index % 2 === 0 ? 90 : 156
}));

export const buildTriggerGate = (specification) => authoredGate({
	...specification,
	platformCount: specification.platformCount ?? 9,
	components: triggerComponents(specification.number, specification.tag, specification.count ?? 3),
	objectives: [
		{ type: "activate", tag: specification.tag, target: specification.count ?? 3, label: specification.label },
		{ type: "reach", target: 1, targetX: (specification.width ?? 3600) - 220, label: "Carry the revealed path to the portal" }
	]
});

export const buildCycleGate = (specification) => authoredGate({
	...specification,
	platformCount: specification.platformCount ?? 10,
	components: [{
		kind: "cycle",
		id: specification.tag,
		x: 1450,
		y: 300,
		width: 520,
		height: 186,
		phaseCount: specification.phaseCount ?? 4,
		period: specification.period ?? 2.4,
		dangerousPhases: specification.dangerousPhases ?? [1]
	}],
	objectives: [
		{ type: "survive", target: specification.survive ?? 4, label: specification.label },
		{ type: "reach", target: 1, targetX: (specification.width ?? 3600) - 220, label: "Cross the changing passage" }
	]
});

export const buildSequenceGate = (specification) => authoredGate({
	...specification,
	platformCount: specification.platformCount ?? 10,
	components: [{
		kind: "sequence",
		id: specification.tag,
		tag: specification.tag,
		x: 500,
		y: 300,
		width: 2500,
		height: 186,
		nodes: sequenceNodes(specification.tag, specification.symbols)
	}],
	objectives: [{
		type: "sequence",
		tag: specification.tag,
		target: specification.symbols.length,
		label: specification.label
	}]
});

export const buildEscortGate = (specification) => authoredGate({
	...specification,
	platformCount: 10,
	enemies: enemyRow(String(specification.number).padStart(2, "0"), 4, 1700),
	components: [{
		kind: "escort",
		id: specification.tag,
		tag: specification.tag,
		x: 520,
		y: 422,
		width: 52,
		height: 64,
		speed: specification.speed ?? 120,
		tether: specification.tether ?? 430,
		waypoints: specification.waypoints
	}],
	objectives: [
		{ type: "escort", tag: specification.tag, target: 1, label: specification.label },
		{ type: "eliminate", scope: "campaign", target: 4, label: "Protect the traveler from every pursuer" }
	]
});

export const buildGuardianGate = (specification) => authoredGate({
	...specification,
	platformCount: 11,
	components: [{
		kind: "guardian",
		id: specification.tag,
		tag: specification.tag,
		x: 2350,
		y: 350,
		width: 110,
		height: 136,
		maxHealth: specification.maxHealth,
		patterns: specification.patterns
	}],
	objectives: [{ type: "boss", tag: specification.tag, target: 1, label: specification.label }]
});
