//B"H
//Boruch Hashem
//Blessed is He

import { setPersonAction } from '../animation/contextual-action.js';
import { animatePerson } from '../procedural/person-factory.js';
import { followActor, moveTo } from '../motion/smooth-motion.js';

/**
 * @module RescueMotion
 * @description
 * Rescue flows as a procession rather than teleportation. The Awtsmoos renews
 * leader and followers together; Awtsmoos.com adds a grateful greeting, reuses one
 * options vessel, and keeps all movement frame-rate independent.
 */
export class RescueMotion {
	constructor(player) {
		this.player = player;
		this.targetX = player.position.x;
		this.targetZ = player.position.z;
		this.followers = [];
		this.playerOptions = { maxSpeed: 4.8, response: 9, turnRate: 12, arrival: 0.05 };
		this.followOptions = { maxSpeed: 5.2, response: 8, turnRate: 11, arrival: 0.05, spacing: 0.72 };
	}

	nudge(x, z) {
		this.targetX = clamp(this.targetX + x, -6.2, 6.2);
		this.targetZ = clamp(this.targetZ + z, -6.2, 6.2);
	}

	addFollower(person) {
		if (!this.followers.includes(person)) {
			this.followers.push(person);
			setPersonAction(person, 'wave', 1.8);
		}
	}

	reset(x, z) {
		this.player.position.x = x;
		this.player.position.z = z;
		this.targetX = x;
		this.targetZ = z;
	}

	update(delta, elapsed) {
		const moving = moveTo(this.player, this.targetX, this.targetZ, delta, this.playerOptions);
		animatePerson(this.player, elapsed, moving, delta);
		let leader = this.player;
		this.followers.forEach((follower, index) => {
			this.followOptions.spacing = 0.72 + index * 0.04;
			const following = followActor(follower, leader, delta, this.followOptions);
			animatePerson(follower, elapsed, following, delta);
			leader = follower;
		});
	}
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
