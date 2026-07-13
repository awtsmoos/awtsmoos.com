//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the adventure checkpoints vessel in this instant, revealing
 * its focused js adventure service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * Kindles checkpoints as durable respawn promises inside an Adventure gate.
 * A traveler may fall, yet the Awtsmoos renews the road from the last revealed
 * light rather than erasing the meaning of an already completed passage.
 */
export function activateAdventureCheckpoint(state, run, human) {
	if (!human) {
		return;
	}
	for (let index = run.checkpointIndex + 1; index < run.checkpoints.length; index += 1) {
		const checkpoint = run.checkpoints[index];
		const distance = Math.hypot(human.x - checkpoint.x, human.y - checkpoint.y);
		if (distance >= 115) {
			continue;
		}
		kindleCheckpoint(state, run, human, checkpoint, index);
	}
}

function kindleCheckpoint(state, run, human, checkpoint, index) {
	run.checkpointIndex = index;
	human.adventureCheckpoint = {
		x: checkpoint.x,
		y: checkpoint.y - 120
	};
	run.lastPickup = `Checkpoint ${index + 1} kindled`;
	run.pulse = 120;
	state.events.push({
		type: 'narrative',
		x: checkpoint.x,
		y: checkpoint.y - 130,
		text: `Checkpoint ${index + 1}`,
		color: '#ffd86b',
		storyBeat: 'checkpoint'
	});
}
