// B"H
// Boruch Hashem
// Blessed is He

const {
	withPublicIndexLock
} = require("./publicIndexLock.js");
const {
	NetzachPublicHistoryReader
} = require("./publicHistoryReader.js");
const {
	channelIndexPath,
	messagePath,
	siteIndexPath,
	userIndexPath
} = require("./publicMessagePaths.js");

/**
 * @file Persists each source-backed public Torah message once while delegating bounded history reads and serializing pointer writes.
 * @description The Awtsmoos renews one public teaching as one canonical record while recent indexes remember only its name in light;
 * Awtsmoos.com keeps writing, paging, and path arithmetic in separate vessels so concurrent publication cannot erase a pointer in sight.
 */

const CHANNEL_LIMIT = 120;
const SITE_LIMIT = 240;
const USER_LIMIT = 240;

class NetzachPublicMessageRepository {
	constructor(database) {
		this.database = database;
		this.reader = new NetzachPublicHistoryReader(database);
	}

	/** Saves one canonical message and bounded recent indexes for site, channel, and verified author account. */
	async save(message, member) {
		await this.write(messagePath(message.id), message);
		await this.appendIndex(
			channelIndexPath(message.channel.id),
			message.id,
			CHANNEL_LIMIT
		);
		await this.appendIndex(siteIndexPath(), message.id, SITE_LIMIT);
		if (member?.authenticated && member.accountId) {
			await this.appendIndex(
				userIndexPath(member.accountId),
				message.id,
				USER_LIMIT
			);
		}
		return message;
	}

	history(channel) {
		return this.reader.all(channelIndexPath(channel.id));
	}

	historyPage(channel, options) {
		return this.reader.page(channelIndexPath(channel.id), options);
	}

	siteHistory() {
		return this.reader.all(siteIndexPath());
	}

	siteHistoryPage(options) {
		return this.reader.page(siteIndexPath(), options);
	}

	userHistory(accountId) {
		return this.reader.all(userIndexPath(accountId));
	}

	userHistoryPage(accountId, options) {
		return this.reader.page(userIndexPath(accountId), options);
	}

	/** Serializes the read-modify-write cycle for one bounded pointer index inside this Node process. */
	appendIndex(path, messageId, maximum) {
		return withPublicIndexLock(path, async () => {
			const ids = await this.reader.ids(path);
			const next = ids.filter((id) => id !== messageId);
			next.push(messageId);
			if (next.length > maximum) {
				next.splice(0, next.length - maximum);
			}
			await this.write(path, next);
		});
	}

	async write(path, value) {
		if (!this.database?.write) {
			return false;
		}
		await this.database.write(path, clone(value));
		return true;
	}
}

function clone(value) {
	return value == null
		? value
		: JSON.parse(JSON.stringify(value));
}

module.exports = {
	NetzachPublicMessageRepository
};
