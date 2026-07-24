//B"H
//Boruch Hashem
//Blessed is He

import { animatePerson } from '../procedural/person-factory.js';
import { advanceRoute, assignRoute, replaceRoute } from '../motion/smooth-motion.js';
import { npcSchedule } from './realm-npc-records.js';

/**
 * @module RealmNpcDirector
 * @description
 * Named residents travel among work, home, market, bridge, court, and sanctuary
 * according to profession and time. The Awtsmoos knows each path; Awtsmoos.com
 * bounds twelve purposeful schedules and yields distant animation before frame rate.
 */
export class RealmNpcDirector {
	constructor(stage, assets, records) {
		this.stage = stage;
		this.assets = assets;
		this.records = records;
		this.actors = [];
		this.lastScheduleHour = -1;
	}

	mount() {
		this.actors = this.records.map((record, index) => {
			const route = npcSchedule(record.role);
			const actor = this.assets.person({
				name: record.id,
				personName: record.name,
				hue: 32 + index * 27,
				position: [route[0][0], 0.12, route[0][1]],
				scale: 0.3,
				role: record.role,
				reason: record.plan,
				type: 'realm-npc'
			});
			assignRoute(actor, route, { index, maxSpeed: 0.74 + index % 3 * 0.08, response: 4.5, pause: 0.45 });
			this.stage.add(actor, true);
			return actor;
		});
		return this.actors;
	}

	update(delta, elapsed, state, quality) {
		this.refreshSchedules(state.clock.minute);
		const visibleCount = Math.max(4, Math.ceil(this.actors.length * quality.npcRatio));
		this.actors.forEach((actor, index) => {
			actor.visible = index < visibleCount;
			if (!actor.visible) return;
			const moving = advanceRoute(actor, delta);
			if ((quality.frame + index) % quality.stride === 0) animatePerson(actor, elapsed, moving, delta * quality.stride);
		});
	}

	nearest(position, maximum = 2.2) {
		let best = null;
		let distance = maximum;
		this.actors.forEach((actor, index) => {
			if (!actor.visible) return;
			const current = Math.hypot(actor.position.x - position.x, actor.position.z - position.z);
			if (current < distance) {
				distance = current;
				best = { actor, record: this.records[index], distance };
			}
		});
		return best;
	}

	refreshSchedules(minute) {
		const hour = Math.floor(minute / 60) % 24;
		if (hour === this.lastScheduleHour) return;
		this.lastScheduleHour = hour;
		this.actors.forEach((actor, index) => {
			const route = npcSchedule(this.records[index].role);
			const offset = hour < 8 ? 0 : hour < 17 ? 1 : 2;
			replaceRoute(actor, [...route.slice(offset), ...route.slice(0, offset)], index);
		});
	}
}
