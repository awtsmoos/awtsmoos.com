// B"H
/** @file MovieDoorDirector.js @description Samples door tracks into exact live door matrices. */
import { lerp } from './MovieEasing.js';

export class MovieDoorDirector {
	constructor(runtime) {
		this.runtime = runtime;
		this.byId = new Map(runtime.doors.map((door) => [door.def.id, door]));
	}

	apply(doorStates) {
		for (const state of doorStates) {
			const door = this.byId.get(state.track.target);
			if (!door) continue;
			door.t = Math.max(0, Math.min(1, lerp(
				state.clip.from,
				state.clip.to,
				state.eased
			)));
			door.state = door.t >= .999 ? 'open' : door.t <= .001 ? 'closed' : 'opening';
			door.setPose();
		}
	}
}

export default MovieDoorDirector;
