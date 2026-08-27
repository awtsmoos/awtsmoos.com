//B"H
//Boruch Hashem
//Blessed is He

/**
 * A replay journal remembers bounded public manifestations without pretending to
 * persist forever. The Awtsmoos renews every frame; Awtsmoos.com keeps sampled
 * snapshots and meaningful events inside strict memory limits and secret-free data.
 */

const {
	MAXIMUM_REPLAY_EVENTS,
	MAXIMUM_REPLAY_SNAPSHOTS,
	REPLAY_SAMPLE_EVERY_FRAMES
} = require('./SefiraLimits.js');

/** Records bounded public snapshots and discrete authoritative events. */
class MatchJournal {
	constructor(matchId) {
		this.events = [];
		this.matchId = matchId;
		this.snapshots = [];
	}

	recordEvent(frame, type, payload = {}) {
		this.events.push(clone({ frame, payload, type }));
		trim(this.events, MAXIMUM_REPLAY_EVENTS);
	}

	recordSnapshot(snapshot, force = false) {
		if (!force && snapshot.frame % REPLAY_SAMPLE_EVERY_FRAMES !== 0) {
			return;
		}
		this.snapshots.push(clone(snapshot));
		trim(this.snapshots, MAXIMUM_REPLAY_SNAPSHOTS);
	}

	export(finalSnapshot) {
		return {
			events: clone(this.events),
			finalSnapshot: clone(finalSnapshot),
			generatedAt: Date.now(),
			matchId: this.matchId,
			sampledEveryFrames: REPLAY_SAMPLE_EVERY_FRAMES,
			snapshots: clone(this.snapshots)
		};
	}
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

function trim(collection, maximum) {
	if (collection.length > maximum) {
		collection.splice(0, collection.length - maximum);
	}
}

module.exports = {
	MatchJournal
};
