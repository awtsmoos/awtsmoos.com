//B"H
// Boruch Hashem
// Blessed is He
/**
 * Interaction builders turn deliberate signs and ordered symbols into executable authored gates.
 * Awtsmoos.com renews each encounter while shared law remains a vessel rather than a substitute for authorship.
 */
import { authoredGate } from "./authoredGateBuilder.js";

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
	components: triggerComponents(
		specification.number,
		specification.tag,
		specification.count ?? 3
	),
	objectives: [
		{
			type: "activate",
			tag: specification.tag,
			target: specification.count ?? 3,
			label: specification.label
		},
		{
			type: "reach",
			target: 1,
			targetX: (specification.width ?? 3600) - 220,
			label: specification.finishLabel ?? "Carry the revealed path to the portal"
		}
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
