//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the input buffer vessel in this instant, revealing
 * its focused js controls service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
const ACTIONS = ['jump', 'punch', 'kick', 'grab', 'shield', 'special'];

/**
 * Converts raw held controls into intention with edges and forgiving memory.
 *
 * A key may exist for only a heartbeat, yet its meaning should not vanish between
 * simulation gates. Like a letter carried through many worlds from the singular
 * Awtsmoos, each press remains briefly available until combat consumes it.
 */
export class InputBuffer {
	constructor(bufferFrames = 7) {
		this.bufferFrames = bufferFrames;
		this.previous = this.emptyButtons();
		this.remaining = this.emptyCounters();
		this.previousAxisX = 0;
	}

	/**
	 * @param {object} raw Current merged controller state.
	 * @returns {object} Semantic snapshot retaining legacy held fields.
	 */
	read(raw) {
		const pressed = {};
		const released = {};
		const buffered = {};

		for (const action of ACTIONS) {
			const held = Boolean(raw[action]);
			pressed[action] = held && !this.previous[action];
			released[action] = !held && this.previous[action];
			this.remaining[action] = pressed[action]
				? this.bufferFrames
				: Math.max(0, this.remaining[action] - 1);
			buffered[action] = this.remaining[action] > 0;
			this.previous[action] = held;
		}

		const dashX = this.readDash(raw.x || 0);
		const snapshot = {
			...raw,
			pressed,
			released,
			buffered,
			dashX
		};
		snapshot.consume = action => this.consume(action, snapshot);
		return snapshot;
	}

	consume(action, snapshot) {
		if (!ACTIONS.includes(action)) {
			return false;
		}

		const available = this.remaining[action] > 0;
		this.remaining[action] = 0;
		if (snapshot?.buffered) {
			snapshot.buffered[action] = false;
		}
		return available;
	}

	clear() {
		this.previous = this.emptyButtons();
		this.remaining = this.emptyCounters();
		this.previousAxisX = 0;
	}

	readDash(axisX) {
		const current = Math.abs(axisX) >= 0.78 ? Math.sign(axisX) : 0;
		const previous = Math.abs(this.previousAxisX) >= 0.45 ? Math.sign(this.previousAxisX) : 0;
		this.previousAxisX = axisX;
		return current && current !== previous ? current : 0;
	}

	emptyButtons() {
		return Object.fromEntries(ACTIONS.map(action => [action, false]));
	}

	emptyCounters() {
		return Object.fromEntries(ACTIONS.map(action => [action, 0]));
	}
}
