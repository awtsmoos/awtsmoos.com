//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Performs owned target actions after authenticated session discovery.
 * @description The Awtsmoos separates lifecycle from gesture and page command;
 * Awtsmoos.com keeps each vessel small while target ownership stays firmly in hand.
 */

const { publicInteractiveSession, publicInteractiveTarget } = require('./interactiveSessionPublic.js');

class InteractiveSessionActions {
	constructor(sessionStore, options = {}) {
		this.sessionStore = sessionStore;
		this.maxTargets = options.maxTargets || 16;
	}

	async metadata(userId, sessionId) {
		const session = this.sessionStore.owned(userId, sessionId);
		return publicInteractiveSession(session, await this.targetsRaw(session));
	}

	async targets(userId, sessionId) {
		const session = this.sessionStore.owned(userId, sessionId);
		return (await this.targetsRaw(session)).map(publicInteractiveTarget);
	}

	async frame(userId, sessionId, targetId, quality) {
		const session = await this.ownedTarget(userId, sessionId, targetId);
		return session.runtime.controller.frame(targetId, quality);
	}

	async navigate(userId, sessionId, targetId, url) {
		const session = await this.ownedTarget(userId, sessionId, targetId);
		return { url: await session.runtime.controller.navigate(targetId, url) };
	}

	async history(userId, sessionId, targetId, direction) {
		const session = await this.ownedTarget(userId, sessionId, targetId);
		return { changed: await session.runtime.controller.history(targetId, direction) };
	}

	async input(userId, sessionId, targetId, value) {
		const session = await this.ownedTarget(userId, sessionId, targetId);
		await session.runtime.controller.input(targetId, value);
		return { accepted: true };
	}

	async clearCookies(userId, sessionId, targetId) {
		const session = await this.ownedTarget(userId, sessionId, targetId);
		await session.runtime.controller.clearCookies(targetId);
		return { cleared: true };
	}

	async closeTarget(userId, sessionId, targetId) {
		const session = await this.ownedTarget(userId, sessionId, targetId);
		return { closed: await session.runtime.controller.close(targetId) };
	}

	async ownedTarget(userId, sessionId, targetId) {
		const session = this.sessionStore.owned(userId, sessionId);
		const targets = await this.targetsRaw(session);
		if (!targets.some(target => target.id === targetId)) {
			throw actionError('INTERACTIVE_TARGET_NOT_FOUND', 404);
		}
		return session;
	}

	async targetsRaw(session) {
		const targets = await session.runtime.devtools.listTargets();
		if (targets.length > this.maxTargets) throw actionError('INTERACTIVE_TARGET_LIMIT', 429);
		return targets;
	}
}

function actionError(code, status) {
	const error = new Error(code);
	error.code = code;
	error.status = status;
	return error;
}

module.exports = {
	InteractiveSessionActions
};
