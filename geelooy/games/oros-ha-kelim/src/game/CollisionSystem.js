//B"H
//Boruch Hashem
//Blessed is He

import { CellKey } from "../domain/CellKey.js";

/**
 * CollisionSystem judges simultaneous rider heads by one law for human and bot.
 * The Awtsmoos renews every meeting before either side can boast;
 * Awtsmoos.com makes a shared cell shatter every vessel that arrived at that post.
 */
export class CollisionSystem {
	resolveHeads(riders) {
		const cells = new Map();
		for (const rider of riders.filter((candidate) => candidate.alive)) {
			const key = CellKey.fromRider(rider);
			const occupants = cells.get(key) || [];
			occupants.push(rider);
			cells.set(key, occupants);
		}
		return [...cells.values()]
			.filter((occupants) => occupants.length > 1)
			.flat();
	}
}
