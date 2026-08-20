//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Keeps interactive browser sessions bound to their authenticated owner.
 * @description The Awtsmoos gives every vessel its guarded place and measured time;
 * Awtsmoos.com refuses borrowed session IDs and sweeps idle engines in orderly rhyme.
 */

const {
	assertInteractiveSessionId,
	createInteractiveSessionId,
	interactiveOwnerKey
} = require('./interactiveSessionIds.js');

class InteractiveSessionStore {
	constructor(options = {}) {
		this.maxPerUser = options.maxPerUser || 2;
		this.sessions = new Map();
	}

	findReusable(userId, jarId) {
		const ownerKey = interactiveOwnerKey(userId, jarId);
		return [...this.sessions.values()].find(session => session.ownerKey === ownerKey) || null;
	}

	create({ userId, jarId, runtime, profile }) {
		this.assertUserCapacity(userId);
		const session = {
			createdAt: Date.now(),
			jarId,
			lastActivityAt: Date.now(),
			ownerKey: interactiveOwnerKey(userId, jarId),
			profile,
			rootTargetId: runtime.rootTargetId,
			runtime,
			sessionId: createInteractiveSessionId(),
			userId: String(userId)
		};
		this.sessions.set(session.sessionId, session);
		return session;
	}

	owned(userId, sessionId) {
		const normalizedId = assertInteractiveSessionId(sessionId);
		const session = this.sessions.get(normalizedId);
		if (!session || session.userId !== String(userId)) {
			throw storeError('INTERACTIVE_SESSION_NOT_FOUND', 404);
		}
		this.touch(session);
		return session;
	}

	remove(sessionId) {
		const session = this.sessions.get(sessionId) || null;
		if (session) this.sessions.delete(sessionId);
		return session;
	}

	touch(session) {
		session.lastActivityAt = Date.now();
	}

	idleBefore(timestamp) {
		return [...this.sessions.values()].filter(session => session.lastActivityAt < timestamp);
	}

	assertUserCapacity(userId) {
		const count = [...this.sessions.values()].filter(session => session.userId === String(userId)).length;
		if (count >= this.maxPerUser) throw storeError('INTERACTIVE_SESSION_LIMIT', 429);
	}
}

function storeError(code, status) {
	const error = new Error(code);
	error.code = code;
	error.status = status;
	return error;
}

module.exports = {
	InteractiveSessionStore
};
