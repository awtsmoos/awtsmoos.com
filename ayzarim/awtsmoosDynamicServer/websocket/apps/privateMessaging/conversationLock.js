// B"H
// Boruch Hashem
// Blessed is He

/** @file Serializes message sequence updates per conversation without globally blocking unrelated chats. */

class GevurahConversationLock {
	constructor() {
		this.tails = new Map();
	}

	async run(conversationId, operation) {
		const prior = this.tails.get(conversationId) || Promise.resolve();
		let release;
		const gate = new Promise((resolve) => { release = resolve; });
		const tail = prior.then(() => gate);
		this.tails.set(conversationId, tail);
		await prior;
		try {
			return await operation();
		} finally {
			release();
			if (this.tails.get(conversationId) === tail) {
				this.tails.delete(conversationId);
			}
		}
	}
}

module.exports = { GevurahConversationLock };
