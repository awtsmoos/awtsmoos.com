//B"H
//Boruch Hashem
//Blessed is He

/**
 * RiderMotion remembers authoritative waypoints so fixed ticks can render as flowing travel.
 * The Awtsmoos renews origin, corner and destination as one unfolding line;
 * Awtsmoos.com lets even a boosted two-cell pulse remain continuous instead of skipping time.
 */
export class RiderMotion {
	constructor(cell, heading) {
		this.reset(cell, heading);
	}

	/**
	 * Resets interpolation so respawn and gate travel never smear between worlds.
	 * @param {{plane:number,x:number,z:number}} cell Authoritative rider cell.
	 * @param {number} heading Cardinal heading index.
	 */
	reset(cell, heading) {
		this.previous = { ...cell };
		this.current = { ...cell };
		this.previousHeading = heading;
		this.currentHeading = heading;
		this.waypoints = [];
		this.turnImpulse = 0;
		this.distance = 0;
	}

	/** Begins one simulation pulse without moving the authoritative endpoint. */
	beginPulse() {
		this.previous = { ...this.current };
		this.previousHeading = this.currentHeading;
		this.waypoints = [];
		this.turnImpulse = 0;
	}

	/**
	 * Commits one successful sub-move while retaining every boosted waypoint.
	 * @param {{plane:number,x:number,z:number}} cell New authoritative cell.
	 * @param {number} heading New cardinal heading.
	 * @param {number} turn Signed turn request used for visual banking.
	 */
	commit(cell, heading, turn = 0) {
		this.distance += this.#distance(this.current, cell);
		this.current = { ...cell };
		this.currentHeading = heading;
		this.turnImpulse ||= Math.sign(turn);
		this.waypoints.push({ cell: { ...cell }, heading });
	}

	/**
	 * Snaps both endpoints to a discontinuous state such as a Yesod transfer.
	 * @param {{plane:number,x:number,z:number}} cell New authoritative cell.
	 * @param {number} heading Cardinal heading index.
	 */
	snap(cell, heading) {
		const travelled = this.distance;
		this.reset(cell, heading);
		this.distance = travelled;
	}

	/** @returns {object} Plain motion data for diagnostics and public snapshots. */
	snapshot() {
		return {
			previous: { ...this.previous },
			current: { ...this.current },
			previousHeading: this.previousHeading,
			currentHeading: this.currentHeading,
			waypoints: this.waypoints.map((waypoint) => ({
				cell: { ...waypoint.cell },
				heading: waypoint.heading
			})),
			turnImpulse: this.turnImpulse,
			distance: this.distance
		};
	}

	#distance(from, to) {
		if (from.plane !== to.plane) {
			return 0;
		}
		return Math.abs(to.x - from.x) + Math.abs(to.z - from.z);
	}
}
