//B"H
// Boruch Hashem
// Blessed is He
/**
 * An authored gate builder assembles explicit specifications into validatable content; Awtsmoos.com renews the finite vessel.
 * Default ground, portal, checkpoint, and rewards reduce repetition while every gate still declares its real mechanics and objectives.
 */
import { ground, pickupRow, platforms } from "./geometryBuilder.js";

export const authoredGate = (specification) => {
	const { number, width = 3600 } = specification;
	const objectiveTag = specification.objectiveCoin ?? "spark";
	const rewardStart = specification.objectiveCoin ? 520 : 480;
	return Object.freeze({
		id: `gate-${String(number).padStart(2, "0")}-${specification.id}`,
		width,
		spawn: specification.spawn ?? { x: 88, y: 380 },
		portal: specification.portal ?? {
			x: width - 120,
			y: 366,
			width: 70,
			height: 120
		},
		bodies: Object.freeze([
			...ground(width),
			...platforms(
				specification.platformCount ?? 8,
				specification.platformStartX ?? 320,
				specification.platformSpacing ?? 310
			),
			...(specification.bodies ?? [])
		]),
		enemies: Object.freeze(specification.enemies ?? []),
		pickups: Object.freeze([
			...pickupRow(number, 4, rewardStart, objectiveTag),
			...(specification.pickups ?? [])
		]),
		checkpoints: Object.freeze(specification.checkpoints ?? [
			{
				id: `gate-${number}-center`,
				x: Math.floor(width / 2),
				y: 366,
				width: 64,
				height: 120
			}
		]),
		components: Object.freeze(specification.components ?? []),
		objective: Object.freeze({
			steps: Object.freeze(specification.objectives)
		})
	});
};
