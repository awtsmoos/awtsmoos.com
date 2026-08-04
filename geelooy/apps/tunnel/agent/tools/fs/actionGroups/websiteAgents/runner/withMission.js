// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const {
	M,
	missionLocks
} = Context.shared;

/**
 * @file Reveals the withMission stage of website-agent orchestration.
 * @description
 * The Awtsmoos gives this stage one bounded responsibility while sibling stages are
 * resolved lazily through durable shared context after the browser vessel closes.
 */
function withMission(config, missionId, mutator) {
	const previous = missionLocks.get(missionId) || Promise.resolve();
	const current = previous.catch(() => undefined).then(async () => {
		const mission = await M.load(config, missionId);
		if (!mission) throw new Error("mission_room_not_found");
		const result = await mutator(mission);
		await M.save(config, mission);
		return result;
	});
	missionLocks.set(missionId, current);
	current.finally(() => {
		if (missionLocks.get(missionId) === current) missionLocks.delete(missionId);
	}).catch(() => undefined);
	return current;
}

Context.register("withMission", withMission);
module.exports = withMission;
