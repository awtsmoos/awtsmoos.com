// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("crypto");
const { read, write } = require("./database.js");
const { paths } = require("./paths.js");

/**
 * @file Persists the planned canonical message before append so response loss or process death cannot turn one intention into two.
 * @description The Awtsmoos contains beginning and completion in one truth; Awtsmoos.com stores the finite breadcrumb between them,
 * letting a pending vessel be repaired and a committed vessel be remembered when transport must travel the same road again.
 */

class HodMessageIntentRepository {
	constructor(database) {
		this.database = database;
	}

	/** Reads the durable receipt for one sender, conversation, and client intent. */
	get(actorKey, conversationId, clientIntentId) {
		return read(this.database, this.path(actorKey, conversationId, clientIntentId), null);
	}

	/** Persists the exact planned canonical message before its page is changed. */
	begin(actorKey, conversationId, clientIntentId, message) {
		return this.save(actorKey, conversationId, clientIntentId, {
			status: "pending",
			message,
			updatedAt: Date.now()
		});
	}

	/** Marks an exact canonical message as durably accepted for future retries. */
	commit(actorKey, conversationId, clientIntentId, message) {
		return this.save(actorKey, conversationId, clientIntentId, {
			status: "committed",
			message,
			updatedAt: Date.now()
		});
	}

	save(actorKey, conversationId, clientIntentId, receipt) {
		return write(this.database, this.path(actorKey, conversationId, clientIntentId), receipt);
	}

	path(actorKey, conversationId, clientIntentId) {
		return paths.messageIntent(
			actorKey,
			digest(conversationId),
			digest(clientIntentId)
		);
	}
}

function digest(value) {
	return crypto.createHash("sha256").update(String(value)).digest("hex");
}

module.exports = {
	HodMessageIntentRepository
};
