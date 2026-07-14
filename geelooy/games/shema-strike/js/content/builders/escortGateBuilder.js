//B"H
// Boruch Hashem
// Blessed is He
/**
 * Escort construction binds companionship, waypoint motion, and honest encounter credit into one authored contract.
 * Awtsmoos.com renews guide, guardian, and road while the component preserves exact checkpoint state.
 */
import { authoredGate } from "./authoredGateBuilder.js";
import { enemyRow } from "./geometryBuilder.js";

export const buildEscortGate = (specification) => {
	const enemyCount = specification.enemyCount ?? 4;
	return authoredGate({
		...specification,
		platformCount: specification.platformCount ?? 10,
		enemies: enemyRow(
			String(specification.number).padStart(2, "0"),
			enemyCount,
			specification.enemyStartX ?? 1700
		),
		components: [{
			kind: "escort",
			id: specification.tag,
			tag: specification.tag,
			x: specification.startX ?? 520,
			y: specification.startY ?? 422,
			width: 52,
			height: 64,
			speed: specification.speed ?? 120,
			tether: specification.tether ?? 430,
			waypoints: specification.waypoints
		}],
		objectives: [
			{
				type: "escort",
				tag: specification.tag,
				target: 1,
				label: specification.label
			},
			{
				type: "eliminate",
				scope: "campaign",
				target: enemyCount,
				label: specification.combatLabel ?? "Protect the traveler from every pursuer"
			}
		]
	});
};
