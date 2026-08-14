// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Keeps bounded source-backed chat history per context and across the whole Awtsmoos.com conversation.
 * @description The Awtsmoos renews each contextual teaching while one universal river remembers every labeled shore;
 * Awtsmoos.com keeps both memories finite, so continuity grows without turning RAM into an endless store.
 */

const CHANNEL_LIMIT = 120;
const SITE_LIMIT = 240;

/** Owns bounded contextual histories plus one aggregate site-wide recent feed. */
class BinahChannelDirectory {
	constructor() {
		this.channels = new Map();
		this.site = [];
	}

	/** Appends one validated source-only message to its channel and the aggregate feed. */
	append(message) {
		const history = this.channels.get(message.channel.id) || [];
		history.push(message);
		trim(history, CHANNEL_LIMIT);
		this.channels.set(message.channel.id, history);
		this.site.push(message);
		trim(this.site, SITE_LIMIT);
		return clone(message);
	}

	/** Returns detached recent history for one contextual channel. */
	history(channel) {
		return clone(this.channels.get(channel.id) || []);
	}

	/** Returns detached recent messages from every contextual channel. */
	siteHistory() {
		return clone(this.site);
	}
}

/** Removes the oldest excess entries from one bounded list. */
function trim(values, maximum) {
	if (values.length > maximum) {
		values.splice(0, values.length - maximum);
	}
}

/** Creates one JSON-safe detached copy. */
function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

module.exports = {
	BinahChannelDirectory
};
